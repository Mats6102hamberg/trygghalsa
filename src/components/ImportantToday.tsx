'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

interface TodayData {
  medications: { id: string; name: string; dosage: string | null; reminder_time: string | null }[];
  appointments: { id: string; title: string; date_time: string; provider_name: string | null }[];
  questions: { id: string; text: string }[];
}

export function ImportantToday() {
  const [data, setData] = useState<TodayData | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/dashboard/today', { signal: controller.signal })
      .then((res) => res.json())
      .then(setData)
      .catch(() => {});

    return () => controller.abort();
  }, []);

  if (!data) return null;

  const hasContent = data.medications.length > 0 || data.appointments.length > 0 || data.questions.length > 0;

  if (!hasContent) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
        <p className="text-sm text-green-700">Allt ser bra ut idag</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {data.medications.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Mediciner idag</h3>
          <div className="space-y-2">
            {data.medications.map((med) => (
              <div key={med.id} className="text-sm">
                <span className="font-medium text-gray-800">{med.name}</span>
                {med.dosage && <span className="text-gray-500"> {med.dosage}</span>}
                {med.reminder_time && <span className="text-gray-400 ml-1">kl {med.reminder_time}</span>}
              </div>
            ))}
          </div>
          <Link href="/dashboard/medications" className="mt-3 inline-block text-xs text-blue-600 hover:underline">
            Alla mediciner
          </Link>
        </div>
      )}

      {data.appointments.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Kommande bokningar</h3>
          <div className="space-y-2">
            {data.appointments.map((apt) => (
              <div key={apt.id} className="text-sm">
                <span className="font-medium text-gray-800">{apt.title}</span>
                <p className="text-gray-500">{format(new Date(apt.date_time), 'dd/MM HH:mm')}</p>
              </div>
            ))}
          </div>
          <Link href="/dashboard/appointments" className="mt-3 inline-block text-xs text-blue-600 hover:underline">
            Alla bokningar
          </Link>
        </div>
      )}

      {data.questions.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Obesvarade frågor</h3>
          <div className="space-y-1">
            {data.questions.map((q) => (
              <p key={q.id} className="text-sm text-gray-600 truncate">{q.text}</p>
            ))}
          </div>
          <Link href="/dashboard/questions" className="mt-3 inline-block text-xs text-blue-600 hover:underline">
            Alla frågor
          </Link>
        </div>
      )}
    </div>
  );
}
