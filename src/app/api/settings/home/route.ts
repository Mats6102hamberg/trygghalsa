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

  const [settings, buttons] = await Promise.all([
    prisma.homeScreenSettings.findUnique({ where: { userId } }),
    prisma.homeScreenButton.findMany({
      where: { userId },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  const responseButtons = buttons.length > 0
    ? buttons.map((b) => ({
        button_key: b.buttonKey,
        label: b.label,
        is_visible: b.isVisible,
        sort_order: b.sortOrder,
        is_primary: b.isPrimary,
      }))
    : defaultButtons.map((b) => ({
        button_key: b.buttonKey,
        label: b.label,
        is_visible: b.isVisible,
        sort_order: b.sortOrder,
        is_primary: b.isPrimary,
      }));

  return NextResponse.json({
    simplicity_level: settings?.simplicityLevel ?? 'simple',
    today_message: settings?.todayMessage ?? null,
    emergency_contact_name: settings?.emergencyContactName ?? null,
    emergency_contact_phone: settings?.emergencyContactPhone ?? null,
    buttons: responseButtons,
  });
}

export async function PUT(request: Request) {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const body = await request.json();
  const parsed = homeSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const userId = dbUserResult.user.id;

  const settings = await prisma.homeScreenSettings.upsert({
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

  // Delete existing buttons and recreate
  await prisma.homeScreenButton.deleteMany({ where: { userId } });

  if (parsed.data.buttons.length > 0) {
    await prisma.homeScreenButton.createMany({
      data: parsed.data.buttons.map((b) => ({
        userId,
        buttonKey: b.button_key,
        label: b.label,
        isVisible: b.is_visible,
        sortOrder: b.sort_order,
        isPrimary: b.is_primary,
      })),
    });
  }

  const buttons = await prisma.homeScreenButton.findMany({
    where: { userId },
    orderBy: { sortOrder: 'asc' },
  });

  return NextResponse.json({
    simplicity_level: settings.simplicityLevel,
    today_message: settings.todayMessage,
    emergency_contact_name: settings.emergencyContactName,
    emergency_contact_phone: settings.emergencyContactPhone,
    buttons: buttons.map((b) => ({
      button_key: b.buttonKey,
      label: b.label,
      is_visible: b.isVisible,
      sort_order: b.sortOrder,
      is_primary: b.isPrimary,
    })),
  });
}
