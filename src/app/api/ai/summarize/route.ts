import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { formatEventsTimeline } from '@/lib/format';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function POST() {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const events = await prisma.event.findMany({
    where: { userId: dbUserResult.user.id },
    orderBy: { date: 'desc' },
  });

  if (events.length === 0) {
    return NextResponse.json({ error: 'Inga händelser att sammanfatta' }, { status: 400 });
  }

  const formattedEvents = formatEventsTimeline(events);

  const prompt = `Du hjälper användaren att sammanfatta sin egen medicinska tidslinje.
Du får inte ställa diagnos, ge behandlingsråd eller påstå något säkert medicinskt.
Skriv en neutral, tydlig sammanfattning av historiken.
Ge sedan 3–5 förslag på frågor användaren kan ta med till sin läkare.

Historik:
${formattedEvents}

Svara i JSON-format:
{
  "summary": "...",
  "questions": ["...", "..."]
}`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = message.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    return NextResponse.json({ error: 'Inget svar från AI' }, { status: 500 });
  }

  const parsed = JSON.parse(textBlock.text);
  return NextResponse.json(parsed);
}
