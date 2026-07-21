import Redis from 'ioredis';
import { config } from '../config/index.js';
import logger from '../logger/index.js';

let client: Redis | null = null;

function getClient(): Redis | null {
  if (config.nodeEnv === 'development' && !process.env.REDIS_URL) return null;
  if (!client) {
    try {
      client = new Redis(config.redis.url, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          if (times > 3) return null;
          return Math.min(times * 200, 2000);
        },
        lazyConnect: true,
      });
      client.connect().catch(() => {
        logger.warn('Redis unavailable — caching disabled');
        client = null;
      });
    } catch {
      logger.warn('Redis unavailable — caching disabled');
      return null;
    }
  }
  return client;
}

function isAvailable(): boolean {
  return getClient() !== null;
}

export const cacheService = {
  get: async <T>(key: string): Promise<T | null> => {
    const redis = getClient();
    if (!redis) return null;
    try {
      const raw = await redis.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  set: async (key: string, value: unknown, ttlSeconds: number = 300): Promise<void> => {
    const redis = getClient();
    if (!redis) return;
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      /* silently fail */
    }
  },

  del: async (key: string): Promise<void> => {
    const redis = getClient();
    if (!redis) return;
    try {
      await redis.del(key);
    } catch {
      /* silently fail */
    }
  },

  invalidatePattern: async (pattern: string): Promise<void> => {
    const redis = getClient();
    if (!redis) return;
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch {
      /* silently fail */
    }
  },

  isAvailable,
};
