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
      { error: 'Invalid import payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const importJob = await prisma.importJob.create({
    data: {
      userId: dbUserResult.user.id,
      source: 'health_import',
      status: 'processing',
    },
  });

  try {
    const rows = parsed.data.entries.map((entry) => ({
      userId: dbUserResult.user.id,
      source: parsed.data.source,
      metricType: entry.metricType,
      occurredAt: new Date(entry.occurredAt),
      valueNumeric: typeof entry.value === 'number' ? entry.value : null,
      valueText: typeof entry.value === 'string' ? entry.value : null,
      unit: entry.unit ?? null,
      metadata: JSON.parse(JSON.stringify(entry.metadata ?? {})),
    }));

    const result = await prisma.healthMetric.createMany({ data: rows });

    await prisma.importJob.update({
      where: { id: importJob.id },
      data: {
        status: 'completed',
        importedCount: result.count,
        finishedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      imported: result.count,
      importJobId: importJob.id,
    }, { status: 201 });
  } catch (err) {
    await prisma.importJob.update({
      where: { id: importJob.id },
      data: {
        status: 'failed',
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
        finishedAt: new Date(),
      },
    });

    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Import failed' },
      { status: 500 }
    );
  }
}
