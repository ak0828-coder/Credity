'use client';

import { useRef, useState, useEffect } from 'react';
import Script from 'next/script';
import { apiPost } from '@/lib/api';
import { session } from '@/lib/session';

export default function RegisterPage() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('accessToken'));
    (window as any).turnstileCallback = (t: string) => setCaptchaToken(t);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const email = emailRef.current!.value.trim().toLowerCase();
      const password = passRef.current!.value;
      const data = await apiPost('/auth/register', { email, password, captchaToken });
      session.setToken(data.accessToken, { persist: true });
      setLoggedIn(true);
      setMsg('Register OK ✅ (eingeloggt)');
      console.log('accessToken:', data.accessToken);
    } catch (err: any) {
      setMsg(err?.message || 'Register failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 420 }}>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />

      <h1>Register</h1>
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
        <div
          className="cf-turnstile"
          data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          data-callback="turnstileCallback"
          style={{ margin: '12px 0' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '8px 12px' }}>
          {loading ? 'Bitte warten…' : 'Register'}
        </button>
      </form>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </main>
  );
}
