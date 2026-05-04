import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateOrderSchema = z.object({
  status: z.enum(['pending', 'approved', 'in_production', 'completed', 'delivered', 'cancelled']).optional(),
  delivery_date: z.string().datetime().optional(),
  product_name: z.string().optional(),
  quantity: z.number().int().positive().optional(),
  final_price: z.number().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  special_instructions: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = await params;

    const order = await db.orders.findFirst({
      where: { id, company_id: companyId },
      include: { customers: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = await params;
    const body = await req.json();

    const existing = await db.orders.findFirst({
      where: { id, company_id: companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const validated = updateOrderSchema.parse(body);

    const order = await db.orders.update({
      where: { id },
      data: validated,
      include: { customers: true },
    });

    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = await params;

    const existing = await db.orders.findFirst({
      where: { id, company_id: companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Soft delete or cancel order
    await db.orders.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    return NextResponse.json({ message: 'Order cancelled' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
