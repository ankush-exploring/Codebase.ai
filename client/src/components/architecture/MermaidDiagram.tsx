import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { useTheme } from '../../contexts/ThemeContext';

interface MermaidDiagramProps {
  code: string;
  className?: string;
}

export default function MermaidDiagram({ code, className = '' }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2, 10)}`);
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  useEffect(() => {
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
  }, [isDark]);

  useEffect(() => {
    if (!containerRef.current || !code) return;
    let cancelled = false;

    const render = async () => {
      try {
        const { svg } = await mermaid.render(idRef.current, code);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = `<pre class="text-red-400 text-xs p-4 overflow-auto">${code}</pre>`;
        }
      }
    };

    render();
    return () => { cancelled = true; };
  }, [code, isDark]);

  return (
    <div className={`overflow-auto rounded-2xl border border-clay p-4 bg-clay-surface ${className}`}>
      <div ref={containerRef} className="flex justify-center min-h-[200px]" />
    </div>
  );
}
