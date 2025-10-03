/**
 * Shared API Client for ReturnIt Mobile Apps
 * Handles HTTP requests, authentication, and error handling
 */

// API Configuration
const API_CONFIG = {
  development: 'http://localhost:5000',
  staging: 'https://returnly.tech', 
  production: 'https://returnit.online'
};

// Get base URL based on environment
const getBaseURL = () => {
  // For development, use localhost
  if (__DEV__) {
    return API_CONFIG.development;
  }
  
  // For production builds, use production URL
  return API_CONFIG.production;
};

const BASE_URL = getBaseURL();

/**
 * HTTP Client Class with session management
 */
class APIClient {
  constructor() {
    this.baseURL = BASE_URL;
    this.sessionCookie = null;
    this.isAuthenticated = false;
    this.currentUser = null;
  }

  /**
   * Make HTTP request with session handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important: Include cookies for session
      ...options,
    };

    // Add body for non-GET requests
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      console.log(`API Request: ${config.method} ${url}`);
      
      const response = await fetch(url, config);
      
      // Handle different response types
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      console.log(`API Response: ${response.status}`, data);

      if (!response.ok) {
        const error = new Error(data.message || `HTTP Error: ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`API Error: ${config.method} ${url}`, error);
      
      // Handle network errors
      if (!error.status) {
        error.message = 'Network error. Please check your connection.';
      }
      
      throw error;
    }
  }

  /**
   * Authentication methods
   */
  async login(email, password) {
    try {
      const response = await this.request('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      if (response.user) {
        this.isAuthenticated = true;
        this.currentUser = response.user;
      }

      return response;
    } catch (error) {
      this.isAuthenticated = false;
      this.currentUser = null;
      throw error;
    }
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      this.isAuthenticated = false;
      this.currentUser = null;
    }
  }

  async getCurrentUser() {
    try {
      const user = await this.request('/api/auth/me');
      this.isAuthenticated = true;
      this.currentUser = user;
      return user;
    } catch (error) {
      this.isAuthenticated = false;
      this.currentUser = null;
      throw error;
    }
  }

  async updateProfile(profileData) {
    const response = await this.request('/api/auth/profile', {
      method: 'PUT',
      body: profileData,
    });

    if (response.user) {
      this.currentUser = response.user;
    }

    return response;
  }

  /**
   * Customer API methods
   */
  async getOrders() {
    return await this.request('/api/orders');
  }

  async createOrder(orderData) {
    return await this.request('/api/orders', {
      method: 'POST',
      body: orderData,
    });
  }

  async getOrder(orderId) {
    return await this.request(`/api/orders/${orderId}`);
  }

  async trackOrder(trackingNumber) {
    return await this.request(`/api/tracking/${trackingNumber}`);
  }

  async getTrackingEvents(trackingNumber) {
    return await this.request(`/api/tracking/${trackingNumber}/events`);
  }

  async validatePromoCode(code, orderTotal) {
    return await this.request('/api/promo/validate', {
      method: 'POST',
      body: { code, orderTotal },
    });
  }

  async createPaymentIntent(orderData) {
    return await this.request('/api/payments/stripe/create-intent', {
      method: 'POST',
      body: orderData,
    });
  }

  /**
   * Driver API methods
   */
  async getAvailableJobs() {
    return await this.request('/api/driver/orders/available');
  }

  async getDriverOrders() {
    return await this.request('/api/driver/orders');
  }

  // New comprehensive driver order management APIs
  async getDriverAssignments() {
    return await this.request('/api/driver/assignments/pending');
  }

  async respondToAssignment(assignmentId, response, location = null) {
    return await this.request(`/api/driver/assignments/${assignmentId}/respond`, {
      method: 'POST',
      body: { 
        response, // 'accept' or 'decline'
        location 
      },
    });
  }

  async acceptJob(orderId) {
    return await this.request(`/api/driver/orders/${orderId}/accept`, {
      method: 'POST',
    });
  }

  async updateOrderStatus(orderId, status, location = null, metadata = null) {
    return await this.request(`/api/driver/orders/${orderId}/status`, {
      method: 'POST',
      body: { 
        status,
        location,
        metadata
      },
    });
  }

  async cancelOrder(orderId, reason, location = null) {
    return await this.request(`/api/driver/orders/${orderId}/cancel`, {
      method: 'POST',
      body: { 
        reason,
        location 
      },
    });
  }

  async getOrderStatusHistory(orderId) {
    return await this.request(`/api/orders/${orderId}/status-history`);
  }

  async getDriverLocationHistory(orderId) {
    return await this.request(`/api/driver/orders/${orderId}/location-history`);
  }

  async updateDriverStatus(status, location = null) {
    return await this.request('/api/driver/status', {
      method: 'PATCH',
      body: { 
        isOnline: status,
        currentLocation: location 
      },
    });
  }

  async updateDriverLocation(location) {
    return await this.request('/api/driver/location', {
      method: 'POST',
      body: { 
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        heading: location.heading,
        speed: location.speed,
        altitude: location.altitude
      },
    });
  }

  async getDriverPayouts() {
    return await this.request('/api/driver/payouts');
  }

  async requestInstantPayout() {
    return await this.request('/api/driver/payout/instant', {
      method: 'POST',
    });
  }

  async getDriverIncentives() {
    return await this.request('/api/driver/incentives');
  }

  async updateDriverPreferences(preferences) {
    return await this.request('/api/driver/preferences', {
      method: 'PATCH',
      body: preferences,
    });
  }

  async completeDriverTutorial() {
    return await this.request('/api/driver/complete-tutorial', {
      method: 'POST',
    });
  }

  async uploadDeliveryPhoto(formData) {
    const url = `${this.baseURL}/api/driver/upload-delivery-photo`;
    
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData, // FormData already has the correct Content-Type
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload photo');
    }

    return await response.json();
  }

  async completeDelivery(orderId, deliveryData) {
    return await this.request(`/api/driver/orders/${orderId}/complete`, {
      method: 'POST',
      body: deliveryData,
    });
  }

  /**
   * Utility methods
   */
  async getHealthStatus() {
    return await this.request('/api/health');
  }

  async getEnvironmentConfig() {
    return await this.request('/api/config/environment');
  }

  // Check if user is authenticated
  get isUserAuthenticated() {
    return this.isAuthenticated && this.currentUser;
  }

  // Get current user data
  get user() {
    return this.currentUser;
  }
}

// Create singleton instance
const apiClient = new APIClient();

export default apiClient;