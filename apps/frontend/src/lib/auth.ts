import { API_BASE } from './api';

function getCsrf() {
  if (typeof document === 'undefined') return undefined;
  return document.cookie
    .split('; ')
    .find((x) => x.startsWith('csrfToken='))
    ?.split('=')[1];
}

let timer: any = null;

export function startAuthRefresh() {
  if (typeof window === 'undefined') return;
  if (timer) return;

  async function refreshOnce() {
    const csrf = getCsrf();
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrf ? { 'x-csrf': csrf } : {}),
        },
      });
      if (!res.ok) throw new Error(await res.text().catch(() => 'HTTP ' + res.status));
      const data = await res.json();
      if (data?.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
    } catch (e) {
      // optional: ausloggen/Feedback
      console.warn('silent refresh failed:', e);
    }
  }

  // Sofort einmal versuchen, dann alle 10 Minuten
  refreshOnce();
  timer = setInterval(refreshOnce, 10 * 60 * 1000);
}

export function stopAuthRefresh() {
  if (timer) clearInterval(timer);
  timer = null;
}
