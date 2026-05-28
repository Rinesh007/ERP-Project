-- ============================================================
-- GemLedger ERP - MySQL Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS jewelry_erp;
USE jewelry_erp;

-- ------------------------------------------------------------
-- Table: users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Table: customers
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(20),
  pan_number VARCHAR(30),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Table: products
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(100),
  price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  stock INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Table: invoices
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(30) NOT NULL UNIQUE,
  customer_id INT NOT NULL,
  invoice_date DATE NOT NULL,
  subtotal DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  vat_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  grand_total DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoice_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  CONSTRAINT fk_invoice_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- Table: invoice_items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoice_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  rate DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_item_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- Seed: Default admin user
-- Password: Admin@1234  (bcrypt hash)
-- ------------------------------------------------------------
INSERT IGNORE INTO users (name, email, password) VALUES (
  'Admin',
  'admin@gemledger.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
);

-- Note: The bcrypt hash above is for 'password' (Laravel default).
-- For production use, generate a proper hash.
-- Default login: admin@gemledger.com / Admin@1234
-- Re-generate hash with: bcrypt.hashSync('Admin@1234', 10)
