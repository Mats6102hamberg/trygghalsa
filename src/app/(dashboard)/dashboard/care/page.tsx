'use client';

import { useEffect, useState } from 'react';

interface Dependent {
  id: string;
  name: string;
  relationship: string;
  status: 'ok' | 'warning' | 'alert';
  summary: string;
}

const statusConfig = {
  ok: { bg: 'bg-green-50 border-green-200', dot: 'bg-green-500', label: 'Allt OK' },
  warning: { bg: 'bg-yellow-50 border-yellow-200', dot: 'bg-yellow-500', label: 'Varning' },
  alert: { bg: 'bg-red-50 border-red-200', dot: 'bg-red-500', label: 'Uppmärksamma' },
};

export default function CareDashboardPage() {
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

  useEffect(() => {
    loadOverview();
  }, []);

  async function loadOverview() {
    try {
      setLoading(true);
      const res = await fetch('/api/care/overview');
      if (!res.ok) throw new Error('Kunde inte hämta översikt.');
      const data = await res.json();
      setDependents(data.dependents);
    } catch {
      setError('Kunde inte hämta anhörigöversikt.');
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setInviteLoading(true);
      setInviteMessage(null);

      const res = await fetch('/api/care', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverEmail: inviteEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setInviteMessage(data.error || 'Något gick fel.');
        return;
      }

      setInviteMessage('Anhörig kopplad!');
      setInviteEmail('');
      loadOverview();
    } catch {
      setInviteMessage('Kunde inte bjuda in anhörig.');
    } finally {
      setInviteLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Anhörigöversikt</h1>
          <p className="mt-2 text-gray-600">
            Se hur det går för dina närstående idag.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="rounded-2xl border bg-white p-6">Laddar...</div>
        ) : dependents.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6 text-gray-500">
            Du har inga kopplade närstående ännu.
          </div>
        ) : (
          dependents.map((dep) => {
            const config = statusConfig[dep.status];
            return (
              <div key={dep.id} className={`rounded-2xl border p-5 shadow-sm ${config.bg}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{dep.name}</h2>
                    <p className="text-sm text-gray-500">{dep.relationship}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${config.dot}`} />
                    <span className="text-sm font-medium text-gray-700">{config.label}</span>
                  </div>
                </div>
                <p className="mt-3 text-gray-700">{dep.summary}</p>
              </div>
            );
          })
        )}

        {/* Invite form */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Bjud in anhörig</h2>
          <p className="mt-1 text-sm text-gray-500">
            Ange e-postadressen till den person som ska kunna se din status.
          </p>

          <form onSubmit={handleInvite} className="mt-4 flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="namn@exempel.se"
              required
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={inviteLoading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {inviteLoading ? 'Skickar...' : 'Bjud in'}
            </button>
          </form>

          {inviteMessage && (
            <p className="mt-2 text-sm text-gray-700">{inviteMessage}</p>
          )}
        </div>

        {/* Premium hint */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <p className="text-sm font-medium text-blue-900">
            Premium: Dela med familjen och få dagliga sammanfattningar.
          </p>
          <p className="mt-1 text-xs text-blue-700">Kommer snart.</p>
        </div>
      </div>
    </main>
  );
}
