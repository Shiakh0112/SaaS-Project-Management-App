import api from './api';

export const uploadFile = async (file, fieldName = 'file') => {
  const formData = new FormData();
  formData.append(fieldName, file);
  const res = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const res = await api.put('/users/update-profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
};

// ── Subscription ──────────────────────────────────────────────────────────────

export const getSubscriptionStatus = async () => {
  const res = await api.get('/subscription/status');
  return res.data.data;
};

export const createOrder = async (plan) => {
  const res = await api.post('/subscription/create-payment-intent', { plan });
  return res.data.data;
};

export const verifyPayment = async ({ paymentIntentId, plan }) => {
  const res = await api.post('/subscription/verify-payment', { paymentIntentId, plan });
  return res.data.data;
};

export const cancelSubscription = async (reason = '') => {
  const res = await api.post('/subscription/cancel', { reason });
  return res.data.data;
};

export const getPaymentHistory = async () => {
  const res = await api.get('/subscription/history');
  return res.data.data;
};
