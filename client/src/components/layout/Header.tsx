import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  children?: ReactNode;
}

export default function Header({ children }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 dark:border-slate-800/80 bg-slate-900/70 backdrop-blur-xl dark:bg-slate-900/70 light:bg-white/70">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-clay-sm dark:shadow-clay-sm group-hover:shadow-clay transition-shadow duration-300">
              <span className="text-white font-bold text-xs tracking-tight">C</span>
            </div>
            <span className="font-semibold text-white dark:text-white light:text-slate-800 hidden sm:block">
              codebase<span className="gradient-text">.ai</span>
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white light:text-slate-500 light:hover:text-slate-700 transition-all bg-slate-800/50 dark:bg-slate-800/50 light:bg-slate-200/50 hover:shadow-clay-sm"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white light:text-slate-500 light:hover:text-slate-700 transition-colors text-sm font-medium"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-3 pl-3 border-l border-slate-700/50 dark:border-slate-700/50 light:border-slate-300/50">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-xs font-bold shadow-clay-sm">
                    {user?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-white dark:text-white light:text-slate-800 font-medium leading-tight">{user?.name}</span>
                    <button
                      onClick={() => logout()}
                      className="text-[11px] text-slate-500 hover:text-red-400 dark:text-slate-500 dark:hover:text-red-400 light:text-slate-400 light:hover:text-red-500 transition-colors text-left leading-tight"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white light:text-slate-500 light:hover:text-slate-700 transition-colors text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all text-sm font-medium shadow-clay-sm hover:shadow-clay"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
      {children}
    </header>
  );
}
