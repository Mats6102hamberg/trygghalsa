import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { questionSchema } from '@/lib/validation/question';

export async function GET(request: Request) {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const { searchParams } = new URL(request.url);
  const appointmentId = searchParams.get('appointmentId');
  const isAnswered = searchParams.get('isAnswered');

  const where: Record<string, unknown> = { userId: dbUserResult.user.id };
  if (appointmentId) where.appointmentId = appointmentId;
  if (isAnswered !== null) where.isAnswered = isAnswered === 'true';

  const questions = await prisma.question.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(questions);
}

export async function POST(request: Request) {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const body = await request.json();
  const parsed = questionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const question = await prisma.question.create({
    data: {
      userId: dbUserResult.user.id,
      text: parsed.data.text,
      source: parsed.data.source ?? 'manual',
      appointmentId: parsed.data.appointmentId ?? null,
    },
  });

  return NextResponse.json(question, { status: 201 });
}
