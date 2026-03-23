'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface TodayData {
  medications: { id: string; name: string; dosage: string | null; reminder_time: string | null }[];
  appointments: { id: string; title: string; date_time: string; provider_name: string | null }[];
  questions: { id: string; text: string }[];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 10) return 'God morgon';
  if (hour < 17) return 'Hej';
  return 'God kväll';
}

export function ImportantToday({ userName }: { userName?: string }) {
  const [data, setData] = useState<TodayData | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/dashboard/today', { signal: controller.signal })
      .then((res) => res.json())
      .then(setData)
      .catch(() => {});

    return () => controller.abort();
  }, []);

  const today = format(new Date(), 'EEEE d MMMM', { locale: sv });
  const greeting = getGreeting();
  const displayName = userName || 'du';

  const items: string[] = [];

  if (data) {
    for (const med of data.medications) {
      const time = med.reminder_time ? ` kl ${med.reminder_time}` : '';
      items.push(`Ta ${med.name}${med.dosage ? ` ${med.dosage}` : ''}${time}`);
    }

    for (const apt of data.appointments) {
      const day = format(new Date(apt.date_time), 'EEEE', { locale: sv });
      const time = format(new Date(apt.date_time), 'HH:mm');
      items.push(`${apt.title} på ${day} kl ${time}`);
    }

    for (const q of data.questions) {
      items.push(`Kom ihåg fråga om ${q.text.toLowerCase()}`);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <h2 className="text-lg font-bold">{greeting} {displayName} &#10084;&#65039;</h2>
      <p className="text-sm text-gray-600 mt-1">Idag är det {today}</p>

      {items.length > 0 ? (
        <div className="mt-4 space-y-2 text-sm">
          {items.map((item, i) => (
            <p key={i}>&bull; {item}</p>
          ))}
        </div>
      ) : data ? (
        <p className="mt-4 text-sm text-gray-500">Allt ser bra ut idag &#128155;</p>
      ) : null}
    </div>
  );
}
