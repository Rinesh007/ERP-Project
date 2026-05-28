-- ============================================================
-- GemLedger ERP — Invoice Engine Migration
-- Run this on your MySQL database ONCE before starting the server.
-- All changes are additive (no data is deleted or modified).
-- ============================================================

USE jewelry_erp;

-- ------------------------------------------------------------
-- Extend: invoices table
-- ------------------------------------------------------------
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS extra_tax         DECIMAL(14,2) NOT NULL DEFAULT 0.00 AFTER vat_amount,
  ADD COLUMN IF NOT EXISTS adjustment_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00 AFTER extra_tax,
  ADD COLUMN IF NOT EXISTS payment_received  DECIMAL(14,2) NOT NULL DEFAULT 0.00 AFTER adjustment_amount,
  ADD COLUMN IF NOT EXISTS balance           DECIMAL(14,2) NOT NULL DEFAULT 0.00 AFTER payment_received,
  ADD COLUMN IF NOT EXISTS kyc_required      TINYINT(1)    NOT NULL DEFAULT 0    AFTER balance,
  ADD COLUMN IF NOT EXISTS invoice_date      DATE          NULL                   AFTER customer_id;

-- invoice_date may already exist — safe duplicate guard handled by IF NOT EXISTS above.
-- If your MySQL version does not support IF NOT EXISTS on ALTER TABLE columns,
-- run each ADD COLUMN separately and skip already-existing ones.

-- ------------------------------------------------------------
-- Extend: invoice_items table
-- ------------------------------------------------------------
ALTER TABLE invoice_items
  ADD COLUMN IF NOT EXISTS item_name         VARCHAR(255)  NOT NULL DEFAULT '' AFTER id,
  ADD COLUMN IF NOT EXISTS weight            DECIMAL(12,4) NOT NULL DEFAULT 0  AFTER item_name,
  ADD COLUMN IF NOT EXISTS converted_weight  DECIMAL(12,4) NOT NULL DEFAULT 0  AFTER weight,
  ADD COLUMN IF NOT EXISTS making_charge     DECIMAL(12,2) NOT NULL DEFAULT 0  AFTER rate,
  ADD COLUMN IF NOT EXISTS discount          DECIMAL(12,2) NOT NULL DEFAULT 0  AFTER making_charge,
  ADD COLUMN IF NOT EXISTS line_total        DECIMAL(14,2) NOT NULL DEFAULT 0  AFTER discount;

-- Make product_id nullable (items can now exist without a catalogue product)
ALTER TABLE invoice_items
  MODIFY COLUMN product_id INT NULL DEFAULT NULL;

-- ============================================================
-- Verify
-- ============================================================
-- DESCRIBE invoices;
-- DESCRIBE invoice_items;
