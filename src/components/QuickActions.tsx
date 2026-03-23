'use client';

import Link from 'next/link';

const actions = [
  { href: '/dashboard/medications', emoji: '\uD83D\uDC8A', label: 'Mina mediciner' },
  { href: '/dashboard', emoji: '\u2764\uFE0F', label: 'Min hälsa' },
  { href: '/dashboard/appointments', emoji: '\uD83D\uDCC5', label: 'Nästa besök' },
  { href: '/dashboard/questions', emoji: '\uD83C\uDD98', label: 'Hjälp' },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {actions.map((action) => (
        <Link
          key={action.href + action.label}
          href={action.href}
          className="p-4 bg-white rounded-2xl shadow text-left hover:shadow-md transition-shadow"
        >
          <span className="text-2xl">{action.emoji}</span>
          <div className="font-bold mt-2">{action.label}</div>
        </Link>
      ))}
    </div>
  );
}
