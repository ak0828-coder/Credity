'use client';
import { useState } from 'react';
import { API_BASE } from '@/lib/api';

export default function VerifyPage() {
  const [out, setOut] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  async function doVerify() {
    setErr(null);
    setOut(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      setErr('Bitte erst einloggen – kein Access-Token gefunden.');
      return;
    }

    const csrf =
      typeof document !== 'undefined'
        ? document.cookie
            .split('; ')
            .find((x) => x.startsWith('csrfToken='))
            ?.split('=')[1]
        : undefined;

    const res = await fetch(`${API_BASE}/identity/mock/verify`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(csrf ? { 'x-csrf': csrf } : {}),
        Authorization: `Bearer ${token}`,
        'x-dev-auth': process.env.NEXT_PUBLIC_DEV_IDP_SECRET || '',
      },
    });

    if (!res.ok) {
      const t = await res.text().catch(() => '');
      setErr(`${res.status}: ${t || 'Request failed'}`);
      return;
    }

    setOut(await res.json());
  }

  return (
    <main style={{ padding: 24, maxWidth: 640 }}>
      <h1>Verify (Mock)</h1>
      <p>Nur in Dev/Preview aktiv. Voraussetzung: eingeloggt & DEV Secret gesetzt.</p>
      <button
        type="button"
        onClick={doVerify}
        style={{ padding: '8px 12px', marginTop: 8, border: '1px solid #888' }}
      >
        Jetzt verifizieren
      </button>
      <pre style={{ whiteSpace: 'pre-wrap', marginTop: 16 }}>
        {err ? `ERR: ${err}` : out ? JSON.stringify(out, null, 2) : '—'}
      </pre>
    </main>
  );
}
