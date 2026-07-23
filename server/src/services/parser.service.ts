import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../database/index.js';
import { files, fileMetadata, chunks, repositories } from '../database/schema.js';
import { detectLanguage, shouldSkipFile, isBinaryFile, extractMetadata } from './parser/langDetect.js';
import { chunkContent } from './parser/chunker.js';
import { shouldIgnorePath } from '../utils/gitignore.js';
import { NotFoundError } from '../utils/AppError.js';
import logger from '../logger/index.js';

const REPOS_ROOT = path.resolve('data/repos');

async function collectFiles(dir: string, root: string, results: string[]): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const rel = path.relative(root, fullPath);
    if (shouldIgnorePath(rel)) continue;
    if (entry.isDirectory()) {
      await collectFiles(fullPath, root, results);
    } else {
      results.push(fullPath);
    }
  }
}

export const parserService = {
  parseRepository: async (userId: string, repoId: string) => {
    const [repo] = await db
      .select()
      .from(repositories)
      .where(eq(repositories.id, repoId))
      .limit(1);

    if (!repo) throw new NotFoundError('Repository not found');

    const repoDir = path.join(REPOS_ROOT, userId, repoId);

    try {
      await fs.access(repoDir);
    } catch {
      throw new NotFoundError('Repository files not found on disk');
    }

    await db.update(repositories).set({ status: 'parsing' }).where(eq(repositories.id, repoId));

    const filePaths: string[] = [];
    await collectFiles(repoDir, repoDir, filePaths);

    let processedCount = 0;

    try {
      for (const filePath of filePaths) {
        const rel = path.relative(repoDir, filePath);
        if (shouldSkipFile(filePath)) continue;

        try {
          const content = await fs.readFile(filePath, 'utf-8');
          if (isBinaryFile(content)) continue;

          const ext = path.extname(filePath).toLowerCase();
          const stat = await fs.stat(filePath);
          const hash = crypto.createHash('md5').update(content).digest('hex');

          const [existingFile] = await db
            .select({ id: files.id })
            .from(files)
            .where(eq(files.contentHash, hash))
            .limit(1);

          const lang = detectLanguage(filePath);
          const metadata = extractMetadata(filePath, content);

          const [dbFile] = await db
            .insert(files)
            .values({
              repositoryId: repoId,
              path: rel,
              name: path.basename(filePath),
              extension: ext || null,
              size: stat.size,
              contentHash: hash,
            })
            .returning({ id: files.id });

          await db.insert(fileMetadata).values({
            fileId: dbFile.id,
            functions: metadata.functions,
            classes: metadata.classes,
            imports: metadata.imports,
            exports: metadata.exports,
            comments: metadata.comments,
          });

          const fileChunks = chunkContent(content);
          for (const chunk of fileChunks) {
            await db.insert(chunks).values({
              fileId: dbFile.id,
              content: chunk.content,
              tokens: chunk.tokens,
              startLine: chunk.startLine,
              endLine: chunk.endLine,
            });
          }

          processedCount++;
        } catch (err: any) {
          logger.warn('Failed to parse file:', { path: rel, error: err.message });
        }
      }

      const totalChunks = await db
        .select({ count: chunks.id })
        .from(chunks)
        .innerJoin(files, eq(chunks.fileId, files.id))
        .where(eq(files.repositoryId, repoId));

      await db
        .update(repositories)
        .set({
          status: 'parsed',
          fileCount: processedCount,
          metadata: {
            ...((repo.metadata as Record<string, unknown>) || {}),
            parsedAt: new Date().toISOString(),
            totalChunks: totalChunks.length,
          },
        })
        .where(eq(repositories.id, repoId));
    } catch (err: any) {
      logger.error('Parse failed:', { error: err.message, repoId });
      await db
        .update(repositories)
        .set({ status: 'error', errorMsg: err.message || 'Parse failed' })
        .where(eq(repositories.id, repoId));
      throw err;
    }

    const [updated] = await db
      .select()
      .from(repositories)
      .where(eq(repositories.id, repoId))
      .limit(1);

    return updated;
  },
};