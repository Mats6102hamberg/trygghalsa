'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Medication } from '@/types';

const frequencies = [
  { value: '1x dagligen', label: '1x dagligen' },
  { value: '2x dagligen', label: '2x dagligen' },
  { value: '3x dagligen', label: '3x dagligen' },
  { value: 'vid behov', label: 'Vid behov' },
];

export function MedicationForm({ medication }: { medication?: Partial<Medication> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!medication?.id;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(e.currentTarget);

    const body = {
      name: form.get('name') as string,
      dosage: (form.get('dosage') as string) || null,
      frequency: (form.get('frequency') as string) || null,
      startDate: form.get('startDate') as string,
      notes: (form.get('notes') as string) || null,
      reminderTime: (form.get('reminderTime') as string) || null,
    };

    const url = isEditing ? `/api/medications/${medication.id}` : '/api/medications';
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Något gick fel');
      setLoading(false);
      return;
    }

    router.push('/dashboard/medications');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Läkemedel</label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={medication?.name || ''}
          required
          maxLength={200}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-1">Dosering</label>
          <input
            type="text"
            id="dosage"
            name="dosage"
            defaultValue={medication?.dosage || ''}
            placeholder="t.ex. 10 mg"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">Frekvens</label>
          <select
            id="frequency"
            name="frequency"
            defaultValue={medication?.frequency || ''}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Välj...</option>
            {frequencies.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Startdatum</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            defaultValue={medication?.start_date || new Date().toISOString().slice(0, 10)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700 mb-1">Påminnelse</label>
          <input
            type="time"
            id="reminderTime"
            name="reminderTime"
            defaultValue={medication?.reminder_time || ''}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Anteckningar</label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={medication?.notes || ''}
          rows={3}
          maxLength={2000}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Sparar...' : isEditing ? 'Uppdatera' : 'Spara'}
      </button>
    </form>
  );
}
