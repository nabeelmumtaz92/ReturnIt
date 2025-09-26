/**
 * Authentication Service for ReturnIt Mobile Apps
 * Handles user authentication, session management, and auth state
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api-client';

// Storage keys
const AUTH_STORAGE_KEYS = {
  IS_AUTHENTICATED: '@returnit_is_authenticated',
  USER_DATA: '@returnit_user_data',
  AUTH_TIMESTAMP: '@returnit_auth_timestamp',
};

// Session duration (24 hours)
const SESSION_DURATION = 24 * 60 * 60 * 1000;

/**
 * Authentication Service Class
 */
class AuthService {
  constructor() {
    this.authListeners = [];
    this.initialized = false;
  }

  /**
   * Initialize auth service and check for existing session
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Check for stored authentication data
      const isAuthenticated = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.IS_AUTHENTICATED);
      const userData = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.USER_DATA);
      const authTimestamp = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.AUTH_TIMESTAMP);

      if (isAuthenticated === 'true' && userData && authTimestamp) {
        const timestamp = parseInt(authTimestamp);
        const now = Date.now();

        // Check if session is still valid (within 24 hours)
        if (now - timestamp < SESSION_DURATION) {
          // Verify session with server
          try {
            const user = await apiClient.getCurrentUser();
            await this.setAuthenticatedUser(user);
            console.log('Session restored for user:', user.email);
          } catch (error) {
            console.log('Session expired or invalid, clearing stored auth');
            await this.clearAuthData();
          }
        } else {
          console.log('Session expired, clearing stored auth');
          await this.clearAuthData();
        }
      }

      this.initialized = true;
    } catch (error) {
      console.error('Auth initialization error:', error);
      await this.clearAuthData();
      this.initialized = true;
    }
  }

  /**
   * Login with email and password
   */
  async login(email, password) {
    try {
      const response = await apiClient.login(email, password);
      
      if (response.user) {
        // Critical: Update auth state before returning
        await this.setAuthenticatedUser(response.user);
        this.notifyAuthListeners('login', response.user);
        
        // Ensure state is fully updated
        console.log('Login successful, auth state updated:', {
          isAuthenticated: this.isAuthenticated(),
          user: response.user.email
        });
        
        return response;
      }

      throw new Error('Login failed - no user data received');
    } catch (error) {
      await this.clearAuthData();
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API fails
    } finally {
      await this.clearAuthData();
      this.notifyAuthListeners('logout', null);
    }
  }

  /**
   * Get current user data
   */
  getCurrentUser() {
    return apiClient.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return apiClient.isAuthenticated;
  }

  /**
   * Check if user is a driver
   */
  isDriver() {
    const user = this.getCurrentUser();
    return user && user.isDriver === true;
  }

  /**
   * Check if user is an admin
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.isAdmin === true;
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    try {
      const response = await apiClient.updateProfile(profileData);
      
      if (response.user) {
        await this.setAuthenticatedUser(response.user);
        this.notifyAuthListeners('profile_updated', response.user);
      }

      return response;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  /**
   * Refresh user data from server
   */
  async refreshUser() {
    try {
      const user = await apiClient.getCurrentUser();
      await this.setAuthenticatedUser(user);
      this.notifyAuthListeners('user_refreshed', user);
      return user;
    } catch (error) {
      console.error('User refresh error:', error);
      await this.clearAuthData();
      this.notifyAuthListeners('session_expired', null);
      throw error;
    }
  }

  /**
   * Set authenticated user and persist to storage
   */
  async setAuthenticatedUser(user) {
    try {
      apiClient.isAuthenticated = true;
      apiClient.currentUser = user;

      // Store in AsyncStorage
      await AsyncStorage.setItem(AUTH_STORAGE_KEYS.IS_AUTHENTICATED, 'true');
      await AsyncStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      await AsyncStorage.setItem(AUTH_STORAGE_KEYS.AUTH_TIMESTAMP, Date.now().toString());

      console.log('User authenticated and stored:', user.email);
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  }

  /**
   * Clear authentication data
   */
  async clearAuthData() {
    try {
      apiClient.isAuthenticated = false;
      apiClient.currentUser = null;

      // Clear AsyncStorage
      await AsyncStorage.multiRemove([
        AUTH_STORAGE_KEYS.IS_AUTHENTICATED,
        AUTH_STORAGE_KEYS.USER_DATA,
        AUTH_STORAGE_KEYS.AUTH_TIMESTAMP,
      ]);

      console.log('Auth data cleared');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  /**
   * Add authentication event listener
   */
  addAuthListener(callback) {
    this.authListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.authListeners = this.authListeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Notify all auth listeners of state changes
   */
  notifyAuthListeners(event, data) {
    this.authListeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Auth listener error:', error);
      }
    });
  }

  /**
   * Check if session is valid (not expired)
   */
  async isSessionValid() {
    try {
      const authTimestamp = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.AUTH_TIMESTAMP);
      
      if (!authTimestamp) return false;

      const timestamp = parseInt(authTimestamp);
      const now = Date.now();

      return (now - timestamp) < SESSION_DURATION;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  /**
   * Get auth headers for API requests
   */
  getAuthHeaders() {
    // Session-based auth doesn't need headers
    // Cookies are handled automatically by fetch with credentials: 'include'
    return {};
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;