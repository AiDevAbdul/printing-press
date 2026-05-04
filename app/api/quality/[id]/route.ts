import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateQualitySchema = z.object({
  status: z.enum(['pending', 'passed', 'failed', 'rework']).optional(),
  notes: z.string().optional(),
  inspection_type: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = await params;
    const inspection = await db.quality_inspections.findFirst({
      where: { id, company_id: companyId },
    });
    if (!inspection) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(inspection);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = await params;
    const body = await req.json();
    const validated = updateQualitySchema.parse(body);
    const inspection = await db.quality_inspections.update({
      where: { id },
      data: validated,
    });
    return NextResponse.json(inspection);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = await params;
    await db.quality_inspections.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
