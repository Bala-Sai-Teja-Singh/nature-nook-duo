'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  ShoppingCart, Eye, Search, CheckCircle2, Clock, XCircle, Truck,
  PackageOpen, X, Mail, AlertTriangle, Loader2, CreditCard, Package,
  MapPin, Phone, User as UserIcon, FileText, Send, ChevronDown,
} from 'lucide-react';
import { Reveal } from '@/components/shared/reveal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Order, OrderStatus, SystemSettings } from '@/types';
import { TabMolecule } from '@/components/shared/molecules/tabs';
import { Modal } from '@/components/shared/molecules/modal';
import { toast } from 'sonner';
import { Db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { STATUS_CONFIG, ALL_STATUSES } from '@/constants/statuses';
import { Loading } from '@/components/shared/molecules/loading';

// Allowed transitions from each status (allows going backward to resolve admin mistakes)
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['awaiting_payment', 'payment_verified', 'order_shipped', 'order_completed', 'order_cancelled'],
  awaiting_payment: ['pending', 'payment_verified', 'order_shipped', 'order_completed', 'order_cancelled'],
  payment_verified: ['pending', 'awaiting_payment', 'order_shipped', 'order_completed', 'order_cancelled'],
  order_shipped: ['pending', 'awaiting_payment', 'payment_verified', 'order_completed', 'order_cancelled'],
  order_completed: ['pending', 'awaiting_payment', 'payment_verified', 'order_shipped', 'order_cancelled'],
  order_cancelled: ['pending', 'awaiting_payment', 'payment_verified', 'order_shipped', 'order_completed'],
};

// Define logical status ordering to determine forward/backward transitions
const STATUS_ORDER: Record<OrderStatus, number> = {
  pending: 0,
  awaiting_payment: 1,
  payment_verified: 2,
  order_shipped: 3,
  order_completed: 4,
  order_cancelled: 5,
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  // Editable fields in the modal
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [adminNote, setAdminNote] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [courierPartner, setCourierPartner] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  
  const [editableItems, setEditableItems] = useState<any[]>([]);
  const [editableShipping, setEditableShipping] = useState(0);
  const [resendEmail, setResendEmail] = useState(false);

  const fetchOrders = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchOrders();
    // Fetch system settings for payment details
    (async () => {
      const s = await Db.getSettings<SystemSettings>('system_settings');
      if (s) setSettings(s);
    })();
  }, [fetchOrders]);

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus('');
    setAdminNote(order.adminNote || '');
    setTrackingId(order.trackingId || '');
    setCourierPartner(order.courierPartner || '');
    setCancellationReason(order.cancellationReason || '');
    setEditableItems(JSON.parse(JSON.stringify(order.items)));
    setEditableShipping(order.shippingCharge || 0);
    setResendEmail(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Send email based on the new status
  const sendStatusEmail = async (order: Order, status: OrderStatus) => {
    const adminEmail = settings ? undefined : undefined; // Uses TEST_EMAIL from resend config

    try {
      switch (status) {
        case 'awaiting_payment': {
          // Send order confirmation with payment details
          const paymentDetails = settings ? {
            upiIds: settings.upiIds || [],
            bankDetails: settings.bankDetails || '',
            paymentInstructions: settings.paymentInstructions || '',
          } : { upiIds: [], bankDetails: '', paymentInstructions: '' };

          await fetch('/api/emails/order-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order, paymentDetails }),
          });
          break;
        }
        case 'payment_verified': {
          await fetch('/api/emails/payment-verified', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order }),
          });
          break;
        }
        case 'order_shipped': {
          await fetch('/api/emails/order-shipped', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order }),
          });
          break;
        }
        case 'order_cancelled': {
          await fetch('/api/emails/order-cancelled', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order }),
          });
          break;
        }
        default: {
          await fetch('/api/emails/order-updated', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order }),
          });
          break;
        }
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error('Order updated but email failed to send.');
    }
  };

  const handleSaveOrder = async () => {
    if (!selectedOrder) return;

    if (newStatus === 'order_shipped' && (!trackingId.trim() || !courierPartner.trim())) {
      toast.error('Courier Partner and Tracking ID are required to mark the order as shipped.');
      return;
    }

    setIsUpdating(true);
    try {
      const subtotal = editableItems.reduce((s, i) => s + i.price * i.quantity, 0);
      const newTotal = subtotal - (selectedOrder.discountAmount || 0) + editableShipping;

      const updates: Record<string, unknown> = {
        adminNote,
        trackingId,
        courierPartner,
        items: editableItems,
        shippingCharge: editableShipping,
        totalPrice: newTotal > 0 ? newTotal : 0,
      };

      if (newStatus) {
        updates.status = newStatus;
        if (newStatus === 'order_cancelled') {
          updates.cancellationReason = cancellationReason;
        }
        // Track which emails have been sent
        const emailsSent = [...(selectedOrder.emailsSent || [])];
        if (!emailsSent.includes(newStatus)) {
          emailsSent.push(newStatus);
        }
        updates.emailsSent = emailsSent;
      }

      const res = await fetch(`/api/db/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error('Failed to update order');

      const updatedOrder = await res.json();

      // Send email if status changed to a forward status OR if resend is requested on same status
      const isForwardTransition = newStatus && STATUS_ORDER[newStatus] > STATUS_ORDER[selectedOrder.status];
      const statusForEmail = isForwardTransition ? newStatus : (resendEmail ? selectedOrder.status : null);
      if (statusForEmail) {
        await sendStatusEmail(updatedOrder, statusForEmail);
      }

      // Update local state
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      setSelectedOrder(updatedOrder);
      setNewStatus('');
      setResendEmail(false);
      toast.success(statusForEmail
        ? `Order updated & email sent.`
        : 'Order details saved.'
      );
    } catch (error) {
      console.error(error);
      toast.error('Failed to update order.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status as OrderStatus];
    if (!config) return <Badge variant="outline">{status}</Badge>;

    const colorMap: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
      awaiting_payment: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100',
      payment_verified: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
      order_shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-100',
      order_completed: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
      order_cancelled: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
    };

    return (
      <Badge className={cn('gap-1', colorMap[status])}>
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'awaiting_payment': return <CreditCard className="h-4 w-4" />;
      case 'payment_verified': return <CheckCircle2 className="h-4 w-4" />;
      case 'order_shipped': return <Truck className="h-4 w-4" />;
      case 'order_completed': return <PackageOpen className="h-4 w-4" />;
      case 'order_cancelled': return <XCircle className="h-4 w-4" />;
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.deliveryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.userEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || o.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const availableTransitions = selectedOrder ? STATUS_TRANSITIONS[selectedOrder.status] || [] : [];

  if (isLoading) {
    return <Loading text="Loading orders..." />;
  }

  return (
    <>
      <Reveal animation="fade-up" className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Order Management</h1>
            <p className="text-muted-foreground mt-1">Review orders, verify payments, update statuses, and trigger customer emails.</p>
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
                { value: 'awaiting_payment', label: 'Awaiting Pay' },
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
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-muted-foreground">
                      <ShoppingCart className="h-12 w-12 text-primary/30 mx-auto mb-4" />
                      {orders.length === 0 ? 'No orders have been placed yet.' : 'No orders match your filters.'}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => openOrderModal(order)}>
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
                        <Button variant="ghost" size="sm" className="rounded-full hover:bg-primary/10 hover:text-primary" onClick={(e) => { e.stopPropagation(); openOrderModal(order); }}>
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
      </Reveal>

      {/* ===== Order Detail Modal ===== */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={`Order #${selectedOrder?.id.substring(0, 8) || ''}`}
        variant="large"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={closeModal} className="flex-1 rounded-xl h-12">
              Close
            </Button>
            <Button
              onClick={handleSaveOrder}
              disabled={isUpdating}
              className="flex-1 rounded-xl h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            >
              {isUpdating ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Send className="h-4 w-4 mr-2" /> Save & Send Email</>
              )}
            </Button>
          </div>
        }
      >
        {selectedOrder && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">

            {/* Current Status */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border/50">
              <div className="flex items-center gap-3">
                {getStatusIcon(selectedOrder.status)}
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Current Status</span>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
              </div>
              {selectedOrder.emailsSent && selectedOrder.emailsSent.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {selectedOrder.emailsSent.length} email(s) sent
                </div>
              )}
            </div>

            {/* Status Change */}
            {availableTransitions.length > 0 && (
              <div className="p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 space-y-3">
                <label className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <ChevronDown className="h-3 w-3" /> Change Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTransitions.map(status => {
                    const config = STATUS_CONFIG[status];
                    const isSelected = newStatus === status;
                    return (
                      <button
                        key={status}
                        onClick={() => {
                          setNewStatus(isSelected ? '' : status);
                          setResendEmail(false);
                        }}
                        className={cn(
                          'px-4 py-2 rounded-xl text-sm font-medium border transition-all flex items-center gap-2',
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/30'
                            : 'bg-background border-border/50 hover:border-primary/50 hover:bg-primary/5 text-foreground'
                        )}
                      >
                        {getStatusIcon(status)}
                        {config?.label || status}
                      </button>
                    );
                  })}
                </div>

                {newStatus === 'awaiting_payment' && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 text-sm text-orange-800 dark:text-orange-300">
                    <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>This will send the customer an <strong>order confirmation email with payment details</strong> (UPI IDs, bank info).</span>
                  </div>
                )}
                {newStatus === 'payment_verified' && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>This will send the customer a <strong>payment verified</strong> confirmation email.</span>
                  </div>
                )}
                {newStatus === 'order_cancelled' && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-sm text-red-800 dark:text-red-300">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>This will send the customer an <strong>order cancellation</strong> email.</span>
                  </div>
                )}
              </div>
            )}

            {/* Resend Email Checkbox */}
            {!newStatus && (

              <label className="flex items-center gap-2 p-3 rounded-xl border border-border/50 bg-background cursor-pointer hover:bg-muted/40 transition-colors">
                <input
                  type="checkbox"
                  checked={resendEmail}
                  onChange={(e) => setResendEmail(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium">Resend current status email (useful if you updated prices)</span>
              </label>
            )}

            {/* Cancellation Reason (shown when cancelling) */}
            {newStatus === 'order_cancelled' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-red-600 uppercase tracking-widest">Cancellation Reason *</label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Explain to the customer why this order is being cancelled..."
                  rows={3}
                  className="w-full rounded-xl border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                />
              </div>
            )}

            {/* Tracking Info (shown for shipped+ or when changing to shipped) */}
            {(selectedOrder.status === 'order_shipped' || selectedOrder.status === 'order_completed' || newStatus === 'order_shipped') && (
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200/50 dark:border-indigo-800/50 space-y-3">
                <label className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                  <Truck className="h-3 w-3" /> Shipping Details
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground uppercase">Courier Partner</label>
                    <input
                      value={courierPartner}
                      onChange={(e) => setCourierPartner(e.target.value)}
                      placeholder="e.g. DTDC, Blue Dart"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground uppercase">Tracking ID / AWB</label>
                    <input
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      placeholder="e.g. AWB123456"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Customer & Delivery Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <UserIcon className="h-3 w-3" /> Customer
                </h4>
                <div className="space-y-1">
                  <p className="font-medium text-sm">{selectedOrder.userName || selectedOrder.deliveryName}</p>
                  <p className="text-xs text-muted-foreground">{selectedOrder.userEmail}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="h-3 w-3" /> Delivery
                </h4>
                <div className="space-y-1">
                  <p className="font-medium text-sm">{selectedOrder.deliveryName}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{selectedOrder.deliveryPhone}</p>
                  <p className="text-xs text-muted-foreground">{selectedOrder.deliveryAddress}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Package className="h-3 w-3" /> Items ({selectedOrder.items.length})
              </h4>
              <div className="space-y-2">
                {editableItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border/50">
                    <div className="h-12 w-12 bg-muted rounded-lg overflow-hidden shrink-0">
                      {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.metadata?.size && `Size: ${item.metadata.size} • `}Qty: {item.quantity}
                      </p>
                    </div>
                    {selectedOrder.status === 'pending' || selectedOrder.status === 'awaiting_payment' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">₹</span>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => {
                            const newItems = [...editableItems];
                            newItems[idx].price = Number(e.target.value) || 0;
                            setEditableItems(newItems);
                          }}
                          className="w-20 rounded-md border border-border bg-background px-2 py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 text-right"
                        />
                      </div>
                    ) : (
                      <p className="font-bold text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Price Summary */}
              <div className="border-t border-border/50 pt-3 space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{editableItems.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}</span>
                </div>
                {selectedOrder.discountAmount && selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({selectedOrder.coupon?.code})</span>
                    <span>-₹{selectedOrder.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground items-center">
                  <span>Shipping</span>
                  {selectedOrder.status === 'pending' || selectedOrder.status === 'awaiting_payment' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">₹</span>
                      <input
                        type="number"
                        value={editableShipping}
                        onChange={(e) => setEditableShipping(Number(e.target.value) || 0)}
                        className="w-20 rounded-md border border-border bg-background px-2 py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 text-right"
                      />
                    </div>
                  ) : (
                    <span>₹{editableShipping.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border/50">
                  <span>Total</span>
                  <span className="text-primary">₹{Math.max(0, editableItems.reduce((s, i) => s + i.price * i.quantity, 0) - (selectedOrder.discountAmount || 0) + editableShipping).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Customer Message */}
            {selectedOrder.message && (
              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/50 space-y-2">
                <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="h-3 w-3" /> Customer Note
                </h4>
                <p className="text-sm text-amber-800 dark:text-amber-300">{selectedOrder.message}</p>
              </div>
            )}

            {/* Admin Note */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <FileText className="h-3 w-3" /> Admin Note
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Internal notes (not visible to the customer)..."
                rows={2}
                className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Order Meta */}
            <div className="flex flex-wrap gap-4 text-[10px] text-muted-foreground uppercase tracking-widest pt-2 border-t border-border/50">
              <span>Created: {new Date(selectedOrder.createdAt).toLocaleString()}</span>
              <span>Updated: {new Date(selectedOrder.updatedAt).toLocaleString()}</span>
              <span>ID: {selectedOrder.id}</span>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
