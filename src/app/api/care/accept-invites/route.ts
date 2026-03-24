import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';

/**
 * Called after signup/login to automatically accept any pending care invites
 * that match the current user's email.
 */
export async function POST() {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const user = await prisma.user.findUnique({
    where: { id: dbUserResult.user.id },
    select: { id: true, email: true },
  });

  if (!user?.email) {
    return NextResponse.json({ accepted: 0 });
  }

  const pendingInvites = await prisma.careInvite.findMany({
    where: {
      email: user.email,
      status: 'pending',
      expiresAt: { gte: new Date() },
    },
  });

  let accepted = 0;

  for (const invite of pendingInvites) {
    const existing = await prisma.careRelationship.findUnique({
      where: {
        userId_caregiverUserId: {
          userId: invite.inviterUserId,
          caregiverUserId: user.id,
        },
      },
    });

    if (!existing) {
      await prisma.careRelationship.create({
        data: {
          userId: invite.inviterUserId,
          caregiverUserId: user.id,
          relationshipType: invite.relationshipType,
          status: 'active',
        },
      });
      accepted++;
    }

    await prisma.careInvite.update({
      where: { id: invite.id },
      data: { status: 'accepted' },
    });
  }

  return NextResponse.json({ accepted });
}
