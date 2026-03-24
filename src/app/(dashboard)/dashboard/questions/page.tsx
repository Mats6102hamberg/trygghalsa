import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { redirect } from 'next/navigation';
import { QuestionList } from '@/components/QuestionList';
import type { Question } from '@/types';

export default async function QuestionsPage() {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) redirect('/sign-in');

  const rawQuestions = await prisma.question.findMany({
    where: { userId: dbUserResult.user.id },
    orderBy: { createdAt: 'desc' },
    include: { appointment: { select: { title: true } } },
  });

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

  const upcoming = await prisma.appointment.findMany({
    where: {
      userId: dbUserResult.user.id,
      status: 'scheduled',
      dateTime: { gte: new Date() },
    },
    orderBy: { dateTime: 'asc' },
    take: 1,
  });

  const nextAppointment = upcoming[0] ?? null;

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
              </p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <QuestionList initialQuestions={questions} />
        </div>
      </div>
    </main>
  );
}
