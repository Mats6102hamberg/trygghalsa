import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { isPremiumUser } from '@/lib/subscription';

export async function GET() {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const user = await prisma.user.findUnique({
    where: { id: dbUserResult.user.id },
    select: { plan: true, planStatus: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    plan: user.plan,
    planStatus: user.planStatus,
    isPremium: isPremiumUser(user),
  });
}
