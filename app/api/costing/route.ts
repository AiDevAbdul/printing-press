import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const createCostingSchema = z.object({
  labor_rate_per_hour: z.number().optional(),
  machine_rate_per_hour: z.number().optional(),
  overhead_percentage: z.number().optional(),
  profit_margin_percentage: z.number().optional(),
  currency: z.string().default('INR'),
});

const updateCostingSchema = createCostingSchema.partial();

export async function GET(req: NextRequest) {
  try {
    // Get global costing config (only one record)
    const config = await db.costing_config.findFirst();

    if (!config) {
      return NextResponse.json(
        { error: 'Costing configuration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching costing config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch costing configuration' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validated = createCostingSchema.parse(body);

    // Check if config already exists
    const existing = await db.costing_config.findFirst();

    if (existing) {
      // Update instead
      const updated = await db.costing_config.update({
        where: { id: existing.id },
        data: validated,
      });
      return NextResponse.json(updated);
    }

    const config = await db.costing_config.create({
      data: validated,
    });

    return NextResponse.json(config, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating costing config:', error);
    return NextResponse.json(
      { error: 'Failed to create costing configuration' },
      { status: 500 }
    );
  }
}
