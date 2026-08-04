import { formatCurrency } from '../lib/calculations';

export default function QuoteTotals({ totals, dayMultiplier }) {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 min-w-[280px]">
      {totals.discount > 0 && (
        <>
          <div className="flex justify-between text-sm py-0.5">
            <span className="text-gray-500">Full rate subtotal</span>
            <span>{formatCurrency(totals.fullSubtotal)}</span>
          </div>
          <div className="flex justify-between text-sm py-0.5 text-green-600">
            <span>Multi-day discount ({Math.round((1 - dayMultiplier) * 100)}%)</span>
            <span>−{formatCurrency(totals.discount)}</span>
          </div>
        </>
      )}
      <div className="flex justify-between text-sm py-0.5">
        <span className="text-gray-500">Subtotal</span>
        <span>{formatCurrency(totals.subtotal)}</span>
      </div>
      {totals.gst > 0 && (
        <div className="flex justify-between text-sm py-0.5">
          <span className="text-gray-500">GST (10%)</span>
          <span>{formatCurrency(totals.gst)}</span>
        </div>
      )}
      <div className="flex justify-between font-semibold text-base pt-2 mt-2 border-t border-gray-300">
        <span>Total</span>
        <span>{formatCurrency(totals.total)}</span>
      </div>
    </div>
  );
}
