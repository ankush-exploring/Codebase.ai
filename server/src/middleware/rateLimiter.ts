import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

const isDev = config.nodeEnv === 'development';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 100,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 20,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
});

export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 10000 : 30,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many chat messages, please slow down',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
});

export const embedLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 10000 : 5,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many embedding requests, please wait before retrying',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
});

export const queryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 10000 : 20,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many queries, please slow down',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
});

export default rateLimiter;
