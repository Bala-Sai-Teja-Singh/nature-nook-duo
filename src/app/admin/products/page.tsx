'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { 
  PackageSearch, 
  Plus, 
  MoreHorizontal, 
  Check, 
  X, 
  ShieldCheck, 
  Leaf, 
  Search,
  Loader2, 
  Save,
  Edit2,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { TabMolecule } from '@/components/shared/molecules/tabs';
import { Modal } from '@/components/shared/molecules/modal';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/shared/atoms/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Db } from '@/lib/db';
import type { Category } from '@/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', breed: '', mainCategory: '', description: '', isVisible: true, customMeta: {}
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const fetchProductsAndCategories = async () => {
    try {
      const [res, cats] = await Promise.all([
        fetch('/api/db/products'),
        Db.getAll<Category>('categories')
      ]);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
      setCategories(cats);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      breed: product.breed,
      mainCategory: typeof product.mainCategory === 'string' ? product.mainCategory : (product.mainCategory as any).name,
      description: product.description,
      images: product.images,
      isVisible: product.isVisible,
      customMeta: product.customMeta || {},
      careLevel: product.careLevel,
      available: product.available,
      sizes: product.sizes
    });
    setIsModalOpen(true);
  };

  const handleToggleVisibility = async (product: Product) => {
    try {
      const res = await fetch(`/api/db/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !product.isVisible }),
      });
      if (res.ok) {
        toast({ title: 'Success', description: `Product is now ${!product.isVisible ? 'visible' : 'hidden'}.` });
        fetchProductsAndCategories();
      } else {
        throw new Error();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update visibility', variant: 'destructive' });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/db/products/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast({ title: 'Success', description: 'Product deleted successfully.' });
        fetchProductsAndCategories();
      } else {
        throw new Error();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete product', variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.mainCategory) {
      toast({ title: 'Error', description: 'Name and Category are required.', variant: 'destructive' });
      return;
    }
    
    // Check if at least one custom Meta field is filled
    const hasCustomMeta = Object.values(formData.customMeta || {}).some(val => val && String(val).trim() !== '');
    if (!hasCustomMeta && selectedCategoryData && selectedCategoryData.fields.length > 0) {
      toast({ title: 'Error', description: 'At least one category-specific field is required to add a product.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      if (editingProduct) {
        // Edit existing product
        const res = await fetch(`/api/db/products/${editingProduct.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            breed: formData.breed || formData.name,
            mainCategory: formData.mainCategory,
            images: formData.images || [],
            description: formData.description || '',
            customMeta: formData.customMeta || {},
            careLevel: formData.careLevel || editingProduct.careLevel || 'beginner',
            isVisible: formData.isVisible !== undefined ? formData.isVisible : editingProduct.isVisible,
            available: formData.available !== undefined ? formData.available : editingProduct.available,
            sizes: formData.sizes || editingProduct.sizes || [{ size: 'Standard', price: 99, stock: 10 }]
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to update product');
        }

        toast({ title: 'Success', description: 'Product updated successfully!' });
      } else {
        // Create new product
        const newId = Math.random().toString(36).substring(2, 9);
        const res = await fetch('/api/db/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newId,
            name: formData.name,
            breed: formData.breed || formData.name,
            mainCategory: formData.mainCategory,
            images: formData.images || [],
            description: formData.description || '',
            customMeta: formData.customMeta || {},
            careLevel: formData.careLevel || 'beginner',
            isVisible: formData.isVisible !== undefined ? formData.isVisible : true,
            available: formData.available !== undefined ? formData.available : true,
            sizes: formData.sizes || [{ size: 'Standard', price: 99, stock: 10 }]
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to create product');
        }

        toast({ title: 'Success', description: 'Product created successfully!' });
      }
      setIsModalOpen(false);
      fetchProductsAndCategories();
    } catch (err) {
      toast({ title: 'Error', description: editingProduct ? 'Failed to update product' : 'Failed to create product', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCategoryData = categories.find(c => c.name === formData.mainCategory || c.id === formData.mainCategory);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Product Management</h1>
          <p className="text-muted-foreground mt-1">Manage your pet catalog, stock, and descriptions.</p>
        </div>
        <Button className="rounded-xl shadow-md h-12 px-6" onClick={() => {
          setEditingProduct(null);
          setFormData({
            name: '', breed: '', mainCategory: '', description: '', isVisible: true, customMeta: {}
          });
          setIsModalOpen(true);
        }}>
          <Plus className="h-5 w-5 mr-2" />
          Add New Product
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 h-10 rounded-xl bg-background border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
        </div>
        <div className="w-full md:w-auto overflow-hidden">
          <TabMolecule
            options={[
              { value: 'All', label: 'All' },
              ...Array.from(new Set(products.map(p => typeof p.mainCategory === 'string' ? p.mainCategory : (p.mainCategory as any).name))).map(cat => ({ value: cat, label: cat }))
            ]}
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="w-full"
          />
        </div>
      </div>

      <div className="glass rounded-3xl border border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-muted/40">
                <th className="p-4 font-medium text-muted-foreground">Pet</th>
                <th className="p-4 font-medium text-muted-foreground">Category</th>
                <th className="p-4 font-medium text-muted-foreground">Breed</th>
                <th className="p-4 font-medium text-muted-foreground">Status</th>
                <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    <Leaf className="h-12 w-12 text-primary/30 mx-auto mb-4" />
                    No products found. Add your first pet to the catalog.
                  </td>
                </tr>
              ) : (
                products.filter(p => {
                  const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.breed?.toLowerCase().includes(searchQuery.toLowerCase());
                  const catName = typeof p.mainCategory === 'string' ? p.mainCategory : (p.mainCategory as any).name;
                  const matchesCategory = selectedCategory === 'All' || catName === selectedCategory;
                  return matchesSearch && matchesCategory;
                }).sort((a, b) => {
                  const catA = typeof a.mainCategory === 'string' ? a.mainCategory : (a.mainCategory as any).name;
                  const catB = typeof b.mainCategory === 'string' ? b.mainCategory : (b.mainCategory as any).name;
                  if (catA < catB) return -1;
                  if (catA > catB) return 1;
                  return a.name.localeCompare(b.name);
                }).map((product) => (
                  <tr key={product.id} className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/50">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <PackageSearch className="h-5 w-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/50" />
                          )}
                        </div>
                        <div className="font-medium text-foreground">{product.name}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="bg-white dark:bg-background">
                        {typeof product.mainCategory === 'string' ? product.mainCategory : (product.mainCategory as any).name}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground text-sm">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        {product.breed}
                      </div>
                    </td>
                    <td className="p-4">
                      {product.isVisible ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200"><Check className="h-3 w-3 mr-1" /> Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800"><X className="h-3 w-3 mr-1" /> Hidden</Badge>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end" className="bg-background border-border shadow-xl">
                          <DropdownMenuItem 
                            onClick={() => handleEditProduct(product)}
                            className="cursor-pointer flex items-center gap-2"
                          >
                            <Edit2 className="h-4 w-4 text-muted-foreground" />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleToggleVisibility(product)}
                            className="cursor-pointer flex items-center gap-2"
                          >
                            {product.isVisible ? (
                              <>
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                Hide Product
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 text-muted-foreground" />
                                Show Product
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="cursor-pointer flex items-center gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit Product" : "Add New Product"}
        variant="default"
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Product Name</Label>
            <Input 
              value={formData.name || ''} 
              onChange={e => setFormData({ ...formData, name: e.target.value })} 
              placeholder="e.g. Mexican Redknee"
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select 
              value={typeof formData.mainCategory === 'string' ? formData.mainCategory : ''} 
              onValueChange={val => setFormData({ ...formData, mainCategory: val || '', customMeta: {} })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Breed / Species</Label>
            <Input 
              value={formData.breed || ''} 
              onChange={e => setFormData({ ...formData, breed: e.target.value })} 
              placeholder="e.g. Brachypelma smithi"
            />
          </div>
          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input 
              value={formData.images?.[0] || ''} 
              onChange={e => setFormData({ ...formData, images: [e.target.value] })} 
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              value={formData.description || ''} 
              onChange={e => setFormData({ ...formData, description: e.target.value })} 
              placeholder="Provide a detailed description of the product..."
              className="min-h-[100px]"
            />
          </div>

          {/* Dynamic Fields */}
          {selectedCategoryData && selectedCategoryData.fields.length > 0 && (
            <div className="pt-4 mt-4 border-t border-border/50 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-brand-accent uppercase tracking-wider mb-1">Category Specific Details</h3>
                <p className="text-xs text-muted-foreground mb-4">At least one category-specific field is required to add this product.</p>
              </div>
              {selectedCategoryData.fields.map(field => (
                <div key={field.id} className="space-y-2">
                  <Label>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {field.type === 'select' || field.type === 'multi-select' ? (
                    <Select 
                      value={formData.customMeta?.[field.id] || ''} 
                      onValueChange={val => setFormData({ ...formData, customMeta: { ...formData.customMeta, [field.id]: val || '' } })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input 
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={formData.customMeta?.[field.id] || ''} 
                      onChange={e => setFormData({ ...formData, customMeta: { ...formData.customMeta, [field.id]: e.target.value } })} 
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border/50">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-primary text-white">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Product
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
