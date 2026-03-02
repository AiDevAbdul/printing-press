# Production Workflow

## Queue Management

### Automatic Position Assignment
Jobs created with status `queued` automatically get a position based on creation time (FIFO).

```typescript
// Queue positions are auto-calculated - NEVER set manually
// ❌ DON'T: job.queue_position = 1
// ✅ DO: Let backend calculate on job creation
```

### Position Recalculation
Queue positions recalculate automatically when:
- A job starts (status: `queued` → `in_progress`)
- A job is cancelled (status: `queued` → `cancelled`)

## Stage Tracking Workflow

### 1. Create Job
```
Status: queued
Inline Status: "Queued (Position #X of Y)"
Queue Position: Auto-assigned
```

### 2. Start Job
```
POST /api/production/jobs/:id/start
Status: queued → in_progress
Queue positions recalculate for remaining queued jobs
```

### 3. Start Stage
```
POST /api/production/jobs/:id/start-stage
Body: { stage, process, machine, operator_id }

Creates ProductionStageHistory entry
Updates: current_stage, current_process, assigned_machine
Inline Status: "[Stage] - [Process] on [Machine]"
Example: "Printing - Cyan on HB1"

⚠️ Auto-completes previous stage if still active
```

### 4. Complete Stage
```
POST /api/production/jobs/:id/complete-stage
Body: { notes?, waste_quantity? }

Marks stage as completed
Calculates duration in minutes
Clears: current_stage, current_process
```

### 5. Complete Job
```
POST /api/production/jobs/:id/complete
Status: in_progress → completed
Progress: 100%
Inline Status: "Completed - Ready for Delivery"
```

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
- Job number
- Order number
- Product name
- Customer name
- Current stage
- Current process
- Machine name
- Operator name

```typescript
// ❌ DON'T: job.searchable_text = "..."
// ✅ DO: Update job fields, searchable_text auto-updates
```

## ProductionStageHistory Entity

Tracks each production stage with timestamps and duration.

### Fields
- `job_id` - UUID (foreign key)
- `stage` - Enum (Pre-Press, Printing, etc.)
- `process` - String (Cyan, Magenta, Spot UV, etc.)
- `machine` - String (HB1, UV#1, LM-1, etc.)
- `operator_id` - UUID (foreign key to users)
- `started_at` - Timestamp (auto-set on creation)
- `completed_at` - Timestamp (set when stage completes)
- `duration_minutes` - Integer (auto-calculated)
- `notes` - Text (optional)

### Cascade Delete
Stage history entries are automatically deleted when parent job is deleted (ON DELETE CASCADE).

## Key API Endpoints

### GET /api/production/jobs
Enhanced with filters:
- `?search=` - Full-text search (uses searchable_text)
- `?status=` - Filter by status
- `?stage=` - Filter by current stage
- `?machine=` - Filter by assigned machine
- `?operator_id=` - Filter by operator
- `?customer=` - Filter by customer name
- `?product=` - Filter by product name

### GET /api/production/queue
Returns all queued jobs with positions, sorted by queue_position.

### GET /api/production/jobs/:id/timeline
Returns full stage history with durations for a specific job.
