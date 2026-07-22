import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiUrl: process.env.API_URL || 'http://localhost:3001',

  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/codebase_ai',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  qdrant: {
    url: process.env.QDRANT_URL || 'http://localhost:6333',
    apiKey: process.env.QDRANT_API_KEY || '',
  },

  aiProvider: (process.env.AI_PROVIDER || '') as 'openai' | 'groq' | 'ollama' | '',

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    baseURL:
      process.env.OPENAI_BASE_URL ||
      (process.env.AI_PROVIDER === 'ollama' ? 'http://localhost:11434/v1' : ''),
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  },

  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
  },

  ollama: {
    baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llama3.2:1b',
  },

  github: {
    token: process.env.GITHUB_TOKEN || '',
  },

  logging: {
    level: process.env.LOG_LEVEL || 'debug',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? process.env.API_URL : 'http://localhost:5173'),
    credentials: true,
  },
} as const;

export type Config = typeof config;