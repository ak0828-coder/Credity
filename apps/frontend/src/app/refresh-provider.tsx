'use client';

import { useEffect, useRef } from 'react';
import { apiPost } from '@/lib/api';

/**
 * Hält den Access-Token frisch:
 * - Intervall: alle 11 Minuten
 * - Event: wenn der Tab wieder sichtbar wird
 * - Fehler killen die Seite NICHT; wir loggen nur in die Konsole
 */
export default function RefreshProvider() {
  const timerRef = useRef<number | null>(null);

  async function doRefresh(reason: string) {
    try {
      const data = await apiPost<{ ok: boolean; accessToken: string; csrf?: string }>(
        '/auth/refresh',
        {},
      );
      if (data?.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        // Optionales Signal für andere Komponenten
        window.dispatchEvent(new CustomEvent('credity:token-refreshed', { detail: { reason } }));
      }
    } catch (e) {
      // z.B. kein Refresh-Cookie vorhanden => einfach ignorieren
      console.debug('[refresh] skipped:', (e as Error)?.message ?? e);
    }
  }

  useEffect(() => {
    // Intervall alle 11 Minuten
    timerRef.current = window.setInterval(
      () => void doRefresh('interval'),
      11 * 60 * 1000,
    ) as unknown as number;

    // Beim Zurückkehren zum Tab
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void doRefresh('visibilitychange');
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    // Beim ersten Mount einmal versuchen (falls Session schon da ist)
    void doRefresh('initial-mount');

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return null;
}
