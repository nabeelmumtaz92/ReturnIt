import { useState, useEffect } from "react";

interface User {
  id: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  isDriver: boolean;
  isAdmin: boolean;
  tutorialCompleted?: boolean;
  phone?: string;
  driverRating?: number;
  totalEarnings?: number;
  completedDeliveries?: number;
}

const STORAGE_KEY = 'returnit_auth_user';
const AUTH_TIMESTAMP_KEY = 'returnit_auth_timestamp';

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    // Try to load user from localStorage on initialization
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem(STORAGE_KEY);
        const timestamp = localStorage.getItem(AUTH_TIMESTAMP_KEY);
        
        // Check if auth data is recent (within 30 days)
        if (savedUser && timestamp) {
          const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
          if (parseInt(timestamp) > thirtyDaysAgo) {
            return JSON.parse(savedUser);
          }
        }
      } catch {
        // Clear invalid data
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(AUTH_TIMESTAMP_KEY);
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);

  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok && mounted) {
          const userData = await response.json();
          console.log('Auth check successful, user data:', userData);
          setUser(userData);
          setIsAuthenticated(true);
          
          // Persist user data and timestamp
          localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
          localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());
          
          // Check if this is after OAuth and redirect admin users
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('oauth') === 'success' && userData.isAdmin) {
            console.log('OAuth success detected for admin user, redirecting to dashboard');
            window.location.replace('/admin-dashboard');
          }
        } else if (mounted) {
          // Don't clear admin users - they use client-side auth
          const adminEmails = ['nabeelmumtaz92@gmail.com', 'nabeelmumtaz4.2@gmail.com'];
          if (user?.isAdmin && adminEmails.includes(user?.email)) {
            console.log('Admin user detected - keeping client-side auth');
            setIsLoading(false);
            return;
          }
          
          // Only clear if we have no stored user, or if it's a 401/403 error
          if (!user || response.status === 401 || response.status === 403) {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(AUTH_TIMESTAMP_KEY);
          }
        }
      } catch (error) {
        // Don't clear admin users on network errors
        const adminEmails = ['nabeelmumtaz92@gmail.com', 'nabeelmumtaz4.2@gmail.com'];
        if (user?.isAdmin && adminEmails.includes(user?.email)) {
          console.log('Admin user detected - keeping auth despite network error');
          setIsLoading(false);
          return;
        }
        
        // Don't clear stored user on network errors - maintain offline experience  
        if (mounted && !user) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Check auth if we don't have a stored user
    if (!user) {
      checkAuth();
    } else {
      // We have stored user, just validate in background
      setIsLoading(false);
      
      // Skip server validation for admin users - they use client-side auth
      const adminEmails = ['nabeelmumtaz92@gmail.com', 'nabeelmumtaz4.2@gmail.com'];
      if (user.isAdmin && adminEmails.includes(user.email)) {
        console.log('Admin user from localStorage - skipping server check');
      } else {
        checkAuth();
      }
    }

    return () => {
      mounted = false;
    };
  }, [user]);

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(AUTH_TIMESTAMP_KEY);
    
    // Clear session on server
    fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include'
    }).catch(console.error);
    
    // Redirect to home page after logout
    window.location.href = '/';
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };
}