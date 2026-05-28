// controllers/product.controller.js — Product CRUD handlers
const pool = require('../config/db');
const { generateProductCode } = require('../utils/generateCode');

// GET /api/products
const getAllProducts = async (req, res, next) => {
  try {
    const { search } = req.query;
    let sql = 'SELECT * FROM products';
    const params = [];

    if (search) {
      sql += ' WHERE name LIKE ? OR product_code LIKE ? OR category LIKE ?';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(sql, params);

    return res.status(200).json({ success: true, data: rows, count: rows.length });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const { name, category, price, stock } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Product name and price are required.' });
    }

    const product_code = await generateProductCode();

    const [result] = await pool.query(
      'INSERT INTO products (product_code, name, category, price, stock) VALUES (?, ?, ?, ?, ?)',
      [product_code, name, category || null, parseFloat(price), parseInt(stock) || 0]
    );

    const [newProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: newProduct[0],
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const { name, category, price, stock } = req.body;
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await pool.query(
      'UPDATE products SET name = ?, category = ?, price = ?, stock = ? WHERE id = ?',
      [name, category || null, parseFloat(price), parseInt(stock) || 0, id]
    );

    const [updated] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: updated[0],
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await pool.query('DELETE FROM products WHERE id = ?', [id]);

    return res.status(200).json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
