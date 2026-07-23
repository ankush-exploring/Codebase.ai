import { eq, and, like } from 'drizzle-orm';
import { db } from '../database/index.js';
import { files, fileMetadata, chunks, repositories } from '../database/schema.js';
import { ragService, Citation } from './rag.service.js';
import { aiService } from './ai.service.js';
import { NotFoundError } from '../utils/AppError.js';
import logger from '../logger/index.js';

const PROMPTS = {
  'explain-function': `You are a code expert. Explain the following function in detail:
- What it does (purpose)
- How it works (logic flow)
- Parameters and return value
- Any side effects or important behaviors
Use the provided code context. Be concise but thorough.`,

  'explain-class': `You are a code expert. Explain the following class:
- Purpose and responsibility
- Key properties and methods
- How it interacts with other parts of the codebase
- Design patterns used
Use the provided code context.`,

  'explain-file': `You are a code expert. Explain this file:
- Overall purpose
- Key exports/functions
- How it fits into the codebase
- Important implementation details
Use the provided code context.`,

  'explain-folder': `You are a code expert. Explain this folder/directory:
- What modules it contains
- How they relate to each other
- The folder's role in the architecture
Use the provided code context.`,

  'ask-question': `You are a helpful code assistant. Answer the user's question about the codebase.
Use the provided code context as reference. If the context doesn't contain the answer, say so.
Be concise and helpful.`,
};

export const codeUnderstandingService = {
  explain: async (
    repoId: string,
    taskType: keyof typeof PROMPTS,
    targetPath: string,
    query?: string
  ): Promise<{ explanation: string; citations: Citation[] }> => {
    const [repo] = await db
      .select()
      .from(repositories)
      .where(eq(repositories.id, repoId))
      .limit(1);

    if (!repo) throw new NotFoundError('Repository not found');

    let contextQuery = '';

    if (taskType === 'explain-folder') {
      const folderFiles = await db
        .select({ path: files.path })
        .from(files)
        .where(and(eq(files.repositoryId, repoId), like(files.path, `${targetPath}%`)))
        .limit(20);

      contextQuery = `folder "${targetPath}" containing files: ${folderFiles.map((f) => f.path).join(', ')}`;
    } else {
      const [file] = await db
        .select()
        .from(files)
        .where(and(eq(files.repositoryId, repoId), eq(files.path, targetPath)))
        .limit(1);

      if (!file) throw new NotFoundError('File not found');

      const fileChunks = await db
        .select({
          content: chunks.content,
          startLine: chunks.startLine,
          endLine: chunks.endLine,
        })
        .from(chunks)
        .where(eq(chunks.fileId, file.id))
        .limit(10);

      const metadata = await db
        .select()
        .from(fileMetadata)
        .where(eq(fileMetadata.fileId, file.id))
        .limit(1);

      contextQuery = `file "${targetPath}"\n\nContents:\n${fileChunks.map((c) => `Lines ${c.startLine}-${c.endLine}:\n${c.content}`).join('\n\n')}`;

      if (metadata[0]) {
        const meta = metadata[0];
        if (taskType === 'explain-function') {
          const funcs = (meta.functions as Array<{ name: string; startLine: number; endLine: number; params: string[] }>) || [];
          contextQuery += `\n\nFunctions in file: ${funcs.map((f) => `${f.name}(${f.params.join(', ')}) L${f.startLine}-${f.endLine}`).join(', ')}`;
        }
        if (taskType === 'explain-class') {
          const classes = (meta.classes as Array<{ name: string; startLine: number; endLine: number; methods: string[] }>) || [];
          contextQuery += `\n\nClasses in file: ${classes.map((c) => `${c.name} (methods: ${c.methods.join(', ')})`).join(', ')}`;
        }
      }
    }

    const ragQuery = query || contextQuery.slice(0, 500);
    const ragResult = await ragService.query(repoId, ragQuery, 5);

    const systemPrompt = PROMPTS[taskType] || PROMPTS['ask-question'];
    const userMessage = query
      ? `Question: ${query}\n\nContext:\n${contextQuery}`
      : `Explain the following:\n${contextQuery}`;

    const messages = [{ role: 'user', content: userMessage }];

    let explanation = '';

    try {
      const result = await aiService.chat(messages, repoId);
      explanation = result.response;
    } catch (err: any) {
      logger.warn('AI chat failed for code understanding', { error: err.message });
      explanation = `**Context for ${taskType}:**\n\n${contextQuery.slice(0, 1000)}\n\n*AI response unavailable. Connect OpenAI API key for generated explanations.*`;
    }

    return { explanation, citations: ragResult.citations };
  },

  getFileTree: async (repoId: string) => {
    const [repo] = await db
      .select()
      .from(repositories)
      .where(eq(repositories.id, repoId))
      .limit(1);

    if (!repo) throw new NotFoundError('Repository not found');

    const repoFiles = await db
      .select({
        path: files.path,
        name: files.name,
        extension: files.extension,
        size: files.size,
      })
      .from(files)
      .where(eq(files.repositoryId, repoId))
      .orderBy(files.path);

    return buildTree(repoFiles);
  },

  getFileInfo: async (repoId: string, filePath: string) => {
    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.repositoryId, repoId), eq(files.path, filePath)))
      .limit(1);

    if (!file) throw new NotFoundError('File not found');

    const meta = await db
      .select()
      .from(fileMetadata)
      .where(eq(fileMetadata.fileId, file.id))
      .limit(1);

    const fileChunks = await db
      .select({
        content: chunks.content,
        startLine: chunks.startLine,
        endLine: chunks.endLine,
        tokens: chunks.tokens,
      })
      .from(chunks)
      .where(eq(chunks.fileId, file.id))
      .orderBy(chunks.startLine);

    return {
      file,
      metadata: meta[0] || null,
      chunks: fileChunks,
    };
  },
};

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
  extension?: string;
  size?: number;
}

function buildTree(filesList: { path: string; name: string; extension: string | null; size: number | null }[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const f of filesList) {
    const parts = f.path.split(/[/\\]/);
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;

      if (isFile) {
        current.push({
          name: part,
          path: f.path,
          type: 'file',
          extension: f.extension || undefined,
          size: f.size || undefined,
        });
      } else {
        let folder = current.find((n) => n.name === part && n.type === 'folder');
        if (!folder) {
          folder = { name: part, path: parts.slice(0, i + 1).join('/'), type: 'folder', children: [] };
          current.push(folder);
        }
        current = folder.children!;
      }
    }
  }

  return root;
}