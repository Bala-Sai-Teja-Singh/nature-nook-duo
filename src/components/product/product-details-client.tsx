'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, ShieldCheck, Leaf, Star, Check, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useFavoriteStore } from '@/store/favorite-store';
import { useAuthStore } from '@/store/auth-store';
import { EmptyState } from '@/components/shared/molecules/empty-state';
import type { Product, Review, ProductSize } from '@/types';
import { cn } from '@/lib/utils';

export function ProductDetailsClient({ product, initialReviews }: { product: Product; initialReviews: Review[] }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(product.sizes?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { toast } = useToast();
  const { toggleLike, isLiked } = useFavoriteStore();
  const { user } = useAuthStore();
  const liked = isLiked(product.id, 'product');

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleLike(product.id, 'product', user?.id);
  };

  const handleAddToCart = () => {
    if (!selectedSize) return;
    
    if (quantity > selectedSize.stock) {
      toast({
        title: 'Not enough stock',
        description: `Only ${selectedSize.stock} available.`,
        variant: 'error',
      });
      return;
    }

    const success = addItem(product, selectedSize, quantity);
    if (success) {
      toast({
        title: 'Added to Cart',
        description: `${quantity}x ${product.name} (${selectedSize.size}) added.`,
        variant: 'success',
      });
    } else {
      toast({
        title: 'Already in Cart',
        description: `This product is already in your cart.`,
        variant: 'default',
      });
    }
  };

  return (
    <div className="flex flex-col gap-8 lg:gap-12">
      {/* Back Link */}
      <div>
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors group">
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Shop
        </Link>
      </div>

      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden glass shadow-xl border border-border/50">
            {product.images?.[selectedImage] ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <Leaf className="h-20 w-20 text-muted-foreground/30" />
              </div>
            )}
            
            <div className="absolute top-4 left-4 flex gap-2">
               {product.featured && (
                  <Badge className="bg-accent/90 text-white backdrop-blur-md border-none px-3 py-1 text-xs uppercase tracking-widest font-bold">
                    Featured
                  </Badge>
               )}
            </div>
          </div>
          
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    "relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all",
                    selectedImage === idx ? "border-primary opacity-100 ring-2 ring-primary/20 ring-offset-2" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="flex flex-col">
          <Badge variant="outline" className="w-fit text-primary border-primary/20 bg-primary/5 mb-4">
            {typeof product.mainCategory === 'string' ? product.mainCategory : (product.mainCategory as any).name}
          </Badge>
          
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-2">
            {product.name}
          </h1>
          
          <p className="text-lg text-muted-foreground flex items-center gap-2 mb-6">
            <ShieldCheck className="h-5 w-5 text-accent" />
            {product.breed}
          </p>

          <div className="flex items-end gap-3 mb-8">
            <span className="text-4xl font-bold text-foreground">
              ₹{selectedSize ? selectedSize.price.toFixed(2) : '0.00'}
            </span>
            {selectedSize && selectedSize.stock < 5 && selectedSize.stock > 0 && (
              <span className="text-sm text-destructive font-medium mb-1.5">
                Only {selectedSize.stock} left in stock!
              </span>
            )}
            {selectedSize && selectedSize.stock === 0 && (
              <span className="text-sm text-destructive font-medium mb-1.5">
                Out of Stock
              </span>
            )}
          </div>

          <div className="prose prose-p:text-muted-foreground max-w-none mb-8">
            <p>{product.description}</p>
          </div>

          {/* Quick Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl glass mb-8">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Care Level</span>
              <span className="font-medium text-foreground capitalize">{product.careLevel}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Temp</span>
              <span className="font-medium text-foreground">{product.temperature}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Humidity</span>
              <span className="font-medium text-foreground">{product.humidity}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Diet</span>
              <span className="font-medium text-foreground truncate" title={product.feeding}>{product.feeding}</span>
            </div>
          </div>

          {/* Variants (Sizes) */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-8">
              <h3 className="font-heading text-lg font-semibold mb-3">Select Size / Variation</h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size.size}
                    onClick={() => {
                      setSelectedSize(size);
                      setQuantity(1);
                    }}
                    disabled={size.stock === 0}
                    className={cn(
                      "px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all duration-200 flex items-center gap-2",
                      selectedSize?.size === size.size 
                        ? "border-primary bg-primary/10 text-primary dark:bg-primary/20" 
                        : "border-border/50 bg-background text-muted-foreground hover:border-primary/50",
                      size.stock === 0 && "opacity-50 cursor-not-allowed bg-muted"
                    )}
                  >
                    {size.size}
                    {selectedSize?.size === size.size && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-auto pt-8 border-t border-border">
            <div className="flex items-center justify-between border-2 border-border/50 rounded-full bg-background px-4 py-1 sm:w-32 h-14">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-muted-foreground hover:text-foreground text-xl font-medium w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              >-</button>
              <span className="font-bold text-foreground">{quantity}</span>
              <button 
                onClick={() => setQuantity(selectedSize ? Math.min(selectedSize.stock, quantity + 1) : quantity)}
                className="text-muted-foreground hover:text-foreground text-xl font-medium w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              >+</button>
            </div>
            
            <Button 
              onClick={handleAddToCart}
              disabled={!selectedSize || selectedSize.stock === 0}
              size="lg" 
              className="flex-1 h-14 rounded-full bg-primary hover:bg-primary/90 text-white text-base shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {selectedSize && selectedSize.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleLike}
              className={`h-14 w-14 rounded-full border-2 transition-colors shrink-0 ${liked ? 'text-red-500 border-red-500 bg-red-50 dark:bg-red-500/10' : 'border-border/50 text-muted-foreground hover:text-red-500 hover:border-red-500'}`}
            >
              <Heart className={`h-6 w-6 ${liked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Reviews Section */}
      <div className="pt-16 border-t border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="font-heading text-3xl font-bold text-foreground text-center sm:text-left">Customer Reviews</h2>
          <div className="bg-primary/5 border border-primary/20 text-primary text-sm px-4 py-2 rounded-xl flex items-center justify-center text-center gap-2 w-full sm:w-auto">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Only verified buyers who have purchased this pet can leave a review.</span>
          </div>
        </div>
        {initialReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {initialReviews.map(review => (
              <div key={review.id} className="glass p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-lg">
                      {review.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{review.userName}</p>
                      <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex text-accent">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn("h-4 w-4", i < review.rating ? "fill-accent" : "text-muted opacity-30")} />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground italic text-sm leading-relaxed">"{review.comment}"</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Star}
            title="No reviews yet"
            description="Be the first to review this companion!"
          />
        )}
      </div>

    </div>
  );
}
