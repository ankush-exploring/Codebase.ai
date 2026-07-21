import { Link } from 'react-router-dom';

interface Crumb {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: Crumb[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-clay-muted dark:text-slate-400 mb-4">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-clay-muted dark:text-slate-600">/</span>}
          {item.to ? (
            <Link to={item.to} className="hover:text-primary-500 dark:hover:text-primary-400 transition-colors">{item.label}</Link>
          ) : (
            <span className="text-clay dark:text-slate-300">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
