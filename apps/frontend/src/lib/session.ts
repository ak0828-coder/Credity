'use client';

// apps/frontend/src/lib/session.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
const REFRESH_INTERVAL_MS = 11 * 60 * 1000;

type Listener = (token: string | null) => void;

class Session {
  private accessToken: string | null = null;
  private timer: number | null = null;
  private listeners: Set<Listener> = new Set();

  get token() {
    return this.accessToken;
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    for (const fn of this.listeners) fn(this.accessToken);
  }

  loadFromLocalStorage() {
    try {
      if (typeof window === 'undefined') return;
      const t = localStorage.getItem('accessToken');
      if (t) this.setToken(t, { persist: false });
    } catch {}
  }

  setToken(token: string | null, opts: { persist?: boolean } = {}) {
    this.accessToken = token;
    if (opts.persist && typeof window !== 'undefined') {
      if (token) localStorage.setItem('accessToken', token);
      else localStorage.removeItem('accessToken');
    }
    this.notify();
  }

  start() {
    this.stop();
    this.timer = window.setInterval(() => {
      this.refresh().catch(() => {});
    }, REFRESH_INTERVAL_MS);

    window.addEventListener('visibilitychange', this.onVisibility, { passive: true });
    window.addEventListener('online', this.onOnline, { passive: true });
  }

  stop() {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    window.removeEventListener('visibilitychange', this.onVisibility);
    window.removeEventListener('online', this.onOnline);
  }

  private onVisibility = () => {
    if (document.visibilityState === 'visible') this.refresh().catch(() => {});
  };
  private onOnline = () => this.refresh().catch(() => {});

  private getCsrfFromCookie(): string | null {
    const raw = document.cookie.split('; ').find((x) => x.startsWith('csrfToken='));
    return raw ? decodeURIComponent(raw.split('=')[1]) : null;
  }

  async refresh(): Promise<void> {
    const csrf = this.getCsrfFromCookie();
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { ...(csrf ? { 'x-csrf': csrf } : {}) },
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}) as any);
      const next = (data as any)?.accessToken as string | undefined;
      if (next) this.setToken(next, { persist: true });
      return;
    }

    if (res.status === 401) {
      this.setToken(null, { persist: true });
    }
  }

  async authedFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers || {});
    if (this.accessToken) headers.set('Authorization', `Bearer ${this.accessToken}`);

    const method = (init.method || 'GET').toUpperCase();
    const needsCsrf =
      method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';
    if (needsCsrf) {
      const csrf = this.getCsrfFromCookie();
      if (csrf) headers.set('x-csrf', csrf);
    }

    let res = await fetch(input, { ...init, headers, credentials: 'include' });
    if (res.status !== 401) return res;

    // einmalig nachladen
    await this.refresh().catch(() => {});
    if (this.accessToken) headers.set('Authorization', `Bearer ${this.accessToken}`);
    res = await fetch(input, { ...init, headers, credentials: 'include' });
    return res;
  }
}

export const session = new Session();
