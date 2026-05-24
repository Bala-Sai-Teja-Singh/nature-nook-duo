'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';

/**
 * Safe hydration hook for Auth Store.
 * Returns the store state only after mounting to prevent hydration errors.
 */
export function useAuth() {
  const store = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return {
    ...store,
    isMounted: mounted,
    // Return nulls if not mounted to avoid hydration mismatch
    user: mounted ? store.user : null,
    isAuthenticated: mounted ? store.isAuthenticated : false,
    viewMode: mounted ? store.viewMode : 'user',
  };
}
