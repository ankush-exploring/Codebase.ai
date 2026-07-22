import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/ui/Button';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-clay dark:text-[#cccccc] mb-6">Settings</h1>

      <div className="space-y-4">
        <div className="clay-card p-5 shadow-clay-sm">
          <h2 className="text-base font-semibold text-clay dark:text-[#cccccc] mb-3">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-clay dark:text-[#cccccc] text-sm font-medium">Theme</p>
              <p className="text-clay-secondary dark:text-[#969696] text-xs">
                {theme === 'dark' ? 'Dark mode' : 'Light mode'}
              </p>
            </div>
            <Button variant="outline" onClick={toggleTheme} className="gap-2 text-sm">
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

        <div className="clay-card p-5 shadow-clay-sm">
          <h2 className="text-base font-semibold text-clay dark:text-[#cccccc] mb-3">Profile</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-clay-secondary dark:text-[#969696] block mb-1">Name</label>
              <div className="px-3 py-2 clay-input rounded-lg text-sm text-clay dark:text-[#cccccc]">
                {user?.name || '—'}
              </div>
            </div>
            <div>
              <label className="text-xs text-clay-secondary dark:text-[#969696] block mb-1">Email</label>
              <div className="px-3 py-2 clay-input rounded-lg text-sm text-clay dark:text-[#cccccc]">
                {user?.email || '—'}
              </div>
            </div>
          </div>
        </div>

        <div className="clay-card p-5 shadow-clay-sm">
          <h2 className="text-base font-semibold text-clay dark:text-[#cccccc] mb-3">AI Provider</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-clay-secondary dark:text-[#969696]">Provider</span>
              <span className="text-clay dark:text-[#cccccc]">Ollama (Free, Local)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-clay-secondary dark:text-[#969696]">Model</span>
              <span className="text-clay dark:text-[#cccccc]">llama3.2:1b</span>
            </div>
            <div className="flex justify-between">
              <span className="text-clay-secondary dark:text-[#969696]">Embedding</span>
              <span className="text-clay dark:text-[#cccccc]">Deterministic (No API Key Needed)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-clay-secondary dark:text-[#969696]">Vector Store</span>
              <span className="text-clay dark:text-[#cccccc]">In-Memory (No Qdrant Needed)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
