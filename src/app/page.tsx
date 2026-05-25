import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Leaf, ShieldCheck, Heart, Truck } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { ProductCard } from '@/components/common/ProductCard';
import { connectDB } from '@/lib/mongoose';
import { ProductModel } from '@/models';
import type { Product } from '@/types';
import { Reveal, StaggerContainer } from '@/components/shared/reveal';

// Force dynamic or revalidate for fresh data
export const revalidate = 60; // revalidate every minute

export default async function HomePage() {
  await connectDB();

  // Fetch featured products from the database
  let featuredProducts: Product[] = [];
  try {
    const productsDoc = await ProductModel.find({ featured: true, isVisible: true })
      .limit(4)
      .lean();

    featuredProducts = productsDoc.map(doc => {
      const p = { ...doc, id: doc._id.toString() } as unknown as Product;
      delete (p as any)._id;
      return p;
    });
  } catch (error) {
    console.error("Failed to fetch featured products:", error);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-primary/5 pt-8 pb-12 lg:pt-12 lg:pb-20">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-brand-primary-light/20 rounded-full blur-3xl opacity-50 animate-float" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-80 h-80 bg-brand-accent/20 rounded-full blur-3xl opacity-50 animate-float" style={{ animationDelay: '3s' }} />

        <div className="container relative z-10 px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="max-w-2xl space-y-8">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm animate-hero-text">
                <Leaf className="mr-2 h-4 w-4" />
                <span>Premium Exotics & Supplies</span>
              </div>

              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1] animate-hero-text animate-hero-text-delay-1">
                Bring the <span className="text-gradient-primary">Wild</span> <br /> Into Your Home
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl animate-hero-text animate-hero-text-delay-2">
                Discover our curated selection of premium exotic pets, specialized habitats, and expert care guidance. Responsibly sourced, passionately cared for.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 pb-8 sm:pb-0 justify-center lg:justify-start animate-hero-text animate-hero-text-delay-3">
                <Link href="/shop" className={buttonVariants({ size: "lg", className: "rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 h-14 text-base shadow-lg shadow-primary/25 transition-all hover:scale-105" })}>
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link href="/care-guides" className={buttonVariants({ variant: "outline", size: "lg", className: "rounded-full border-primary/20 bg-background/50 backdrop-blur-sm text-primary hover:bg-primary/10 hover:text-primary font-medium px-8 h-14 text-base transition-all" })}>
                  Read Care Guides
                </Link>
              </div>
            </div>

            <Reveal animation="fade-left" delay={0.4} duration={0.8} className="relative hidden lg:block h-[600px] w-full rounded-3xl overflow-hidden glass shadow-2xl p-4">
              {/* Hero Image */}
              <div className="w-full h-full relative rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary-light/20 to-brand-accent/20 z-0"></div>
                <Image src="/images/hero.jpeg" alt="Exotic Pet" fill className="object-cover z-10" priority />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-border/50 bg-background/50 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4">
          <StaggerContainer animation="fade-up" staggerDelay={0.12} className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Health Guarantee</h4>
                <p className="text-sm text-muted-foreground">14-day health warranty</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Safe Transport</h4>
                <p className="text-sm text-muted-foreground">Overnight live shipping</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Ethical Breeding</h4>
                <p className="text-sm text-muted-foreground">Responsibly sourced</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Expert Support</h4>
                <p className="text-sm text-muted-foreground">Lifetime care guidance</p>
              </div>
            </div>
          </StaggerContainer>
        </div>
      </section>

      {/* Featured Pets Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal animation="fade-up" className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div className="max-w-2xl space-y-4">
              <h2 className="font-heading text-4xl font-bold tracking-tight text-foreground">Featured Companions</h2>
              <p className="text-lg text-muted-foreground">Discover our most sought-after exotic pets, ready to find their forever homes.</p>
            </div>
            <Link href="/shop" className={buttonVariants({ variant: "outline", className: "rounded-full border-primary/20 text-primary hover:bg-primary hover:text-white transition-all" })}>
              View All Companions <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Reveal>

          {featuredProducts.length > 0 ? (
            <StaggerContainer animation="zoom-in" staggerDelay={0.12} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </StaggerContainer>
          ) : (
            <Reveal animation="fade-in">
              <div className="text-center py-20 bg-background/50 rounded-2xl border border-border/50">
                <p className="text-muted-foreground text-lg">No featured pets available at the moment. Please check back soon!</p>
              </div>
            </Reveal>
          )}
        </div>
      </section>

    </div>
  );
}
