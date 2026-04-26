import axios from 'axios';
import { getStore } from '../app/storeRegistry';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Helpers — plain action objects (no import from slices needed) ─────────
const setTokensAction = (accessToken, refreshToken) => ({
  type: 'auth/setTokens',
  payload: { accessToken, refreshToken },
});

const clearAuthAction = () => ({
  type: 'auth/clearAuth',
});

// ── Request interceptor ───────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const store = getStore();
    if (store) {
      const token = store.getState().auth.accessToken;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — auto refresh on 401 ───────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const store = getStore();

      if (!store) {
        isRefreshing = false;
        return Promise.reject(error);
      }

      const refreshToken = store.getState().auth.refreshToken;

      if (!refreshToken) {
        store.dispatch(clearAuthAction());
        processQueue(error, null);
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = res.data.data;

        store.dispatch(setTokensAction(accessToken, newRefreshToken));
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        store.dispatch(clearAuthAction());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
