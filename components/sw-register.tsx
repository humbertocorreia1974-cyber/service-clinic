'use client';

import { useEffect } from 'react';

export function SwRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // app continua funcionando sem o SW - so perde o cache de pagina offline
      });
    }
  }, []);
  return null;
}
