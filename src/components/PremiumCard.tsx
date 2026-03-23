'use client';

import { useState } from 'react';

export default function PremiumCard() {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    try {
      setLoading(true);
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        Få trygghet för dig och din familj
      </h2>
      <p className="mt-2 text-sm text-gray-700">
        Med Premium kan du enkelt följa hur dina nära mår, se om mediciner tagits och få varningar om något inte stämmer.
      </p>

      <ul className="mt-3 space-y-2 text-sm text-gray-700">
        <li>Se om allt verkar vara okej</li>
        <li>Få varning om medicin missas</li>
        <li>Dela överblick med familjen</li>
        <li>Dagliga sammanfattningar</li>
      </ul>

      <div className="mt-5">
        <p className="text-lg font-semibold text-gray-900">99 kr / månad</p>
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="mt-3 w-full rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition disabled:opacity-50"
          type="button"
        >
          {loading ? 'Laddar...' : 'Uppgradera till Premium'}
        </button>
      </div>

      <p className="mt-4 text-sm text-gray-600">
        Tips: Bjud in en anhörig direkt för att börja dela överblicken.
      </p>
    </div>
  );
}
