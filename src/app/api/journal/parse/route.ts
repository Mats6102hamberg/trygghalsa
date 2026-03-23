import { NextResponse } from 'next/server';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function POST(request: Request) {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  let text: string;

  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Ingen fil uppladdad' }, { status: 400 });
    }

    text = await file.text();
  } else {
    const body = await request.json();
    text = body.text;
  }

  if (!text || typeof text !== 'string' || text.trim().length < 20) {
    return NextResponse.json({ error: 'Kunde inte läsa journalinnehåll' }, { status: 400 });
  }

  const prompt = `Du får text från en journalutskrift.
Extrahera endast sådant som uttryckligen står i texten.
Hitta inte på något.
Om datum eller detaljer är osäkra ska det markeras som osäkert.
Skapa bara förslag. Inget ska tolkas som medicinsk rådgivning.

Extrahera:
- diagnoser
- vårdbesök
- provsvar
- läkemedel
- vaccinationer
- viktiga anteckningar

Journaltext:
${text.slice(0, 25000)}

Svara ENBART i JSON:
{
  "events": [
    {
      "date": "YYYY-MM-DD eller null",
      "type": "visit | diagnosis | medication | test | vaccine | note",
      "title": "...",
      "description": "...",
      "confidence": "high | medium | low",
      "source_excerpt": "kort citat eller utdrag"
    }
  ]
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'Inget svar från AI' }, { status: 500 });
    }

    const result = JSON.parse(textBlock.text);
    return NextResponse.json({
      success: true,
      draftEvents: Array.isArray(result.events) ? result.events : [],
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Journal parsing failed' },
      { status: 500 }
    );
  }
}
