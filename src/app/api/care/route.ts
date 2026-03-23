import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
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

  const [asUser, asCaregiver] = await Promise.all([
    prisma.careRelationship.findMany({
      where: { userId: dbUserResult.user.id },
      include: { caregiver: { select: { id: true, email: true } } },
    }),
    prisma.careRelationship.findMany({
      where: { caregiverUserId: dbUserResult.user.id },
      include: { user: { select: { id: true, email: true } } },
    }),
  ]);

  return NextResponse.json({ caregivers: asUser, caring_for: asCaregiver });
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

  const caregiverUser = await prisma.user.findFirst({
    where: { email: parsed.data.caregiverEmail },
  });

  if (!caregiverUser) {
    return NextResponse.json({ error: 'Användaren hittades inte' }, { status: 404 });
  }

  if (caregiverUser.id === dbUserResult.user.id) {
    return NextResponse.json({ error: 'Du kan inte lägga till dig själv' }, { status: 400 });
  }

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
    },
  });

  return NextResponse.json(relationship, { status: 201 });
}
