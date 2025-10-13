'use client';

// apps/frontend/src/lib/api.ts
import { session } from './session';

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export async function apiPost<T = any>(path: string, body: any): Promise<T> {
  const res = await session.authedFetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}
