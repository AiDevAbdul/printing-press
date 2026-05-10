import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const createDefectSchema = z.object({
  inspection_id: z.string().uuid(),
  category: z.string().min(1).max(50),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().min(1).max(200),
  quantity: z.number().int().positive().default(1),
  root_cause: z.string().optional(),
  corrective_action: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { companyId } = await getTenantContext(req);
    const { searchParams } = new URL(req.url);
    const inspection_id = searchParams.get('inspection_id');

    const where: Record<string, unknown> = { company_id: companyId };
    if (inspection_id) where.inspection_id = inspection_id;

    const defects = await db.quality_defects.findMany({
      where,
      orderBy: { created_at: 'asc' },
    });

    return NextResponse.json(defects);
  } catch (error) {
    console.error('Error fetching defects:', error);
    return NextResponse.json({ error: 'Failed to fetch defects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { companyId, userId } = await getTenantContext(req);
    const body = await req.json();
    const validated = createDefectSchema.parse(body);

    const defect = await db.quality_defects.create({
      data: {
        inspection_id: validated.inspection_id,
        category: validated.category,
        severity: validated.severity,
        description: validated.description,
        quantity: validated.quantity ?? 1,
        root_cause: validated.root_cause,
        corrective_action: validated.corrective_action,
        company_id: companyId as string,
        logged_by_id: userId as string,
      },
    });

    return NextResponse.json(defect, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    console.error('Error creating defect:', error);
    return NextResponse.json({ error: 'Failed to create defect' }, { status: 500 });
  }
}
