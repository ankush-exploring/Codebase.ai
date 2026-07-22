import { QdrantClient } from '@qdrant/js-client-rest';
import { config } from '../config/index.js';
import logger from '../logger/index.js';

const COLLECTION_DIMENSIONS = 1536;

// In-memory fallback when Qdrant is unavailable
const memoryStore: Map<string, { vector: number[]; payload: Record<string, unknown> }[]> = new Map();

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

let qdrantAvailable: boolean | null = null;

async function checkQdrant(): Promise<boolean> {
  if (qdrantAvailable !== null) return qdrantAvailable;
  const client = getClient();
  if (!client) { qdrantAvailable = false; return false; }
  try {
    await client.getCollections();
    qdrantAvailable = true;
  } catch {
    qdrantAvailable = false;
  }
  return qdrantAvailable;
}

export const vectorService = {
  ensureCollection: async (repoId: string): Promise<void> => {
    if (await checkQdrant()) {
      const client = getClient()!;
      const name = collectionName(repoId);
      try {
        await client.getCollection(name);
      } catch {
        await client.createCollection(name, {
          vectors: { size: COLLECTION_DIMENSIONS, distance: 'Cosine' },
        });
        logger.info('Created Qdrant collection', { collection: name });
      }
    }
    const name = collectionName(repoId);
    if (!memoryStore.has(name)) {
      memoryStore.set(name, []);
    }
  },

  upsertPoints: async (repoId: string, points: VectorPoint[]): Promise<void> => {
    const name = collectionName(repoId);

    if (await checkQdrant()) {
      const client = getClient()!;
      await vectorService.ensureCollection(repoId);
      const BATCH = 100;
      for (let i = 0; i < points.length; i += BATCH) {
        await client.upsert(name, { points: points.slice(i, i + BATCH) });
      }
    }

    const existing = memoryStore.get(name) || [];
    for (const p of points) {
      existing.push({ vector: p.vector, payload: p.payload });
    }
    memoryStore.set(name, existing);
  },

  search: async (
    repoId: string,
    queryVector: number[],
    topK: number = 10,
    scoreThreshold: number = 0.3
  ): Promise<SearchResult[]> => {
    const name = collectionName(repoId);

    if (await checkQdrant()) {
      const client = getClient()!;
      try {
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
      } catch {
        // fall through to memory
      }
    }

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
    if (await checkQdrant()) {
      const client = getClient()!;
      try { await client.deleteCollection(name); } catch { }
    }
    memoryStore.delete(name);
  },

  countPoints: async (repoId: string): Promise<number> => {
    const name = collectionName(repoId);
    if (await checkQdrant()) {
      const client = getClient()!;
      try {
        const info = await client.getCollection(name);
        return info.points_count ?? 0;
      } catch { }
    }
    return (memoryStore.get(name) || []).length;
  },
};
