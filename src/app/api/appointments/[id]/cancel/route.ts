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

  const existing = await prisma.appointment.findFirst({
    where: { id, userId: dbUserResult.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: 'cancelled' },
  });

  return NextResponse.json(updated);
}
