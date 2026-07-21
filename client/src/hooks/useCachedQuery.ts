import { useState, useCallback } from 'react';
import { repositoryApi } from '../services/repositoryApi';
import type { Citation } from '../services/repositoryApi';

interface CacheEntry {
  query: string;
  citations: Citation[];
  totalChunks: number;
  timestamp: number;
}

const queryCache = new Map<string, CacheEntry>();
const CACHE_TTL = 60_000;

function cacheKey(repoId: string, query: string): string {
  return `${repoId}:${query.toLowerCase().trim()}`;
}

export function useCachedQuery(repoId: string) {
  const [results, setResults] = useState<Citation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const search = useCallback(
    async (query: string) => {
      if (!query.trim()) return;

      const key = cacheKey(repoId, query);
      const cached = queryCache.get(key);

      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setResults(cached.citations);
        return;
      }

      setIsSearching(true);
      setError('');

      try {
        const response = await repositoryApi.query(repoId, query, 10);
        setResults(response.citations);

        queryCache.set(key, {
          query,
          citations: response.citations,
          totalChunks: response.totalChunks,
          timestamp: Date.now(),
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Search failed';
        setError(message);
      } finally {
        setIsSearching(false);
      }
    },
    [repoId]
  );

  const clearCache = useCallback(() => {
    for (const key of queryCache.keys()) {
      if (key.startsWith(repoId)) {
        queryCache.delete(key);
      }
    }
  }, [repoId]);

  return { results, isSearching, error, search, clearCache };
}
