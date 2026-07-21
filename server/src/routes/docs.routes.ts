import { Router, Response } from 'express';

const router = Router();

interface RouteDoc {
  method: string;
  path: string;
  description: string;
  auth: boolean;
  tags: string[];
}

const routes: RouteDoc[] = [
  { method: 'POST', path: '/auth/register', description: 'Register a new user account', auth: false, tags: ['auth'] },
  { method: 'POST', path: '/auth/login', description: 'Login with email and password', auth: false, tags: ['auth'] },
  { method: 'POST', path: '/auth/logout', description: 'Logout current session', auth: true, tags: ['auth'] },
  { method: 'GET', path: '/auth/me', description: 'Get current user profile', auth: true, tags: ['auth'] },

  { method: 'GET', path: '/repos', description: 'List all repositories for current user', auth: true, tags: ['repos'] },
  { method: 'POST', path: '/repos/import/url', description: 'Import a repository from GitHub URL', auth: true, tags: ['repos'] },
  { method: 'POST', path: '/repos/import/zip', description: 'Import a repository from ZIP file upload', auth: true, tags: ['repos'] },
  { method: 'GET', path: '/repos/:id', description: 'Get repository details by ID', auth: true, tags: ['repos'] },
  { method: 'DELETE', path: '/repos/:id', description: 'Delete a repository and its data', auth: true, tags: ['repos'] },
  { method: 'POST', path: '/repos/:id/parse', description: 'Parse repository files with AST analysis', auth: true, tags: ['repos'] },
  { method: 'POST', path: '/repos/:id/embed', description: 'Generate vector embeddings for parsed chunks', auth: true, tags: ['repos'] },
  { method: 'POST', path: '/repos/:id/query', description: 'Search codebase using semantic query', auth: true, tags: ['repos'] },
  { method: 'POST', path: '/repos/:id/explain', description: 'Get AI explanation of code element', auth: true, tags: ['repos'] },
  { method: 'GET', path: '/repos/:id/files', description: 'Get file tree for repository', auth: true, tags: ['repos'] },
  { method: 'GET', path: '/repos/:id/file-info', description: 'Get metadata for a specific file', auth: true, tags: ['repos'] },
  { method: 'GET', path: '/repos/:id/architecture/folders', description: 'Get folder structure as Mermaid diagram', auth: true, tags: ['architecture'] },
  { method: 'GET', path: '/repos/:id/architecture/dependencies', description: 'Get dependency graph as Mermaid diagram', auth: true, tags: ['architecture'] },
  { method: 'GET', path: '/repos/:id/architecture/api-flow', description: 'Get API flow as Mermaid diagram', auth: true, tags: ['architecture'] },
  { method: 'GET', path: '/repos/:id/architecture/db-schema', description: 'Get database schema as Mermaid ER diagram', auth: true, tags: ['architecture'] },

  { method: 'GET', path: '/chats', description: 'List all chats for current user', auth: true, tags: ['chats'] },
  { method: 'POST', path: '/chats', description: 'Create a new chat session', auth: true, tags: ['chats'] },
  { method: 'GET', path: '/chats/:id/messages', description: 'Get message history for a chat', auth: true, tags: ['chats'] },
  { method: 'POST', path: '/chats/:id/messages', description: 'Send a message and stream AI response (SSE)', auth: true, tags: ['chats'] },
  { method: 'DELETE', path: '/chats/:id', description: 'Delete a chat and its messages', auth: true, tags: ['chats'] },
];

router.get('/', (_req, res: Response) => {
  const tags = [...new Set(routes.flatMap((r) => r.tags))];
  const grouped: Record<string, RouteDoc[]> = {};
  for (const tag of tags) {
    grouped[tag] = routes.filter((r) => r.tags.includes(tag));
  }

  res.json({
    success: true,
    data: {
      version: '0.1.0',
      baseUrl: '/api/v1',
      totalEndpoints: routes.length,
      tags,
      routes: grouped,
      all: routes,
    },
  });
});

export default router;
