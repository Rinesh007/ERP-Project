// backend/database/run_migration.js
// Run once: node database/run_migration.js
// Safely adds new columns to invoices + invoice_items (skips if already exist)
require('dotenv').config();
const mysql = require('mysql2/promise');

async function runMigration() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'jewelry_erp',
    multipleStatements: true,
  });

  console.log('✅ Connected to MySQL:', process.env.DB_NAME);

  // Helper: add a column only if it doesn't already exist
  async function addColumnIfMissing(table, column, definition) {
    const [rows] = await conn.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [process.env.DB_NAME, table, column]
    );
    if (rows.length > 0) {
      console.log(`  ⏩  ${table}.${column} already exists — skipped`);
      return;
    }
    await conn.execute(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
    console.log(`  ✅  Added ${table}.${column}`);
  }

  // ── invoices ──────────────────────────────────────────────────────────────
  console.log('\n📋 Migrating: invoices');
  await addColumnIfMissing('invoices', 'extra_tax',         'DECIMAL(14,2) NOT NULL DEFAULT 0.00 AFTER vat_amount');
  await addColumnIfMissing('invoices', 'adjustment_amount', 'DECIMAL(14,2) NOT NULL DEFAULT 0.00 AFTER extra_tax');
  await addColumnIfMissing('invoices', 'payment_received',  'DECIMAL(14,2) NOT NULL DEFAULT 0.00 AFTER adjustment_amount');
  await addColumnIfMissing('invoices', 'balance',           'DECIMAL(14,2) NOT NULL DEFAULT 0.00 AFTER payment_received');
  await addColumnIfMissing('invoices', 'kyc_required',      'TINYINT(1) NOT NULL DEFAULT 0 AFTER balance');

  // ── invoice_items ─────────────────────────────────────────────────────────
  console.log('\n📋 Migrating: invoice_items');
  await addColumnIfMissing('invoice_items', 'item_name',        'VARCHAR(255) NOT NULL DEFAULT "" AFTER id');
  await addColumnIfMissing('invoice_items', 'weight',           'DECIMAL(12,4) NOT NULL DEFAULT 0 AFTER item_name');
  await addColumnIfMissing('invoice_items', 'converted_weight', 'DECIMAL(12,4) NOT NULL DEFAULT 0 AFTER weight');
  await addColumnIfMissing('invoice_items', 'making_charge',    'DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER rate');
  await addColumnIfMissing('invoice_items', 'discount',         'DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER making_charge');
  await addColumnIfMissing('invoice_items', 'line_total',       'DECIMAL(14,2) NOT NULL DEFAULT 0 AFTER discount');

  // Make product_id nullable
  console.log('\n📋 Making invoice_items.product_id nullable...');
  await conn.execute(
    `ALTER TABLE invoice_items MODIFY COLUMN product_id INT NULL DEFAULT NULL`
  );
  console.log('  ✅  product_id is now nullable');

  await conn.end();
  console.log('\n🎉 Migration complete!\n');
}

runMigration().catch((err) => {
  console.error('\n❌ Migration failed:', err.message);
  process.exit(1);
});
