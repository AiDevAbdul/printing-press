import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const createPaymentSchema = z.object({
  invoice_id: z.string().uuid(),
  amount: z.number().positive(),
  payment_method: z.enum(['cash', 'bank_transfer', 'cheque', 'online']).default('cash'),
  payment_date: z.string(),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { companyId } = await getTenantContext(req);
    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get('invoice_id');

    const where: Record<string, unknown> = { company_id: companyId };
    if (invoiceId) where.invoice_id = invoiceId;

    const payments = await db.payments.findMany({
      where,
      orderBy: { payment_date: 'desc' },
      include: { users: { select: { id: true, full_name: true } } },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { companyId, userId } = await getTenantContext(req);

    if (!companyId || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = createPaymentSchema.parse(body);

    const invoice = await db.invoices.findFirst({
      where: { id: validated.invoice_id, company_id: companyId },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const payment = await db.payments.create({
      data: {
        ...validated,
        amount: validated.amount,
        payment_date: new Date(validated.payment_date),
        company_id: companyId,
        received_by_id: userId,
      },
      include: { users: { select: { id: true, full_name: true } } },
    });

    // Recalculate paid_amount and balance_amount on the invoice
    const allPayments = await db.payments.aggregate({
      where: { invoice_id: validated.invoice_id, company_id: companyId },
      _sum: { amount: true },
    });

    const totalPaid = Number(allPayments._sum.amount ?? 0);
    const totalAmount = Number(invoice.total_amount);
    const balance = Math.max(0, totalAmount - totalPaid);
    const newStatus = balance <= 0 ? 'paid' : invoice.status === 'paid' ? 'sent' : invoice.status;

    await db.invoices.update({
      where: { id: validated.invoice_id },
      data: {
        paid_amount: totalPaid,
        balance_amount: balance,
        status: newStatus as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled',
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
