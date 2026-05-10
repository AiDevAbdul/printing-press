import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const createApprovalSchema = z.object({
  design_id: z.string().uuid(),
  status: z.enum(['pending', 'approved', 'rejected']),
  comments: z.string().optional(),
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
      db.design_approvals.findMany({
        where,
        include: { designs: true },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      db.design_approvals.count({ where }),
    ]);

    return NextResponse.json({ data, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { companyId, userId } = await getTenantContext(req);
    const body = await req.json();
    const validated = createApprovalSchema.parse(body);

    if (!companyId) {
      return NextResponse.json({ error: 'Company not selected' }, { status: 400 });
    }

    const design = await db.designs.findFirst({
      where: { id: validated.design_id, company_id: companyId },
    });
    if (!design) return NextResponse.json({ error: 'Design not found' }, { status: 404 });

    const approval = await db.design_approvals.create({
      data: {
        design_id: validated.design_id,
        status: validated.status,
        comments: validated.comments,
        approver_id: userId,
        company_id: companyId,
      },
    });

    return NextResponse.json(approval, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
