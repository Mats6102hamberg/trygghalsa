'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Question, Appointment } from '@/types';

type AppointmentOption = Pick<Appointment, 'id' | 'title' | 'date_time'>;

export function QuestionList({
  initialQuestions,
  appointments = [],
}: {
  initialQuestions: Question[];
  appointments?: AppointmentOption[];
}) {
  const router = useRouter();
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [generating, setGenerating] = useState(false);

  const unanswered = initialQuestions.filter((q) => !q.is_answered);
  const answered = initialQuestions.filter((q) => q.is_answered);

  const appointmentMap = new Map(appointments.map((a) => [a.id, a]));

  function formatAppointmentDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('sv-SE', {
      day: 'numeric',
      month: 'short',
    });
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: newQuestion.trim(),
        ...(selectedAppointmentId ? { appointmentId: selectedAppointmentId } : {}),
      }),
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

      <form onSubmit={handleAdd} className="space-y-2">
        <div className="flex gap-2">
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
        </div>
        {appointments.length > 0 && (
          <select
            value={selectedAppointmentId}
            onChange={(e) => setSelectedAppointmentId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"
          >
            <option value="">Inte kopplad till besök</option>
            {appointments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} — {formatAppointmentDate(a.date_time)}
              </option>
            ))}
          </select>
        )}
      </form>

      {unanswered.length === 0 && answered.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-500">Inga frågor ännu. Lägg till egna eller generera med AI.</p>
        </div>
      )}

      {unanswered.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Obesvarade</h3>
          {unanswered.map((q) => {
            const apt = q.appointment_id ? appointmentMap.get(q.appointment_id) : null;
            return (
              <div key={q.id} className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
                <button
                  onClick={() => handleToggleAnswered(q.id, q.is_answered)}
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-2 border-gray-300 hover:border-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{q.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{q.source === 'ai' ? 'AI-genererad' : 'Manuell'}</span>
                    {apt && (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                        {apt.title}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => handleDelete(q.id)} className="text-xs text-red-500 hover:underline">
                  Ta bort
                </button>
              </div>
            );
          })}
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
