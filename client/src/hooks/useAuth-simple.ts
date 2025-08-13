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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok && mounted) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
        } else if (mounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        if (mounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Only check once on mount
    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
  };
}