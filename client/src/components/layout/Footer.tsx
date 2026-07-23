import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-clay dark:border-[#3c3c3c] bg-clay-surface dark:bg-[#252526]">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
          <Link to="/" className="flex items-center gap-1.5 group font-semibold text-clay dark:text-[#cccccc]">
            <svg className="w-3.5 h-3.5 text-[#007acc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l-6-6 6-6" />
              <path d="M15 6l6 6-6 6" />
            </svg>
            codebase<span className="gradient-text">.ai</span>
          </Link>

          <span className="text-clay-muted dark:text-[#666666]">|</span>

          <Link to="/terms" className="text-clay-secondary dark:text-[#969696] hover:text-[#007acc] transition-colors">Terms</Link>
          <Link to="/privacy" className="text-clay-secondary dark:text-[#969696] hover:text-[#007acc] transition-colors">Privacy</Link>
          <Link to="/license" className="text-clay-secondary dark:text-[#969696] hover:text-[#007acc] transition-colors">License</Link>

          <span className="text-clay-muted dark:text-[#666666]">|</span>

          <a href="mailto:fromthepoint0210@gmail.com" className="text-clay-secondary dark:text-[#969696] hover:text-[#007acc] transition-colors">Help</a>

          <a href="https://www.linkedin.com/in/ankush-vishwakarma-b48b1036b/" target="_blank" rel="noopener noreferrer" className="text-clay-secondary dark:text-[#969696] hover:text-[#007acc] transition-colors" aria-label="LinkedIn">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>

          <span className="text-clay-muted dark:text-[#666666]">|</span>

          <span className="text-clay-muted dark:text-[#666666]">&copy; {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
