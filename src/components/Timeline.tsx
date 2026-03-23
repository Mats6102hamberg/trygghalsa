'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

interface TimelineEvent {
  id: string;
  date: string;
  type: string;
  title: string;
  description?: string | null;
  providerName?: string | null;
  location?: string | null;
  tags: string[];
}

const typeLabels: Record<string, string> = {
  visit: 'Besök',
  diagnosis: 'Diagnos',
  medication: 'Medicinering',
  test: 'Provtagning',
  vaccine: 'Vaccination',
};

const typeColors: Record<string, string> = {
  visit: 'bg-blue-100 text-blue-800',
  diagnosis: 'bg-red-100 text-red-800',
  medication: 'bg-green-100 text-green-800',
  test: 'bg-yellow-100 text-yellow-800',
  vaccine: 'bg-purple-100 text-purple-800',
};

export function Timeline({ initialEvents }: { initialEvents?: TimelineEvent[] }) {
  const [events, setEvents] = useState<TimelineEvent[]>(initialEvents ?? []);
  const [loading, setLoading] = useState(!initialEvents);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialEvents) return;

    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/events');
        if (!res.ok) throw new Error('Kunde inte hämta händelser.');
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Något gick fel.');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
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
        <Link
          key={event.id}
          href={`/dashboard/events/${event.id}`}
          className="block rounded-lg border border-gray-200 bg-white p-5 hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[event.type] || 'bg-gray-100 text-gray-800'}`}>
                  {typeLabels[event.type] || event.type}
                </span>
                {event.providerName && (
                  <span className="text-sm text-gray-500">{event.providerName}</span>
                )}
                {event.location && (
                  <span className="text-sm text-gray-400">{event.location}</span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900">{event.title}</h3>
              {event.description && (
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">{event.description}</p>
              )}
              {event.tags.length > 0 && (
                <div className="mt-2 flex gap-1.5">
                  {event.tags.map((tag) => (
                    <span key={tag} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <time className="shrink-0 text-sm text-gray-500">
              {format(new Date(event.date), 'yyyy-MM-dd')}
            </time>
          </div>
        </Link>
      ))}
    </div>
  );
}
