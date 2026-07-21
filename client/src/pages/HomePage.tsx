import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/layout/Header';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-clay dark:bg-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-clay dark:text-white mb-6">
            codebase<span className="gradient-text">.ai</span>
          </h1>
          <p className="text-xl text-clay-secondary dark:text-slate-400 mb-8">
            Understand your codebase with AI. Import any repository and get instant
            explanations, documentation, security reviews, and optimization suggestions.
          </p>
          <div className="flex gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-8 py-3 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all font-medium shadow-clay-sm hover:shadow-clay"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-3 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all font-medium shadow-clay-sm hover:shadow-clay"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3 border-2 border-clay dark:border-slate-600 text-clay dark:text-slate-300 rounded-2xl hover:bg-clay-surface dark:hover:bg-slate-800 transition-all font-medium"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="clay-card p-6 shadow-clay-sm hover:shadow-clay transition-shadow">
            <div className="w-12 h-12 bg-primary-500/20 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-500 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-clay dark:text-white mb-2">Code Understanding</h3>
            <p className="text-clay-secondary dark:text-slate-400">
              Ask questions about your codebase and get instant, accurate answers with code references.
            </p>
          </div>

          <div className="clay-card p-6 shadow-clay-sm hover:shadow-clay transition-shadow">
            <div className="w-12 h-12 bg-secondary-500/20 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-secondary-500 dark:text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-clay dark:text-white mb-2">Security Review</h3>
            <p className="text-clay-secondary dark:text-slate-400">
              Identify security vulnerabilities, hardcoded secrets, and get actionable fix recommendations.
            </p>
          </div>

          <div className="clay-card p-6 shadow-clay-sm hover:shadow-clay transition-shadow">
            <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-clay dark:text-white mb-2">Optimization</h3>
            <p className="text-clay-secondary dark:text-slate-400">
              Find performance bottlenecks, duplicate code, and get optimization suggestions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
