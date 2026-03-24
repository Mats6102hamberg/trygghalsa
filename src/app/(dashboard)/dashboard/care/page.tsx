'use client';

import { useEffect, useState } from 'react';
import PremiumCard from '@/components/PremiumCard';

type Dependent = {
  id: string;
  name: string;
  relationship: string;
  status: 'ok' | 'warning' | 'alert';
  summary: string;
};

type PendingInvite = {
  id: string;
  email: string;
  status: string;
  created_at: string;
};

type BillingStatus = {
  plan: string;
  planStatus: string;
  isPremium: boolean;
};

export default function CarePage() {
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const billingRes = await fetch('/api/billing/status');
      const billingData = await billingRes.json();
      setBilling(billingData);

      if (billingData.isPremium) {
        const [careRes, relRes] = await Promise.all([
          fetch('/api/care/overview'),
          fetch('/api/care'),
        ]);
        const careData = await careRes.json();
        const relData = await relRes.json();
        setDependents(careData.dependents || []);
        setPendingInvites(relData.pending_invites || []);
      }
    } catch {
      console.error('Failed to load care page');
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

      if (data.type === 'linked') {
        setInviteMessage('Anhörig kopplad!');
      } else {
        setInviteMessage('Inbjudan skickad via e-post!');
      }
      setInviteEmail('');
      loadData();
    } catch {
      setInviteMessage('Kunde inte bjuda in anhörig.');
    } finally {
      setInviteLoading(false);
    }
  }

  if (loading) {
    return <div className="p-6 text-gray-700">Laddar...</div>;
  }

  // Free user — show premium gate
  if (!billing?.isPremium) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">Anhörig</h1>
            <p className="mt-2 text-gray-600">
              Här kan du dela trygg överblick med familjen och låta anhöriga se om allt verkar okej.
            </p>
          </div>

          <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-sm text-yellow-800">
              Du använder gratisversionen. Uppgradera för att dela med anhöriga och få full överblick.
            </p>
          </div>

          <PremiumCard />
        </div>
      </main>
    );
  }

  // Premium user — show full care dashboard
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Anhörig</h1>
          <p className="mt-2 text-gray-600">
            Överblick för anhöriga med status, sammanfattningar och uppföljning.
          </p>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">Premium aktivt</p>
        </div>

        {dependents.length === 0 ? (
          <div className="rounded-2xl border bg-white p-5 text-gray-500">
            Inga anhörigkopplingar ännu.
          </div>
        ) : (
          dependents.map((dep) => (
            <div key={dep.id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{dep.name}</h2>
                  <p className="text-sm text-gray-500">{dep.relationship}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    dep.status === 'ok'
                      ? 'bg-green-100 text-green-700'
                      : dep.status === 'warning'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {dep.status === 'ok' ? 'OK' : dep.status === 'warning' ? 'Varning' : 'Alert'}
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-700">{dep.summary}</p>
            </div>
          ))
        )}

        {/* Pending invites */}
        {pendingInvites.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-amber-900">Väntande inbjudningar</h2>
            <div className="mt-3 space-y-2">
              {pendingInvites.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between rounded-lg bg-white p-3 border border-amber-100">
                  <span className="text-sm text-gray-700">{inv.email}</span>
                  <span className="text-xs text-amber-600">Väntar på registrering</span>
                </div>
              ))}
            </div>
          </div>
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
      </div>
    </main>
  );
}
