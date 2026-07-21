import path from 'path';
import { parseJsTs } from './astParser.js';

type Language = 'javascript' | 'typescript' | 'python' | 'go' | 'java' | 'cpp' | 'ruby' | 'markdown' | 'json' | 'yaml' | 'unknown';

interface FileMetadata {
  functions: { name: string; startLine: number; endLine: number; params: string[] }[];
  classes: { name: string; startLine: number; endLine: number; methods: string[] }[];
  imports: { source: string; specifiers: string[] }[];
  exports: { name: string; type: string }[];
  comments: { type: string; value: string; line: number }[];
}

const EXT_MAP: Record<string, Language> = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.py': 'python',
  '.go': 'go',
  '.java': 'java',
  '.c': 'cpp',
  '.cpp': 'cpp',
  '.h': 'cpp',
  '.hpp': 'cpp',
  '.rb': 'ruby',
  '.md': 'markdown',
  '.json': 'json',
  '.yaml': 'yaml',
  '.yml': 'yaml',
};

const SKIP_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.pdf', '.zip', '.tar', '.gz', '.rar',
  '.exe', '.dll', '.so', '.dylib', '.o',
  '.lock', '.map',
]);

const SKIP_BINARY_CONTENT = new Set(['\x00', '\ufffd']);

export function detectLanguage(filePath: string): Language {
  const ext = path.extname(filePath).toLowerCase();
  return EXT_MAP[ext] || 'unknown';
}

export function isBinaryFile(content: string): boolean {
  if (content.length === 0) return false;
  let binaryCount = 0;
  const checkLen = Math.min(content.length, 8192);
  for (let i = 0; i < checkLen; i++) {
    if (SKIP_BINARY_CONTENT.has(content[i])) binaryCount++;
  }
  return binaryCount / checkLen > 0.1;
}

export function shouldSkipFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return SKIP_EXTENSIONS.has(ext);
}

function extractPython(content: string): FileMetadata {
  const lines = content.split('\n');
  const functions: FileMetadata['functions'] = [];
  const classes: FileMetadata['classes'] = [];
  const imports: FileMetadata['imports'] = [];
  const exports: FileMetadata['exports'] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const funcMatch = line.match(/^(\s*)def\s+(\w+)\s*\((.*)\)/);
    if (funcMatch) {
      functions.push({
        name: funcMatch[2],
        startLine: i + 1,
        endLine: i + 1,
        params: funcMatch[3].split(',').map((p) => p.trim().split(':')[0].trim()).filter(Boolean),
      });
      continue;
    }
    const classMatch = line.match(/^(\s*)class\s+(\w+)/);
    if (classMatch) {
      classes.push({
        name: classMatch[2],
        startLine: i + 1,
        endLine: i + 1,
        methods: [],
      });
    }
    const importMatch = line.match(/^from\s+(.+?)\s+import\s+(.+)/);
    if (importMatch) {
      imports.push({ source: importMatch[1], specifiers: importMatch[2].split(',').map((s) => s.trim()) });
      continue;
    }
    const directImport = line.match(/^import\s+(.+)/);
    if (directImport) {
      imports.push({ source: directImport[1], specifiers: ['*'] });
    }
  }

  return { functions, classes, imports, exports, comments: [] };
}

function extractGo(content: string): FileMetadata {
  const lines = content.split('\n');
  const functions: FileMetadata['functions'] = [];
  const classes: FileMetadata['classes'] = [];
  const imports: FileMetadata['imports'] = [];
  const exports: FileMetadata['exports'] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const funcMatch = line.match(/^func\s+(?:\(\w+\s+\*?\w+\)\s+)?(\w+)\s*\((.*)\)/);
    if (funcMatch) {
      const name = funcMatch[2];
      const params = funcMatch[3].split(',').map((p) => p.trim().split(' ')[0]).filter(Boolean);
      functions.push({ name, startLine: i + 1, endLine: i + 1, params });
    }
    const structMatch = line.match(/^type\s+(\w+)\s+struct/);
    if (structMatch) {
      classes.push({ name: structMatch[1], startLine: i + 1, endLine: i + 1, methods: [] });
    }
  }

  return { functions, classes, imports, exports, comments: [] };
}

function extractJava(content: string): FileMetadata {
  const lines = content.split('\n');
  const functions: FileMetadata['functions'] = [];
  const classes: FileMetadata['classes'] = [];
  const imports: FileMetadata['imports'] = [];
  const exports: FileMetadata['exports'] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const methodMatch = line.match(/(?:public|private|protected|static|final|abstract|synchronized|native|\s)+[\w<>\[\],\s]+\s+(\w+)\s*\(/);
    if (methodMatch) {
      functions.push({ name: methodMatch[1], startLine: i + 1, endLine: i + 1, params: [] });
    }
    const classMatch = line.match(/(?:public|private|protected)?\s*(?:abstract|final)?\s*class\s+(\w+)/);
    if (classMatch) {
      classes.push({ name: classMatch[1], startLine: i + 1, endLine: i + 1, methods: [] });
    }
    const importMatch = line.match(/^import\s+(.+);/);
    if (importMatch) {
      imports.push({ source: importMatch[1], specifiers: ['*'] });
    }
  }

  return { functions, classes, imports, exports, comments: [] };
}

export function extractMetadata(filePath: string, content: string): FileMetadata {
  const lang = detectLanguage(filePath);

  switch (lang) {
    case 'javascript':
    case 'typescript':
      return parseJsTs(content, filePath);
    case 'python':
      return extractPython(content);
    case 'go':
      return extractGo(content);
    case 'java':
      return extractJava(content);
    default:
      return { functions: [], classes: [], imports: [], exports: [], comments: [] };
  }
}