import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCacheGet = vi.fn();
const mockCacheSet = vi.fn();
const mockCacheInvalidate = vi.fn();
const mockSearch = vi.fn();
const mockEmbedText = vi.fn();
const mockLimit = vi.fn();

vi.mock('../../database/index.js', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: (...args: unknown[]) => mockLimit(...args),
        }),
      }),
    }),
  },
}));

vi.mock('../../services/embedding.service.js', () => ({
  embeddingService: {
    embedText: (...args: unknown[]) => mockEmbedText(...args),
    embedTexts: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../services/vector.service.js', () => ({
  vectorService: {
    ensureCollection: vi.fn().mockResolvedValue(undefined),
    upsertPoints: vi.fn().mockResolvedValue(undefined),
    search: (...args: unknown[]) => mockSearch(...args),
  },
}));

vi.mock('../../services/cache.service.js', () => ({
  cacheService: {
    get: (...args: unknown[]) => mockCacheGet(...args),
    set: (...args: unknown[]) => mockCacheSet(...args),
    invalidatePattern: (...args: unknown[]) => mockCacheInvalidate(...args),
  },
}));

vi.mock('../../config/index.js', () => ({
  config: { nodeEnv: 'test', redis: { url: 'redis://localhost:6379' }, openai: { apiKey: '' } },
}));

vi.mock('../../logger/index.js', () => ({
  default: { warn: vi.fn(), debug: vi.fn(), info: vi.fn() },
}));

describe('ragService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLimit.mockResolvedValue([{ id: 'repo-1', name: 'test' }]);
    mockEmbedText.mockResolvedValue(new Array(1536).fill(0.1));
  });

  it('query returns cached result when available', async () => {
    const cached = { query: 'test', citations: [{ filePath: 'a.ts', score: 0.9 }], totalChunks: 1 };
    mockCacheGet.mockResolvedValue(cached);

    const { ragService } = await import('../../services/rag.service.js');
    const result = await ragService.query('repo-1', 'test', 5);

    expect(result).toEqual(cached);
    expect(mockCacheGet).toHaveBeenCalled();
  });

  it('query calls cache.set on fresh query', async () => {
    mockCacheGet.mockResolvedValue(null);
    mockSearch.mockResolvedValue([
      { payload: { filePath: 'x.ts', fileName: 'x.ts', startLine: 1, endLine: 10, content: 'code' }, score: 0.8 },
    ]);

    const { ragService } = await import('../../services/rag.service.js');
    await ragService.query('repo-1', 'test', 5);

    expect(mockCacheSet).toHaveBeenCalled();
  });

  it('query returns empty citations when no results', async () => {
    mockCacheGet.mockResolvedValue(null);
    mockSearch.mockResolvedValue([]);

    const { ragService } = await import('../../services/rag.service.js');
    const result = await ragService.query('repo-1', 'nonexistent', 5);

    expect(result.citations).toEqual([]);
    expect(result.totalChunks).toBe(0);
  });
});
