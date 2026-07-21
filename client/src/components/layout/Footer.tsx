import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-clay dark:border-[#3c3c3c] bg-clay-surface dark:bg-[#252526]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-[#007acc] to-[#4fc3f7] rounded-xl flex items-center justify-center shadow-clay-sm group-hover:shadow-clay transition-shadow">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l-6-6 6-6" />
                <path d="M15 6l6 6-6 6" />
              </svg>
            </div>
            <span className="font-semibold text-clay dark:text-[#cccccc]">codebase<span className="gradient-text">.ai</span></span>
          </Link>

          <div className="flex items-center gap-6 text-sm">
            <Link to="/terms" className="text-clay-secondary dark:text-[#969696] hover:text-[#007acc] dark:hover:text-[#007acc] transition-colors">Terms</Link>
            <Link to="/privacy" className="text-clay-secondary dark:text-[#969696] hover:text-[#007acc] dark:hover:text-[#007acc] transition-colors">Privacy</Link>
            <Link to="/license" className="text-clay-secondary dark:text-[#969696] hover:text-[#007acc] dark:hover:text-[#007acc] transition-colors">License</Link>
          </div>

          <div className="flex items-center gap-4">
            <a href="mailto:fromthepoint0210@gmail.com" className="text-clay-secondary dark:text-[#969696] hover:text-[#007acc] dark:hover:text-[#007acc] transition-colors text-sm">
              fromthepoint0210@gmail.com
            </a>
            <a href="https://www.linkedin.com/in/ankush-vishwakarma-b48b1036b/" target="_blank" rel="noopener noreferrer" className="text-clay-secondary dark:text-[#969696] hover:text-[#007acc] dark:hover:text-[#007acc] transition-colors" aria-label="LinkedIn profile">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-clay dark:border-[#3c3c3c] text-center">
          <p className="text-xs text-clay-muted dark:text-[#666666]">&copy; {new Date().getFullYear()} codebase.ai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
