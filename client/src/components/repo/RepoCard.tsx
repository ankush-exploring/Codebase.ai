import { Link } from 'react-router-dom';
import { Repository } from '../../services/repositoryApi';
import RepoStatusBadge from './RepoStatusBadge';

interface RepoCardProps {
  repo: Repository;
  onDelete: (id: string) => void;
  onParse: (id: string) => void;
}

const languageColors: Record<string, string> = {
  JavaScript: 'bg-yellow-400',
  TypeScript: 'bg-blue-400',
  Python: 'bg-green-400',
  Go: 'bg-cyan-400',
  Java: 'bg-orange-400',
  Rust: 'bg-amber-600',
  Ruby: 'bg-red-400',
  PHP: 'bg-indigo-400',
  HTML: 'bg-orange-300',
  CSS: 'bg-blue-300',
};

function formatSize(bytes: number | null): string {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function RepoCard({ repo, onDelete, onParse }: RepoCardProps) {
  const dotColor = languageColors[repo.language || ''] || 'bg-primary-400';

  return (
    <div className="clay-card p-5 shadow-clay-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-clay group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-clay dark:text-white font-semibold truncate group-hover:text-primary-500 dark:group-hover:text-primary-300 transition-colors">{repo.name}</h3>
          {repo.url && (
            <p className="text-clay-muted dark:text-slate-500 text-xs truncate mt-0.5">{repo.url}</p>
          )}
        </div>
        <RepoStatusBadge status={repo.status} />
      </div>

      <div className="flex items-center gap-4 text-sm text-clay-secondary dark:text-slate-400 mb-4">
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
            {repo.language}
          </span>
        )}
        {(repo.status === 'ready' || repo.status === 'parsed' || repo.status === 'embedded') && (
          <>
            <span>{repo.fileCount} files</span>
            {(repo.status === 'parsed' || repo.status === 'embedded') ? (
              <span>{(repo.metadata as Record<string, unknown>)?.totalChunks as number || 0} chunks</span>
            ) : (
              <span>{formatSize(repo.totalSize)}</span>
            )}
          </>
        )}
        <span className="text-clay-muted dark:text-slate-600">{formatDate(repo.createdAt)}</span>
      </div>

      {repo.errorMsg && (
        <p className="text-red-400 text-xs mb-3 truncate" title={repo.errorMsg}>
          {repo.errorMsg}
        </p>
      )}

      <div className="flex items-center gap-2">
        {repo.status === 'ready' && (
          <>
            <button className="px-3 py-1.5 text-sm bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-clay-sm hover:shadow-clay font-medium">
              Open
            </button>
            <button
              onClick={() => onParse(repo.id)}
              className="px-3 py-1.5 text-sm bg-gradient-to-br from-secondary-500 to-secondary-600 text-white rounded-2xl hover:from-secondary-600 hover:to-secondary-700 transition-all shadow-clay-sm font-medium"
            >
              Parse
            </button>
          </>
        )}
        {repo.status === 'parsing' && (
          <div className="flex items-center gap-2 text-yellow-500 dark:text-yellow-400 text-sm">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Parsing...
          </div>
        )}
        {(repo.status === 'parsed' || repo.status === 'embedded') && (
          <>
            <Link
              to={`/repos/${repo.id}/query`}
              className="px-3 py-1.5 text-sm bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all font-medium shadow-clay-sm"
            >
              Query
            </Link>
            <Link
              to={`/repos/${repo.id}/explore`}
              className="px-3 py-1.5 text-sm bg-gradient-to-br from-secondary-500 to-purple-600 text-white rounded-2xl hover:from-secondary-600 hover:to-purple-700 transition-all font-medium shadow-clay-sm"
            >
              Explore
            </Link>
            <Link
              to={`/repos/${repo.id}/architecture`}
              className="px-3 py-1.5 text-sm bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl hover:from-amber-600 hover:to-orange-700 transition-all font-medium shadow-clay-sm"
            >
              Architecture
            </Link>
          </>
        )}
        {repo.status === 'cloning' && (
          <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 text-sm">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Importing...
          </div>
        )}
        <button
          onClick={() => onDelete(repo.id)}
          className="ml-auto px-3 py-1.5 text-sm text-clay-muted dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
