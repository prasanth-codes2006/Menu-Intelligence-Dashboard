/**
 * API Service — Centralised API calls to the FastAPI backend.
 * 
 * All requests go through this module so that:
 *   1. The base URL is defined in one place
 *   2. Error handling is consistent
 *   3. Components stay clean and focused on UI
 */

const API_BASE_URL = 'http://localhost:8000';

// ---------------------------------------------------------------------------
// Generic fetch helper with error handling
// ---------------------------------------------------------------------------

async function apiFetch(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Could not connect to the backend. Is FastAPI running?');
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Menu Item APIs
// ---------------------------------------------------------------------------

export const menuAPI = {
  getAll: () => apiFetch('/menu/'),
  getById: (id) => apiFetch(`/menu/${id}`),
  create: (data) => apiFetch('/menu/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiFetch(`/menu/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  delete: (id) => apiFetch(`/menu/${id}`, { method: 'DELETE' }),
};

// ---------------------------------------------------------------------------
// Order APIs
// ---------------------------------------------------------------------------

export const ordersAPI = {
  getAll: () => apiFetch('/orders/'),
  getById: (id) => apiFetch(`/orders/${id}`),
  create: (data) => apiFetch('/orders/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiFetch(`/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  delete: (id) => apiFetch(`/orders/${id}`, { method: 'DELETE' }),
};

// ---------------------------------------------------------------------------
// Analytics APIs
// ---------------------------------------------------------------------------

export const analyticsAPI = {
  getSummary: () => apiFetch('/analytics/summary'),
  
  getBestsellers: (params = {}) => {
    const query = new URLSearchParams();
    if (params.start_date) query.set('start_date', params.start_date);
    if (params.end_date) query.set('end_date', params.end_date);
    if (params.item_id) query.set('item_id', params.item_id);
    if (params.limit) query.set('limit', params.limit);
    const qs = query.toString();
    return apiFetch(`/analytics/bestsellers${qs ? '?' + qs : ''}`);
  },

  getLowMargin: (threshold) => {
    const qs = threshold !== undefined ? `?threshold=${threshold}` : '';
    return apiFetch(`/analytics/low-margin${qs}`);
  },

  getLowPerformance: (params = {}) => {
    const query = new URLSearchParams();
    if (params.start_date) query.set('start_date', params.start_date);
    if (params.end_date) query.set('end_date', params.end_date);
    if (params.sales_threshold) query.set('sales_threshold', params.sales_threshold);
    const qs = query.toString();
    return apiFetch(`/analytics/low-performance${qs ? '?' + qs : ''}`);
  },

  getRecommendations: () => apiFetch('/analytics/recommendations'),
};

// ---------------------------------------------------------------------------
// Reports APIs
// ---------------------------------------------------------------------------

export const reportsAPI = {
  getMonthlySales: (year) => {
    const qs = year ? `?year=${year}` : '';
    return apiFetch(`/reports/monthly-sales${qs}`);
  },

  getRevenue: (params = {}) => {
    const query = new URLSearchParams();
    if (params.start_date) query.set('start_date', params.start_date);
    if (params.end_date) query.set('end_date', params.end_date);
    const qs = query.toString();
    return apiFetch(`/reports/revenue${qs ? '?' + qs : ''}`);
  },

  exportCSV: async (reportType = 'revenue', params = {}) => {
    const query = new URLSearchParams({ report_type: reportType });
    if (params.start_date) query.set('start_date', params.start_date);
    if (params.end_date) query.set('end_date', params.end_date);
    
    const response = await fetch(`${API_BASE_URL}/reports/export-csv?${query.toString()}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to export CSV');
    }
    
    // Trigger browser download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_report.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};
