import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { z } from 'zod';

const healthImportSchema = z.object({
  source: z.enum(['healthkit', 'health_connect']),
  entries: z.array(
    z.object({
      externalType: z.string().min(1),
      occurredAt: z.string().datetime(),
      value: z.union([z.string(), z.number(), z.boolean(), z.object({}).passthrough()]),
      unit: z.string().optional(),
      metadata: z.record(z.string(), z.any()).optional(),
    })
  ).min(1),
});

export async function POST(request: Request) {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const body = await request.json();
  const parsed = healthImportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const created = await prisma.healthImport.createMany({
    data: parsed.data.entries.map((entry) => ({
      userId: dbUserResult.user.id,
      source: parsed.data.source,
      externalType: entry.externalType,
      occurredAt: new Date(entry.occurredAt),
      payload: JSON.parse(JSON.stringify({
        value: entry.value,
        unit: entry.unit ?? null,
        metadata: entry.metadata ?? {},
      })),
    })),
  });

  return NextResponse.json({ imported: created.count }, { status: 201 });
}
