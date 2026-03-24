'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Event } from '@/types';

const eventTypes = [
  { value: 'visit', label: 'Besök' },
  { value: 'diagnosis', label: 'Diagnos' },
  { value: 'medication', label: 'Läkemedel' },
  { value: 'test', label: 'Prov/Test' },
  { value: 'vaccine', label: 'Vaccin' },
  { value: 'note', label: 'Anteckning' },
];

export function EventForm({ event }: { event?: Partial<Event> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!event?.id;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const tagsRaw = (form.get('tags') as string) || '';

    const body = {
      date: form.get('date') as string,
      type: form.get('type') as string,
      title: form.get('title') as string,
      description: (form.get('description') as string) || null,
      providerName: (form.get('provider_name') as string) || null,
      location: (form.get('location') as string) || null,
      tags: tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : [],
      isPrivate: form.get('is_private') === 'on',
    };

    const url = isEditing ? `/api/events/${event.id}` : '/api/events';
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

    router.push('/dashboard');
    router.refresh();
  }

  async function handleDelete() {
    if (!isEditing || !confirm('Vill du verkligen ta bort denna händelse?')) return;
    setLoading(true);

    const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/dashboard');
      router.refresh();
    } else {
      setError('Kunde inte ta bort händelsen');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
        <input
          type="date"
          id="date"
          name="date"
          defaultValue={event?.date || new Date().toISOString().slice(0, 10)}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
        <select
          id="type"
          name="type"
          defaultValue={event?.type || 'visit'}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          {eventTypes.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={event?.title || ''}
          required
          maxLength={200}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Beskrivning</label>
        <textarea
          id="description"
          name="description"
          defaultValue={event?.description || ''}
          rows={4}
          maxLength={5000}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="provider_name" className="block text-sm font-medium text-gray-700 mb-1">Vårdgivare</label>
          <input
            type="text"
            id="provider_name"
            name="provider_name"
            defaultValue={event?.provider_name || ''}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Plats</label>
          <input
            type="text"
            id="location"
            name="location"
            defaultValue={event?.location || ''}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">Taggar (kommaseparerade)</label>
        <input
          type="text"
          id="tags"
          name="tags"
          defaultValue={event?.tags?.join(', ') || ''}
          placeholder="t.ex. blodtryck, kontroll"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_private"
          name="is_private"
          defaultChecked={event?.is_private ?? true}
          className="rounded border-gray-300"
        />
        <label htmlFor="is_private" className="text-sm text-gray-700">Privat händelse</label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Sparar...' : isEditing ? 'Uppdatera' : 'Spara'}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="rounded-lg bg-red-50 px-5 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            Ta bort
          </button>
        )}
      </div>
    </form>
  );
}
