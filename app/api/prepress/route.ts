import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const createPrepressSchema = z.object({
  name: z.string().min(1),
  specs_sheet_url: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { companyId } = await getTenantContext(req);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      db.designs.findMany({
        where: { company_id: companyId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      db.designs.count({ where: { company_id: companyId } }),
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
      data: { ...validated, company_id: companyId, designer_id: userId, design_type: 'other', product_category: 'other' },
    });

    return NextResponse.json(design, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
