'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, User as UserIcon, Search, Leaf, LogOut, LayoutDashboard, Heart, Package, Store, ShoppingBag, BookOpen, X, Trash2, Bell } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useUiStore } from '@/store/ui-store';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotificationStore } from '@/store/notification-store';
import { NotificationCenter } from '@/components/shared/notification-center';

export function Navbar() {
  const { items, totalPrice, totalItems, updateQuantity, removeItem } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { setAdminSidebarOpen } = useUiStore();
  const pathname = usePathname();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { unreadCount, loadNotifications } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      loadNotifications(user.id);
    }
  }, [user, loadNotifications]);

  if (pathname === '/login') {
    return null;
  }

  const getLinkClasses = (path: string) => {
    const isActive = path === '/' ? pathname === '/' : (pathname === path || pathname.startsWith(`${path}/`));
    return `relative text-sm font-medium transition-colors flex items-center gap-1.5 py-1 ${isActive ? 'text-primary' : 'text-foreground/80 hover:text-primary'} group`;
  };

  const getLinkUnderline = (path: string) => {
    const isActive = path === '/' ? pathname === '/' : (pathname === path || pathname.startsWith(`${path}/`));
    return <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />;
  };

  const getMobileLinkClasses = (path: string) => {
    const isActive = path === '/' ? pathname === '/' : (pathname === path || pathname.startsWith(`${path}/`));
    return `cursor-pointer ${isActive ? 'bg-primary/10 text-primary font-medium' : ''}`;
  };

  return (
    <>
      <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-background/90 backdrop-blur-xl border-b border-border shadow-sm' : 'bg-background/80 backdrop-blur-lg border-b border-border/40'}`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 md:h-20 items-center justify-between transition-all duration-300">
            {/* Logo Section */}
            <div className="flex items-center gap-2">
              {pathname.startsWith('/admin') ? (
                <>
                  <div className="flex lg:hidden items-center gap-2">
                    <button 
                      onClick={() => setAdminSidebarOpen(true)}
                      className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 outline-none"
                    >
                      <Menu className="h-6 w-6" />
                    </button>
                    <span className="font-heading text-2xl font-bold tracking-tight text-primary hidden sm:inline-block">
                      Nature's Nook Duo
                    </span>
                  </div>
                  <Link href="/" className="hidden lg:flex items-center gap-2 group">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Leaf className="h-6 w-6 animate-pulse-glow" />
                    </div>
                    <span className="font-heading text-2xl font-bold tracking-tight text-primary">
                      Nature's Nook Duo
                    </span>
                  </Link>
                </>
              ) : (
                <Link href="/" className="flex items-center gap-2 group">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Leaf className="h-6 w-6 animate-pulse-glow" />
                  </div>
                  <span className="font-heading text-2xl font-bold tracking-tight text-primary hidden sm:inline-block">
                    Nature's Nook Duo
                  </span>
                </Link>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              {pathname.startsWith('/admin') ? (
                <Link href="/" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-2">
                  <Store className="h-4 w-4" /> View Storefront
                </Link>
              ) : (
                <>
                  <Link href="/shop" className={getLinkClasses('/shop')}>
                    <ShoppingBag className="h-4 w-4" /> Shop
                    {getLinkUnderline('/shop')}
                  </Link>
                  <Link href="/care-guides" className={getLinkClasses('/care-guides')}>
                    <BookOpen className="h-4 w-4" /> Care Guides
                    {getLinkUnderline('/care-guides')}
                  </Link>
                  {isAuthenticated && (
                    <>
                      <Link href="/liked" className={getLinkClasses('/liked')}>
                        <Heart className="h-4 w-4" /> Favorites
                        {getLinkUnderline('/liked')}
                      </Link>
                      <Link href="/dashboard/orders" className={getLinkClasses('/dashboard/orders')}>
                        <Package className="h-4 w-4" /> My Orders
                        {getLinkUnderline('/dashboard/orders')}
                      </Link>
                    </>
                  )}
                  {user?.role === 'admin' && (
                    <Link href="/admin/dashboard" className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full dark:bg-amber-500/10 dark:text-amber-500">
                      <LayoutDashboard className="h-4 w-4" /> Admin
                    </Link>
                  )}
                </>
              )}
            </nav>

            {/* Actions Section */}
            <div className="flex items-center gap-2 sm:gap-4">

              {/* Mobile Storefront -> Admin Quick Toggle */}
              {user?.role === 'admin' && !pathname.startsWith('/admin') && (
                <Link href="/admin/dashboard" className="md:hidden flex items-center justify-center bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 px-3 h-8 rounded-full text-[10px] font-bold tracking-widest uppercase border border-amber-200 dark:border-amber-900/50">
                  Admin
                </Link>
              )}

              <ThemeToggle />

              {isAuthenticated && !pathname.startsWith('/admin') && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCartOpen(true)}
                  className="relative group outline-none text-foreground/80 hover:text-primary"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems() > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-accent text-accent-foreground p-0 text-[10px]">
                      {totalItems()}
                    </Badge>
                  )}
                </Button>
              )}

              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotifications(true)}
                  className="relative group outline-none text-foreground/80 hover:text-primary"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground p-0 text-[10px] badge-animate">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              )}

              {/* Auth Menu */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-background hover:bg-muted outline-none">
                    <UserIcon className="h-5 w-5 text-foreground/80" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-background border">
                    <div className="font-heading font-normal px-2 py-1.5">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-foreground">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    {user?.role === 'admin' && (
                      <Link href="/admin/dashboard" className="w-full">
                        <DropdownMenuItem className="cursor-pointer flex items-center">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <Link href="/dashboard/profile" className="w-full">
                      <DropdownMenuItem className="cursor-pointer flex items-center">
                        <UserIcon className="mr-2 h-4 w-4" />
                        My Profile
                      </DropdownMenuItem>
                    </Link>

                    <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login" className="inline-block">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-medium rounded-full px-4 sm:px-6">
                    Sign In
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              {!pathname.startsWith('/admin') && (
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-muted text-foreground/80 hover:text-primary outline-none">
                      <Menu className="h-6 w-6" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-background border">
                      <Link href="/shop">
                        <DropdownMenuItem className={getMobileLinkClasses('/shop')}>
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          Shop
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/care-guides">
                        <DropdownMenuItem className={getMobileLinkClasses('/care-guides')}>
                          <BookOpen className="mr-2 h-4 w-4" />
                          Care Guides
                        </DropdownMenuItem>
                      </Link>
                      {!isAuthenticated && (
                        <Link href="/login">
                          <DropdownMenuItem className={getMobileLinkClasses('/login')}>
                            <UserIcon className="mr-2 h-4 w-4" />
                            Sign In
                          </DropdownMenuItem>
                        </Link>
                      )}
                      {isAuthenticated && (
                        <>
                          <Link href="/liked">
                            <DropdownMenuItem className={getMobileLinkClasses('/liked')}>
                              <Heart className="mr-2 h-4 w-4" />
                              Favorites
                            </DropdownMenuItem>
                          </Link>
                          <Link href="/dashboard/orders">
                            <DropdownMenuItem className={getMobileLinkClasses('/dashboard/orders')}>
                              <Package className="mr-2 h-4 w-4" />
                              My Orders
                            </DropdownMenuItem>
                          </Link>
                        </>
                      )}
                      {user?.role === 'admin' && (
                        <Link href="/admin/dashboard">
                          <DropdownMenuItem className="cursor-pointer text-amber-600 dark:text-amber-500 font-medium bg-amber-50 dark:bg-amber-500/10 mt-1">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </DropdownMenuItem>
                        </Link>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <div className="h-16 md:h-20 w-full shrink-0" />

      {/* Slide-over Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />

          {/* Drawer */}
          <div className="relative w-full max-w-md bg-background border-l border-border h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
                <ShoppingCart className="h-6 w-6 text-primary" />
                Your Cart
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="h-8 w-8 flex items-center justify-center rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                    <ShoppingCart className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <p className="text-muted-foreground font-medium">Your cart is empty.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map(item => (
                    <div key={`${item.id}-${item.metadata?.size || 'default'}`} className="flex gap-4 border border-border/50 p-3 rounded-2xl bg-card relative group">
                      <div className="h-20 w-20 bg-muted rounded-xl overflow-hidden shrink-0">
                        {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-sm line-clamp-1 pr-6">{item.name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.metadata?.size ? `Size: ${item.metadata.size}` : ''}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-border/60 rounded-full bg-background px-2 py-0.5 h-8">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.metadata?.size)}
                              className="text-muted-foreground hover:text-foreground font-medium w-5 h-5 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                            >-</button>
                            <span className="font-medium text-xs w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.metadata?.size)}
                              className="text-muted-foreground hover:text-foreground font-medium w-5 h-5 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                            >+</button>
                          </div>
                          <p className="font-bold text-sm text-primary">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.metadata?.size)}
                        className="absolute top-3 right-3 text-muted-foreground/60 hover:text-destructive transition-colors p-1 rounded-full hover:bg-destructive/10"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border bg-card/50 space-y-4">
              <div className="flex justify-between font-bold text-lg mb-2">
                <span className="text-muted-foreground">Estimated Total</span>
                <span>₹{totalPrice().toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => setIsCartOpen(false)} className="w-full rounded-xl h-12">
                  Continue Shopping
                </Button>
                <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
                  <Button className="w-full rounded-xl h-12 shadow-lg shadow-primary/20">Checkout</Button>
                </Link>
              </div>
              <Link href="/cart" onClick={() => setIsCartOpen(false)}>
                <Button variant="ghost" className="w-full text-xs text-muted-foreground mt-2">View Full Cart</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
      <NotificationCenter open={showNotifications} onOpenChange={setShowNotifications} />
    </>
  );
}
