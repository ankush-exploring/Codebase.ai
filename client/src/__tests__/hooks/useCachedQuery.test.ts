import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCachedQuery } from '../../hooks/useCachedQuery';

vi.mock('../../services/repositoryApi', () => ({
  repositoryApi: {
    query: vi.fn().mockResolvedValue({
      citations: [{ filePath: 'src/a.ts', score: 0.9, content: 'code' }],
      totalChunks: 1,
    }),
  },
}));

describe('useCachedQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty results', () => {
    const { result } = renderHook(() => useCachedQuery('repo-1'));
    expect(result.current.results).toEqual([]);
    expect(result.current.isSearching).toBe(false);
    expect(result.current.error).toBe('');
  });

  it('fetches and stores results', async () => {
    const { result } = renderHook(() => useCachedQuery('repo-1'));

    await act(async () => {
      await result.current.search('What does this do?');
    });

    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0]?.filePath).toBe('src/a.ts');
  });

  it('returns cached results on second call', async () => {
    const { repositoryApi } = await import('../../services/repositoryApi');
    const { result } = renderHook(() => useCachedQuery('repo-1'));

    await act(async () => {
      await result.current.search('same query');
    });

    await act(async () => {
      await result.current.search('same query');
    });

    expect(repositoryApi.query).toHaveBeenCalledTimes(1);
  });

  it('clearCache forces refetch', async () => {
    const { repositoryApi } = await import('../../services/repositoryApi');
    const { result } = renderHook(() => useCachedQuery('repo-1'));

    await act(async () => {
      await result.current.search('cached query');
    });

    act(() => {
      result.current.clearCache();
    });

    await act(async () => {
      await result.current.search('cached query');
    });

    expect(repositoryApi.query).toHaveBeenCalledTimes(2);
  });
});
