'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import type { HomeScreenSettings, HomeScreenButton } from '@/types';

interface TodayData {
  medications: { id: string; name: string; dosage: string | null; reminder_time: string | null }[];
  appointments: { id: string; title: string; date_time: string; provider_name: string | null }[];
  questions: { id: string; text: string }[];
}

const buttonMeta: Record<string, { emoji: string; href: string; description: string }> = {
  medications: { emoji: '\uD83D\uDC8A', href: '/dashboard/medications', description: 'Se dina mediciner' },
  health: { emoji: '\u2764\uFE0F', href: '/dashboard/health', description: 'Se din hälsa' },
  appointments: { emoji: '\uD83D\uDCC5', href: '/dashboard/appointments', description: 'Se nästa besök' },
  help: { emoji: '\uD83C\uDD98', href: '/dashboard/help', description: 'Få hjälp snabbt' },
  questions: { emoji: '\uD83E\uDDE0', href: '/dashboard/questions', description: 'Se frågor till läkaren' },
  timeline: { emoji: '\uD83D\uDCD6', href: '/dashboard/timeline', description: 'Se vad som hänt tidigare' },
  contact_family: { emoji: '\uD83D\uDCDE', href: '/dashboard/caregiver', description: 'Kontakta anhörig' },
};

const maxButtonsByLevel: Record<string, number> = {
  very_simple: 3,
  simple: 4,
  expanded: 6,
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 10) return 'God morgon';
  if (hour < 17) return 'Hej';
  return 'God kväll';
}

export default function HomeDashboard() {
  const [settings, setSettings] = useState<HomeScreenSettings | null>(null);
  const [todayData, setTodayData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [settingsRes, todayRes] = await Promise.all([
          fetch('/api/settings/home', { signal: controller.signal }),
          fetch('/api/dashboard/today', { signal: controller.signal }),
        ]);

        if (!settingsRes.ok || !todayRes.ok) {
          throw new Error('Kunde inte hämta startsidan.');
        }

        const [settingsData, todayResult] = await Promise.all([
          settingsRes.json(),
          todayRes.json(),
        ]);

        setSettings(settingsData);
        setTodayData(todayResult);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError(err instanceof Error ? err.message : 'Något gick fel.');
        }
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => controller.abort();
  }, []);

  const visibleButtons = useMemo(() => {
    if (!settings) return [];

    const sortedVisible = [...settings.buttons]
      .filter((button) => button.is_visible === true)
      .sort((a, b) => a.sort_order - b.sort_order);

    const max = maxButtonsByLevel[settings.simplicity_level] ?? 4;

    return sortedVisible.slice(0, max);
  }, [settings]);

  const todayItems = useMemo(() => {
    if (!todayData) return [];
    const items: string[] = [];

    for (const med of todayData.medications) {
      const time = med.reminder_time ? ` kl ${med.reminder_time}` : '';
      items.push(`Ta ${med.name}${med.dosage ? ` ${med.dosage}` : ''}${time}`);
    }

    for (const apt of todayData.appointments) {
      const day = format(new Date(apt.date_time), 'EEEE', { locale: sv });
      const time = format(new Date(apt.date_time), 'HH:mm');
      items.push(`${apt.title} på ${day} kl ${time}`);
    }

    for (const q of todayData.questions) {
      items.push(`Kom ihåg fråga om ${q.text.toLowerCase()}`);
    }

    return items;
  }, [todayData]);

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        Laddar startsidan...
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error ?? 'Kunde inte ladda startsidan.'}
      </div>
    );
  }

  const today = format(new Date(), 'EEEE d MMMM', { locale: sv });
  const greeting = getGreeting();
  const displayName = 'du';

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting} {displayName} {'\u2764\uFE0F'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">Idag är det {today}</p>

        <div className="mt-4 rounded-xl bg-blue-50 p-4">
          <h2 className="text-base font-semibold text-gray-900">Viktigt idag</h2>

          {settings.today_message?.trim() ? (
            <p className="mt-2 text-sm text-gray-700">{settings.today_message}</p>
          ) : todayItems.length > 0 ? (
            <div className="mt-2 space-y-1.5 text-sm text-gray-700">
              {todayItems.map((item, i) => (
                <p key={i}>{'\u2022'} {item}</p>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-500">Allt ser bra ut idag {'\uD83D\uDC9B'}</p>
          )}
        </div>

        {settings.emergency_contact_name && settings.emergency_contact_phone && (
          <a
            href={`tel:${settings.emergency_contact_phone}`}
            className="mt-4 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-4"
          >
            <div>
              <div className="text-sm text-gray-600">Viktig kontakt</div>
              <div className="font-semibold text-gray-900">
                {settings.emergency_contact_name}
              </div>
            </div>
            <div className="text-xl">{'\uD83D\uDCDE'}</div>
          </a>
        )}
      </section>

      <section className="grid grid-cols-2 gap-4">
        {visibleButtons.map((button) => (
          <DashboardButton key={button.id} button={button} />
        ))}
      </section>
    </div>
  );
}

function DashboardButton({ button }: { button: HomeScreenButton }) {
  const meta = buttonMeta[button.button_key];
  if (!meta) return null;

  return (
    <Link
      href={meta.href}
      className="rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow"
    >
      <div className="text-3xl">{meta.emoji}</div>
      <div className="mt-3 text-base font-semibold text-gray-900">{button.label}</div>
      <div className="mt-1 text-sm text-gray-600">{meta.description}</div>
    </Link>
  );
}
