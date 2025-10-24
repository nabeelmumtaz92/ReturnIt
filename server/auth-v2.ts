import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import bcrypt from 'bcrypt';
import { z } from 'zod';

// Enhanced authentication system - v2
export class AuthV2 {
  // Login endpoint
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      // Validate input
      const loginSchema = z.object({
        email: z.string().email("Please enter a valid email address"),
        password: z.string().min(1, "Password is required")
      });
      
      const validation = loginSchema.safeParse({ email, password });
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid input",
          errors: validation.error.issues 
        });
      }

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Create session
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        phone: user.phone,
        isDriver: user.isDriver || false,
        isAdmin: user.isAdmin || false,
        firstName: user.firstName,
        lastName: user.lastName
      };

      // Return user data
      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          isDriver: user.isDriver || false,
          isAdmin: user.isAdmin || false,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error) {
      console.error('AuthV2 login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  }

  // Logout endpoint
  static async logout(req: Request, res: Response) {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
          return res.status(500).json({ message: "Logout failed" });
        }
        res.clearCookie('connect.sid');
        res.json({ message: "Logout successful" });
      });
    } catch (error) {
      console.error('AuthV2 logout error:', error);
      res.status(500).json({ message: "Logout failed" });
    }
  }

  // Demo login endpoint
  static async demoLogin(req: Request, res: Response) {
    try {
      // Only allow demo admin in development mode for security
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      // Create demo user session (no database lookup needed)
      const demoUser = {
        id: 999999, // Use a high ID that won't conflict with real users
        email: 'demo@returnit.demo',
        phone: '555-DEMO-USER',
        isDriver: false,
        isAdmin: isDevelopment, // Admin access only in development for security
        firstName: 'Demo',
        lastName: 'User'
      };

      // Create session
      (req.session as any).user = demoUser;

      // Explicitly save session
      req.session.save((err) => {
        if (err) {
          console.error('Demo login session save error:', err);
          return res.status(500).json({ message: "Failed to create demo session" });
        }

        // Return user data
        res.json({
          message: "Demo login successful",
          user: demoUser
        });
      });
    } catch (error) {
      console.error('AuthV2 demo login error:', error);
      res.status(500).json({ message: "Demo login failed" });
    }
  }

  // Get current user
  static async getCurrentUser(req: Request, res: Response) {
    try {
      const sessionUser = (req.session as any)?.user;
      
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Handle demo user (id 999999) - skip database verification
      if (sessionUser.id === 999999) {
        return res.json({
          id: sessionUser.id,
          email: sessionUser.email,
          phone: sessionUser.phone,
          isDriver: sessionUser.isDriver || false,
          isAdmin: sessionUser.isAdmin || false,
          firstName: sessionUser.firstName,
          lastName: sessionUser.lastName
        });
      }

      // Verify user still exists in database
      const user = await storage.getUser(sessionUser.id);
      if (!user) {
        // Clear invalid session
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        phone: user.phone,
        isDriver: user.isDriver || false,
        isAdmin: user.isAdmin || false,
        firstName: user.firstName,
        lastName: user.lastName
      });
    } catch (error) {
      console.error('AuthV2 getCurrentUser error:', error);
      res.status(500).json({ message: "Failed to get user" });
    }
  }

  // Authentication middleware
  static isAuthenticated(req: Request, res: Response, next: NextFunction) {
    const sessionUser = (req.session as any)?.user;
    
    if (!sessionUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Add user to request object
    (req as any).user = sessionUser;
    next();
  }

  // Admin-only middleware
  static isAdmin(req: Request, res: Response, next: NextFunction) {
    const sessionUser = (req.session as any)?.user;
    
    if (!sessionUser || !sessionUser.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    (req as any).user = sessionUser;
    next();
  }

  // Password hashing utility
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Password verification utility
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

// Export routes for easy integration
export const authV2Routes = {
  login: AuthV2.login,
  logout: AuthV2.logout,
  demoLogin: AuthV2.demoLogin,
  getCurrentUser: AuthV2.getCurrentUser,
  isAuthenticated: AuthV2.isAuthenticated,
  isAdmin: AuthV2.isAdmin
};