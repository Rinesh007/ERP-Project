// services/invoice.service.js — Transactional invoice creation using the calculation engine
'use strict';

const pool = require('../config/db');
const { generateInvoiceNumber } = require('../utils/generateCode');
const { calculateInvoice } = require('./invoiceCalculator');

/**
 * Create an invoice with its line items inside a single DB transaction.
 *
 * @param {Object} invoiceData
 * @param {number}  invoiceData.customer_id
 * @param {string}  invoiceData.invoice_date   — YYYY-MM-DD
 * @param {number}  [invoiceData.paid_amount=0]
 * @param {number}  [invoiceData.adjustment=0]
 * @param {number}  invoiceData.created_by     — user ID
 * @param {Array}   invoiceData.items          — raw items from API payload
 */
const createInvoiceWithItems = async (invoiceData) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // ── 1. Run the full calculation pipeline ─────────────────────────────
    const {
      processedItems,
      subtotal,
      taxableAmount,
      vatAmount,
      extraTax,
      adjustmentAmount,
      grandTotal,
      paymentReceived,
      balance,
      kycRequired,
    } = calculateInvoice({
      items:       invoiceData.items || [],
      paid_amount: invoiceData.paid_amount || 0,
      adjustment:  invoiceData.adjustment  || 0,
    });

    // ── 2. Generate invoice number ────────────────────────────────────────
    const invoice_number = await generateInvoiceNumber();

    // ── 3. Insert invoice header ──────────────────────────────────────────
    const [invoiceResult] = await conn.query(
      `INSERT INTO invoices
         (invoice_number, customer_id, invoice_date,
          subtotal, vat_amount, extra_tax, adjustment_amount,
          grand_total, payment_received, balance, kyc_required,
          created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoice_number,
        invoiceData.customer_id,
        invoiceData.invoice_date,
        subtotal,
        vatAmount,
        extraTax,
        adjustmentAmount,
        grandTotal,
        paymentReceived,
        balance,
        kycRequired ? 1 : 0,
        invoiceData.created_by,
      ]
    );

    const invoice_id = invoiceResult.insertId;

    // ── 4. Insert invoice items ───────────────────────────────────────────
    for (const item of processedItems) {
      await conn.query(
        `INSERT INTO invoice_items
           (invoice_id, item_name, weight, converted_weight,
            rate, making_charge, discount, line_total, product_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          invoice_id,
          item.item_name,
          item.weight,
          item.converted_weight,
          item.rate,
          item.making_charge,
          item.discount,
          item.line_total,
          item.product_id || null,
        ]
      );
    }

    await conn.commit();

    // ── 5. Return created invoice with items ─────────────────────────────
    const [invoice] = await conn.query(
      `SELECT i.*,
              c.name AS customer_name, c.customer_code,
              c.phone, c.pan_number, c.address
       FROM invoices i
       JOIN customers c ON i.customer_id = c.id
       WHERE i.id = ?`,
      [invoice_id]
    );

    const [invoiceItems] = await conn.query(
      `SELECT ii.*,
              p.name AS product_name, p.product_code
       FROM invoice_items ii
       LEFT JOIN products p ON ii.product_id = p.id
       WHERE ii.invoice_id = ?`,
      [invoice_id]
    );

    return {
      invoice: invoice[0],
      items:   invoiceItems,
      // Expose calculated totals for the response body
      totals: {
        subtotal,
        taxableAmount,
        vatAmount,
        extraTax,
        adjustmentAmount,
        grandTotal,
        paymentReceived,
        balance,
        kycRequired,
      },
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = { createInvoiceWithItems };
