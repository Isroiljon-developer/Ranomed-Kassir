const BASE_URL = 'http://localhost:9000/api';

const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Server xatosi');
      return data;
    } catch (error) {
      throw error;
    }
  },
  get(endpoint) { return this.request(endpoint, { method: 'GET' }); },
  post(endpoint, body) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }); },
  put(endpoint, body) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }); },
  delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); }
};

export default api;
