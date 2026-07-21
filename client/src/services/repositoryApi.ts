import api from './api';

export interface Repository {
  id: string;
  userId: string;
  name: string;
  url: string | null;
  branch: string | null;
  source: string;
  status: string;
  language: string | null;
  description: string | null;
  fileCount: number | null;
  totalSize: number | null;
  errorMsg: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export const repositoryApi = {
  importByUrl: async (url: string, branch?: string, name?: string) => {
    const res = await api.post('/repos/import/url', { url, branch, name });
    return res.data.data as Repository;
  },

  importByZip: async (file: File, name?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);
    const res = await api.post('/repos/import/zip', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data as Repository;
  },

  list: async () => {
    const res = await api.get('/repos');
    return res.data.data as Repository[];
  },

  getById: async (id: string) => {
    const res = await api.get(`/repos/${id}`);
    return res.data.data as Repository;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/repos/${id}`);
    return res.data;
  },

  parse: async (id: string) => {
    const res = await api.post(`/repos/${id}/parse`);
    return res.data.data as Repository;
  },

  embed: async (id: string) => {
    const res = await api.post(`/repos/${id}/embed`);
    return res.data.data as { embedded: number; collection: string };
  },

  query: async (id: string, query: string, topK?: number) => {
    const res = await api.post(`/repos/${id}/query`, { query, topK });
    return res.data.data as {
      query: string;
      citations: Citation[];
      totalChunks: number;
    };
  },
};

export interface Citation {
  filePath: string;
  fileName: string;
  startLine: number;
  endLine: number;
  score: number;
  content: string;
}