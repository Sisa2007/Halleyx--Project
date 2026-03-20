import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor ──────────────────────────────────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hally_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────────────────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      console.error(`[API ${status}]`, data?.error || data?.message || 'Server error');
      if (status === 401) localStorage.removeItem('hally_token');
    } else if (error.request) {
      console.error('[API] No response — backend may be offline');
    } else {
      console.error('[API]', error.message);
    }
    return Promise.reject(error);
  }
);

export default API;
export { BASE_URL };
