import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(1),
  role: z.enum(['admin', 'sales', 'planner', 'accounts', 'inventory']).default('sales'),
  phone: z.string().optional(),
  department: z.string().optional(),
  bio: z.string().optional(),
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  full_name: z.string().min(1).optional(),
  role: z.enum(['admin', 'sales', 'production', 'quality', 'finance', 'dispatch', 'prepress', 'operator']).optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  bio: z.string().optional(),
  is_active: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { companyId } = await getTenantContext(req);
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const search = searchParams.get('search');

    const where: any = { company_id: companyId };

    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      db.users.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
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
      }),
      db.users.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { companyId } = await getTenantContext(req);

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company not selected' },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Validate request body
    const validated = createUserSchema.parse(body);

    // Check if email already exists in company
    const existing = await db.users.findFirst({
      where: { email: validated.email, company_id: companyId },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await bcrypt.hash(validated.password, 10);

    const user = await db.users.create({
      data: {
        ...validated,
        password_hash,
        company_id: companyId,
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
