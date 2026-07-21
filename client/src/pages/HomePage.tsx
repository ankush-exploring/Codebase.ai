import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-clay dark:bg-[#1e1e1e] flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="w-16 h-16 bg-gradient-to-br from-[#007acc] to-[#4fc3f7] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-clay-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l-6-6 6-6" />
              <path d="M15 6l6 6-6 6" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-clay dark:text-[#cccccc] mb-4">
            codebase<span className="gradient-text">.ai</span>
          </h1>
          <p className="text-base text-clay-secondary dark:text-[#969696] mb-8 max-w-xl mx-auto">
            Understand your codebase with AI. Import any repository and get instant
            explanations, documentation, security reviews, and optimization suggestions.
          </p>
          <div className="flex gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-6 py-2.5 bg-[#007acc] text-white rounded-lg hover:bg-[#006bb3] transition-all text-sm font-medium shadow-clay-sm"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-6 py-2.5 bg-[#007acc] text-white rounded-lg hover:bg-[#006bb3] transition-all text-sm font-medium shadow-clay-sm"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-2.5 border border-clay dark:border-[#3c3c3c] text-clay dark:text-[#cccccc] rounded-lg hover:bg-clay-surface dark:hover:bg-[#2a2d2e] transition-all text-sm font-medium"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-6">
          <div className="clay-card p-5 shadow-clay-sm">
            <div className="w-10 h-10 bg-[#007acc]/10 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-[#007acc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-clay dark:text-[#cccccc] mb-1.5">Code Understanding</h3>
            <p className="text-sm text-clay-secondary dark:text-[#969696]">
              Ask questions about your codebase and get instant, accurate answers with code references.
            </p>
          </div>

          <div className="clay-card p-5 shadow-clay-sm">
            <div className="w-10 h-10 bg-[#4fc3f7]/10 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-[#4fc3f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-clay dark:text-[#cccccc] mb-1.5">Security Review</h3>
            <p className="text-sm text-clay-secondary dark:text-[#969696]">
              Identify security vulnerabilities, hardcoded secrets, and get actionable fix recommendations.
            </p>
          </div>

          <div className="clay-card p-5 shadow-clay-sm">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-clay dark:text-[#cccccc] mb-1.5">Optimization</h3>
            <p className="text-sm text-clay-secondary dark:text-[#969696]">
              Find performance bottlenecks, duplicate code, and get optimization suggestions.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
