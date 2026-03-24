import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { redirect } from 'next/navigation';

const faqItems = [
  {
    question: 'Hur lägger jag till en medicin?',
    answer:
      'Gå till "Mediciner" i menyn och tryck på "Lägg till medicin". Fyll i namn, dos och vilka tider du ska ta den.',
  },
  {
    question: 'Hur bjuder jag in en anhörig?',
    answer:
      'Gå till "Anhörig" i menyn. Där kan du bjuda in en anhörig som får se din medicinlista och kommande besök.',
  },
  {
    question: 'Hur förbereder jag mig inför ett läkarbesök?',
    answer:
      'Gå till "Mina frågor" och skriv ner saker du vill ta upp. Du kan också trycka "Generera frågor med AI" så får du förslag baserat på din hälsohistorik.',
  },
  {
    question: 'Vad betyder "Viktigt idag" på startsidan?',
    answer:
      'Det är en sammanfattning av dina mediciner att ta idag, kommande besök och frågor du vill komma ihåg.',
  },
  {
    question: 'Hur ändrar jag min startsida?',
    answer:
      'Gå till "Inställningar" i menyn. Där kan du välja vilka knappar som syns, ställa in nödkontakt och anpassa hur enkel startsidan ska vara.',
  },
];

export default async function HelpPage() {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) redirect('/sign-in');

  const settings = await prisma.homeScreenSettings.findUnique({
    where: { userId: dbUserResult.user.id },
  });

  const emergencyName = settings?.emergencyContactName;
  const emergencyPhone = settings?.emergencyContactPhone;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Hjälp</h1>
          <p className="mt-2 text-gray-600">
            Snabb hjälp, viktiga nummer och vanliga frågor.
          </p>
        </div>

        {/* Nödnummer */}
        <section className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-red-900">Nödnummer</h2>
          <div className="mt-3 space-y-3">
            <a
              href="tel:112"
              className="flex items-center justify-between rounded-xl bg-red-600 p-4 text-white shadow-sm transition hover:bg-red-700"
            >
              <div>
                <div className="text-lg font-bold">112</div>
                <div className="text-sm opacity-90">SOS — akut nödsituation</div>
              </div>
              <span className="text-2xl">📞</span>
            </a>
            <a
              href="tel:1177"
              className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-4 transition hover:bg-blue-100"
            >
              <div>
                <div className="text-lg font-bold text-blue-900">1177</div>
                <div className="text-sm text-blue-700">Vårdguiden — rådgivning dygnet runt</div>
              </div>
              <span className="text-2xl">🏥</span>
            </a>
          </div>
        </section>

        {/* Nödkontakt */}
        {emergencyName && emergencyPhone && (
          <section className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-green-900">Din nödkontakt</h2>
            <a
              href={`tel:${emergencyPhone}`}
              className="mt-3 flex items-center justify-between rounded-xl border border-green-200 bg-white p-4 transition hover:bg-green-50"
            >
              <div>
                <div className="font-semibold text-gray-900">{emergencyName}</div>
                <div className="text-sm text-gray-600">{emergencyPhone}</div>
              </div>
              <span className="text-2xl">📱</span>
            </a>
          </section>
        )}

        {/* Vanliga frågor */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Vanliga frågor</h2>
          <div className="mt-4 space-y-4">
            {faqItems.map((item, i) => (
              <details key={i} className="group rounded-lg border border-gray-200">
                <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50">
                  {item.question}
                </summary>
                <p className="px-4 pb-3 text-sm text-gray-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Om TryggHälsa */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Om TryggHälsa</h2>
          <p className="mt-2 text-sm text-gray-600">
            TryggHälsa hjälper dig hålla koll på din hälsa, dina mediciner och kommande
            vårdbesök. Appen är byggd för att vara enkel och trygg — speciellt för dig
            som vill ha hjälp att förbereda dig inför läkarbesök eller vill att en
            anhörig kan se att allt är OK.
          </p>
        </section>
      </div>
    </main>
  );
}
