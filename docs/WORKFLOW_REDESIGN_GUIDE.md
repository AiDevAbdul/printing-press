# Workflow Redesign - Quick Reference Guide

## For Developers

### Component Usage

#### Desktop Timeline
```tsx
import { ExpandableJobRow } from '../../components/workflow/ExpandableJobRow';

<ExpandableJobRow
  job={job}
  isExpanded={expandedJobId === job.id}
  onToggle={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
/>
```

#### Mobile Modal
```tsx
import { MobileWorkflowModal } from '../../components/workflow/MobileWorkflowModal';

<MobileWorkflowModal
  jobId={selectedJobId}
  operatorId={job.operator_id}
  operatorName={job.operator_name}
  machine={job.machine}
  onClose={() => setShowWorkflowModal(false)}
  allJobIds={allJobIds}
  currentIndex={currentIndex}
  onNavigate={(index) => setSelectedJobId(allJobIds[index])}
/>
```

#### Mini Timeline (Standalone)
```tsx
import { MiniTimeline } from '../../components/workflow/MiniTimeline';

<MiniTimeline
  stages={workflow.stages}
  compact={true}
  showLabels={false}
  onClick={() => handleExpand()}
/>
```

#### Stage Actions (Standalone)
```tsx
import { WorkflowStageActions } from '../../components/workflow/WorkflowStageActions';

<WorkflowStageActions
  stage={currentStage}
  jobId={jobId}
  operatorId={operatorId}
  machine={machine}
  onSuccess={() => refetchWorkflow()}
  touchOptimized={isMobile}
/>
```

### API Usage

#### Fetch Single Workflow
```typescript
import workflowService from '../../services/workflow.service';

const workflow = await workflowService.getWorkflowStages(jobId);
```

#### Fetch Multiple Workflows (Batch)
```typescript
const workflows = await workflowService.getWorkflowBatch(['job-id-1', 'job-id-2', 'job-id-3']);
// Returns: { 'job-id-1': WorkflowResponse, 'job-id-2': WorkflowResponse, ... }
```

#### Stage Actions
```typescript
// Start stage
await workflowService.startStage(jobId, stageId, {
  operator_id: 'uuid-string',
  machine: 'HB2',
});

// Pause stage
await workflowService.pauseStage(jobId, stageId, {
  reason: 'Machine maintenance',
});

// Resume stage
await workflowService.resumeStage(jobId, stageId);

// Complete stage
await workflowService.completeStage(jobId, stageId, {
  waste_quantity: 5,
  notes: 'Standard run',
});
```

### Responsive Hooks

```typescript
import { useIsMobile, useIsTablet, useIsDesktop } from '../../hooks/useMediaQuery';

const isMobile = useIsMobile();    // < 768px
const isTablet = useIsTablet();    // 768-1023px
const isDesktop = useIsDesktop();  // > 1024px

// Conditional rendering
{isDesktop ? <TimelineView /> : <MobileView />}
```

### Keyboard Shortcuts (Desktop Only)

| Key | Action |
|-----|--------|
| `↓` | Navigate to next job |
| `↑` | Navigate to previous job |
| `Enter` | Expand/collapse selected job |
| `Escape` | Collapse expanded job |

**Note:** Shortcuts only work when not typing in input fields.

### Touch Gestures (Mobile Only)

| Gesture | Action |
|---------|--------|
| Swipe Left | Next job |
| Swipe Right | Previous job |
| Pull Down | Refresh workflow |
| Tap | Standard interactions |

**Note:** Haptic feedback (vibration) triggers on successful gestures.

---

## For Testers

### Desktop Testing Checklist

#### Basic Functionality
- [ ] Click job row to expand timeline
- [ ] Click again to collapse
- [ ] Only one job expanded at a time
- [ ] Timeline shows 12 stages horizontally
- [ ] Progress bar shows completion percentage
- [ ] Hover over stage shows tooltip

#### Stage Actions
- [ ] Start pending stage (green button)
- [ ] Pause in-progress stage (orange button, shows reason input)
- [ ] Resume paused stage (green button)
- [ ] Complete in-progress stage (blue button, shows waste/notes form)
- [ ] Actions disabled when not allowed (previous stage incomplete)

#### Keyboard Navigation
- [ ] Press ↓ to expand next job
- [ ] Press ↑ to expand previous job
- [ ] Press Enter to toggle expansion
- [ ] Press Escape to collapse
- [ ] Shortcuts don't trigger when typing in forms

#### Performance
- [ ] Expand/collapse is smooth (300ms animation)
- [ ] Auto-refresh every 5 seconds when expanded
- [ ] No refresh when collapsed
- [ ] Timeline auto-scrolls to current stage
- [ ] Test with 20+ jobs in table

### Mobile Testing Checklist

#### Basic Functionality
- [ ] Tap "Workflow" button opens full-screen modal
- [ ] Current stage displayed prominently
- [ ] Progress bar shows completion
- [ ] Large touch buttons (60px height)
- [ ] "All Stages" accordion expands/collapses

#### Touch Gestures
- [ ] Swipe left navigates to next job
- [ ] Swipe right navigates to previous job
- [ ] Pull down refreshes workflow
- [ ] Haptic feedback on gestures (if supported)
- [ ] Swipe threshold prevents accidental triggers

#### Stage Actions
- [ ] Start button works (60px height)
- [ ] Pause shows inline reason input
- [ ] Complete shows inline waste/notes form
- [ ] Cancel buttons work
- [ ] Touch targets are large enough (no mis-taps)

#### Responsive
- [ ] Works in portrait mode
- [ ] Works in landscape mode
- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Test on iPad
- [ ] Test on Android tablet

### Error Scenarios

#### Network Errors
- [ ] API failure shows error toast
- [ ] Retry after network restored
- [ ] Optimistic update rolls back on error
- [ ] Loading states display correctly

#### Edge Cases
- [ ] Job with no workflow (shows "Not started")
- [ ] Job with all stages completed (100% progress)
- [ ] Job with paused stage (shows pause indicator)
- [ ] Job without operator/machine (actions disabled)
- [ ] Empty production table (shows "No jobs found")

### Browser Compatibility

#### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (latest)

#### Mobile Browsers
- [ ] iOS Safari (latest)
- [ ] Android Chrome (latest)
- [ ] Samsung Internet (if available)

---

## For Operators (End Users)

### Desktop Quick Start

1. **View Workflow Progress**
   - Look at the colored dots in the "Workflow" column
   - Green dot with ⚡ = currently working
   - Blue dot with ✓ = completed
   - Gray dot with · = not started yet

2. **Expand Workflow Details**
   - Click anywhere on the job row
   - See all 12 stages horizontally
   - Current stage is highlighted

3. **Start a Stage**
   - Click the green "▶ Start Stage" button
   - Stage begins immediately (no confirmation needed)

4. **Pause a Stage**
   - Click the orange "⏸ Pause" button
   - Type reason (optional)
   - Click "Confirm Pause"

5. **Complete a Stage**
   - Click the blue "✓ Complete" button
   - Enter waste quantity (optional)
   - Add notes (optional)
   - Click "Complete"

6. **Keyboard Shortcuts** (Power Users)
   - Press ↓ to go to next job
   - Press ↑ to go to previous job
   - Press Enter to open/close details
   - Press Escape to close details

### Mobile Quick Start

1. **Open Workflow**
   - Tap the purple "Workflow" button
   - Full-screen view opens

2. **Navigate Between Jobs**
   - Swipe left for next job
   - Swipe right for previous job
   - Or use ← → arrows at top

3. **View Current Stage**
   - Large card shows current stage
   - Duration updates in real-time

4. **Stage Actions**
   - Tap large green button to Start
   - Tap large orange button to Pause
   - Tap large blue button to Complete
   - Forms appear inline (no popups)

5. **View All Stages**
   - Tap "All Stages (12) ▼" to expand
   - See all stages in list
   - Tap again to collapse

6. **Refresh**
   - Pull down from top to refresh
   - Auto-refreshes every 5 seconds

### Tips & Tricks

- **Desktop:** Hover over stage dots to see stage name and duration
- **Mobile:** Pull down to refresh if data seems stale
- **Both:** Green = active, Blue = done, Orange = paused, Gray = waiting
- **Both:** You can't start a stage until the previous one is complete
- **Both:** Waste quantity and notes are optional when completing

---

## Troubleshooting

### Desktop Issues

**Timeline not showing?**
- Check screen width (must be > 1024px)
- Try refreshing the page
- Check browser console for errors

**Keyboard shortcuts not working?**
- Make sure you're not typing in an input field
- Try clicking outside any form first
- Check if another extension is capturing keys

**Expand/collapse not smooth?**
- Check browser performance
- Close other tabs to free memory
- Try disabling browser extensions

### Mobile Issues

**Swipe gestures not working?**
- Make sure you're swiping at least 50px
- Swipe faster (velocity matters)
- Try swiping in the middle of the screen

**Buttons too small?**
- Report to admin (should be 60px height)
- Try landscape mode for more space
- Use stylus if available

**Modal not full-screen?**
- Check screen size (must be < 768px)
- Try rotating device
- Refresh the page

### General Issues

**Workflow not updating?**
- Wait 5 seconds for auto-refresh
- Pull down to refresh (mobile)
- Click collapse/expand again (desktop)

**Actions not working?**
- Check if operator and machine are assigned
- Check if previous stage is complete
- Check network connection

**Performance slow?**
- Too many jobs in table (ask admin to add pagination)
- Close other browser tabs
- Clear browser cache

---

## API Endpoints Reference

### Workflow Endpoints

```
GET  /api/production/workflow/:jobId
     Get workflow stages for a single job

GET  /api/production/workflow/batch?jobIds=id1,id2,id3
     Get workflows for multiple jobs (batch)

POST /api/production/workflow/:jobId/initialize
     Initialize workflow for a job

POST /api/production/workflow/:jobId/stages/:stageId/start
     Start a workflow stage

POST /api/production/workflow/:jobId/stages/:stageId/pause
     Pause a workflow stage

POST /api/production/workflow/:jobId/stages/:stageId/resume
     Resume a paused stage

POST /api/production/workflow/:jobId/stages/:stageId/complete
     Complete a workflow stage
```

### Response Formats

**Single Workflow Response:**
```json
{
  "job_id": "uuid",
  "current_stage": "Printing - Cyan",
  "stages": [
    {
      "id": 1,
      "stage_name": "Printing - Cyan",
      "stage_order": 1,
      "status": "completed",
      "started_at": "2026-03-09T10:00:00Z",
      "completed_at": "2026-03-09T10:45:00Z",
      "active_duration_minutes": 45,
      "total_duration_minutes": 45,
      "operator_name": "Ali",
      "machine": "HB2",
      "waste_quantity": 5,
      "notes": "Standard run",
      "can_start": false,
      "can_pause": false,
      "can_complete": false
    }
  ]
}
```

**Batch Workflow Response:**
```json
{
  "job-id-1": { "job_id": "...", "stages": [...] },
  "job-id-2": { "job_id": "...", "stages": [...] },
  "job-id-3": null
}
```

---

## Performance Tips

### For Developers

1. **Use React Query caching:**
   ```typescript
   queryKey: ['workflow', jobId]
   staleTime: 30000  // 30 seconds
   cacheTime: 300000 // 5 minutes
   ```

2. **Lazy load workflows:**
   - Only fetch when job is expanded
   - Don't prefetch all workflows on page load

3. **Batch requests when possible:**
   - Use `getWorkflowBatch()` for multiple jobs
   - Reduces API calls from N to 1

4. **Optimize re-renders:**
   - Use `React.memo` on MiniTimeline
   - Memoize stage cards in TimelineDetail

5. **Debounce expand/collapse:**
   - Prevent rapid clicking
   - 300ms debounce recommended

### For System Admins

1. **Add database indexes:**
   ```sql
   CREATE INDEX idx_workflow_job_id ON production_workflow_stages(job_id);
   CREATE INDEX idx_workflow_status ON production_workflow_stages(status);
   ```

2. **Enable response caching:**
   - Cache workflow responses for 30 seconds
   - Use Redis for distributed caching

3. **Monitor performance:**
   - Track API response times
   - Alert if > 1 second
   - Optimize slow queries

4. **Consider pagination:**
   - Limit jobs per page to 50
   - Add "Load More" button
   - Or implement virtual scrolling

---

## Support

For issues or questions:
1. Check this guide first
2. Check browser console for errors
3. Try refreshing the page
4. Contact system administrator
5. Report bugs at: https://github.com/anthropics/claude-code/issues
