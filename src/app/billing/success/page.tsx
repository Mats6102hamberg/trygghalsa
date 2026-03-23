import Link from 'next/link';

export default function BillingSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900">Premium aktiverat!</h1>
        <p className="mt-3 text-gray-600">
          Tack för att du uppgraderar till TryggHälsa Premium. Du har nu tillgång till anhörigöversikt, statusvarningar och mer.
        </p>
        <Link
          href="/dashboard/care"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          Gå till anhörigöversikt
        </Link>
      </div>
    </div>
  );
}
