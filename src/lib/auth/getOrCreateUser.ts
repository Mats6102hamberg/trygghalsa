import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function getOrCreateDbUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return { error: 'Unauthorized', status: 401 as const };

  const existingUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    select: { id: true, clerkId: true, email: true },
  });

  if (existingUser) {
    return { user: existingUser };
  }

  try {
    const newUser = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses?.[0]?.emailAddress ?? null,
      },
      select: { id: true, clerkId: true, email: true },
    });
    return { user: newUser };
  } catch {
    return { error: 'Failed to create user', status: 500 as const };
  }
}
