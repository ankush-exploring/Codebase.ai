import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../database/index.js';
import { chunks, files, repositories } from '../database/schema.js';
import { embeddingService } from './embedding.service.js';
import { vectorService } from './vector.service.js';
import { cacheService } from './cache.service.js';
import { NotFoundError } from '../utils/AppError.js';
import logger from '../logger/index.js';

export interface Citation {
  filePath: string;
  fileName: string;
  startLine: number;
  endLine: number;
  score: number;
  content: string;
  functions?: string[];
  classes?: string[];
}

export interface QueryResult {
  query: string;
  citations: Citation[];
  totalChunks: number;
}

function queryCacheKey(repoId: string, query: string, topK: number): string {
  const hash = crypto.createHash('sha256').update(`${repoId}:${query}:${topK}`).digest('hex').slice(0, 16);
  return `rag:query:${hash}`;
}

export const ragService = {
  embedRepository: async (_userId: string, repoId: string) => {
    const [repo] = await db
      .select()
      .from(repositories)
      .where(eq(repositories.id, repoId))
      .limit(1);

    if (!repo) throw new NotFoundError('Repository not found');

    const dbChunks = await db
      .select({
        chunkId: chunks.id,
        content: chunks.content,
        startLine: chunks.startLine,
        endLine: chunks.endLine,
        fileId: files.id,
        filePath: files.path,
        fileName: files.name,
      })
      .from(chunks)
      .innerJoin(files, eq(chunks.fileId, files.id))
      .where(eq(files.repositoryId, repoId));

    if (dbChunks.length === 0) {
      return { embedded: 0, collection: `repo_${repoId}` };
    }

    const texts = dbChunks.map((c) => {
      const header = `File: ${c.filePath}\nLines: ${c.startLine}-${c.endLine}\n\n`;
      return header + (c.content ?? '');
    });

    logger.info('Embedding chunks', { count: texts.length, repoId });

    const embeddings = await embeddingService.embedTexts(texts);

    const points = dbChunks.map((c, i) => ({
      id: c.chunkId,
      vector: embeddings[i] as number[],
      payload: {
        chunkId: c.chunkId,
        fileId: c.fileId,
        filePath: c.filePath,
        fileName: c.fileName,
        startLine: c.startLine,
        endLine: c.endLine,
        content: (c.content ?? '').slice(0, 1000),
      },
    }));

    await vectorService.ensureCollection(repoId);
    await vectorService.upsertPoints(repoId, points);

    logger.info('Embedded chunks into Qdrant', { count: points.length, repoId });

    await cacheService.invalidatePattern(`rag:query:${repoId}:*`);

    return {
      embedded: points.length,
      collection: `repo_${repoId}`,
    };
  },

  query: async (repoId: string, query: string, topK: number = 10): Promise<QueryResult> => {
    const [repo] = await db
      .select()
      .from(repositories)
      .where(eq(repositories.id, repoId))
      .limit(1);

    if (!repo) throw new NotFoundError('Repository not found');

    const cacheKey = queryCacheKey(repoId, query, topK);
    const cached = await cacheService.get<QueryResult>(cacheKey);
    if (cached) {
      logger.debug('RAG cache hit', { repoId, query: query.slice(0, 50) });
      return cached;
    }

    const queryEmbedding = await embeddingService.embedText(query);
    const results = await vectorService.search(repoId, queryEmbedding, topK);

    const citations: Citation[] = results.map((r) => {
      const payload = r.payload;
      return {
        filePath: payload.filePath as string,
        fileName: payload.fileName as string,
        startLine: payload.startLine as number,
        endLine: payload.endLine as number,
        score: r.score,
        content: payload.content as string,
      };
    });

    const result: QueryResult = {
      query,
      citations,
      totalChunks: citations.length,
    };

    await cacheService.set(cacheKey, result, 300);

    return result;
  },
};
