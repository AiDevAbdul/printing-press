import { NextRequest, NextResponse } from 'next/server';
import { renderToStream, type DocumentProps } from '@react-pdf/renderer';
import React from 'react';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { QuotationPDF, type QuotationPDFData } from '@/lib/pdf/quotation-template';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = await params;

    const [quotation, company] = await Promise.all([
      db.quotations.findFirst({
        where: { id, company_id: companyId },
        include: { customers: true },
      }),
      db.companies.findFirst({ where: { id: companyId } }),
    ]);

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    const pdfData: QuotationPDFData = {
      quotation: {
            quotation_number: quotation.quotation_number,
            quotation_date: quotation.quotation_date?.toISOString(),
            valid_until: quotation.valid_until?.toISOString(),
            status: quotation.status,
            product_name: quotation.product_name,
            product_type: quotation.product_type ?? undefined,
            quantity: quotation.quantity ? Number(quotation.quantity) : undefined,
            unit: quotation.unit ?? undefined,
            length: quotation.length ? Number(quotation.length) : undefined,
            width: quotation.width ? Number(quotation.width) : undefined,
            height: quotation.height ? Number(quotation.height) : undefined,
            dimension_unit: quotation.dimension_unit ?? undefined,
            paper_type: quotation.paper_type ?? undefined,
            gsm: quotation.gsm ?? undefined,
            double_sheet: quotation.double_sheet ?? undefined,
            four_color_process: quotation.four_color_process,
            inside_printing: quotation.inside_printing,
            cmyk_cyan: quotation.cmyk_cyan,
            cmyk_magenta: quotation.cmyk_magenta,
            cmyk_yellow: quotation.cmyk_yellow,
            cmyk_black: quotation.cmyk_black,
            color_front: quotation.color_front,
            color_back: quotation.color_back,
            pantone_cmyk_1: quotation.pantone_cmyk_1 ?? undefined,
            pantone_cmyk_2: quotation.pantone_cmyk_2 ?? undefined,
            pantone_cmyk_3: quotation.pantone_cmyk_3 ?? undefined,
            pantone_cmyk_4: quotation.pantone_cmyk_4 ?? undefined,
            varnish_type: quotation.varnish_type ?? undefined,
            lamination_type: quotation.lamination_type ?? undefined,
            embossing: quotation.embossing,
            foiling: quotation.foiling,
            die_cutting: quotation.die_cutting,
            pasting: quotation.pasting,
            ctp_required: quotation.ctp_required,
            bar_code: quotation.bar_code ?? undefined,
            dye_req: quotation.dye_req ?? undefined,
            batch_no_printing: quotation.batch_no_printing,
            batch_no: quotation.batch_no ?? undefined,
            mfg_date: quotation.mfg_date?.toISOString(),
            exp_date: quotation.exp_date?.toISOString(),
            mrp_rs: quotation.mrp_rs ? Number(quotation.mrp_rs) : undefined,
            bleach_card: quotation.bleach_card,
            box_board_card: quotation.box_board_card,
            art_card: quotation.art_card,
            ups: quotation.ups ?? undefined,
            paper_ups: quotation.paper_ups ?? undefined,
            material_cost: quotation.material_cost ? Number(quotation.material_cost) : undefined,
            printing_cost: quotation.printing_cost ? Number(quotation.printing_cost) : undefined,
            finishing_cost: quotation.finishing_cost ? Number(quotation.finishing_cost) : undefined,
            pre_press_cost: quotation.pre_press_cost ? Number(quotation.pre_press_cost) : undefined,
            overhead_cost: quotation.overhead_cost ? Number(quotation.overhead_cost) : undefined,
            subtotal: quotation.subtotal ? Number(quotation.subtotal) : undefined,
            profit_margin_percent: quotation.profit_margin_percent ? Number(quotation.profit_margin_percent) : undefined,
            profit_margin_amount: quotation.profit_margin_amount ? Number(quotation.profit_margin_amount) : undefined,
            discount_percent: quotation.discount_percent ? Number(quotation.discount_percent) : undefined,
            discount_amount: quotation.discount_amount ? Number(quotation.discount_amount) : undefined,
            tax_percent: quotation.tax_percent ? Number(quotation.tax_percent) : undefined,
            tax_amount: quotation.tax_amount ? Number(quotation.tax_amount) : undefined,
            total_amount: quotation.total_amount ? Number(quotation.total_amount) : undefined,
            notes: quotation.notes ?? undefined,
            terms_and_conditions: quotation.terms_and_conditions ?? undefined,
      },
      customer: quotation.customers ? {
        name: quotation.customers.name,
        company_name: quotation.customers.company_name ?? undefined,
        email: quotation.customers.email ?? undefined,
        phone: quotation.customers.phone ?? undefined,
        address: quotation.customers.address ?? undefined,
      } : undefined,
      company: {
        name: company?.name ?? 'Company',
        email: company?.email ?? undefined,
        phone: company?.phone ?? undefined,
        address: company?.address ?? undefined,
        city: company?.city ?? undefined,
        gstin: company?.gstin ?? undefined,
      },
    };

    const element = React.createElement(QuotationPDF, { data: pdfData }) as unknown as React.ReactElement<DocumentProps>;
    const stream = await renderToStream(element);

    const chunks: Buffer[] = [];
    for await (const chunk of stream as AsyncIterable<Buffer>) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const pdf = Buffer.concat(chunks);

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quotation-${quotation.quotation_number}.pdf"`,
        'Content-Length': pdf.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating quotation PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
