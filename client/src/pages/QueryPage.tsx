import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { repositoryApi, Repository, Citation } from '../services/repositoryApi';
import { invalidateCache } from '../services/api';
import { Button, Spinner } from '../components/ui';

export default function QueryPage() {
  const { id } = useParams<{ id: string }>();
  const [repo, setRepo] = useState<Repository | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Citation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isEmbedding, setIsEmbedding] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) {
      repositoryApi.getById(id).then(setRepo).catch(() => {});
    }
  }, [id]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleEmbed = async () => {
    if (!id) return;
    setIsEmbedding(true);
    setError('');
    try {
      const result = await repositoryApi.embed(id);
      setRepo((prev) => prev ? { ...prev, status: 'embedded' } : prev);
      invalidateCache(`/repos/${id}`);
      alert(`Embedded ${result.embedded} chunks`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Embedding failed');
    } finally {
      setIsEmbedding(false);
    }
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !query.trim()) return;
    setIsSearching(true);
    setError('');
    try {
      const result = await repositoryApi.query(id, query);
      setResults(result.citations);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Query failed');
    } finally {
      setIsSearching(false);
    }
  };

  if (!repo) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <Link to="/dashboard" className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 text-sm">&larr; Back to Dashboard</Link>
        <h1 className="text-2xl font-bold text-clay dark:text-white mt-2">
          Query: <span className="gradient-text">{repo.name}</span>
        </h1>
      </div>

      <div className="flex gap-3 mb-6">
        <Button onClick={handleEmbed} isLoading={isEmbedding} variant="secondary">
          {isEmbedding ? 'Embedding...' : 'Embed Codebase'}
        </Button>
        <span className="text-clay-secondary dark:text-slate-400 text-sm self-center">
          Status: {repo.status}
        </span>
      </div>

      <form onSubmit={handleQuery} className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative group">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about this codebase... (Ctrl+K)"
              className="w-full px-4 py-3 clay-input rounded-2xl placeholder-clay-muted dark:placeholder-slate-400 focus:outline-none focus:border-primary-500 transition-all text-sm shadow-clay-inset"
            />
          </div>
          <Button type="submit" isLoading={isSearching} className="px-6 rounded-2xl">
            Search
          </Button>
        </div>
      </form>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-clay dark:text-white">Results ({results.length})</h2>
          {results.map((citation, i) => (
            <div
              key={i}
              style={{ animationDelay: `${i * 50}ms` }}
              className="clay-card p-4 animate-slide-up shadow-clay-sm hover:shadow-clay transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-primary-500 dark:text-primary-400 text-sm font-mono">{citation.filePath}</span>
                <span className="text-clay-muted dark:text-slate-500 text-xs">
                  Lines {citation.startLine}-{citation.endLine}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 h-1.5 bg-clay-border dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      citation.score > 0.8
                        ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                        : citation.score > 0.5
                        ? 'bg-gradient-to-r from-primary-500 to-primary-400'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    }`}
                    style={{ width: `${Math.round(citation.score * 100)}%` }}
                  />
                </div>
                <span className="text-clay-muted dark:text-slate-500 text-xs w-10 text-right">{Math.round(citation.score * 100)}%</span>
              </div>
              <pre className="text-clay-secondary dark:text-slate-300 text-xs overflow-x-auto max-h-32 overflow-y-auto">
                {citation.content}
              </pre>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && !isSearching && query && (
        <div className="text-center py-12">
          <p className="text-clay-muted dark:text-slate-500 mb-2">No results found.</p>
          <p className="text-clay-muted dark:text-slate-600 text-sm">Try embedding the codebase first or refining your query.</p>
        </div>
      )}
    </div>
  );
}
