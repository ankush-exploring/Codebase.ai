import crypto from 'crypto';
import { config } from '../config/index.js';
import { cacheService } from './cache.service.js';
import logger from '../logger/index.js';

const DIMENSIONS = 1536;

let openaiClient: any = null;

async function getOpenAI() {
  if (!config.openai.apiKey && config.aiProvider !== 'ollama') return null;
  if (!openaiClient) {
    const { OpenAI } = await import('openai');
    if (config.aiProvider === 'ollama') {
      openaiClient = new OpenAI({
        apiKey: 'ollama',
        baseURL: config.ollama.baseURL + '/v1',
      });
    } else {
      openaiClient = new OpenAI({ apiKey: config.openai.apiKey });
    }
  }
  return openaiClient;
}

function deterministicHashEmbedding(text: string): number[] {
  const vector = new Array(DIMENSIONS).fill(0);
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);

  for (const word of words) {
    const hash = crypto.createHash('md5').update(word).digest();
    for (let i = 0; i < DIMENSIONS; i++) {
      vector[i] += ((hash[i % hash.length] as number) / 127.5 - 1) * 0.1;
    }
  }

  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  if (magnitude > 0) {
    for (let i = 0; i < DIMENSIONS; i++) {
      vector[i] /= magnitude;
    }
  }

  return vector;
}

function contentHash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);
}

export const embeddingService = {
  isOpenAIAvailable: async (): Promise<boolean> => {
    const client = await getOpenAI();
    return client !== null;
  },

  embedTexts: async (texts: string[]): Promise<number[][]> => {
    const results: (number[] | null)[] = new Array(texts.length).fill(null);
    const uncachedIndices: number[] = [];
    const uncachedTexts: string[] = [];

    for (let i = 0; i < texts.length; i++) {
      const hash = contentHash(texts[i] as string);
      const cached = await cacheService.get<number[]>(`emb:${hash}`);
      if (cached) {
        results[i] = cached;
      } else {
        uncachedIndices.push(i);
        uncachedTexts.push(texts[i] as string);
      }
    }

    if (uncachedTexts.length === 0) {
      return results as number[][];
    }

    const client = await getOpenAI();
    let embeddings: number[][];

    if (!client) {
      logger.debug('Using hash-based embeddings (no OpenAI key)', { count: uncachedTexts.length });
      embeddings = uncachedTexts.map((t) => deterministicHashEmbedding(t));
    } else {
      const BATCH_SIZE = 100;
      embeddings = [];

      for (let i = 0; i < uncachedTexts.length; i += BATCH_SIZE) {
        const batch = uncachedTexts.slice(i, i + BATCH_SIZE).map((t) => t.slice(0, 8000));
        try {
          const response = await client.embeddings.create({
            model: 'text-embedding-3-small',
            input: batch,
          });
          for (const item of response.data) {
            embeddings.push(item.embedding);
          }
        } catch (err: any) {
          logger.warn('OpenAI embedding failed, falling back to hash', { error: err.message });
          embeddings.push(...batch.map((t) => deterministicHashEmbedding(t)));
        }
      }
    }

    for (let i = 0; i < uncachedIndices.length; i++) {
      const idx = uncachedIndices[i] as number;
      const emb = embeddings[i] as number[];
      results[idx] = emb;
      const hash = contentHash(uncachedTexts[i] as string);
      await cacheService.set(`emb:${hash}`, emb, 86400);
    }

    return results as number[][];
  },

  embedText: async (text: string): Promise<number[]> => {
    const results = await embeddingService.embedTexts([text]);
    return results[0] as number[];
  },
};
