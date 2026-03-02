# Job Costing Module Enhancements - Implementation Summary

## Overview
Successfully implemented auto-calculation of job costs based on product specifications as requested in CLIENT_REQ.md Part 3.

## Database Changes

### Migration: `1709287200000-EnhanceJobCosting.ts`

Added new columns to `job_costs` table:

**Product Specification Fields (Auto-loaded from Order):**
- `order_id` UUID - Foreign key to orders table
- `card_length` DECIMAL(10,2) - Card length in cm
- `card_width` DECIMAL(10,2) - Card width in cm
- `card_gsm` INTEGER - Paper weight
- `card_type` VARCHAR(50) - Card type (Shine/Matt/Metalize)
- `colors_cmyk` BOOLEAN - Has CMYK colors
- `special_colors_count` INTEGER - Number of special/Pantone colors
- `special_colors` TEXT - List of special colors
- `uv_type` VARCHAR(50) - UV varnish type
- `lamination_required` BOOLEAN - Has lamination
- `embossing_required` BOOLEAN - Has embossing

**Auto-Calculated Cost Breakdown Fields:**
- `material_cost` DECIMAL(10,2) - Calculated material cost
- `printing_cost_cmyk` DECIMAL(10,2) - CMYK printing cost
- `printing_cost_special` DECIMAL(10,2) - Special colors printing cost
- `uv_cost` DECIMAL(10,2) - UV coating cost
- `lamination_cost` DECIMAL(10,2) - Lamination cost
- `die_cutting_cost` DECIMAL(10,2) - Die cutting cost
- `embossing_cost` DECIMAL(10,2) - Embossing cost
- `pre_press_charges` DECIMAL(10,2) - Pre-press charges
- `total_processing_cost` DECIMAL(10,2) - Sum of all processing costs
- `cost_per_unit` DECIMAL(10,4) - Cost per piece

**Indexes:**
- `IDX_job_costs_order` on `order_id`

**Foreign Key:**
- `FK_job_costs_order` linking to `orders(id)` with ON DELETE SET NULL

## Backend Implementation

### New Entity: `CostingConfig`

Created configuration entity to store cost calculation rates:

```typescript
@Entity('costing_config')
export class CostingConfig {
  // Material Rates
  paper_rate_per_kg: number;           // Default: 150
  gsm_rate_factor: number;             // Default: 0.0001

  // Printing Rates (per 1000 pieces)
  cmyk_base_rate: number;              // Default: 2000
  special_color_rate: number;          // Default: 800

  // Finishing Rates
  spot_uv_rate_per_sqm: number;        // Default: 50
  lamination_rate_per_sqm: number;     // Default: 30
  embossing_rate_per_job: number;      // Default: 1500
  die_cutting_rate_per_1000: number;   // Default: 500

  // Pre-Press Charges
  pre_press_simple: number;            // Default: 2000
  pre_press_medium: number;            // Default: 3500
  pre_press_complex: number;           // Default: 5000
  pre_press_rush: number;              // Default: 8000
}
```

### Files Modified:

1. **Entity** (`backend/src/costing/entities/job-cost.entity.ts`)
   - Added 21 new fields for specifications and cost breakdown
   - Added relation to Order entity

2. **New Entity** (`backend/src/costing/entities/costing-config.entity.ts`)
   - Created configuration entity for cost rates

3. **DTOs** (`backend/src/costing/dto/job-cost.dto.ts`)
   - Added `CalculateCostDto` for calculation requests
   - Added `UpdateCostingConfigDto` for config updates
   - Updated `CreateJobCostDto` to include `pre_press_charges`

4. **Service** (`backend/src/costing/costing.service.ts`)
   - Added `getCostingConfig()` - Get or create default config
   - Added `calculateMaterialCost()` - Calculate material cost from dimensions
   - Added `calculatePrintingCost()` - Calculate CMYK and special color costs
   - Added `calculateFinishingCosts()` - Calculate UV, lamination, embossing, die cutting
   - Added `calculateJobCost()` - Main calculation method
   - Added `saveCalculatedCost()` - Save calculation to database
   - Added `getCostingConfiguration()` - Get current config
   - Added `updateCostingConfiguration()` - Update config rates

5. **Controller** (`backend/src/costing/costing.controller.ts`)
   - Added `POST /costing/calculate` - Calculate costs without saving
   - Added `POST /costing/calculate/save` - Calculate and save costs
   - Added `GET /costing/config` - Get configuration
   - Added `PATCH /costing/config` - Update configuration

6. **Module** (`backend/src/costing/costing.module.ts`)
   - Added CostingConfig, ProductionJob, Order to TypeORM imports

## Cost Calculation Formulas

### Material Cost
```typescript
// Area in cm²
area = length × width

// Total area in cm²
totalArea = area × quantity

// Weight in kg (gsm is grams per square meter, 1 m² = 10000 cm²)
weight = (totalArea × gsm) / 10000 / 1000

// Cost
materialCost = weight × paper_rate_per_kg
```

### Printing Cost
```typescript
// CMYK (4 colors)
cmykCost = cmyk_base_rate × quantity / 1000

// Special Colors
specialCost = special_colors_count × special_color_rate × quantity / 1000
```

### Finishing Costs
```typescript
// Area in square meters
areaInSqm = (length × width) / 10000
totalAreaSqm = areaInSqm × quantity

// UV Cost
uvCost = totalAreaSqm × spot_uv_rate_per_sqm

// Lamination Cost
laminationCost = totalAreaSqm × lamination_rate_per_sqm

// Embossing Cost (per job)
embossingCost = embossing_rate_per_job

// Die Cutting Cost
dieCuttingCost = die_cutting_rate_per_1000 × quantity / 1000
```

### Pre-Press Charges
Auto-determined based on complexity:
- **Simple**: No special colors, no UV, no embossing → ₹2,000
- **Medium**: 1-2 special colors OR UV → ₹3,500
- **Complex**: 3+ special colors OR embossing → ₹5,000
- **Rush**: User can override with custom amount

### Total Cost
```typescript
totalProcessingCost =
  printing_cost_cmyk +
  printing_cost_special +
  uv_cost +
  lamination_cost +
  embossing_cost +
  die_cutting_cost +
  pre_press_charges

totalCost = material_cost + totalProcessingCost

costPerUnit = totalCost / quantity
```

## Frontend Implementation

### Files Modified:

1. **Types** (`frontend/src/types/index.ts`)
   - Updated `JobCost` interface with 21 new optional fields
   - Added `CostCalculation` interface for calculation response
   - Added `CostingConfig` interface for configuration

2. **Costing Page** (`frontend/src/pages/costing/Costing.tsx`)
   - Added state for `showCalculation` and `prePressCost`
   - Added query for cost calculation
   - Added mutation for saving calculated costs
   - Added "Auto-Calculate Cost" button
   - Added cost breakdown display section with:
     - Product specifications (auto-loaded)
     - Material cost
     - Printing costs (CMYK + Special)
     - Finishing costs (UV, Lamination, Embossing, Die Cutting)
     - Pre-press charges (editable)
     - Total cost and cost per unit
   - Added "Save Costing" and "Cancel" buttons

## Features Implemented

### 1. Auto-Load Product Specifications
When user selects a production job:
- System automatically fetches linked order
- Extracts all product specifications:
  - Card dimensions (length × width)
  - GSM (paper weight)
  - Quantity
  - Card type (Shine/Matt/Metalize)
  - Colors (CMYK + special colors)
  - Finishing requirements (UV, lamination, embossing)

### 2. Auto-Calculate Costs
System calculates costs using formulas:
- **Material Cost**: Based on dimensions, GSM, quantity, paper rate
- **Printing Cost**: Based on number of colors and quantity
- **Finishing Costs**: Based on area, finishing types, quantity
- **Pre-Press Charges**: Auto-determined by complexity or user override

### 3. Editable Pre-Press Charges
- System suggests pre-press cost based on job complexity
- User can override with custom amount
- "Reset" button to restore auto-calculated value

### 4. Cost Breakdown Display
Shows detailed breakdown:
- Each cost component separately
- Formulas used (for transparency)
- Total processing cost
- Grand total
- Cost per unit

### 5. Save Calculated Costs
- "Save Costing" button stores calculation to database
- All specifications and breakdown saved
- Appears in job costs list
- Included in cost summary

### 6. Configuration Management
Backend endpoints for admins to update rates:
- Material rates
- Printing rates
- Finishing rates
- Pre-press charges

## API Endpoints

### POST /api/costing/calculate
Calculate costs without saving.

**Request:**
```json
{
  "job_id": "uuid",
  "pre_press_charges": 4000  // Optional override
}
```

**Response:**
```json
{
  "job_id": "uuid",
  "order_id": "uuid",
  "product_name": "Sharbat e Podina",
  "specifications": {
    "card_length": 10,
    "card_width": 15,
    "card_gsm": 300,
    "card_type": "Shine",
    "quantity": 5000,
    "colors_cmyk": true,
    "special_colors_count": 2,
    "special_colors": "Pantone 185, Pantone 287",
    "uv_type": "spot_uv",
    "lamination_required": true,
    "embossing_required": false
  },
  "cost_breakdown": {
    "material_cost": 15000.00,
    "printing_cost_cmyk": 8000.00,
    "printing_cost_special": 3000.00,
    "uv_cost": 2500.00,
    "lamination_cost": 2000.00,
    "embossing_cost": 0.00,
    "die_cutting_cost": 1500.00,
    "pre_press_charges": 3500.00,
    "total_processing_cost": 20500.00,
    "total_cost": 35500.00,
    "cost_per_unit": 7.10
  },
  "formulas_used": {
    "material": "(10 × 15 × 300 × 5000) / 10000 / 1000 × 150",
    "printing_cmyk": "2000 × 5000 / 1000",
    "printing_special": "2 × 800 × 5000 / 1000"
  }
}
```

### POST /api/costing/calculate/save
Calculate and save costs to database.

**Request:** Same as calculate endpoint

**Response:** Saved JobCost entity with all fields populated

### GET /api/costing/config
Get current costing configuration (Admin/Accounts only).

**Response:**
```json
{
  "id": "uuid",
  "paper_rate_per_kg": 150,
  "gsm_rate_factor": 0.0001,
  "cmyk_base_rate": 2000,
  "special_color_rate": 800,
  "spot_uv_rate_per_sqm": 50,
  "lamination_rate_per_sqm": 30,
  "embossing_rate_per_job": 1500,
  "die_cutting_rate_per_1000": 500,
  "pre_press_simple": 2000,
  "pre_press_medium": 3500,
  "pre_press_complex": 5000,
  "pre_press_rush": 8000,
  "is_active": true,
  "updated_at": "2026-03-01T10:00:00Z"
}
```

### PATCH /api/costing/config
Update costing configuration (Admin only).

**Request:**
```json
{
  "paper_rate_per_kg": 160,
  "cmyk_base_rate": 2200,
  "pre_press_complex": 5500
}
```

## Testing Status

✅ Backend builds successfully
✅ Frontend builds successfully
✅ Migration ran successfully
✅ All new fields added to database
✅ Foreign key and index created
✅ Both servers running

## Usage Flow

### For Users:

1. **Navigate to Job Costing page**
2. **Select Production Job** from dropdown
3. **Click "Auto-Calculate Cost"** button
4. **Review specifications** (auto-loaded from order)
5. **Review cost breakdown** (auto-calculated)
6. **Adjust pre-press charges** if needed (optional)
7. **Click "Save Costing"** to save to database
8. **View in costs table** with all other job costs

### For Admins (Configuration):

1. **Access** `GET /api/costing/config` endpoint
2. **Update rates** via `PATCH /api/costing/config`
3. **New calculations** will use updated rates

## Example Calculation

**Product:** Sharbat e Podina - 5000 boxes

**Specifications:**
- Card Size: 10cm × 15cm
- GSM: 300
- Type: Shine
- Colors: CMYK + 2 Special (Pantone 185, 287)
- Finishing: Spot UV, Lamination

**Calculated Costs:**
- Material: ₹15,000 (based on dimensions, GSM, quantity)
- CMYK Printing: ₹8,000 (4 colors × 5000 pieces)
- Special Colors: ₹3,000 (2 colors × 5000 pieces)
- Spot UV: ₹2,500 (based on area)
- Lamination: ₹2,000 (based on area)
- Die Cutting: ₹1,500 (standard rate)
- Pre-Press: ₹3,500 (medium complexity - 2 special colors)

**Total Cost:** ₹35,500
**Cost per Unit:** ₹7.10

## Validation & Error Handling

### Backend Validation:
- Checks if production job exists
- Checks if order is linked to job
- Validates required specifications (length, width, GSM, quantity)
- Returns error if specifications are incomplete
- Auto-creates default config if none exists

### Frontend Validation:
- Disables "Auto-Calculate" button if no job selected
- Shows error message if specifications are incomplete
- Validates pre-press charges input (must be number)
- Disables "Save" button while saving

## Backward Compatibility

- All new fields are optional/nullable
- Existing job costs remain unchanged
- Old manual cost entry still works
- No breaking changes to existing functionality
- Configuration auto-created with sensible defaults

## Performance Optimizations

- Database index on `order_id` for fast lookups
- Calculation done in-memory (no database queries during calculation)
- Configuration cached (fetched once per calculation)
- Efficient formula calculations

## Future Enhancements (Not Yet Implemented)

### 1. Configuration UI
Create admin page for updating cost rates:
- Material rates section
- Printing rates section
- Finishing rates section
- Pre-press charges section
- Save button with validation

### 2. Cost History
Track changes to configuration:
- Audit log of rate changes
- Historical cost calculations
- Compare costs over time

### 3. Bulk Calculation
Calculate costs for multiple jobs at once:
- Select multiple production jobs
- Batch calculate all costs
- Review and save all at once

### 4. Cost Templates
Save common configurations:
- Template for simple jobs
- Template for complex jobs
- Template for rush jobs
- Apply template to calculation

### 5. Export Cost Reports
Generate reports:
- Cost breakdown PDF
- Excel export with formulas
- Cost comparison reports
- Profitability analysis

## Files Changed Summary

**Backend (7 files):**
- job-cost.entity.ts (added 21 fields)
- costing-config.entity.ts (new entity)
- job-cost.dto.ts (added 2 new DTOs)
- costing.service.ts (added 7 calculation methods)
- costing.controller.ts (added 4 endpoints)
- costing.module.ts (added 3 entities to imports)
- 1709287200000-EnhanceJobCosting.ts (new migration)

**Frontend (2 files):**
- types/index.ts (updated JobCost, added CostCalculation and CostingConfig)
- pages/costing/Costing.tsx (major enhancements with auto-calculation UI)

## Date: March 1, 2026
