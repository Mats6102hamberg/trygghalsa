import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { redirect, notFound } from 'next/navigation';
import { EventForm } from '@/components/EventForm';

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
    ...event,
    attachments: event.attachments as { url: string; name: string; type: string }[],
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Redigera händelse</h1>
      <EventForm event={serialized} />
    </div>
  );
}
