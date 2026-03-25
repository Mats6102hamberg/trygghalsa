import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <span className="text-xl font-bold text-gray-900">Hälsakoll</span>
            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Logga in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                Kom igång gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
              Hela din hälsa,{' '}
              <span className="text-indigo-600">tryggt samlad</span>{' '}
              på ett ställe
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Hälsakoll hjälper dig hålla koll på mediciner, läkarbesök, diagnoser och frågor till vården.
              Enkel att använda — även för dig som inte är van vid appar.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/sign-up"
                className="rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                Skapa konto — det är gratis
              </Link>
              <a
                href="#funktioner"
                className="rounded-xl border-2 border-gray-200 px-8 py-4 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Läs mer
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Vem är det för */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Byggt för dig som vill ha trygg koll
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Oavsett om du hanterar din egen hälsa eller hjälper en närstående — Hälsakoll gör det enklare.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="text-4xl mb-4">👴👵</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Äldre med flera mediciner</h3>
              <p className="text-gray-600">
                Få påminnelser om mediciner, se vilka tider du ska ta dem och markera enkelt att du tagit din dos.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="text-4xl mb-4">👨‍👩‍👧</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Anhöriga som vill hjälpa</h3>
              <p className="text-gray-600">
                Se din närståendes mediciner, bokningar och hälsostatus. Få trygghet utan att behöva ringa varje dag.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="text-4xl mb-4">🏥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Inför läkarbesök</h3>
              <p className="text-gray-600">
                Samla frågor du vill ställa, se din historik och låt AI hjälpa dig förbereda så att inget glöms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Funktioner */}
      <section id="funktioner" className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Allt du behöver — inget du inte behöver
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Hälsakoll är designat för att vara enkelt. Stora knappar, tydlig text och inga onödiga funktioner.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon="💊"
              title="Medicinlista med påminnelser"
              description="Lägg in dina mediciner med dos och tider. Markera enkelt att du tagit din medicin. Allt sparas i din tidslinje."
            />
            <FeatureCard
              icon="📅"
              title="Kommande vårdbesök"
              description="Håll koll på bokade läkarbesök, provtagningar och undersökningar. Se allt samlat på en plats."
            />
            <FeatureCard
              icon="❓"
              title="Frågor till vården"
              description="Skriv ner frågor du vill ta upp vid nästa besök så du inte glömmer. AI kan hjälpa dig formulera dem."
            />
            <FeatureCard
              icon="📋"
              title="Tidslinje"
              description="Se hela din medicinska historik — medicinintag, besök, diagnoser — i kronologisk ordning."
            />
            <FeatureCard
              icon="👨‍👩‍👧"
              title="Anhörigåtkomst"
              description="Bjud in en anhörig som kan se dina mediciner och bokningar. Perfekt för barn som vill hjälpa sina föräldrar."
            />
            <FeatureCard
              icon="🤖"
              title="AI-hälsosammanfattning"
              description="Få en sammanfattning av din hälsosituation baserad på dina registrerade uppgifter. Bra inför vårdbesök."
            />
            <FeatureCard
              icon="🆘"
              title="Nödnummer alltid nära"
              description="Snabb åtkomst till 112 och 1177. Alltid ett tryck bort om du behöver hjälp."
            />
            <FeatureCard
              icon="🔒"
              title="Säker och privat"
              description="Dina uppgifter är krypterade och säkert lagrade. Vi säljer aldrig din data. Du äger din information."
            />
            <FeatureCard
              icon="📱"
              title="Fungerar överallt"
              description="Användarvänlig på mobil, surfplatta och dator. Ingen app att ladda ner — fungerar direkt i webbläsaren."
            />
          </div>
        </div>
      </section>

      {/* Hur det fungerar */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Kom igång på 2 minuter
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-indigo-600 mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Skapa konto</h3>
              <p className="text-gray-600">
                Registrera dig gratis med din e-post eller Google-konto. Tar under en minut.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-indigo-600 mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Lägg in dina uppgifter</h3>
              <p className="text-gray-600">
                Lägg till mediciner, diagnoser och kommande besök. Gör så mycket eller lite du vill.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-indigo-600 mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ha koll varje dag</h3>
              <p className="text-gray-600">
                Startsidan visar vad som är viktigt idag. Bjud in anhöriga så de också kan följa med.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Enkel prissättning
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Grundfunktionerna är helt gratis. Uppgradera när du vill ha mer.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Gratis</h3>
              <p className="mt-1 text-gray-500">Perfekt för att komma igång</p>
              <p className="mt-6 text-4xl font-bold text-gray-900">0 kr<span className="text-base font-normal text-gray-500">/mån</span></p>
              <ul className="mt-8 space-y-3">
                <PricingItem text="Medicinlista med påminnelser" />
                <PricingItem text="Kommande besök" />
                <PricingItem text="Tidslinje" />
                <PricingItem text="Frågor till vården" />
                <PricingItem text="Nödnummer" />
              </ul>
              <Link
                href="/sign-up"
                className="mt-8 block w-full text-center rounded-xl border-2 border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Skapa gratis konto
              </Link>
            </div>
            <div className="bg-indigo-600 rounded-2xl p-8 text-white relative">
              <div className="absolute -top-3 right-6 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                Populär
              </div>
              <h3 className="text-xl font-semibold">Premium</h3>
              <p className="mt-1 text-indigo-200">För dig och din familj</p>
              <p className="mt-6 text-4xl font-bold">29 kr<span className="text-base font-normal text-indigo-200">/mån</span></p>
              <ul className="mt-8 space-y-3">
                <PricingItem text="Allt i Gratis" light />
                <PricingItem text="Anhörigåtkomst" light />
                <PricingItem text="AI-hälsosammanfattning" light />
                <PricingItem text="AI-genererade frågor" light />
                <PricingItem text="Prioriterad support" light />
              </ul>
              <Link
                href="/sign-up"
                className="mt-8 block w-full text-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                Prova Premium gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">
            Vanliga frågor
          </h2>
          <div className="space-y-4">
            <FaqItem
              question="Är Hälsakoll gratis?"
              answer="Ja! Grundfunktionerna som medicinlista, bokningar, tidslinje och frågor är helt gratis. Premium med anhörigåtkomst och AI-funktioner kostar 29 kr/mån."
            />
            <FaqItem
              question="Behöver jag ladda ner en app?"
              answer="Nej, Hälsakoll fungerar direkt i webbläsaren på din mobil, surfplatta eller dator. Du kan lägga till den på hemskärmen som en app om du vill."
            />
            <FaqItem
              question="Är mina uppgifter säkra?"
              answer="Ja. All data lagras krypterat i EU. Vi säljer aldrig din information och följer GDPR. Du kan när som helst exportera eller radera din data."
            />
            <FaqItem
              question="Kan min anhörige se allt?"
              answer="Din anhörige ser bara det du väljer att dela: mediciner, bokningar och en hälsoöversikt. De kan inte ändra något i ditt konto."
            />
            <FaqItem
              question="Hur fungerar AI-funktionerna?"
              answer="AI kan sammanfatta din hälsosituation och föreslå frågor inför läkarbesök baserat på dina registrerade uppgifter. Allt sker säkert och din data lämnar aldrig tjänsten."
            />
            <FaqItem
              question="Kan jag avbryta Premium när jag vill?"
              answer="Absolut. Du kan avbryta din prenumeration när som helst och behåller tillgången tills perioden löper ut."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-indigo-600">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Börja ha koll på din hälsa idag
          </h2>
          <p className="mt-4 text-lg text-indigo-200">
            Det tar under en minut att komma igång. Helt gratis, inget kreditkort krävs.
          </p>
          <Link
            href="/sign-up"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-4 text-base font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Skapa ditt konto nu
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-lg font-bold text-white">Hälsakoll</span>
              <p className="mt-1 text-sm">Din trygga hälsojournal</p>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/sign-in" className="hover:text-white transition-colors">Logga in</Link>
              <Link href="/sign-up" className="hover:text-white transition-colors">Skapa konto</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            &copy; {new Date().getFullYear()} Hälsakoll. Alla rättigheter förbehållna.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function PricingItem({ text, light }: { text: string; light?: boolean }) {
  return (
    <li className="flex items-center gap-2">
      <svg className={`w-5 h-5 flex-shrink-0 ${light ? 'text-indigo-200' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
      <span className={`text-sm ${light ? 'text-indigo-100' : 'text-gray-700'}`}>{text}</span>
    </li>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
      <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-left font-medium text-gray-900 hover:bg-gray-50">
        {question}
        <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </summary>
      <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">
        {answer}
      </div>
    </details>
  );
}
