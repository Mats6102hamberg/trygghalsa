import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { medicationLogSchema } from '@/lib/validation/medication';

export async function POST(request: Request) {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const body = await request.json();
  const parsed = medicationLogSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const medication = await prisma.medication.findFirst({
    where: { id: parsed.data.medication_id, userId: dbUserResult.user.id },
  });

  if (!medication) {
    return NextResponse.json({ error: 'Medication not found' }, { status: 404 });
  }

  const log = await prisma.medicationLog.create({
    data: {
      medicationId: parsed.data.medication_id,
      userId: dbUserResult.user.id,
      scheduledTime: parsed.data.scheduled_time ?? null,
    },
  });

  return NextResponse.json(log, { status: 201 });
}

export async function GET(request: Request) {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  const where: Record<string, unknown> = { userId: dbUserResult.user.id };

  if (date) {
    const start = new Date(`${date}T00:00:00Z`);
    const end = new Date(`${date}T23:59:59Z`);
    where.takenAt = { gte: start, lte: end };
  }

  const logs = await prisma.medicationLog.findMany({
    where,
    include: { medication: { select: { name: true, dosage: true } } },
    orderBy: { takenAt: 'desc' },
  });

  const result = logs.map((l) => ({
    id: l.id,
    medication_id: l.medicationId,
    medication_name: l.medication.name,
    dosage: l.medication.dosage,
    scheduled_time: l.scheduledTime,
    taken_at: l.takenAt.toISOString(),
    created_at: l.createdAt.toISOString(),
  }));

  return NextResponse.json(result);
}
