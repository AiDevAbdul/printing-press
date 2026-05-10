import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateDefectSchema = z.object({
  description: z.string().min(1).max(200).optional(),
  quantity: z.number().int().positive().optional(),
  root_cause: z.string().optional(),
  corrective_action: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = await params;
    const body = await req.json();
    const validated = updateDefectSchema.parse(body);

    const defect = await db.quality_defects.updateMany({
      where: { id, company_id: companyId },
      data: validated,
    });

    if (defect.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ message: 'Updated' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update defect' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = await params;

    const result = await db.quality_defects.deleteMany({
      where: { id, company_id: companyId },
    });

    if (result.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete defect' }, { status: 500 });
  }
}
