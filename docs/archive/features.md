### 📋 Forms Identified (to digitize in software)

**1. Product Specifications Sheet (CPP001)**
Captures full job specs: Customer, Product Name, Type, Strength, Card Size & GSM, Color details (CMYK + P1–P4 special colors), Varnish type (Water Base, Duck, Plain UV, Spot UV, Drip Off UV, Matt UV, Rough UV), Lamination type (Shine, Matt, Metalize), UV Emboss details, Back Printing, Barcode, Batch No, Price, CTP info, New/Old Die, Emboss film, Lamination size. Also tracks designer, sender, receiver, and dates.

**2. Job Processing Card**
Job ID, Status (In Progress / Complete), Start & Finish Date, Location (section), Ref No., Company name. Contains two tables — Finished Products (Code, Name, Details, Batch No, Finished Qty, Cost%) and Raw Materials used (Code, Product, Details, UM Unit, Batch No, Qty Required). Also has a section-wise production checklist: Cutting → Printing → QC → Coating → Lamination → Embossing → Dye Cutting → Breaking → Paisting, each with Start Date, Finish Date, Signature, Remarks.

**3. Material Demand Slip (CPP 004)**
Date, No., Material Required (list), For Product/Size/Grm, Qty, Used For (Product Name), Customer/Remarks. Essentially an internal material requisition form.

**4. Material Return Form (Form 005)**
Purchase From, Date, No., columns: S.No, Material Name, For Product/Size/Grm, Qty, GRN No., GRN Date, Received On Qty, Remarks/Faulty Detail. Used when material is returned to supplier or store.

**5. Delivery Challan (Form 008)**
Customer Name, Vehicle #, Driver, Date, Send Through, Slip Number, No. (auto serial). Line items: Product Name, Strength, Type, Packing, Qty, Remarks. Dispatched By / Received By signatures.

**6. Raw Material Store Record (Capital Raw Material Store)**
Monthly snapshot: Product Name, Unit, Opening Qty, Received Qty, Issue Qty, Closing Qty. Products tracked include Good Dori, Dye Kapra, Dye Rubber, Rubber Band, SOP, Cotton Tape, Tussi Tap, Fome Tape, Taki, Chanel Putty, Dori Clip, 2CLR Blanket, Cutting Gaz, 1CLR Blanket, G.T.O Blanket.

**7. Bleach Card Receipt & Issue Record**
Monthly store record for Bleach Cards by size (L × W × G). Tracks Opening Balance, Received, Issue, and Closing Balance per card type.

**8. RE 011 Form (Receiving/Returns)**
Columns: No., Nomenclature, Qty, Vendor's Name, Item Condition, Remarks. Used for receiving items from vendors with quality condition check.

---

### 🔄 Order Flow Workflows (to implement in software)

**CPP Order Flow (Carton/Label Packaging)**

*New Order:* Design Section → 3–4 Design Options (with previous box size + additional logos) → Approved Design → QC Approval from Customer → CTP & other prepress requirements → Complete Report → Production stages: Printing (C,M,Y,K,P1,P2) → Varnish/UV → Lamination → Sorting → Embossing → Dye Cutting/Resorting → Paisting → Delivery

*Repeat Order:* Plate Selection → Store → Production

**Silvo / Blister Foil Order Flow**

*New Product:* Design → No. of Colors → Approval with MM Size → Cylinder (send to supplier, approved on, received on) → Printing → Delivery

*Repeat Order:* Cylinder Condition Check → Size → Printing as per previous sample → Delivery

**Bent Foil / Alu-Alu Order Flow**
Order → Size → Tablet Size & Punch Size required → Thickness (Micron) required → Qty

---

### 🏭 Production Stage Details (for Job Tracking)

The production flow with machine tracking needed:

- **Printing** — Machine No. required; C Complete, M Complete status tracking
- **Sorting** — In-Process Sorting & Offline Sorting (Final)
- **UV** — OK status
- **Lamination** — Type: Shine / Matt / Metalize / Rainbow
- **Embossing** — Name (Front or All Sides), Design Emboss, Brill Emboss
- **Dye Cutting** — Select Machine: Kirma Hand Feed #1/#2, Heidelberg #1/#2
- **Breaking** — Day Shift / Night Shift
- **Re-Sorting** — if required
- **Paisting** — Machine #, Day/Night Shift, Paisting Qty, Finished Qty

---

### 📊 Reports Required (from notes)

1. Finance Department Flow Chart / Report
2. Store Department Flow Chart / Report
3. HR Flow Chart
4. Running Process Flow Chart for all departments: Pre-Press → Approval → Plates → UV → Dye → Sorting → Paisting → Delivery

---

### ✅ What to Add to the Software (based on all above)

| Module | Key Features to Add |
|---|---|
| **Job Management** | New Job vs Repeat Order flow, Job Processing Card, Specs Sheet (CPP001) |
| **Pre-Press** | CTP tracking, Drip-Off, Spot UV, Emboss Film, Die management (new/old), Design approval workflow |
| **Production Tracking** | Section-wise status (Cutting→Printing→QC→Coating→Lam→Emboss→Dye→Break→Paist) with machine no., shift, dates, signatures |
| **Store / Inventory** | Raw Material Store register, monthly opening/closing, Material Demand Slip, Material Return Form, Bleach Card ledger |
| **Vendor/GRN** | GRN entry, RE 011 receiving form, item condition tracking |
| **Delivery** | Delivery Challan generation with vehicle, driver, product details |
| **Product Types** | CPP (cartons/labels), Silvo/Blister Foil, Bent Foil, Alu-Alu — each with different workflows |
| **Reports** | Per-department flow reports, job summary, store reports, finance reports |

