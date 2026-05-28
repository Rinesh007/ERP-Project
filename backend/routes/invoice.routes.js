// routes/invoice.routes.js
const express = require('express');
const router = express.Router();
const {
  getAllInvoices,
  getStats,
  getMonthlyRevenue,
  getRecentInvoices,
  getNextInvoiceNumber,
  getInvoiceById,
  createInvoice,
} = require('../controllers/invoice.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

// Specific routes MUST come before parameterized routes
router.get('/stats', getStats);
router.get('/monthly', getMonthlyRevenue);
router.get('/recent', getRecentInvoices);
router.get('/next-number', getNextInvoiceNumber);

router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);
router.post('/', createInvoice);

module.exports = router;
