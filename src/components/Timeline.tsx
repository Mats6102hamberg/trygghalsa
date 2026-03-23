'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Event } from '@/types';

const typeLabels: Record<string, string> = {
  visit: 'Besök',
  diagnosis: 'Diagnos',
  medication: 'Läkemedel',
  test: 'Prov/Test',
  vaccine: 'Vaccin',
  note: 'Anteckning',
};

export default function Timeline({ initialEvents }: { initialEvents?: Event[] }) {
  const [events, setEvents] = useState<Event[]>(initialEvents ?? []);
  const [loading, setLoading] = useState(!initialEvents);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialEvents) return;

    const controller = new AbortController();

    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/events', {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error('Kunde inte hämta tidslinjen.');
        }

        const data = await res.json();
        setEvents(data);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError(err instanceof Error ? err.message : 'Något gick fel.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadEvents();

    return () => controller.abort();
  }, [initialEvents]);

  if (loading) {
    return <div className="rounded-xl border bg-white p-4">Laddar tidslinje...</div>;
  }

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>;
  }

  if (events.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-4">
        <h2 className="text-lg font-semibold">Medicinsk tidslinje</h2>
        <p className="mt-2 text-sm text-gray-600">
          Inga händelser ännu. Lägg till ditt första vårdbesök, läkemedel eller provsvar.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-4">
      <h2 className="mb-4 text-lg font-semibold">Medicinsk tidslinje</h2>

      <div className="space-y-5">
        {events.map((event) => (
          <div key={event.id} className="border-l-4 border-blue-500 pl-4">
            <div className="text-sm text-gray-500">
              {event.date} {'\u2022'} {typeLabels[event.type] ?? event.type}
            </div>

            <Link href={`/dashboard/events/${event.id}`}>
              <h3 className="mt-1 font-bold text-gray-900 hover:text-blue-600">{event.title}</h3>
            </Link>

            {event.description && (
              <p className="mt-1 text-sm text-gray-700">{event.description}</p>
            )}

            {(event.provider_name || event.location) && (
              <p className="mt-1 text-xs text-gray-500">
                {event.provider_name ? `Vårdgivare: ${event.provider_name}` : ''}
                {event.provider_name && event.location ? ' \u2022 ' : ''}
                {event.location ? `Plats: ${event.location}` : ''}
              </p>
            )}

            {event.tags.length > 0 && (
              <div className="mt-1 flex gap-1.5">
                {event.tags.map((tag) => (
                  <span key={tag} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
