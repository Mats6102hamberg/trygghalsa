import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { redirect } from 'next/navigation';
import { Timeline } from '@/components/Timeline';
import { AISummary } from '@/components/AISummary';
import { ImportantToday } from '@/components/ImportantToday';
import Link from 'next/link';
import type { Event } from '@/types';

export default async function DashboardPage() {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) redirect('/sign-in');

  const rawEvents = await prisma.event.findMany({
    where: { userId: dbUserResult.user.id },
    orderBy: { date: 'desc' },
  });

  const events: Event[] = rawEvents.map((e) => ({
    id: e.id,
    user_id: e.userId,
    date: e.date,
    type: e.type as Event['type'],
    title: e.title,
    description: e.description,
    provider_name: e.providerName,
    location: e.location,
    tags: e.tags,
    is_private: e.isPrivate,
    attachments: e.attachments as Event['attachments'],
    created_at: e.createdAt.toISOString(),
    updated_at: e.updatedAt.toISOString(),
  }));

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

      <ImportantToday />

      {events.length > 0 && <AISummary />}

      <Timeline initialEvents={events} />
    </div>
  );
}
