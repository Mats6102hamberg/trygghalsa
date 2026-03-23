import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { redirect, notFound } from 'next/navigation';
import { MedicationForm } from '@/components/MedicationForm';

export default async function EditMedicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) redirect('/sign-in');

  const med = await prisma.medication.findFirst({
    where: { id, userId: dbUserResult.user.id },
  });

  if (!med) notFound();

  const serialized = {
    id: med.id,
    user_id: med.userId,
    name: med.name,
    dosage: med.dosage,
    instructions: med.instructions,
    times: med.times,
    is_active: med.isActive,
    created_at: med.createdAt.toISOString(),
    updated_at: med.updatedAt.toISOString(),
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-6">
        <h1 className="text-2xl font-bold mb-6">Redigera medicin</h1>
        <MedicationForm medication={serialized} />
      </div>
    </main>
  );
}
