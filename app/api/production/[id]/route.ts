import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateProductionSchema = z.object({
  status: z.enum(['queued', 'running', 'paused', 'completed', 'blocked']).optional(),
  assigned_machine: z.string().optional(),
  assigned_operator: z.string().uuid().optional(),
  scheduled_start_date: z.string().datetime().optional(),
  scheduled_end_date: z.string().datetime().optional(),
  actual_start_date: z.string().datetime().optional(),
  actual_end_date: z.string().datetime().optional(),
  actual_hours: z.number().optional(),
  estimated_hours: z.number().optional(),
  notes: z.string().optional(),
  current_stage: z.string().optional(),
  current_process: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = params;

    const job = await db.production_jobs.findFirst({
      where: { id, company_id: companyId },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Production job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error fetching production job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch production job' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = params;
    const body = await req.json();

    const existing = await db.production_jobs.findFirst({
      where: { id, company_id: companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Production job not found' },
        { status: 404 }
      );
    }

    const validated = updateProductionSchema.parse(body);

    const job = await db.production_jobs.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(job);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating production job:', error);
    return NextResponse.json(
      { error: 'Failed to update production job' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = params;

    const existing = await db.production_jobs.findFirst({
      where: { id, company_id: companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Production job not found' },
        { status: 404 }
      );
    }

    await db.production_jobs.update({
      where: { id },
      data: { status: 'blocked' },
    });

    return NextResponse.json({ message: 'Production job blocked' });
  } catch (error) {
    console.error('Error deleting production job:', error);
    return NextResponse.json(
      { error: 'Failed to delete production job' },
      { status: 500 }
    );
  }
}
