'use client';

import { useRef, useState, useEffect } from 'react';
import Script from 'next/script';
import { apiPost } from '@/lib/api';

export default function LoginPage() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  // beim Laden einmal prüfen, ob schon ein accessToken da ist
  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('accessToken'));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const email = emailRef.current!.value;
      const password = passRef.current!.value;
      const data = await apiPost('/auth/login', { email, password, captchaToken });
      localStorage.setItem('accessToken', data.accessToken);
      setLoggedIn(true);
      setMsg('Login OK ✅');
      console.log('accessToken:', data.accessToken);
    } catch (err: any) {
      setMsg(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 420 }}>
      {/* Turnstile Script */}
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />

      <h1>Login</h1>

      {/* Badge: Eingeloggt */}
      {loggedIn && <p style={{ marginTop: 8 }}>✅ Eingeloggt</p>}

      <form onSubmit={onSubmit}>
        <input
          ref={emailRef}
          type="email"
          placeholder="Email"
          required
          style={{ width: '100%', margin: '8px 0', padding: 8 }}
        />
        <input
          ref={passRef}
          type="password"
          placeholder="Password"
          required
          style={{ width: '100%', margin: '8px 0', padding: 8 }}
        />

        {/* Turnstile Widget */}
        <div
          className="cf-turnstile"
          data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          // @ts-expect-error Turnstile setzt globales Callback
          data-callback={(t: string) => setCaptchaToken(t)}
          style={{ margin: '12px 0' }}
        />

        <button type="submit" disabled={loading} style={{ padding: '8px 12px' }}>
          {loading ? 'Bitte warten…' : 'Login'}
        </button>
      </form>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </main>
  );
}
