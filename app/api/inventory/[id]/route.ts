import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateInventorySchema = z.object({
  item_name: z.string().optional(),
  category: z.enum(['paper', 'ink', 'plates', 'finishing_materials', 'packaging']).optional(),
  subcategory: z.string().optional(),
  unit: z.string().optional(),
  size_length: z.number().optional(),
  size_width: z.number().optional(),
  brand: z.string().optional(),
  color: z.string().optional(),
  current_stock: z.number().optional(),
  reorder_level: z.number().optional(),
  reorder_quantity: z.number().optional(),
  unit_cost: z.number().optional(),
  is_active: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = await params;

    const item = await db.inventory_items.findFirst({
      where: { id, company_id: companyId },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory item' },
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

    const existing = await db.inventory_items.findFirst({
      where: { id, company_id: companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    const validated = updateInventorySchema.parse(body);

    const item = await db.inventory_items.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
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

    const existing = await db.inventory_items.findFirst({
      where: { id, company_id: companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    await db.inventory_items.update({
      where: { id },
      data: { is_active: false },
    });

    return NextResponse.json({ message: 'Inventory item deleted' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
}
