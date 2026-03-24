'use client';

import { useState } from 'react';
import type { AISummaryResponse } from '@/types';

export default function AISummary() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<AISummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Kunde inte skapa sammanfattning.');
      }

      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white p-4">
      <h2 className="text-lg font-semibold">Inför läkarbesök</h2>
      <p className="mt-2 text-sm text-gray-600">
        Skapa en kort överblick och frågor att ta med till nästa vårdbesök.
      </p>

      <button
        onClick={generate}
        disabled={loading}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? 'Genererar...' : 'Förbered inför läkarbesök'}
      </button>

      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}

      {summary && (
        <div className="mt-4 rounded-lg border p-4">
          <h3 className="font-bold">Sammanfattning</h3>
          <p className="mt-2 text-sm text-gray-700">{summary.summary}</p>

          <h3 className="mt-4 font-bold">Frågor att ställa</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
            {summary.questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
