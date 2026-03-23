import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="max-w-lg text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          TryggHälsa
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Din trygga hälsojournal. Håll koll på besök, diagnoser, mediciner och provtagningar — allt på ett ställe.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/sign-up"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Kom igång
          </Link>
          <Link
            href="/sign-in"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Logga in
          </Link>
        </div>
      </div>
    </div>
  );
}
