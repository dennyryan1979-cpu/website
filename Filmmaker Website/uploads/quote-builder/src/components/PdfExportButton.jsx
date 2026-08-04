import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { formatCurrency, lineTotal } from '../lib/calculations';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  header: { marginBottom: 20 },
  businessName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  businessDetail: { fontSize: 9, color: '#666' },
  title: { fontSize: 14, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  metaBlock: {},
  metaLabel: { fontSize: 8, color: '#999', textTransform: 'uppercase', marginBottom: 2 },
  metaValue: { fontSize: 10 },
  table: { marginBottom: 16 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ccc', paddingBottom: 4, marginBottom: 4 },
  tableRow: { flexDirection: 'row', paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  colCategory: { width: '12%' },
  colName: { width: '30%' },
  colRate: { width: '14%', textAlign: 'right' },
  colUnit: { width: '8%', textAlign: 'center' },
  colQty: { width: '8%', textAlign: 'center' },
  colDays: { width: '8%', textAlign: 'center' },
  colTotal: { width: '20%', textAlign: 'right' },
  headerText: { fontSize: 8, color: '#999', textTransform: 'uppercase' },
  totalsBox: { marginLeft: 'auto', width: 220, marginTop: 8 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  totalsFinal: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 6, marginTop: 4, borderTopWidth: 1, borderTopColor: '#ccc', fontWeight: 'bold', fontSize: 12 },
  notes: { marginTop: 16, fontSize: 9, color: '#444' },
  notesLabel: { fontWeight: 'bold', marginBottom: 4 },
});

function QuotePdf({ quote, lineItems, totals }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.businessName}>Your Business Name</Text>
          <Text style={styles.businessDetail}>ABN: XX XXX XXX XXX</Text>
          <Text style={styles.businessDetail}>your@email.com | 0400 000 000</Text>
        </View>

        <Text style={styles.title}>Quote</Text>

        <View style={styles.meta}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Client</Text>
            <Text style={styles.metaValue}>{quote.client_name || '—'}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Project</Text>
            <Text style={styles.metaValue}>{quote.project_name || '—'}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Ref</Text>
            <Text style={styles.metaValue}>{quote.quote_ref || '—'}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>{quote.quote_date}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colCategory, styles.headerText]}>Category</Text>
            <Text style={[styles.colName, styles.headerText]}>Item</Text>
            <Text style={[styles.colRate, styles.headerText]}>Rate</Text>
            <Text style={[styles.colUnit, styles.headerText]}>Unit</Text>
            <Text style={[styles.colQty, styles.headerText]}>Qty</Text>
            <Text style={[styles.colDays, styles.headerText]}>Days</Text>
            <Text style={[styles.colTotal, styles.headerText]}>Total</Text>
          </View>
          {lineItems.map((li, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colCategory}>{li.category}</Text>
              <Text style={styles.colName}>{li.name}</Text>
              <Text style={styles.colRate}>{formatCurrency(li.rate)}</Text>
              <Text style={styles.colUnit}>{li.unit}</Text>
              <Text style={styles.colQty}>{li.qty}</Text>
              <Text style={styles.colDays}>{li.unit === 'hour' ? '—' : li.days}</Text>
              <Text style={styles.colTotal}>{formatCurrency(lineTotal(li, quote.day_multiplier))}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBox}>
          {totals.discount > 0 && (
            <View style={styles.totalsRow}>
              <Text>Multi-day discount</Text>
              <Text>−{formatCurrency(totals.discount)}</Text>
            </View>
          )}
          <View style={styles.totalsRow}>
            <Text>Subtotal</Text>
            <Text>{formatCurrency(totals.subtotal)}</Text>
          </View>
          {totals.gst > 0 && (
            <View style={styles.totalsRow}>
              <Text>GST (10%)</Text>
              <Text>{formatCurrency(totals.gst)}</Text>
            </View>
          )}
          <View style={styles.totalsFinal}>
            <Text>Total</Text>
            <Text>{formatCurrency(totals.total)}</Text>
          </View>
        </View>

        {quote.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text>{quote.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

export default function PdfExportButton({ quote, lineItems, totals }) {
  const handleExport = async () => {
    const blob = await pdf(<QuotePdf quote={quote} lineItems={lineItems} totals={totals} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quote-${quote.quote_ref || 'export'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={handleExport} className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
      Export PDF
    </button>
  );
}
