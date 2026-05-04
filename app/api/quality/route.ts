import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const createQualitySchema = z.object({
  job_id: z.string().uuid(),
  inspection_type: z.string().min(1),
  status: z.enum(['pending', 'passed', 'failed', 'rework']).default('pending'),
  notes: z.string().optional(),
  inspector_id: z.string().uuid().optional(),
});

const updateQualitySchema = createQualitySchema.partial();

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
      db.inspections.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      db.inspections.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching quality inspections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quality inspections' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { companyId, userId } = await getTenantContext(req);
    const body = await req.json();

    const validated = createQualitySchema.parse(body);

    const inspection = await db.inspections.create({
      data: {
        ...validated,
        company_id: companyId,
        inspector_id: validated.inspector_id || userId,
      },
    });

    return NextResponse.json(inspection, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating quality inspection:', error);
    return NextResponse.json(
      { error: 'Failed to create quality inspection' },
      { status: 500 }
    );
  }
}
