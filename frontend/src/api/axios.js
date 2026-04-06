// axios.js — Configured Axios instance
import axios from 'axios';

const isDemo = import.meta.env.VITE_DEMO === 'true';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ── Request interceptor: attach JWT ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 globally ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isDemo) {
      localStorage.removeItem('medai_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;