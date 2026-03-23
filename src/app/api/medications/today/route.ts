import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';

export async function GET() {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const userId = dbUserResult.user.id;

  const medications = await prisma.medication.findMany({
    where: { userId, isActive: true },
    orderBy: { name: 'asc' },
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const logs = await prisma.medicationLog.findMany({
    where: {
      userId,
      takenAt: { gte: todayStart, lte: todayEnd },
    },
  });

  const result = medications.map((m) => {
    const medLogs = logs.filter((l) => l.medicationId === m.id);
    const takenTodayTimes = medLogs
      .map((l) => l.scheduledTime)
      .filter(Boolean) as string[];

    return {
      id: m.id,
      user_id: m.userId,
      name: m.name,
      dosage: m.dosage,
      instructions: m.instructions,
      times: m.times,
      is_active: m.isActive,
      created_at: m.createdAt.toISOString(),
      updated_at: m.updatedAt.toISOString(),
      takenTodayTimes,
    };
  });

  return NextResponse.json(result);
}
