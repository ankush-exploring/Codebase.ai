import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGet = vi.fn();
const mockSet = vi.fn();
const mockDel = vi.fn();
const mockKeys = vi.fn().mockResolvedValue([]);

vi.mock('ioredis', () => {
  return {
    default: vi.fn(() => ({
      get: mockGet,
      set: mockSet,
      del: mockDel,
      keys: mockKeys,
      connect: vi.fn().mockResolvedValue(undefined),
    })),
  };
});

vi.mock('../../config/index.js', () => ({
  config: { nodeEnv: 'test', redis: { url: 'redis://localhost:6379' } },
}));

vi.mock('../../logger/index.js', () => ({
  default: { warn: vi.fn(), debug: vi.fn(), info: vi.fn() },
}));

describe('cacheService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when cache miss', async () => {
    mockGet.mockResolvedValue(null);
    const { cacheService } = await import('../../services/cache.service.js');
    const result = await cacheService.get('test:key');
    expect(result).toBeNull();
  });

  it('returns parsed JSON on cache hit', async () => {
    mockGet.mockResolvedValue(JSON.stringify({ foo: 'bar' }));
    const { cacheService } = await import('../../services/cache.service.js');
    const result = await cacheService.get<{ foo: string }>('test:key');
    expect(result).toEqual({ foo: 'bar' });
  });

  it('serializes and stores value with TTL', async () => {
    mockSet.mockResolvedValue('OK');
    const { cacheService } = await import('../../services/cache.service.js');
    await cacheService.set('test:key', { data: 123 }, 600);
    expect(mockSet).toHaveBeenCalledWith('test:key', '{"data":123}', 'EX', 600);
  });

  it('deletes key', async () => {
    mockDel.mockResolvedValue(1);
    const { cacheService } = await import('../../services/cache.service.js');
    await cacheService.del('test:key');
    expect(mockDel).toHaveBeenCalledWith('test:key');
  });

  it('invalidates by pattern', async () => {
    mockKeys.mockResolvedValue(['rag:query:abc', 'rag:query:def']);
    mockDel.mockResolvedValue(2);
    const { cacheService } = await import('../../services/cache.service.js');
    await cacheService.invalidatePattern('rag:query:*');
    expect(mockKeys).toHaveBeenCalledWith('rag:query:*');
    expect(mockDel).toHaveBeenCalledWith('rag:query:abc', 'rag:query:def');
  });
});
