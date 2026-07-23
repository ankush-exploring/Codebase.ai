import crypto from 'crypto';
import { config } from '../config/index.js';
import { cacheService } from './cache.service.js';
import logger from '../logger/index.js';

const DIMENSIONS = 384;

let openaiClient: any = null;
let cacheAvailable: boolean | null = null;

async function isCacheAvailable(): Promise<boolean> {
  if (cacheAvailable !== null) return cacheAvailable;
  cacheAvailable = await cacheService.isAvailable();
  return cacheAvailable;
}

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

const wordVecCache = new Map<string, number[]>();

function deterministicHashEmbedding(text: string): number[] {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return new Array(DIMENSIONS).fill(0);

  const vector = new Array(DIMENSIONS).fill(0);

  for (const word of words) {
    let cached = wordVecCache.get(word);
    if (!cached) {
      const hash = crypto.createHash('md5').update(word).digest();
      cached = new Array(DIMENSIONS);
      for (let i = 0; i < DIMENSIONS; i++) {
        cached[i] = ((hash[i % hash.length] as number) / 127.5 - 1) * 0.1;
      }
      wordVecCache.set(word, cached);
    }
    for (let i = 0; i < DIMENSIONS; i++) {
      vector[i] += cached[i];
    }
  }

  let magSq = 0;
  for (let i = 0; i < DIMENSIONS; i++) {
    magSq += vector[i] * vector[i];
  }
  const magnitude = Math.sqrt(magSq);
  if (magnitude > 0) {
    for (let i = 0; i < DIMENSIONS; i++) {
      vector[i] /= magnitude;
    }
  }

  return vector;
}

const CONCURRENCY = 8;

async function embedBatch(texts: string[]): Promise<number[][]> {
  const useCache = await isCacheAvailable();

  if (useCache) {
    const cacheKeys = texts.map((t) => {
      const h = crypto.createHash('sha256').update(t).digest('hex').slice(0, 16);
      return { key: `emb:${h}`, text: t, hash: h };
    });

    const cached = await Promise.all(
      cacheKeys.map((ck) => cacheService.get<number[]>(ck.key))
    );

    const results: (number[] | null)[] = new Array(texts.length).fill(null);
    const missing: { idx: number; text: string; hash: string }[] = [];

    for (let i = 0; i < texts.length; i++) {
      if (cached[i]) {
        results[i] = cached[i];
      } else {
        missing.push({ idx: i, text: texts[i], hash: cacheKeys[i].hash });
      }
    }

    if (missing.length === 0) return results as number[][];

    const client = await getOpenAI();
    let embeddings: number[][];

    if (!client) {
      embeddings = await parallelEmbed(missing.map((m) => m.text));
    } else {
      embeddings = [];
      const BATCH_SIZE = 100;
      for (let i = 0; i < missing.length; i += BATCH_SIZE) {
        const batch = missing.slice(i, i + BATCH_SIZE).map((m) => m.text.slice(0, 8000));
        try {
          const response = await client.embeddings.create({
            model: 'text-embedding-3-small',
            input: batch,
          });
          for (const item of response.data) {
            embeddings.push(item.embedding);
          }
        } catch {
          embeddings.push(...(await parallelEmbed(batch)));
        }
      }
    }

    const promises: Promise<void>[] = [];
    for (let i = 0; i < missing.length; i++) {
      results[missing[i].idx] = embeddings[i];
      promises.push(cacheService.set(`emb:${missing[i].hash}`, embeddings[i], 86400));
    }
    await Promise.all(promises);

    return results as number[][];
  }

  const client = await getOpenAI();

  if (!client) {
    return await parallelEmbed(texts);
  }

  const embeddings: number[][] = [];
  const BATCH_SIZE = 100;
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE).map((t) => t.slice(0, 8000));
    try {
      const response = await client.embeddings.create({
        model: 'text-embedding-3-small',
        input: batch,
      });
      for (const item of response.data) {
        embeddings.push(item.embedding);
      }
    } catch {
      embeddings.push(...(await parallelEmbed(batch)));
    }
  }
  return embeddings;
}

async function parallelEmbed(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (let i = 0; i < texts.length; i += CONCURRENCY) {
    const batch = texts.slice(i, i + CONCURRENCY);
    const chunkResults = await Promise.all(batch.map((t) => deterministicHashEmbedding(t)));
    results.push(...chunkResults);
  }
  return results;
}

export const embeddingService = {
  isOpenAIAvailable: async (): Promise<boolean> => {
    const client = await getOpenAI();
    return client !== null;
  },

  embedTexts: async (texts: string[]): Promise<number[][]> => {
    return embedBatch(texts);
  },

  embedText: async (text: string): Promise<number[]> => {
    const results = await embedBatch([text]);
    return results[0];
  },
};
