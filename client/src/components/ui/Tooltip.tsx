import { ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: string;
  side?: 'top' | 'bottom';
}

export default function Tooltip({ children, content, side = 'top' }: TooltipProps) {
  const pos = side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';
  return (
    <div className="relative group inline-flex">
      {children}
      <div
        className={`absolute ${pos} left-1/2 -translate-x-1/2 px-2 py-1 bg-clay dark:bg-slate-700 text-clay-text dark:text-white text-xs rounded-2xl shadow-clay-sm
          opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50`}
      >
        {content}
      </div>
    </div>
  );
}
