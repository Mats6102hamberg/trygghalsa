import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';

type Status = 'ok' | 'warning' | 'alert';

function computeStatus(
  medications: { times: string[] }[],
  loggedTimes: string[]
): { status: Status; summary: string } {
  const totalExpected = medications.reduce((sum, m) => sum + m.times.length, 0);

  if (totalExpected === 0) {
    return { status: 'ok', summary: 'Inga mediciner schemalagda idag.' };
  }

  if (loggedTimes.length === 0) {
    return { status: 'alert', summary: 'Ingen aktivitet registrerad idag.' };
  }

  if (loggedTimes.length >= totalExpected) {
    return { status: 'ok', summary: 'Alla mediciner tagna idag.' };
  }

  const missing = totalExpected - loggedTimes.length;
  return {
    status: 'warning',
    summary: `${missing} medicin${missing > 1 ? 'er' : ''} saknas idag.`,
  };
}

export async function GET() {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const links = await prisma.careRelationship.findMany({
    where: { caregiverUserId: dbUserResult.user.id, status: 'active' },
    include: {
      user: { select: { id: true, email: true } },
    },
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const dependents = await Promise.all(
    links.map(async (link) => {
      const [medications, logs] = await Promise.all([
        prisma.medication.findMany({
          where: { userId: link.user.id, isActive: true },
          select: { times: true },
        }),
        prisma.medicationLog.findMany({
          where: {
            userId: link.user.id,
            takenAt: { gte: todayStart, lte: todayEnd },
          },
          select: { scheduledTime: true },
        }),
      ]);

      const loggedTimes = logs
        .map((l) => l.scheduledTime)
        .filter(Boolean) as string[];

      const { status, summary } = computeStatus(medications, loggedTimes);

      return {
        id: link.user.id,
        name: link.user.email ?? 'Okänd',
        relationship: link.relationshipType,
        status,
        summary,
      };
    })
  );

  return NextResponse.json({ dependents });
}
