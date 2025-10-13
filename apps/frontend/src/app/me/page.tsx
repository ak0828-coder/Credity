'use client';

import { useState } from 'react';
import { API_BASE } from '@/lib/api';

export default function MePage() {
  const [out, setOut] = useState<string>('(noch nichts)');

  async function callMe() {
    const token = localStorage.getItem('accessToken') ?? '';
    const csrf = document.cookie
      .split('; ')
      .find((x) => x.startsWith('csrfToken='))
      ?.split('=')[1];

    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        ...(csrf ? { 'x-csrf': csrf } : {}),
      },
    });

    const text = await res.text();
    setOut(`${res.status} ${res.statusText} -> ${text}`);
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>/auth/me – Debug</h1>
      <p>
        <button onClick={callMe}>Call /auth/me</button>
      </p>
      <pre
        style={{ marginTop: 12, background: '#111', color: '#0f0', padding: 12, borderRadius: 8 }}
      >
        {out}
      </pre>
    </main>
  );
}
