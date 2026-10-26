import axios from 'axios';
import { authStore } from '../store/auth.store';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(config => {
  const token = authStore.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      authStore.clearAuth();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then(r => r.data),
};

// Dashboard
export const dashboardApi = {
  getKPIs: (params: Record<string, any>) =>
    api.get('/dashboard/kpis', { params }).then(r => r.data),
  getTimeseries: (params: Record<string, any>) =>
    api.get('/dashboard/timeseries', { params }).then(r => r.data),
  getFunnel: (params: Record<string, any>) =>
    api.get('/dashboard/funnel', { params }).then(r => r.data),
  getAgents: (params: Record<string, any>) =>
    api.get('/dashboard/agents', { params }).then(r => r.data),
  getRecentPayments: (params: Record<string, any>) =>
    api.get('/dashboard/payments/recent', { params }).then(r => r.data),
  getPendingLinks: (params: Record<string, any>) =>
    api.get('/dashboard/links/pending', { params }).then(r => r.data),
  getReportsSummary: (params?: Record<string, any>) =>
    api.get('/dashboard/reports/summary', { params }).then(r => r.data),
  exportCsv: (type: string, params: Record<string, any>) =>
    api
      .get('/dashboard/export/csv', {
        params: { type, ...params },
        responseType: 'blob',
      })
      .then(r => r.data),
};

export function downloadBlob(blobData: Blob | string, filename: string) {
  const blob = blobData instanceof Blob ? blobData : new Blob([blobData], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}
