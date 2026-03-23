'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, isPast } from 'date-fns';
import type { Appointment } from '@/types';

export function AppointmentList({ initialAppointments }: { initialAppointments: Appointment[] }) {
  const router = useRouter();

  const upcoming = initialAppointments.filter((a) => !isPast(new Date(a.date_time)));
  const past = initialAppointments.filter((a) => isPast(new Date(a.date_time)));

  async function handleCancel(id: string) {
    if (!confirm('Vill du avboka denna tid?')) return;

    const res = await fetch(`/api/appointments/${id}/cancel`, { method: 'POST' });
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      {upcoming.length === 0 && past.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-500">Inga bokningar.</p>
          <Link href="/dashboard/appointments/new" className="mt-2 inline-block text-blue-600 hover:underline">
            Boka ny tid
          </Link>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Kommande</h3>
          {upcoming.map((apt) => (
            <div key={apt.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{apt.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {format(new Date(apt.date_time), 'yyyy-MM-dd HH:mm')}
                  </p>
                  {apt.provider_name && (
                    <p className="text-sm text-gray-500">{apt.provider_name}</p>
                  )}
                  {apt.location && (
                    <p className="text-sm text-gray-400">{apt.location}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/appointments/${apt.id}`} className="text-sm text-blue-600 hover:underline">
                    Redigera
                  </Link>
                  <button onClick={() => handleCancel(apt.id)} className="text-sm text-red-600 hover:underline">
                    Avboka
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Tidigare</h3>
          {past.map((apt) => (
            <div key={apt.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3 opacity-60">
              <span className="font-medium text-gray-700">{apt.title}</span>
              <span className="ml-2 text-sm text-gray-400">
                {format(new Date(apt.date_time), 'yyyy-MM-dd')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
