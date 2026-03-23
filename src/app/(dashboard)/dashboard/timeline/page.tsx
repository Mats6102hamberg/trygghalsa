'use client';

import { useEffect, useState } from 'react';

interface MedicationLogEntry {
  id: string;
  medication_name: string;
  dosage: string | null;
  scheduled_time: string | null;
  taken_at: string;
}

interface EventEntry {
  id: string;
  title: string;
  type: string;
  date: string;
  description: string | null;
}

type TimelineItem =
  | { kind: 'log'; data: MedicationLogEntry }
  | { kind: 'event'; data: EventEntry };

const typeLabels: Record<string, string> = {
  visit: 'Besök',
  diagnosis: 'Diagnos',
  medication: 'Läkemedel',
  test: 'Prov/Test',
  vaccine: 'Vaccin',
  note: 'Anteckning',
};

export default function TimelinePage() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [logsRes, eventsRes] = await Promise.all([
          fetch('/api/medications/log'),
          fetch('/api/events'),
        ]);

        const logs: MedicationLogEntry[] = logsRes.ok ? await logsRes.json() : [];
        const events: EventEntry[] = eventsRes.ok ? await eventsRes.json() : [];

        const combined: TimelineItem[] = [
          ...logs.map((l) => ({ kind: 'log' as const, data: l })),
          ...events.map((e) => ({ kind: 'event' as const, data: e })),
        ];

        combined.sort((a, b) => {
          const dateA = a.kind === 'log' ? a.data.taken_at : a.data.date;
          const dateB = b.kind === 'log' ? b.data.taken_at : b.data.date;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });

        setItems(combined);
      } catch {
        setError('Kunde inte hämta tidslinjen.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('sv-SE', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Tidslinje</h1>
          <p className="mt-2 text-gray-600">Din medicinska historik och medicinintag.</p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="rounded-2xl border bg-white p-6">Laddar...</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6 text-gray-500">
            Ingen historik ännu. Ta dina mediciner eller logga ett vårdbesök så dyker det upp här.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              if (item.kind === 'log') {
                const log = item.data;
                return (
                  <div key={`log-${log.id}`} className="rounded-2xl border bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">💊</span>
                          <span className="font-semibold text-gray-900">{log.medication_name}</span>
                        </div>
                        {log.dosage && <p className="text-sm text-gray-600 ml-7">{log.dosage}</p>}
                        {log.scheduled_time && (
                          <p className="text-xs text-gray-500 ml-7">Planerad tid: {log.scheduled_time}</p>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>{formatDate(log.taken_at)}</div>
                        <div>{formatTime(log.taken_at)}</div>
                      </div>
                    </div>
                  </div>
                );
              } else {
                const event = item.data;
                return (
                  <div key={`event-${event.id}`} className="rounded-2xl border bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📋</span>
                          <span className="font-semibold text-gray-900">{event.title}</span>
                        </div>
                        <p className="text-xs text-gray-500 ml-7">
                          {typeLabels[event.type] ?? event.type}
                        </p>
                        {event.description && (
                          <p className="text-sm text-gray-600 ml-7 mt-1">{event.description}</p>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{formatDate(event.date)}</div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </main>
  );
}
