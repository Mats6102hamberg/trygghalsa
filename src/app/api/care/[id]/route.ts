import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { z } from 'zod';

const updateSchema = z.object({
  status: z.enum(['pending', 'active', 'revoked']).optional(),
  canCustomizeHome: z.boolean().optional(),
  canViewTimeline: z.boolean().optional(),
  canViewMedications: z.boolean().optional(),
  canViewAppointments: z.boolean().optional(),
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

  const existing = await prisma.careRelationship.findFirst({
    where: {
      id,
      OR: [
        { userId: dbUserResult.user.id },
        { caregiverUserId: dbUserResult.user.id },
      ],
    },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Relation hittades inte' }, { status: 404 });
  }

  const updated = await prisma.careRelationship.update({
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

  const existing = await prisma.careRelationship.findFirst({
    where: {
      id,
      OR: [
        { userId: dbUserResult.user.id },
        { caregiverUserId: dbUserResult.user.id },
      ],
    },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Relation hittades inte' }, { status: 404 });
  }

  await prisma.careRelationship.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
