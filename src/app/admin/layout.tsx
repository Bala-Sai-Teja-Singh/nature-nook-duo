'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  PackageSearch, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  Leaf,
  FolderTree,
  MessageSquare,
  DollarSign,
  Ticket,
  BookOpen,
  Store
} from 'lucide-react';
import { AuthGuard } from '@/components/auth-guard';
import { useAuth } from '@/hooks/use-auth';
import { useUiStore } from '@/store/ui-store';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/common/Footer';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { adminSidebarOpen: sidebarOpen, setAdminSidebarOpen: setSidebarOpen } = useUiStore();
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { name: 'Overview', href: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Categories', href: '/admin/categories', icon: <FolderTree className="h-5 w-5" /> },
    { name: 'Products', href: '/admin/products', icon: <PackageSearch className="h-5 w-5" /> },
    { name: 'Reviews', href: '/admin/reviews', icon: <MessageSquare className="h-5 w-5" /> },
    { name: 'Orders', href: '/admin/orders', icon: <ShoppingCart className="h-5 w-5" /> },
    { name: 'Revenue', href: '/admin/revenue', icon: <DollarSign className="h-5 w-5" /> },
    { name: 'Coupons', href: '/admin/coupons', icon: <Ticket className="h-5 w-5" /> },
    { name: 'Care Guides', href: '/admin/care-guides', icon: <BookOpen className="h-5 w-5" /> },
    { name: 'Users', href: '/admin/users', icon: <Users className="h-5 w-5" /> },
    { name: 'Settings', href: '/admin/settings', icon: <Settings className="h-5 w-5" /> },
    { name: 'View Storefront', href: '/', icon: <Store className="h-5 w-5" /> },
  ];

  return (
    <AuthGuard requireAdmin>
      <div className="flex w-full h-[calc(100vh-5rem)] overflow-hidden relative">
        
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-[90] bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-[100] w-64 bg-background border-r border-border transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl lg:static lg:translate-x-0 lg:z-0 lg:shadow-none lg:h-full",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex lg:hidden h-20 items-center gap-2 px-6 border-b border-border/50 shrink-0">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Leaf className="h-6 w-6" />
            </div>
            <span className="font-heading text-2xl font-bold tracking-tight text-primary">
              Nature&apos;s Nook Duo
            </span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
                    item.name === 'View Storefront' ? "lg:hidden" : ""
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-border/50">
            <Button 
              variant="ghost" 
              className="w-full flex items-center justify-start gap-3 px-4 py-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
              onClick={() => logout()}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/30">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
