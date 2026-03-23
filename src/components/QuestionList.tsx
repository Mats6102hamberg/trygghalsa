'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Question } from '@/types';

export function QuestionList({ initialQuestions }: { initialQuestions: Question[] }) {
  const router = useRouter();
  const [newQuestion, setNewQuestion] = useState('');
  const [generating, setGenerating] = useState(false);

  const unanswered = initialQuestions.filter((q) => !q.is_answered);
  const answered = initialQuestions.filter((q) => q.is_answered);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newQuestion.trim() }),
    });

    setNewQuestion('');
    router.refresh();
  }

  async function handleToggleAnswered(id: string, isAnswered: boolean) {
    await fetch(`/api/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAnswered: !isAnswered }),
    });
    router.refresh();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/questions/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  async function handleGenerate() {
    setGenerating(true);
    await fetch('/api/ai/generate-questions', { method: 'POST' });
    setGenerating(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {generating ? 'Genererar...' : 'Generera frågor med AI'}
        </button>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Skriv en fråga..."
          maxLength={1000}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Lägg till
        </button>
      </form>

      {unanswered.length === 0 && answered.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-500">Inga frågor ännu. Lägg till egna eller generera med AI.</p>
        </div>
      )}

      {unanswered.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Obesvarade</h3>
          {unanswered.map((q) => (
            <div key={q.id} className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
              <button
                onClick={() => handleToggleAnswered(q.id, q.is_answered)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-2 border-gray-300 hover:border-blue-500"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{q.text}</p>
                <span className="text-xs text-gray-400">{q.source === 'ai' ? 'AI-genererad' : 'Manuell'}</span>
              </div>
              <button onClick={() => handleDelete(q.id)} className="text-xs text-red-500 hover:underline">
                Ta bort
              </button>
            </div>
          ))}
        </div>
      )}

      {answered.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Besvarade</h3>
          {answered.map((q) => (
            <div key={q.id} className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 opacity-60">
              <button
                onClick={() => handleToggleAnswered(q.id, q.is_answered)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-2 border-blue-500 bg-blue-500"
              />
              <p className="text-sm text-gray-600 line-through">{q.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
