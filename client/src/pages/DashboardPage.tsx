import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { repositoryApi, Repository } from '../services/repositoryApi';
import RepoCard from '../components/repo/RepoCard';
import { Spinner } from '../components/ui';

export default function DashboardPage() {
  const { user } = useAuth();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRepos = async () => {
    try {
      const data = await repositoryApi.list();
      setRepos(data);
    } catch {
      /* silently fail */
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
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
    <div className="animate-fade-in">
      <div className="clay-card p-8 shadow-clay-sm mb-8 bg-gradient-to-br from-clay-elevated via-clay-surface to-primary-500/10 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-primary-500/10">
        <h1 className="text-3xl font-bold text-clay dark:text-white mb-1">
          Welcome back, <span className="gradient-text">{user?.name}</span>
        </h1>
        <p className="text-clay-secondary dark:text-slate-400">Manage your repositories and chat with your codebase.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-8">
        <div className="clay-card p-6 shadow-clay-sm relative overflow-hidden group hover:shadow-clay transition-shadow">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 to-primary-400" />
          <div className="text-sm text-clay-secondary dark:text-slate-400 mb-1">Repositories</div>
          <div className="text-3xl font-bold text-clay dark:text-white">{repos.length}</div>
        </div>
        <div className="clay-card p-6 shadow-clay-sm relative overflow-hidden group hover:shadow-clay transition-shadow">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-secondary-500 to-purple-400" />
          <div className="text-sm text-clay-secondary dark:text-slate-400 mb-1">Total Files</div>
          <div className="text-3xl font-bold text-clay dark:text-white">
            {repos.reduce((sum, r) => sum + (r.fileCount || 0), 0)}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : repos.length === 0 ? (
        <div className="clay-card p-12 text-center shadow-clay-sm">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl flex items-center justify-center border border-primary-500/20">
            <svg className="w-8 h-8 text-primary-500 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <p className="text-clay dark:text-slate-300 text-lg font-medium mb-2">No repositories yet</p>
          <p className="text-clay-secondary dark:text-slate-500 mb-6">Import your first codebase to get started with AI-powered analysis.</p>
          <Link
            to="/dashboard/repos/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all font-medium shadow-clay-sm hover:shadow-clay"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Import Repository
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {repos.map((repo, index) => (
            <div key={repo.id} style={{ animationDelay: `${index * 60}ms` }} className="animate-slide-up">
              <RepoCard repo={repo} onDelete={handleDelete} onParse={handleParse} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
