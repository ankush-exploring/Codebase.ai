export type RepositoryStatus = 'pending' | 'cloning' | 'parsing' | 'ready' | 'error';

export interface Repository {
  id: string;
  userId: string;
  name: string;
  url?: string;
  branch: string;
  status: RepositoryStatus;
  language?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface RepositoryCreate {
  name: string;
  url?: string;
  branch?: string;
  userId: string;
}

export interface RepositoryMetadata {
  totalFiles: number;
  totalLines: number;
  languages: Record<string, number>;
  lastCommit?: string;
  defaultBranch: string;
}