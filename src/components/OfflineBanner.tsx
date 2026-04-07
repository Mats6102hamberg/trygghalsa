'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-white text-center text-sm py-2 px-4">
      Du är offline. Dina mediciner visas från senaste besöket.
    </div>
  );
}
