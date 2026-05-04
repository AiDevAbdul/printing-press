import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const createInvoiceSchema = z.object({
  order_id: z.string().uuid().optional(),
  customer_id: z.string().uuid(),
  invoice_date: z.string().datetime(),
  due_date: z.string().datetime(),
  subtotal: z.number().default(0),
  total_amount: z.number().positive(),
  tax_amount: z.number().default(0),
  description: z.string().optional(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).default('draft'),
});

const updateInvoiceSchema = createInvoiceSchema.partial();

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
        { invoice_number: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      db.invoices.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: { customers: true },
      }),
      db.invoices.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
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

    const validated = createInvoiceSchema.parse(body);

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

    // Generate invoice number
    const date = new Date();
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const invoiceNumber = `INV-${date.getFullYear()}-${dayOfYear}-${Date.now().toString().slice(-6)}`;

    const invoice = await db.invoices.create({
      data: {
        ...validated,
        invoice_number: invoiceNumber,
        company_id: companyId,
        created_by: userId,
      },
      include: { customers: true },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
