# Production Workflow Redesign - Architecture Diagram

## Component Hierarchy

```
Production.tsx (Main Page)
│
├─── Desktop View (> 1024px)
│    │
│    └─── ExpandableJobRow (for each job)
│         │
│         ├─── MiniTimeline (compact, in table row)
│         │    └─── 12 stage indicators with tooltips
│         │
│         └─── TimelineDetail (when expanded)
│              │
│              ├─── Horizontal scrollable container
│              ├─── Stage cards (200px each, 8 visible)
│              └─── WorkflowStageActions (per stage)
│
└─── Mobile View (< 768px)
     │
     └─── MobileWorkflowModal (full-screen)
          │
          ├─── Swipe gesture handler
          ├─── Job navigation (← →)
          ├─── Current stage card (large)
          ├─── WorkflowStageActions (touch-optimized)
          └─── All Stages accordion
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Production Page                          │
│  - Fetches jobs list                                        │
│  - Manages expandedJobId state                              │
│  - Handles keyboard shortcuts                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├─── Desktop
                              │    │
                              │    ▼
                    ┌─────────────────────┐
                    │ ExpandableJobRow    │
                    │ - Lazy loads workflow│
                    │ - Auto-refresh (5s) │
                    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ workflow.service.ts │
                    │ - getWorkflowStages()│
                    │ - getWorkflowBatch()│
                    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Backend API         │
                    │ GET /workflow/:id   │
                    │ GET /workflow/batch │
                    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Database            │
                    │ production_workflow_│
                    │ stages table        │
                    └─────────────────────┘
```

## State Management

```
┌─────────────────────────────────────────────────────────────┐
│                     React Query Cache                        │
│                                                              │
│  queryKey: ['workflow', jobId]                              │
│  staleTime: 30000ms (30 seconds)                            │
│  cacheTime: 300000ms (5 minutes)                            │
│  refetchInterval: 5000ms (only when expanded)               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Local Component State                    │
│                                                              │
│  Production.tsx:                                            │
│  - expandedJobId: string | null                             │
│  - selectedJobId: string | null (mobile)                    │
│  - showWorkflowModal: boolean (mobile)                      │
│                                                              │
│  WorkflowStageActions.tsx:                                  │
│  - showPauseInput: boolean                                  │
│  - showCompleteForm: boolean                                │
│  - pauseReason: string                                      │
│  - wasteQuantity: string                                    │
│  - notes: string                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Responsive Breakpoints

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  Mobile (< 768px)                                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Full-screen Modal                                  │    │
│  │  - Touch-optimized (60px buttons)                   │    │
│  │  - Swipe gestures                                   │    │
│  │  - Haptic feedback                                  │    │
│  │  - Job navigation arrows                            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Tablet (768px - 1023px)                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Inline Timeline                                    │    │
│  │  - Larger touch targets (48px)                      │    │
│  │  - Horizontal scroll                                │    │
│  │  - Expandable rows                                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Desktop (> 1024px)                                         │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Inline Timeline + Keyboard Shortcuts               │    │
│  │  - Standard buttons (40px)                          │    │
│  │  - Keyboard navigation (↓↑ Enter Esc)              │    │
│  │  - Hover tooltips                                   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Timeline Visual Structure

### Desktop - Collapsed (MiniTimeline)
```
┌─────────────────────────────────────────────────────────────┐
│ JOB-001 │ Order #123 │ Box Printing │ 1000 │ In Progress   │
│ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ ← Progress bar
│ ● ● ● ● ○ ○ ○ ○ ○ ○ ○ ○  ← 12 stage indicators            │
│ ✓ ✓ ✓ ⚡ · · · · · · · ·  ← Status icons                   │
└─────────────────────────────────────────────────────────────┘
```

### Desktop - Expanded (TimelineDetail)
```
┌─────────────────────────────────────────────────────────────┐
│ Production Workflow                              [Collapse ×]│
│ Operator: Ali | Machine: HB2 | Current: Printing - Black    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │ Cyan │  │Magenta│ │Yellow│  │Black │  │Pantone│  ...    │
│  │  ✓   │  │  ✓   │  │  ✓   │  │  ⚡  │  │  ·   │         │
│  │ 45m  │  │ 38m  │  │ 42m  │  │ 23m  │  │  --  │         │
│  │      │  │      │  │      │  │[Pause]│  │      │         │
│  │      │  │      │  │      │  │[Done] │  │      │         │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘         │
│                                                              │
│  ← Scroll left/right to see all 12 stages →                │
└─────────────────────────────────────────────────────────────┘
```

### Mobile - Full Screen
```
┌─────────────────────────────────────────────────────────────┐
│  ← JOB-001 (2 of 8)                                    →  × │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Box Printing - Order #123                                  │
│  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  4/12 stages (33%)                                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  CURRENT: Printing - Black                         │    │
│  │  ⚡ 23:45 active                                   │    │
│  │  Ali • HB2                                         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │               PAUSE                                 │    │ ← 60px
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │              COMPLETE                               │    │ ← 60px
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  [View All Stages ▼]                                        │
│                                                              │
│  Swipe left/right to navigate • Pull down to refresh        │
└─────────────────────────────────────────────────────────────┘
```

## Stage Status Colors

```
┌─────────────┬──────────┬────────────┬─────────────────────┐
│   Status    │   Icon   │   Color    │   Meaning           │
├─────────────┼──────────┼────────────┼─────────────────────┤
│  pending    │    ·     │   Gray     │  Not started yet    │
│  in_progress│    ⚡    │   Green    │  Currently working  │
│  paused     │    ⏸     │   Orange   │  Temporarily paused │
│  completed  │    ✓     │   Blue     │  Finished           │
└─────────────┴──────────┴────────────┴─────────────────────┘
```

## Action Flow Diagram

### Start Stage
```
User clicks "Start" button
         │
         ▼
WorkflowStageActions.handleStart()
         │
         ├─── Check: operatorId exists?
         ├─── Check: machine exists?
         │
         ▼
workflowService.startStage(jobId, stageId, { operator_id, machine })
         │
         ▼
POST /api/production/workflow/:jobId/stages/:stageId/start
         │
         ▼
productionService.startWorkflowStage()
         │
         ├─── Validate: previous stage complete?
         ├─── Update: stage.status = 'in_progress'
         ├─── Update: stage.started_at = now
         ├─── Update: job.inline_status
         │
         ▼
Database updated
         │
         ▼
Response sent to frontend
         │
         ▼
onSuccess() callback
         │
         ├─── Show toast: "Stage started"
         ├─── Invalidate React Query cache
         └─── Refetch workflow data
         │
         ▼
UI updates with new status
```

### Complete Stage (with form)
```
User clicks "Complete" button
         │
         ▼
showCompleteForm = true
         │
         ▼
User enters waste quantity & notes
         │
         ▼
User clicks "Complete" (confirm)
         │
         ▼
WorkflowStageActions.handleComplete()
         │
         ▼
workflowService.completeStage(jobId, stageId, { waste_quantity, notes })
         │
         ▼
POST /api/production/workflow/:jobId/stages/:stageId/complete
         │
         ▼
productionService.completeWorkflowStage()
         │
         ├─── Update: stage.status = 'completed'
         ├─── Update: stage.completed_at = now
         ├─── Update: stage.total_duration_minutes
         ├─── Update: stage.waste_quantity
         ├─── Update: stage.notes
         ├─── Update: job.inline_status
         ├─── Enable: next stage (can_start = true)
         │
         ▼
Database updated
         │
         ▼
Response sent to frontend
         │
         ▼
onSuccess() callback
         │
         ├─── Show toast: "Stage completed"
         ├─── Hide complete form
         ├─── Clear form inputs
         ├─── Invalidate React Query cache
         └─── Refetch workflow data
         │
         ▼
UI updates - next stage becomes available
```

## Performance Optimization Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                     Initial Page Load                        │
│                                                              │
│  1. Fetch jobs list (without workflows)                     │
│     GET /api/production/jobs                                │
│     Response: 20 jobs × ~1KB = ~20KB                        │
│                                                              │
│  2. Render table with MiniTimeline placeholders             │
│     "Click to view" text shown                              │
│                                                              │
│  Total: ~20KB, < 1 second                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     User Expands Job                         │
│                                                              │
│  1. Fetch workflow for single job (lazy)                    │
│     GET /api/production/workflow/:jobId                     │
│     Response: 12 stages × ~500B = ~6KB                      │
│                                                              │
│  2. Cache in React Query (30s stale, 5min cache)            │
│                                                              │
│  3. Start auto-refresh (5s interval)                        │
│                                                              │
│  Total: ~6KB, < 500ms                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Future: Batch Fetch                      │
│                                                              │
│  1. User expands multiple jobs                              │
│                                                              │
│  2. Batch request for visible jobs                          │
│     GET /api/production/workflow/batch?jobIds=1,2,3         │
│     Response: 3 jobs × 12 stages × ~500B = ~18KB            │
│                                                              │
│  3. Single API call instead of 3                            │
│                                                              │
│  Savings: 2 fewer HTTP requests, ~1 second faster           │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Optimistic Update                        │
│                                                              │
│  User clicks action button                                  │
│         │                                                    │
│         ▼                                                    │
│  UI updates immediately (optimistic)                        │
│  - Button shows "Starting..." / "Pausing..." etc.           │
│  - Button disabled                                          │
│         │                                                    │
│         ▼                                                    │
│  API request sent                                           │
│         │                                                    │
│         ├─── Success ✓                                      │
│         │    │                                              │
│         │    ▼                                              │
│         │    - Show success toast                           │
│         │    - Invalidate cache                             │
│         │    - Refetch data                                 │
│         │    - UI confirms update                           │
│         │                                                    │
│         └─── Error ✗                                        │
│              │                                              │
│              ▼                                              │
│              - Show error toast                             │
│              - Rollback UI (revert optimistic update)       │
│              - Re-enable button                             │
│              - User can retry                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## File Size Breakdown

```
Component Sizes (estimated):
┌────────────────────────────────┬──────────┐
│ Component                      │   Size   │
├────────────────────────────────┼──────────┤
│ useMediaQuery.tsx              │   1 KB   │
│ useSwipeGesture.tsx            │   2 KB   │
│ StageStatusBadge.tsx           │   2 KB   │
│ DurationDisplay.tsx            │   1 KB   │
│ WorkflowStageActions.tsx       │   6 KB   │
│ MiniTimeline.tsx               │   4 KB   │
│ TimelineDetail.tsx             │   8 KB   │
│ ExpandableJobRow.tsx           │   4 KB   │
│ MobileWorkflowModal.tsx        │   9 KB   │
├────────────────────────────────┼──────────┤
│ Total New Code                 │  37 KB   │
└────────────────────────────────┴──────────┘

Bundle Impact:
- Before: ~543 KB (minified)
- After:  ~580 KB (minified)
- Increase: +37 KB (+6.8%)
- Gzipped: +5 KB (+3.6%)
```

---

*Architecture designed for scalability, performance, and maintainability*
