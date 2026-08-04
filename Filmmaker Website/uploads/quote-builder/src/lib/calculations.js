export const GST_RATE = 0.1;

export const DAY_MULTIPLIERS = [
  { label: '1 day (full rate)', value: 1 },
  { label: '2 days (-10%)', value: 0.9 },
  { label: '3-4 days (-20%)', value: 0.8 },
  { label: 'Week 5+ days (-35%)', value: 0.65 },
];

export function lineTotal(item, dayMultiplier) {
  if (item.unit === 'hour') return item.rate * item.qty;
  return item.rate * dayMultiplier * item.qty * (item.days || 1);
}

export function fullLineTotal(item) {
  if (item.unit === 'hour') return item.rate * item.qty;
  return item.rate * item.qty * (item.days || 1);
}

export function calculateQuote(lineItems, dayMultiplier, gstEnabled) {
  const subtotal = lineItems.reduce((sum, item) => sum + lineTotal(item, dayMultiplier), 0);
  const fullSubtotal = lineItems.reduce((sum, item) => sum + fullLineTotal(item), 0);
  const discount = fullSubtotal - subtotal;
  const gst = gstEnabled ? subtotal * GST_RATE : 0;
  const total = subtotal + gst;
  return { subtotal, fullSubtotal, discount, gst, total };
}

export function formatCurrency(n) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
