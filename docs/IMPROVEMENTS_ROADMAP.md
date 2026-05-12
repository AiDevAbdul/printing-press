# Improvements Roadmap

Recommendations to make the system more beneficial, advanced, effective, and profitable.

---

## Status

| Feature | Priority | Status |
|---------|----------|--------|
| PDF Generation (Invoice, Quotation, Job Sheet) | Critical | ✅ Done |
| Payment Tracking (payments table + AR aging) | Critical | ✅ Done |
| WhatsApp/SMS Notifications | High | Planned |
| Advanced Analytics Dashboard | High | Planned |
| Customer Portal | High | Planned |
| Machine & Maintenance Management | Medium | Planned |
| Purchase Orders / Supplier Management | Medium | Planned |
| Repeat Order Automation (Clone Order) | Medium | Planned |
| Two-Factor Authentication | Medium | Planned |
| Progressive Web App (Shop Floor Mobile) | Medium | Planned |

---

## High-Impact (Do These First)

### 1. PDF Generation ✅
**Why critical:** Sales teams need professional quotation PDFs. Accounts need invoice PDFs. Shop floor needs printable job sheets. Without this, staff do it manually.

**Scope:**
- `/api/pdf/invoice/[id]` — Invoice PDF
- `/api/pdf/quotation/[id]` — Quotation PDF
- "Download PDF" button on invoice and quotation detail pages

---

### 2. Payment Tracking ✅
**Why critical:** Invoices track `paid_amount` and `balance_amount` but no payment history. Can't do AR aging, receipts, or overdue alerts without this.

**Scope:**
- `payments` table (invoice_id, amount, method, reference_no, received_by, received_at)
- `/api/payments` CRUD
- Invoice detail: payment history + "Record Payment" modal
- Auto-update `paid_amount` / `balance_amount` on invoice after payment
- Auto-mark invoice as `paid` when fully settled

---

### 3. WhatsApp/SMS Notifications
**Why high value:** Customers constantly call to check status. Automated WhatsApp on order confirmed, proof ready, dispatched, delivered removes inbound calls.

**Scope:**
- Twilio or WhatsApp Business API
- Hook into order status change events
- Templates: order confirmation, proof ready, dispatched, delivered, invoice due

---

### 4. Advanced Analytics Dashboard
**Why high value:** All the data is there — just not surfaced.

**Key metrics missing:**
- Job profitability (quoted vs actual cost vs revenue)
- Machine utilization % per machine per day
- Wastage cost trend (wastage_records table exists)
- On-time delivery rate
- Customer revenue ranking
- Top defect categories (quality_defects table exists)
- AR aging summary

**Scope:** `/analytics` page with Recharts charts pulling from existing data.

---

### 5. Customer Portal
**Why valuable:** Customers can self-serve instead of calling.

**Features:**
- Order status tracking (read-only)
- Digital proof approval (replaces WhatsApp back-and-forth)
- Invoice & challan downloads
- Complaint submission

**Scope:** Separate `customer` role auth, read-only views scoped to their orders.

---

## Medium Priority

### 6. Machine & Maintenance Management
`machine_counters` tracks job runs but no machine master table, no maintenance schedule.

**Scope:** `machines` table, `machine_maintenance` table, preventive maintenance alerts.

---

### 7. Purchase Orders / Supplier Management
Inventory tracks stock but no `suppliers` table, no PO flow, no GRN module (referenced but not built).

**Scope:** `suppliers`, `purchase_orders`, `purchase_order_items`, `goods_received_notes` tables + `/procurement` module.

---

### 8. Repeat Order Automation (Clone Order)
`is_repeat_order` and `previous_order_id` exist on orders but UI requires re-entering all 100+ specs.

**Scope:** "Repeat Order" button on order detail → clone all fields → user adjusts quantity/date only.

---

### 9. Two-Factor Authentication
For a pharmaceutical packaging SaaS, 2FA is increasingly required by enterprise customers.

**Scope:** TOTP-based 2FA using `otplib`, QR code setup flow, backup codes.

---

### 10. Progressive Web App (Shop Floor Mobile)
Shop floor operators need mobile access to update stage progress, log wastage, scan job barcodes.

**Scope:** PWA manifest + service worker, touch-optimized shop-floor pages, QR codes on job sheets.

---

## Quick Wins (Low Effort, High Value)

| Item | What |
|------|------|
| Email templates | Send quotation/invoice by email directly from the system |
| Overdue invoice alerts | Daily cron → email/notification for overdue invoices |
| Clone order (repeat) | Single button on order detail, copies all specs |
| Export to Excel | Any list view → download as `.xlsx` |
| Delivery ETA SMS | Automated SMS to customer when order dispatched |
| Low-stock alerts | Dashboard widget when inventory hits reorder level |

---

## If Selling as SaaS to Other Printing Companies

- **Subscription billing** (Stripe) with plan tiers
- **Onboarding wizard** (company setup, user invite flow)
- **White-label domains** per company
- **Usage metering** (orders/month per plan)
- **API access** with API keys for integrations
