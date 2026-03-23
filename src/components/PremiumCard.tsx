type PremiumCardProps = {
  title?: string;
  text?: string;
  buttonText?: string;
};

export default function PremiumCard({
  title = 'Premium krävs',
  text = 'Bjud in anhöriga, se anhörigöversikt och få dagliga sammanfattningar med Premium.',
  buttonText = 'Uppgradera',
}: PremiumCardProps) {
  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm text-gray-700">{text}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-600">
        <span className="rounded-full bg-white px-3 py-1 border">Anhörigöversikt</span>
        <span className="rounded-full bg-white px-3 py-1 border">Statusvarningar</span>
        <span className="rounded-full bg-white px-3 py-1 border">Sammanfattningar</span>
      </div>

      <button
        className="mt-5 rounded-xl bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 transition"
        type="button"
      >
        {buttonText}
      </button>
    </div>
  );
}
