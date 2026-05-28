// src/components/invoice/InvoiceSummary.jsx — Full invoice calculation breakdown
import { AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

// ── Frontend mirror of backend constants ──────────────────────────────────────
const VAT_ITEMS       = ['Diamond', 'Gem', 'Stone'];
const VAT_RATE        = 0.13;  // 13%
const EXTRA_TAX_RATE  = 0.02;  // 2% service charge
const KYC_THRESHOLD   = 500000;

function calcLineTotal(item) {
  const w  = parseFloat(item.weight)        || 0;
  const r  = parseFloat(item.rate)          || 0;
  const mc = parseFloat(item.making_charge) || 0;
  const d  = parseFloat(item.discount)      || 0;
  return Math.max(0, ((w / 10) * r) + mc - d);
}

const InvoiceSummary = ({ items, paidAmount = 0, adjustment = 0 }) => {
  const validItems = items.filter((i) => i.item_name);

  // Subtotal
  const subtotal = Number(
    validItems.reduce((s, i) => s + (parseFloat(i.line_total) || calcLineTotal(i)), 0).toFixed(2)
  );

  // Taxable amount (VAT items only)
  const taxableAmount = Number(
    validItems
      .filter((i) => VAT_ITEMS.some((v) => (i.item_name || '').toLowerCase().includes(v.toLowerCase())))
      .reduce((s, i) => s + (parseFloat(i.line_total) || calcLineTotal(i)), 0)
      .toFixed(2)
  );

  const vatAmount  = Number((taxableAmount * VAT_RATE).toFixed(2));
  const extraTax   = Number((subtotal * EXTRA_TAX_RATE).toFixed(2));
  const adj        = parseFloat(adjustment) || 0;
  const grandTotal = Math.round(subtotal + vatAmount + extraTax - adj);
  const paid       = parseFloat(paidAmount) || 0;
  const balance    = Number((paid - grandTotal).toFixed(2));
  const kycFlag    = grandTotal >= KYC_THRESHOLD;

  const itemCount = validItems.length;

  return (
    <div className="card p-5 sticky top-0 space-y-4">

      {/* KYC Banner */}
      {kycFlag && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-700">KYC Required</p>
            <p className="text-[10px] text-amber-600 mt-0.5">
              Transaction ≥ NPR 5,00,000. Customer KYC docs required.
            </p>
          </div>
        </div>
      )}

      {/* Heading */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800">Invoice Summary</h3>
        <p className="text-xs text-gray-400 mt-0.5">{itemCount} item{itemCount !== 1 ? 's' : ''} added</p>
      </div>

      {/* Item line previews */}
      {validItems.length > 0 && (
        <div className="space-y-1.5">
          {validItems.map((item, idx) => (
            <div key={idx} className="flex justify-between text-xs text-gray-600">
              <span className="truncate pr-2 max-w-[140px]">
                {item.item_name || `Item ${idx + 1}`}
                {VAT_ITEMS.some((v) => (item.item_name || '').toLowerCase().includes(v.toLowerCase())) && (
                  <span className="ml-1 text-[9px] bg-amber-100 text-amber-600 px-1 rounded">VAT</span>
                )}
              </span>
              <span className="font-medium flex-shrink-0">
                {formatCurrency(parseFloat(item.line_total) || calcLineTotal(item))}
              </span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-1" />
        </div>
      )}

      {/* Breakdown */}
      <div className="space-y-2">

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-800">{formatCurrency(subtotal)}</span>
        </div>

        {taxableAmount > 0 && (
          <div className="flex justify-between text-xs text-gray-500">
            <span>Taxable amount</span>
            <span>{formatCurrency(taxableAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            VAT (13%)
            {taxableAmount === 0 && (
              <span className="ml-1 text-[10px] text-gray-400">(no taxable items)</span>
            )}
          </span>
          <span className="font-medium text-amber-600">{formatCurrency(vatAmount)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Service charge (2%)</span>
          <span className="font-medium text-blue-600">{formatCurrency(extraTax)}</span>
        </div>

        {adj > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Adjustment (−)</span>
            <span className="font-medium text-green-600">−{formatCurrency(adj)}</span>
          </div>
        )}

        {/* Grand Total */}
        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-800">Grand Total</span>
            <span className="text-lg font-bold text-primary-700">{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        {/* Payment / Balance */}
        {paid > 0 && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Paid</span>
              <span className="font-medium text-gray-800">{formatCurrency(paid)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold">
              <span>{balance < 0 ? 'Balance Due' : 'Change'}</span>
              <span className={balance < 0 ? 'text-red-600' : 'text-green-600'}>
                {balance < 0 ? `−${formatCurrency(Math.abs(balance))}` : formatCurrency(balance)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="bg-gray-50 rounded-lg p-3 text-[11px] text-gray-500 space-y-1">
        <p>• Line total = ((weight ÷ 10) × rate) + making charge − discount</p>
        <p>• VAT 13% applies to: {VAT_ITEMS.join(', ')}</p>
        <p>• Service charge 2% on subtotal</p>
        <p>• Grand total is rounded to nearest rupee</p>
      </div>
    </div>
  );
};

export default InvoiceSummary;
