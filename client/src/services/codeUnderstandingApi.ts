import api from './api';

export interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
  extension?: string;
  size?: number;
}

export interface ExplanationResult {
  explanation: string;
  citations: Array<{
    filePath: string;
    startLine: number;
    endLine: number;
    score: number;
    content: string;
  }>;
}

export interface FileInfo {
  file: {
    id: string;
    path: string;
    name: string;
    extension: string | null;
    size: number | null;
  };
  metadata: {
    functions: Array<{ name: string; startLine: number; endLine: number; params: string[] }>;
    classes: Array<{ name: string; startLine: number; endLine: number; methods: string[] }>;
    imports: Array<{ source: string; specifiers: string[] }>;
    exports: Array<{ name: string; type: string }>;
  } | null;
  chunks: Array<{ content: string; startLine: number; endLine: number; tokens: number | null }>;
}

export const codeUnderstandingApi = {
  getFileTree: async (repoId: string) => {
    const res = await api.get(`/repos/${repoId}/files`);
    return res.data.data as TreeNode[];
  },

  getFileInfo: async (repoId: string, filePath: string) => {
    const res = await api.get(`/repos/${repoId}/file-info`, { params: { path: filePath } });
    return res.data.data as FileInfo;
  },

  explain: async (repoId: string, taskType: string, targetPath: string, query?: string) => {
    const res = await api.post(`/repos/${repoId}/explain`, { taskType, targetPath, query });
    return res.data.data as ExplanationResult;
  },
};