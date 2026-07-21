import { Link, useLocation } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', exact: true, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'Repositories', href: '/dashboard/repos', exact: false, icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
  { name: 'Chat', href: '/dashboard/chat', exact: false, icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { name: 'Settings', href: '/dashboard/settings', exact: false, icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

export default function Sidebar() {
  const location = useLocation();

  function isActive(href: string, exact: boolean) {
    return exact ? location.pathname === href : location.pathname.startsWith(href);
  }

  return (
    <aside className="w-64 min-h-[calc(100vh-4rem)] bg-clay-surface dark:bg-slate-900/50 border-r border-clay dark:border-slate-800/80">
      <nav className="p-4 space-y-1">
        {navigation.map((item, index) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.name}
              to={item.href}
              style={{ animationDelay: `${index * 50}ms` }}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 animate-slide-in-left group ${
                active
                  ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/10 text-primary-600 dark:text-primary-400 shadow-clay-sm dark:shadow-glow-sm'
                  : 'text-clay-secondary dark:text-slate-400 hover:text-clay dark:hover:text-white hover:bg-clay-elevated dark:hover:bg-slate-800/60'
              }`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-primary-400 to-secondary-400 rounded-r-full" />
              )}
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={active ? 2.5 : 2}
                  d={item.icon}
                />
              </svg>
              <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
