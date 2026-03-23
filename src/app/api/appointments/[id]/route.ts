import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { appointmentSchema } from '@/lib/validation/appointment';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const appointment = await prisma.appointment.findFirst({
    where: { id, userId: dbUserResult.user.id },
  });

  if (!appointment) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  }

  return NextResponse.json(appointment);
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
  const parsed = appointmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.appointment.findFirst({
    where: { id, userId: dbUserResult.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      title: parsed.data.title,
      dateTime: new Date(parsed.data.dateTime),
      providerName: parsed.data.providerName ?? null,
      location: parsed.data.location ?? null,
      notes: parsed.data.notes ?? null,
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

  const existing = await prisma.appointment.findFirst({
    where: { id, userId: dbUserResult.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  }

  await prisma.appointment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
