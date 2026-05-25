import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongoose';
import { ProductModel, ReviewModel } from '@/models';
import type { Product, Review } from '@/types';
import { ProductDetailsClient } from '@/components/product/product-details-client';
import { Types } from 'mongoose';
import { Reveal } from '@/components/shared/reveal';

export const revalidate = 60;

export default async function ProductDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await connectDB();

  // Removed Types.ObjectId.isValid(params.id) check since we use string IDs like 'tar-001'

  let product: Product | null = null;
  let reviews: Review[] = [];

  try {
    const doc = await ProductModel.findById(params.id).lean();
    if (!doc || !doc.isVisible) {
      notFound();
    }

    product = { ...doc, id: doc._id.toString() } as unknown as Product;
    delete (product as any)._id;

    // Fetch approved reviews
    const reviewsDoc = await ReviewModel.find({ targetId: params.id, status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
      
    reviews = reviewsDoc.map(r => {
      const rev = { ...r, id: r._id.toString() } as unknown as Review;
      delete (rev as any)._id;
      return rev;
    });

  } catch (error) {
    console.error("Failed to fetch product details:", error);
    notFound();
  }

  if (!product) notFound();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <Reveal animation="fade-up">
          <ProductDetailsClient product={product} initialReviews={reviews} />
        </Reveal>
      </div>
    </div>
  );
}
