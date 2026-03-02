# Printing Press Domain Knowledge

## Product Types

### cpp_carton - CPP Carton Boxes
Standard carton packaging for pharmaceutical products.

### silvo_blister - Silvo/Blister Foil
Aluminum-based blister packaging. Includes cylinder tracking for printing rollers.
- Additional fields: `cylinder_number`, `cylinder_size`

### bent_foil - Bent Foil
Flexible foil packaging for tablets.
- Additional fields: `foil_thickness`, `tablet_size`

### alu_alu - Alu-Alu
High-barrier aluminum packaging for moisture-sensitive products.
- Additional fields: `foil_thickness`, `punch_size`

## Machine Naming Conventions

### Printing Machines
- **HB1, HB2** - Heidelberg offset printing presses
- Used for: CMYK + Pantone color printing

### Die Cutting
- **Dye 1, Dye 2** - Die cutting machines
- Used for: Cutting printed sheets to shape

### UV Coating
- **UV#1, UV#2** - UV coating machines
- Used for: Spot UV, Full UV, Matt UV finishes

### Lamination
- **LM-1, LM-2** - Lamination machines
- Used for: Shine, Matt, Metalize, Rainbow finishes

### Embossing
- **Emboss-1** - Embossing machine
- Used for: Raised texture effects

## Production Stages

1. **Pre-Press** - CTP plate making, die preparation
2. **Printing** - CMYK + Pantone color application (processes: Cyan, Magenta, Yellow, Black)
3. **Sorting** - Quality check and sheet sorting
4. **UV Application** - Spot UV or Full UV coating
5. **Lamination** - Surface finish application
6. **Embossing** - Texture application
7. **Die-Cutting** - Shape cutting
8. **Pasting** - Box assembly
9. **Final QA** - Quality assurance and packaging

## Color Management

### CMYK Colors
Standard process colors: Cyan, Magenta, Yellow, Black

### Pantone Colors
Up to 4 spot colors: P1, P2, P3, P4
- Used for brand-specific colors that CMYK can't match

## Varnish Types
- `water_base` - Water-based varnish
- `duck` - Duck varnish (high gloss)
- `plain_uv` - Standard UV coating
- `spot_uv` - Selective UV on specific areas
- `drip_off_uv` - UV with matte background effect
- `matt_uv` - Matte finish UV
- `rough_uv` - Textured UV finish
- `none` - No varnish

## Lamination Types
- `shine` - Glossy lamination
- `matt` - Matte lamination
- `metalize` - Metallic finish
- `rainbow` - Holographic effect
- `none` - No lamination
