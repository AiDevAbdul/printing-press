import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const createOrderSchema = z.object({
  customer_id: z.string().uuid().optional(),
  order_date: z.string(),
  delivery_date: z.string(),
  product_name: z.string().min(1),
  product_type: z.enum(['cpp_carton', 'silvo_blister', 'bent_foil', 'alu_alu']).optional(),
  product_type_text: z.string().optional(),
  quantity: z.number().int().positive(),
  unit: z.string().min(1),
  double_sheet: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  is_repeat_order: z.boolean().optional(),
  special_instructions: z.string().optional(),
  specifications: z.string().optional(),
  batch_number: z.string().optional(),
  group_name: z.string().optional(),
  // Size & material
  substrate: z.string().optional(),
  gsm: z.string().optional(),
  size_length: z.number().optional(),
  size_width: z.number().optional(),
  size_unit: z.string().optional(),
  card_size: z.string().optional(),
  // Color process
  four_color_process: z.boolean().optional(),
  inside_printing: z.boolean().optional(),
  cmyk_cyan: z.boolean().optional(),
  cmyk_magenta: z.boolean().optional(),
  cmyk_yellow: z.boolean().optional(),
  cmyk_black: z.boolean().optional(),
  // Printing
  printing_type: z.enum(['offset', 'digital', 'flexo']).optional(),
  colors: z.string().optional(),
  color_p1: z.string().optional(),
  color_p2: z.string().optional(),
  color_p3: z.string().optional(),
  color_p4: z.string().optional(),
  has_back_printing: z.boolean().optional(),
  has_barcode: z.boolean().optional(),
  // Printing details
  dye_req: z.string().optional(),
  batch_no_printing: z.boolean().optional(),
  mfg_date: z.string().optional(),
  exp_date: z.string().optional(),
  mrp_rs: z.number().optional(),
  // Finishing
  lamination_type: z.enum(['shine', 'matt', 'metalize', 'rainbow', 'none']).optional(),
  lamination_size: z.string().optional(),
  varnish_type: z.enum(['water_base', 'duck', 'plain_uv', 'spot_uv', 'drip_off_uv', 'matt_uv', 'rough_uv', 'none']).optional(),
  varnish_details: z.string().optional(),
  uv_emboss_details: z.string().optional(),
  gold_leaf_panny: z.boolean().optional(),
  bleach_card: z.boolean().optional(),
  box_board_card: z.boolean().optional(),
  art_card: z.boolean().optional(),
  die_type: z.enum(['new_die', 'old_die', 'none']).optional(),
  die_reference: z.string().optional(),
  finishing_requirements: z.string().optional(),
  // Cost formula
  ups: z.number().optional(),
  paper_ups: z.number().optional(),
  price_per_kg_card: z.number().optional(),
  price_per_kg_paper: z.number().optional(),
  conversion_percent_card: z.number().optional(),
  conversion_percent_paper: z.number().optional(),
  fixed_charge_ctp: z.number().optional(),
  fixed_charge_spot_uv: z.number().optional(),
  fixed_charge_plain_uv: z.number().optional(),
  fixed_charge_drip_off_uv: z.number().optional(),
  fixed_charge_metalize: z.number().optional(),
  fixed_charge_emboss: z.number().optional(),
  fixed_charge_lamination: z.number().optional(),
  fixed_charge_others: z.number().optional(),
  // Pricing
  quoted_price: z.number().optional(),
});

const updateOrderSchema = z.object({
  status: z.enum(['pending', 'approved', 'in_production', 'completed', 'delivered', 'cancelled']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  delivery_date: z.string().optional(),
  product_name: z.string().optional(),
  quantity: z.number().int().positive().optional(),
  final_price: z.number().optional(),
  special_instructions: z.string().optional(),
});

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

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company not selected' },
        { status: 400 }
      );
    }

    const body = await req.json();

    const validated = createOrderSchema.parse(body);

    // Generate order number
    const date = new Date();
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const orderNumber = `ORD-${date.getFullYear()}-${dayOfYear}-${Date.now().toString().slice(-6)}`;

    const { mfg_date, exp_date, ...rest } = validated;
    const order = await db.orders.create({
      data: {
        ...rest,
        ...(mfg_date ? { mfg_date: new Date(mfg_date) } : {}),
        ...(exp_date ? { exp_date: new Date(exp_date) } : {}),
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
        { error: 'Validation error', details: error.issues },
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
