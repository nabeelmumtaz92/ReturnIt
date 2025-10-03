import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://returnit.online';

class AuthService {
  constructor() {
    this.user = null;
    this.token = null;
    this.listeners = [];
  }

  async initialize() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userJson = await AsyncStorage.getItem('user');
      
      if (token && userJson) {
        this.token = token;
        this.user = JSON.parse(userJson);
        this.notifyListeners('login', this.user);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    }
  }

  addAuthListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners(event, user) {
    this.listeners.forEach(listener => listener(event, user));
  }

  isAuthenticated() {
    return !!this.user && !!this.token;
  }

  getUser() {
    return this.user;
  }

  getToken() {
    return this.token;
  }

  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      
      this.user = data.user;
      this.token = data.token || 'session-based';
      
      await AsyncStorage.setItem('authToken', this.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      
      this.notifyListeners('login', this.user);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.token}` },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.user = null;
      this.token = null;
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      this.notifyListeners('logout', null);
    }
  }

  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      
      this.user = data.user;
      this.token = data.token || 'session-based';
      
      await AsyncStorage.setItem('authToken', this.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      
      this.notifyListeners('login', this.user);
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
}

export default new AuthService();
