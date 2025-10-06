import authService from './auth-service';

const API_BASE_URL = 'https://returnit.online';

class APIClient {
  async request(endpoint, options = {}) {
    const token = authService.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token && token !== 'session-based') {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Driver-specific methods
  async getAvailableJobs() {
    const response = await this.get('/api/driver/available-orders');
    return response.orders || [];
  }

  async getNearbyOrders(radius = 15, limit = 20) {
    const response = await this.get(`/api/driver/nearby-orders?radius=${radius}&limit=${limit}`);
    return response;
  }

  async acceptOrder(orderId) {
    return this.post(`/api/driver/orders/${orderId}/accept`, {});
  }
}

export default new APIClient();
