'use client';

import { Reveal } from '@/components/shared/reveal';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, GraduationCap, Calendar, ArrowUpRight, TrendingUp, Search, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TableMolecule } from '@/components/shared/molecules/table';
import { Input } from '@/components/shared/atoms/input';
import { Button } from '@/components/ui/button';
import { Db } from '@/lib/db';
import { formatPrice } from '@/constants/pricing';
import type { Order } from '@/types';
import { Badge } from '@/components/ui/badge';
import { TabMolecule, type TabOption } from '@/components/shared/molecules/tabs';
import { SectionHeader } from '@/components/shared/molecules/section-header';
import { Loading } from '@/components/shared/molecules/loading';

const REVENUE_CATEGORIES: TabOption[] = [
  { value: 'all', label: 'All', icon: DollarSign },
  { value: 'product', label: 'Products', icon: ShoppingBag },
];

interface RevenueItem {
  id: string;
  type: 'product' | 'mixed';
  name: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  amount: number;
  date: string;
  status: string;
}

export default function AdminRevenuePage() {
  const [revenueItems, setRevenueItems] = useState<RevenueItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<RevenueItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'product'>('all');
  const [totals, setTotals] = useState({
    total: 0,
    products: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      // We are directly fetching the aggregated revenues table which already filters by active revenues
      const revenues = await Db.getAll<{
        id: string;
        sourceType: string;
        amount: number;
        status: string;
        sourceCreatedAt: string;
        customerName: string;
        customerEmail: string;
        itemName: string;
        orderId?: string;
      }>('revenues');

      const validOrderStatuses = ['payment_uploaded', 'verified', 'completed', 'payment_verified', 'order_shipped', 'order_completed'];

      const isValidRevenue = (type: string, status: string) => {
        if (type === 'order') return validOrderStatuses.includes(status);
        return false;
      };

      // Only count if it's a top-level revenue (not a child of another order)
      const validRevenues = revenues.filter(r => isValidRevenue(r.sourceType, r.status) && !r.orderId);

      const allItems: RevenueItem[] = validRevenues.map(r => ({
        id: r.id,
        type: r.sourceType === 'booking' ? 'consultation' : r.sourceType as any,
        name: r.itemName,
        userName: r.customerName,
        userEmail: r.customerEmail,
        amount: r.amount,
        date: r.sourceCreatedAt,
        status: r.status,
      })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setRevenueItems(allItems);
      setFilteredItems(allItems);

      setTotals({
        total: allItems.reduce((acc, curr) => acc + curr.amount, 0),
        products: allItems.filter(i => i.type === 'product').reduce((acc, curr) => acc + curr.amount, 0),
      });
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    let result = revenueItems;
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.userName.toLowerCase().includes(query) ||
        item.userEmail.toLowerCase().includes(query) ||
        item.userPhone?.includes(query) ||
        item.id.toLowerCase().includes(query)
      );
    }
    if (filterType !== 'all') {
      result = result.filter(item => item.type === filterType);
    }
    setFilteredItems(result);
  }, [searchTerm, filterType, revenueItems]);

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(184, 134, 11); // Brand gold
    doc.text('Revenue Report', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Nature\'s Nook Duo Administration Dashboard', 14, 30);

    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 40);
    doc.text(`Category: ${filterType === 'all' ? 'All Categories' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}`, 14, 46);

    // Stats Summary
    doc.setFillColor(245, 245, 245);
    doc.rect(14, 52, 182, 20, 'F');

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Total Transactions:', 20, 60);
    doc.text('Total Revenue:', 110, 60);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(`${filteredItems.length}`, 20, 66);
    doc.text(`Rs. ${filteredItems.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('en-IN')}`, 110, 66);

    const tableData = filteredItems.map(item => [
      new Date(item.date).toLocaleDateString(),
      item.name,
      item.type.charAt(0).toUpperCase() + item.type.slice(1),
      item.userName,
      `Rs. ${item.amount.toLocaleString('en-IN')}`
    ]);

    autoTable(doc, {
      startY: 80,
      head: [['Date', 'Description', 'Category', 'Customer', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [184, 134, 11],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        4: { halign: 'right' }
      }
    });

    const fileName = `revenue-report-${filterType}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  if (isLoading) {
    return <Loading text="Loading financial records..." />;
  }

  return (
    <Reveal animation="fade-up" className="space-y-6">
      <SectionHeader 
        title="Revenue Dashboard"
        description="Track your shop's financial performance and transactions."
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-brand-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-accent">{formatPrice(totals.total)}</div>
            <p className="text-[10px] text-green-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +15% vs last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Products</CardTitle>
            <ShoppingBag className="h-4 w-4 text-brand-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totals.products)}</div>
            <p className="text-[10px] text-muted-foreground mt-1">From order requests</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by client name, email or phone..."
            className="pl-10 bg-card/50 border-border"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <TabMolecule
          options={REVENUE_CATEGORIES}
          value={filterType}
          onValueChange={(val) => setFilterType(val as any)}
          className="w-full sm:w-auto"
        />
        <Button
          variant="outline"
          className="gap-2 border-border bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent ml-auto"
          onClick={exportToPDF}
        >
          <Download className="h-4 w-4" /> Export Report
        </Button>
      </div>

      <TableMolecule
        data={filteredItems}
        columns={[
          {
            header: 'Transaction Details',
            cell: (item) => (
              <>
                <div className="font-medium text-sm">{item.name}</div>
                <div className="text-[10px] text-muted-foreground font-mono">#{item.id.slice(0, 8)}</div>
              </>
            )
          },
          {
            header: 'Category',
            cell: (item) => (
              <Badge variant="outline" className={`text-[10px] uppercase tracking-widest border-0 ${item.type === 'product' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-blue-500/10 text-blue-400'
                }`}>
                {item.type}
              </Badge>
            )
          },
          {
            header: 'Customer',
            cell: (item) => (
              <>
                <div className="text-sm font-medium">{item.userName}</div>
                <div className="text-xs text-muted-foreground">{item.userEmail}</div>
              </>
            )
          },
          {
            header: 'Date',
            cell: (item) => <span className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</span>
          },
          {
            header: 'Amount',
            align: 'right',
            cell: (item) => <span className="font-bold text-brand-accent">{formatPrice(item.amount)}</span>
          }
        ]}
        renderMobileItem={(item) => (
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-sm">{item.name}</h3>
                <p className="text-[10px] text-muted-foreground font-mono">#{item.id.slice(0, 8)}</p>
              </div>
              <Badge variant="outline" className={`text-[10px] uppercase tracking-widest border-0 ${item.type === 'product' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-blue-500/10 text-blue-400'
                }`}>
                {item.type}
              </Badge>
            </div>
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-sm font-medium">{item.userName}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p>
              </div>
              <div className="text-lg font-bold text-brand-accent">
                {formatPrice(item.amount)}
              </div>
            </div>
          </div>
        )}
        emptyDescription="No transactions found."
      />
    </Reveal>
  );
}
