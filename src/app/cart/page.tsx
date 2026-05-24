'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { EmptyState } from '@/components/shared/molecules/empty-state';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="font-heading text-4xl font-bold mb-8 text-foreground">Your Cart</h1>
        
        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Your cart is empty"
            description="Looks like you haven't added any companions or supplies to your cart yet."
            action={
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link href="/shop" className={buttonVariants({ size: "lg", className: "rounded-full shadow-lg hover:-translate-y-0.5 transition-transform" })}>
                  Browse Shop
                </Link>
              </div>
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass rounded-2xl overflow-hidden">
                {items.map((item) => (
                  <div key={item.id} className="p-6 border-b border-border/50 last:border-0 flex flex-col sm:flex-row gap-6 bg-card/40">
                    {/* Item Image */}
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden shrink-0 bg-muted">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">No Img</div>
                      )}
                    </div>
                    
                    {/* Item Details */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div>
                          <h3 className="font-heading text-xl font-bold text-foreground">
                            <Link href={`/shop/${item.id}`} className="hover:text-primary transition-colors">
                              {item.name}
                            </Link>
                          </h3>
                          {item.metadata?.size && <p className="text-sm text-muted-foreground mt-1">Size / Var: {item.metadata.size}</p>}
                        </div>
                        <span className="font-bold text-lg">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between pt-4">
                        <div className="flex items-center border border-border/60 rounded-full bg-background px-3 py-1 h-10">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.metadata?.size)}
                            className="text-muted-foreground hover:text-foreground font-medium w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                          >-</button>
                          <span className="font-medium text-sm w-8 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.metadata?.size)}
                            className="text-muted-foreground hover:text-foreground font-medium w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                          >+</button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeItem(item.id, item.metadata?.size)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mb-6 px-2">
                <Link href="/shop" className="text-sm font-medium text-primary hover:underline flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 rotate-180" /> Continue Shopping
                </Link>
                <Button variant="ghost" size="sm" onClick={clearCart} className="text-muted-foreground hover:text-destructive">
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="glass rounded-2xl p-6 sticky top-28 space-y-6">
                <h3 className="font-heading text-2xl font-bold border-b border-border/50 pb-4">Order Summary</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                    <span className="font-medium">₹{totalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">Calculated at checkout</span>
                  </div>
                </div>
                
                <div className="border-t border-border/50 pt-4 flex justify-between items-end">
                  <span className="text-base font-bold">Estimated Total</span>
                  <span className="text-3xl font-bold text-primary">₹{totalPrice().toFixed(2)}</span>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full h-14 rounded-xl text-base shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all mt-4"
                  onClick={() => router.push('/checkout')}
                >
                  Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <div className="bg-primary/10 dark:bg-primary/20 rounded-xl p-4 mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                    <span>Secure encrypted checkout</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Truck className="h-5 w-5 text-primary shrink-0" />
                    <span>Safe animal transport guarantee</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
