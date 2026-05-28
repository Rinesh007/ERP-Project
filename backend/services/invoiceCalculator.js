// services/invoiceCalculator.js — Pure invoice calculation engine
// No DB, no Express. All functions are deterministic and testable.

'use strict';

// ── Configuration ────────────────────────────────────────────────────────────

/**
 * Item categories that attract 13% VAT (Nepal: Diamond, Gem, Stone).
 * All other items (Gold, Silver, etc.) are VAT-exempt.
 */
const VAT_ITEMS = ['Diamond', 'Gem', 'Stone'];

const VAT_RATE        = parseFloat(process.env.VAT_RATE)         || 0.13; // 13%
const EXTRA_TAX_RATE  = parseFloat(process.env.EXTRA_TAX_RATE)   || 0.02; // 2% service charge
const KYC_THRESHOLD   = parseFloat(process.env.KYC_THRESHOLD)    || 500000;
const WEIGHT_DIVISOR  = 11.664; // tola-to-gram conversion

// ── Weight Conversion ────────────────────────────────────────────────────────

/**
 * Convert raw weight (grams) to tola equivalent.
 * Excel formula: weight / 11.664
 * @param {number} weight — raw weight in grams
 * @returns {number} converted weight (4 decimal places)
 */
function convertWeight(weight) {
  return Number((parseFloat(weight) / WEIGHT_DIVISOR).toFixed(4));
}

// ── Line Item Calculation ────────────────────────────────────────────────────

/**
 * Calculate line total for a single sales item.
 * Excel formula: ((weight / 10) * rate) + makingCharge - discount
 *
 * @param {{ weight: number, rate: number, making_charge: number, discount: number }} item
 * @returns {number} line total (2 decimal places)
 */
function calculateLineTotal(item) {
  const w  = parseFloat(item.weight)        || 0;
  const r  = parseFloat(item.rate)          || 0;
  const mc = parseFloat(item.making_charge) || 0;
  const d  = parseFloat(item.discount)      || 0;

  const total = ((w / 10) * r) + mc - d;
  return Number(Math.max(0, total).toFixed(2));
}

// ── Subtotal ─────────────────────────────────────────────────────────────────

/**
 * Sum all processed item line_totals.
 * @param {Array<{ line_total: number }>} items
 * @returns {number}
 */
function calculateSubtotal(items) {
  return Number(
    items.reduce((sum, item) => sum + parseFloat(item.line_total || 0), 0).toFixed(2)
  );
}

// ── VAT ──────────────────────────────────────────────────────────────────────

/**
 * Sum line totals for VAT-applicable items only.
 * Matches item_name against the VAT_ITEMS list (case-insensitive contains).
 * @param {Array<{ item_name: string, line_total: number }>} items
 * @returns {number} taxable amount
 */
function calculateTaxableAmount(items) {
  return Number(
    items
      .filter(item =>
        VAT_ITEMS.some(v => (item.item_name || '').toLowerCase().includes(v.toLowerCase()))
      )
      .reduce((sum, item) => sum + parseFloat(item.line_total || 0), 0)
      .toFixed(2)
  );
}

/**
 * Calculate VAT on the taxable amount.
 * @param {number} taxableAmount
 * @param {number} [rate=VAT_RATE]
 * @returns {number} VAT amount (2 decimal places)
 */
function calculateVAT(taxableAmount, rate = VAT_RATE) {
  return Number((parseFloat(taxableAmount) * rate).toFixed(2));
}

// ── Extra Tax / Service Charge ────────────────────────────────────────────────

/**
 * Calculate extra tax (service charge) on the subtotal.
 * @param {number} subtotal
 * @param {number} [rate=EXTRA_TAX_RATE]
 * @returns {number}
 */
function calculateExtraTax(subtotal, rate = EXTRA_TAX_RATE) {
  return Number((parseFloat(subtotal) * rate).toFixed(2));
}

// ── Grand Total ───────────────────────────────────────────────────────────────

/**
 * Compute grand total (rounded to nearest rupee).
 * Formula: subtotal + vatAmount + extraTax - adjustment
 * @param {{ subtotal: number, vatAmount: number, extraTax: number, adjustment?: number }} params
 * @returns {number} integer grand total
 */
function calculateGrandTotal({ subtotal, vatAmount, extraTax, adjustment = 0 }) {
  const raw =
    parseFloat(subtotal)    +
    parseFloat(vatAmount)   +
    parseFloat(extraTax)    -
    parseFloat(adjustment);
  return Math.round(raw);
}

// ── Payment / Balance ─────────────────────────────────────────────────────────

/**
 * Balance = paidAmount - grandTotal.
 * Positive → customer paid more (change due).
 * Negative → amount still owed.
 * @param {number} grandTotal
 * @param {number} paidAmount
 * @returns {number}
 */
function calculateBalance(grandTotal, paidAmount) {
  return Number((parseFloat(paidAmount) - parseFloat(grandTotal)).toFixed(2));
}

// ── KYC ───────────────────────────────────────────────────────────────────────

/**
 * Flag if KYC documentation is required (transaction ≥ NPR 500,000).
 * @param {number} grandTotal
 * @returns {boolean}
 */
function isKYCRequired(grandTotal) {
  return parseFloat(grandTotal) >= KYC_THRESHOLD;
}

// ── Full Item Processing Pipeline ─────────────────────────────────────────────

/**
 * Process a raw item from the API payload into a fully calculated item.
 * @param {Object} rawItem — { item_name, weight, rate, making_charge, discount, product_id? }
 * @returns {Object} processed item with converted_weight + line_total
 */
function processItem(rawItem) {
  const converted_weight = convertWeight(rawItem.weight || 0);
  const line_total = calculateLineTotal(rawItem);
  return {
    item_name:        rawItem.item_name || '',
    weight:           parseFloat(rawItem.weight)        || 0,
    converted_weight,
    rate:             parseFloat(rawItem.rate)          || 0,
    making_charge:    parseFloat(rawItem.making_charge) || 0,
    discount:         parseFloat(rawItem.discount)      || 0,
    line_total,
    product_id:       rawItem.product_id || null,
  };
}

// ── Master Invoice Calculation ────────────────────────────────────────────────

/**
 * Run the full invoice calculation pipeline.
 * @param {Object} invoiceData
 * @param {Array}  invoiceData.items       — raw items from API payload
 * @param {number} [invoiceData.paid_amount=0]
 * @param {number} [invoiceData.adjustment=0]
 * @returns {Object} fully calculated invoice totals + processed items
 */
function calculateInvoice({ items = [], paid_amount = 0, adjustment = 0 }) {
  const processedItems  = items.map(processItem);
  const subtotal        = calculateSubtotal(processedItems);
  const taxableAmount   = calculateTaxableAmount(processedItems);
  const vatAmount       = calculateVAT(taxableAmount);
  const extraTax        = calculateExtraTax(subtotal);
  const grandTotal      = calculateGrandTotal({ subtotal, vatAmount, extraTax, adjustment });
  const balance         = calculateBalance(grandTotal, paid_amount);
  const kycRequired     = isKYCRequired(grandTotal);

  return {
    processedItems,
    subtotal,
    taxableAmount,
    vatAmount,
    extraTax,
    adjustmentAmount: parseFloat(adjustment) || 0,
    grandTotal,
    paymentReceived:  parseFloat(paid_amount) || 0,
    balance,
    kycRequired,
  };
}

module.exports = {
  // Individual functions (for unit tests / reuse)
  convertWeight,
  calculateLineTotal,
  calculateSubtotal,
  calculateTaxableAmount,
  calculateVAT,
  calculateExtraTax,
  calculateGrandTotal,
  calculateBalance,
  isKYCRequired,
  processItem,
  // Master pipeline
  calculateInvoice,
  // Constants (exposed for frontend mirroring)
  VAT_ITEMS,
  VAT_RATE,
  EXTRA_TAX_RATE,
  KYC_THRESHOLD,
};
