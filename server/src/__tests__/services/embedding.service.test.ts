import { describe, it, expect } from 'vitest';

describe('embeddingService (hash fallback)', () => {
  it('deterministicHashEmbedding returns consistent vectors', async () => {
    const { embeddingService } = await import('../../services/embedding.service.js');
    const v1 = await embeddingService.embedText('hello world');
    const v2 = await embeddingService.embedText('hello world');
    expect(v1).toEqual(v2);
  });

  it('different inputs produce different vectors', async () => {
    const { embeddingService } = await import('../../services/embedding.service.js');
    const v1 = await embeddingService.embedText('hello world');
    const v2 = await embeddingService.embedText('goodbye world');
    expect(v1).not.toEqual(v2);
  });

  it('returns 1536 dimensions', async () => {
    const { embeddingService } = await import('../../services/embedding.service.js');
    const v = await embeddingService.embedText('test');
    expect(v).toHaveLength(1536);
  });

  it('vectors are normalized (unit length)', async () => {
    const { embeddingService } = await import('../../services/embedding.service.js');
    const v = await embeddingService.embedText('normalize me');
    const mag = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
    expect(mag).toBeCloseTo(1.0, 3);
  });

  it('embedTexts handles multiple texts', async () => {
    const { embeddingService } = await import('../../services/embedding.service.js');
    const results = await embeddingService.embedTexts(['alpha', 'beta', 'gamma']);
    expect(results).toHaveLength(3);
    expect(results[0]).toHaveLength(1536);
    expect(results[1]).toHaveLength(1536);
  });

  it('isOpenAIAvailable returns false without API key', async () => {
    const { embeddingService } = await import('../../services/embedding.service.js');
    const available = await embeddingService.isOpenAIAvailable();
    expect(available).toBe(false);
  });
});
