import { connectDB } from '@/lib/mongoose';
import { CartModel } from '@/models';
import { type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/db/carts?userId=xxx
 * Returns the cart for a given user.
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 });
    }

    const cart = await CartModel.findOne({ userId });
    return Response.json(cart ? cart.items : []);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/db/carts
 * Replaces the entire cart for a user (upsert).
 * Body: { userId, items: CartItem[] }
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { userId, items } = body;

    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 });
    }

    const cart = await CartModel.findOneAndUpdate(
      { userId },
      { userId, items: items || [] },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return Response.json(cart.items);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/db/carts?userId=xxx
 * Clears the entire cart for a user.
 */
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 });
    }

    await CartModel.deleteOne({ userId });
    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
