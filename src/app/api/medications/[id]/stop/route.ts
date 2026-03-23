import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';

export async function POST(
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

  const today = new Date().toISOString().slice(0, 10);

  const updated = await prisma.medication.update({
    where: { id },
    data: {
      isActive: false,
      endDate: today,
    },
  });

  return NextResponse.json(updated);
}
