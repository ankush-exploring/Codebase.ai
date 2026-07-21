import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/ui/Button';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-clay dark:text-white mb-8">Settings</h1>

      <div className="space-y-6">
        <div className="clay-card p-6 shadow-clay-sm">
          <h2 className="text-lg font-semibold text-clay dark:text-white mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-clay dark:text-white font-medium">Theme</p>
              <p className="text-clay-secondary dark:text-slate-400 text-sm">
                {theme === 'dark' ? 'Dark mode' : 'Light mode'}
              </p>
            </div>
            <Button variant="outline" onClick={toggleTheme} className="gap-2">
              {theme === 'dark' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
          </div>
        </div>

        <div className="clay-card p-6 shadow-clay-sm">
          <h2 className="text-lg font-semibold text-clay dark:text-white mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-clay-secondary dark:text-slate-400 block mb-1">Name</label>
              <div className="px-4 py-2 clay-input rounded-2xl shadow-clay-inset text-clay dark:text-white">
                {user?.name || '—'}
              </div>
            </div>
            <div>
              <label className="text-sm text-clay-secondary dark:text-slate-400 block mb-1">Email</label>
              <div className="px-4 py-2 clay-input rounded-2xl shadow-clay-inset text-clay dark:text-white">
                {user?.email || '—'}
              </div>
            </div>
          </div>
        </div>

        <div className="clay-card p-6 shadow-clay-sm">
          <h2 className="text-lg font-semibold text-clay dark:text-white mb-4">About</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-clay-secondary dark:text-slate-400">Version</span>
              <span className="text-clay dark:text-white">0.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-clay-secondary dark:text-slate-400">AI Model</span>
              <span className="text-clay dark:text-white">GPT-4o Mini</span>
            </div>
            <div className="flex justify-between">
              <span className="text-clay-secondary dark:text-slate-400">Embedding</span>
              <span className="text-clay dark:text-white">text-embedding-3-small</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
