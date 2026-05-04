import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateNotificationSchema = z.object({
  read: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { companyId, userId } = await getTenantContext(req);
    const { id } = await params;

    const notification = await db.notifications.findFirst({
      where: { id, user_id: userId, users: { company_id: companyId } },
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error fetching notification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { companyId, userId } = await getTenantContext(req);
    const { id } = await params;
    const body = await req.json();

    // Verify notification belongs to user
    const existing = await db.notifications.findFirst({
      where: { id, user_id: userId, users: { company_id: companyId } },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    const validated = updateNotificationSchema.parse(body);

    const notification = await db.notifications.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(notification);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { companyId, userId } = await getTenantContext(req);
    const { id } = await params;

    // Verify notification belongs to user
    const existing = await db.notifications.findFirst({
      where: { id, user_id: userId, users: { company_id: companyId } },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    await db.notifications.delete({ where: { id } });

    return NextResponse.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
