import { describe, it, expect } from 'vitest';

describe('rateLimiter configs', () => {
  it('exports all rate limiters', async () => {
    const mod = await import('../../middleware/rateLimiter.js');
    expect(mod.rateLimiter).toBeDefined();
    expect(mod.authLimiter).toBeDefined();
    expect(mod.chatLimiter).toBeDefined();
    expect(mod.embedLimiter).toBeDefined();
    expect(mod.queryLimiter).toBeDefined();
  });

  it('default export is rateLimiter', async () => {
    const mod = await import('../../middleware/rateLimiter.js');
    expect(mod.default).toBe(mod.rateLimiter);
  });
});
