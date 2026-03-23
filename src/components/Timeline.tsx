'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { Event } from '@/types';

const typeLabels: Record<string, string> = {
  visit: 'Besök',
  diagnosis: 'Diagnos',
  medication: 'Läkemedel',
  test: 'Prov/Test',
  vaccine: 'Vaccin',
  note: 'Anteckning',
};

const typeColors: Record<string, string> = {
  visit: 'bg-blue-100 text-blue-800',
  diagnosis: 'bg-red-100 text-red-800',
  medication: 'bg-green-100 text-green-800',
  test: 'bg-yellow-100 text-yellow-800',
  vaccine: 'bg-purple-100 text-purple-800',
  note: 'bg-gray-100 text-gray-800',
};

export function Timeline({ initialEvents }: { initialEvents?: Event[] }) {
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
        if (!res.ok) throw new Error('Kunde inte hämta händelser.');
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
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        Laddar tidslinje...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">Inga händelser ännu.</p>
        <Link href="/dashboard/events/new" className="mt-4 inline-block text-blue-600 hover:underline">
          Skapa din första händelse
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="border-l-4 border-blue-500 pl-4">
          <div className="text-sm text-gray-500">
            {format(new Date(event.date), 'yyyy-MM-dd')} {'\u2022'} {typeLabels[event.type] ?? event.type}
          </div>
          <Link href={`/dashboard/events/${event.id}`}>
            <h3 className="font-bold text-gray-900 hover:text-blue-600">{event.title}</h3>
          </Link>
          {event.description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{event.description}</p>
          )}
          {event.provider_name && (
            <span className="text-xs text-gray-400">{event.provider_name}</span>
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
  );
}
