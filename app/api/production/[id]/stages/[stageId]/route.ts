import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateStageSchema = z.object({
  action: z.enum(['start', 'pause', 'complete', 'flag']),
  notes: z.string().optional(),
  pause_reason: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; stageId: string }> }
) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id, stageId } = await params;

    const job = await db.production_jobs.findFirst({
      where: { id, company_id: companyId },
    });
    if (!job) {
      return NextResponse.json({ error: 'Production job not found' }, { status: 404 });
    }

    const stage = await db.production_workflow_stages.findFirst({
      where: { id: parseInt(stageId), job_id: id },
    });
    if (!stage) {
      return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
    }

    const body = await req.json();
    const { action, notes, pause_reason } = updateStageSchema.parse(body);

    const now = new Date();
    let updateData: Record<string, unknown> = { updated_at: now };

    if (action === 'start') {
      updateData = {
        ...updateData,
        status: 'in_progress',
        started_at: stage.started_at ?? now,
        paused_at: null,
      };
    } else if (action === 'pause') {
      const alreadyActive = stage.active_duration_minutes ?? 0;
      const sinceStart = stage.started_at
        ? Math.floor((now.getTime() - new Date(stage.started_at).getTime()) / 60_000)
        : 0;
      const pauseDuration = stage.pause_duration_minutes ?? 0;
      updateData = {
        ...updateData,
        status: 'paused',
        paused_at: now,
        active_duration_minutes: Math.max(0, sinceStart - pauseDuration),
        pause_reason: pause_reason ?? null,
      };
    } else if (action === 'complete') {
      const sinceStart = stage.started_at
        ? Math.floor((now.getTime() - new Date(stage.started_at).getTime()) / 60_000)
        : 0;
      const pauseDuration = stage.pause_duration_minutes ?? 0;
      const activeMins = Math.max(0, sinceStart - pauseDuration);
      updateData = {
        ...updateData,
        status: 'completed',
        completed_at: now,
        active_duration_minutes: activeMins,
        total_duration_minutes: activeMins,
      };
    } else if (action === 'flag') {
      updateData = {
        ...updateData,
        status: 'blocked',
        notes: notes ?? stage.notes,
      };
    }

    const updated = await db.production_workflow_stages.update({
      where: { id: stage.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    console.error('Error updating workflow stage:', error);
    return NextResponse.json({ error: 'Failed to update stage' }, { status: 500 });
  }
}
