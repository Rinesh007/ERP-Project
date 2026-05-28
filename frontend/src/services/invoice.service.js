// src/services/invoice.service.js
import api from '../api/axios';

export const invoiceService = {
  getAll: (params = {}) => api.get('/invoices', { params }),

  getById: (id) => api.get(`/invoices/${id}`),

  create: (data) => api.post('/invoices', data),

  getStats: () => api.get('/invoices/stats'),

  getMonthly: () => api.get('/invoices/monthly'),

  getRecent: () => api.get('/invoices/recent'),

  getNextNumber: () => api.get('/invoices/next-number'),
};
