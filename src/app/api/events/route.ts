import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { eventSchema } from '@/lib/validation/event';

export async function GET() {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const events = await prisma.event.findMany({
    where: { userId: dbUserResult.user.id },
    orderBy: { date: 'desc' },
  });

  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const body = await request.json();
  const parsed = eventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const event = await prisma.event.create({
    data: {
      userId: dbUserResult.user.id,
      date: parsed.data.date,
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      providerName: parsed.data.providerName ?? null,
      location: parsed.data.location ?? null,
      tags: parsed.data.tags ?? [],
      isPrivate: parsed.data.isPrivate ?? true,
      attachments: parsed.data.attachments ?? [],
    },
  });

  return NextResponse.json(event, { status: 201 });
}
