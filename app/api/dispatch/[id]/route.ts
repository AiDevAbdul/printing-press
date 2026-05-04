import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { companyId } = await getTenantContext(req);
    const delivery = await db.deliveries.findFirst({
      where: { id: params.id, company_id: companyId },
    });
    if (!delivery) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(delivery);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { companyId } = await getTenantContext(req);
    const body = await req.json();
    const delivery = await db.deliveries.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(delivery);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.deliveries.update({
      where: { id: params.id },
      data: { status: 'failed' },
    });
    return NextResponse.json({ message: 'Delivery cancelled' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
