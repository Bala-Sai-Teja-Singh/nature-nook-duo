'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShieldCheck, Truck, ArrowLeft, CheckCircle2, Mail, Banknote, Info } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Reveal } from '@/components/shared/reveal';
import { Db } from '@/lib/db';
import type { SystemSettings } from '@/types';

export default function CheckoutPage() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    message: ''
  });

  useEffect(() => {
    setMounted(true);
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
    // Fetch system settings for shipping rules
    (async () => {
      const s = await Db.getSettings<SystemSettings>('system_settings');
      if (s) setSettings(s);
    })();
  }, [user]);

  // Calculate shipping charge based on quantity rules from settings
  const shippingCharge = useMemo(() => {
    const qty = totalItems();
    if (!settings?.shippingSettings?.rules || settings.shippingSettings.rules.length === 0 || qty === 0) return 0;
    const rules = settings.shippingSettings.rules;
    // Find matching rule by quantity
    const matched = rules.find(r => qty >= r.minQuantity && qty <= r.maxQuantity);
    if (matched) return matched.charge;
    // If quantity exceeds all rules, use the highest rule
    const sorted = [...rules].sort((a, b) => b.maxQuantity - a.maxQuantity);
    return sorted[0]?.charge || 0;
  }, [settings, totalItems]);

  const shippingDisclaimer = settings?.shippingSettings?.disclaimer || 'Shipping charges may vary based on seasonal conditions.';
  const orderTotal = totalPrice() + shippingCharge;

  // Redirect if cart is empty and not just placed an order
  useEffect(() => {
    if (mounted && items.length === 0 && !orderSuccess) {
      router.push('/cart');
    }
  }, [mounted, items.length, orderSuccess, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`;
      
      const payload = {
        userId: isAuthenticated && user ? user.id : 'guest',
        userName: formData.name,
        userEmail: formData.email,
        deliveryName: formData.name,
        deliveryPhone: formData.phone,
        deliveryAddress: fullAddress,
        message: formData.message,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          price: item.price,
          type: 'product',
          metadata: { size: item.metadata?.size }
        })),
        totalPrice: orderTotal,
        shippingCharge,
      };

      const res = await fetch('/api/db/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to create order');
      }

      const data = await res.json();
      setOrderId(data.orderId);
      setOrderSuccess(true);
      clearCart();
      
      toast({
        title: 'Order Placed Successfully!',
        description: `Your order #${data.orderId.substring(0, 8)} has been received.`,
        variant: 'success'
      });

    } catch (error) {
      console.error(error);
      toast({
        title: 'Checkout Failed',
        description: 'There was an issue processing your order. Please try again.',
        variant: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-background py-20 flex items-center justify-center">
        <div className="glass rounded-3xl p-12 text-center flex flex-col items-center max-w-2xl mx-4 shadow-xl border border-primary/20 animate-hero-text animate-hero-text-delay-1">
          <div className="h-24 w-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-success-burst">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="font-heading text-4xl font-bold mb-4 text-foreground">Order Placed!</h1>
          <p className="text-lg text-muted-foreground mb-4">
            Thank you for choosing Nature&apos;s Nook Duo. Your order <span className="font-bold text-foreground">#{orderId.substring(0, 8)}</span> has been received.
          </p>
          <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl px-6 py-4 mb-8 text-left">
            <Mail className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Our team will verify your order and send you an email with <strong>payment details (UPI / Bank Transfer)</strong>. Please complete the payment and reply to that email with a screenshot of your transaction.
            </p>
          </div>
          <div className="flex gap-4">
            {isAuthenticated && (
              <Link href="/dashboard/orders" className={buttonVariants({ variant: "outline", size: "lg", className: "rounded-full" })}>
                View Orders
              </Link>
            )}
            <Link href="/" className={buttonVariants({ size: "lg", className: "rounded-full shadow-lg hover:-translate-y-0.5 transition-transform" })}>
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/cart" className="text-muted-foreground hover:text-primary transition-colors flex items-center text-sm font-medium">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Cart
          </Link>
        </div>
        
        <h1 className="font-heading text-4xl font-bold mb-8 text-foreground">Secure Checkout</h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          
          {/* Delivery Details */}
          <div className="lg:col-span-3 space-y-8">
            <Reveal animation="fade-up" delay={0.1}>
            <div className="glass rounded-2xl p-6 md:p-8 border border-border/50">
              <h2 className="font-heading text-2xl font-bold mb-6 border-b border-border/50 pb-4">Shipping Information</h2>
              
              {user?.addresses && user.addresses.length > 0 && (
                <div className="mb-8">
                  <label className="text-sm font-medium text-foreground mb-3 block">Quick Fill: Saved Addresses</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {user.addresses.map((addr: any) => (
                      <div 
                        key={addr.id}
                        onClick={() => setFormData(prev => ({ ...prev, address: addr.street, city: addr.city, state: addr.state, zip: addr.zip }))}
                        className="cursor-pointer border border-border/50 rounded-xl p-4 hover:border-primary/50 hover:bg-primary/5 transition-all bg-background/30 active:scale-[0.98]"
                      >
                        <p className="font-medium text-sm">{addr.street}</p>
                        <p className="text-xs text-muted-foreground mt-1">{addr.city}, {addr.state} {addr.zip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <Input required name="name" value={formData.name} onChange={handleInputChange} className="h-12 rounded-xl bg-background/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email Address</label>
                  <Input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="h-12 rounded-xl bg-background/50" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Phone Number (Required for delivery coordination)</label>
                  <Input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="h-12 rounded-xl bg-background/50" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Street Address</label>
                  <Input required name="address" value={formData.address} onChange={handleInputChange} className="h-12 rounded-xl bg-background/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">City</label>
                  <Input required name="city" value={formData.city} onChange={handleInputChange} className="h-12 rounded-xl bg-background/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">State</label>
                    <Input required name="state" value={formData.state} onChange={handleInputChange} className="h-12 rounded-xl bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">ZIP Code</label>
                    <Input required name="zip" value={formData.zip} onChange={handleInputChange} className="h-12 rounded-xl bg-background/50" />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2 mt-2">
                  <label className="text-sm font-medium text-foreground">Special Instructions (Optional)</label>
                  <textarea 
                    name="message" 
                    value={formData.message} 
                    onChange={handleInputChange} 
                    rows={3}
                    className="flex w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
            </Reveal>

            <Reveal animation="fade-up" delay={0.2}>
            <div className="glass rounded-2xl p-6 md:p-8 border border-border/50">
               <h2 className="font-heading text-2xl font-bold mb-6 border-b border-border/50 pb-4">Payment Method</h2>
               <div className="p-4 rounded-xl border-2 border-amber-300/40 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-800/40 flex items-start gap-4">
                 <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 mt-0.5">
                   <Banknote className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                 </div>
                 <div className="space-y-2">
                   <span className="font-semibold text-foreground block">Offline Payment (UPI / Bank Transfer)</span>
                   <p className="text-sm text-muted-foreground leading-relaxed">
                     After placing your order, our team will verify it and send you an email with payment details. Complete the payment and reply to the email with a screenshot of your transaction.
                   </p>
                 </div>
               </div>
            </div>
            </Reveal>
          </div>

          {/* Order Summary sidebar */}
          <Reveal animation="fade-left" delay={0.3} className="lg:col-span-2">
            <div className="glass rounded-2xl p-6 md:p-8 sticky top-28 border border-border/50 shadow-lg">
              <h3 className="font-heading text-2xl font-bold border-b border-border/50 pb-4 mb-6">Order Summary</h3>
              
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity} {item.metadata?.size ? `| ${item.metadata.size}` : ''}</p>
                    </div>
                    <div className="font-medium text-sm">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 text-sm border-t border-border/50 pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{totalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">{shippingCharge > 0 ? `₹${shippingCharge.toFixed(2)}` : 'Free'}</span>
                </div>
                <div className="flex items-start gap-1.5 text-xs text-muted-foreground/80 pt-1">
                  <Info className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>{shippingDisclaimer}</span>
                </div>
              </div>
              
              <div className="border-t border-border/50 mt-4 pt-4 flex justify-between items-end mb-8">
                <span className="text-lg font-bold">Total to Pay</span>
                <span className="text-3xl font-bold text-primary">₹{orderTotal.toFixed(2)}</span>
              </div>
              
              <Button 
                type="submit" 
                size="lg" 
                disabled={isSubmitting}
                className="w-full h-14 rounded-xl text-base shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]"
              >
                {isSubmitting ? 'Processing Securely...' : 'Place Order'}
              </Button>
              
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                <span>256-bit secure SSL encryption</span>
              </div>
            </div>
          </Reveal>
          
        </form>
      </div>
    </div>
  );
}
