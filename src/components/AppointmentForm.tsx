'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Appointment } from '@/types';

export function AppointmentForm({ appointment }: { appointment?: Partial<Appointment> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!appointment?.id;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const dateTimeLocal = form.get('dateTime') as string;

    const body = {
      title: form.get('title') as string,
      dateTime: new Date(dateTimeLocal).toISOString(),
      providerName: (form.get('providerName') as string) || null,
      location: (form.get('location') as string) || null,
      notes: (form.get('notes') as string) || null,
    };

    const url = isEditing ? `/api/appointments/${appointment.id}` : '/api/appointments';
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

    router.push('/dashboard/appointments');
    router.refresh();
  }

  function getDefaultDateTime() {
    if (appointment?.date_time) {
      return appointment.date_time.slice(0, 16);
    }
    return '';
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Rubrik</label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={appointment?.title || ''}
          required
          maxLength={200}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700 mb-1">Datum och tid</label>
        <input
          type="datetime-local"
          id="dateTime"
          name="dateTime"
          defaultValue={getDefaultDateTime()}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="providerName" className="block text-sm font-medium text-gray-700 mb-1">Vårdgivare</label>
          <input
            type="text"
            id="providerName"
            name="providerName"
            defaultValue={appointment?.provider_name || ''}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Plats</label>
          <input
            type="text"
            id="location"
            name="location"
            defaultValue={appointment?.location || ''}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Anteckningar</label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={appointment?.notes || ''}
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
        {loading ? 'Sparar...' : isEditing ? 'Uppdatera' : 'Boka'}
      </button>
    </form>
  );
}
