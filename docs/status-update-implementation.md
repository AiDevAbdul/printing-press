# Status Update Implementation

## Overview
Implemented missing status update functionality across Orders, Planning, and Production modules to enable proper workflow management.

## Changes Made

### 1. Orders Page - Status Update Actions
**File**: `frontend/src/pages/orders/Orders.tsx`

**Added Features**:
- Status update mutation using `PATCH /api/orders/:id/status` endpoint
- Action buttons for each order based on current status:
  - **Pending orders**: "Approve" and "Cancel" buttons
  - **Approved orders**: "Cancel" button
  - **Completed/Delivered/Cancelled orders**: No actions (read-only)
- Toast notifications for success/error feedback
- Confirmation dialog before status changes

**Status Flow**:
- `pending` → `approved` (Approve button)
- `pending` → `cancelled` (Cancel button)
- `approved` → `cancelled` (Cancel button)

### 2. Planning Module - New Page
**File**: `frontend/src/pages/planning/Planning.tsx`

**Features**:
- Displays only approved orders (status = 'approved')
- Filters: Priority, Search
- "Create Job" button for each approved order
- Modal form to create production jobs with:
  - Scheduled start/end dates
  - Assigned machine
  - Assigned operator
  - Estimated hours
  - Notes
- Uses `POST /api/production/jobs` endpoint
- Automatically invalidates both orders and production queries after job creation

**Workflow**:
1. Sales approves orders in Orders page
2. Planner views approved orders in Planning page
3. Planner creates production jobs with machine/operator assignments
4. Production jobs appear in Production page

### 3. Production Page - Status Update Actions
**File**: `frontend/src/pages/production/Production.tsx`

**Added Features**:
- Multiple status update mutations:
  - `startJobMutation`: `POST /api/production/jobs/:id/start`
  - `completeJobMutation`: `POST /api/production/jobs/:id/complete`
  - `updateStatusMutation`: `PATCH /api/production/jobs/:id/status`
- Action buttons based on job status:
  - **Queued**: "Start" button
  - **In Progress**: "Pause" and "Complete" buttons
  - **Paused**: "Resume" button
  - **Any active status**: "Cancel" button
  - **Completed/Cancelled**: No actions (read-only)
- Toast notifications for all actions

**Status Flow**:
- `queued` → `in_progress` (Start button)
- `in_progress` → `paused` (Pause button)
- `in_progress` → `completed` (Complete button)
- `paused` → `in_progress` (Resume button)
- Any active status → `cancelled` (Cancel button)

### 4. Routing Updates
**File**: `frontend/src/App.tsx`

**Changes**:
- Added Planning page import
- Added `/planning` route with PrivateRoute wrapper

**File**: `frontend/src/pages/dashboard/Dashboard.tsx`

**Changes**:
- Added Planning card to "Production & Operations" menu group
- Icon: 📋
- Description: "Production planning and scheduling"
- Color: blue-500

## Complete Workflow

```
Orders (Sales) → Planning → Production → Shop Floor → Dispatch
     ↓              ↓            ↓            ↓            ↓
  pending      approved     queued     in_progress   dispatched
     ↓              ↓            ↓            ↓
  approved    create job   in_progress  completed
     ↓
 cancelled
```

## Backend Endpoints Used

### Orders
- `PATCH /api/orders/:id/status` - Update order status

### Production
- `POST /api/production/jobs` - Create production job
- `POST /api/production/jobs/:id/start` - Start job
- `POST /api/production/jobs/:id/complete` - Complete job
- `PATCH /api/production/jobs/:id/status` - Update job status

## User Roles & Permissions

### Sales (Orders Page)
- Create orders
- Approve pending orders
- Cancel orders

### Planner (Planning Page)
- View approved orders
- Create production jobs
- Assign machines and operators
- Set schedules

### Planner/Admin (Production Page)
- View all production jobs
- Start/pause/resume/complete jobs
- Cancel jobs

## Testing Checklist

- [x] Frontend builds without TypeScript errors
- [x] Backend builds without TypeScript errors
- [x] Orders page displays action buttons correctly
- [x] Planning page shows only approved orders
- [x] Production page shows status-specific actions
- [x] All routes are accessible from dashboard
- [ ] Test order status updates in running application
- [ ] Test production job creation from planning
- [ ] Test production job status updates
- [ ] Verify toast notifications appear correctly

## Notes

- All status updates include confirmation dialogs to prevent accidental changes
- Toast notifications use `react-hot-toast` (already configured in main.tsx)
- Status colors are consistent across all pages
- Action buttons are disabled during mutation to prevent double-clicks
- All mutations automatically invalidate relevant queries for real-time updates
