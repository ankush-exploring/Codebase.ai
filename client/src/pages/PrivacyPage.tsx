import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import Header from '../components/layout/Header';

export default function PrivacyPage() {
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
        <h1 className="text-2xl font-bold text-clay dark:text-[#cccccc] mb-6">Privacy Policy</h1>
        <div className="clay-card p-6 shadow-clay-sm space-y-4 text-sm leading-relaxed">
          <p className="text-clay dark:text-[#cccccc]">
            Your privacy matters to us. This policy explains how codebase.ai handles your data.
          </p>
          <h2 className="text-base font-semibold text-clay dark:text-[#cccccc] mt-6">1. Data We Collect</h2>
          <p className="text-clay-secondary dark:text-[#969696]">
            We collect information you provide when creating an account (name, email) and code repositories
            you upload for analysis. We also collect basic usage data such as page views and feature interactions.
          </p>
          <h2 className="text-base font-semibold text-clay dark:text-[#cccccc] mt-6">2. How We Use Data</h2>
          <p className="text-clay-secondary dark:text-[#969696]">
            Your code is used solely to provide the analysis features you request. We do not train AI models
            on your code, sell your data, or share it with third parties except as required by law.
          </p>
          <h2 className="text-base font-semibold text-clay dark:text-[#cccccc] mt-6">3. Data Storage</h2>
          <p className="text-clay-secondary dark:text-[#969696]">
            Your data is stored securely on our servers. We retain your data for as long as your account is
            active. You can request deletion of your data at any time by contacting us.
          </p>
          <h2 className="text-base font-semibold text-clay dark:text-[#cccccc] mt-6">4. Third-Party Services</h2>
          <p className="text-clay-secondary dark:text-[#969696]">
            We use third-party AI providers (OpenAI/Gemini) to process analysis requests. Code sent to these
            providers is handled according to their privacy policies and is not used for training.
          </p>
          <h2 className="text-base font-semibold text-clay dark:text-[#cccccc] mt-6">5. Your Rights</h2>
          <p className="text-clay-secondary dark:text-[#969696]">
            You have the right to access, correct, or delete your data at any time. To exercise these rights,
            email us at fromthepoint0210@gmail.com.
          </p>
          <p className="text-clay-muted dark:text-[#666666] text-xs mt-6">Last updated: July 2026</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
