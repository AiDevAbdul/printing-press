import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateStageSchema = z.object({
  job_id: z.string().uuid(),
  stage_number: z.number().int().positive(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { companyId } = await getTenantContext(req);
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('job_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = { company_id: companyId };
    if (jobId) where.id = jobId;

    const [data, total] = await Promise.all([
      db.production_jobs.findMany({
        where,
        include: { production_workflow_stages: { orderBy: { stage_order: 'asc' } } },
        skip,
        take: limit,
      }),
      db.production_jobs.count({ where }),
    ]);

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { companyId, userId } = await getTenantContext(req);
    const body = await req.json();
    const validated = updateStageSchema.parse(body);

    const job = await db.production_jobs.findFirst({
      where: { id: validated.job_id, company_id: companyId },
    });
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const stage = await db.production_workflow_stages.findFirst({
      where: { job_id: validated.job_id, stage_order: validated.stage_number },
    });
    if (!stage) return NextResponse.json({ error: 'Stage not found' }, { status: 404 });

    const updated = await db.production_workflow_stages.update({
      where: { id: stage.id },
      data: {
        status: 'in_progress',
        notes: validated.notes,
        started_at: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
