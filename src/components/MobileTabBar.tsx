'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/dashboard', label: 'Hem', icon: '🏠' },
  { href: '/dashboard/medications', label: 'Mediciner', icon: '💊' },
  { href: '/dashboard/questions', label: 'Frågor', icon: '🧠' },
  { href: '/dashboard/help', label: 'Hjälp', icon: '🆘' },
  { href: '/dashboard/settings', label: 'Mer', icon: '⚙️' },
];

export function MobileTabBar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white sm:hidden">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition ${
                active ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className={active ? 'font-semibold' : ''}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
