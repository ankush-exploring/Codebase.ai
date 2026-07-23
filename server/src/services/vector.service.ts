import fs from 'fs/promises';
import path from 'path';
import { QdrantClient } from '@qdrant/js-client-rest';
import { config } from '../config/index.js';
import logger from '../logger/index.js';

const COLLECTION_DIMENSIONS = 384;

const DB_PATH = path.resolve('data/vectors.json');
type StoredPoint = { vector: number[]; payload: Record<string, unknown> };
const memoryStore: Map<string, StoredPoint[]> = new Map();

async function loadStore(): Promise<void> {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf-8');
    const data = JSON.parse(raw) as Record<string, StoredPoint[]>;
    for (const [key, points] of Object.entries(data)) {
      memoryStore.set(key, points);
    }
    logger.info('Restored vector store from disk', { collections: memoryStore.size });
  } catch {
    logger.info('No persisted vector store found, starting fresh');
  }
}

async function saveStore(): Promise<void> {
  try {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    const obj: Record<string, StoredPoint[]> = {};
    for (const [key, points] of memoryStore) {
      obj[key] = points;
    }
    await fs.writeFile(DB_PATH, JSON.stringify(obj), 'utf-8');
  } catch (err) {
    logger.warn('Failed to persist vector store', { error: (err as Error).message });
  }
}

loadStore();

function getClient(): QdrantClient | null {
  try {
    return new QdrantClient({
      url: config.qdrant.url,
      apiKey: config.qdrant.apiKey || undefined,
    });
  } catch {
    return null;
  }
}

function collectionName(repoId: string): string {
  return `repo_${repoId.replace(/-/g, '_')}`;
}

export interface VectorPoint {
  id: number | string;
  vector: number[];
  payload: Record<string, unknown>;
}

export interface SearchResult {
  id: number | string;
  score: number;
  payload: Record<string, unknown>;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

async function tryQdrant<T>(fn: (client: QdrantClient) => Promise<T>): Promise<T | null> {
  const client = getClient();
  if (!client) return null;
  try {
    return await fn(client);
  } catch (err) {
    logger.warn('Qdrant operation failed, falling back to memory', { error: (err as Error).message });
    return null;
  }
}

export const vectorService = {
  ensureCollection: async (repoId: string): Promise<void> => {
    const name = collectionName(repoId);

    const created = await tryQdrant(async (client) => {
      try {
        await client.getCollection(name);
        return true;
      } catch {
        await client.createCollection(name, {
          vectors: { size: COLLECTION_DIMENSIONS, distance: 'Cosine' },
        });
        logger.info('Created Qdrant collection', { collection: name });
        return true;
      }
    });

    if (!memoryStore.has(name)) {
      memoryStore.set(name, []);
    }
  },

  upsertPoints: async (repoId: string, points: VectorPoint[]): Promise<void> => {
    const name = collectionName(repoId);

    await tryQdrant(async (client) => {
      await vectorService.ensureCollection(repoId);
      const BATCH = 100;
      for (let i = 0; i < points.length; i += BATCH) {
        await client.upsert(name, { points: points.slice(i, i + BATCH) });
      }
    });

    const existing = memoryStore.get(name) || [];
    for (const p of points) {
      existing.push({ vector: p.vector, payload: p.payload });
    }
    memoryStore.set(name, existing);
    await saveStore();
  },

  search: async (
    repoId: string,
    queryVector: number[],
    topK: number = 10,
    scoreThreshold: number = 0
  ): Promise<SearchResult[]> => {
    const name = collectionName(repoId);

    const qdrantResult = await tryQdrant(async (client) => {
      const results = await client.search(name, {
        vector: queryVector,
        limit: topK,
        score_threshold: scoreThreshold,
        with_payload: true,
      });
      return results.map((r) => ({
        id: r.id,
        score: r.score,
        payload: (r.payload as Record<string, unknown>) || {},
      }));
    });

    if (qdrantResult) return qdrantResult;

    const points = memoryStore.get(name) || [];
    const scored = points
      .map((p) => ({
        id: crypto.randomUUID(),
        score: cosineSimilarity(queryVector, p.vector),
        payload: p.payload,
      }))
      .filter((r) => r.score >= scoreThreshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return scored;
  },

  deleteCollection: async (repoId: string): Promise<void> => {
    const name = collectionName(repoId);
    await tryQdrant(async (client) => {
      await client.deleteCollection(name);
    });
    memoryStore.delete(name);
    await saveStore();
  },

  countPoints: async (repoId: string): Promise<number> => {
    const name = collectionName(repoId);

    const qdrantCount = await tryQdrant(async (client) => {
      const info = await client.getCollection(name);
      return info.points_count ?? 0;
    });

    if (qdrantCount !== null) return qdrantCount;
    return (memoryStore.get(name) || []).length;
  },
};
