import { NextResponse } from 'next/server';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function POST(request: Request) {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const { text } = await request.json();

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json({ error: 'Ingen journaltext angiven' }, { status: 400 });
  }

  const prompt = `Du ska analysera en svensk medicinsk journaltext och extrahera strukturerade händelser.

För varje händelse du hittar, ange:
- date: datum i YYYY-MM-DD format (eller null om okänt)
- type: en av "visit", "diagnosis", "medication", "test", "vaccine", "note"
- title: kort titel (max 200 tecken)
- description: eventuell beskrivning (eller null)
- confidence: "high", "medium" eller "low" beroende på hur säker du är
- source_excerpt: det relevanta utdraget från journaltexten

Du får INTE ställa diagnos eller ge medicinsk rådgivning. Du extraherar bara vad som redan står i texten.

Journaltext:
${text}

Svara med en JSON-array:
[{ "date": "...", "type": "...", "title": "...", "description": "...", "confidence": "...", "source_excerpt": "..." }]`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = message.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    return NextResponse.json({ error: 'Inget svar från AI' }, { status: 500 });
  }

  const draftEvents = JSON.parse(textBlock.text);
  return NextResponse.json({ draftEvents });
}
