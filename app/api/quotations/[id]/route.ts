import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateQuotationSchema = z.object({
  status: z.enum(['draft', 'submitted', 'approved', 'rejected', 'converted']).optional(),
  valid_until: z.string().datetime().optional(),
  product_name: z.string().optional(),
  quantity: z.number().positive().optional(),
  special_instructions: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = await params;

    const quotation = await db.quotations.findFirst({
      where: { id, company_id: companyId },
      include: { customers: true },
    });

    if (!quotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(quotation);
  } catch (error) {
    console.error('Error fetching quotation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotation' },
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

    const existing = await db.quotations.findFirst({
      where: { id, company_id: companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    const validated = updateQuotationSchema.parse(body);

    const quotation = await db.quotations.update({
      where: { id },
      data: validated,
      include: { customers: true },
    });

    return NextResponse.json(quotation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating quotation:', error);
    return NextResponse.json(
      { error: 'Failed to update quotation' },
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

    const existing = await db.quotations.findFirst({
      where: { id, company_id: companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    // Soft delete by rejecting
    await db.quotations.update({
      where: { id },
      data: { status: 'rejected' },
    });

    return NextResponse.json({ message: 'Quotation deleted' });
  } catch (error) {
    console.error('Error deleting quotation:', error);
    return NextResponse.json(
      { error: 'Failed to delete quotation' },
      { status: 500 }
    );
  }
}
