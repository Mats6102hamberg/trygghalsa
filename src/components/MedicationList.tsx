'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Medication } from '@/types';

export function MedicationList({ initialMedications }: { initialMedications: Medication[] }) {
  const router = useRouter();
  const [showStopped, setShowStopped] = useState(false);

  const active = initialMedications.filter((m) => m.is_active);
  const stopped = initialMedications.filter((m) => !m.is_active);

  async function handleStop(id: string) {
    if (!confirm('Vill du stoppa detta läkemedel?')) return;

    const res = await fetch(`/api/medications/${id}/stop`, { method: 'POST' });
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      {active.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-500">Inga aktiva mediciner.</p>
          <Link href="/dashboard/medications/new" className="mt-2 inline-block text-blue-600 hover:underline">
            Lägg till medicin
          </Link>
        </div>
      )}

      {active.map((med) => (
        <div key={med.id} className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{med.name}</h3>
              <div className="mt-1 text-sm text-gray-600">
                {med.dosage && <span>{med.dosage}</span>}
                {med.dosage && med.frequency && <span> &middot; </span>}
                {med.frequency && <span>{med.frequency}</span>}
              </div>
              {med.reminder_time && (
                <p className="mt-1 text-xs text-gray-400">Påminnelse: {med.reminder_time}</p>
              )}
              {med.notes && (
                <p className="mt-1 text-sm text-gray-500">{med.notes}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Link
                href={`/dashboard/medications/${med.id}`}
                className="text-sm text-blue-600 hover:underline"
              >
                Redigera
              </Link>
              <button
                onClick={() => handleStop(med.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Stoppa
              </button>
            </div>
          </div>
        </div>
      ))}

      {stopped.length > 0 && (
        <div>
          <button
            onClick={() => setShowStopped(!showStopped)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {showStopped ? 'Dölj' : 'Visa'} stoppade ({stopped.length})
          </button>

          {showStopped && (
            <div className="mt-3 space-y-2">
              {stopped.map((med) => (
                <div key={med.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3 opacity-60">
                  <span className="font-medium text-gray-700">{med.name}</span>
                  {med.end_date && (
                    <span className="ml-2 text-xs text-gray-400">Stoppad {med.end_date}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
