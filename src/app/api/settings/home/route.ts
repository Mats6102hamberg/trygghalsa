import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { homeSettingsSchema, defaultButtons } from '@/lib/validation/home-settings';

export async function GET() {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const userId = dbUserResult.user.id;

  let settings = await prisma.homeScreenSettings.findUnique({
    where: { userId },
  });

  if (!settings) {
    settings = await prisma.homeScreenSettings.create({
      data: {
        userId,
        simplicityLevel: 'simple',
      },
    });

    for (const b of defaultButtons) {
      await prisma.homeScreenButton.upsert({
        where: { userId_buttonKey: { userId, buttonKey: b.buttonKey } },
        create: { userId, ...b },
        update: {},
      });
    }
  }

  const buttons = await prisma.homeScreenButton.findMany({
    where: { userId },
    orderBy: { sortOrder: 'asc' },
  });

  return NextResponse.json({
    id: settings.id,
    user_id: settings.userId,
    simplicity_level: settings.simplicityLevel,
    today_message: settings.todayMessage,
    emergency_contact_name: settings.emergencyContactName,
    emergency_contact_phone: settings.emergencyContactPhone,
    buttons: buttons.map((b) => ({
      id: b.id,
      user_id: b.userId,
      button_key: b.buttonKey,
      label: b.label,
      is_visible: b.isVisible,
      sort_order: b.sortOrder,
      is_primary: b.isPrimary,
    })),
  });
}

export async function PUT(request: Request) {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const userId = dbUserResult.user.id;
  const body = await request.json();
  const parsed = homeSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await prisma.homeScreenSettings.upsert({
    where: { userId },
    create: {
      userId,
      simplicityLevel: parsed.data.simplicity_level,
      todayMessage: parsed.data.today_message ?? null,
      emergencyContactName: parsed.data.emergency_contact_name ?? null,
      emergencyContactPhone: parsed.data.emergency_contact_phone ?? null,
    },
    update: {
      simplicityLevel: parsed.data.simplicity_level,
      todayMessage: parsed.data.today_message ?? null,
      emergencyContactName: parsed.data.emergency_contact_name ?? null,
      emergencyContactPhone: parsed.data.emergency_contact_phone ?? null,
    },
  });

  for (const button of parsed.data.buttons) {
    await prisma.homeScreenButton.upsert({
      where: {
        userId_buttonKey: {
          userId,
          buttonKey: button.button_key,
        },
      },
      create: {
        userId,
        buttonKey: button.button_key,
        label: button.label,
        isVisible: button.is_visible,
        sortOrder: button.sort_order,
        isPrimary: button.is_primary,
      },
      update: {
        label: button.label,
        isVisible: button.is_visible,
        sortOrder: button.sort_order,
        isPrimary: button.is_primary,
      },
    });
  }

  return NextResponse.json({ success: true });
}
