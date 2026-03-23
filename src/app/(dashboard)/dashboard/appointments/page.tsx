import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { redirect } from 'next/navigation';
import { AppointmentList } from '@/components/AppointmentList';
import Link from 'next/link';
import type { Appointment } from '@/types';

export default async function AppointmentsPage() {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) redirect('/sign-in');

  const rawApts = await prisma.appointment.findMany({
    where: {
      userId: dbUserResult.user.id,
      status: { not: 'cancelled' },
    },
    orderBy: { dateTime: 'asc' },
  });

  const appointments: Appointment[] = rawApts.map((a) => ({
    id: a.id,
    user_id: a.userId,
    title: a.title,
    date_time: a.dateTime.toISOString(),
    provider_name: a.providerName,
    location: a.location,
    notes: a.notes,
    status: a.status as Appointment['status'],
    created_at: a.createdAt.toISOString(),
    updated_at: a.updatedAt.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Nästa besök</h1>
          <Link
            href="/dashboard/appointments/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Boka ny tid
          </Link>
        </div>
        <AppointmentList initialAppointments={appointments} />
      </div>
    </main>
  );
}
