import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { companyId } = await getTenantContext(req);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    const entityType = searchParams.get('entity_type');

    const where: any = { company_id: companyId };
    if (entityType) where.entity_type = entityType;

    const [data, total] = await Promise.all([
      db.user_activity_log.findMany({
        where,
        include: { users: { select: { id: true, full_name: true, email: true } } },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      db.user_activity_log.count({ where }),
    ]);

    return NextResponse.json({ data, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
