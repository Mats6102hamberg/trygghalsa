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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Frågor till läkaren</h1>
      <QuestionList initialQuestions={questions} />
    </div>
  );
}
