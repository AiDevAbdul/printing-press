import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  full_name: z.string().min(1).optional(),
  role: z.enum(['admin', 'sales', 'production', 'quality', 'finance', 'dispatch', 'prepress', 'operator']).optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  bio: z.string().optional(),
  is_active: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = await params;

    const user = await db.users.findFirst({
      where: { id, company_id: companyId },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        is_active: true,
        phone: true,
        department: true,
        bio: true,
        avatar_url: true,
        created_at: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = await params;
    const body = await req.json();

    // Verify user exists and belongs to company
    const existing = await db.users.findFirst({
      where: { id, company_id: companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Validate request body
    const validated = updateUserSchema.parse(body);

    // If password is provided, hash it
    const updateData: any = { ...validated };
    if (validated.password) {
      updateData.password_hash = await bcrypt.hash(validated.password, 10);
      delete updateData.password;
    }

    const user = await db.users.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        is_active: true,
        phone: true,
        department: true,
        created_at: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = await params;

    // Verify user exists and belongs to company
    const existing = await db.users.findFirst({
      where: { id, company_id: companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting is_active to false
    await db.users.update({
      where: { id },
      data: { is_active: false },
    });

    return NextResponse.json(
      { message: 'User deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
