import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { redirect } from 'next/navigation';
import { MedicationList } from '@/components/MedicationList';
import Link from 'next/link';
import type { Medication } from '@/types';

export default async function MedicationsPage() {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) redirect('/sign-in');

  const rawMeds = await prisma.medication.findMany({
    where: { userId: dbUserResult.user.id },
    orderBy: [{ isActive: 'desc' }, { startDate: 'desc' }],
  });

  const medications: Medication[] = rawMeds.map((m) => ({
    id: m.id,
    user_id: m.userId,
    name: m.name,
    dosage: m.dosage,
    frequency: m.frequency,
    start_date: m.startDate,
    end_date: m.endDate,
    notes: m.notes,
    reminder_time: m.reminderTime,
    is_active: m.isActive,
    created_at: m.createdAt.toISOString(),
    updated_at: m.updatedAt.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Mina mediciner</h1>
          <Link
            href="/dashboard/medications/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Lägg till
          </Link>
        </div>
        <MedicationList initialMedications={medications} />
      </div>
    </main>
  );
}
