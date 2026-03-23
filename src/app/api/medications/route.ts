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
    where: { userId: dbUserResult.user.id, isActive: true },
    orderBy: { name: 'asc' },
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
      instructions: parsed.data.instructions ?? null,
      times: parsed.data.times ?? [],
      isActive: parsed.data.is_active ?? true,
    },
  });

  return NextResponse.json(medication, { status: 201 });
}
