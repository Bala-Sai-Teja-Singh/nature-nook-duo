'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PackageSearch, Clock, CheckCircle2, XCircle, Truck, Eye } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { AuthGuard } from '@/components/auth-guard';
import { EmptyState } from '@/components/shared/molecules/empty-state';
import type { Order } from '@/types';
import { cn } from '@/lib/utils';
import { Reveal, StaggerContainer } from '@/components/shared/reveal';

function OrdersContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const res = await fetch(`/api/db/orders?userEmail=${user.email}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [user]);

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <Clock className="h-4 w-4" />, label: 'Pending Review' };
      case 'awaiting_payment':
        return { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: <Clock className="h-4 w-4" />, label: 'Awaiting Payment' };
      case 'payment_verified':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <CheckCircle2 className="h-4 w-4" />, label: 'Payment Verified' };
      case 'order_shipped':
        return { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: <Truck className="h-4 w-4" />, label: 'Shipped' };
      case 'order_completed':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle2 className="h-4 w-4" />, label: 'Delivered' };
      case 'order_cancelled':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: <XCircle className="h-4 w-4" />, label: 'Cancelled' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: <Clock className="h-4 w-4" />, label: status };
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <Reveal animation="fade-down" className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-4xl font-bold text-foreground">My Orders</h1>
          <Link href="/shop" className={buttonVariants({ variant: "outline", className: "rounded-full" })}>
            Continue Shopping
          </Link>
        </Reveal>
        
        {isLoading ? (
          <div className="glass rounded-3xl p-12 flex justify-center border border-border/50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No orders found"
            description="You haven't placed any orders with us yet."
            action={
              <Link href="/shop" className={buttonVariants({ size: "lg", className: "rounded-full shadow-lg" })}>
                Browse Shop
              </Link>
            }
          />
        ) : (
          <StaggerContainer animation="fade-up" staggerDelay={0.1} className="space-y-6">
            {orders.map(order => {
              const statusConfig = getStatusConfig(order.status);
              
              return (
                <div key={order.id} className="glass rounded-3xl border border-border/50 overflow-hidden shadow-sm transition-all hover:shadow-md">
                  <div className="bg-muted/30 p-4 sm:p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-lg">Order #{order.id.substring(0, 8)}</span>
                        <Badge variant="outline" className={cn("px-2.5 py-0.5 gap-1.5", statusConfig.color)}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between">
                      <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                      <p className="font-bold text-xl">₹{order.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-6">
                    <div className="space-y-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/50">
                            {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground truncate">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} {item.metadata?.size && `• Size: ${item.metadata.size}`}
                            </p>
                          </div>
                          <div className="font-medium">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-muted/40 p-4 border-t border-border/50 flex justify-between items-center">
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Truck className="h-4 w-4 mr-2" />
                      Shipped to: {order.deliveryAddress ? order.deliveryAddress.split(',')[1]?.trim() || order.deliveryAddress : 'Address provided'}
                    </p>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 rounded-full">
                      <Eye className="h-4 w-4 mr-2" /> View Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <AuthGuard>
      <OrdersContent />
    </AuthGuard>
  );
}
