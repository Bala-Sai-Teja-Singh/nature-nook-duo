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
  Store,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { AuthGuard } from '@/components/auth-guard';
import { useAuth } from '@/hooks/use-auth';
import { useUiStore } from '@/store/ui-store';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/common/Footer';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { adminSidebarOpen: sidebarOpen, setAdminSidebarOpen: setSidebarOpen } = useUiStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
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
          "fixed inset-y-0 left-0 z-[100] bg-background/95 backdrop-blur-xl border-r border-border transform transition-all duration-300 ease-in-out flex flex-col shadow-2xl lg:static lg:translate-x-0 lg:z-0 lg:shadow-none lg:h-full group",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "lg:w-20 w-64" : "w-64"
        )}>
          {/* Collapse Toggle (Desktop Only) */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-3 top-6 h-6 w-6 bg-background border border-border rounded-full items-center justify-center text-muted-foreground hover:text-primary hover:border-primary z-50 transition-colors shadow-sm"
          >
            {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </button>

          <nav className="flex-1 px-4 py-6 lg:pt-12 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium relative overflow-hidden group/item",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
                    item.name === 'View Storefront' ? "lg:hidden" : "",
                    isCollapsed ? "lg:justify-center lg:px-0" : ""
                  )}
                  onClick={() => setSidebarOpen(false)}
                  title={isCollapsed ? item.name : undefined}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md shadow-[0_0_10px_rgba(var(--primary),0.5)]" />}
                  <div className={cn("shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover/item:text-primary transition-colors")}>
                    {item.icon}
                  </div>
                  <span className={cn("whitespace-nowrap", isCollapsed ? "lg:hidden" : "")}>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-border/50">
            <Button 
              variant="ghost" 
              className={cn("flex items-center gap-3 py-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all", isCollapsed ? "lg:justify-center lg:w-12 lg:h-12 lg:p-0 mx-auto justify-start w-full px-4" : "justify-start w-full px-4")}
              onClick={logout}
              title={isCollapsed ? "Log Out" : undefined}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span className={cn(isCollapsed ? "lg:hidden" : "")}>Log Out</span>
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
