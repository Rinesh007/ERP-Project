// backend/database/seed.js — Generate bcrypt hash for default admin & seed DB
// Run: node database/seed.js
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Hash password
    const hash = await bcrypt.hash('Admin@1234', 10);
    console.log('Generated hash for Admin@1234:', hash);

    // Insert admin user (ignore if already exists)
    await pool.query(
      'INSERT IGNORE INTO users (name, email, password) VALUES (?, ?, ?)',
      ['Admin', 'admin@gemledger.com', hash]
    );
    console.log('✅ Admin user seeded: admin@gemledger.com / Admin@1234');

    // Sample customers
    const customers = [
      ['CUST-0001', 'Sita Sharma', '9841000001', '123456789', 'Kathmandu, Nepal'],
      ['CUST-0002', 'Ram Prasad', '9841000002', '987654321', 'Lalitpur, Nepal'],
      ['CUST-0003', 'Gita Thapa', '9841000003', '456789123', 'Bhaktapur, Nepal'],
    ];
    for (const c of customers) {
      await pool.query(
        'INSERT IGNORE INTO customers (customer_code, name, phone, pan_number, address) VALUES (?, ?, ?, ?, ?)',
        c
      );
    }
    console.log('✅ Sample customers seeded');

    // Sample products
    const products = [
      ['PROD-0001', 'Gold Necklace 22K', 'Gold Jewelry', 85000, 10],
      ['PROD-0002', 'Silver Ring', 'Silver Jewelry', 3500, 25],
      ['PROD-0003', 'Diamond Earrings', 'Diamond Jewelry', 250000, 5],
      ['PROD-0004', 'Gold Bangle Set', 'Gold Jewelry', 65000, 8],
      ['PROD-0005', 'Pearl Necklace', 'Gemstone Jewelry', 18000, 12],
    ];
    for (const p of products) {
      await pool.query(
        'INSERT IGNORE INTO products (product_code, name, category, price, stock) VALUES (?, ?, ?, ?, ?)',
        p
      );
    }
    console.log('✅ Sample products seeded');

    console.log('\n🎉 Database seeded successfully!');
    console.log('   Login: admin@gemledger.com / Admin@1234');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
