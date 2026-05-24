'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cart-store';

/**
 * Safe hydration hook for Cart Store.
 * Returns the store state only after mounting to prevent hydration errors.
 */
export function useCart() {
  const store = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
     
    setMounted(true);
  }, []);

  return {
    ...store,
    isMounted: mounted,
    items: mounted ? store.items : [],
    totalItems: mounted ? store.totalItems : () => 0,
    totalPrice: mounted ? store.totalPrice : () => 0,
  };
}
