import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import HomeDashboard from '@/components/HomeDashboard';
import AISummary from '@/components/AISummary';
import Timeline from '@/components/Timeline';
import type { Event } from '@/types';

export default async function DashboardPage() {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) redirect('/sign-in');

  const clerkUser = await currentUser();
  const firstName = clerkUser?.firstName ?? undefined;

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
      <div className="mx-auto max-w-md space-y-6">
        <HomeDashboard userName={firstName} />
        <AISummary />
        <Timeline initialEvents={events} />
      </div>
    </main>
  );
}
