import React from 'react';
import {
  Document, Page, Text, View, StyleSheet, Font,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, color: '#1a1a2e', backgroundColor: '#ffffff', padding: 36 },
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  companyBlock: { flex: 1 },
  companyName: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#1a1a2e', marginBottom: 4 },
  companyMeta: { fontSize: 8, color: '#6b7280', lineHeight: 1.5 },
  invoiceTitleBlock: { alignItems: 'flex-end' },
  invoiceTitle: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#4f46e5', marginBottom: 6 },
  invoiceNumberBadge: { backgroundColor: '#f3f4f6', borderRadius: 4, paddingVertical: 4, paddingHorizontal: 10 },
  invoiceNumber: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#374151' },
  // Divider
  divider: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginBottom: 20 },
  // Info Grid
  infoGrid: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  infoBox: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 6, padding: 12 },
  infoBoxTitle: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  infoField: { marginBottom: 5 },
  infoLabel: { fontSize: 7, color: '#9ca3af', marginBottom: 1 },
  infoValue: { fontSize: 9, color: '#1f2937', fontFamily: 'Helvetica-Bold' },
  // Table
  tableContainer: { marginBottom: 20 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1a1a2e', borderRadius: 4, paddingVertical: 7, paddingHorizontal: 10 },
  tableHeaderText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
  tableRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  tableRowAlt: { backgroundColor: '#fafafa' },
  tableCell: { fontSize: 9, color: '#374151' },
  colDesc: { flex: 1 },
  colQty: { width: 60, textAlign: 'right' },
  colPrice: { width: 80, textAlign: 'right' },
  colTotal: { width: 80, textAlign: 'right' },
  // Totals
  totalsSection: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20 },
  totalsBox: { width: 220 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totalLabel: { fontSize: 9, color: '#6b7280' },
  totalValue: { fontSize: 9, color: '#1f2937' },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1.5, borderTopColor: '#4f46e5', paddingTop: 8, marginTop: 4 },
  grandTotalLabel: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1a1a2e' },
  grandTotalValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#4f46e5' },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fef3c7', borderRadius: 4, padding: 6, marginTop: 4 },
  balanceLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#92400e' },
  balanceValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#92400e' },
  // Payments
  paymentsSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#1a1a2e', marginBottom: 8 },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  paymentMeta: { fontSize: 8, color: '#6b7280', flex: 1 },
  paymentAmount: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#059669' },
  // Notes
  notesSection: { backgroundColor: '#f9fafb', borderRadius: 6, padding: 12, marginBottom: 16 },
  notesTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  notesText: { fontSize: 8, color: '#6b7280', lineHeight: 1.5 },
  // Footer
  footer: { borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontSize: 7, color: '#9ca3af' },
  statusBadge: { borderRadius: 10, paddingVertical: 3, paddingHorizontal: 8 },
  statusText: { fontSize: 8, fontFamily: 'Helvetica-Bold' },
});

function fmt(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtPKR(n?: number | string | null) {
  if (n === undefined || n === null) return '—';
  return `PKR ${Number(n).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function methodLabel(m: string) {
  const map: Record<string, string> = {
    cash: 'Cash', bank_transfer: 'Bank Transfer', cheque: 'Cheque', online: 'Online',
  };
  return map[m] || m;
}

function statusColors(s: string): { bg: string; text: string } {
  switch (s) {
    case 'paid': return { bg: '#dcfce7', text: '#15803d' };
    case 'overdue': return { bg: '#fee2e2', text: '#b91c1c' };
    case 'sent': return { bg: '#dbeafe', text: '#1d4ed8' };
    default: return { bg: '#f3f4f6', text: '#374151' };
  }
}

export interface InvoicePDFData {
  invoice: {
    invoice_number: string;
    invoice_date?: string;
    due_date?: string;
    status: string;
    subtotal?: number;
    tax_amount?: number;
    tax_rate?: number;
    total_amount: number;
    paid_amount?: number;
    balance_amount?: number;
    notes?: string;
    payment_terms?: string;
    final_quantity?: number;
    unit_rate?: number;
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
  items?: Array<{ description: string; quantity: number; unit_price: number; total_price: number }>;
  payments?: Array<{ payment_date: string; payment_method: string; amount: number; reference_number?: string; users?: { full_name: string } }>;
}

export function InvoicePDF({ data }: { data: InvoicePDFData }) {
  const { invoice, customer, company, items = [], payments = [] } = data;
  const sc = statusColors(invoice.status);

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
          <View style={styles.invoiceTitleBlock}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <View style={styles.invoiceNumberBadge}>
              <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: sc.bg, marginTop: 6 }]}>
              <Text style={[styles.statusText, { color: sc.text }]}>{invoice.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>Bill To</Text>
            {customer ? (
              <>
                <View style={styles.infoField}>
                  <Text style={[styles.infoValue, { fontSize: 10 }]}>{customer.name}</Text>
                  {customer.company_name && <Text style={styles.infoLabel}>{customer.company_name}</Text>}
                </View>
                {customer.email && <View style={styles.infoField}><Text style={styles.infoLabel}>{customer.email}</Text></View>}
                {customer.phone && <View style={styles.infoField}><Text style={styles.infoLabel}>{customer.phone}</Text></View>}
                {customer.address && <View style={styles.infoField}><Text style={styles.infoLabel}>{customer.address}</Text></View>}
              </>
            ) : <Text style={styles.infoLabel}>—</Text>}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>Invoice Details</Text>
            <View style={styles.infoField}>
              <Text style={styles.infoLabel}>Invoice Date</Text>
              <Text style={styles.infoValue}>{fmt(invoice.invoice_date)}</Text>
            </View>
            <View style={styles.infoField}>
              <Text style={styles.infoLabel}>Due Date</Text>
              <Text style={styles.infoValue}>{fmt(invoice.due_date)}</Text>
            </View>
            {invoice.payment_terms && (
              <View style={styles.infoField}>
                <Text style={styles.infoLabel}>Payment Terms</Text>
                <Text style={styles.infoValue}>{invoice.payment_terms}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Items Table */}
        {items.length > 0 && (
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colDesc]}>Description</Text>
              <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
              <Text style={[styles.tableHeaderText, styles.colPrice]}>Unit Price</Text>
              <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
            </View>
            {items.map((item, i) => (
              <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                <Text style={[styles.tableCell, styles.colDesc]}>{item.description}</Text>
                <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, styles.colPrice]}>{fmtPKR(item.unit_price)}</Text>
                <Text style={[styles.tableCell, styles.colTotal]}>{fmtPKR(item.total_price)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            {invoice.subtotal !== undefined && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>{fmtPKR(invoice.subtotal)}</Text>
              </View>
            )}
            {invoice.tax_amount !== undefined && Number(invoice.tax_amount) > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax ({invoice.tax_rate ?? 0}%)</Text>
                <Text style={styles.totalValue}>{fmtPKR(invoice.tax_amount)}</Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{fmtPKR(invoice.total_amount)}</Text>
            </View>
            {invoice.paid_amount !== undefined && Number(invoice.paid_amount) > 0 && (
              <View style={[styles.totalRow, { marginTop: 4 }]}>
                <Text style={[styles.totalLabel, { color: '#059669' }]}>Paid</Text>
                <Text style={[styles.totalValue, { color: '#059669', fontFamily: 'Helvetica-Bold' }]}>{fmtPKR(invoice.paid_amount)}</Text>
              </View>
            )}
            {invoice.balance_amount !== undefined && Number(invoice.balance_amount) > 0 && (
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Balance Due</Text>
                <Text style={styles.balanceValue}>{fmtPKR(invoice.balance_amount)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Payment History */}
        {payments.length > 0 && (
          <View style={styles.paymentsSection}>
            <Text style={styles.sectionTitle}>Payment History</Text>
            <View style={[styles.tableHeader, { backgroundColor: '#f3f4f6' }]}>
              <Text style={[styles.tableHeaderText, { color: '#6b7280', flex: 1 }]}>Date</Text>
              <Text style={[styles.tableHeaderText, { color: '#6b7280', width: 80 }]}>Method</Text>
              <Text style={[styles.tableHeaderText, { color: '#6b7280', width: 100 }]}>Reference</Text>
              <Text style={[styles.tableHeaderText, { color: '#6b7280', width: 80, textAlign: 'right' }]}>Amount</Text>
            </View>
            {payments.map((p, i) => (
              <View key={i} style={styles.paymentRow}>
                <Text style={[styles.paymentMeta, { flex: 1 }]}>{fmt(p.payment_date)}</Text>
                <Text style={[styles.paymentMeta, { width: 80 }]}>{methodLabel(p.payment_method)}</Text>
                <Text style={[styles.paymentMeta, { width: 100 }]}>{p.reference_number || '—'}</Text>
                <Text style={[styles.paymentAmount, { width: 80, textAlign: 'right' }]}>{fmtPKR(p.amount)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Generated on {new Date().toLocaleDateString('en-PK')}</Text>
          <Text style={styles.footerText}>{company.name} • {invoice.invoice_number}</Text>
          <Text style={styles.footerText}>Thank you for your business</Text>
        </View>
      </Page>
    </Document>
  );
}
