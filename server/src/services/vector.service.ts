import { QdrantClient } from '@qdrant/js-client-rest';
import { config } from '../config/index.js';
import logger from '../logger/index.js';

const COLLECTION_DIMENSIONS = 1536;

function getClient(): QdrantClient {
  return new QdrantClient({ url: config.qdrant.url });
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

export const vectorService = {
  ensureCollection: async (repoId: string): Promise<void> => {
    const client = getClient();
    const name = collectionName(repoId);
    try {
      await client.getCollection(name);
    } catch {
      await client.createCollection(name, {
        vectors: {
          size: COLLECTION_DIMENSIONS,
          distance: 'Cosine',
        },
      });
      logger.info('Created Qdrant collection', { collection: name });
    }
  },

  upsertPoints: async (repoId: string, points: VectorPoint[]): Promise<void> => {
    const client = getClient();
    const name = collectionName(repoId);
    await vectorService.ensureCollection(repoId);

    const BATCH = 100;
    for (let i = 0; i < points.length; i += BATCH) {
      const batch = points.slice(i, i + BATCH);
      await client.upsert(name, { points: batch });
    }
  },

  search: async (
    repoId: string,
    queryVector: number[],
    topK: number = 10,
    scoreThreshold: number = 0.3
  ): Promise<SearchResult[]> => {
    const client = getClient();
    const name = collectionName(repoId);

    try {
      await client.getCollection(name);
    } catch {
      return [];
    }

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
  },

  deleteCollection: async (repoId: string): Promise<void> => {
    const client = getClient();
    const name = collectionName(repoId);
    try {
      await client.deleteCollection(name);
    } catch {
      // collection may not exist
    }
  },

  countPoints: async (repoId: string): Promise<number> => {
    const client = getClient();
    const name = collectionName(repoId);
    try {
      const info = await client.getCollection(name);
      return info.points_count ?? 0;
    } catch {
      return 0;
    }
  },
};