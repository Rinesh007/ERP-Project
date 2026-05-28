// src/services/customer.service.js
import api from '../api/axios';

export const customerService = {
  getAll: (search = '') =>
    api.get('/customers', { params: search ? { search } : {} }),

  getById: (id) => api.get(`/customers/${id}`),

  create: (data) => api.post('/customers', data),

  update: (id, data) => api.put(`/customers/${id}`, data),

  delete: (id) => api.delete(`/customers/${id}`),
};
