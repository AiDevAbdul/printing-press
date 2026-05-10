import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { companyId } = await getTenantContext(req);
    const { searchParams } = new URL(req.url);
    const stage = searchParams.get('stage');

    const where: any = { company_id: companyId, is_active: true };
    if (stage) where.stage = stage;

    const checkpoints = await db.quality_checkpoints.findMany({
      where,
      orderBy: [{ stage: 'asc' }, { sequence_order: 'asc' }],
      select: {
        id: true,
        name: true,
        description: true,
        stage: true,
        severity: true,
        checklist_items: true,
      },
    });

    return NextResponse.json(checkpoints);
  } catch (error) {
    console.error('Error fetching quality checkpoints:', error);
    return NextResponse.json({ error: 'Failed to fetch checkpoints' }, { status: 500 });
  }
}
