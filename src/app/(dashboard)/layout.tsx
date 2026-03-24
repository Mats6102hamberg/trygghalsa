import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { MobileTabBar } from '@/components/MobileTabBar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-xl font-semibold text-gray-900">
                TryggHälsa
              </Link>
              <div className="hidden sm:flex gap-6">
                <Link href="/dashboard/timeline" className="text-sm text-gray-600 hover:text-gray-900">
                  Tidslinje
                </Link>
                <Link href="/dashboard/medications" className="text-sm text-gray-600 hover:text-gray-900">
                  Mediciner
                </Link>
                <Link href="/dashboard/appointments" className="text-sm text-gray-600 hover:text-gray-900">
                  Bokningar
                </Link>
                <Link href="/dashboard/questions" className="text-sm text-gray-600 hover:text-gray-900">
                  Frågor
                </Link>
                <Link href="/dashboard/care" className="text-sm text-gray-600 hover:text-gray-900">
                  Anhörig
                </Link>
                <Link href="/dashboard/settings" className="text-sm text-gray-600 hover:text-gray-900">
                  Inställningar
                </Link>
              </div>
            </div>
            <UserButton />
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8">
        {children}
      </main>
      <MobileTabBar />
    </div>
  );
}
