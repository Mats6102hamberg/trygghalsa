'use client';

import { useEffect, useState } from 'react';
import type { HomeScreenSettings } from '@/types';

export default function CaregiverPanelPage() {
  const [settings, setSettings] = useState<HomeScreenSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/settings/home');
      const data = await res.json();
      setSettings(data);
      setLoading(false);
    };

    load();
  }, []);

  const toggleButton = (buttonKey: string) => {
    if (!settings) return;

    setSettings({
      ...settings,
      buttons: settings.buttons.map((button) =>
        button.button_key === buttonKey
          ? { ...button, is_visible: !button.is_visible }
          : button
      ),
    });
  };

  const save = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setMessage(null);

      const res = await fetch('/api/settings/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        throw new Error('Kunde inte spara inställningar.');
      }

      setMessage('Inställningarna sparades.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Något gick fel.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Laddar anhörigpanelen...</div>;
  }

  if (!settings) {
    return <div className="p-6">Kunde inte ladda inställningar.</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border bg-white p-6">
          <h1 className="text-2xl font-bold text-gray-900">Anhörigpanel</h1>
          <p className="mt-2 text-sm text-gray-600">
            Anpassa vilka knappar som ska visas på användarens startsida.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold">Enkelhetsnivå</h2>

          <select
            value={settings.simplicity_level}
            onChange={(e) =>
              setSettings({
                ...settings,
                simplicity_level: e.target.value as HomeScreenSettings['simplicity_level'],
              })
            }
            className="w-full rounded-lg border p-3"
          >
            <option value="very_simple">Mycket enkel</option>
            <option value="simple">Enkel</option>
            <option value="expanded">Utökad</option>
          </select>
        </div>

        <div className="rounded-2xl border bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold">Knappar på startsidan</h2>

          {settings.buttons.map((button) => (
            <label
              key={button.id}
              className="flex items-center justify-between rounded-xl border p-4"
            >
              <div>
                <div className="font-medium">{button.label}</div>
                <div className="text-sm text-gray-500">{button.button_key}</div>
              </div>

              <input
                type="checkbox"
                checked={button.is_visible}
                onChange={() => toggleButton(button.button_key)}
                className="h-5 w-5"
              />
            </label>
          ))}
        </div>

        <div className="rounded-2xl border bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold">Viktig hjälptext</h2>

          <textarea
            value={settings.today_message ?? ''}
            onChange={(e) =>
              setSettings({
                ...settings,
                today_message: e.target.value,
              })
            }
            rows={4}
            className="w-full rounded-lg border p-3"
            placeholder="Till exempel: Kom ihåg medicin kl 08 och 20."
          />

          <input
            value={settings.emergency_contact_name ?? ''}
            onChange={(e) =>
              setSettings({
                ...settings,
                emergency_contact_name: e.target.value,
              })
            }
            className="w-full rounded-lg border p-3"
            placeholder="Kontaktpersonens namn"
          />

          <input
            value={settings.emergency_contact_phone ?? ''}
            onChange={(e) =>
              setSettings({
                ...settings,
                emergency_contact_phone: e.target.value,
              })
            }
            className="w-full rounded-lg border p-3"
            placeholder="Telefonnummer"
          />
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-white disabled:opacity-50"
        >
          {saving ? 'Sparar...' : 'Spara inställningar'}
        </button>

        {message && (
          <div className="rounded-xl border bg-white p-4 text-sm">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
