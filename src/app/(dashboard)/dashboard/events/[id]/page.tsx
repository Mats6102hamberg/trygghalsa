import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { redirect, notFound } from 'next/navigation';
import { EventForm } from '@/components/EventForm';
import type { Event } from '@/types';

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) redirect('/sign-in');

  const event = await prisma.event.findFirst({
    where: { id, userId: dbUserResult.user.id },
  });

  if (!event) notFound();

  const serialized = {
    id: event.id,
    user_id: event.userId,
    date: event.date,
    type: event.type as Event['type'],
    title: event.title,
    description: event.description,
    provider_name: event.providerName,
    location: event.location,
    tags: event.tags,
    is_private: event.isPrivate,
    attachments: event.attachments as Event['attachments'],
    created_at: event.createdAt.toISOString(),
    updated_at: event.updatedAt.toISOString(),
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Redigera händelse</h1>
      <EventForm event={serialized} />
    </div>
  );
}
