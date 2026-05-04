import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const createCustomerSchema = z.object({
  name: z.string().min(1),
  company_name: z.string().optional(),
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  customer_group: z.string().optional(),
  strn: z.string().optional(),
  ntn: z.string().optional(),
  credit_limit: z.number().default(0),
  credit_days: z.number().default(30),
  payment_terms: z.string().optional(),
});

const updateCustomerSchema = createCustomerSchema.partial();

export async function GET(req: NextRequest) {
  try {
    const { companyId, userId } = await getTenantContext(req);
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { company_id: companyId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { company_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      db.customers.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: { users: { select: { id: true, full_name: true, email: true } } },
      }),
      db.customers.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { companyId, userId } = await getTenantContext(req);
    const body = await req.json();

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company not selected' },
        { status: 400 }
      );
    }

    // Validate request body
    const validated = createCustomerSchema.parse(body);

    const customer = await db.customers.create({
      data: {
        ...validated,
        company_id: companyId,
        created_by: userId,
      },
      include: { users: { select: { id: true, full_name: true, email: true } } },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
