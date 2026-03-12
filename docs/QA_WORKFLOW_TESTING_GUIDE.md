# QA Manager Workflow - Testing Guide

## Overview
This guide walks through testing the QA Manager approval workflow that was just integrated into the production workflow system.

## Prerequisites
- Backend running with production workflow endpoints
- Frontend running with new QA components
- Test users with different roles:
  - QA Manager (qa_manager role)
  - Operator (operator role)
  - Planner (planner role)

## Test Scenarios

### Scenario 1: QA Manager Approves a Stage

**Steps:**
1. Navigate to Production → Workflow view
2. Select a production job to view workflow
3. Look for a stage with purple "QA Pending" badge
4. Click on the pending QA stage card
5. QAApprovalModal should open showing:
   - Stage name and order
   - Status: "Pending"
   - Approve and Reject buttons (only visible to QA Manager)
6. Click "Approve" button
7. Optional: Add approval notes
8. Click "Confirm Approve"

**Expected Results:**
- Toast notification: "Stage approved by QA"
- Modal closes
- Stage card badge changes to green "QA OK"
- Operator receives notification
- Activity logged in system

---

### Scenario 2: QA Manager Rejects a Stage

**Steps:**
1. Navigate to Production → Workflow view
2. Select a production job
3. Click on a stage with purple "QA Pending" badge
4. QAApprovalModal opens
5. Click "Reject" button
6. Rejection form appears with:
   - Required: Rejection reason field
   - Optional: Additional notes field
7. Enter rejection reason (e.g., "Quality concerns with specifications")
8. Optionally add notes
9. Click "Confirm Reject"

**Expected Results:**
- Toast notification: "Stage rejected by QA"
- Modal closes
- Stage card badge changes to red "QA Rejected"
- Rejection reason displayed below stage card
- Operator receives notification with reason
- Activity logged with rejection details

---

### Scenario 3: Operator Cannot Start Stage Without QA Approval

**Steps:**
1. Login as Operator
2. Navigate to Production → Workflow view
3. Select a production job
4. Click on a stage with purple "QA Pending" badge
5. StageActionMenu opens (not approval modal)
6. Try to click "Start Stage" button

**Expected Results:**
- Start button is disabled (grayed out)
- Info box shows: "Awaiting QA Approval"
- Message: "QA Manager must approve this stage before production can start"
- Toast error: "Waiting for QA Manager approval"

---

### Scenario 4: Operator Cannot Start Rejected Stage

**Steps:**
1. Login as Operator
2. Navigate to Production → Workflow view
3. Select a production job
4. Click on a stage with red "QA Rejected" badge
5. StageActionMenu opens
6. Try to click "Start Stage" button

**Expected Results:**
- Start button is disabled
- Info box shows: "QA Rejected"
- Rejection reason displayed
- Toast error: "Stage rejected by QA: [reason]"

---

### Scenario 5: Operator Can Start Stage After QA Approval

**Steps:**
1. Have QA Manager approve a stage (Scenario 1)
2. Login as Operator
3. Navigate to Production → Workflow view
4. Select the same production job
5. Click on the stage with green "QA OK" badge
6. StageActionMenu opens
7. Click "Start Stage" button

**Expected Results:**
- Start button is enabled (green)
- Stage starts successfully
- Toast notification: "Stage started"
- Stage card updates to show "In Progress" status
- Badge changes to green "In Progress" indicator

---

### Scenario 6: Real-time Approval Updates

**Steps:**
1. Open workflow in two browser windows/tabs
2. In Tab 1 (QA Manager): See pending QA stage
3. In Tab 2 (Operator): See same pending QA stage
4. In Tab 1: Approve the stage
5. Wait up to 5 seconds
6. Check Tab 2

**Expected Results:**
- Tab 2 automatically updates
- Badge changes from purple "QA Pending" to green "QA OK"
- No page refresh needed
- Real-time sync working

---

### Scenario 7: QA Approval History

**Steps:**
1. Navigate to Approvals page (if available)
2. View approval history
3. Filter by status (Pending, Approved, Rejected)
4. Search by job ID or stage name

**Expected Results:**
- All approvals displayed with:
  - Stage name
  - Job ID
  - Status
  - QA Manager name
  - Approval/Rejection date
  - Reason (if rejected)
  - Notes (if any)

---

## Visual Indicators to Verify

### Stage Card Badges
- ✅ Purple "QA Pending" badge appears on pending stages
- ✅ Green "QA OK" badge appears on approved stages
- ✅ Red "QA Rejected" badge appears on rejected stages
- ✅ Badges are clickable and open appropriate modals

### Stage Card Styling
- ✅ Purple ring highlight when QA pending
- ✅ Green ring highlight when in progress
- ✅ Orange ring highlight when paused
- ✅ Rejection reason shown in italic text below stage

### Modal Appearance
- ✅ QAApprovalModal has color-coded header:
  - Blue for pending
  - Green for approved
  - Red for rejected
- ✅ Approve/Reject buttons only visible to QA Manager
- ✅ Status info displayed clearly
- ✅ Timestamps shown for approved/rejected stages

### Action Menu
- ✅ Info box shows QA approval status
- ✅ Start button disabled if QA not approved
- ✅ Rejection reason displayed if rejected
- ✅ Clear error messages on toast notifications

---

## API Endpoints Being Used

### Workflow Endpoints
```
GET /production/workflow/:jobId
POST /production/workflow/:jobId/stages/:stageId/start
POST /production/workflow/:jobId/stages/:stageId/pause
POST /production/workflow/:jobId/stages/:stageId/resume
POST /production/workflow/:jobId/stages/:stageId/complete
```

### Approval Endpoints
```
GET /approvals/job/:jobId
GET /approvals/stage/:stageId
POST /approvals/:id/approve
POST /approvals/:id/reject
```

---

## Troubleshooting

### Issue: QA Pending badge not showing
- **Check:** Stage has `qa_approval_required: true`
- **Check:** Stage has `qa_approval_status: 'pending'`
- **Check:** Approvals fetched successfully (check network tab)
- **Fix:** Refresh page to reload approvals

### Issue: Approval modal not opening
- **Check:** User role is QA Manager
- **Check:** Stage is in pending status
- **Check:** Click on stage card (not elsewhere)
- **Fix:** Check browser console for errors

### Issue: Start button still enabled for pending QA
- **Check:** Stage `qa_approval_status` is 'pending'
- **Check:** Stage `qa_approval_required` is true
- **Fix:** Refresh page to reload stage data

### Issue: Approvals not updating in real-time
- **Check:** Workflow refresh interval is running (5s)
- **Check:** Network requests are succeeding
- **Check:** Browser console for errors
- **Fix:** Manually refresh page

---

## Success Criteria

✅ All scenarios pass without errors
✅ Visual indicators display correctly
✅ QA Manager can approve/reject stages
✅ Operators cannot start without approval
✅ Real-time updates working
✅ Notifications sent appropriately
✅ Activity logged for all actions
✅ No console errors
✅ Build passes without warnings

---

## Notes

- QA approval is required by default for all stages
- Can be disabled per-stage if needed (qa_approval_required: false)
- Approval status persists across page refreshes
- Notifications sent via backend notification system
- Activity logged for audit trail
- All timestamps in UTC

---

## Contact

For issues or questions about the QA workflow integration, refer to:
- Backend: `backend/src/production/workflow-approval.service.ts`
- Frontend: `frontend/src/components/workflow/QAApprovalModal.tsx`
- Service: `frontend/src/services/workflow.service.ts`
