'use client';

import { useState } from 'react';
import { API_BASE } from '@/lib/api';

export default function LogoutPage() {
  const [msg, setMsg] = useState<string | null>(null);

  async function logout() {
    try {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(await res.text());
      setMsg('Logout OK ✅');
    } catch (e: any) {
      setMsg(e?.message || 'Logout failed');
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Logout</h1>
      <button onClick={logout} style={{ padding: '8px 12px' }}>
        Jetzt ausloggen
      </button>
      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </main>
  );
}
