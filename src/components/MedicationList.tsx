'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Medication } from '@/types';

export function MedicationList({ initialMedications }: { initialMedications: Medication[] }) {
  const router = useRouter();
  const [showInactive, setShowInactive] = useState(false);

  const active = initialMedications.filter((m) => m.is_active);
  const inactive = initialMedications.filter((m) => !m.is_active);

  async function handleDeactivate(id: string) {
    if (!confirm('Vill du avsluta detta läkemedel?')) return;

    await fetch(`/api/medications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: active.find((m) => m.id === id)?.name, is_active: false }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {active.length === 0 && (
        <p className="text-gray-500">Inga aktiva mediciner.</p>
      )}

      {active.map((med) => (
        <div key={med.id} className="rounded-xl border p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{med.name}</h3>
              {med.dosage && <p className="text-sm text-gray-600">{med.dosage}</p>}
              {med.instructions && <p className="text-sm text-gray-500 mt-1">{med.instructions}</p>}
              {med.times.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">Tider: {med.times.join(', ')}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Link href={`/dashboard/medications/${med.id}`} className="text-sm text-blue-600 hover:underline">
                Redigera
              </Link>
              <button onClick={() => handleDeactivate(med.id)} className="text-sm text-red-600 hover:underline">
                Avsluta
              </button>
            </div>
          </div>
        </div>
      ))}

      {inactive.length > 0 && (
        <button
          onClick={() => setShowInactive(!showInactive)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          {showInactive ? 'Dölj' : 'Visa'} avslutade ({inactive.length})
        </button>
      )}

      {showInactive && inactive.map((med) => (
        <div key={med.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3 opacity-60">
          <span className="font-medium text-gray-700">{med.name}</span>
          {med.dosage && <span className="text-sm text-gray-400 ml-2">{med.dosage}</span>}
        </div>
      ))}
    </div>
  );
}
