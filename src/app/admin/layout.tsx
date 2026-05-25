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
import { MobileSidebar, type MobileSidebarSection } from '@/components/common/MobileSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { adminSidebarOpen: sidebarOpen, setAdminSidebarOpen: setSidebarOpen } = useUiStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Products', href: '/admin/products', icon: PackageSearch },
    { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Revenue', href: '/admin/revenue', icon: DollarSign },
    { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
    { name: 'Care Guides', href: '/admin/care-guides', icon: BookOpen },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    { name: 'View Storefront', href: '/', icon: Store },
  ];

  // Mobile sidebar sections — same structure as user sidebar
  const adminMobileSections: MobileSidebarSection[] = [
    {
      label: 'Management',
      items: [
        { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Categories', href: '/admin/categories', icon: FolderTree },
        { label: 'Products', href: '/admin/products', icon: PackageSearch },
        { label: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
        { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
        { label: 'Revenue', href: '/admin/revenue', icon: DollarSign },
        { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
        { label: 'Care Guides', href: '/admin/care-guides', icon: BookOpen },
        { label: 'Users', href: '/admin/users', icon: Users },
        { label: 'Settings', href: '/admin/settings', icon: Settings },
      ],
    },
    {
      items: [
        { label: 'View Storefront', href: '/', icon: Store, exact: true, highlight: 'amber' },
      ],
    },
  ];

  return (
    <AuthGuard requireAdmin>
      <div className="flex w-full h-[calc(100vh-5rem)] overflow-hidden relative">

        {/* Mobile Sidebar — uses the shared MobileSidebar component */}
        <MobileSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sections={adminMobileSections}
          showSignOut
          onSignOut={logout}
        />

        {/* Desktop Sidebar — only visible on lg+ */}
        <aside className={cn(
          "hidden lg:flex fixed inset-y-0 left-0 z-0 bg-background/95 backdrop-blur-xl border-r border-border transition-all duration-300 ease-in-out flex-col h-full group lg:static",
          isCollapsed ? "lg:w-20" : "w-64"
        )}>
          {/* Collapse Toggle */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-6 h-6 w-6 bg-background border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary z-50 transition-colors shadow-sm"
          >
            {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </button>

          <nav className="flex-1 px-4 py-6 lg:pt-12 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-foreground/80 hover:bg-muted hover:text-foreground",
                    isCollapsed ? "justify-center px-0" : ""
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <div className="shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={cn("text-base", isCollapsed ? "hidden" : "")}>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-border/50 shrink-0">
            <Button 
              variant="ghost" 
              className={cn("flex items-center gap-3 py-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all", isCollapsed ? "justify-center w-12 h-12 p-0 mx-auto" : "justify-start w-full px-4")}
              onClick={logout}
              title={isCollapsed ? "Log Out" : undefined}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span className={cn(isCollapsed ? "hidden" : "", "text-base")}>Log Out</span>
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
