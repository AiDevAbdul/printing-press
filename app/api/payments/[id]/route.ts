import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = await params;

    const payment = await db.payments.findFirst({
      where: { id, company_id: companyId },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    await db.payments.delete({ where: { id } });

    // Recalculate invoice totals after deletion
    const allPayments = await db.payments.aggregate({
      where: { invoice_id: payment.invoice_id, company_id: companyId },
      _sum: { amount: true },
    });

    const invoice = await db.invoices.findFirst({
      where: { id: payment.invoice_id, company_id: companyId },
    });

    if (invoice) {
      const totalPaid = Number(allPayments._sum.amount ?? 0);
      const totalAmount = Number(invoice.total_amount);
      const balance = Math.max(0, totalAmount - totalPaid);
      const newStatus = balance <= 0 ? 'paid' : invoice.status === 'paid' ? 'sent' : invoice.status;

      await db.invoices.update({
        where: { id: payment.invoice_id },
        data: {
          paid_amount: totalPaid,
          balance_amount: balance,
          status: newStatus as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled',
        },
      });
    }

    return NextResponse.json({ message: 'Payment deleted' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 });
  }
}
