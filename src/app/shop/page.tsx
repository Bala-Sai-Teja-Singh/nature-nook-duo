import { Suspense } from 'react';
import { connectDB } from '@/lib/mongoose';
import { ProductModel, CategoryModel } from '@/models';
import type { Product, Category } from '@/types';
import { ProductCard } from '@/components/common/ProductCard';
import { Loader2, Leaf, SlidersHorizontal, Search } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { EmptyState } from '@/components/shared/molecules/empty-state';
import { Reveal, StaggerContainer } from '@/components/shared/reveal';
import { Loading } from '@/components/shared/molecules/loading';
import { ScrollFadeWrapper } from '@/components/shared/molecules/scroll-fade-wrapper';

export const dynamic = 'force-dynamic';

function ProductGridSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-32 w-full h-full min-h-[400px]">
      <Loading text="Loading pets..." />
    </div>
  );
}

async function ProductGridFetcher({ query, q, categoryFilter }: { query: any, q: string, categoryFilter: string }) {
  let products: Product[] = [];
  
  try {
    const productsDoc = await ProductModel.find(query).sort({ createdAt: -1 }).lean();
    products = productsDoc.map(doc => {
      const p = { ...doc, id: doc._id.toString() } as unknown as Product;
      delete (p as any)._id;
      return p;
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground text-sm font-medium">
          Showing <span className="text-foreground font-bold">{products.length}</span> results
          {q && <span> for "<span className="text-foreground">{q}</span>"</span>}
          {categoryFilter && <span> in <span className="text-foreground">{categoryFilter}</span></span>}
        </p>
      </div>

      {products.length > 0 ? (
        <StaggerContainer animation="zoom-in" staggerDelay={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </StaggerContainer>
      ) : (
        <EmptyState
          title="No pets found"
          description="We couldn't find any pets matching your criteria. Try adjusting your filters or search term."
          action={
            <Link href="/shop" className={buttonVariants({ className: "rounded-full" })}>
              Clear Filters
            </Link>
          }
        />
      )}
    </>
  );
}

export default async function ProductsPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await connectDB();

  // Parse search params for filtering
  const searchParams = props.searchParams ? await props.searchParams : {};
  const q = typeof searchParams?.q === 'string' ? searchParams.q : '';
  const categoryFilter = typeof searchParams?.category === 'string' ? searchParams.category : '';

  let categories: Category[] = [];

  try {
    // Fetch Categories for Sidebar
    const categoriesDoc = await CategoryModel.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    categories = categoriesDoc.map(doc => {
      const c = { ...doc, id: doc._id.toString() } as unknown as Category;
      delete (c as any)._id;
      return c;
    });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }

  // Build product query
  const query: any = { isVisible: true };
  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { breed: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ];
  }
  if (categoryFilter) {
    query.mainCategory = categoryFilter;
  }

  const suspenseKey = `${q}-${categoryFilter}`;

  return (
    <div className="flex flex-col min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <Reveal animation="fade-down" className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-light to-accent">Shop Companions</h1>
        </Reveal>
        <div className="flex flex-col gap-8">
          
          <div className="glass rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
            
            <ScrollFadeWrapper className="w-full md:w-auto" scrollClassName="flex items-center gap-3 pb-2 pr-8 md:pr-0">
              <Link href={`/shop${q ? `?q=${q}` : ''}`} className={`relative px-5 py-2.5 h-10 rounded-full font-heading text-[11px] uppercase tracking-widest font-bold transition-all whitespace-nowrap flex-shrink-0 overflow-hidden group ${!categoryFilter ? 'text-primary-foreground shadow-md' : 'bg-background text-muted-foreground hover:text-foreground border border-border/50'}`}>
                {/* Active sliding background trick */}
                <div className={`absolute inset-0 bg-primary transition-opacity duration-300 ${!categoryFilter ? 'opacity-100' : 'opacity-0 group-hover:opacity-10'}`} />
                <span className="relative z-10">All</span>
              </Link>
              {categories.map(cat => (
                <Link 
                  key={cat.id} 
                  href={`/shop?category=${cat.name}${q ? `&q=${q}` : ''}`}
                  className={`relative px-5 py-2.5 h-10 rounded-full font-heading text-[11px] uppercase tracking-widest font-bold transition-all whitespace-nowrap flex-shrink-0 overflow-hidden group ${categoryFilter === cat.name ? 'text-primary-foreground shadow-md' : 'bg-background text-muted-foreground hover:text-foreground border border-border/50'}`}
                >
                  <div className={`absolute inset-0 bg-primary transition-opacity duration-300 ${categoryFilter === cat.name ? 'opacity-100' : 'opacity-0 group-hover:opacity-10'}`} />
                  <span className="relative z-10">{cat.name}</span>
                </Link>
              ))}
            </ScrollFadeWrapper>

            {/* Search */}
            <form action="/shop" method="GET" className="w-full md:w-72 shrink-0">
              <div className="relative">
                <Input 
                  type="text" 
                  name="q" 
                  defaultValue={q}
                  placeholder="Search pets..." 
                  className="w-full pl-9 h-10 bg-background border-border/50 rounded-full text-sm focus-visible:ring-primary/20"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                {categoryFilter && <input type="hidden" name="category" value={categoryFilter} />}
              </div>
            </form>

          </div>

          {/* Product Grid */}
          <main className="w-full">
            <Suspense key={suspenseKey} fallback={<ProductGridSkeleton />}>
              <ProductGridFetcher query={query} q={q} categoryFilter={categoryFilter} />
            </Suspense>
          </main>
          
        </div>
      </div>
    </div>
  );
}
