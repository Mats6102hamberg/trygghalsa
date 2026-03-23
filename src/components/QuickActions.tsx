'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface HomeButton {
  button_key: string;
  label: string;
  is_visible: boolean;
  sort_order: number;
  is_primary: boolean;
}

const buttonRoutes: Record<string, string> = {
  medications: '/dashboard/medications',
  health: '/dashboard',
  appointments: '/dashboard/appointments',
  help: '/dashboard/questions',
  questions: '/dashboard/questions',
  timeline: '/dashboard',
  contact_family: '/dashboard/settings',
};

const buttonEmojis: Record<string, string> = {
  medications: '\uD83D\uDC8A',
  health: '\u2764\uFE0F',
  appointments: '\uD83D\uDCC5',
  help: '\uD83C\uDD98',
  questions: '\u2753',
  timeline: '\uD83D\uDCC8',
  contact_family: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67',
};

export function QuickActions() {
  const [buttons, setButtons] = useState<HomeButton[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/settings/home', { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.buttons) {
          setButtons(data.buttons.filter((b: HomeButton) => b.is_visible));
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  if (buttons.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[
          { key: 'medications', label: 'Mina mediciner', emoji: '\uD83D\uDC8A' },
          { key: 'health', label: 'Min hälsa', emoji: '\u2764\uFE0F' },
          { key: 'appointments', label: 'Nästa besök', emoji: '\uD83D\uDCC5' },
          { key: 'help', label: 'Hjälp', emoji: '\uD83C\uDD98' },
        ].map((a) => (
          <Link
            key={a.key}
            href={buttonRoutes[a.key] ?? '/dashboard'}
            className="p-4 bg-white rounded-2xl shadow text-left hover:shadow-md transition-shadow"
          >
            <span className="text-2xl">{a.emoji}</span>
            <div className="font-bold mt-2">{a.label}</div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {buttons.map((btn) => (
        <Link
          key={btn.button_key}
          href={buttonRoutes[btn.button_key] ?? '/dashboard'}
          className={`p-4 bg-white rounded-2xl shadow text-left hover:shadow-md transition-shadow ${
            btn.is_primary ? 'ring-2 ring-blue-100' : ''
          }`}
        >
          <span className="text-2xl">{buttonEmojis[btn.button_key] ?? '\u2B50'}</span>
          <div className="font-bold mt-2">{btn.label}</div>
        </Link>
      ))}
    </div>
  );
}
