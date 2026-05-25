'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Users, ShoppingCart, PackageSearch, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/shared/reveal';
import Link from 'next/link';
import { Loading } from '@/components/shared/molecules/loading';

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { name: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: <DollarSign className="h-6 w-6" />, color: 'text-green-600', bg: 'bg-green-100', href: '/admin/revenue', trend: '+12.5%' },
    { name: 'Active Orders', value: stats.totalOrders, icon: <ShoppingCart className="h-6 w-6" />, color: 'text-blue-600', bg: 'bg-blue-100', href: '/admin/orders', trend: '+5.2%' },
    { name: 'Total Products', value: stats.totalProducts, icon: <PackageSearch className="h-6 w-6" />, color: 'text-amber-600', bg: 'bg-amber-100', href: '/admin/products', trend: 'Stable' },
    { name: 'Registered Users', value: stats.totalUsers, icon: <Users className="h-6 w-6" />, color: 'text-indigo-600', bg: 'bg-indigo-100', href: '/admin/users', trend: '+18.1%' },
  ];

  if (isLoading) {
    return <Loading text="Loading dashboard stats..." />;
  }

  return (
    <Reveal animation="fade-up" className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-light to-accent pb-1">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back, Admin. Here is what's happening at Nature's Nook Duo today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Link href={stat.href} key={i} className="group glass rounded-2xl p-6 border border-border/50 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer block relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <div className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <TrendingUp className="h-3 w-3 mr-1" />
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">{stat.name}</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">{stat.value}</h3>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions or Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass rounded-2xl p-6 border border-border/50 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading text-xl font-bold">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm font-medium text-primary hover:underline flex items-center">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border/50">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">JD</div>
                <div>
                  <p className="font-medium text-sm">John Doe</p>
                  <p className="text-xs text-muted-foreground">ORD-1234 • 2 items</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">₹4,500.00</p>
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Pending</span>
              </div>
            </div>
            {/* More mock orders can be added here */}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 border border-border/50 shadow-sm bg-gradient-to-br from-amber-50/50 to-amber-100/30 dark:from-amber-900/10 dark:to-amber-900/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-heading text-lg font-bold">Low Stock Alerts</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">3 products are running low on inventory.</p>
            <Link href="/admin/products" className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center">
              Review Inventory <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
