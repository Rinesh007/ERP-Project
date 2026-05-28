// controllers/customer.controller.js — Customer CRUD handlers
const pool = require('../config/db');
const { generateCustomerCode } = require('../utils/generateCode');

// GET /api/customers
const getAllCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let sql = 'SELECT * FROM customers';
    const params = [];

    if (search) {
      sql += ' WHERE name LIKE ? OR phone LIKE ? OR customer_code LIKE ? OR pan_number LIKE ?';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(sql, params);

    return res.status(200).json({ success: true, data: rows, count: rows.length });
  } catch (err) {
    next(err);
  }
};

// GET /api/customers/:id
const getCustomerById = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// POST /api/customers
const createCustomer = async (req, res, next) => {
  try {
    const { name, phone, pan_number, address } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Customer name is required.' });
    }

    const customer_code = await generateCustomerCode();

    const [result] = await pool.query(
      'INSERT INTO customers (customer_code, name, phone, pan_number, address) VALUES (?, ?, ?, ?, ?)',
      [customer_code, name, phone || null, pan_number || null, address || null]
    );

    const [newCustomer] = await pool.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Customer created successfully.',
      data: newCustomer[0],
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/customers/:id
const updateCustomer = async (req, res, next) => {
  try {
    const { name, phone, pan_number, address } = req.body;
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM customers WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    await pool.query(
      'UPDATE customers SET name = ?, phone = ?, pan_number = ?, address = ? WHERE id = ?',
      [name, phone || null, pan_number || null, address || null, id]
    );

    const [updated] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Customer updated successfully.',
      data: updated[0],
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/customers/:id
const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM customers WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    await pool.query('DELETE FROM customers WHERE id = ?', [id]);

    return res.status(200).json({ success: true, message: 'Customer deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };
