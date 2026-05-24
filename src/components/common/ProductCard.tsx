'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, ShieldCheck } from 'lucide-react';
import { Modal } from '@/components/shared/molecules/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useFavoriteStore } from '@/store/favorite-store';
import { useAuthStore } from '@/store/auth-store';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const { toggleLike, isLiked } = useFavoriteStore();
  const { user } = useAuthStore();
  
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  
  const liked = isLiked(product.id, 'product');

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(product.id, 'product', user?.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.sizes && product.sizes.length > 1) {
      setShowSizeModal(true);
      return;
    }
    
    if (product.sizes && product.sizes.length === 1) {
      const defaultSize = product.sizes[0];
      const success = addItem(product, defaultSize, 1);
      
      if (success) {
        toast({
          title: 'Added to Cart',
          description: `${product.name} has been added to your cart.`,
          variant: 'success',
        });
      } else {
        toast({
          title: 'Already in Cart',
          description: `${product.name} is already in your cart.`,
          variant: 'default',
        });
      }
    } else {
      toast({
        title: 'Unavailable',
        description: `This product is currently out of stock.`,
        variant: 'error',
      });
    }
  };

  const handleConfirmAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const size = product.sizes[selectedSizeIdx];
    const success = addItem(product, size, 1);
    
    if (success) {
      toast({
        title: 'Added to Cart',
        description: `${product.name} (${size.size}) has been added to your cart.`,
        variant: 'success',
      });
    } else {
      toast({
        title: 'Already in Cart',
        description: `${product.name} is already in your cart.`,
        variant: 'default',
      });
    }
    setShowSizeModal(false);
  };

  const startingPrice = product.sizes && product.sizes.length > 0 
    ? Math.min(...product.sizes.map(s => s.price)) 
    : 0;

  return (
    <>
      <Link href={`/shop/${product.id}`} className="group relative block w-full h-full">
      <div className="nature-card h-full flex flex-col overflow-hidden bg-white/80 backdrop-blur-md transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
        
        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.mainCategory && (
              <Badge variant="secondary" className="bg-white/90 text-primary hover:bg-white backdrop-blur-sm shadow-sm font-medium">
                {typeof product.mainCategory === 'string' ? product.mainCategory : (product.mainCategory as any).name}
              </Badge>
            )}
            {product.featured && (
              <Badge className="bg-accent/90 text-white hover:bg-accent backdrop-blur-sm shadow-sm font-medium">
                Featured
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 transform translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
            <Button 
              size="icon" 
              variant="secondary" 
              onClick={handleLike}
              className={`h-9 w-9 rounded-full bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white transition-colors ${liked ? 'text-red-500' : 'hover:text-red-500 text-foreground/70'}`}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex flex-col flex-grow p-5">
          <div className="flex-grow space-y-1">
            <h3 className="font-heading text-xl font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            {product.breed && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                {product.breed}
              </p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Starting at</span>
              <span className="text-lg font-bold text-foreground">
                ₹{startingPrice.toFixed(2)}
              </span>
            </div>
            
            <Button 
              onClick={handleAddToCart}
              size="sm" 
              className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors duration-300 px-4 group/btn"
            >
              <ShoppingCart className="h-4 w-4 mr-2 transition-transform group-hover/btn:scale-110" />
              Add
            </Button>
          </div>
        </div>
      </div>
      </Link>

      <Modal
        isOpen={showSizeModal}
        onClose={() => setShowSizeModal(false)}
        variant="small"
        title="Select Variant"
        footer={(
          <Button onClick={handleConfirmAdd} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12">
            Add to Cart
          </Button>
        )}
      >
        <div className="space-y-4" onClick={(e) => e.preventDefault()}>
          <div className="flex gap-4 items-center mb-4">
            <div className="h-16 w-16 rounded-lg overflow-hidden border border-border bg-muted">
              {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />}
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-tight line-clamp-1">{product.name}</h4>
              <p className="text-xs text-muted-foreground italic line-clamp-1">{product.breed}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {product.sizes?.map((size, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => { e.preventDefault(); setSelectedSizeIdx(idx); }}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${selectedSizeIdx === idx
                  ? 'border-primary bg-primary/10 ring-1 ring-primary'
                  : 'border-border bg-card/40 hover:bg-card/60'
                  }`}
              >
                <span className="font-medium text-sm">{size.size}</span>
                <span className="font-bold text-primary">₹{(size.price).toFixed(2)}</span>
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
