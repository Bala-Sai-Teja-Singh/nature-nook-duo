'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Eye, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Order } from '@/types';
import { TabMolecule } from '@/components/shared/molecules/tabs';
import { Search } from 'lucide-react';
import { Input } from '@/components/shared/atoms/input';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/db/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">Pending</Badge>;
      case 'payment_verified': return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">Verified</Badge>;
      case 'order_shipped': return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-100">Shipped</Badge>;
      case 'order_completed': return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">Delivered</Badge>;
      case 'order_cancelled': return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Order Management</h1>
          <p className="text-muted-foreground mt-1">Review new orders, update transport statuses, and handle fulfillments.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search by customer or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 h-10 rounded-xl bg-background border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
        </div>
        <div className="w-full md:w-auto overflow-hidden">
          <TabMolecule
            options={[
              { value: 'All', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'payment_verified', label: 'Verified' },
              { value: 'order_shipped', label: 'Shipped' },
              { value: 'order_completed', label: 'Completed' },
              { value: 'order_cancelled', label: 'Cancelled' },
            ]}
            value={selectedStatus}
            onValueChange={setSelectedStatus}
            className="w-full"
          />
        </div>
      </div>

      <div className="glass rounded-3xl border border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-muted/40">
                <th className="p-4 font-medium text-muted-foreground">Order ID</th>
                <th className="p-4 font-medium text-muted-foreground">Customer</th>
                <th className="p-4 font-medium text-muted-foreground">Date</th>
                <th className="p-4 font-medium text-muted-foreground">Total</th>
                <th className="p-4 font-medium text-muted-foreground">Status</th>
                <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 text-primary/30 mx-auto mb-4" />
                    No orders have been placed yet.
                  </td>
                </tr>
              ) : (
                orders.filter(o => {
                  const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                      o.deliveryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                      o.userEmail?.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesStatus = selectedStatus === 'All' || o.status === selectedStatus;
                  return matchesSearch && matchesStatus;
                }).map((order) => (
                  <tr key={order.id} className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="p-4 font-medium text-foreground">
                      #{order.id.substring(0, 8)}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{order.deliveryName}</span>
                        <span className="text-xs text-muted-foreground">{order.userEmail}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold text-foreground">
                      ₹{order.totalPrice.toFixed(2)}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" className="rounded-full hover:bg-primary/10 hover:text-primary">
                        <Eye className="h-4 w-4 mr-2" /> View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
