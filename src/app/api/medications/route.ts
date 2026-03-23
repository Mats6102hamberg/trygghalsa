import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { medicationSchema } from '@/lib/validation/medication';

export async function GET() {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const medications = await prisma.medication.findMany({
    where: { userId: dbUserResult.user.id },
    orderBy: [{ isActive: 'desc' }, { startDate: 'desc' }],
  });

  return NextResponse.json(medications);
}

export async function POST(request: Request) {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const body = await request.json();
  const parsed = medicationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const medication = await prisma.medication.create({
    data: {
      userId: dbUserResult.user.id,
      name: parsed.data.name,
      dosage: parsed.data.dosage ?? null,
      frequency: parsed.data.frequency ?? null,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate ?? null,
      notes: parsed.data.notes ?? null,
      reminderTime: parsed.data.reminderTime ?? null,
    },
  });

  return NextResponse.json(medication, { status: 201 });
}
