import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const createOrderSchema = z.object({
  customer_id: z.string().uuid().optional(),
  order_date: z.string().datetime(),
  delivery_date: z.string().datetime(),
  product_name: z.string().min(1),
  quantity: z.number().int().positive(),
  unit: z.string().min(1),
  size_length: z.number().optional(),
  size_width: z.number().optional(),
  size_unit: z.string().optional(),
  substrate: z.string().optional(),
  gsm: z.string().optional(),
  colors: z.string().optional(),
  printing_type: z.string().optional(),
  finishing_requirements: z.string().optional(),
  special_instructions: z.string().optional(),
  quoted_price: z.number().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
});

const updateOrderSchema = createOrderSchema.partial();

export async function GET(req: NextRequest) {
  try {
    const { companyId } = await getTenantContext(req);
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = { company_id: companyId };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { order_number: { contains: search, mode: 'insensitive' } },
        { product_name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      db.orders.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: { customers: true },
      }),
      db.orders.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { companyId, userId } = await getTenantContext(req);
    const body = await req.json();

    const validated = createOrderSchema.parse(body);

    // Generate order number
    const date = new Date();
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const orderNumber = `ORD-${date.getFullYear()}-${dayOfYear}-${Date.now().toString().slice(-6)}`;

    const order = await db.orders.create({
      data: {
        ...validated,
        order_number: orderNumber,
        company_id: companyId,
        created_by: userId,
      },
      include: { customers: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
