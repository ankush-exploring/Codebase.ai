import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import Header from '../components/layout/Header';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-clay dark:bg-[#1e1e1e] flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-clay-secondary dark:text-[#969696] hover:text-[#007acc] mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
        <h1 className="text-2xl font-bold text-clay dark:text-[#cccccc] mb-6">Terms of Service</h1>
        <div className="clay-card p-6 shadow-clay-sm space-y-4 text-sm text-clay dark:text-[#cccccc] leading-relaxed">
          <p>
            By using codebase.ai, you agree to these terms. If you do not agree, do not use the service.
          </p>
          <h2 className="text-base font-semibold text-clay dark:text-[#cccccc] mt-6">1. Use of Service</h2>
          <p className="text-clay-secondary dark:text-[#969696]">
            codebase.ai provides AI-powered code analysis tools. You may use the service only for lawful purposes
            and in compliance with all applicable laws. You must not misuse or abuse the service in any way.
          </p>
          <h2 className="text-base font-semibold text-clay dark:text-[#cccccc] mt-6">2. User Accounts</h2>
          <p className="text-clay-secondary dark:text-[#969696]">
            You are responsible for maintaining the confidentiality of your account credentials. You must notify
            us immediately of any unauthorized use of your account. We are not liable for any loss arising from
            unauthorized access.
          </p>
          <h2 className="text-base font-semibold text-clay dark:text-[#cccccc] mt-6">3. Intellectual Property</h2>
          <p className="text-clay-secondary dark:text-[#969696]">
            The service, including its code, design, and content, is owned by codebase.ai. You retain ownership
            of any code you upload. We do not claim any rights over your code repositories.
          </p>
          <h2 className="text-base font-semibold text-clay dark:text-[#cccccc] mt-6">4. Limitation of Liability</h2>
          <p className="text-clay-secondary dark:text-[#969696]">
            codebase.ai is provided "as is" without warranties of any kind. We are not responsible for any damages
            arising from the use of the service, including but not limited to data loss or security issues.
          </p>
          <h2 className="text-base font-semibold text-clay dark:text-[#cccccc] mt-6">5. Changes</h2>
          <p className="text-clay-secondary dark:text-[#969696]">
            We reserve the right to modify these terms at any time. Continued use of the service after changes
            constitutes acceptance of the new terms.
          </p>
          <p className="text-clay-muted dark:text-[#666666] text-xs mt-6">Last updated: July 2026</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
