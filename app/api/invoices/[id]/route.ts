import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateInvoiceSchema = z.object({
  status: z.enum(['draft', 'sent', 'pending', 'paid', 'overdue']).optional(),
  due_date: z.string().datetime().optional(),
  total_amount: z.number().positive().optional(),
  tax_amount: z.number().optional(),
  description: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = params;

    const invoice = await db.invoices.findFirst({
      where: { id, company_id: companyId },
      include: { customers: true },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = params;
    const body = await req.json();

    const existing = await db.invoices.findFirst({
      where: { id, company_id: companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const validated = updateInvoiceSchema.parse(body);

    const invoice = await db.invoices.update({
      where: { id },
      data: validated,
      include: { customers: true },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = params;

    const existing = await db.invoices.findFirst({
      where: { id, company_id: companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Set status to draft instead of hard delete
    await db.invoices.update({
      where: { id },
      data: { status: 'draft' },
    });

    return NextResponse.json({ message: 'Invoice deleted' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
