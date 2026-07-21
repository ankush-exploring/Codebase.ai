import { useState } from 'react';
import { TreeNode } from '../../services/codeUnderstandingApi';

interface FileTreeProps {
  nodes: TreeNode[];
  onSelect: (path: string, type: 'file' | 'folder') => void;
  selectedPath?: string;
}

const EXT_ICONS: Record<string, string> = {
  '.ts': 'TS',
  '.tsx': 'TX',
  '.js': 'JS',
  '.jsx': 'JX',
  '.py': 'PY',
  '.go': 'GO',
  '.java': 'JV',
  '.md': 'MD',
  '.json': '{}',
  '.yaml': 'YA',
  '.yml': 'YA',
  '.css': 'CS',
  '.html': 'HT',
};

function getIcon(node: TreeNode): string {
  if (node.type === 'folder') return '';
  return EXT_ICONS[node.extension || ''] || 'FI';
}

function TreeItem({ node, onSelect, selectedPath, depth = 0 }: { node: TreeNode; onSelect: (path: string, type: 'file' | 'folder') => void; selectedPath?: string; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isSelected = selectedPath === node.path;
  const icon = getIcon(node);

  const handleClick = () => {
    if (node.type === 'folder') {
      setExpanded(!expanded);
    }
    onSelect(node.path, node.type);
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-1.5 px-2 py-1 text-sm text-left rounded-xl transition-colors ${
          isSelected
            ? 'bg-primary-500/20 text-primary-600 dark:text-primary-300'
            : 'text-clay dark:text-slate-300 hover:bg-clay-surface dark:hover:bg-slate-700/50'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {node.type === 'folder' && (
          <svg
            className={`w-3 h-3 text-clay-muted dark:text-slate-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
        {node.type === 'file' && <span className="w-3" />}
        {icon && (
          <span className="text-[10px] font-mono font-bold text-clay-muted dark:text-slate-500 w-4 text-center">{icon}</span>
        )}
        <span className="truncate">{node.name}</span>
      </button>

      {expanded && node.children && (
        <div>
          {node.children
            .sort((a, b) => {
              if (a.type === b.type) return a.name.localeCompare(b.name);
              return a.type === 'folder' ? -1 : 1;
            })
            .map((child) => (
              <TreeItem
                key={child.path}
                node={child}
                onSelect={onSelect}
                selectedPath={selectedPath}
                depth={depth + 1}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ nodes, onSelect, selectedPath }: FileTreeProps) {
  return (
    <div className="py-2">
      {nodes
        .sort((a, b) => {
          if (a.type === b.type) return a.name.localeCompare(b.name);
          return a.type === 'folder' ? -1 : 1;
        })
        .map((node) => (
          <TreeItem
            key={node.path}
            node={node}
            onSelect={onSelect}
            selectedPath={selectedPath}
          />
        ))}
    </div>
  );
}
