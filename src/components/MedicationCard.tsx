'use client';

import type { MedicationWithStatus } from '@/types';

type Props = {
  medication: MedicationWithStatus;
  onTaken: (medicationId: string, scheduledTime: string | null) => Promise<void>;
};

export default function MedicationCard({ medication, onTaken }: Props) {
  const hasTimes = medication.times && medication.times.length > 0;

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900">{medication.name}</h2>

      {medication.dosage && (
        <p className="mt-2 text-base text-gray-700">
          Dos: {medication.dosage}
        </p>
      )}

      {medication.instructions && (
        <p className="mt-2 text-sm text-gray-600">{medication.instructions}</p>
      )}

      {hasTimes ? (
        <div className="mt-4 space-y-3">
          {medication.times.map((time) => {
            const isTaken = medication.takenTodayTimes.includes(time);

            return (
              <div
                key={time}
                className="flex items-center justify-between rounded-xl border p-4"
              >
                <div>
                  <div className="text-lg font-semibold text-gray-900">{time}</div>
                  <div className="text-sm text-gray-500">
                    {isTaken ? 'Tagen idag' : 'Inte markerad ännu'}
                  </div>
                </div>

                <button
                  onClick={() => onTaken(medication.id, time)}
                  disabled={isTaken}
                  className="rounded-xl bg-blue-600 px-4 py-3 text-white disabled:bg-green-600 disabled:opacity-100"
                >
                  {isTaken ? 'Tagen' : 'Jag har tagit den'}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4">
          <button
            onClick={() => onTaken(medication.id, null)}
            className="w-full rounded-xl bg-blue-600 px-4 py-4 text-lg text-white"
          >
            Jag har tagit den
          </button>
        </div>
      )}
    </div>
  );
}
