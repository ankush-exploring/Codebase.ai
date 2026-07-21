import { ExplanationResult } from '../../services/codeUnderstandingApi';

interface ExplanationPanelProps {
  result: ExplanationResult | null;
  isLoading: boolean;
}

export default function ExplanationPanel({ result, isLoading }: ExplanationPanelProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <svg className="animate-spin h-8 w-8 text-primary-500 mb-3" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-clay-secondary dark:text-slate-400 text-sm">Analyzing code...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg className="w-12 h-12 text-clay-muted dark:text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <p className="text-clay-secondary dark:text-slate-400">Select a file or folder to get an AI explanation</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="clay-card p-5 shadow-clay-sm">
        <h3 className="text-clay dark:text-white font-semibold mb-3">AI Explanation</h3>
        <div className="text-clay dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
          {result.explanation}
        </div>
      </div>

      {result.citations.length > 0 && (
        <div className="clay-card p-5 shadow-clay-sm">
          <h3 className="text-clay dark:text-white font-semibold mb-3">
            Referenced Code ({result.citations.length})
          </h3>
          <div className="space-y-2">
            {result.citations.map((c, i) => (
              <div key={i} className="bg-clay-surface dark:bg-slate-900 rounded-2xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-primary-500 dark:text-primary-400 text-xs font-mono">[{i + 1}]</span>
                  <span className="text-clay dark:text-slate-300 text-xs font-mono">{c.filePath}</span>
                  <span className="text-clay-muted dark:text-slate-500 text-xs">
                    L{c.startLine}-{c.endLine} ({(c.score * 100).toFixed(0)}%)
                  </span>
                </div>
                <pre className="text-clay-secondary dark:text-slate-400 text-xs overflow-x-auto max-h-20 overflow-y-auto">
                  {c.content.slice(0, 300)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
