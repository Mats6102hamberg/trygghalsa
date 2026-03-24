import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { redirect } from 'next/navigation';

export default async function ContactFamilyPage() {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) redirect('/sign-in');

  const userId = dbUserResult.user.id;

  const [settings, careRelations] = await Promise.all([
    prisma.homeScreenSettings.findUnique({
      where: { userId },
    }),
    prisma.careRelationship.findMany({
      where: { userId, status: 'active' },
      include: { caregiver: { select: { email: true } } },
    }),
  ]);

  const emergencyName = settings?.emergencyContactName;
  const emergencyPhone = settings?.emergencyContactPhone;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Kontakta anhörig</h1>
          <p className="mt-2 text-gray-600">
            Nå dina anhöriga eller nödkontakt snabbt.
          </p>
        </div>

        {emergencyName && emergencyPhone && (
          <a
            href={`tel:${emergencyPhone}`}
            className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm transition hover:bg-green-100"
          >
            <div>
              <div className="text-xs font-medium text-green-600 uppercase">Nödkontakt</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">{emergencyName}</div>
              <div className="text-sm text-gray-600">{emergencyPhone}</div>
            </div>
            <span className="text-3xl">📞</span>
          </a>
        )}

        {careRelations.length > 0 && (
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Dina anhöriga</h2>
            <div className="mt-3 space-y-3">
              {careRelations.map((rel) => (
                <div
                  key={rel.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                >
                  <div>
                    <div className="font-medium text-gray-900">{rel.caregiver.email}</div>
                    <div className="text-xs text-gray-500">{rel.relationshipType}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {!emergencyName && careRelations.length === 0 && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm text-center">
            <p className="text-gray-500">
              Du har inga anhöriga kopplade ännu. Gå till Inställningar för att lägga till en nödkontakt,
              eller till Anhörig för att bjuda in en närstående.
            </p>
          </div>
        )}

        <a
          href="tel:112"
          className="flex items-center justify-between rounded-2xl bg-red-600 p-5 text-white shadow-sm transition hover:bg-red-700"
        >
          <div>
            <div className="text-lg font-bold">112</div>
            <div className="text-sm opacity-90">SOS — akut nödsituation</div>
          </div>
          <span className="text-2xl">🚨</span>
        </a>
      </div>
    </main>
  );
}
