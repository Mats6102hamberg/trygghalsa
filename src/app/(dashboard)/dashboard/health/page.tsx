import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const metricLabels: Record<string, string> = {
  steps: 'Steg',
  heart_rate: 'Puls',
  blood_pressure: 'Blodtryck',
  weight: 'Vikt',
  sleep: 'Sömn',
  height: 'Längd',
  bmi: 'BMI',
};

const metricUnits: Record<string, string> = {
  steps: 'steg',
  heart_rate: 'bpm',
  blood_pressure: 'mmHg',
  weight: 'kg',
  sleep: 'tim',
  height: 'cm',
  bmi: '',
};

export default async function HealthPage() {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) redirect('/sign-in');

  const userId = dbUserResult.user.id;

  const [diagnoses, activeMeds, upcomingApts, healthMetrics] = await Promise.all([
    prisma.event.findMany({
      where: { userId, type: 'diagnosis' },
      orderBy: { date: 'desc' },
    }),
    prisma.medication.findMany({
      where: { userId, isActive: true },
      orderBy: { name: 'asc' },
    }),
    prisma.appointment.findMany({
      where: {
        userId,
        status: 'scheduled',
        dateTime: { gte: new Date() },
      },
      orderBy: { dateTime: 'asc' },
      take: 3,
    }),
    prisma.healthMetric.findMany({
      where: { userId },
      orderBy: { occurredAt: 'desc' },
      take: 20,
    }),
  ]);

  // Group health metrics by type, keeping only the latest per type
  const latestByType = new Map<string, typeof healthMetrics[0]>();
  for (const m of healthMetrics) {
    if (!latestByType.has(m.metricType)) {
      latestByType.set(m.metricType, m);
    }
  }
  const latestMetrics = Array.from(latestByType.values());

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Min hälsa</h1>
          <p className="mt-2 text-gray-600">Översikt över din hälsa och vård.</p>
        </div>

        {/* Diagnoser */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Diagnoser</h2>
          {diagnoses.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">Inga diagnoser registrerade.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {diagnoses.map((d) => (
                <Link
                  key={d.id}
                  href={`/dashboard/events/${d.id}`}
                  className="block rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
                >
                  <div className="font-medium text-gray-900">{d.title}</div>
                  {d.description && (
                    <p className="mt-1 text-sm text-gray-600">{d.description}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">{d.date}</p>
                </Link>
              ))}
            </div>
          )}
          <Link
            href="/dashboard/events/new"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            + Lägg till diagnos
          </Link>
        </section>

        {/* Aktiva mediciner */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Aktiva mediciner</h2>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              {activeMeds.length} st
            </span>
          </div>
          {activeMeds.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">Inga aktiva mediciner.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {activeMeds.map((m) => (
                <Link
                  key={m.id}
                  href={`/dashboard/medications/${m.id}`}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
                >
                  <div>
                    <span className="font-medium text-gray-900">{m.name}</span>
                    {m.dosage && (
                      <span className="ml-2 text-sm text-gray-500">{m.dosage}</span>
                    )}
                  </div>
                  {m.times.length > 0 && (
                    <span className="text-xs text-gray-400">
                      kl {m.times.join(', ')}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
          <Link
            href="/dashboard/medications/new"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            + Lägg till medicin
          </Link>
        </section>

        {/* Kommande besök */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Kommande besök</h2>
          {upcomingApts.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">Inga kommande besök.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {upcomingApts.map((a) => (
                <Link
                  key={a.id}
                  href={`/dashboard/appointments/${a.id}`}
                  className="block rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
                >
                  <div className="font-medium text-gray-900">{a.title}</div>
                  <div className="mt-1 text-sm text-gray-500">
                    {a.dateTime.toLocaleDateString('sv-SE', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                    {' kl '}
                    {a.dateTime.toLocaleTimeString('sv-SE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {a.providerName && ` — ${a.providerName}`}
                  </div>
                </Link>
              ))}
            </div>
          )}
          <Link
            href="/dashboard/appointments/new"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            + Boka ny tid
          </Link>
        </section>

        {/* Hälsodata */}
        {latestMetrics.length > 0 && (
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Hälsodata</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {latestMetrics.map((m) => (
                <div
                  key={m.id}
                  className="rounded-lg bg-gray-50 p-3"
                >
                  <div className="text-xs font-medium text-gray-500 uppercase">
                    {metricLabels[m.metricType] ?? m.metricType}
                  </div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">
                    {m.valueNumeric != null
                      ? `${Math.round(m.valueNumeric)} ${metricUnits[m.metricType] ?? m.unit ?? ''}`
                      : m.valueText ?? '—'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {m.occurredAt.toLocaleDateString('sv-SE', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
