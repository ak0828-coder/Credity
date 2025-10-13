'use client';

// apps/frontend/src/app/_providers/AuthProvider.tsx
import { useEffect, useState } from 'react';
import { session } from '@/lib/session';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    session.loadFromLocalStorage();
    session.start();
    setReady(true);
    return () => session.stop();
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
