import type { OrderStatus } from '@/types';

export const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending', color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  awaiting_payment: { label: 'Awaiting Payment', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  payment_verified: { label: 'Payment Verified', color: 'text-brand-primary-light', bgColor: 'bg-brand-primary-light/10' },
  order_shipped: { label: 'Order Shipped', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  order_completed: { label: 'Order Completed', color: 'text-brand-primary', bgColor: 'bg-brand-primary/10' },
  order_cancelled: { label: 'Order Cancelled', color: 'text-gray-500', bgColor: 'bg-gray-500/10' },
};

export const ALL_STATUSES: OrderStatus[] = [
  'pending', 'awaiting_payment', 'payment_verified', 'order_shipped', 'order_completed', 'order_cancelled'
];
