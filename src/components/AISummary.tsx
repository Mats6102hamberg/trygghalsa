'use client';

import { useState } from 'react';

type SummaryResponse = {
  summary: string;
  questions: string[];
};

export function AISummary() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Kunde inte skapa sammanfattning.');
      }

      const data = await res.json();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      {!summary ? (
        <div>
          <button
            onClick={generate}
            disabled={loading}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Genererar...' : 'Förbered inför läkarbesök'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Sammanfattning</h3>
            <p className="text-sm text-gray-700">{summary.summary}</p>
          </div>

          {summary.questions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Frågor att ställa</h3>
              <ul className="list-disc pl-5 space-y-1">
                {summary.questions.map((q, i) => (
                  <li key={i} className="text-sm text-gray-700">{q}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => setSummary(null)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Stäng
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
