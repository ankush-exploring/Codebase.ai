import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import Header from '../components/layout/Header';

export default function LicensePage() {
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
        <h1 className="text-2xl font-bold text-clay dark:text-[#cccccc] mb-6">License</h1>
        <div className="clay-card p-6 shadow-clay-sm space-y-4 text-sm leading-relaxed">
          <p className="text-clay dark:text-[#cccccc]">
            This software is provided under the terms described below.
          </p>
          <h2 className="text-base font-semibold text-clay dark:text-[#cccccc] mt-6">MIT License</h2>
          <p className="text-clay-secondary dark:text-[#969696]">
            Copyright &copy; {new Date().getFullYear()} codebase.ai
          </p>
          <p className="text-clay-secondary dark:text-[#969696]">
            Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
            associated documentation files (the "Software"), to deal in the Software without restriction,
            including without limitation the rights to use, copy, modify, merge, publish, distribute,
            sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
            furnished to do so, subject to the following conditions:
          </p>
          <p className="text-clay-secondary dark:text-[#969696]">
            The above copyright notice and this permission notice shall be included in all copies or
            substantial portions of the Software.
          </p>
          <p className="text-clay-secondary dark:text-[#969696]">
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
            BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
            NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
            DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
            OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
          </p>
          <h2 className="text-base font-semibold text-clay dark:text-[#cccccc] mt-6">Third-Party Licenses</h2>
          <p className="text-clay-secondary dark:text-[#969696]">
            This project uses open-source packages distributed under their own licenses (MIT, Apache 2.0,
            BSD). All dependencies are used in compliance with their respective licenses.
          </p>
          <p className="text-clay-muted dark:text-[#666666] text-xs mt-6">Last updated: July 2026</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
