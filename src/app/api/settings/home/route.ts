import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { z } from 'zod';

const settingsSchema = z.object({
  simplicityLevel: z.enum(['very_simple', 'simple', 'expanded']).optional(),
  todayMessage: z.string().max(500).nullable().optional(),
  emergencyContactName: z.string().max(200).nullable().optional(),
  emergencyContactPhone: z.string().max(50).nullable().optional(),
});

export async function GET() {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const settings = await prisma.homeScreenSettings.findUnique({
    where: { userId: dbUserResult.user.id },
  });

  if (!settings) {
    return NextResponse.json({
      simplicity_level: 'simple',
      today_message: null,
      emergency_contact_name: null,
      emergency_contact_phone: null,
    });
  }

  return NextResponse.json({
    id: settings.id,
    simplicity_level: settings.simplicityLevel,
    today_message: settings.todayMessage,
    emergency_contact_name: settings.emergencyContactName,
    emergency_contact_phone: settings.emergencyContactPhone,
  });
}

export async function PUT(request: Request) {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const body = await request.json();
  const parsed = settingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const settings = await prisma.homeScreenSettings.upsert({
    where: { userId: dbUserResult.user.id },
    create: {
      userId: dbUserResult.user.id,
      simplicityLevel: parsed.data.simplicityLevel ?? 'simple',
      todayMessage: parsed.data.todayMessage ?? null,
      emergencyContactName: parsed.data.emergencyContactName ?? null,
      emergencyContactPhone: parsed.data.emergencyContactPhone ?? null,
    },
    update: {
      ...(parsed.data.simplicityLevel !== undefined && { simplicityLevel: parsed.data.simplicityLevel }),
      ...(parsed.data.todayMessage !== undefined && { todayMessage: parsed.data.todayMessage }),
      ...(parsed.data.emergencyContactName !== undefined && { emergencyContactName: parsed.data.emergencyContactName }),
      ...(parsed.data.emergencyContactPhone !== undefined && { emergencyContactPhone: parsed.data.emergencyContactPhone }),
    },
  });

  return NextResponse.json({
    id: settings.id,
    simplicity_level: settings.simplicityLevel,
    today_message: settings.todayMessage,
    emergency_contact_name: settings.emergencyContactName,
    emergency_contact_phone: settings.emergencyContactPhone,
  });
}
