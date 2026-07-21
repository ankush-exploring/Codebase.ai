import api from './api';

export const architectureApi = {
  getFolderStructure: async (repoId: string): Promise<string> => {
    const { data } = await api.get(`/repos/${repoId}/architecture/folders`);
    return data.data.mermaid;
  },

  getDependencyGraph: async (repoId: string): Promise<string> => {
    const { data } = await api.get(`/repos/${repoId}/architecture/dependencies`);
    return data.data.mermaid;
  },

  getApiFlow: async (repoId: string): Promise<string> => {
    const { data } = await api.get(`/repos/${repoId}/architecture/api-flow`);
    return data.data.mermaid;
  },

  getDbSchema: async (repoId: string): Promise<string> => {
    const { data } = await api.get(`/repos/${repoId}/architecture/db-schema`);
    return data.data.mermaid;
  },
};
