import simpleGit from 'simple-git';
import extract from 'extract-zip';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { eq, and } from 'drizzle-orm';
import { db } from '../database/index.js';
import { repositories } from '../database/schema.js';
import { shouldIgnorePath } from '../utils/gitignore.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/AppError.js';
import logger from '../logger/index.js';

const REPOS_ROOT = path.resolve('data/repos');
const MAX_REPO_SIZE_MB = 50;

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function extractNameFromUrl(url: string): string {
  const match = url.match(/\/([^/]+?)(?:\.git)?$/);
  return match ? match[1] : 'repository';
}

function generateRepoPath(userId: string, repoId: string): string {
  return path.join(REPOS_ROOT, userId, repoId);
}

async function walkDir(dir: string, root: string, files: string[]): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const rel = path.relative(root, fullPath);
    if (shouldIgnorePath(rel)) continue;
    if (entry.isDirectory()) {
      await walkDir(fullPath, root, files);
    } else {
      files.push(fullPath);
    }
  }
}

async function calculateRepoStats(repoDir: string): Promise<{ fileCount: number; totalSize: number }> {
  const files: string[] = [];
  await walkDir(repoDir, repoDir, files);
  let totalSize = 0;
  for (const f of files) {
    try {
      const stat = await fs.stat(f);
      totalSize += stat.size;
    } catch { /* skip */ }
  }
  return { fileCount: files.length, totalSize };
}

function guessLanguage(repoDir: string): string | null {
  const langIndicators: Record<string, string[]> = {
    javascript: ['package.json', 'yarn.lock', '.js', '.jsx'],
    typescript: ['tsconfig.json', '.ts', '.tsx'],
    python: ['requirements.txt', 'setup.py', 'pyproject.toml', '.py'],
    go: ['go.mod', '.go'],
    java: ['pom.xml', 'build.gradle', '.java'],
    rust: ['Cargo.toml', '.rs'],
    ruby: ['Gemfile', '.rb'],
  };

  for (const [lang, indicators] of Object.entries(langIndicators)) {
    for (const ind of indicators) {
      if (ind.startsWith('.')) {
        continue;
      }
      try {
        const targetPath = path.join(repoDir, ind);
        require('fs').accessSync(targetPath);
        return lang;
      } catch { /* skip */ }
    }
  }
  return null;
}

export const repositoryService = {
  importByUrl: async (userId: string, url: string, branch?: string, name?: string) => {
    const repoName = name || extractNameFromUrl(url);
    const repoBranch = branch || 'main';

    const [repo] = await db
      .insert(repositories)
      .values({
        userId,
        name: repoName,
        url,
        branch: repoBranch,
        source: 'url',
        status: 'cloning',
      })
      .returning();

    const repoDir = generateRepoPath(userId, repo.id);
    await ensureDir(path.dirname(repoDir));

    try {
      const git = simpleGit();
      await git.clone(url, repoDir, { '--branch': [repoBranch], '--depth': ['1'] } as any);

      const { fileCount, totalSize } = await calculateRepoStats(repoDir);

      if (totalSize > MAX_REPO_SIZE_MB * 1024 * 1024) {
        await fs.rm(repoDir, { recursive: true, force: true });
        await db
          .update(repositories)
          .set({ status: 'error', errorMsg: `Repository exceeds ${MAX_REPO_SIZE_MB}MB limit` })
          .where(eq(repositories.id, repo.id));
        throw new BadRequestError(`Repository exceeds ${MAX_REPO_SIZE_MB}MB limit`);
      }

      const lang = guessLanguage(repoDir);

      await db
        .update(repositories)
        .set({
          status: 'ready',
          fileCount,
          totalSize,
          language: lang,
          metadata: { clonedAt: new Date().toISOString() },
        })
        .where(eq(repositories.id, repo.id));

      const updated = await db.select().from(repositories).where(eq(repositories.id, repo.id)).limit(1);
      return updated[0];
    } catch (err: any) {
      logger.error('Repo clone failed:', { error: err.message, repoId: repo.id });
      await db
        .update(repositories)
        .set({ status: 'error', errorMsg: err.message || 'Clone failed' })
        .where(eq(repositories.id, repo.id));
      throw err;
    }
  },

  importByZip: async (userId: string, filePath: string, name?: string) => {
    const repoName = name || path.basename(filePath, '.zip');

    const [repo] = await db
      .insert(repositories)
      .values({
        userId,
        name: repoName,
        source: 'zip',
        status: 'cloning',
      })
      .returning();

    const repoDir = generateRepoPath(userId, repo.id);
    await ensureDir(repoDir);

    try {
      await extract(filePath, { dir: repoDir });

      const { fileCount, totalSize } = await calculateRepoStats(repoDir);

      if (totalSize > MAX_REPO_SIZE_MB * 1024 * 1024) {
        await fs.rm(repoDir, { recursive: true, force: true });
        await db
          .update(repositories)
          .set({ status: 'error', errorMsg: `Repository exceeds ${MAX_REPO_SIZE_MB}MB limit` })
          .where(eq(repositories.id, repo.id));
        throw new BadRequestError(`Repository exceeds ${MAX_REPO_SIZE_MB}MB limit`);
      }

      const lang = guessLanguage(repoDir);

      await db
        .update(repositories)
        .set({
          status: 'ready',
          fileCount,
          totalSize,
          language: lang,
          metadata: { extractedAt: new Date().toISOString() },
        })
        .where(eq(repositories.id, repo.id));

      const updated = await db.select().from(repositories).where(eq(repositories.id, repo.id)).limit(1);
      return updated[0];
    } catch (err: any) {
      logger.error('ZIP extract failed:', { error: err.message, repoId: repo.id });
      await db
        .update(repositories)
        .set({ status: 'error', errorMsg: err.message || 'Extraction failed' })
        .where(eq(repositories.id, repo.id));
      throw err;
    }
  },

  listByUser: async (userId: string) => {
    return db
      .select()
      .from(repositories)
      .where(eq(repositories.userId, userId))
      .orderBy(repositories.createdAt);
  },

  getById: async (userId: string, repoId: string) => {
    const [repo] = await db
      .select()
      .from(repositories)
      .where(and(eq(repositories.id, repoId), eq(repositories.userId, userId)))
      .limit(1);

    if (!repo) throw new NotFoundError('Repository not found');
    return repo;
  },

  delete: async (userId: string, repoId: string) => {
    const [repo] = await db
      .select()
      .from(repositories)
      .where(and(eq(repositories.id, repoId), eq(repositories.userId, userId)))
      .limit(1);

    if (!repo) throw new NotFoundError('Repository not found');

    const repoDir = generateRepoPath(userId, repoId);
    try {
      await fs.rm(repoDir, { recursive: true, force: true });
    } catch { /* dir may not exist */ }

    await db.delete(repositories).where(eq(repositories.id, repoId));
    return true;
  },
};