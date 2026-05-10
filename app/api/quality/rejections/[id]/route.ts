import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateRejectionSchema = z.object({
  corrective_action: z.string().optional(),
  disposition: z.enum(['scrap', 'rework', 'concession', 'return_to_supplier']).optional(),
  is_resolved: z.boolean().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = await params;

    const rejection = await db.quality_rejections.findFirst({
      where: { id, company_id: companyId },
      include: {
        production_jobs: { select: { id: true, job_number: true, status: true } },
      },
    });

    if (!rejection) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(rejection);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch rejection' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = await params;
    const body = await req.json();
    const validated = updateRejectionSchema.parse(body);

    const data: Record<string, unknown> = { ...validated };
    if (validated.is_resolved === true) {
      data.resolved_at = new Date();
    }

    const result = await db.quality_rejections.updateMany({
      where: { id, company_id: companyId },
      data,
    });

    if (result.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = await db.quality_rejections.findFirst({ where: { id } });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update rejection' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = await params;

    const result = await db.quality_rejections.deleteMany({
      where: { id, company_id: companyId },
    });

    if (result.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete rejection' }, { status: 500 });
  }
}
