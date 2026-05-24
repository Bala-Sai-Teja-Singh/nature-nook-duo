import { 
  Home, ShoppingBag, BookOpen, Heart,
  LayoutDashboard, Package, Users, Settings, ClipboardList, MessageSquare, DollarSign, Ticket, FolderTree
} from 'lucide-react';

export const USER_NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Shop', href: '/shop', icon: ShoppingBag, module: 'products' },
  { label: 'Care Guides', href: '/care-guides', icon: BookOpen },
];

export const MOBILE_NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Shop', href: '/shop', icon: ShoppingBag, module: 'products' },
  { label: 'My Orders', href: '/dashboard/orders', icon: ClipboardList, module: 'products' },
  { label: 'Favorites', href: '/liked', icon: Heart, module: 'products' },
];

export const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree, module: 'products' },
  { label: 'Products', href: '/admin/products', icon: Package, module: 'products' },
  { label: 'Reviews', href: '/admin/reviews', icon: MessageSquare, module: 'products' },
  { label: 'Orders', href: '/admin/orders', icon: ClipboardList, module: 'products' },
  { label: 'Revenue', href: '/admin/revenue', icon: DollarSign },
  { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
  { label: 'Care Guides', href: '/admin/care-guides', icon: BookOpen },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export const DASHBOARD_NAV_ITEMS = [
  { label: 'My Orders', href: '/dashboard/orders', icon: ClipboardList, module: 'products' },
  { label: 'Favorites', href: '/liked', icon: Heart, module: 'products' },
  { label: 'Profile', href: '/dashboard/profile', icon: Settings },
];

export const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Dashboard Overview',
  '/admin/categories': 'Product Categories',
  '/admin/products': 'Products Management',
  '/admin/reviews': 'Customer Reviews',
  '/admin/orders': 'Orders Management',
  '/admin/revenue': 'Revenue Analytics',
  '/admin/coupons': 'Discount Coupons',
  '/admin/care-guides': 'Care Guides Management',
  '/admin/users': 'User Management',
  '/admin/settings': 'System Settings',
  '/dashboard/orders': 'My Orders',
  '/dashboard/profile': 'My Profile',
  '/liked': 'Favorite Items',
  '/shop': 'Nature\'s Nook Duo Shop',
  '/care-guides': 'Expert Care Guides',
  '/cart': 'Your Shopping Cart',
  '/checkout': 'Secure Checkout',
};
