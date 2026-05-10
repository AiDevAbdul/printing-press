import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = await params;
    const design = await db.designs.findFirst({
      where: { id, company_id: companyId },
      include: {
        users: { select: { id: true, full_name: true, email: true } },
        design_approvals: {
          include: { users: { select: { id: true, full_name: true } } },
          orderBy: { created_at: 'desc' },
        },
        design_attachments: {
          orderBy: { created_at: 'desc' },
        },
      },
    });
    if (!design) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(design);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = await params;
    const body = await req.json();
    const design = await db.designs.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(design);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.designs.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
