# User Management & QA Approval System - Implementation Plan

**Project:** Printing Press Management System
**Feature:** Comprehensive User Management with QA Approval Workflow
**Date:** 2026-03-10
**Status:** Planning Phase

---

## Overview

Implement a comprehensive user management system with role-based access control, QA approval workflow for all production stages, user profiles, and substitute user functionality.

---

## Requirements Summary

### New Roles
- **QA Manager** - Approves all stages before execution
- **Operator** - Executes assigned production stages
- **Analyst** - Read-only access to all data including financial

### Key Features
- ✅ All stages require QA approval before starting
- ✅ Operators cannot request re-approval (QA decision is final)
- ✅ Single QA manager initially, scalable to multiple QA managers
- ✅ Email + in-app notifications for approvals
- ✅ Analysts have full read access including financial data
- ✅ Substitute user feature (delegation when on leave)
- ✅ User profile pages with role-specific views
- ✅ Granular permission system (System Access + Partial Access)

---

## Implementation Phases

### **Phase 1: Database Schema & Backend Foundation** 🔵

**Goal:** Set up database structure, entities, and basic CRUD operations

#### 1.1 Database Migrations
- [ ] Add new roles to User entity (qa_manager, operator, analyst)
- [ ] Add user profile fields (avatar_url, phone, department, bio)
- [ ] Add permission fields (system_access JSON, partial_access JSON)
- [ ] Add substitute user fields (substitute_user_id, substitute_start_date, substitute_end_date)
- [ ] Create `stage_approvals` table
  - id, stage_id, inline_item_id, job_id, approved_by, status, reason, created_at, updated_at
- [ ] Create `user_permissions` table
  - id, user_id, module, action, allowed
- [ ] Create `user_activity_log` table
  - id, user_id, action, entity_type, entity_id, details, timestamp
- [ ] Create `notifications` table
  - id, user_id, type, title, message, link, read, created_at
- [ ] Add QA approval fields to inline_items
  - qa_approval_required (boolean, default true)
  - qa_approval_status (enum: pending, approved, rejected)
  - qa_approved_by (UUID)
  - qa_approved_at (timestamp)
  - qa_rejection_reason (text)

#### 1.2 Backend Entities & DTOs
- [ ] Update User entity with new fields
- [ ] Create StageApproval entity
- [ ] Create UserPermission entity
- [ ] Create UserActivityLog entity
- [ ] Create Notification entity
- [ ] Create DTOs for all new entities
- [ ] Create UpdateUserPermissionsDto
- [ ] Create ApproveStageDto / RejectStageDto
- [ ] Create SubstituteUserDto

#### 1.3 Backend Services
- [ ] Update UsersService with profile methods
- [ ] Create PermissionsService (check user permissions)
- [ ] Create StageApprovalsService (approve/reject stages)
- [ ] Create NotificationsService (create, send, mark as read)
- [ ] Create ActivityLogService (log user actions)
- [ ] Create SubstituteService (manage substitutions)
- [ ] Update WorkflowService to check QA approval before stage start

#### 1.4 Backend Controllers & Routes
- [ ] Update UsersController with profile endpoints
  - GET /api/users/profile (get own profile)
  - PUT /api/users/profile (update own profile)
  - GET /api/users/:id/profile (get user profile - admin only)
  - PUT /api/users/:id/permissions (update permissions - admin only)
  - POST /api/users/:id/substitute (set substitute user)
- [ ] Create ApprovalsController
  - GET /api/approvals/pending (get pending approvals for QA)
  - GET /api/approvals/history (get approval history)
  - POST /api/approvals/:id/approve (approve stage)
  - POST /api/approvals/:id/reject (reject stage)
- [ ] Create NotificationsController
  - GET /api/notifications (get user notifications)
  - PUT /api/notifications/:id/read (mark as read)
  - PUT /api/notifications/read-all (mark all as read)
- [ ] Update WorkflowController
  - Add QA approval check in start-stage endpoint

#### 1.5 Guards & Middleware
- [ ] Create PermissionsGuard (check granular permissions)
- [ ] Create RolesGuard enhancement (support new roles)
- [ ] Create ActivityLogInterceptor (auto-log actions)
- [ ] Update existing guards to support substitute users

#### 1.6 Email Service
- [ ] Create email templates for QA approval requests
- [ ] Create email templates for approval/rejection notifications
- [ ] Integrate with existing email service
- [ ] Add email queue for async sending

**Deliverables:**
- Database migrations executed
- All entities, DTOs, services created
- API endpoints functional and tested
- Postman/API tests passing

**Estimated Time:** 2-3 days

---

### **Phase 2: QA Approval Workflow Integration** 🟢

**Goal:** Integrate QA approval into production workflow

#### 2.1 Workflow Logic Updates
- [ ] Update stage start logic to check QA approval status
- [ ] Block stage start if approval pending/rejected
- [ ] Auto-create approval request when stage becomes ready
- [ ] Send notification to QA manager when approval needed
- [ ] Send notification to operator when stage approved/rejected
- [ ] Update stage status to show "Pending QA Approval"

#### 2.2 Approval Business Logic
- [ ] QA can only approve stages that are ready (previous stage completed)
- [ ] Approval creates activity log entry
- [ ] Rejection blocks stage and notifies order owner + operator
- [ ] Approval history tracked per stage
- [ ] Support for approval notes/comments

#### 2.3 Notification System
- [ ] In-app notification creation on approval request
- [ ] In-app notification on approval/rejection
- [ ] Email notification on approval request (to QA)
- [ ] Email notification on approval (to operator)
- [ ] Email notification on rejection (to operator + order owner)
- [ ] Real-time notification updates (WebSocket or polling)

#### 2.4 Substitute User Logic
- [ ] Check if user has active substitute
- [ ] Route approvals to substitute if active
- [ ] Route notifications to substitute if active
- [ ] Show "Acting as [User]" indicator
- [ ] Auto-expire substitutions after end date

**Deliverables:**
- QA approval fully integrated into workflow
- Notifications working (in-app + email)
- Substitute user feature functional
- All edge cases handled

**Estimated Time:** 2-3 days

---

### **Phase 3: Frontend - User Profile Pages** 🟡

**Goal:** Create user profile pages with role-specific views

#### 3.1 Profile Components
- [ ] Create UserProfile.tsx page
  - Personal info section (avatar, name, email, phone, department)
  - Role badge with description
  - Assigned permissions display (visual list)
  - Activity log (recent 10 actions)
  - Edit profile button (own profile only)
- [ ] Create EditProfileModal.tsx
  - Update personal info
  - Upload avatar
  - Change password
- [ ] Create UserActivityLog.tsx component
  - Paginated activity list
  - Filter by action type
  - Date range filter

#### 3.2 Role-Specific Profile Sections
- [ ] **Operator Profile:**
  - Assigned stages list
  - Stages completed count
  - Average completion time
  - Current active stages
- [ ] **QA Manager Profile:**
  - Pending approvals count
  - Approvals given (total)
  - Rejection rate
  - Recent approval history
- [ ] **Analyst Profile:**
  - Reports accessed
  - Data exports count
  - Favorite dashboards

#### 3.3 Profile API Integration
- [ ] Fetch user profile data
- [ ] Update profile info
- [ ] Upload avatar (file upload)
- [ ] Fetch activity log with pagination

**Deliverables:**
- User profile page functional
- Edit profile working
- Role-specific sections displaying correctly
- Activity log showing recent actions

**Estimated Time:** 1-2 days

---

### **Phase 4: Frontend - User Management System** 🟣

**Goal:** Admin interface for managing users and permissions

#### 4.1 User Management Page
- [ ] Create UserManagement.tsx page (admin only)
  - User list table with search/filter
  - Role filter dropdown
  - Status filter (active/inactive)
  - Add user button
  - Edit user button (opens modal)
  - Delete user button (with confirmation)
- [ ] Create UserManagementTable.tsx component
  - Columns: Avatar, Name, Email, Role, Status, Actions
  - Sort by name, role, created date
  - Pagination

#### 4.2 User Form Components
- [ ] Create AddUserModal.tsx
  - Basic info (name, email, password, phone, department)
  - Role selection
  - System access checkboxes
  - Partial access matrix
- [ ] Create EditUserModal.tsx
  - Same as AddUserModal but pre-filled
  - Cannot change email
  - Optional password change
- [ ] Create PermissionMatrix.tsx component
  - Visual grid of modules × actions
  - Checkboxes for each permission
  - Role presets (quick assign common permissions)

#### 4.3 Substitute User Management
- [ ] Create SubstituteUserModal.tsx
  - Select substitute user dropdown
  - Start date picker
  - End date picker
  - Reason textarea
  - Active substitutions list
- [ ] Show substitute indicator in user list
- [ ] Show "Acting as [User]" badge in header when substituting

#### 4.4 User Management API Integration
- [ ] Fetch users list with filters
- [ ] Create new user
- [ ] Update user info
- [ ] Update user permissions
- [ ] Delete user (soft delete)
- [ ] Set substitute user
- [ ] Remove substitute user

**Deliverables:**
- User management page functional (admin only)
- Add/edit/delete users working
- Permission matrix working
- Substitute user feature working

**Estimated Time:** 2-3 days

---

### **Phase 5: Frontend - QA Approval Interface** 🔴

**Goal:** QA Manager interface for approving/rejecting stages

#### 5.1 QA Dashboard Components
- [ ] Create QADashboard.tsx page (QA manager only)
  - Pending approvals count card
  - Approvals today count card
  - Rejection rate card
  - Recent approvals list
- [ ] Create ApprovalQueue.tsx component
  - List of stages pending approval
  - Group by job/order
  - Show stage details (name, operator, machine)
  - Show previous stage results
  - Approve/Reject buttons
- [ ] Create ApprovalHistoryTable.tsx component
  - Past approvals with filters
  - Date range filter
  - Status filter (approved/rejected)
  - Search by job number

#### 5.2 Approval Action Components
- [ ] Create ApproveStageDialog.tsx
  - Stage details summary
  - Optional approval notes
  - Confirm button
- [ ] Create RejectStageDialog.tsx
  - Stage details summary
  - Required rejection reason
  - Confirm button
- [ ] Update ProductionWorkflowLevels.tsx
  - Show "Pending QA Approval" badge on stages
  - Show lock icon if approval pending
  - Show rejection reason if rejected
  - Disable start button if not approved

#### 5.3 Approval API Integration
- [ ] Fetch pending approvals
- [ ] Fetch approval history
- [ ] Approve stage
- [ ] Reject stage
- [ ] Real-time updates (poll every 10s or WebSocket)

#### 5.4 Operator View Updates
- [ ] Show approval status on stage cards
- [ ] Show "Waiting for QA approval" message
- [ ] Show rejection reason if rejected
- [ ] Disable start button if not approved
- [ ] Show approved by and timestamp

**Deliverables:**
- QA dashboard functional
- Approval queue working
- Approve/reject actions working
- Operator view updated with approval status

**Estimated Time:** 2-3 days

---

### **Phase 6: Frontend - Notifications System** 🟠

**Goal:** In-app notification system with real-time updates

#### 6.1 Notification Components
- [ ] Create NotificationBell.tsx (in Header)
  - Bell icon with unread count badge
  - Dropdown with recent notifications
  - Mark as read on click
  - "View all" link to notifications page
- [ ] Create NotificationsPage.tsx
  - All notifications list
  - Filter by type (approval, rejection, assignment, etc.)
  - Mark all as read button
  - Pagination
- [ ] Create NotificationItem.tsx component
  - Icon based on type
  - Title and message
  - Timestamp (relative time)
  - Link to related entity
  - Read/unread indicator

#### 6.2 Notification Types
- [ ] **QA Approval Request** (to QA manager)
  - "Stage [name] in Job [number] is ready for approval"
- [ ] **Stage Approved** (to operator)
  - "Stage [name] in Job [number] has been approved. You can start now."
- [ ] **Stage Rejected** (to operator + order owner)
  - "Stage [name] in Job [number] was rejected. Reason: [reason]"
- [ ] **Stage Assigned** (to operator)
  - "You have been assigned to Stage [name] in Job [number]"
- [ ] **Substitute Assigned** (to substitute user)
  - "You are now acting as [user] until [date]"

#### 6.3 Notification API Integration
- [ ] Fetch notifications with pagination
- [ ] Mark notification as read
- [ ] Mark all as read
- [ ] Real-time updates (poll every 30s or WebSocket)
- [ ] Unread count in header

#### 6.4 Email Notifications
- [ ] Email templates styled with company branding
- [ ] Email preferences (user can opt-out of certain types)
- [ ] Email digest option (daily summary instead of instant)

**Deliverables:**
- Notification bell in header working
- Notifications page functional
- Real-time notification updates
- Email notifications sending

**Estimated Time:** 2 days

---

### **Phase 7: Access Control & Route Guards** 🟤

**Goal:** Implement granular permission checks across the app

#### 7.1 Frontend Permission System
- [ ] Create usePermissions hook
  - Check if user has system access to module
  - Check if user has partial access to action
  - Return boolean for permission checks
- [ ] Create ProtectedRoute component
  - Wrap routes that require permissions
  - Redirect to 403 page if no access
- [ ] Create PermissionGate component
  - Conditionally render UI elements based on permissions
  - Example: `<PermissionGate module="orders" action="create">...</PermissionGate>`

#### 7.2 Route Protection
- [ ] Protect all routes with role/permission checks
- [ ] QA Dashboard only for qa_manager role
- [ ] User Management only for admin role
- [ ] Production stages only for operators with access
- [ ] Financial data only for roles with access (admin, accounts, analyst)

#### 7.3 UI Element Visibility
- [ ] Hide create/edit/delete buttons if no permission
- [ ] Hide menu items if no system access
- [ ] Show read-only views for view-only permissions
- [ ] Disable form fields if no edit permission

#### 7.4 Backend Permission Enforcement
- [ ] Add PermissionsGuard to all protected endpoints
- [ ] Check permissions before allowing actions
- [ ] Return 403 Forbidden if no permission
- [ ] Log permission denials in activity log

**Deliverables:**
- All routes protected with permission checks
- UI elements hidden/disabled based on permissions
- Backend enforcing permissions on all endpoints
- 403 error page for unauthorized access

**Estimated Time:** 2 days

---

### **Phase 8: Testing & Polish** ⚪

**Goal:** Test all features, fix bugs, polish UI/UX

#### 8.1 Backend Testing
- [ ] Unit tests for all new services
- [ ] Integration tests for approval workflow
- [ ] Test substitute user logic
- [ ] Test permission checks
- [ ] Test email notifications
- [ ] Test edge cases (concurrent approvals, expired substitutions, etc.)

#### 8.2 Frontend Testing
- [ ] Test all user roles (admin, qa_manager, operator, analyst)
- [ ] Test approval workflow end-to-end
- [ ] Test substitute user feature
- [ ] Test notifications (in-app + email)
- [ ] Test permission gates
- [ ] Test responsive design (mobile, tablet, desktop)

#### 8.3 UI/UX Polish
- [ ] Add loading states to all async actions
- [ ] Add success/error toast notifications
- [ ] Add confirmation dialogs for destructive actions
- [ ] Improve error messages
- [ ] Add empty states for lists
- [ ] Add skeleton loaders
- [ ] Optimize performance (lazy loading, memoization)

#### 8.4 Documentation
- [ ] Update API documentation with new endpoints
- [ ] Create user guide for QA approval workflow
- [ ] Create admin guide for user management
- [ ] Update CLAUDE.md with new patterns
- [ ] Add inline code comments

#### 8.5 Bug Fixes
- [ ] Fix any bugs found during testing
- [ ] Handle edge cases
- [ ] Improve error handling
- [ ] Fix TypeScript errors
- [ ] Fix accessibility issues

**Deliverables:**
- All features tested and working
- Bugs fixed
- UI polished
- Documentation updated

**Estimated Time:** 2-3 days

---

## Database Schema Changes Summary

### Users Table (Updated)
```typescript
{
  id: UUID (PK)
  email: string (unique)
  password: string (hashed)
  name: string
  role: enum (admin, sales, planner, accounts, inventory, qa_manager, operator, analyst)
  phone: string (nullable)
  department: string (nullable)
  bio: text (nullable)
  avatar_url: string (nullable)
  system_access: JSON (array of modules)
  partial_access: JSON (object with permissions)
  substitute_user_id: UUID (FK to users, nullable)
  substitute_start_date: date (nullable)
  substitute_end_date: date (nullable)
  substitute_reason: text (nullable)
  is_active: boolean (default true)
  created_at: timestamp
  updated_at: timestamp
}
```

### Stage Approvals Table (New)
```typescript
{
  id: UUID (PK)
  inline_item_id: UUID (FK to inline_items)
  job_id: UUID (FK to jobs)
  stage_name: string
  status: enum (pending, approved, rejected)
  approved_by: UUID (FK to users, nullable)
  approved_at: timestamp (nullable)
  rejection_reason: text (nullable)
  notes: text (nullable)
  created_at: timestamp
  updated_at: timestamp
}
```

### Notifications Table (New)
```typescript
{
  id: UUID (PK)
  user_id: UUID (FK to users)
  type: enum (approval_request, stage_approved, stage_rejected, stage_assigned, substitute_assigned)
  title: string
  message: text
  link: string (nullable)
  read: boolean (default false)
  created_at: timestamp
}
```

### User Activity Log Table (New)
```typescript
{
  id: UUID (PK)
  user_id: UUID (FK to users)
  action: string (e.g., "approved_stage", "created_order", "updated_user")
  entity_type: string (e.g., "stage", "order", "user")
  entity_id: UUID (nullable)
  details: JSON (nullable)
  ip_address: string (nullable)
  user_agent: string (nullable)
  created_at: timestamp
}
```

### Inline Items Table (Updated)
```typescript
{
  // ... existing fields ...
  qa_approval_required: boolean (default true)
  qa_approval_status: enum (pending, approved, rejected)
  qa_approved_by: UUID (FK to users, nullable)
  qa_approved_at: timestamp (nullable)
  qa_rejection_reason: text (nullable)
}
```

---

## API Endpoints Summary

### Users & Profiles
- `GET /api/users/profile` - Get own profile
- `PUT /api/users/profile` - Update own profile
- `POST /api/users/profile/avatar` - Upload avatar
- `GET /api/users/:id/profile` - Get user profile (admin)
- `PUT /api/users/:id` - Update user (admin)
- `PUT /api/users/:id/permissions` - Update permissions (admin)
- `POST /api/users/:id/substitute` - Set substitute user
- `DELETE /api/users/:id/substitute` - Remove substitute user
- `GET /api/users/:id/activity-log` - Get user activity log

### Approvals
- `GET /api/approvals/pending` - Get pending approvals (QA)
- `GET /api/approvals/history` - Get approval history (QA)
- `GET /api/approvals/stats` - Get approval statistics (QA)
- `POST /api/approvals/:id/approve` - Approve stage (QA)
- `POST /api/approvals/:id/reject` - Reject stage (QA)

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Permissions
- `GET /api/permissions/check` - Check if user has permission
- `GET /api/permissions/modules` - Get available modules
- `GET /api/permissions/actions` - Get available actions

---

## Frontend Routes Summary

### New Pages
- `/profile` - User profile page (all roles)
- `/profile/:id` - View user profile (admin only)
- `/users` - User management (admin only)
- `/qa-dashboard` - QA approval dashboard (qa_manager only)
- `/notifications` - All notifications page (all roles)

### Updated Pages
- `/production` - Updated with QA approval status
- `/dashboard` - Role-specific dashboard views

---

## Permission Matrix Example

### System Access (Modules)
- Dashboard
- Orders
- Quotations
- Production
- Quality
- Dispatch
- Inventory
- Invoices
- Reports
- Settings
- User Management
- QA Dashboard

### Partial Access (Actions per Module)
- View
- Create
- Edit
- Delete
- Approve (QA only)
- Export
- Assign

### Role Presets

**Admin:**
- System Access: All modules
- Partial Access: All actions

**QA Manager:**
- System Access: Dashboard, Production, Quality, QA Dashboard
- Partial Access: View all, Approve stages

**Operator:**
- System Access: Dashboard, Production
- Partial Access: View own stages, Start/Pause/Complete own stages

**Analyst:**
- System Access: Dashboard, Reports, Orders, Invoices, Inventory
- Partial Access: View all, Export

**Sales:**
- System Access: Dashboard, Orders, Quotations, Invoices
- Partial Access: View, Create, Edit orders/quotations

**Planner:**
- System Access: Dashboard, Orders, Production, Dispatch
- Partial Access: View, Edit, Assign

**Accounts:**
- System Access: Dashboard, Invoices, Reports
- Partial Access: View, Create, Edit invoices

**Inventory:**
- System Access: Dashboard, Inventory, Orders
- Partial Access: View, Edit inventory

---

## Success Criteria

### Phase 1-2 (Backend)
- ✅ All database migrations executed successfully
- ✅ All API endpoints functional and tested
- ✅ QA approval workflow integrated
- ✅ Notifications sending (in-app + email)
- ✅ Substitute user feature working

### Phase 3-6 (Frontend)
- ✅ User profile pages functional
- ✅ User management system working (admin)
- ✅ QA dashboard functional
- ✅ Approval workflow working end-to-end
- ✅ Notifications displaying in real-time

### Phase 7-8 (Security & Polish)
- ✅ All routes protected with permissions
- ✅ UI elements hidden/disabled based on permissions
- ✅ All features tested and working
- ✅ UI polished and responsive
- ✅ Documentation updated

---

## Risk Mitigation

### Technical Risks
- **Database migration failures:** Test migrations on dev DB first, backup production before migration
- **Email delivery issues:** Use reliable email service (SendGrid, AWS SES), implement retry logic
- **Performance issues with notifications:** Implement pagination, use indexes, consider WebSocket for real-time updates
- **Permission check overhead:** Cache permissions in memory, use efficient queries

### Business Risks
- **QA bottleneck:** Monitor approval queue length, alert if queue grows too large, consider multiple QA managers
- **Operator confusion:** Provide clear UI feedback, training documentation, tooltips
- **Substitute user abuse:** Log all substitutions, require reason, admin can view/revoke

---

## Future Enhancements (Post-MVP)

- Multiple QA managers with load balancing
- QA approval delegation (QA can delegate to another QA)
- Approval templates (pre-defined checklists)
- Quality metrics dashboard (rejection trends, operator performance)
- Mobile app for operators (scan QR code to start stage)
- Automated QA approval for low-risk stages (based on history)
- Integration with external quality systems
- Advanced analytics (predictive quality issues)

---

## Timeline Estimate

- **Phase 1:** 2-3 days (Backend foundation)
- **Phase 2:** 2-3 days (QA workflow integration)
- **Phase 3:** 1-2 days (User profiles)
- **Phase 4:** 2-3 days (User management)
- **Phase 5:** 2-3 days (QA approval UI)
- **Phase 6:** 2 days (Notifications)
- **Phase 7:** 2 days (Access control)
- **Phase 8:** 2-3 days (Testing & polish)

**Total:** 15-21 days (3-4 weeks)

---

## Notes

- All phases are sequential and depend on previous phases
- Each phase will be completed and reviewed before moving to next
- User will approve each phase before proceeding
- Testing will be done continuously throughout development
- Documentation will be updated as features are implemented

---

**Next Step:** Await user approval to begin Phase 1 implementation.
