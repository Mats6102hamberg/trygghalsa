import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { formatEventsTimeline } from '@/lib/format';
import { callAI } from '@/lib/ai';

export async function POST() {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const events = await prisma.event.findMany({
    where: { userId: dbUserResult.user.id },
    orderBy: { date: 'asc' },
    select: { date: true, type: true, title: true, description: true },
  });

  if (events.length === 0) {
    return NextResponse.json({
      summary: 'Det finns ännu inga registrerade medicinska händelser i tidslinjen.',
      questions: [
        'Vilka uppgifter är viktigast att lägga till först?',
        'Finns det tidigare diagnoser eller läkemedel som bör dokumenteras?',
        'Vilka provsvar eller besök bör jag ta med?',
      ],
    });
  }

  const formattedEvents = formatEventsTimeline(events);

  const prompt = `Du hjälper användaren att sammanfatta sin egen medicinska tidslinje.
Du får inte ställa diagnos, ge behandlingsråd eller uttrycka medicinsk säkerhet.
Du ska vara neutral, tydlig och försiktig.

Historik:
${formattedEvents}

Skriv:
1. En kort sammanfattning på svenska i 1-2 meningar.
2. 3-5 konkreta frågor användaren kan ta med till sin läkare.

Svara enbart i JSON-format:
{
  "summary": "...",
  "questions": ["...", "..."]
}`;

  const result = await callAI({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  if (!result.ok) return result.response;

  const parsed = JSON.parse(result.text);
  return NextResponse.json({
    summary: parsed.summary ?? '',
    questions: Array.isArray(parsed.questions) ? parsed.questions : [],
  });
}
