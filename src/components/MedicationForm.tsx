'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Medication } from '@/types';

export function MedicationForm({ medication }: { medication?: Partial<Medication> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [times, setTimes] = useState<string[]>(medication?.times ?? []);
  const [newTime, setNewTime] = useState('');

  const isEditing = !!medication?.id;

  function addTime() {
    if (newTime && /^\d{2}:\d{2}$/.test(newTime) && !times.includes(newTime)) {
      setTimes([...times, newTime].sort());
      setNewTime('');
    }
  }

  function removeTime(t: string) {
    setTimes(times.filter((x) => x !== t));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(e.currentTarget);

    const body = {
      name: form.get('name') as string,
      dosage: (form.get('dosage') as string) || null,
      instructions: (form.get('instructions') as string) || null,
      times,
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

      <div>
        <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-1">Dosering</label>
        <input
          type="text"
          id="dosage"
          name="dosage"
          defaultValue={medication?.dosage || ''}
          placeholder="t.ex. 500 mg"
          maxLength={100}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">Instruktioner</label>
        <textarea
          id="instructions"
          name="instructions"
          defaultValue={medication?.instructions || ''}
          placeholder="t.ex. Ta med mat"
          rows={2}
          maxLength={500}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tider</label>
        <div className="flex gap-2 mb-2">
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={addTime}
            className="rounded-lg bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
          >
            Lägg till
          </button>
        </div>
        {times.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {times.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm">
                {t}
                <button type="button" onClick={() => removeTime(t)} className="text-gray-400 hover:text-red-500">
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
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
