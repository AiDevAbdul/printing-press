import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, color: '#1a1a2e', backgroundColor: '#ffffff', padding: 36 },
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  companyBlock: { flex: 1 },
  companyName: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#1a1a2e', marginBottom: 4 },
  companyMeta: { fontSize: 8, color: '#6b7280', lineHeight: 1.5 },
  titleBlock: { alignItems: 'flex-end' },
  docTitle: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#0891b2', marginBottom: 6 },
  numberBadge: { backgroundColor: '#f0f9ff', borderRadius: 4, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1, borderColor: '#bae6fd' },
  numberText: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#0c4a6e' },
  divider: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginBottom: 18 },
  // Info row
  infoGrid: { flexDirection: 'row', gap: 14, marginBottom: 20 },
  infoBox: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 6, padding: 12 },
  infoBoxTitle: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  infoField: { marginBottom: 5 },
  infoLabel: { fontSize: 7, color: '#9ca3af', marginBottom: 1 },
  infoValue: { fontSize: 9, color: '#1f2937', fontFamily: 'Helvetica-Bold' },
  // Section
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 14 },
  sectionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#1a1a2e' },
  sectionLine: { flex: 1, height: 1, backgroundColor: '#e5e7eb', marginLeft: 8 },
  // Spec grid
  specGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0, backgroundColor: '#f9fafb', borderRadius: 6, padding: 10, marginBottom: 10 },
  specItem: { width: '33%', marginBottom: 8, paddingRight: 8 },
  specLabel: { fontSize: 7, color: '#9ca3af', marginBottom: 1 },
  specValue: { fontSize: 9, color: '#1f2937', fontFamily: 'Helvetica-Bold' },
  // Tags
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 10 },
  tag: { backgroundColor: '#e0f2fe', borderRadius: 3, paddingVertical: 2, paddingHorizontal: 6 },
  tagText: { fontSize: 7, color: '#0369a1', fontFamily: 'Helvetica-Bold' },
  // Cost table
  costRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  costRowAlt: { backgroundColor: '#fafafa' },
  costLabel: { fontSize: 9, color: '#374151', flex: 1 },
  costValue: { fontSize: 9, color: '#1f2937', width: 100, textAlign: 'right' },
  totalCostRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 2, borderTopColor: '#0891b2', paddingTop: 8, paddingHorizontal: 10, marginTop: 4 },
  totalCostLabel: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#1a1a2e' },
  totalCostValue: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#0891b2' },
  // Notes / Terms
  notesBox: { backgroundColor: '#f9fafb', borderRadius: 6, padding: 12, marginTop: 14 },
  notesTitle: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  notesText: { fontSize: 8, color: '#6b7280', lineHeight: 1.5 },
  // Footer
  footer: { borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 10, marginTop: 16, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 7, color: '#9ca3af' },
  validBadge: { backgroundColor: '#fef3c7', borderRadius: 4, paddingVertical: 3, paddingHorizontal: 8 },
  validText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#92400e' },
});

function fmt(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtPKR(n?: number | string | null) {
  if (n === undefined || n === null || n === 0 || n === '0') return '—';
  return `PKR ${Number(n).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function SpecItem({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === '' || value === false || value === 0) return null;
  const display = typeof value === 'boolean' ? 'Yes' : String(value);
  return (
    <View style={styles.specItem}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{display}</Text>
    </View>
  );
}

export interface QuotationPDFData {
  quotation: {
    quotation_number: string;
    quotation_date?: string;
    valid_until?: string;
    status: string;
    product_name: string;
    product_type?: string;
    quantity?: number;
    unit?: string;
    length?: number;
    width?: number;
    height?: number;
    dimension_unit?: string;
    paper_type?: string;
    gsm?: number;
    double_sheet?: string;
    // Colors
    four_color_process?: boolean;
    inside_printing?: boolean;
    cmyk_cyan?: boolean;
    cmyk_magenta?: boolean;
    cmyk_yellow?: boolean;
    cmyk_black?: boolean;
    color_front?: number;
    color_back?: number;
    pantone_cmyk_1?: string;
    pantone_cmyk_2?: string;
    pantone_cmyk_3?: string;
    pantone_cmyk_4?: string;
    // Finishing
    varnish_type?: string;
    lamination_type?: string;
    embossing?: boolean;
    foiling?: boolean;
    die_cutting?: boolean;
    pasting?: boolean;
    ctp_required?: boolean;
    // Spec details
    bar_code?: string;
    dye_req?: string;
    batch_no_printing?: boolean;
    batch_no?: string;
    mfg_date?: string;
    exp_date?: string;
    mrp_rs?: number;
    bleach_card?: boolean;
    box_board_card?: boolean;
    art_card?: boolean;
    ups?: number;
    paper_ups?: number;
    // Pricing
    material_cost?: number;
    printing_cost?: number;
    finishing_cost?: number;
    pre_press_cost?: number;
    overhead_cost?: number;
    subtotal?: number;
    profit_margin_percent?: number;
    profit_margin_amount?: number;
    discount_percent?: number;
    discount_amount?: number;
    tax_percent?: number;
    tax_amount?: number;
    total_amount?: number;
    notes?: string;
    terms_and_conditions?: string;
  };
  customer?: {
    name: string;
    company_name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  company: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    gstin?: string;
  };
}

export function QuotationPDF({ data }: { data: QuotationPDFData }) {
  const { quotation: q, customer, company } = data;

  const finishingTags: string[] = [];
  if (q.varnish_type && q.varnish_type !== 'none') finishingTags.push(`Varnish: ${q.varnish_type}`);
  if (q.lamination_type && q.lamination_type !== 'none') finishingTags.push(`Lamination: ${q.lamination_type}`);
  if (q.embossing) finishingTags.push('Embossing');
  if (q.foiling) finishingTags.push('Foiling');
  if (q.die_cutting) finishingTags.push('Die Cutting');
  if (q.pasting) finishingTags.push('Pasting');
  if (q.ctp_required) finishingTags.push('CTP');

  const colorTags: string[] = [];
  if (q.four_color_process) colorTags.push('4-Color Process');
  if (q.cmyk_cyan) colorTags.push('Cyan');
  if (q.cmyk_magenta) colorTags.push('Magenta');
  if (q.cmyk_yellow) colorTags.push('Yellow');
  if (q.cmyk_black) colorTags.push('Black');
  if (q.inside_printing) colorTags.push('Inside Printing');
  if (q.pantone_cmyk_1) colorTags.push(`P1: ${q.pantone_cmyk_1}`);
  if (q.pantone_cmyk_2) colorTags.push(`P2: ${q.pantone_cmyk_2}`);
  if (q.pantone_cmyk_3) colorTags.push(`P3: ${q.pantone_cmyk_3}`);
  if (q.pantone_cmyk_4) colorTags.push(`P4: ${q.pantone_cmyk_4}`);

  const hasCosts = q.material_cost || q.printing_cost || q.finishing_cost || q.pre_press_cost || q.overhead_cost || q.total_amount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyBlock}>
            <Text style={styles.companyName}>{company.name}</Text>
            {company.address && <Text style={styles.companyMeta}>{company.address}{company.city ? `, ${company.city}` : ''}</Text>}
            {company.phone && <Text style={styles.companyMeta}>Tel: {company.phone}</Text>}
            {company.email && <Text style={styles.companyMeta}>{company.email}</Text>}
            {company.gstin && <Text style={styles.companyMeta}>GSTIN: {company.gstin}</Text>}
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.docTitle}>QUOTATION</Text>
            <View style={styles.numberBadge}>
              <Text style={styles.numberText}>{q.quotation_number}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>Quote To</Text>
            {customer ? (
              <>
                <Text style={[styles.infoValue, { fontSize: 10, marginBottom: 3 }]}>{customer.name}</Text>
                {customer.company_name && <Text style={styles.infoLabel}>{customer.company_name}</Text>}
                {customer.email && <Text style={styles.infoLabel}>{customer.email}</Text>}
                {customer.phone && <Text style={styles.infoLabel}>{customer.phone}</Text>}
              </>
            ) : <Text style={styles.infoLabel}>—</Text>}
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>Quotation Details</Text>
            <View style={styles.infoField}>
              <Text style={styles.infoLabel}>Quotation Date</Text>
              <Text style={styles.infoValue}>{fmt(q.quotation_date)}</Text>
            </View>
            <View style={styles.infoField}>
              <Text style={styles.infoLabel}>Valid Until</Text>
              <Text style={styles.infoValue}>{fmt(q.valid_until)}</Text>
            </View>
            <View style={styles.infoField}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>{q.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Product Specs */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Product Specifications</Text>
          <View style={styles.sectionLine} />
        </View>
        <View style={styles.specGrid}>
          <SpecItem label="Product Name" value={q.product_name} />
          <SpecItem label="Product Type" value={q.product_type?.replace(/_/g, ' ').toUpperCase()} />
          <SpecItem label="Quantity" value={q.quantity ? `${q.quantity} ${q.unit || ''}` : undefined} />
          <SpecItem label="Dimensions" value={q.length && q.width ? `${q.length} × ${q.width}${q.height ? ` × ${q.height}` : ''} ${q.dimension_unit || 'mm'}` : undefined} />
          <SpecItem label="Paper Type" value={q.paper_type} />
          <SpecItem label="GSM" value={q.gsm} />
          <SpecItem label="Double Sheet" value={q.double_sheet} />
          <SpecItem label="UPS" value={q.ups} />
          <SpecItem label="Paper UPS" value={q.paper_ups} />
          <SpecItem label="Bleach Card" value={q.bleach_card} />
          <SpecItem label="Box Board Card" value={q.box_board_card} />
          <SpecItem label="Art Card" value={q.art_card} />
        </View>

        {/* Colors */}
        {colorTags.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Colors</Text>
              <View style={styles.sectionLine} />
            </View>
            <View style={styles.tagsRow}>
              {colorTags.map((t, i) => (
                <View key={i} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
              ))}
            </View>
          </>
        )}

        {/* Finishing */}
        {finishingTags.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Finishing & Processes</Text>
              <View style={styles.sectionLine} />
            </View>
            <View style={styles.tagsRow}>
              {finishingTags.map((t, i) => (
                <View key={i} style={[styles.tag, { backgroundColor: '#f0fdf4' }]}>
                  <Text style={[styles.tagText, { color: '#15803d' }]}>{t}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Printing Details */}
        {(q.bar_code || q.dye_req || q.batch_no_printing || q.mrp_rs || q.mfg_date || q.exp_date) && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Printing Requirements</Text>
              <View style={styles.sectionLine} />
            </View>
            <View style={styles.specGrid}>
              <SpecItem label="Bar Code" value={q.bar_code} />
              <SpecItem label="Dye Req." value={q.dye_req} />
              <SpecItem label="Batch No. Printing" value={q.batch_no_printing} />
              <SpecItem label="Batch No." value={q.batch_no} />
              <SpecItem label="Mfg Date" value={q.mfg_date ? fmt(q.mfg_date) : undefined} />
              <SpecItem label="Exp Date" value={q.exp_date ? fmt(q.exp_date) : undefined} />
              <SpecItem label="MRP (Rs.)" value={q.mrp_rs} />
            </View>
          </>
        )}

        {/* Pricing */}
        {hasCosts && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pricing Breakdown</Text>
              <View style={styles.sectionLine} />
            </View>
            {[
              { label: 'Material Cost', value: q.material_cost },
              { label: 'Printing Cost', value: q.printing_cost },
              { label: 'Finishing Cost', value: q.finishing_cost },
              { label: 'Pre-Press Cost', value: q.pre_press_cost },
              { label: 'Overhead Cost', value: q.overhead_cost },
            ].filter(r => r.value && Number(r.value) > 0).map((row, i) => (
              <View key={i} style={[styles.costRow, i % 2 === 0 ? styles.costRowAlt : {}]}>
                <Text style={styles.costLabel}>{row.label}</Text>
                <Text style={styles.costValue}>{fmtPKR(row.value)}</Text>
              </View>
            ))}
            {q.profit_margin_amount && Number(q.profit_margin_amount) > 0 && (
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Profit Margin ({q.profit_margin_percent ?? 0}%)</Text>
                <Text style={styles.costValue}>{fmtPKR(q.profit_margin_amount)}</Text>
              </View>
            )}
            {q.discount_amount && Number(q.discount_amount) > 0 && (
              <View style={styles.costRow}>
                <Text style={[styles.costLabel, { color: '#059669' }]}>Discount ({q.discount_percent ?? 0}%)</Text>
                <Text style={[styles.costValue, { color: '#059669' }]}>- {fmtPKR(q.discount_amount)}</Text>
              </View>
            )}
            {q.tax_amount && Number(q.tax_amount) > 0 && (
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Sales Tax ({q.tax_percent ?? 0}%)</Text>
                <Text style={styles.costValue}>{fmtPKR(q.tax_amount)}</Text>
              </View>
            )}
            <View style={styles.totalCostRow}>
              <Text style={styles.totalCostLabel}>Total Amount</Text>
              <Text style={styles.totalCostValue}>{fmtPKR(q.total_amount)}</Text>
            </View>
          </>
        )}

        {/* Notes */}
        {q.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{q.notes}</Text>
          </View>
        )}
        {q.terms_and_conditions && (
          <View style={[styles.notesBox, { marginTop: 8 }]}>
            <Text style={styles.notesTitle}>Terms & Conditions</Text>
            <Text style={styles.notesText}>{q.terms_and_conditions}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Generated on {new Date().toLocaleDateString('en-PK')}</Text>
          <View style={styles.validBadge}>
            <Text style={styles.validText}>Valid Until: {fmt(q.valid_until)}</Text>
          </View>
          <Text style={styles.footerText}>{company.name} • {q.quotation_number}</Text>
        </View>
      </Page>
    </Document>
  );
}
