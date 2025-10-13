'use client';

import { useState } from 'react';
import { API_BASE } from '@/lib/api';

export default function ConsentTestPage() {
  const [out, setOut] = useState<string>('(noch nichts)');

  async function callProtected() {
    const token = localStorage.getItem('accessToken') ?? '';
    const csrf = document.cookie
      .split('; ')
      .find((x) => x.startsWith('csrfToken='))
      ?.split('=')[1];

    const res = await fetch(`${API_BASE}/secure/consents-test`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(csrf ? { 'x-csrf': csrf } : {}),
      },
      body: '{}',
    });

    const text = await res.text();
    setOut(`${res.status} ${res.statusText} -> ${text}`);
  }

  return (
    <main style={{ padding: 24, maxWidth: 720 }}>
      <h1>Consent-Test (geschützt)</h1>
      <p style={{ marginTop: 8 }}>
        <button
          onClick={callProtected}
          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #444' }}
        >
          Create Consent (POST /secure/consents-test)
        </button>
      </p>
      <pre
        style={{ marginTop: 12, background: '#111', color: '#0f0', padding: 12, borderRadius: 8 }}
      >
        {out}
      </pre>

      <div style={{ marginTop: 16, opacity: 0.8 }}>
        <p>Erwartung:</p>
        <ul style={{ lineHeight: 1.6 }}>
          <li>
            Unverifiziert: <code>403</code> mit Meldung <em>User must be verified</em>
          </li>
          <li>
            Nach Mock-Verify (/verify): <code>200</code> und JSON <code>{`{ ok: true, ... }`}</code>
          </li>
        </ul>
      </div>
    </main>
  );
}
