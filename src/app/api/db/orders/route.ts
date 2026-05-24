import { connectDB } from '@/lib/mongoose';
import { OrderModel } from '@/models';
import { type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/db/orders — fetch all orders, optionally filtered by userId
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const userId = request.nextUrl.searchParams.get('userId');

    const filter: Record<string, unknown> = {};
    if (userId) filter.userId = userId;

    const orders = await OrderModel.find(filter).sort({ createdAt: -1 });
    return Response.json(orders.map(o => o.toJSON()));
  } catch (error: unknown) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}

// POST /api/db/orders — create a new order
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const order = await OrderModel.create({ _id: body.id, ...body });
    return Response.json(order.toJSON(), { status: 201 });
  } catch (error: unknown) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
