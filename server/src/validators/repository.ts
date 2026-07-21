import { z } from 'zod';

export const importByUrlSchema = z.object({
  url: z.string().url('Invalid URL').regex(
    /^(https:\/\/github\.com\/.+\/.+|https:\/\/gitlab\.com\/.+\/.+)$/,
    'Only GitHub and GitLab URLs are supported'
  ),
  branch: z.string().max(255).optional(),
  name: z.string().min(1).max(255).optional(),
});

export const importByZipSchema = z.object({
  name: z.string().min(1).max(255).optional(),
});

export const importByFolderSchema = z.object({
  name: z.string().min(1).max(255).optional(),
});

export const repoIdSchema = z.object({
  id: z.string().uuid('Invalid repository ID'),
});

export type ImportByUrlInput = z.infer<typeof importByUrlSchema>;
export type ImportByZipInput = z.infer<typeof importByZipSchema>;
export type ImportByFolderInput = z.infer<typeof importByFolderSchema>;
export type RepoIdInput = z.infer<typeof repoIdSchema>;