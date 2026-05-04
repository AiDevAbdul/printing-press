import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { z } from 'zod';

const exportSchema = z.object({
  entity_type: z.enum(['orders', 'quotations', 'invoices', 'inventory', 'production']),
  format: z.enum(['excel', 'pdf']).default('excel'),
  filters: z.object({
    status: z.string().optional(),
    date_from: z.string().optional(),
    date_to: z.string().optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { companyId } = await getTenantContext(req);
    const body = await req.json();
    const validated = exportSchema.parse(body);

    const exportJob = {
      id: crypto.randomUUID(),
      entity_type: validated.entity_type,
      format: validated.format,
      status: 'pending',
      created_at: new Date(),
      company_id: companyId,
      filters: validated.filters || {},
    };

    return NextResponse.json(exportJob, { status: 202 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
