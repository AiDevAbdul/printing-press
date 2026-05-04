import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const createInventorySchema = z.object({
  item_code: z.string().min(1),
  item_name: z.string().min(1),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  unit: z.string().min(1),
  size_length: z.number().optional(),
  size_width: z.number().optional(),
  brand: z.string().optional(),
  color: z.string().optional(),
  current_stock: z.number().default(0),
  reorder_level: z.number().default(0),
  reorder_quantity: z.number().default(0),
  unit_cost: z.number().default(0),
  gsm: z.number().optional(),
});

const updateInventorySchema = createInventorySchema.partial();

export async function GET(req: NextRequest) {
  try {
    const { companyId } = await getTenantContext(req);
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const lowStock = searchParams.get('lowStock') === 'true';

    const where: any = { company_id: companyId, is_active: true };
    if (category) where.category = category;
    if (lowStock) where.current_stock = { lt: db.inventory_items.fields.reorder_level };
    if (search) {
      where.OR = [
        { item_code: { contains: search, mode: 'insensitive' } },
        { item_name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      db.inventory_items.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      db.inventory_items.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { companyId } = await getTenantContext(req);
    const body = await req.json();

    const validated = createInventorySchema.parse(body);

    // Check if item_code already exists
    const existing = await db.inventory_items.findFirst({
      where: { item_code: validated.item_code, company_id: companyId },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Item code already exists' },
        { status: 409 }
      );
    }

    const item = await db.inventory_items.create({
      data: {
        ...validated,
        company_id: companyId,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}
