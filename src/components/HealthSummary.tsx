'use client';

import { useState } from 'react';

export function HealthSummary() {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSummarize() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/health-summary', { method: 'POST' });
      if (!res.ok) throw new Error('Kunde inte skapa sammanfattning.');
      const data = await res.json();
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Hälsosammanfattning</h2>
        <button
          onClick={handleSummarize}
          disabled={loading}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Sammanfattar...' : summary ? 'Uppdatera' : 'Sammanfatta med AI'}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}

      {summary && (
        <div className="mt-4 rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-gray-800 leading-relaxed">{summary}</p>
        </div>
      )}

      {!summary && !loading && !error && (
        <p className="mt-3 text-sm text-gray-500">
          Tryck på knappen för att få en AI-genererad sammanfattning av din hälsa.
        </p>
      )}
    </section>
  );
}
