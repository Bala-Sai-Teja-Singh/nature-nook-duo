import { connectDB } from '@/lib/mongoose';
import { CouponModel } from '@/models';
import { type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/db/coupons — fetch all coupons (for admin)
export async function GET() {
  try {
    await connectDB();
    const coupons = await CouponModel.find({}).sort({ createdAt: -1 });
    return Response.json(coupons.map(c => c.toJSON()));
  } catch (error: unknown) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}

// POST /api/db/coupons — create a new coupon
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const coupon = await CouponModel.create({ _id: body.id, ...body });
    return Response.json(coupon.toJSON(), { status: 201 });
  } catch (error: unknown) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
