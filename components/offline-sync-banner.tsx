'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getQueue, flushQueue } from '@/lib/offline-queue';

export function OfflineSyncBanner() {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const refreshCount = useCallback(async () => {
    try {
      const items = await getQueue();
      setCount(items.length);
    } catch {
      // IndexedDB indisponivel (navegador antigo/modo privado) - banner so nao aparece
    }
  }, []);

  const trySync = useCallback(async () => {
    setSyncing(true);
    try {
      await flushQueue();
    } finally {
      setSyncing(false);
      await refreshCount();
      router.refresh();
    }
  }, [refreshCount, router]);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    refreshCount();
    const onOnline = () => { setIsOnline(true); trySync(); };
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    const interval = setInterval(refreshCount, 15000);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      clearInterval(interval);
    };
  }, [refreshCount, trySync]);

  if (count === 0 && isOnline) return null;

  return (
    <div className={`flex items-center justify-center gap-3 px-4 py-2 text-sm font-medium text-white ${isOnline ? 'bg-amber-600' : 'bg-slate-700'}`}>
      {!isOnline ? (
        <span>Sem conexão — suas ações continuam sendo salvas no aparelho.</span>
      ) : (
        <>
          <span>{count} ação(ões) aguardando sincronizar.</span>
          <button onClick={trySync} disabled={syncing} className="underline underline-offset-2 disabled:opacity-60">
            {syncing ? 'Sincronizando…' : 'Sincronizar agora'}
          </button>
        </>
      )}
    </div>
  );
}
