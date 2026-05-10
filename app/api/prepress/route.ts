import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const createPrepressSchema = z.object({
  name: z.string().min(1),
  design_type: z.enum(['box', 'label', 'literature', 'logo', 'other']).default('other'),
  product_category: z.enum(['commercial', 'logo', 'product', 'other']).default('other'),
  product_name: z.string().optional(),
  notes: z.string().optional(),
  specs_sheet_url: z.string().optional(),
});

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
        { name: { contains: search, mode: 'insensitive' } },
        { product_name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      db.designs.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: { users: { select: { id: true, full_name: true } } },
      }),
      db.designs.count({ where }),
    ]);

    return NextResponse.json({ data, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
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
    const validated = createPrepressSchema.parse(body);

    const design = await db.designs.create({
      data: { ...validated, company_id: companyId, designer_id: userId },
    });

    return NextResponse.json(design, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
