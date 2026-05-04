import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const createDispatchSchema = z.object({
  order_id: z.string().uuid(),
  delivery_address: z.string().min(1),
  delivery_date: z.string().datetime(),
  status: z.enum(['pending', 'in_transit', 'delivered', 'failed']).default('pending'),
  tracking_number: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { companyId } = await getTenantContext(req);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const status = searchParams.get('status');

    const where: any = { company_id: companyId };
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      db.deliveries.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      db.deliveries.count({ where }),
    ]);

    return NextResponse.json({ data, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { companyId, userId } = await getTenantContext(req);
    const body = await req.json();
    const validated = createDispatchSchema.parse(body);

    const delivery = await db.deliveries.create({
      data: { ...validated, company_id: companyId, created_by: userId },
    });

    return NextResponse.json(delivery, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
