import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from '../../contexts/ThemeContext';

interface MermaidDiagramProps {
  code: string;
  className?: string;
}

let initialized = false;

export default function MermaidDiagram({ code, className = '' }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [error, setError] = useState('');
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!initialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'base',
        themeVariables: isDark ? {
          primaryColor: '#292524',
          primaryTextColor: '#e7e5e4',
          primaryBorderColor: '#57534e',
          lineColor: '#a8a29e',
          secondaryColor: '#44403c',
          tertiaryColor: '#1c1917',
          fontFamily: 'monospace',
        } : {
          primaryColor: '#f5f0eb',
          primaryTextColor: '#5e4535',
          primaryBorderColor: '#dcc9b4',
          lineColor: '#8c6547',
          secondaryColor: '#ede3d8',
          tertiaryColor: '#faf8f6',
          fontFamily: 'monospace',
        },
      });
      initialized = true;
    }
  }, [isDark]);

  useEffect(() => {
    if (!containerRef.current || !code) return;
    setError('');
    let cancelled = false;

    const render = async () => {
      const id = `m-${Math.random().toString(36).slice(2, 10)}`;
      try {
        const { svg } = await mermaid.render(id, code);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Render failed';
          setError(msg);
        }
      }
    };

    render();
    return () => { cancelled = true; };
  }, [code]);

  if (error) {
    return (
      <div className={`overflow-auto rounded-2xl border border-red-500/30 p-4 bg-clay-surface ${className}`}>
        <p className="text-red-400 text-xs mb-2">Mermaid Syntax Error:</p>
        <pre className="text-red-400 text-xs p-4 overflow-auto whitespace-pre-wrap">{code}</pre>
      </div>
    );
  }

  return (
    <div className={`overflow-auto rounded-2xl border border-clay p-4 bg-clay-surface ${className}`}>
      <div ref={containerRef} className="flex justify-center min-h-[200px]" />
    </div>
  );
}
