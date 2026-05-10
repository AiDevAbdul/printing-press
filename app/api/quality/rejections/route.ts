import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const createRejectionSchema = z.object({
  job_id: z.string().uuid(),
  rejected_quantity: z.number().int().positive(),
  unit: z.string().min(1).max(20),
  reason: z.string().min(1),
  disposition: z.enum(['scrap', 'rework', 'concession', 'return_to_supplier']),
  estimated_loss: z.number().positive().optional(),
  corrective_action: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { companyId } = await getTenantContext(req);
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const skip = (page - 1) * limit;
    const job_id = searchParams.get('job_id');
    const is_resolved = searchParams.get('is_resolved');

    const where: Record<string, unknown> = { company_id: companyId };
    if (job_id) where.job_id = job_id;
    if (is_resolved !== null) where.is_resolved = is_resolved === 'true';

    const [data, total] = await Promise.all([
      db.quality_rejections.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          production_jobs: { select: { job_number: true } },
        },
      }),
      db.quality_rejections.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching rejections:', error);
    return NextResponse.json({ error: 'Failed to fetch rejections' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { companyId, userId } = await getTenantContext(req);
    const body = await req.json();
    const validated = createRejectionSchema.parse(body);

    const date = new Date();
    const dayOfYear = Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
    );
    const rejection_number = `REJ-${date.getFullYear()}-${dayOfYear}-${Date.now().toString().slice(-6)}`;

    const rejection = await db.quality_rejections.create({
      data: {
        rejection_number,
        job_id: validated.job_id,
        rejected_quantity: validated.rejected_quantity,
        unit: validated.unit,
        reason: validated.reason,
        disposition: validated.disposition,
        estimated_loss: validated.estimated_loss,
        corrective_action: validated.corrective_action,
        company_id: companyId as string,
        rejected_by_id: userId as string,
      },
    });

    return NextResponse.json(rejection, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    console.error('Error creating rejection:', error);
    return NextResponse.json({ error: 'Failed to create rejection' }, { status: 500 });
  }
}
