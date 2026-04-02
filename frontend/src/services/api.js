import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Public
export const submitComplaint = (data) => api.post('/complaints', data);
export const trackComplaint = (id) => api.get(`/complaints/${id}`);
export const submitFeedback = (id, rating, feedback) => api.put(`/complaints/${id}/feedback`, { rating, feedback });
export const reopenComplaint = (id, reason) => api.post(`/complaints/${id}/reopen`, { reason });

// Auth
export const login = (data) => api.post('/auth/login', data);

// Admin
export const getAdminComplaints = (params) => api.get('/complaints/admin/all', { params });
export const getWorkerStats = () => api.get('/complaints/admin/worker-stats');
export const assignComplaint = (id, authorityId) => api.put(`/complaints/${id}/assign`, { authorityId });
export const verifyComplaint = (id, action) => api.put(`/complaints/${id}/verify`, { action });

// Worker
export const getWorkerComplaints = () => api.get('/complaints/worker/assigned');
export const setInProgress = (id) => api.put(`/complaints/${id}/status`, { status: 'In Progress' });
export const markWorkDone = (id, formData) => api.post(`/complaints/${id}/work-done`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Shared
export const updateStatus = (id, status) => api.put(`/complaints/${id}/status`, { status });
export const addComment = (id, text) => api.post(`/complaints/${id}/comment`, { text });

export default api;
