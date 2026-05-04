import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const createProductionSchema = z.object({
  order_id: z.string().uuid().optional(),
  scheduled_start_date: z.string().datetime().optional(),
  scheduled_end_date: z.string().datetime().optional(),
  assigned_machine: z.string().optional(),
  assigned_operator: z.string().uuid().optional(),
  estimated_hours: z.number().optional(),
  notes: z.string().optional(),
});

const updateProductionSchema = createProductionSchema.partial().extend({
  status: z.enum(['queued', 'running', 'paused', 'completed', 'blocked']).optional(),
  actual_start_date: z.string().datetime().optional(),
  actual_end_date: z.string().datetime().optional(),
  actual_hours: z.number().optional(),
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
        { job_number: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      db.production_jobs.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      db.production_jobs.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching production jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch production jobs' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { companyId, userId } = await getTenantContext(req);
    const body = await req.json();

    const validated = createProductionSchema.parse(body);

    // Generate job number
    const date = new Date();
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const jobNumber = `JOB-${date.getFullYear()}-${dayOfYear}-${Date.now().toString().slice(-6)}`;

    const job = await db.production_jobs.create({
      data: {
        ...validated,
        job_number: jobNumber,
        company_id: companyId,
        status: 'queued',
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating production job:', error);
    return NextResponse.json(
      { error: 'Failed to create production job' },
      { status: 500 }
    );
  }
}
