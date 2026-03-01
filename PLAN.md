# Implementation Plan: Remaining Features for Printing Press Management System

## Context

The Printing Press Management System currently has **6 of 12 core modules** fully implemented (50% complete). The system is production-ready for basic operations with solid foundations in CRM, Orders, Production, Inventory, Billing, and User Management. However, to achieve the full vision outlined in `docs/archive/intent.md`, we need to implement the remaining critical modules that will transform this into a comprehensive printing press management solution.

**Current Status:**
- ✅ Phase 1 (MVP) - Complete: Core workflow operational
- ⚠️ Phase 2 (Enhanced Operations) - Partially started: Missing 6 critical modules
- ❌ Phase 3 & 4 - Not started

**Why These Changes:**
The missing modules represent critical gaps in the printing workflow:
1. **Quotation Management** - No way to generate quotes before orders (sales bottleneck)
2. **Shop Floor Management** - Operators can't update production in real-time (visibility gap)
3. **Wastage Tracking** - No material waste tracking (cost control issue)
4. **Quality Control** - No systematic quality checkpoints (quality assurance gap)
5. **Dispatch & Delivery** - No delivery tracking or POD (customer service gap)

These gaps prevent the system from being a complete end-to-end solution for printing operations.

---

## Implementation Priority & Sequence

### Priority 1: Quotation Management (Weeks 1-2)
**Why First:** Sales team needs this immediately - it's the entry point for all business. Currently, they must manually create quotes, which is time-consuming and error-prone.

### Priority 2: Shop Floor Management (Weeks 3-4)
**Why Second:** Operators need mobile-friendly interface for real-time updates. This will dramatically improve production visibility and reduce manual data entry.

### Priority 3: Quality Control (Weeks 5-6)
**Why Third:** Quality checkpoints integrate with shop floor operations. Must come after shop floor module for seamless workflow.

### Priority 4: Dispatch & Delivery (Weeks 7-8)
**Why Fourth:** Handles post-production workflow. Depends on completed production jobs from shop floor module.

### Priority 5: Wastage Tracking (Week 9)
**Why Fifth:** Enhances shop floor and quality modules with detailed waste analysis. Can be integrated into existing stage tracking.

---

## Module 1: Quotation Management

### Overview
Create a complete quotation workflow from draft → sent → approved → converted to order. Reuse existing costing calculation logic from `CostingService`.

### Database Schema

**New Tables:**
1. **quotations** - Main quotation entity with 60+ fields (mirrors order structure)
2. **quotation_items** - Line items for custom charges
3. **quotation_history** - Audit trail for status changes

**Key Fields:**
- `quotation_number` (auto-generated: QUO-YYYYMMDD-XXX)
- `version` (for revisions: v1, v2, v3)
- `parent_quotation_id` (for tracking revisions)
- `status` (draft, sent, approved, rejected, expired, converted)
- Product specifications (copied from Order entity structure)
- Pricing breakdown (material, printing, finishing, pre-press, overhead, margin, tax)
- `converted_to_order_id` (tracks conversion)

### Backend Implementation

**Files to Create:**
- `backend/src/quotations/entities/quotation.entity.ts` - Main entity with all fields
- `backend/src/quotations/entities/quotation-item.entity.ts` - Line items
- `backend/src/quotations/entities/quotation-history.entity.ts` - Audit trail
- `backend/src/quotations/dto/quotation.dto.ts` - DTOs for validation
- `backend/src/quotations/quotations.service.ts` - Business logic
- `backend/src/quotations/quotations.controller.ts` - API endpoints
- `backend/src/quotations/quotations.module.ts` - Module definition
- `backend/src/migrations/1709290000000-CreateQuotationTables.ts` - Database migration

**Key Service Methods:**
- `create()` - Create quotation with auto-pricing calculation
- `calculatePricing()` - Preview pricing without saving (reuses CostingService logic)
- `send()` - Mark as sent, generate PDF
- `approve()` - Mark as approved
- `convertToOrder()` - One-click conversion to order
- `createRevision()` - Create new version (v2, v3, etc.)
- `generatePDF()` - Professional quotation PDF with company letterhead

**Pricing Calculation Logic:**
Reuse existing costing formulas from `backend/src/costing/costing.service.ts`:
1. Material cost (based on size, GSM, quantity)
2. Printing cost (CMYK + special colors)
3. Finishing cost (UV, lamination, embossing, die-cutting)
4. Pre-press cost (based on complexity)
5. Overhead (default 15%)
6. Profit margin (default 20%)
7. Discount (optional)
8. Tax (default 18% GST)

**API Endpoints:**
- `POST /api/quotations` - Create quotation
- `POST /api/quotations/calculate` - Calculate pricing preview
- `GET /api/quotations` - List with filters (status, customer, date range)
- `GET /api/quotations/:id` - Get details
- `GET /api/quotations/:id/pdf` - Download PDF
- `POST /api/quotations/:id/send` - Send to customer
- `POST /api/quotations/:id/approve` - Approve
- `POST /api/quotations/:id/reject` - Reject
- `POST /api/quotations/:id/convert-to-order` - Convert to order
- `POST /api/quotations/:id/revise` - Create revision

### Frontend Implementation

**Files to Create:**
- `frontend/src/services/quotation.service.ts` - API integration
- `frontend/src/pages/quotations/Quotations.tsx` - Main page with tabs
- `frontend/src/pages/quotations/QuotationForm.tsx` - Multi-step form (reuse order form structure)
- `frontend/src/pages/quotations/QuotationDetails.tsx` - Detail view
- `frontend/src/pages/quotations/PricingPreview.tsx` - Live pricing calculator
- `frontend/src/components/quotations/StatusBadge.tsx` - Status indicator
- `frontend/src/components/quotations/ConvertToOrderModal.tsx` - Conversion dialog

**UI Features:**
- Tabs: Draft, Sent, Approved, Expired, Converted
- Multi-step form (5 steps like orders)
- Live pricing preview as user fills form
- One-click "Convert to Order" button
- PDF download button
- Revision history timeline
- Status workflow visualization

---

## Module 2: Shop Floor Management

### Overview
Mobile-optimized interface for operators to update production in real-time. Extends existing `ProductionStageHistory` with material tracking, machine counters, and wastage recording.

### Database Schema

**New Tables:**
1. **material_consumption** - Track materials issued/returned per stage
2. **machine_counters** - Capture machine counter readings
3. **wastage_records** - Detailed wastage tracking with categorization
4. **offline_sync_queue** - Queue for offline actions

**Enhanced Tables:**
- `production_stage_history` - Add fields: `good_quantity`, `counter_start`, `counter_end`, `materials_issued`, `counters_recorded`

### Backend Implementation

**Files to Create:**
- `backend/src/production/entities/material-consumption.entity.ts`
- `backend/src/production/entities/machine-counter.entity.ts`
- `backend/src/production/entities/wastage-record.entity.ts`
- `backend/src/production/entities/offline-sync-queue.entity.ts`
- `backend/src/production/dto/material-consumption.dto.ts`
- `backend/src/production/dto/machine-counter.dto.ts`
- `backend/src/production/dto/wastage.dto.ts`
- `backend/src/migrations/1709291000000-AddShopFloorManagement.ts`

**Files to Modify:**
- `backend/src/production/production.service.ts` - Add methods:
  - `issueMaterial()`, `returnMaterial()`, `getMaterialConsumption()`
  - `recordMachineCounter()`, `getMachineCounters()`
  - `recordWastage()`, `getWastageRecords()`
  - `getMyActiveJobs()` - Get jobs for logged-in operator
  - `getJobByQRCode()` - Lookup job by QR code
  - `generateJobQRCode()` - Generate QR code for job
  - `startStageEnhanced()` - Enhanced with counter and material tracking
  - `completeStageEnhanced()` - Enhanced with wastage details

- `backend/src/production/production.controller.ts` - Add endpoints:
  - `GET /api/production/shop-floor/my-jobs`
  - `GET /api/production/shop-floor/job-by-qr/:qrCode`
  - `GET /api/production/shop-floor/job/:id/qr-code`
  - `POST /api/production/materials/issue`
  - `POST /api/production/materials/return`
  - `POST /api/production/counters/record`
  - `POST /api/production/wastage/record`
  - `POST /api/production/shop-floor/sync` - Offline sync

**QR Code Integration:**
- Install `qrcode` npm package
- Generate QR codes containing job ID and job number
- QR codes printed on job sheets for easy scanning

**Real-Time Updates:**
- **Phase 1:** Use polling (10-second intervals) - simpler, works on free tier
- **Phase 2:** Upgrade to WebSocket later using `@nestjs/websockets` + `socket.io`

### Frontend Implementation

**Files to Create:**
- `frontend/src/pages/shop-floor/ShopFloor.tsx` - Main operator dashboard
- `frontend/src/pages/shop-floor/MyJobs.tsx` - Operator's active jobs
- `frontend/src/pages/shop-floor/JobDetails.tsx` - Job detail view
- `frontend/src/pages/shop-floor/StartStage.tsx` - Start stage form
- `frontend/src/pages/shop-floor/CompleteStage.tsx` - Complete stage form
- `frontend/src/pages/shop-floor/MaterialIssue.tsx` - Material issue form
- `frontend/src/pages/shop-floor/WastageEntry.tsx` - Wastage recording
- `frontend/src/pages/shop-floor/QRScanner.tsx` - QR code scanner
- `frontend/src/components/shop-floor/JobCard.tsx` - Touch-friendly job card
- `frontend/src/components/shop-floor/QuickActions.tsx` - Large touch buttons
- `frontend/src/hooks/useShopFloorPolling.ts` - Polling hook (10s interval)
- `frontend/src/services/offline-storage.ts` - IndexedDB for offline queue

**Mobile-First Design:**
- Large touch-friendly buttons (min 48px height)
- Large input fields (min 48px height, text-lg)
- Bottom navigation for mobile
- Simplified forms with minimal fields
- QR scanner using `html5-qrcode` library
- Offline support using Service Worker + IndexedDB

**Offline Support:**
- Service Worker caches critical pages
- IndexedDB stores pending actions
- Auto-sync when connectivity returns
- Visual indicator showing offline status and pending actions

---

## Module 3: Quality Control

### Overview
Systematic quality checkpoints at each production stage with defect logging, rejection tracking, and customer complaint management. Integrates with production stage transitions.

### Database Schema

**New Tables:**
1. **quality_checkpoints** - Define checkpoints per stage (admin-configured)
2. **quality_inspections** - Inspection records linked to jobs/stages
3. **quality_defects** - Defect logging with photos
4. **quality_rejections** - Rejection tracking with disposition
5. **customer_complaints** - Customer complaint workflow

**Enhanced Tables:**
- `production_jobs` - Add: `quality_status`, `failed_inspections_count`, `last_inspection_date`
- `production_stage_history` - Add: `quality_checked`, `quality_status`

### Backend Implementation

**Files to Create:**
- `backend/src/quality/entities/quality-checkpoint.entity.ts`
- `backend/src/quality/entities/quality-inspection.entity.ts`
- `backend/src/quality/entities/quality-defect.entity.ts`
- `backend/src/quality/entities/quality-rejection.entity.ts`
- `backend/src/quality/entities/customer-complaint.entity.ts`
- `backend/src/quality/dto/quality.dto.ts`
- `backend/src/quality/quality.service.ts`
- `backend/src/quality/quality.controller.ts`
- `backend/src/quality/quality.module.ts`
- `backend/src/migrations/1709292000000-CreateQualityModule.ts`

**Files to Modify:**
- `backend/src/production/production.service.ts` - Integrate quality checkpoint validation:
  - When starting stage: check if mandatory checkpoints exist
  - When completing stage: validate all mandatory checkpoints passed
  - Prevent stage completion if failed inspections exist (with admin override)

**File Upload:**
- Use `@nestjs/platform-express` with `multer`
- Store defect photos in `uploads/quality/defects/`
- Store complaint photos in `uploads/quality/complaints/`
- Max file size: 5MB, types: jpg, png, pdf

**API Endpoints:**
- `POST /api/quality/inspections` - Create inspection
- `POST /api/quality/inspections/:id/pass` - Mark passed
- `POST /api/quality/inspections/:id/fail` - Mark failed
- `POST /api/quality/defects` - Log defect
- `POST /api/quality/defects/:id/upload-photo` - Upload photo
- `POST /api/quality/rejections` - Create rejection
- `POST /api/quality/complaints` - Create complaint
- `GET /api/quality/metrics` - Quality metrics dashboard

**Quality Metrics:**
- First Pass Yield (FPY) - % jobs passing without defects
- Defect rate by category, machine, operator
- Rejection rate (%)
- Customer complaint rate
- Top 5 defect types (Pareto chart)
- Cost of Poor Quality (COPQ)

### Frontend Implementation

**Files to Create:**
- `frontend/src/pages/quality/Quality.tsx` - Main page with tabs
- `frontend/src/pages/quality/InspectionForm.tsx` - Inspection form
- `frontend/src/pages/quality/DefectLogForm.tsx` - Defect logging with photo upload
- `frontend/src/pages/quality/RejectionForm.tsx` - Rejection form
- `frontend/src/pages/quality/ComplaintForm.tsx` - Complaint form
- `frontend/src/pages/quality/QualityMetrics.tsx` - Metrics dashboard
- `frontend/src/components/quality/DefectPhotoGallery.tsx` - Photo viewer
- `frontend/src/services/quality.service.ts` - API integration

**UI Features:**
- Tabs: Inspections, Defects, Rejections, Complaints
- Photo upload with preview
- Quality metrics dashboard with charts
- Defect categorization (printing, die-cutting, lamination, finishing)
- Severity levels (critical, major, minor)
- Root cause analysis fields

---

## Module 4: Dispatch & Delivery Management

### Overview
Complete delivery workflow from packing → dispatch → tracking → POD. Handles post-production logistics with courier/transport management.

### Database Schema

**New Tables:**
1. **deliveries** - Main delivery entity with status tracking
2. **packing_lists** - Packing list items (multiple boxes per delivery)
3. **challans** - Delivery challan generation
4. **delivery_tracking** - Tracking timeline with location updates

**Key Fields (deliveries):**
- `delivery_number` (auto-generated: DEL-YYYYMMDD-XXX)
- `delivery_status` (pending, packed, dispatched, in_transit, delivered, failed, returned)
- `delivery_type` (courier, own_transport, customer_pickup)
- `courier_name`, `tracking_number`, `vehicle_number`, `driver_name`
- `pod_photo_url`, `pod_signature_url` (Proof of Delivery)
- `received_by_name`, `received_by_designation`

### Backend Implementation

**Files to Create:**
- `backend/src/dispatch/entities/delivery.entity.ts`
- `backend/src/dispatch/entities/packing-list.entity.ts`
- `backend/src/dispatch/entities/challan.entity.ts`
- `backend/src/dispatch/entities/delivery-tracking.entity.ts`
- `backend/src/dispatch/dto/delivery.dto.ts`
- `backend/src/dispatch/dispatch.service.ts`
- `backend/src/dispatch/dispatch.controller.ts`
- `backend/src/dispatch/dispatch.module.ts`
- `backend/src/migrations/1709293000000-CreateDispatchModule.ts`

**File Upload:**
- POD photos stored in `uploads/pod/`
- File naming: `{delivery_id}_{timestamp}.jpg`

**API Endpoints:**
- `POST /api/dispatch/deliveries` - Create delivery
- `POST /api/dispatch/deliveries/:id/pack` - Mark as packed
- `POST /api/dispatch/deliveries/:id/dispatch` - Dispatch
- `POST /api/dispatch/deliveries/:id/track` - Add tracking update
- `POST /api/dispatch/deliveries/:id/deliver` - Mark delivered
- `POST /api/dispatch/deliveries/:id/upload-pod` - Upload POD photo
- `GET /api/dispatch/deliveries/:id/tracking-history` - Timeline
- `GET /api/dispatch/deliveries/metrics` - Delivery performance metrics

**Delivery Metrics:**
- On-time delivery rate (%)
- Average delivery time (days)
- Pending deliveries count
- Deliveries by status, courier
- Failed/returned deliveries

### Frontend Implementation

**Files to Create:**
- `frontend/src/pages/dispatch/Dispatch.tsx` - Main page with tabs
- `frontend/src/pages/dispatch/DeliveryForm.tsx` - Delivery form
- `frontend/src/pages/dispatch/PackingListForm.tsx` - Packing list
- `frontend/src/pages/dispatch/ChallanGenerator.tsx` - Challan generation
- `frontend/src/pages/dispatch/TrackingTimeline.tsx` - Tracking timeline
- `frontend/src/pages/dispatch/PODUpload.tsx` - POD upload
- `frontend/src/pages/dispatch/DeliveryMetrics.tsx` - Metrics dashboard
- `frontend/src/services/dispatch.service.ts` - API integration

**UI Features:**
- Tabs: Pending, Dispatched, Delivered
- Packing list with multiple items/boxes
- Challan PDF generation
- Tracking timeline with location updates
- POD photo upload with preview
- Delivery performance dashboard

---

## Module 5: Wastage Tracking Enhancement

### Overview
Enhance existing wastage tracking with detailed categorization and analysis. Integrates into shop floor module.

### Implementation

**Already Covered in Shop Floor Module:**
- `wastage_records` table with categorization
- Wastage types: setup_waste, production_waste, quality_rejection, machine_error, material_defect, other
- Linked to `production_stage_history`

**Additional Analytics:**
- Wastage trends over time
- Wastage by stage, machine, operator
- Wastage cost calculation
- Wastage reduction targets
- Material consumption vs planned usage variance

**Frontend Enhancements:**
- Wastage analytics dashboard
- Wastage entry form in shop floor module
- Wastage reports by category, stage, machine

---

## Critical Files Summary

### Backend - New Modules
1. **Quotations Module:**
   - `backend/src/quotations/entities/quotation.entity.ts`
   - `backend/src/quotations/quotations.service.ts`
   - `backend/src/quotations/quotations.controller.ts`
   - `backend/src/migrations/1709290000000-CreateQuotationTables.ts`

2. **Shop Floor Enhancements:**
   - `backend/src/production/entities/material-consumption.entity.ts`
   - `backend/src/production/entities/machine-counter.entity.ts`
   - `backend/src/production/entities/wastage-record.entity.ts`
   - `backend/src/migrations/1709291000000-AddShopFloorManagement.ts`

3. **Quality Module:**
   - `backend/src/quality/entities/quality-inspection.entity.ts`
   - `backend/src/quality/quality.service.ts`
   - `backend/src/quality/quality.controller.ts`
   - `backend/src/migrations/1709292000000-CreateQualityModule.ts`

4. **Dispatch Module:**
   - `backend/src/dispatch/entities/delivery.entity.ts`
   - `backend/src/dispatch/dispatch.service.ts`
   - `backend/src/dispatch/dispatch.controller.ts`
   - `backend/src/migrations/1709293000000-CreateDispatchModule.ts`

### Frontend - New Pages
1. **Quotations:** `frontend/src/pages/quotations/Quotations.tsx`
2. **Shop Floor:** `frontend/src/pages/shop-floor/ShopFloor.tsx`
3. **Quality:** `frontend/src/pages/quality/Quality.tsx`
4. **Dispatch:** `frontend/src/pages/dispatch/Dispatch.tsx`

### Integration Points
- `backend/src/app.module.ts` - Register new modules
- `backend/src/production/production.service.ts` - Integrate quality checkpoints
- `frontend/src/App.tsx` - Add routes for new pages
- `frontend/src/components/Layout.tsx` - Add navigation links

---

## Verification & Testing

### Backend Testing
1. Run migrations: `npm run migration:run` (from backend/)
2. Test API endpoints with Postman/Thunder Client
3. Verify database schema with pgAdmin
4. Test file uploads (POD photos, defect photos)
5. Test pricing calculations match existing costing logic
6. Test quotation → order conversion
7. Test quality checkpoint validation during stage transitions

### Frontend Testing
1. Test quotation creation and pricing preview
2. Test quotation → order conversion flow
3. Test shop floor mobile UI on tablet/phone
4. Test QR code scanning
5. Test offline mode (disconnect network, perform actions, reconnect)
6. Test quality inspection workflow
7. Test delivery tracking and POD upload
8. Test all dashboards and metrics

### Integration Testing
1. Complete workflow: Quotation → Order → Production → Quality → Dispatch
2. Test material consumption tracking through production stages
3. Test quality checkpoint enforcement
4. Test wastage recording and analytics
5. Test delivery creation from completed production jobs

### Performance Testing
1. Test with 1000+ quotations
2. Test shop floor polling with multiple operators
3. Test offline sync with 50+ queued actions
4. Test file uploads with large images
5. Test PDF generation speed

---

## Deployment Considerations

### Database Migrations
- Run migrations in sequence (1709290000000 → 1709291000000 → 1709292000000 → 1709293000000)
- Backup database before running migrations
- Test migrations on staging environment first

### File Storage
- Create upload directories: `uploads/pod/`, `uploads/quality/defects/`, `uploads/quality/complaints/`
- Configure proper permissions (755)
- Consider cloud storage (AWS S3, Cloudflare R2) for production

### Environment Variables
- No new environment variables needed
- Existing JWT and database config sufficient

### Deployment Steps
1. Deploy backend with migrations
2. Run migrations on production database
3. Deploy frontend with new routes
4. Test critical workflows end-to-end
5. Train users on new modules

---

## Success Metrics

After implementation, the system should achieve:
- **Quotation Module:** 90% reduction in quote generation time
- **Shop Floor Module:** Real-time production visibility, 50% reduction in manual data entry
- **Quality Module:** 50% reduction in rejection rate through systematic checkpoints
- **Dispatch Module:** 90%+ on-time delivery rate with POD tracking
- **Wastage Tracking:** 25% reduction in material wastage through better tracking

---

## Timeline Summary

- **Week 1-2:** Quotation Management (Priority 1)
- **Week 3-4:** Shop Floor Management (Priority 2)
- **Week 5-6:** Quality Control (Priority 3)
- **Week 7-8:** Dispatch & Delivery (Priority 4)
- **Week 9:** Wastage Analytics Enhancement (Priority 5)
- **Week 10:** Integration testing, bug fixes, deployment

**Total Duration:** 10 weeks to complete all remaining modules and achieve 100% of intended features.

---

## Notes

This plan was created on 2026-03-01 and represents the roadmap to complete the Printing Press Management System from 50% to 100% feature completion. Each module builds upon the existing foundation and integrates seamlessly with the current architecture.
