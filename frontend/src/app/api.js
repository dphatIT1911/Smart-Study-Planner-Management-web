import config from '../config';
// BASE should be the backend API URL. In production, we get it from environment.
// In development, we use '/api' to trigger Vite's proxy.
// ⚠️ IMPORTANT: In production (Render static site), VITE_API_URL MUST be set to the backend URL
// e.g. https://smart-study-backend.onrender.com
// If not set, the app will try to call '/api' which won't work on a static site!

const BASE = config.API_BASE_URL?.endsWith('/') 
  ? config.API_BASE_URL.slice(0, -1) 
  : config.API_BASE_URL;

export const api = {
  // Helper to handle response and catch non-JSON errors (like 500)
  async handleResponse(response) {
    const isJson = response.headers.get('content-type')?.includes('application/json');
    if (!response.ok) {
      if (isJson) {
        const error = await response.json();
        throw new Error(error.detail || 'Request failed');
      } else {
        const text = await response.text();
        throw new Error(text.includes('Internal Server Error') ? 'Backend Database Error (500). Please check your .env/db.' : text || 'Server Error');
      }
    }
    return isJson ? response.json() : response.text();
  },

  // Authentication
  async loginWithGoogle(credential) {
    const response = await fetch(`${BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });
    return this.handleResponse(response);
  },

  async getProfile() {
    return this.get(`auth/profile`);
  },

  // Base methods
  async get(endpoint) {
    const token = localStorage.getItem('token');
    const url = endpoint.startsWith('http') ? endpoint : `${BASE}/${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return;
    }
    return this.handleResponse(response);
  },

  async post(endpoint, data) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  },

  async patch(endpoint, data) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE}/${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  },

  async delete(endpoint) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE}/${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return this.handleResponse(response);
  },

  // Specific Resources
  subjects: {
    getAll: () => api.get('subjects/'),
    create: (data) => api.post('subjects/', data),
    update: (id, data) => api.patch(`subjects/${id}`, data),
    delete: (id) => api.delete(`subjects/${id}`),
  },

  tasks: {
    getAll: () => api.get('tasks/'),
    getCalendar: (startDate, endDate) => api.get(`tasks/calendar?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`),
    create: (data) => api.post('tasks/', data),
    update: (id, data) => api.patch(`tasks/${id}`, data),
    delete: (id) => api.delete(`tasks/${id}`),
    markComplete: (id) => api.patch(`tasks/${id}`, { status: 'DONE' }),
  },

  sessions: {
    getAll: () => api.get('sessions/'),
    getRecent: (limit = 5) => api.get(`sessions/?skip=0&limit=${limit}`),
    create: (data) => api.post('sessions/', data),
  },

  analytics: {
    getSummary: (userId) => api.get(`analytics/summary?user_id=${userId}&group_by=week`),
  },

  notifications: {
    getAll: () => api.get('notifications/'),
    markAsRead: (id) => api.patch(`notifications/${id}/read`, {}),
    markAllAsRead: () => api.patch('notifications/read-all', {}),
  }
};
