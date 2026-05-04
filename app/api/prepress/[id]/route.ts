import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { companyId } = await getTenantContext(req);
    const design = await db.designs.findFirst({
      where: { id: params.id, company_id: companyId },
    });
    if (!design) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(design);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { companyId } = await getTenantContext(req);
    const body = await req.json();
    const design = await db.designs.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(design);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.designs.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
