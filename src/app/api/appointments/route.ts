import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { appointmentSchema } from '@/lib/validation/appointment';

export async function GET() {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      userId: dbUserResult.user.id,
      status: { not: 'cancelled' },
    },
    orderBy: { dateTime: 'asc' },
  });

  return NextResponse.json(appointments);
}

export async function POST(request: Request) {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const body = await request.json();
  const parsed = appointmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const appointment = await prisma.appointment.create({
    data: {
      userId: dbUserResult.user.id,
      title: parsed.data.title,
      dateTime: new Date(parsed.data.dateTime),
      providerName: parsed.data.providerName ?? null,
      location: parsed.data.location ?? null,
      notes: parsed.data.notes ?? null,
    },
  });

  return NextResponse.json(appointment, { status: 201 });
}
