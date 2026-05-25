import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, ProductSize } from '@/types';

export interface CartItem {
  id: string;
  name: string;
  breed?: string;
  image: string;
  price: number;
  quantity: number;
  type: 'product';
  stock?: number;
  metadata?: {
    size?: string;
  };
}

// Shape stored in MongoDB
interface DbCartItem {
  productId: string;
  name: string;
  breed?: string;
  image: string;
  price: number;
  quantity: number;
  stock?: number;
  size?: string;
}

// Convert local CartItem -> DB shape
function toDbItem(item: CartItem): DbCartItem {
  return {
    productId: item.id,
    name: item.name,
    breed: item.breed,
    image: item.image,
    price: item.price,
    quantity: item.quantity,
    stock: item.stock,
    size: item.metadata?.size,
  };
}

// Convert DB shape -> local CartItem
function fromDbItem(dbItem: DbCartItem): CartItem {
  return {
    id: dbItem.productId,
    name: dbItem.name,
    breed: dbItem.breed,
    image: dbItem.image,
    price: dbItem.price,
    quantity: dbItem.quantity,
    type: 'product',
    stock: dbItem.stock,
    metadata: dbItem.size ? { size: dbItem.size } : undefined,
  };
}

interface CartStore {
  items: CartItem[];
  _userId: string | null;
  _syncTimeout: ReturnType<typeof setTimeout> | null;
  addItem: (product: Product, size: ProductSize, quantity?: number) => boolean;
  removeItem: (id: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number, size?: string) => void;
  updateItemSize: (productId: string, oldSize: string, newSize: ProductSize) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  loadCartFromDb: (userId: string) => Promise<void>;
  setUserId: (userId: string | null) => void;
  _syncToDb: () => void;
}

// Debounced sync — avoids flooding the API on rapid quantity changes
function syncToServer(userId: string, items: CartItem[]) {
  const dbItems = items.map(toDbItem);
  fetch('/api/db/carts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, items: dbItems }),
  }).catch(() => {
    // Silent fail — localStorage still has the data
  });
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      _userId: null,
      _syncTimeout: null,

      setUserId: (userId) => {
        set({ _userId: userId });
      },

      loadCartFromDb: async (userId: string) => {
        set({ _userId: userId });
        try {
          const res = await fetch(`/api/db/carts?userId=${encodeURIComponent(userId)}&_t=${Date.now()}`, { cache: 'no-store' });
          if (!res.ok) return;
          const dbItems: DbCartItem[] = await res.json();
          if (Array.isArray(dbItems) && dbItems.length > 0) {
            // DB has items — use those (they are the source of truth)
            const cartItems = dbItems.map(fromDbItem);
            set({ items: cartItems });
          } else {
            // DB is empty but localStorage might have items from a guest session
            // Sync localStorage items up to the DB
            const localItems = get().items;
            if (localItems.length > 0) {
              syncToServer(userId, localItems);
            }
          }
        } catch {
          // Network error — fall back to local items
        }
      },

      _syncToDb: () => {
        const { _userId, items, _syncTimeout } = get();
        if (!_userId) return;
        
        // Debounce: clear previous timeout and set a new one
        if (_syncTimeout) clearTimeout(_syncTimeout);
        const timeout = setTimeout(() => {
          syncToServer(_userId, items);
        }, 500);
        set({ _syncTimeout: timeout });
      },
      
      addItem: (product, size, qty = 1) => {
        const items = get().items;
        const existingItem = items.find(
          (i) => i.id === product.id && i.metadata?.size === size.size
        );

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.id === product.id && i.metadata?.size === size.size
                ? { ...i, quantity: i.quantity + qty }
                : i
            ),
          });
        } else {
          const cartItem: CartItem = {
            id: product.id,
            name: product.name,
            breed: product.breed,
            image: product.images[0] || '',
            price: size.price,
            quantity: qty,
            type: 'product',
            stock: size.stock,
            metadata: { size: size.size }
          };
          set({ items: [...items, cartItem] });
        }

        // Sync after state update
        setTimeout(() => get()._syncToDb(), 0);
        return true;
      },

      removeItem: (id, size) => {
        set({
          items: get().items.filter(
            (i) => !(i.id === id && i.metadata?.size === size)
          ),
        });
        setTimeout(() => get()._syncToDb(), 0);
      },

      updateQuantity: (id, quantity, size) => {
        set({
          items: get().items.map((i) =>
            i.id === id && i.metadata?.size === size
              ? { ...i, quantity: Math.max(1, quantity) }
              : i
          ),
        });
        setTimeout(() => get()._syncToDb(), 0);
      },

      updateItemSize: (productId, oldSize, newSize) => {
        const items = get().items;
        const itemToUpdate = items.find(i => i.id === productId && i.metadata?.size === oldSize);
        if (!itemToUpdate) return;

        const otherItems = items.filter(i => !(i.id === productId && i.metadata?.size === oldSize));
        const existingTargetItem = otherItems.find(i => i.id === productId && i.metadata?.size === newSize.size);

        if (existingTargetItem) {
          set({
            items: otherItems.map(i => 
              i.id === productId && i.metadata?.size === newSize.size
                ? { ...i, quantity: i.quantity + itemToUpdate.quantity }
                : i
            )
          });
        } else {
          set({
            items: items.map(i => 
              i.id === productId && i.metadata?.size === oldSize
                ? { ...i, metadata: { ...i.metadata, size: newSize.size }, price: newSize.price, stock: newSize.stock }
                : i
            )
          });
        }
        setTimeout(() => get()._syncToDb(), 0);
      },

      clearCart: () => {
        const { _userId } = get();
        set({ items: [] });
        if (_userId) {
          // Immediately clear on server
          fetch(`/api/db/carts?userId=${encodeURIComponent(_userId)}`, { method: 'DELETE' }).catch(() => {});
        }
      },
      totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      totalPrice: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    }),
    {
      name: 'naturenookduo-cart',
      partialize: (state) => ({
        items: state.items,
        _userId: state._userId,
      }),
    }
  )
);
