import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { redirect } from 'next/navigation';
import { QuestionList } from '@/components/QuestionList';
import type { Question } from '@/types';

export default async function QuestionsPage() {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) redirect('/sign-in');

  const userId = dbUserResult.user.id;

  const [rawQuestions, upcomingApts] = await Promise.all([
    prisma.question.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.appointment.findMany({
      where: {
        userId,
        status: 'scheduled',
        dateTime: { gte: new Date() },
      },
      orderBy: { dateTime: 'asc' },
    }),
  ]);

  const questions: Question[] = rawQuestions.map((q) => ({
    id: q.id,
    user_id: q.userId,
    text: q.text,
    source: q.source as Question['source'],
    appointment_id: q.appointmentId,
    is_answered: q.isAnswered,
    answer: q.answer,
    created_at: q.createdAt.toISOString(),
    updated_at: q.updatedAt.toISOString(),
  }));

  const appointments = upcomingApts.map((a) => ({
    id: a.id,
    title: a.title,
    date_time: a.dateTime.toISOString(),
  }));

  const nextAppointment = upcomingApts[0] ?? null;

  // Count questions per appointment for the badge
  const questionCounts = new Map<string, number>();
  for (const q of rawQuestions) {
    if (q.appointmentId && !q.isAnswered) {
      questionCounts.set(q.appointmentId, (questionCounts.get(q.appointmentId) ?? 0) + 1);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Mina frågor</h1>
          <p className="mt-2 text-gray-600">
            Frågor du vill ta upp vid nästa vårdbesök.
          </p>
          {nextAppointment && (
            <div className="mt-3 rounded-lg bg-blue-50 px-4 py-3">
              <p className="text-sm text-blue-800">
                Nästa besök: <span className="font-semibold">{nextAppointment.title}</span>
                {' — '}
                {nextAppointment.dateTime.toLocaleDateString('sv-SE', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
                {(() => {
                  const count = questionCounts.get(nextAppointment.id) ?? 0;
                  return count > 0 ? (
                    <span className="ml-2 inline-flex items-center rounded-full bg-blue-200 px-2 py-0.5 text-xs font-medium text-blue-900">
                      {count} {count === 1 ? 'fråga' : 'frågor'} förberedda
                    </span>
                  ) : null;
                })()}
              </p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <QuestionList
            initialQuestions={questions}
            appointments={appointments}
          />
        </div>
      </div>
    </main>
  );
}
