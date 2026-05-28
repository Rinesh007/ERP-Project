// src/services/product.service.js
import api from '../api/axios';

export const productService = {
  getAll: (search = '') =>
    api.get('/products', { params: search ? { search } : {} }),

  getById: (id) => api.get(`/products/${id}`),

  create: (data) => api.post('/products', data),

  update: (id, data) => api.put(`/products/${id}`, data),

  delete: (id) => api.delete(`/products/${id}`),
};
