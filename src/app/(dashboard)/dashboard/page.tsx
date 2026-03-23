import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { redirect } from 'next/navigation';
import Timeline from '@/components/Timeline';
import AISummary from '@/components/AISummary';
import { ImportantToday } from '@/components/ImportantToday';
import Link from 'next/link';
import type { Event } from '@/types';

export default async function DashboardPage() {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) redirect('/sign-in');

  const rawEvents = await prisma.event.findMany({
    where: { userId: dbUserResult.user.id },
    orderBy: { date: 'asc' },
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
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col justify-between gap-4 rounded-2xl border bg-white p-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">TryggHälsa</h1>
            <p className="mt-2 text-sm text-gray-600">
              Samla din medicinska historik, skapa överblick och förbered dig inför vårdbesök.
            </p>
          </div>

          <Link
            href="/dashboard/events/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-center text-white"
          >
            Lägg till händelse
          </Link>
        </div>

        <ImportantToday />
        <AISummary />
        <Timeline initialEvents={events} />
      </div>
    </main>
  );
}
