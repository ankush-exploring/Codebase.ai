import axios from 'axios';

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL = 30_000;

function cacheKey(method: string, url: string): string {
  return `${method}:${url}`;
}

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.method === 'get') {
    const key = cacheKey('GET', config.url || '');
    const cached = memoryCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      (config as any).__cacheData = cached.data;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.config.method === 'get') {
      const key = cacheKey('GET', response.config.url || '');
      memoryCache.set(key, { data: response.data, timestamp: Date.now() });

      if (memoryCache.size > 200) {
        const oldest = memoryCache.keys().next().value;
        if (oldest) memoryCache.delete(oldest);
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export function invalidateCache(pattern?: string) {
  if (!pattern) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern)) {
      memoryCache.delete(key);
    }
  }
}

export default api;
