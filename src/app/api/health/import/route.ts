import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { healthImportSchema } from '@/lib/validation/health';

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
      externalType: entry.metricType,
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
