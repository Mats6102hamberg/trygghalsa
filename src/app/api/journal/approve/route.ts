import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { approvedJournalImportSchema } from '@/lib/validation/journal';

export async function POST(request: Request) {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const body = await request.json();
  const parsed = approvedJournalImportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const created = await prisma.event.createMany({
    data: parsed.data.approvedEvents.map((e) => ({
      userId: dbUserResult.user.id,
      date: e.date,
      type: e.type,
      title: e.title,
      description: e.description ?? null,
      tags: ['source:journal-import'],
    })),
  });

  return NextResponse.json({ imported: created.count }, { status: 201 });
}
