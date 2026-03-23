import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { z } from 'zod';

const updateSchema = z.object({
  text: z.string().min(1).max(1000).optional(),
  appointmentId: z.string().nullable().optional(),
  isAnswered: z.boolean().optional(),
  answer: z.string().max(2000).nullable().optional(),
});

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
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.question.findFirst({
    where: { id, userId: dbUserResult.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  const updated = await prisma.question.update({
    where: { id },
    data: parsed.data,
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

  const existing = await prisma.question.findFirst({
    where: { id, userId: dbUserResult.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  await prisma.question.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
