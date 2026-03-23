import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';

export async function GET() {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const userId = dbUserResult.user.id;
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [medications, appointments, questions] = await Promise.all([
    prisma.medication.findMany({
      where: { userId, isActive: true },
      select: { id: true, name: true, dosage: true, times: true },
      orderBy: { name: 'asc' },
    }),
    prisma.appointment.findMany({
      where: {
        userId,
        status: 'scheduled',
        dateTime: { gte: now, lte: sevenDaysFromNow },
      },
      select: { id: true, title: true, dateTime: true, providerName: true },
      orderBy: { dateTime: 'asc' },
      take: 5,
    }),
    prisma.question.findMany({
      where: { userId, isAnswered: false },
      select: { id: true, text: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    medications: medications.map((m) => ({
      id: m.id,
      name: m.name,
      dosage: m.dosage,
      times: m.times,
    })),
    appointments: appointments.map((a) => ({
      id: a.id,
      title: a.title,
      date_time: a.dateTime.toISOString(),
      provider_name: a.providerName,
    })),
    questions: questions.map((q) => ({
      id: q.id,
      text: q.text,
    })),
  });
}
