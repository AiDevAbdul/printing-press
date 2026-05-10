import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const createQuotationSchema = z.object({
  customer_id: z.string().uuid(),
  quotation_date: z.string().datetime(),
  valid_until: z.string().datetime(),
  product_name: z.string().min(1),
  product_type: z.string().default('cpp_carton'),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  double_sheet: z.string().optional(),
  length: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  dimension_unit: z.string().optional(),
  paper_type: z.string().optional(),
  gsm: z.number().optional(),
  // Color process
  four_color_process: z.boolean().optional(),
  inside_printing: z.boolean().optional(),
  cmyk_cyan: z.boolean().optional(),
  cmyk_magenta: z.boolean().optional(),
  cmyk_yellow: z.boolean().optional(),
  cmyk_black: z.boolean().optional(),
  pantone_cmyk_1: z.string().optional(),
  pantone_cmyk_2: z.string().optional(),
  pantone_cmyk_3: z.string().optional(),
  pantone_cmyk_4: z.string().optional(),
  color_front: z.number().default(0),
  color_back: z.number().default(0),
  // Printing details
  bar_code: z.string().optional(),
  dye_req: z.string().optional(),
  batch_no_printing: z.boolean().optional(),
  batch_no: z.string().optional(),
  mfg_date: z.string().optional(),
  exp_date: z.string().optional(),
  mrp_rs: z.number().optional(),
  // Finishing
  varnish_type: z.string().optional(),
  foiling: z.boolean().optional(),
  bleach_card: z.boolean().optional(),
  box_board_card: z.boolean().optional(),
  art_card: z.boolean().optional(),
  // Cost formula inputs
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
  special_instructions: z.string().optional(),
});

const updateQuotationSchema = createQuotationSchema.partial();

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
        { quotation_number: { contains: search, mode: 'insensitive' } },
        { product_name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      db.quotations.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: { customers: true },
      }),
      db.quotations.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching quotations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotations' },
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

    const validated = createQuotationSchema.parse(body);

    // Verify customer exists in company
    const customer = await db.customers.findFirst({
      where: { id: validated.customer_id, company_id: companyId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Generate quotation number
    const date = new Date();
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const quotation_number = `QT-${date.getFullYear()}-${dayOfYear}-${Date.now().toString().slice(-6)}`;

    const { mfg_date, exp_date, ...rest } = validated;
    const quotation = await db.quotations.create({
      data: {
        ...rest,
        ...(mfg_date ? { mfg_date: new Date(mfg_date) } : {}),
        ...(exp_date ? { exp_date: new Date(exp_date) } : {}),
        quotation_number,
        company_id: companyId,
        created_by_id: userId,
      },
      include: { customers: true },
    });

    return NextResponse.json(quotation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating quotation:', error);
    return NextResponse.json(
      { error: 'Failed to create quotation' },
      { status: 500 }
    );
  }
}
