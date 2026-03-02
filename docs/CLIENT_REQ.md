# Client Feedback Summary - MVP Review
## Additional Features & Changes Required

Based on the MVP review, the client has identified several critical enhancements needed across different modules. Here's a detailed breakdown:

---

## 1. **INVENTORY MODULE - Enhanced Search & Filtering**

### Current Issue:
Basic inventory list with limited search capability

### Required Enhancements:

**Multi-Level Search Hierarchy:**
1. **Primary Categories (Buttons/Tabs):**
   - Block
   - Paper
   - Other Material

2. **Paper Search Drill-Down:**
   - Search by Size (A4, A3, etc.)
   - Search by GSM/Gram weight
   - Search by Type
   - Final filter by specific GSM value

3. **Other Materials Categories:**
   - Ink
   - Kerosene oil
   - Greasing ship
   - Rubber Band

4. **Search Methods Required:**
   - List view or dropdown
   - Type-wise filtering
   - Color-wise filtering  
   - Brand-wise filtering

**Data Structure Needed:**
```
Item Code: 00011
Item Name: Paper A4
Category: Paper
Subcategory: (specific type)
Current Stock: 10.00 reams
Reorder Level: 2.00 reams
```

---

## 2. **INVOICES MODULE - Enhanced Fields**

### Current Fields:
- Invoice #
- Order #
- Customer
- Invoice Date
- Due Date

### Additional Fields Required:

**Order Reference:**
- Order # (already exists)
- Company name
- Group name
- Product type

**Quantity & Pricing:**
- Final Qty (final quantity delivered)
- Rate (unit price)

**Tax Options:**
- Sales Tax: Yes/No (dropdown or checkbox)

**Purpose:** Better tracking of invoicing details and tax compliance

---

## 3. **JOB COSTING MODULE - Smart Linking**

### Current Issue:
Manual job selection without context

### Required Enhancement:

**Product Name Linking:**
- When Product Name is selected from dropdown
- System should automatically:
  - Link to product specification sheet
  - Pull size, quantity, and other specs automatically
  - Apply formula for cost conversion based on card specifications

**Cost Calculation:**
- Auto-calculate based on:
  - Card size
  - Quantity
  - Material specifications
- Apply conversion formulas automatically

**Pre-Press Charges:**
- Add fixed charge field for pre-press work
- Should be configurable per job or have default rates

---

## 4. **ORDERS MODULE - Enhanced Search & Filtering**

### Current Status Filters (Already Good):
- All Statuses
- Pending
- Approved ✓
- In Production
- Completed
- Delivered
- Cancelled

### Additional Search Features Required:

**Search Options:**
1. Search by Product name
2. Search by Customer name
3. Status update capability (seems already implemented based on note in Urdu)

### Required in Orders List View:

**Customer/Product Details (Searchable):**
- Customer name (already exists)
- Product name (already exists)
- Production status (detailed - should link to actual production stage)

**Missing Fields (Critical):**
```
Per Order Record Should Include:
- Order # ✓ (exists)
- Customer ✓ (exists)
- Group name (missing - Company/Organization group)
- Type (missing - product category)
- Strength (missing - product specification)
- Batch No (missing - if any)
- Qty ✓ (exists)
- Specs (missing - should show main specifications)
- Order Date ✓ (exists as "Target Date")
- Delivery Date ✓ (exists)
- Priority ✓ (exists)
- Status (should be updated according to current production status)
```

**Key Requirement:** 
*Status should automatically sync with actual production progress, not manually set*

---

## 5. **PRODUCTION MODULE - Queue & Status Management**

### Current View:
- Job #
- Order #
- Product
- Customer
- Machine
- Operator

### Critical Additions Required:

**Queue Status Display:**
- Need "Queued" status showing jobs waiting to start
- Visual indication of production queue/backlog

**Inline Product Status:**
- Show current production stage directly in list
- Example: "Currently at Printing - Cyan" or "At UV Stage"

**Enhanced Status Tracking:**
- Status should show:
  - Current stage (Pre-Press/Printing/UV/etc.)
  - Current process within stage (if in Printing: which color)
  - Operator assigned
  - Machine assigned

**Search Capabilities Required:**
- Search by Product name (emphasized in Urdu notes)
- Search by Customer
- Filter by current production stage
- Filter by machine

**Machine Naming Convention:**
Example seen in notes:
- HB1, HB2 (Heidelberg machines?)
- Printing machine
- Dye 1
- UV #2 or UV #1

---

## 6. **ADDITIONAL NOTES FROM CLIENT (Urdu Text Translation)**

### Production Module Requirements:
- When machine name and production stage are updated, they should also be searchable/filterable
- There should be a way to see current status of any product at any production stage
- Search functionality needed to find products by name across all production stages

### Orders Module Requirements:
- Need proper search by customer name in Urdu/Arabic script
- Status should auto-update based on production reality, not manual entry

---

## TECHNICAL IMPLEMENTATION PRIORITIES:

### **Priority 1 - Critical (Must Have):**
1. **Orders Module:** Add missing fields (Group, Type, Strength, Batch No, Specs)
2. **Orders Module:** Auto-sync status with Production module
3. **Production Module:** Add "Queued" status and inline stage display
4. **Inventory Module:** Implement hierarchical search (Category → Type → Specs)

### **Priority 2 - Important (Should Have):**
1. **Job Costing:** Auto-linking product specs to cost calculations
2. **Invoices:** Add missing fields (Company, Group, Type, Qty, Rate, Sales Tax)
3. **Production Module:** Enhanced search by product/customer/stage
4. **Inventory Module:** Multi-filter search (Type/Color/Brand)

### **Priority 3 - Nice to Have (Could Have):**
1. Job costing formula automation
2. Pre-press fixed charges configuration
3. Advanced machine-wise filtering in Production

---

## DATABASE SCHEMA CHANGES NEEDED:

### Orders Table - Add Columns:
```sql
- group_name VARCHAR(255)
- product_type VARCHAR(100)
- strength VARCHAR(100)
- batch_number VARCHAR(100)
- specifications TEXT
- auto_sync_status BOOLEAN (to link with production)
```

### Invoices Table - Add Columns:
```sql
- company_name VARCHAR(255)
- group_name VARCHAR(255)
- product_type VARCHAR(100)
- final_quantity DECIMAL
- unit_rate DECIMAL
- sales_tax_applicable BOOLEAN
```

### Inventory Table - Add Columns:
```sql
- main_category VARCHAR(100) [Block/Paper/Other Material]
- sub_category VARCHAR(100)
- size VARCHAR(50)
- type VARCHAR(100)
- gsm_value INT
- color VARCHAR(50)
- brand VARCHAR(100)
```

### Production Table - Add Columns:
```sql
- queue_status ENUM('Queued', 'In Progress', 'Completed')
- current_stage VARCHAR(100)
- current_process VARCHAR(100) (e.g., "Cyan" if in Printing)
- inline_status_display TEXT (auto-generated description)
```

### Job Costing - Add Linking:
```sql
- product_spec_id INT (Foreign key to product specifications)
- auto_calculated_cost DECIMAL
- pre_press_charge DECIMAL
```

---

## UI/UX CHANGES NEEDED:

1. **Inventory:** Replace simple search with category buttons → drill-down filters
2. **Orders:** Add filter chips/tags for quick status + product + customer search
3. **Production:** Add visual queue indicator (e.g., "3 jobs waiting") + inline stage badges
4. **Invoices:** Expand form to include all new fields
5. **Job Costing:** Add auto-fill notification when product is selected ("Specs loaded automatically")

---

## BUSINESS LOGIC TO IMPLEMENT:

1. **Auto-Status Sync:** When production stage changes → Order status updates automatically
2. **Smart Search:** Implement full-text search with multi-field matching (customer name in Urdu, product name, specs)
3. **Cost Calculation Engine:** Formula-based cost calculation from product specs
4. **Queue Management:** Auto-calculate queue position based on priority + order date
5. **Inline Status Generation:** Auto-generate human-readable status (e.g., "Printing Magenta on Machine HB2")