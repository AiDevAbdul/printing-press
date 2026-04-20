# Production Workflow

## Workflow Stages

Production jobs progress through stages with non-sequential orders due to optional stages:

```
Stage Order: 1 → 2 → 3 → 4 → 8 → 10 → 11
(not 1,2,3,4,5,6,7,8,9,10,11)
```

### Stage Details
| Order | Stage | Description | Optional |
|-------|-------|-------------|----------|
| 1 | Pre-Press | Design preparation | No |
| 2 | Plate Making | Create printing plates | No |
| 3 | Machine Setup | Configure printing machine | No |
| 4 | Printing | Main printing process | No |
| 8 | Finishing | Post-print processing | Yes |
| 10 | Quality Check | QA inspection | Yes |
| 11 | Dispatch | Ready for delivery | No |

## Stage Progression

### Rules
- Stages must be completed in order (1 → 2 → 3 → 4 → 8 → 10 → 11)
- Use `stage_order` comparison, NOT `stage_order + 1` (handles gaps)
- Optional stages can be skipped
- Cannot go backwards

### Example Progression
```
Job created at Stage 1 (Pre-Press)
↓
Complete Stage 1 → Move to Stage 2 (Plate Making)
↓
Complete Stage 2 → Move to Stage 3 (Machine Setup)
↓
Complete Stage 3 → Move to Stage 4 (Printing)
↓
Complete Stage 4 → Skip Stage 8 (Finishing) → Move to Stage 10 (Quality Check)
↓
Complete Stage 10 → Move to Stage 11 (Dispatch)
↓
Job Complete
```

## Operator & Machine Inheritance

### Rule
If a stage doesn't have an operator or machine assigned, **inherit from the previous completed stage**.

### Example
```
Stage 1 (Pre-Press):
  - operator_id: user-123
  - machine_id: null

Stage 2 (Plate Making):
  - operator_id: null (not assigned)
  - machine_id: null (not assigned)

→ Backend automatically inherits:
  - operator_id: user-123 (from Stage 1)
  - machine_id: null (no machine in Stage 1 either)
```

### Implementation
```typescript
// In ProductionService
if (!stage.operator_id && previousStage) {
  stage.operator_id = previousStage.operator_id;
}
if (!stage.machine_id && previousStage) {
  stage.machine_id = previousStage.machine_id;
}
```

## Job Status

### Auto-Generated Field: `inline_status`
Never set manually. Auto-updates based on:
- Current stage
- Stage completion status
- Overall job progress

### Possible Values
- `pending` - Not started
- `in_progress` - Currently being processed
- `completed` - All stages done
- `on_hold` - Paused
- `cancelled` - Cancelled

## Queue Position

### Auto-Generated Field: `queue_position`
Never set manually. Auto-recalculates when:
- New job created
- Job status changes
- Job priority changes

Represents job's position in production queue.

## Searchable Text

### Auto-Generated Field: `searchable_text`
Never set manually. Auto-updates from:
- Job number
- Order number
- Customer name
- Product type
- Machine name

Used for full-text search across jobs.

## Common Pitfalls

❌ **Setting auto-fields manually**
- Don't set `inline_status`, `queue_position`, `searchable_text`
- Backend handles these automatically
- Manual changes will be overwritten

❌ **Wrong stage order comparison**
```typescript
// ❌ WRONG - assumes sequential stages
if (currentStage.stage_order === nextStage.stage_order - 1) { }

// ✅ CORRECT - handles gaps
if (currentStage.stage_order < nextStage.stage_order) { }
```

❌ **Forgetting operator inheritance**
```typescript
// ❌ WRONG - leaves operator_id null
stage.operator_id = null;

// ✅ CORRECT - inherits from previous stage
if (!stage.operator_id && previousStage) {
  stage.operator_id = previousStage.operator_id;
}
```

❌ **operator_id type confusion**
- `operator_id` is UUID string, NOT number
- User IDs are UUIDs: `"550e8400-e29b-41d4-a716-446655440000"`
- Frontend sends empty string `""` if not available
- Backend converts empty string to null

## Frontend Implementation

### Sending Stage Update
```typescript
// ✅ CORRECT - send empty string for unassigned operator
const stageUpdate = {
  stage_order: 2,
  operator_id: operatorSelected ? operatorId : "",
  machine_id: machineSelected ? machineId : "",
  status: "completed"
};

await updateProductionStage(stageUpdate);
```

### Displaying Operator
```typescript
// ✅ CORRECT - handle null/empty operator
const operatorName = stage.operator_id
  ? operators.find(op => op.id === stage.operator_id)?.name
  : "Inherited from previous stage";
```

## Testing Workflow

1. Create production job (Stage 1)
2. Assign operator to Stage 1
3. Complete Stage 1
4. Move to Stage 2 (don't assign operator)
5. Verify Stage 2 inherited operator from Stage 1
6. Complete Stage 2
7. Move to Stage 4 (skip Stage 3)
8. Verify stage order is correct (1 → 2 → 4, not 1 → 2 → 3)
9. Complete all stages
10. Verify job status is "completed"
