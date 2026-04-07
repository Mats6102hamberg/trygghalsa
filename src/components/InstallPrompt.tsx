'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if previously dismissed
    if (localStorage.getItem('pwa-install-dismissed')) {
      setDismissed(true);
      return;
    }

    // iOS detection
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua) && !('standalone' in navigator)) {
      setIsIOS(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', '1');
  };

  if (isInstalled || dismissed) return null;
  if (!deferredPrompt && !isIOS) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-4">
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="font-semibold text-blue-900 text-sm">
            Lägg till Hälsakoll på din hemskärm
          </p>
          <p className="text-blue-700 text-sm mt-1">
            {isIOS
              ? 'Tryck på dela-knappen och välj "Lägg till på hemskärmen".'
              : 'Få snabb åtkomst till dina mediciner och bokningar.'}
          </p>
          {deferredPrompt && (
            <button
              onClick={handleInstall}
              className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Installera
            </button>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="text-blue-400 hover:text-blue-600 text-lg leading-none p-1"
          aria-label="Stäng"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
