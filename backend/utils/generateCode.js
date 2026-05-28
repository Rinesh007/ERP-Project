// utils/generateCode.js — Auto-generate customer codes, product codes, invoice numbers
const pool = require('../config/db');

/**
 * Generate next customer code in format CUST-0001
 */
async function generateCustomerCode() {
  const [rows] = await pool.query(
    'SELECT customer_code FROM customers ORDER BY id DESC LIMIT 1'
  );
  if (rows.length === 0) return 'CUST-0001';
  const last = rows[0].customer_code; // e.g. CUST-0012
  const num = parseInt(last.split('-')[1]) + 1;
  return `CUST-${String(num).padStart(4, '0')}`;
}

/**
 * Generate next product code in format PROD-0001
 */
async function generateProductCode() {
  const [rows] = await pool.query(
    'SELECT product_code FROM products ORDER BY id DESC LIMIT 1'
  );
  if (rows.length === 0) return 'PROD-0001';
  const last = rows[0].product_code; // e.g. PROD-0005
  const num = parseInt(last.split('-')[1]) + 1;
  return `PROD-${String(num).padStart(4, '0')}`;
}

/**
 * Generate next invoice number in format INV-2024-0001
 */
async function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const [rows] = await pool.query(
    `SELECT invoice_number FROM invoices
     WHERE invoice_number LIKE 'INV-${year}-%'
     ORDER BY id DESC LIMIT 1`
  );
  if (rows.length === 0) return `INV-${year}-0001`;
  const last = rows[0].invoice_number; // e.g. INV-2024-0012
  const parts = last.split('-');
  const num = parseInt(parts[2]) + 1;
  return `INV-${year}-${String(num).padStart(4, '0')}`;
}

module.exports = { generateCustomerCode, generateProductCode, generateInvoiceNumber };
