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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mediciner</h1>
        <Link
          href="/dashboard/medications/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Lägg till
        </Link>
      </div>
      <MedicationList initialMedications={medications} />
    </div>
  );
}
