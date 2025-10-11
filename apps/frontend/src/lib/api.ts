export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

function getCsrf(): string | undefined {
  if (typeof document === 'undefined') return;
  const v = document.cookie.split('; ').find((x) => x.startsWith('csrfToken='));
  return v?.split('=')[1];
}

export async function apiPost<T = any>(path: string, body: any): Promise<T> {
  const csrf = getCsrf();
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(csrf ? { 'x-csrf': csrf } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}
