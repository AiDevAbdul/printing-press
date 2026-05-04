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
  length: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  dimension_unit: z.string().optional(),
  paper_type: z.string().optional(),
  gsm: z.number().optional(),
  color_front: z.number().default(0),
  color_back: z.number().default(0),
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

    const quotation = await db.quotations.create({
      data: {
        ...validated,
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
