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
    <aside className="w-56 min-h-[calc(100vh-3rem)] bg-clay-surface dark:bg-[#252526] border-r border-clay dark:border-[#3c3c3c]">
      <nav className="p-2 space-y-0.5">
        {navigation.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-sm ${
                active
                  ? 'bg-[#007acc]/10 text-[#007acc] dark:text-[#007acc]'
                  : 'text-clay-secondary dark:text-[#969696] hover:text-clay dark:hover:text-[#cccccc] hover:bg-clay-elevated dark:hover:bg-[#2a2d2e]'
              }`}
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={active ? 2.5 : 2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={item.icon}
                />
              </svg>
              <span className={active ? 'font-medium' : ''}>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
