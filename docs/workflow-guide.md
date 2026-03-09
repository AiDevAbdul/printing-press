# Production Workflow Guide

Complete guide for production workflow management, stage tracking, and operator inheritance.

## Table of Contents
1. [Workflow Overview](#workflow-overview)
2. [Stage Progression](#stage-progression)
3. [Operator & Machine Inheritance](#operator--machine-inheritance)
4. [Queue Management](#queue-management)
5. [Complete Workflow Example](#complete-workflow-example)
6. [API Reference](#api-reference)
7. [Troubleshooting](#troubleshooting)

---

## Workflow Overview

### Module Flow
```
Orders (Sales) → Planning (Planner) → Production (Manager) → Shop Floor (Operators)
```

### 1. Orders Module
**Route**: `/orders`

**Actions**:
- Create new orders
- Approve pending orders → `approved`
- Cancel orders → `cancelled`

**Status Flow**:
```
pending → approved (Approve button)
pending → cancelled (Cancel button)
approved → cancelled (Cancel button)
```

### 2. Planning Module
**Route**: `/planning`

**Purpose**: Convert approved orders into production jobs

**Actions**:
- Click "Create Job" for any approved order
- Fill in production details:
  - Scheduled start/end dates
  - Assigned machine (e.g., "HB1", "UV#1")
  - Assigned operator (select from users)
  - Estimated hours
  - Notes

**Result**: Creates production job with status = `queued`

### 3. Production Module
**Route**: `/production`

**Actions by Status**:

| Status | Available Actions |
|--------|------------------|
| `queued` | Start, Cancel |
| `in_progress` | Pause, Complete, Cancel |
| `paused` | Resume, Cancel |
| `completed` | No actions |
| `cancelled` | No actions |

### 4. Shop Floor Module
**Route**: `/shop-floor`

**Two Views**:
- **My Jobs**: Shows jobs assigned to logged-in operator
- **All Jobs**: Shows all active jobs across operators
- Auto-refreshes every 10 seconds

---

## Stage Progression

### Workflow Stages

Production jobs go through multiple stages in sequence:

**Standard Stages** (always present):
1. Printing - Cyan (Order: 1)
2. Printing - Magenta (Order: 2)
3. Printing - Yellow (Order: 3)
4. Printing - Black (Order: 4)
5. Sorting (Order: 8)
6. Dye Cutting (Order: 10)
7. Breaking (Order: 11)

**Optional Stages** (may be skipped):
- Printing - Pantone (Order: 5)
- UV/Varnish (Order: 6)
- Lamination (Order: 7)
- Emboss (Order: 9)

### Non-Sequential Stage Orders

⚠️ **Important**: Stage orders are NOT always sequential (1,2,3,4,5...). Optional stages create gaps in the sequence.

**Example**: A job without optional stages will have orders: 1, 2, 3, 4, 8, 10, 11

**Backend Handling**:
```typescript
// ✅ CORRECT: Find next stage by comparing stage_order
const allStages = await workflowStagesRepository.find({
  where: { job: { id: jobId } },
  order: { stage_order: 'ASC' },
});
const nextStage = allStages.find(s => s.stage_order > currentStage.stage_order);

// ❌ WRONG: Assuming sequential orders
const nextStage = await workflowStagesRepository.findOne({
  where: { stage_order: currentStage.stage_order + 1 }
});
```

### Stage Status Flow

```
pending → in_progress → completed
         ↓
       paused → in_progress
```

### Stage Actions

**Pending Stage**:
- Can start if previous stage is completed
- Requires operator and machine (inherited from previous stage if not assigned)

**In Progress Stage**:
- Can pause (with optional reason)
- Can complete (with optional waste quantity and notes)

**Paused Stage**:
- Can resume
- Can complete directly without resuming

**Completed Stage**:
- No further actions available
- Duration and metrics recorded

---

## Operator & Machine Inheritance

### Problem
When a job doesn't have an assigned operator at the job level, but stages need to be started.

### Solution
The system automatically inherits operator and machine from the previous completed stage.

### Backend Logic

```typescript
// In startWorkflowStage method
const currentIndex = allStages.findIndex(s => s.id === stageId);
if (currentIndex > 0) {
  const prevStage = allStages[currentIndex - 1];

  // Inherit operator if not provided
  if ((!operatorId || operatorId === '') && prevStage.operator) {
    operatorId = prevStage.operator.id;
    console.log(`Using operator from previous stage: ${prevStage.operator_name}`);
  }

  // Inherit machine if not provided
  if (!machine && prevStage.machine) {
    machine = prevStage.machine;
    console.log(`Using machine from previous stage: ${machine}`);
  }
}
```

### Frontend Handling

```typescript
// WorkflowStageActions.tsx
const handleStart = async () => {
  // Use stage's operator/machine if job doesn't have them assigned
  const effectiveOperatorId = operatorId || stage.operator?.id;
  const effectiveMachine = machine || stage.machine;

  // Send to backend - backend will inherit from previous stage if needed
  await workflowService.startStage(jobId, stage.id, {
    operator_id: effectiveOperatorId || '',
    machine: effectiveMachine,
  });
};
```

### Workflow Stage Interface

```typescript
export interface WorkflowStage {
  id: number;
  stage_name: string;
  stage_order: number;
  status: 'pending' | 'in_progress' | 'paused' | 'completed';
  operator_name?: string;
  operator?: {
    id: string;
    full_name: string;
  };
  machine?: string;
  can_start: boolean;
  can_pause: boolean;
  can_complete: boolean;
  // ... other fields
}
```

---

## Queue Management

### Automatic Position Assignment
Jobs created with status `queued` automatically get a position based on creation time (FIFO).

```typescript
// ❌ DON'T: job.queue_position = 1
// ✅ DO: Let backend calculate on job creation
```

### Position Recalculation
Queue positions recalculate automatically when:
- A job starts (status: `queued` → `in_progress`)
- A job is cancelled (status: `queued` → `cancelled`)

---

## Complete Workflow Example

### Scenario: New Order for 1000 Business Cards

**Step 1: Sales Creates Order**
1. Go to **Orders** page
2. Click "Add Order"
3. Fill in:
   - Customer: ABC Company
   - Product: Business Cards
   - Quantity: 1000
   - Delivery Date: 2026-03-10
   - Priority: High
4. Submit → Order created with status `pending`

**Step 2: Sales Approves Order**
1. In **Orders** page, find the order
2. Click "Approve" button
3. Status changes to `approved`

**Step 3: Planner Creates Production Job**
1. Go to **Planning** page
2. See the approved order in the list
3. Click "Create Job"
4. Fill in:
   - Start Date: 2026-03-04
   - End Date: 2026-03-06
   - Machine: "HB1"
   - Operator: John Doe
   - Estimated Hours: 8
5. Submit → Production job created with status `queued`

**Step 4: Planner Starts Production**
1. Go to **Production** page
2. Find the job (status: `queued`)
3. Click "Start" button
4. Status changes to `in_progress`

**Step 5: Operator Works on Stages**
1. Operator (John Doe) logs in
2. Goes to **Shop Floor** page or clicks job in **Production** page
3. Sees workflow with all stages
4. Clicks "Start Stage" for Stage 1 (Printing - Cyan)
5. Stage 1 starts, inherits operator and machine from job
6. When done, clicks "Complete" for Stage 1
7. Stage 2 automatically unlocks
8. Clicks "Start Stage" for Stage 2
9. Stage 2 inherits operator and machine from Stage 1
10. Continues through all stages

**Step 6: Job Completion**
1. After all stages completed, job status updates to `completed`
2. Job appears in completed jobs list
3. Ready for dispatch

---

## API Reference

### Workflow Endpoints

#### Initialize Workflow
```
POST /api/production/workflow/:jobId/initialize
Body: {
  has_pantone?: boolean,
  has_uv_varnish?: boolean,
  has_lamination?: boolean,
  has_emboss?: boolean,
  needs_pasting?: boolean
}
```

#### Get Workflow Stages
```
GET /api/production/workflow/:jobId
Response: {
  job_id: string,
  current_stage: string,
  stages: WorkflowStage[]
}
```

#### Start Stage
```
POST /api/production/workflow/:jobId/stages/:stageId/start
Body: {
  operator_id: string,  // Can be empty - will inherit from previous stage
  machine?: string,     // Optional - will inherit from previous stage
  notes?: string
}
```

#### Pause Stage
```
POST /api/production/workflow/:jobId/stages/:stageId/pause
Body: {
  reason?: string
}
```

#### Resume Stage
```
POST /api/production/workflow/:jobId/stages/:stageId/resume
```

#### Complete Stage
```
POST /api/production/workflow/:jobId/stages/:stageId/complete
Body: {
  waste_quantity?: number,
  notes?: string,
  quality_approved?: boolean
}
```

### Production Job Endpoints

```
GET /api/production/jobs              - List all jobs
GET /api/production/jobs/:id          - Get job details
POST /api/production/jobs             - Create job
POST /api/production/jobs/:id/start   - Start job
POST /api/production/jobs/:id/complete - Complete job
PATCH /api/production/jobs/:id/status - Update job status
```

### Shop Floor Endpoints

```
GET /api/production/shop-floor/my-jobs - Get my assigned jobs
GET /api/production/jobs?status=in_progress,queued,paused - Get all active jobs
```

---

## Troubleshooting

### Stage Won't Unlock After Previous Stage Completed

**Symptoms**:
- Previous stage shows "Completed" ✓
- Next stage shows "Ready to start" but button is disabled
- Current stage field not updating

**Causes**:
1. Backend not restarted after code changes
2. Non-sequential stage orders not handled correctly
3. Operator/machine inheritance not working

**Solutions**:
1. Restart backend server: `npm run start:dev`
2. Check backend console for debug logs
3. Verify previous stage has operator and machine assigned
4. Check that `can_start` flag is true in API response

### "Job must have an assigned operator and machine" Error

**Cause**: Frontend validation blocking before backend can inherit values

**Solution**: This should be fixed in the latest version. If you still see this:
1. Ensure backend is running latest code
2. Check that previous stage has operator assigned
3. Verify WorkflowStage interface includes `operator` field

### Stage Progression Skips Stages

**Cause**: Using `stage_order + 1` instead of finding next stage by order

**Solution**: Backend now correctly finds next stage:
```typescript
const nextStage = allStages.find(s => s.stage_order > currentStage.stage_order);
```

### "No jobs in Shop Floor"

**Solutions**:
1. Check if production jobs exist (Production page)
2. Check job status (must be queued/in_progress/paused)
3. Check if job assigned to you (or use "Show All Jobs")
4. Check browser console for errors

### "Can't start production job"

**Solutions**:
1. Verify job status is `queued`
2. Check user permissions (need planner/admin role)
3. Check backend is running

---

## Auto-Generated Fields (NEVER SET MANUALLY)

### inline_status
Auto-generated based on job state:
- Queued: `"Queued (Position #X of Y)"`
- In Progress: `"[Stage] - [Process] on [Machine]"`
- Completed: `"Completed - Ready for Delivery"`

```typescript
// ❌ DON'T: job.inline_status = "Printing - Cyan on HB1"
// ✅ DO: Start stage with stage/process/machine, status auto-updates
```

### queue_position
Auto-calculated based on creation time and current queue state.

```typescript
// ❌ DON'T: job.queue_position = 1
// ✅ DO: Create job with status 'queued', position auto-assigns
```

### searchable_text
Auto-updated when job details change. Combines:
- Job number, Order number, Product name, Customer name
- Current stage, Current process, Machine name, Operator name

```typescript
// ❌ DON'T: job.searchable_text = "..."
// ✅ DO: Update job fields, searchable_text auto-updates
```

---

## Status Reference

### Order Statuses
- `pending` - Awaiting approval
- `approved` - Ready for production planning
- `in_production` - Has active production job
- `completed` - Production finished
- `delivered` - Dispatched to customer
- `cancelled` - Order cancelled

### Production Job Statuses
- `queued` - Waiting to start
- `in_progress` - Currently being worked on
- `paused` - Temporarily stopped
- `completed` - Finished
- `cancelled` - Job cancelled

### Workflow Stage Statuses
- `pending` - Not started yet
- `in_progress` - Currently active
- `paused` - Temporarily stopped
- `completed` - Finished

---

## Last Updated
2026-03-09 - Added operator/machine inheritance and non-sequential stage order handling
