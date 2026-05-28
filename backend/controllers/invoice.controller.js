// controllers/invoice.controller.js — Invoice CRUD handlers
'use strict';

const pool = require('../config/db');
const { createInvoiceWithItems } = require('../services/invoice.service');
const { generateInvoiceNumber } = require('../utils/generateCode');

// ── GET /api/invoices ─────────────────────────────────────────────────────────
const getAllInvoices = async (req, res, next) => {
  try {
    const { search, from_date, to_date } = req.query;

    let sql = `
      SELECT i.id, i.invoice_number, i.invoice_date,
             i.subtotal, i.vat_amount, i.extra_tax, i.adjustment_amount,
             i.grand_total, i.payment_received, i.balance, i.kyc_required,
             i.created_at,
             c.name AS customer_name, c.customer_code
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (c.name LIKE ? OR i.invoice_number LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s);
    }
    if (from_date) { sql += ' AND i.invoice_date >= ?'; params.push(from_date); }
    if (to_date)   { sql += ' AND i.invoice_date <= ?'; params.push(to_date); }

    sql += ' ORDER BY i.created_at DESC';

    const [rows] = await pool.query(sql, params);
    return res.status(200).json({ success: true, data: rows, count: rows.length });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/invoices/stats ───────────────────────────────────────────────────
const getStats = async (req, res, next) => {
  try {
    const [[{ total_customers }]] = await pool.query('SELECT COUNT(*) AS total_customers FROM customers');
    const [[{ total_products  }]] = await pool.query('SELECT COUNT(*) AS total_products  FROM products');
    const [[{ total_invoices  }]] = await pool.query('SELECT COUNT(*) AS total_invoices  FROM invoices');
    const [[{ total_revenue   }]] = await pool.query(
      'SELECT IFNULL(SUM(grand_total), 0) AS total_revenue FROM invoices'
    );
    const [[{ kyc_pending }]] = await pool.query(
      'SELECT COUNT(*) AS kyc_pending FROM invoices WHERE kyc_required = 1'
    );

    return res.status(200).json({
      success: true,
      data: { total_customers, total_products, total_invoices, total_revenue, kyc_pending },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/invoices/monthly ─────────────────────────────────────────────────
const getMonthlyRevenue = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        DATE_FORMAT(invoice_date, '%Y-%m')        AS month,
        DATE_FORMAT(MIN(invoice_date), '%b %Y')   AS label,
        ROUND(SUM(grand_total), 2)                AS revenue,
        COUNT(*)                                  AS count
      FROM invoices
      WHERE invoice_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(invoice_date, '%Y-%m')
      ORDER BY month ASC
    `);
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/invoices/recent ──────────────────────────────────────────────────
const getRecentInvoices = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT i.id, i.invoice_number, i.invoice_date,
             i.grand_total, i.balance, i.kyc_required,
             c.name AS customer_name
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      ORDER BY i.created_at DESC
      LIMIT 10
    `);
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/invoices/next-number ─────────────────────────────────────────────
const getNextInvoiceNumber = async (req, res, next) => {
  try {
    const invoice_number = await generateInvoiceNumber();
    return res.status(200).json({ success: true, data: { invoice_number } });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/invoices/:id ─────────────────────────────────────────────────────
const getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [invoice] = await pool.query(
      `SELECT i.*,
              c.name AS customer_name, c.customer_code,
              c.phone, c.pan_number, c.address
       FROM invoices i
       JOIN customers c ON i.customer_id = c.id
       WHERE i.id = ?`,
      [id]
    );

    if (invoice.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const [items] = await pool.query(
      `SELECT ii.*,
              p.name AS product_name, p.product_code
       FROM invoice_items ii
       LEFT JOIN products p ON ii.product_id = p.id
       WHERE ii.invoice_id = ?`,
      [id]
    );

    return res.status(200).json({ success: true, data: { ...invoice[0], items } });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/invoices ────────────────────────────────────────────────────────
const createInvoice = async (req, res, next) => {
  try {
    const { customer_id, invoice_date, paid_amount, adjustment, items } = req.body;

    // ── Basic validation ──────────────────────────────────────────────────
    if (!customer_id || !invoice_date) {
      return res.status(400).json({
        success: false,
        message: 'customer_id and invoice_date are required.',
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required.',
      });
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.item_name) {
        return res.status(400).json({
          success: false,
          message: `Item ${i + 1}: item_name is required.`,
        });
      }
      if (!item.weight || parseFloat(item.weight) <= 0) {
        return res.status(400).json({
          success: false,
          message: `Item ${i + 1}: weight must be greater than 0.`,
        });
      }
      if (!item.rate || parseFloat(item.rate) <= 0) {
        return res.status(400).json({
          success: false,
          message: `Item ${i + 1}: rate must be greater than 0.`,
        });
      }
    }

    // ── Create via service (calculates + saves in transaction) ───────────
    const result = await createInvoiceWithItems({
      customer_id:  parseInt(customer_id),
      invoice_date,
      paid_amount:  parseFloat(paid_amount)  || 0,
      adjustment:   parseFloat(adjustment)   || 0,
      items,
      created_by: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: `Invoice ${result.invoice.invoice_number} created successfully.`,
      data: {
        invoice: result.invoice,
        items:   result.items,
        totals:  result.totals,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllInvoices,
  getStats,
  getMonthlyRevenue,
  getRecentInvoices,
  getNextInvoiceNumber,
  getInvoiceById,
  createInvoice,
};
