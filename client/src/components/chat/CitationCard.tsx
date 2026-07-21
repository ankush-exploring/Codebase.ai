interface CitationCardProps {
  citation: {
    filePath: string;
    startLine: number;
    endLine: number;
    score: number;
    content: string;
  };
  index: number;
}

export default function CitationCard({ citation, index }: CitationCardProps) {
  return (
    <div className="clay-card p-3 rounded-xl shadow-clay-sm text-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-primary-500 dark:text-primary-400 text-xs font-mono font-medium">[{index + 1}]</span>
        <span className="text-clay dark:text-slate-300 text-xs font-mono truncate">{citation.filePath}</span>
        <span className="text-clay-muted dark:text-slate-500 text-xs">
          L{citation.startLine}-{citation.endLine}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-12 h-1.5 bg-clay-border dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-500"
              style={{ width: `${Math.round(citation.score * 100)}%` }}
            />
          </div>
          <span className="text-clay-muted dark:text-slate-500 text-[10px]">{Math.round(citation.score * 100)}%</span>
        </div>
      </div>
      <pre className="text-clay-secondary dark:text-slate-400 text-xs overflow-x-auto max-h-16 overflow-y-auto">
        {citation.content}
      </pre>
    </div>
  );
}
