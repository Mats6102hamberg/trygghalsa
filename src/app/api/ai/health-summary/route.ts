import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { callAI } from '@/lib/ai';

export async function POST() {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const userId = dbUserResult.user.id;

  const [diagnoses, medications, appointments, metrics] = await Promise.all([
    prisma.event.findMany({
      where: { userId, type: 'diagnosis' },
      select: { title: true, date: true, description: true },
      orderBy: { date: 'desc' },
    }),
    prisma.medication.findMany({
      where: { userId, isActive: true },
      select: { name: true, dosage: true, times: true },
    }),
    prisma.appointment.findMany({
      where: { userId, status: 'scheduled', dateTime: { gte: new Date() } },
      select: { title: true, dateTime: true, providerName: true },
      orderBy: { dateTime: 'asc' },
      take: 3,
    }),
    prisma.healthMetric.findMany({
      where: { userId },
      select: { metricType: true, valueNumeric: true, valueText: true, unit: true, occurredAt: true },
      orderBy: { occurredAt: 'desc' },
      take: 10,
    }),
  ]);

  const parts: string[] = [];

  if (diagnoses.length > 0) {
    parts.push('Diagnoser: ' + diagnoses.map((d) => `${d.title} (${d.date})`).join(', '));
  }

  if (medications.length > 0) {
    parts.push(
      'Aktiva mediciner: ' +
        medications.map((m) => `${m.name}${m.dosage ? ` ${m.dosage}` : ''}`).join(', ')
    );
  }

  if (appointments.length > 0) {
    parts.push(
      'Kommande besök: ' +
        appointments
          .map(
            (a) =>
              `${a.title} (${a.dateTime.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })})`
          )
          .join(', ')
    );
  }

  if (metrics.length > 0) {
    parts.push(
      'Senaste hälsodata: ' +
        metrics
          .map(
            (m) =>
              `${m.metricType}: ${m.valueNumeric ?? m.valueText ?? '?'} ${m.unit ?? ''}`
          )
          .join(', ')
    );
  }

  if (parts.length === 0) {
    return NextResponse.json({
      summary:
        'Det finns inte tillräckligt med data ännu för att skapa en sammanfattning. Lägg till mediciner, diagnoser eller boka ett vårdbesök för att komma igång.',
    });
  }

  const prompt = `Du är en hjälpsam hälsoassistent i appen Hälsakoll. Skriv en kort, lugn och tydlig sammanfattning på svenska (3-5 meningar) som hjälper användaren förstå sin hälsosituation.

Du får INTE ställa diagnos eller ge behandlingsråd. Var neutral och trygg i tonen.

Användarens data:
${parts.join('\n')}

Skriv sammanfattningen direkt, utan JSON-format.`;

  const result = await callAI({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });

  if (!result.ok) return result.response;

  return NextResponse.json({ summary: result.text });
}
