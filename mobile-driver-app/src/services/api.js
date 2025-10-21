import { API_BASE_URL, API_ENDPOINTS } from '../constants/config';

class ApiService {
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Auth
  async login(email, password) {
    return this.request(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email, password, name, phone) {
    return this.request(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify({ email, password, name, phone, role: 'driver' }),
    });
  }

  // Jobs
  async getAvailableJobs(location) {
    const query = new URLSearchParams({
      lat: location.latitude,
      lng: location.longitude,
    });
    return this.request(`${API_ENDPOINTS.JOBS_AVAILABLE}?${query}`);
  }

  async acceptJob(jobId) {
    return this.request(API_ENDPOINTS.JOB_ACCEPT, {
      method: 'POST',
      body: JSON.stringify({ jobId }),
    });
  }

  async completeJob(jobId, photos, signature) {
    return this.request(API_ENDPOINTS.JOB_COMPLETE, {
      method: 'POST',
      body: JSON.stringify({ jobId, photos, signature }),
    });
  }

  // Earnings
  async getEarnings(period = 'week') {
    return this.request(`${API_ENDPOINTS.EARNINGS}?period=${period}`);
  }

  async requestPayout(amount, type = 'instant') {
    return this.request(API_ENDPOINTS.PAYOUT, {
      method: 'POST',
      body: JSON.stringify({ amount, type }),
    });
  }
}

export default new ApiService();
