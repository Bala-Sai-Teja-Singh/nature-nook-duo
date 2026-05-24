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

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, size: ProductSize, quantity?: number) => boolean;
  removeItem: (id: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number, size?: string) => void;
  updateItemSize: (productId: string, oldSize: string, newSize: ProductSize) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
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
          return true;
        }

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
        return true;
      },

      removeItem: (id, size) => {
        set({
          items: get().items.filter(
            (i) => !(i.id === id && i.metadata?.size === size)
          ),
        });
      },

      updateQuantity: (id, quantity, size) => {
        set({
          items: get().items.map((i) =>
            i.id === id && i.metadata?.size === size
              ? { ...i, quantity: Math.max(1, quantity) }
              : i
          ),
        });
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
      },

      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      totalPrice: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    }),
    {
      name: 'naturenookduo-cart',
    }
  )
);
