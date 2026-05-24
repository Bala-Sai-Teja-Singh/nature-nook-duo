'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Users, ShoppingCart, PackageSearch } from 'lucide-react';

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
    { name: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}`, icon: <DollarSign className="h-6 w-6" />, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Active Orders', value: stats.totalOrders, icon: <ShoppingCart className="h-6 w-6" />, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Total Products', value: stats.totalProducts, icon: <PackageSearch className="h-6 w-6" />, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Registered Users', value: stats.totalUsers, icon: <Users className="h-6 w-6" />, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back, Admin. Here is what's happening at Nature Nook Duo today.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 glass rounded-2xl animate-pulse bg-muted/50"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <div key={i} className="glass rounded-2xl p-6 flex items-center gap-4 border border-border/50 shadow-sm transition-transform hover:-translate-y-1">
              <div className={`h-14 w-14 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions or Charts could go here */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass rounded-2xl p-6 border border-border/50 shadow-sm h-80 flex flex-col justify-center items-center text-center">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <PackageSearch className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-heading text-xl font-bold mb-2">Manage Inventory</h3>
          <p className="text-muted-foreground text-sm max-w-xs mb-6">Keep your companions fully stocked and descriptions up to date.</p>
          <a href="/admin/products" className="text-sm font-medium text-primary hover:underline">Go to Products &rarr;</a>
        </div>
        
        <div className="glass rounded-2xl p-6 border border-border/50 shadow-sm h-80 flex flex-col justify-center items-center text-center">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <ShoppingCart className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-heading text-xl font-bold mb-2">Fulfill Orders</h3>
          <p className="text-muted-foreground text-sm max-w-xs mb-6">Review new purchases, verify payments, and arrange safe transport.</p>
          <a href="/admin/orders" className="text-sm font-medium text-primary hover:underline">Go to Orders &rarr;</a>
        </div>
      </div>
    </div>
  );
}
