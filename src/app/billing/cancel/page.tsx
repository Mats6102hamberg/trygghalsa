import Link from 'next/link';

export default function BillingCancelPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900">Betalningen avbröts</h1>
        <p className="mt-3 text-gray-600">
          Ingen betalning genomfördes. Du kan uppgradera när du vill.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Tillbaka
          </Link>
          <Link
            href="/dashboard/care"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Prova igen
          </Link>
        </div>
      </div>
    </div>
  );
}
