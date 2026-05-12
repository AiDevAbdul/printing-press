import { NextRequest, NextResponse } from 'next/server';
import { renderToStream, type DocumentProps } from '@react-pdf/renderer';
import React from 'react';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { InvoicePDF, type InvoicePDFData } from '@/lib/pdf/invoice-template';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = await params;

    const [invoice, company] = await Promise.all([
      db.invoices.findFirst({
        where: { id, company_id: companyId },
        include: {
          customers: true,
          invoice_items: true,
          payments: {
            orderBy: { payment_date: 'desc' },
            include: { users: { select: { id: true, full_name: true } } },
          },
        },
      }),
      db.companies.findFirst({ where: { id: companyId } }),
    ]);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const pdfData: InvoicePDFData = {
      invoice: {
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date?.toISOString(),
        due_date: invoice.due_date?.toISOString(),
        status: invoice.status,
        subtotal: invoice.subtotal ? Number(invoice.subtotal) : undefined,
        tax_amount: invoice.tax_amount ? Number(invoice.tax_amount) : undefined,
        tax_rate: invoice.tax_rate ? Number(invoice.tax_rate) : undefined,
        total_amount: Number(invoice.total_amount),
        paid_amount: invoice.paid_amount ? Number(invoice.paid_amount) : undefined,
        balance_amount: invoice.balance_amount ? Number(invoice.balance_amount) : undefined,
        notes: invoice.notes ?? undefined,
        payment_terms: invoice.payment_terms ?? undefined,
      },
      customer: invoice.customers ? {
        name: invoice.customers.name,
        company_name: invoice.customers.company_name ?? undefined,
        email: invoice.customers.email ?? undefined,
        phone: invoice.customers.phone ?? undefined,
        address: invoice.customers.address ?? undefined,
      } : undefined,
      company: {
        name: company?.name ?? 'Company',
        email: company?.email ?? undefined,
        phone: company?.phone ?? undefined,
        address: company?.address ?? undefined,
        city: company?.city ?? undefined,
        gstin: company?.gstin ?? undefined,
      },
      items: invoice.invoice_items.map(item => ({
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        total_price: Number(item.total_price),
      })),
      payments: invoice.payments.map(p => ({
        payment_date: p.payment_date.toISOString(),
        payment_method: p.payment_method,
        amount: Number(p.amount),
        reference_number: p.reference_number ?? undefined,
        users: p.users ?? undefined,
      })),
    };

    const element = React.createElement(InvoicePDF, { data: pdfData }) as unknown as React.ReactElement<DocumentProps>;
    const stream = await renderToStream(element);

    const chunks: Buffer[] = [];
    for await (const chunk of stream as AsyncIterable<Buffer>) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const pdf = Buffer.concat(chunks);

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoice_number}.pdf"`,
        'Content-Length': pdf.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
