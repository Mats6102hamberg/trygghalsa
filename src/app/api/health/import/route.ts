import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { z } from 'zod';

const healthEventSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(['visit', 'diagnosis', 'medication', 'test', 'vaccine']),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional().nullable(),
  providerName: z.string().max(200).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  source: z.string().optional().default('healthkit'),
});

const importSchema = z.object({
  events: z.array(healthEventSchema).min(1).max(100),
});

export async function POST(request: Request) {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const body = await request.json();
  const parsed = importSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const created = await prisma.event.createMany({
    data: parsed.data.events.map((e) => ({
      userId: dbUserResult.user.id,
      date: e.date,
      type: e.type,
      title: e.title,
      description: e.description ?? null,
      providerName: e.providerName ?? null,
      location: e.location ?? null,
      tags: [...e.tags, `source:${e.source}`],
      isPrivate: true,
      attachments: [],
    })),
  });

  return NextResponse.json({ imported: created.count }, { status: 201 });
}
