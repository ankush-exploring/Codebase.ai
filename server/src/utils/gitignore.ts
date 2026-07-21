export const DEFAULT_IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  '__pycache__',
  'dist',
  'build',
  '.next',
  '.nuxt',
  '.cache',
  'coverage',
  '.nyc_output',
  '.env',
  '.env.local',
  '.env.development.local',
  '.env.test.local',
  '.env.production.local',
  'npm-debug.log*',
  'yarn-debug.log*',
  'yarn-error.log*',
  'pnpm-debug.log*',
  '.DS_Store',
  'Thumbs.db',
  '*.pyc',
  '*.pyo',
  '*.class',
  '*.jar',
  '*.war',
  '*.ear',
  '*.o',
  '*.so',
  '*.dylib',
  '*.dll',
  'vendor',
  'go.sum',
  'Cargo.lock',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
];

export function shouldIgnorePath(relativePath: string): boolean {
  const parts = relativePath.split(/[/\\]/);
  for (const part of parts) {
    if (DEFAULT_IGNORE_PATTERNS.includes(part)) return true;
    if (part.endsWith('.min.js') || part.endsWith('.min.css')) return true;
  }
  return false;
}

export function countFiles(dirPath: string, files: string[]): { fileCount: number; totalSize: number } {
  let fileCount = 0;
  let totalSize = 0;

  for (const filePath of files) {
    const rel = filePath.replace(dirPath, '').replace(/^[/\\]/, '');
    if (!shouldIgnorePath(rel)) {
      fileCount++;
    }
  }

  return { fileCount, totalSize };
}