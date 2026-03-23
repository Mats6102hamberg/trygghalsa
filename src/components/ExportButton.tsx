'use client';

import type { Event } from '@/types';

export function ExportButton({ events }: { events: Event[] }) {
  function handleExport() {
    const lines = events.map(
      (e) =>
        `${e.date} | ${e.type}: ${e.title}${e.provider_name ? ` (${e.provider_name})` : ''}${e.description ? ` – ${e.description}` : ''}`
    );

    const content = `TryggHälsa – Exporterad tidslinje\n${'='.repeat(40)}\n\n${lines.join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trygghalsa-export-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      Exportera tidslinje
    </button>
  );
}
