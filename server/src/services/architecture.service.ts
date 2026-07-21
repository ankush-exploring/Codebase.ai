import { eq } from 'drizzle-orm';
import { db } from '../database/index.js';
import { files, fileMetadata, repositories } from '../database/schema.js';
import { NotFoundError } from '../utils/AppError.js';

interface FolderNode {
  name: string;
  path: string;
  children: Map<string, FolderNode>;
  fileCount: number;
}

function buildFolderTree(filePaths: string[]): string {
  const root: FolderNode = { name: '/', path: '', children: new Map(), fileCount: 0 };

  for (const fp of filePaths) {
    const parts = fp.split(/[/\\]/);
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i] as string;
      const isFile = i === parts.length - 1;
      if (isFile) {
        current.fileCount++;
      } else {
        if (!current.children.has(part)) {
          current.children.set(part, { name: part, path: parts.slice(0, i + 1).join('/'), children: new Map(), fileCount: 0 });
        }
        current = current.children.get(part)!;
        if (i === parts.length - 2) current.fileCount++;
      }
    }
  }

  let mermaid = 'graph TD\n';
  let idCounter = 0;

  function traverse(node: FolderNode, parentId: string) {
    const sorted = [...node.children.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    for (const [name, child] of sorted) {
      const nodeId = `n${++idCounter}`;
      const label = child.fileCount > 0 ? `${name} (${child.fileCount})` : name;
      mermaid += `  ${parentId} --> ${nodeId}["${label}"]\n`;
      traverse(child, nodeId);
    }
  }

  traverse(root, 'root');
  mermaid += '  root["/" ]:::root\n';
  mermaid += '  classDef root fill:#3b82f6,stroke:#1d4ed8,color:#fff\n';
  mermaid += '  classDef folder fill:#6366f1,stroke:#4f46e5,color:#fff\n';

  return mermaid;
}

function buildDependencyGraph(
  allFiles: { path: string; imports: { source: string }[] }[]
): string {
  let mermaid = 'graph LR\n';
  const nodeIds = new Map<string, string>();
  let idCounter = 0;

  const getNode = (path: string): string => {
    if (!nodeIds.has(path)) {
      nodeIds.set(path, `f${++idCounter}`);
    }
    return nodeIds.get(path)!;
  };

  for (const file of allFiles) {
    const sourceId = getNode(file.path);
    for (const imp of file.imports) {
      const targetId = getNode(imp.source);
      mermaid += `  ${sourceId} --> ${targetId}\n`;
    }
  }

  for (const [path, id] of nodeIds) {
    const short = path.split('/').pop() || path;
    const isExternal = !path.startsWith('.') && !path.startsWith('/');
    if (isExternal) {
      mermaid += `  ${id}["${short}"]:::external\n`;
    } else {
      mermaid += `  ${id}["${short}"]\n`;
    }
  }

  mermaid += '  classDef external fill:#f59e0b,stroke:#d97706,color:#000\n';
  return mermaid;
}

function buildApiFlow(): string {
  const routes = [
    { method: 'POST', path: '/auth/register', group: 'Auth' },
    { method: 'POST', path: '/auth/login', group: 'Auth' },
    { method: 'POST', path: '/auth/logout', group: 'Auth' },
    { method: 'GET', path: '/auth/me', group: 'Auth' },
    { method: 'GET', path: '/repos', group: 'Repos' },
    { method: 'POST', path: '/repos/import/url', group: 'Repos' },
    { method: 'POST', path: '/repos/import/zip', group: 'Repos' },
    { method: 'POST', path: '/repos/:id/parse', group: 'Repos' },
    { method: 'POST', path: '/repos/:id/embed', group: 'Repos' },
    { method: 'POST', path: '/repos/:id/query', group: 'Repos' },
    { method: 'POST', path: '/repos/:id/explain', group: 'Repos' },
    { method: 'GET', path: '/repos/:id/files', group: 'Repos' },
    { method: 'GET', path: '/chats', group: 'Chats' },
    { method: 'POST', path: '/chats', group: 'Chats' },
    { method: 'POST', path: '/chats/:id/messages', group: 'Chats' },
  ];

  let mermaid = 'graph LR\n';
  mermaid += '  Client[Client] --> Gateway[API Gateway]\n';

  const groups = new Map<string, typeof routes>();
  for (const r of routes) {
    if (!groups.has(r.group)) groups.set(r.group, []);
    groups.get(r.group)!.push(r);
  }

  for (const [group, groupRoutes] of groups) {
    mermaid += `  Gateway --> ${group}\n`;
    for (const r of groupRoutes) {
      const nodeId = r.path.replace(/[:\/]/g, '_').replace(/^_+/, '');
      mermaid += `  ${group} --> ${nodeId}["${r.method} ${r.path}"]\n`;
    }
  }

  return mermaid;
}

function buildDbSchema(): string {
  let mermaid = 'erDiagram\n';

  mermaid += '  USERS {\n';
  mermaid += '    uuid id PK\n';
  mermaid += '    varchar email\n';
  mermaid += '    varchar name\n';
  mermaid += '    text password_hash\n';
  mermaid += '    text avatar\n';
  mermaid += '  }\n\n';

  mermaid += '  REPOSITORIES {\n';
  mermaid += '    uuid id PK\n';
  mermaid += '    uuid user_id FK\n';
  mermaid += '    varchar name\n';
  mermaid += '    text url\n';
  mermaid += '    varchar status\n';
  mermaid += '    varchar source\n';
  mermaid += '    integer file_count\n';
  mermaid += '  }\n\n';

  mermaid += '  FILES {\n';
  mermaid += '    uuid id PK\n';
  mermaid += '    uuid repository_id FK\n';
  mermaid += '    text path\n';
  mermaid += '    varchar name\n';
  mermaid += '    varchar extension\n';
  mermaid += '    integer size\n';
  mermaid += '  }\n\n';

  mermaid += '  FILE_METADATA {\n';
  mermaid += '    uuid id PK\n';
  mermaid += '    uuid file_id FK\n';
  mermaid += '    jsonb functions\n';
  mermaid += '    jsonb classes\n';
  mermaid += '    jsonb imports\n';
  mermaid += '    jsonb exports\n';
  mermaid += '  }\n\n';

  mermaid += '  CHUNKS {\n';
  mermaid += '    uuid id PK\n';
  mermaid += '    uuid file_id FK\n';
  mermaid += '    text content\n';
  mermaid += '    integer tokens\n';
  mermaid += '    integer start_line\n';
  mermaid += '    integer end_line\n';
  mermaid += '  }\n\n';

  mermaid += '  CHATS {\n';
  mermaid += '    uuid id PK\n';
  mermaid += '    uuid user_id FK\n';
  mermaid += '    uuid repository_id FK\n';
  mermaid += '    varchar title\n';
  mermaid += '  }\n\n';

  mermaid += '  MESSAGES {\n';
  mermaid += '    uuid id PK\n';
  mermaid += '    uuid chat_id FK\n';
  mermaid += '    varchar role\n';
  mermaid += '    text content\n';
  mermaid += '    jsonb citations\n';
  mermaid += '  }\n\n';

  mermaid += '  USERS ||--o{ REPOSITORIES : "owns"\n';
  mermaid += '  USERS ||--o{ CHATS : "creates"\n';
  mermaid += '  REPOSITORIES ||--o{ FILES : "contains"\n';
  mermaid += '  REPOSITORIES ||--o{ CHATS : "associated_with"\n';
  mermaid += '  FILES ||--o| FILE_METADATA : "has"\n';
  mermaid += '  FILES ||--o{ CHUNKS : "split_into"\n';
  mermaid += '  CHATS ||--o{ MESSAGES : "contains"\n';

  return mermaid;
}

export const architectureService = {
  getFolderStructure: async (repoId: string): Promise<string> => {
    const [repo] = await db.select().from(repositories).where(eq(repositories.id, repoId)).limit(1);
    if (!repo) throw new NotFoundError('Repository not found');

    const repoFiles = await db.select({ path: files.path }).from(files).where(eq(files.repositoryId, repoId));
    return buildFolderTree(repoFiles.map((f) => f.path));
  },

  getDependencyGraph: async (repoId: string): Promise<string> => {
    const [repo] = await db.select().from(repositories).where(eq(repositories.id, repoId)).limit(1);
    if (!repo) throw new NotFoundError('Repository not found');

    const allFiles = await db
      .select({ path: files.path, imports: fileMetadata.imports })
      .from(files)
      .innerJoin(fileMetadata, eq(files.id, fileMetadata.fileId))
      .where(eq(files.repositoryId, repoId));

    const parsed = allFiles.map((f) => ({
      path: f.path,
      imports: (f.imports as Array<{ source: string }>) || [],
    }));

    return buildDependencyGraph(parsed);
  },

  getApiFlow: async (): Promise<string> => {
    return buildApiFlow();
  },

  getDbSchema: async (): Promise<string> => {
    return buildDbSchema();
  },
};