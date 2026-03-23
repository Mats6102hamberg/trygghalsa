import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { redirect, notFound } from 'next/navigation';
import { AppointmentForm } from '@/components/AppointmentForm';

export default async function EditAppointmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) redirect('/sign-in');

  const apt = await prisma.appointment.findFirst({
    where: { id, userId: dbUserResult.user.id },
  });

  if (!apt) notFound();

  const serialized = {
    id: apt.id,
    user_id: apt.userId,
    title: apt.title,
    date_time: apt.dateTime.toISOString(),
    provider_name: apt.providerName,
    location: apt.location,
    notes: apt.notes,
    status: apt.status as 'scheduled' | 'cancelled' | 'completed',
    created_at: apt.createdAt.toISOString(),
    updated_at: apt.updatedAt.toISOString(),
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Redigera bokning</h1>
      <AppointmentForm appointment={serialized} />
    </div>
  );
}
