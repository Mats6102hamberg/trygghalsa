import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { formatEventsTimeline } from '@/lib/format';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function POST(request: Request) {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const body = await request.json().catch(() => ({}));
  const appointmentId = body.appointmentId ?? null;

  const events = await prisma.event.findMany({
    where: { userId: dbUserResult.user.id },
    orderBy: { date: 'desc' },
  });

  const medications = await prisma.medication.findMany({
    where: { userId: dbUserResult.user.id, isActive: true },
  });

  if (events.length === 0 && medications.length === 0) {
    return NextResponse.json({ error: 'Ingen data att basera frågor på' }, { status: 400 });
  }

  const formattedEvents = formatEventsTimeline(events);
  const medicationList = medications
    .map((m) => `${m.name}${m.dosage ? ` ${m.dosage}` : ''}${m.times.length > 0 ? ` (${m.times.join(', ')})` : ''}`)
    .join('\n');

  const prompt = `Du hjälper en patient att förbereda frågor inför ett läkarbesök.
Baserat på patientens medicinska historik och aktuella mediciner, generera 3–5 relevanta frågor.
Frågorna ska vara konkreta, tydliga och hjälpa patienten att förstå sin hälsa bättre.
Du får INTE ställa diagnos eller ge medicinsk rådgivning.

Medicinsk historik:
${formattedEvents || 'Inga händelser registrerade.'}

Aktuella mediciner:
${medicationList || 'Inga aktiva mediciner.'}

Svara med en JSON-array av strängar:
["Fråga 1", "Fråga 2", ...]`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = message.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    return NextResponse.json({ error: 'Inget svar från AI' }, { status: 500 });
  }

  const questions: string[] = JSON.parse(textBlock.text);

  const created = await prisma.question.createMany({
    data: questions.map((text) => ({
      userId: dbUserResult.user.id,
      text,
      source: 'ai',
      appointmentId,
    })),
  });

  return NextResponse.json({ generated: created.count, questions }, { status: 201 });
}
