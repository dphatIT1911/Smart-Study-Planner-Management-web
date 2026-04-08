import config from '../config';
// BASE should be the backend API URL. In production, we get it from environment.
// In development, we use '/api' to trigger Vite's proxy.
// ⚠️ IMPORTANT: In production (Render static site), VITE_API_URL MUST be set to the backend URL
// e.g. https://smart-study-backend.onrender.com
// If not set, the app will try to call '/api' which won't work on a static site!

const BASE = config.API_BASE_URL;

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
  async login(formData) {
    const response = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      body: formData, 
    });
    return this.handleResponse(response);
  },

  async register(userData) {
    console.log('Registering with:', userData);
    const response = await fetch(`${BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userData.email,
        name: userData.name,
        password: userData.password,
        timezone: userData.timezone || 'UTC'
      }),
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
    getCalendar: (startDate, endDate) => api.get(`tasks/calendar?start_date=${startDate}&end_date=${endDate}`),
    create: (data) => api.post('tasks/', data),
    update: (id, data) => api.patch(`tasks/${id}`, data),
    delete: (id) => api.delete(`tasks/${id}`),
    markComplete: (id) => api.patch(`tasks/${id}`, { status: 'DONE' }),
  },

  sessions: {
    getAll: () => api.get('sessions/'),
    create: (data) => api.post('sessions/', data),
  },

  analytics: {
    // Backend has /analytics/summary but dashboard needs specific overview
    // We'll calculate mock stats on frontend from the resource lists for now
    getSummary: (userId) => api.get(`analytics/summary?user_id=${userId}&group_by=week`),
  }
};
