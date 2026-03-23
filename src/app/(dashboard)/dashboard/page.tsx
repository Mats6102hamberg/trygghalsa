import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { redirect } from 'next/navigation';
import { Timeline } from '@/components/Timeline';
import { AISummary } from '@/components/AISummary';
import Link from 'next/link';

export default async function DashboardPage() {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) redirect('/sign-in');

  const events = await prisma.event.findMany({
    where: { userId: dbUserResult.user.id },
    orderBy: { date: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Din hälsotidslinje</h1>
        <Link
          href="/dashboard/events/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Lägg till händelse
        </Link>
      </div>

      {events.length > 0 && <AISummary />}

      <Timeline initialEvents={events} />
    </div>
  );
}
