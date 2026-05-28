// src/api/axios.js — Axios instance with JWT interceptors
import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Request interceptor — attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gemledger_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('gemledger_token');
      localStorage.removeItem('gemledger_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const message = error.response?.data?.message || 'An unexpected error occurred.';
    // Don't show toast for login errors — handled by the form
    if (error.response?.status !== 401 && error.config?.url !== '/auth/login') {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
