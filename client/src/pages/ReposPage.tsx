import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { repositoryApi, Repository } from '../services/repositoryApi';
import RepoCard from '../components/repo/RepoCard';
import { Spinner } from '../components/ui';

export default function ReposPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    repositoryApi.list()
      .then(setRepos)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this repository?')) return;
    try {
      await repositoryApi.delete(id);
      setRepos((prev) => prev.filter((r) => r.id !== id));
    } catch {
      /* silently fail */
    }
  };

  const handleParse = async (id: string) => {
    try {
      const updated = await repositoryApi.parse(id);
      setRepos((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch {
      /* silently fail */
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-clay dark:text-white">Repositories</h1>
          <p className="text-clay-secondary dark:text-slate-400 mt-1">Manage your imported codebases</p>
        </div>
        <Link
          to="/dashboard/repos/new"
          className="px-4 py-2 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all font-medium shadow-clay-sm hover:shadow-clay"
        >
          + Import Repository
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : repos.length === 0 ? (
        <div className="clay-card p-8 text-center shadow-clay-sm">
          <p className="text-clay-secondary dark:text-slate-400 mb-4">No repositories yet. Import your first codebase to get started.</p>
          <Link
            to="/dashboard/repos/new"
            className="px-4 py-2 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-clay-sm"
          >
            Import Repository
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {repos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} onDelete={handleDelete} onParse={handleParse} />
          ))}
        </div>
      )}
    </div>
  );
}
