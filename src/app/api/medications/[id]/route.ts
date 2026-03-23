import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { medicationSchema } from '@/lib/validation/medication';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const medication = await prisma.medication.findFirst({
    where: { id, userId: dbUserResult.user.id },
  });

  if (!medication) {
    return NextResponse.json({ error: 'Medication not found' }, { status: 404 });
  }

  return NextResponse.json(medication);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const existing = await prisma.medication.findFirst({
    where: { id, userId: dbUserResult.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Medication not found' }, { status: 404 });
  }

  const updated = await prisma.medication.update({
    where: { id },
    data: {
      name: parsed.data.name,
      dosage: parsed.data.dosage ?? null,
      frequency: parsed.data.frequency ?? null,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate ?? null,
      notes: parsed.data.notes ?? null,
      reminderTime: parsed.data.reminderTime ?? null,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const existing = await prisma.medication.findFirst({
    where: { id, userId: dbUserResult.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Medication not found' }, { status: 404 });
  }

  await prisma.medication.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
