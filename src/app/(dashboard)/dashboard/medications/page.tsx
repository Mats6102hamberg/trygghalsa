'use client';

import { useEffect, useState } from 'react';
import MedicationCard from '@/components/MedicationCard';
import type { MedicationWithStatus } from '@/types';

export default function MedicationsPage() {
  const [medications, setMedications] = useState<MedicationWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMedications = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/medications/today');

      if (!res.ok) {
        throw new Error('Kunde inte hämta mediciner.');
      }

      const data = await res.json();
      setMedications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedications();
  }, []);

  const handleTaken = async (
    medicationId: string,
    scheduledTime: string | null
  ) => {
    const timeKey = scheduledTime ?? '__no_time__';

    // Optimistic update
    setMedications((prev) =>
      prev.map((m) =>
        m.id === medicationId
          ? { ...m, takenTodayTimes: [...m.takenTodayTimes, timeKey] }
          : m
      )
    );

    try {
      setSavingId(`${medicationId}-${scheduledTime ?? 'no-time'}`);
      setError(null);

      const res = await fetch('/api/medications/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medication_id: medicationId, scheduled_time: scheduledTime }),
      });

      // 202 = queued by service worker for later sync
      if (res.status === 202) {
        return;
      }

      if (!res.ok) {
        throw new Error('Kunde inte spara medicinintag.');
      }

      await loadMedications();
    } catch (err) {
      // Revert optimistic update
      setMedications((prev) =>
        prev.map((m) =>
          m.id === medicationId
            ? {
                ...m,
                takenTodayTimes: m.takenTodayTimes.filter(
                  (t, i, arr) => !(t === timeKey && i === arr.lastIndexOf(timeKey))
                ),
              }
            : m
        )
      );
      setError(err instanceof Error ? err.message : 'Något gick fel.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Mina mediciner</h1>
          <p className="mt-2 text-gray-600">
            Här ser du dina mediciner för idag.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border bg-white p-6">Laddar mediciner...</div>
        ) : medications.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6">
            Inga aktiva mediciner ännu.
          </div>
        ) : (
          medications.map((medication) => (
            <div
              key={medication.id}
              className={savingId?.startsWith(medication.id) ? 'opacity-70' : ''}
            >
              <MedicationCard
                medication={medication}
                onTaken={handleTaken}
              />
            </div>
          ))
        )}
      </div>
    </main>
  );
}
