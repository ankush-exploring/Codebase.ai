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
    <header className="sticky top-0 z-40 w-full border-b border-clay dark:border-[#3c3c3c] bg-clay-surface/80 dark:bg-[#252526]/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-12 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-gradient-to-br from-[#007acc] to-[#4fc3f7] rounded-lg flex items-center justify-center shadow-clay-sm group-hover:shadow-clay transition-shadow">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l-6-6 6-6" />
                <path d="M15 6l6 6-6 6" />
              </svg>
            </div>
            <span className="font-semibold text-sm text-clay dark:text-[#cccccc] hidden sm:block">
              codebase<span className="gradient-text">.ai</span>
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-clay-secondary dark:text-[#969696] hover:text-clay dark:hover:text-[#cccccc] hover:bg-clay-elevated dark:hover:bg-[#2a2d2e] transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-xs text-clay-secondary dark:text-[#969696] hover:text-clay dark:hover:text-[#cccccc] transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 pl-2 border-l border-clay dark:border-[#3c3c3c]">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007acc] to-[#4fc3f7] flex items-center justify-center text-white text-[10px] font-bold shadow-clay-sm">
                    {user?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-clay dark:text-[#cccccc] font-medium leading-tight">{user?.name}</span>
                    <button
                      onClick={() => logout()}
                      className="text-[10px] text-clay-muted dark:text-[#666666] hover:text-red-400 transition-colors text-left leading-tight"
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
                  className="text-xs text-clay-secondary dark:text-[#969696] hover:text-clay dark:hover:text-[#cccccc] transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 bg-[#007acc] text-white rounded-lg hover:bg-[#006bb3] transition-all text-xs font-medium shadow-clay-sm"
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
