import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { sendCareInviteEmail } from '@/lib/email';
import { z } from 'zod';

const inviteSchema = z.object({
  caregiverEmail: z.string().email(),
  relationshipType: z.string().max(100).optional().default('anhörig'),
});

export async function GET() {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const [asUser, asCaregiver, pendingInvites] = await Promise.all([
    prisma.careRelationship.findMany({
      where: { userId: dbUserResult.user.id },
      include: { caregiver: { select: { id: true, email: true } } },
    }),
    prisma.careRelationship.findMany({
      where: { caregiverUserId: dbUserResult.user.id },
      include: { user: { select: { id: true, email: true } } },
    }),
    prisma.careInvite.findMany({
      where: { inviterUserId: dbUserResult.user.id, status: 'pending' },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return NextResponse.json({
    caregivers: asUser,
    caring_for: asCaregiver,
    pending_invites: pendingInvites.map((i) => ({
      id: i.id,
      email: i.email,
      status: i.status,
      created_at: i.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const body = await request.json();
  const parsed = inviteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const inviterUser = await prisma.user.findUnique({
    where: { id: dbUserResult.user.id },
    select: { id: true, email: true },
  });

  if (!inviterUser) {
    return NextResponse.json({ error: 'Användare hittades inte' }, { status: 404 });
  }

  if (inviterUser.email === parsed.data.caregiverEmail) {
    return NextResponse.json({ error: 'Du kan inte bjuda in dig själv' }, { status: 400 });
  }

  // Check if user already exists in the system
  const caregiverUser = await prisma.user.findFirst({
    where: { email: parsed.data.caregiverEmail },
  });

  if (caregiverUser) {
    // User exists — create direct relationship
    const existing = await prisma.careRelationship.findUnique({
      where: {
        userId_caregiverUserId: {
          userId: dbUserResult.user.id,
          caregiverUserId: caregiverUser.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Relation finns redan' }, { status: 409 });
    }

    const relationship = await prisma.careRelationship.create({
      data: {
        userId: dbUserResult.user.id,
        caregiverUserId: caregiverUser.id,
        relationshipType: parsed.data.relationshipType ?? 'anhörig',
        status: 'active',
      },
    });

    return NextResponse.json({ type: 'linked', relationship }, { status: 201 });
  }

  // User does not exist — send email invite
  const existingInvite = await prisma.careInvite.findUnique({
    where: {
      inviterUserId_email: {
        inviterUserId: dbUserResult.user.id,
        email: parsed.data.caregiverEmail,
      },
    },
  });

  if (existingInvite && existingInvite.status === 'pending') {
    return NextResponse.json({ error: 'Inbjudan redan skickad till denna e-post' }, { status: 409 });
  }

  const invite = await prisma.careInvite.create({
    data: {
      inviterUserId: dbUserResult.user.id,
      email: parsed.data.caregiverEmail,
      relationshipType: parsed.data.relationshipType ?? 'anhörig',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:4567';
  const signUpUrl = `${appUrl}/sign-up?invite=${invite.token}`;

  try {
    await sendCareInviteEmail({
      to: parsed.data.caregiverEmail,
      inviterEmail: inviterUser.email ?? 'en TryggHälsa-användare',
      signUpUrl,
    });
  } catch {
    // Email failed but invite is created — user can reshare the link
  }

  return NextResponse.json({
    type: 'invited',
    message: 'Inbjudan skickad via e-post!',
    invite: { id: invite.id, email: invite.email },
  }, { status: 201 });
}
