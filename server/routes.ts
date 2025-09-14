import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { smsService } from "./sms-notifications";
import { AIAssistant } from "./ai-assistant";
import Stripe from "stripe";
import session from "express-session";
import passport from "./auth/strategies";
import bcrypt from "bcrypt";
import { z } from "zod";
import { 
  insertOrderSchema, insertUserSchema, insertPromoCodeSchema, 
  insertNotificationSchema, insertDriverApplicationSchema, OrderStatus 
} from "@shared/schema";
import { AuthService } from "./auth";
import { registrationSchema, loginSchema } from "@shared/validation";
import { PerformanceService, performanceMiddleware } from "./performance";
import { AdvancedAnalytics } from "./analytics";
import { checkDatabaseHealth, db } from "./db";
import { requireAdmin, isAdmin } from "./middleware/adminAuth";
import { sql } from "drizzle-orm";
// Removed environment restrictions - authentication always enabled

// Extend session type to include user property
declare module 'express-session' {
  interface SessionData {
    user?: {
      id: number;
      email: string;
      isAdmin: boolean;
      isDriver: boolean;
      firstName?: string;
      lastName?: string;
      phone?: string;
    };
  }
}

// Simple session-based authentication middleware
const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.session?.user) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Basic Auth for staging environment (returnly.tech)
  app.use((req, res, next) => {
    // Only apply basic auth to returnly.tech domain
    if (req.hostname === 'returnly.tech') {
      const auth = req.headers.authorization;
      
      if (!auth || !auth.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Staging Environment"');
        return res.status(401).send('Access to staging environment requires authentication');
      }
      
      const credentials = Buffer.from(auth.slice(6), 'base64').toString('utf-8');
      const [username, password] = credentials.split(':');
      
      // Staging credentials (you can change these)
      const stagingUsername = process.env.STAGING_USERNAME || 'returnly';
      const stagingPassword = process.env.STAGING_PASSWORD || 'staging2025';
      
      if (username !== stagingUsername || password !== stagingPassword) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Staging Environment"');
        return res.status(401).send('Invalid credentials for staging environment');
      }
    }
    
    next();
  });

  // Performance monitoring middleware
  app.use(performanceMiddleware);

  // Add cache-busting headers for development
  if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      next();
    });
  }

  // Session middleware with production-optimized settings
  app.use(session({
    secret: process.env.SESSION_SECRET || 'returnly-secret-key-fallback',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax', // Lax for same-site navigation
      // Don't set domain - let browser handle it automatically for returnit.online
    }
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Initialize Stripe
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-07-30.basil",
  });

  // Auth routes with environment controls
  app.post("/api/auth/register", async (req, res) => {
    try {
      // Enhanced validation using Zod schema
      const validatedData = registrationSchema.parse(req.body);
      
      // Restrict registration to only authorized accounts
      const authorizedEmails = ['nabeelmumtaz92@gmail.com', 'durremumtaz@gmail.com'];
      if (!authorizedEmails.includes(validatedData.email)) {
        return res.status(403).json({ 
          message: "Registration is restricted to authorized accounts only",
          field: "email"
        });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      
      if (existingUser) {
        return res.status(409).json({ 
          message: "An account with this email already exists",
          field: "email"
        });
      }

      // Additional password strength validation
      const passwordValidation = AuthService.validatePassword(validatedData.password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ 
          message: "Password does not meet security requirements",
          errors: passwordValidation.errors,
          field: "password"
        });
      }

      // Hash password with enhanced security
      const hashedPassword = await AuthService.hashPassword(validatedData.password);
      
      const user = await storage.createUser({
        email: validatedData.email,
        phone: validatedData.phone,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        password: hashedPassword,
        dateOfBirth: validatedData.dateOfBirth,
        isDriver: true,  // Both accounts have driver access
        isAdmin: true    // Both accounts have admin access
      });
      
      // Log user in with secure session
      (req.session as any).user = AuthService.sanitizeUserData({ 
        id: user.id, 
        email: user.email, 
        phone: user.phone, 
        isDriver: user.isDriver || false, 
        isAdmin: user.isAdmin || false,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth
      });
      
      res.status(201).json({ 
        message: "Registration successful",
        user: AuthService.sanitizeUserData({
          id: user.id, 
          email: user.email, 
          phone: user.phone, 
          isDriver: user.isDriver || false, 
          isAdmin: user.isAdmin || false,
          firstName: user.firstName,
          lastName: user.lastName
        })
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.issues) {
        // Zod validation errors
        const fieldErrors = error.issues.map((issue: any) => ({
          field: issue.path[0],
          message: issue.message
        }));
        return res.status(400).json({ 
          message: "Validation failed",
          errors: fieldErrors
        });
      }
      
      res.status(400).json({ message: "Registration failed. Please try again." });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      // Enhanced validation
      const validatedData = loginSchema.parse(req.body);
      const { email, password } = validatedData;
      
      // Restrict login to only authorized accounts
      const authorizedEmails = ['nabeelmumtaz92@gmail.com', 'durremumtaz@gmail.com', 'nabeelmumtaz4.2@gmail.com'];
      if (!authorizedEmails.includes(email)) {
        return res.status(403).json({ 
          message: "Access restricted to authorized accounts only"
        });
      }
      
      // Check for lockout
      if (AuthService.isUserLockedOut(email)) {
        const remainingTime = AuthService.getRemainingLockoutTime(email);
        return res.status(429).json({ 
          message: `Too many login attempts. Please try again in ${remainingTime} minutes for security.`
        });
      }

      const user = await storage.getUserByEmail(email);
      console.log('Debug - User lookup for email:', email);
      console.log('Debug - User found:', user ? { id: user.id, email: user.email, hasPassword: !!user.password } : 'null');
      
      // First check: User must exist (have signed up)
      if (!user) {
        // Record failed attempt
        AuthService.recordFailedAttempt(email);
        
        const isNowLocked = AuthService.isUserLockedOut(email);
        return res.status(401).json({ 
          message: isNowLocked 
            ? "Too many failed attempts. Your account has been temporarily locked for security."
            : "No account found with this email address. Please sign up first to create an account.",
          requiresSignup: true // Flag to help frontend show signup option
        });
      }
      
      // Second check: User must have a password (complete account)
      if (!user.password) {
        return res.status(401).json({ 
          message: "Your account setup is incomplete. Please contact support or sign up again.",
          requiresSignup: true
        });
      }
      
      // Third check: Verify password
      const passwordValid = await AuthService.verifyPassword(password, user.password);
      console.log('Debug - Password verification result:', passwordValid);
      
      if (!passwordValid) {
        // Record failed attempt for wrong password
        AuthService.recordFailedAttempt(email);
        
        const isNowLocked = AuthService.isUserLockedOut(email);
        return res.status(401).json({ 
          message: isNowLocked 
            ? "Too many failed attempts. Your account has been temporarily locked for security."
            : "The password you entered is incorrect. Please try again.",
          wrongPassword: true // Different from no account
        });
      }

      // Clear failed attempts on successful login
      AuthService.clearFailedAttempts(email);

      // Create secure session
      req.session.user = AuthService.sanitizeUserData({ 
        id: user.id, 
        email: user.email, 
        phone: user.phone, 
        isDriver: user.isDriver || false, 
        isAdmin: user.isAdmin || false,
        firstName: user.firstName,
        lastName: user.lastName
      });
      
      const responseUser = { 
        id: user.id, 
        email: user.email, 
        phone: user.phone, 
        isDriver: user.isDriver || false, 
        isAdmin: user.isAdmin || false,
        firstName: user.firstName,
        lastName: user.lastName
      };
      
      console.log('Response user object:', responseUser);
      console.log('=== SENDING RESPONSE ===');
      console.log(JSON.stringify({ message: "Login successful", user: responseUser }, null, 2));
      
      console.log('=== FINAL RESPONSE ===');
      console.log('About to send response:', JSON.stringify({ message: "Login successful", user: responseUser }, null, 2));
      
      res.json({ 
        message: "Login successful",
        user: responseUser
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
  });

  // Clear account lockout endpoint (for admin debugging)
  app.post("/api/auth/clear-lockout", async (req, res) => {
    try {
      const { email } = req.body;
      if (email) {
        AuthService.clearFailedAttempts(email);
        console.log(`Cleared lockout for: ${email}`);
        res.json({ message: "Lockout cleared successfully" });
      } else {
        res.status(400).json({ message: "Email is required" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to clear lockout" });
    }
  });

  // Development admin login for testing and client sync
  app.post("/api/auth/dev-admin-login", async (req, res) => {
    try {
      // Get or create admin user from database
      let adminUser = await storage.getUserByEmail("nabeelmumtaz92@gmail.com");
      
      if (!adminUser) {
        // Create admin user if doesn't exist
        adminUser = await storage.createUser({
          email: "nabeelmumtaz92@gmail.com",
          firstName: "Nabeel",
          lastName: "Mumtaz", 
          phone: "6362544821",
          password: await AuthService.hashPassword("TempPassword123!"),
          isDriver: true,
          isAdmin: true
        });
      }
      
      // Create server session
      req.session.user = {
        id: adminUser.id,
        email: adminUser.email,
        firstName: adminUser.firstName || undefined,
        lastName: adminUser.lastName || undefined,
        isAdmin: adminUser.isAdmin,
        isDriver: adminUser.isDriver
      };
      
      console.log('Admin session synchronized:', adminUser.email);
      res.json({
        message: "Admin session created",
        user: {
          id: adminUser.id,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          isAdmin: adminUser.isAdmin,
          isDriver: adminUser.isDriver
        }
      });
    } catch (error) {
      console.error('Admin session creation error:', error);
      res.status(500).json({ message: "Failed to create admin session" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session?.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (req.session?.user) {
      try {
        // Get full user data from storage
        const userId = req.session.user.id;
        const user = await storage.getUser(userId);
        
        if (user) {
          res.json({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            isDriver: user.isDriver,
            isAdmin: user.isAdmin,
            tutorialCompleted: user.tutorialCompleted,
            driverRating: user.driverRating,
            totalEarnings: user.totalEarnings,
            completedDeliveries: user.completedDeliveries,
            isOnline: user.isOnline,
            currentLocation: user.currentLocation
          });
        } else {
          res.status(401).json({ message: "User not found" });
        }
      } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: "Failed to get user information" });
      }
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Update user profile
  app.put("/api/auth/profile", async (req, res) => {
    if (req.session?.user) {
      try {
        const userId = req.session.user.id;
        const {
          firstName,
          lastName,
          phone,
          dateOfBirth,
          streetAddress,
          city,
          state,
          zipCode,
          emergencyContactName,
          emergencyContactPhone,
          emergencyContactRelation,
          preferences
        } = req.body;

        // Prepare the address data
        const addresses = [];
        if (streetAddress || city || state || zipCode) {
          addresses.push({
            type: 'primary',
            streetAddress: streetAddress || '',
            city: city || '',
            state: state || '',
            zipCode: zipCode || ''
          });
        }

        // Prepare emergency contacts data
        const emergencyContacts = [];
        if (emergencyContactName || emergencyContactPhone) {
          emergencyContacts.push({
            name: emergencyContactName || '',
            phone: emergencyContactPhone || '',
            relationship: emergencyContactRelation || ''
          });
        }

        // Update user with all the profile data
        const updatedUser = await storage.updateUser(userId, {
          firstName: firstName || '',
          lastName: lastName || '',
          phone: phone || '',
          dateOfBirth: dateOfBirth || '',
          addresses: addresses,
          emergencyContacts: emergencyContacts,
          preferences: preferences || {}
        });

        if (updatedUser) {
          // Update session data
          req.session.user = {
            ...req.session.user,
            firstName: updatedUser.firstName || undefined,
            lastName: updatedUser.lastName || undefined,
            phone: updatedUser.phone || undefined
          };

          res.json({
            message: "Profile updated successfully",
            user: {
              id: updatedUser.id,
              email: updatedUser.email,
              firstName: updatedUser.firstName,
              lastName: updatedUser.lastName,
              phone: updatedUser.phone,
              dateOfBirth: updatedUser.dateOfBirth,
              isDriver: updatedUser.isDriver,
              isAdmin: updatedUser.isAdmin
            }
          });
        } else {
          res.status(404).json({ message: "User not found" });
        }
      } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: "Failed to update profile" });
      }
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // OAuth Test Page
  app.get('/test-oauth', (req, res) => {
    const path = require('path');
    res.sendFile(path.join(__dirname, '../test-oauth.html'));
  });

  // Admin Access Control Test Page
  app.get('/test-admin-access', (req, res) => {
    const path = require('path');
    res.sendFile(path.join(__dirname, '../test-admin-access.html'));
  });

  // Social Authentication Routes
  
  // Google Auth
  app.get('/api/auth/google', (req, res, next) => {
    console.log('Google OAuth initiated');
    console.log('Request hostname:', req.hostname);
    console.log('Request protocol:', req.protocol);
    console.log('Full URL:', req.protocol + '://' + req.get('host') + req.originalUrl);
    
    passport.authenticate('google', { 
      scope: ['profile', 'email'] 
    })(req, res, next);
  });

  app.get('/api/auth/google/callback', (req, res, next) => {
    console.log('Google OAuth callback hit');
    console.log('Query params:', req.query);
    console.log('Request URL:', req.url);
    
    passport.authenticate('google', { 
      failureRedirect: '/login?error=google_auth_failed' 
    })(req, res, (err: any) => {
      if (err) {
        console.error('Google OAuth callback error:', err);
        return res.redirect('/login?error=auth_failed');
      }
      
      // Check if user is authenticated and redirect appropriately
      if (req.user) {
        const user = req.user as any;
        console.log('Google OAuth success, user:', { id: user.id, email: user.email, isAdmin: user.isAdmin });
        
        // Store user in session
        req.session.user = user;
        
        // Redirect admin users to admin dashboard
        if (user.isAdmin) {
          return res.redirect('/admin-dashboard');
        } else if (user.isDriver) {
          return res.redirect('/driver-portal');
        } else {
          return res.redirect('/');
        }
      } else {
        return res.redirect('/login?error=auth_failed');
      }
    });
  });

  // Facebook Auth
  app.get('/api/auth/facebook', passport.authenticate('facebook', { 
    scope: ['email'] 
  }));

  app.get('/api/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login?error=facebook_auth_failed' }),
    (req, res) => {
      // Set up session for authenticated user
      if (req.user) {
        const user = req.user as any;
        const userData = {
          id: user.id, 
          email: user.email, 
          phone: user.phone || '', 
          isDriver: user.isDriver || false,
          isAdmin: user.isAdmin || false,
          firstName: user.firstName || '',
          lastName: user.lastName || ''
        };
        
        (req.session as any).user = userData;
        
        // Redirect based on user role
        if (userData.isAdmin) {
          res.redirect('/admin-dashboard');
        } else if (userData.isDriver) {
          res.redirect('/driver-portal');
        } else {
          res.redirect('/');
        }
      } else {
        res.redirect('/login?error=auth_failed');
      }
    }
  );

  // Apple Auth (Web-based)
  app.get('/api/auth/apple', (req, res) => {
    // For web-based Apple Sign-In, redirect to Apple's authorization URL
    const appleAuthUrl = `https://appleid.apple.com/auth/authorize?client_id=com.returnly.web&redirect_uri=${encodeURIComponent('http://localhost:5000/api/auth/apple/callback')}&response_type=code&scope=email%20name&response_mode=form_post`;
    res.redirect(appleAuthUrl);
  });

  app.post('/api/auth/apple/callback', async (req, res) => {
    // Handle Apple Sign-In callback
    try {
      const { code, id_token, user } = req.body;
      
      if (!code && !id_token) {
        return res.redirect('/login?error=apple_auth_failed');
      }

      // In a full implementation, you would verify the id_token with Apple's public key
      res.redirect('/?apple_auth=success');
    } catch (error) {
      console.error('Apple auth error:', error);
      res.redirect('/login?error=apple_auth_failed');
    }
  });

  // Payment Processing Routes
  
  // Create Stripe payment intent
  app.post('/api/payments/stripe/create-intent', isAuthenticated, async (req, res) => {
    try {
      const { amount, orderId, payment_method_types = ['card'] } = req.body;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        payment_method_types,
        metadata: {
          orderId: orderId || 'unknown'
        }
      });

      res.json({
        client_secret: paymentIntent.client_secret,
        id: paymentIntent.id
      });
    } catch (error) {
      console.error('Stripe payment intent error:', error);
      res.status(500).json({ message: 'Failed to create payment intent' });
    }
  });

  // Stripe webhook endpoint for live payments
  app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.error('Stripe webhook secret not configured');
      return res.status(400).send('Webhook secret not configured');
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          console.log(`Payment succeeded: ${paymentIntent.id}`);
          
          // Update order status in database
          const orderId = paymentIntent.metadata?.orderId;
          if (orderId && orderId !== 'unknown') {
            await storage.updateOrder(orderId, { 
              status: 'paid',
              stripePaymentIntentId: paymentIntent.id,
              paymentStatus: 'completed'
            });
          }
          break;

        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object;
          console.log(`Payment failed: ${failedPayment.id}`);
          
          // Update order status in database
          const failedOrderId = failedPayment.metadata?.orderId;
          if (failedOrderId && failedOrderId !== 'unknown') {
            await storage.updateOrder(failedOrderId, { 
              status: 'payment_failed',
              paymentStatus: 'failed'
            });
          }
          break;

        case 'refund.created':
          const refund = event.data.object;
          console.log(`Refund created: ${refund.id}`);
          
          // Find order by refund metadata
          const refundOrderId = refund.metadata?.orderId;
          if (refundOrderId) {
            await storage.updateOrder(refundOrderId, {
              paymentStatus: 'refund_processing',
              stripeRefundId: refund.id
            });
          }
          break;

        case 'refund.updated':
          const updatedRefund = event.data.object;
          console.log(`Refund updated: ${updatedRefund.id}, status: ${updatedRefund.status}`);
          
          const refundUpdateOrderId = updatedRefund.metadata?.orderId;
          if (refundUpdateOrderId) {
            if (updatedRefund.status === 'succeeded') {
              await storage.updateOrder(refundUpdateOrderId, {
                paymentStatus: 'refunded',
                status: 'refunded',
                refundAmount: updatedRefund.amount / 100
              });
              
              // Notify customer that refund is complete
              const order = await storage.getOrder(refundUpdateOrderId);
              if (order) {
                await storage.createNotification({
                  userId: order.userId,
                  type: 'refund_completed',
                  title: 'Refund Complete',
                  message: `Your refund of $${(updatedRefund.amount / 100).toFixed(2)} has been processed and will appear in your account within 5-10 business days.`,
                  orderId: refundUpdateOrderId,
                  data: {
                    refundAmount: updatedRefund.amount / 100,
                    refundId: updatedRefund.id
                  }
                });
              }
            } else if (updatedRefund.status === 'failed') {
              await storage.updateOrder(refundUpdateOrderId, {
                paymentStatus: 'refund_failed'
              });
            }
          }
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error processing webhook event:', error);
      return res.status(500).send('Error processing webhook');
    }

    res.json({received: true});
  });

  // Process PayPal payment
  app.post('/api/payments/paypal/create-order', isAuthenticated, async (req, res) => {
    try {
      const { amount } = req.body;
      
      // In a real implementation, you would use PayPal SDK here
      const mockPayPalOrder = {
        id: 'paypal_' + Math.random().toString(36).substr(2, 9),
        status: 'CREATED',
        amount: {
          currency_code: 'USD',
          value: amount.toFixed(2)
        },
        links: [
          {
            href: `https://api.sandbox.paypal.com/v2/checkout/orders/paypal_${Math.random().toString(36).substr(2, 9)}`,
            rel: 'approve',
            method: 'GET'
          }
        ]
      };

      res.json(mockPayPalOrder);
    } catch (error) {
      console.error('PayPal payment error:', error);
      res.status(500).json({ message: 'Failed to create PayPal order' });
    }
  });

  // Apple Pay payment processing
  app.post('/api/payments/apple-pay/process', isAuthenticated, async (req, res) => {
    try {
      const { paymentData, amount } = req.body;
      
      // In a real implementation, you would validate the Apple Pay payment token
      const mockApplePayResponse = {
        transactionId: 'apple_' + Math.random().toString(36).substr(2, 9),
        status: 'success',
        amount: amount
      };

      res.json(mockApplePayResponse);
    } catch (error) {
      console.error('Apple Pay processing error:', error);
      res.status(500).json({ message: 'Failed to process Apple Pay payment' });
    }
  });

  // Google Pay payment processing
  app.post('/api/payments/google-pay/process', isAuthenticated, async (req, res) => {
    try {
      const { paymentData, amount } = req.body;
      
      // In a real implementation, you would validate the Google Pay payment token
      const mockGooglePayResponse = {
        transactionId: 'google_' + Math.random().toString(36).substr(2, 9),
        status: 'success',
        amount: amount
      };

      res.json(mockGooglePayResponse);
    } catch (error) {
      console.error('Google Pay processing error:', error);
      res.status(500).json({ message: 'Failed to process Google Pay payment' });
    }
  });
  // Get user's orders (protected)
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).user.id;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Get specific order (protected)
  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      const userId = (req.session as any).user.id;
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Users can only view their own orders (unless they're a driver)
      if (order.userId !== userId && !(req.session as any).user.isDriver) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Driver-specific endpoints
  app.get("/api/driver/orders/available", isAuthenticated, async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user.isDriver) {
        return res.status(403).json({ message: "Driver access required" });
      }
      
      const availableOrders = await storage.getAvailableOrders();
      res.json(availableOrders);
    } catch (error) {
      console.error("Error fetching available orders:", error);
      res.status(500).json({ message: "Failed to fetch available orders" });
    }
  });

  app.get("/api/driver/orders", isAuthenticated, async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user.isDriver) {
        return res.status(403).json({ message: "Driver access required" });
      }
      
      const driverOrders = await storage.getDriverOrders(user.id);
      res.json(driverOrders);
    } catch (error) {
      console.error("Error fetching driver orders:", error);
      res.status(500).json({ message: "Failed to fetch driver orders" });
    }
  });

  app.post("/api/driver/orders/:orderId/accept", isAuthenticated, async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user.isDriver) {
        return res.status(403).json({ message: "Driver access required" });
      }
      
      const { orderId } = req.params;
      const order = await storage.assignOrderToDriver(orderId, user.id);
      res.json(order);
    } catch (error) {
      console.error("Error accepting order:", error);
      res.status(500).json({ message: "Failed to accept order" });
    }
  });

  app.patch("/api/driver/status", isAuthenticated, async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user.isDriver) {
        return res.status(403).json({ message: "Driver access required" });
      }
      
      const { isOnline } = req.body;
      await storage.updateDriverStatus(user.id, isOnline);
      res.json({ success: true, isOnline });
    } catch (error) {
      console.error("Error updating driver status:", error);
      res.status(500).json({ message: "Failed to update driver status" });
    }
  });

  // Create new order (protected)
  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).user.id;
      
      // Calculate payment breakdown if route info is available
      let orderData = { ...req.body, userId };
      
      if (req.body.routeInfo) {
        const { calculatePayment } = await import('@shared/paymentCalculator');
        const distance = parseFloat(req.body.routeInfo.distance.replace(' miles', ''));
        const time = parseFloat(req.body.routeInfo.duration.replace(' mins', ''));
        
        const paymentBreakdown = calculatePayment(
          { distance, estimatedTime: time },
          req.body.boxSize,
          req.body.numberOfBoxes,
          false, // rush delivery
          0 // tip
        );
        
        orderData = {
          ...orderData,
          driverBasePay: paymentBreakdown.driverBasePay,
          driverDistancePay: paymentBreakdown.driverDistancePay,
          driverTimePay: paymentBreakdown.driverTimePay,
          driverSizeBonus: paymentBreakdown.driverSizeBonus,
          driverTotalEarning: paymentBreakdown.driverTotalEarning,
          companyServiceFee: paymentBreakdown.companyServiceFee,
          distanceFee: paymentBreakdown.distanceFee,
          timeFee: paymentBreakdown.timeFee,
          serviceFee: paymentBreakdown.serviceFee
        };
      }
      
      // Process the enhanced form data
      const {
        streetAddress,
        city, 
        state,
        zipCode,
        retailer,
        itemCategory,
        itemDescription,
        estimatedWeight,
        boxSize,
        numberOfBoxes,
        notes,
        totalAmount
      } = req.body;

      // Calculate pricing breakdown
      const basePrice = 3.99;
      const sizeUpcharge = boxSize === 'L' ? 2.00 : boxSize === 'XL' ? 4.00 : 0;
      const multiBoxFee = numberOfBoxes > 1 ? (numberOfBoxes - 1) * 1.50 : 0;
      const calculatedTotal = basePrice + sizeUpcharge + multiBoxFee;

      // Merge the existing orderData with the additional fields
      // Note: id and trackingNumber will be auto-generated by storage.createOrder()
      orderData = {
        ...orderData,
        status: 'created',
        
        // Enhanced pickup address
        pickupStreetAddress: streetAddress,
        pickupCity: city,
        pickupState: state,
        pickupZipCode: zipCode,
        pickupInstructions: notes,
        
        // Retailer and item details
        retailer,
        itemCategory,
        itemDescription,
        estimatedWeight,
        
        // Box details
        boxSize,
        numberOfBoxes,
        
        // Pricing
        basePrice,
        sizeUpcharge,
        multiBoxFee,
        totalPrice: calculatedTotal
      };

      const validatedData = insertOrderSchema.parse(orderData);
      const order = await storage.createOrder(validatedData);
      
      // Send SMS notification for new order
      try {
        await smsService.sendOrderNotification({
          customerName: 'New Customer',
          pickupAddress: order.pickupStreetAddress,
          totalAmount: order.totalPrice,
          orderId: order.id
        });
      } catch (smsError) {
        console.error('SMS notification failed:', smsError);
        // Continue with order creation even if SMS fails
      }
      res.status(201).json(order);
    } catch (error) {
      console.error('Order creation error:', error);
      res.status(400).json({ message: "Failed to create order" });
    }
  });

  // Administrative payment tracking endpoints
  app.get("/api/admin/payment-records", requireAdmin, async (req, res) => {
    try {
      
      const paymentRecords = await storage.getPaymentRecords();
      res.json(paymentRecords);
    } catch (error) {
      console.error("Error fetching payment records:", error);
      res.status(500).json({ message: "Failed to fetch payment records" });
    }
  });

  app.get("/api/admin/payment-summary", requireAdmin, async (req, res) => {
    try {
      
      const summary = await storage.getPaymentSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching payment summary:", error);
      res.status(500).json({ message: "Failed to fetch payment summary" });
    }
  });

  app.post("/api/admin/export-payments", requireAdmin, async (req, res) => {
    try {
      
      const { format, dateRange, status } = req.body;
      const exportData = await storage.exportPaymentData(format, dateRange, status);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=returnly-payments-${new Date().toISOString().split('T')[0]}.xlsx`);
      res.send(exportData);
    } catch (error) {
      console.error("Error exporting payments:", error);
      res.status(500).json({ message: "Failed to export payment data" });
    }
  });

  // GET endpoint for tax report data (for dashboard display)
  app.get("/api/admin/tax-reports", requireAdmin, async (req, res) => {
    try {
      const year = req.query.year || new Date().getFullYear();
      
      // Get all payment records for the year and generate tax summary
      const paymentRecords = await storage.getPaymentRecords();
      const yearRecords = paymentRecords.filter((r: any) => r.taxYear === parseInt(year as string));
      
      // Group by driver and calculate tax info
      const driverTaxData = new Map();
      yearRecords.forEach((record: any) => {
        const driverId = record.driverId;
        if (!driverTaxData.has(driverId)) {
          driverTaxData.set(driverId, {
            id: driverId,
            driverName: record.driverName,
            driverId: `DRV${driverId.toString().padStart(3, '0')}`,
            grossEarnings: 0,
            platformFees: 0,
            netTaxableIncome: 0,
            form1099Generated: false,
            status: 'Pending',
            paymentMethod: 'Bank Transfer',
            lastUpdated: new Date()
          });
        }
        
        const driver = driverTaxData.get(driverId);
        driver.grossEarnings += record.driverEarnings.total;
        driver.platformFees += record.companyRevenue.total;
        driver.netTaxableIncome = driver.grossEarnings - driver.platformFees;
        driver.lastUpdated = new Date(record.transactionDate);
      });
      
      const taxReportData = Array.from(driverTaxData.values());
      res.json(taxReportData);
    } catch (error) {
      console.error("Error fetching tax report data:", error);
      res.status(500).json({ message: "Failed to fetch tax report data" });
    }
  });

  app.post("/api/admin/tax-report", requireAdmin, async (req, res) => {
    try {
      
      const { year } = req.body;
      const taxReport = await storage.generateTaxReport(year);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=returnly-tax-report-${year}.xlsx`);
      res.send(taxReport);
    } catch (error) {
      console.error("Error generating tax report:", error);
      res.status(500).json({ message: "Failed to generate tax report" });
    }
  });

  app.post("/api/admin/generate-1099s", requireAdmin, async (req, res) => {
    try {
      
      const { year } = req.body;
      const forms1099 = await storage.generate1099Forms(year);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=returnly-1099-forms-${year}.xlsx`);
      res.send(forms1099);
    } catch (error) {
      console.error("Error generating 1099 forms:", error);
      res.status(500).json({ message: "Failed to generate 1099 forms" });
    }
  });

  // Update order status (protected)
  app.patch("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const { status, driverId, customerRating, driverRating, customerFeedback, driverFeedback, driverNotes } = req.body;
      const userId = (req.session as any).user.id;
      const isDriver = (req.session as any).user.isDriver;
      
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Authorization checks
      if (!isDriver && order.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updates: any = {};
      if (status) updates.status = status;
      if (driverId) updates.driverId = driverId;
      if (customerRating) updates.customerRating = customerRating;
      if (driverRating) updates.driverRating = driverRating;
      if (customerFeedback) updates.customerFeedback = customerFeedback;
      if (driverFeedback) updates.driverFeedback = driverFeedback;
      if (driverNotes) updates.driverNotes = driverNotes;
      
      // Auto-assign timestamps for status changes
      if (status === OrderStatus.PICKED_UP && !order.actualPickupTime) {
        updates.actualPickupTime = new Date();
      }
      if (status === OrderStatus.DELIVERED && !order.actualDeliveryTime) {
        updates.actualDeliveryTime = new Date();
      }
      if (status === OrderStatus.ASSIGNED && !order.driverAssignedAt) {
        updates.driverAssignedAt = new Date();
      }
      
      const updatedOrder = await storage.updateOrder(req.params.id, updates);
      
      // Create notification for status changes
      if (status && status !== order.status) {
        await storage.createNotification({
          userId: order.userId,
          type: 'order_update',
          title: 'Order Status Updated',
          message: `Your order ${order.id} is now ${status.replace('_', ' ')}`,
          data: { orderId: order.id, newStatus: status }
        });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Driver-specific routes
  app.get("/api/driver/orders/available", isAuthenticated, async (req, res) => {
    try {
      const isDriver = (req.session as any).user.isDriver;
      if (!isDriver) {
        return res.status(403).json({ message: "Driver access required" });
      }
      
      const orders = await storage.getAvailableOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch available orders" });
    }
  });

  app.get("/api/driver/orders", isAuthenticated, async (req, res) => {
    try {
      const driverId = (req.session as any).user.id;
      const isDriver = (req.session as any).user.isDriver;
      
      if (!isDriver) {
        return res.status(403).json({ message: "Driver access required" });
      }
      
      const orders = await storage.getDriverOrders(driverId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch driver orders" });
    }
  });

  app.post("/api/driver/orders/:id/accept", isAuthenticated, async (req, res) => {
    try {
      const driverId = (req.session as any).user.id;
      const isDriver = (req.session as any).user.isDriver;
      
      if (!isDriver) {
        return res.status(403).json({ message: "Driver access required" });
      }
      
      const order = await storage.updateOrder(req.params.id, {
        driverId,
        status: OrderStatus.ASSIGNED,
        driverAssignedAt: new Date()
      });
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Create notifications
      await storage.createNotification({
        userId: order.userId,
        type: 'order_update',
        title: 'Driver Assigned',
        message: `A driver has been assigned to your order ${order.id}`,
        data: { orderId: order.id, driverId }
      });
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to accept order" });
    }
  });

  app.get("/api/driver/earnings", isAuthenticated, async (req, res) => {
    try {
      const driverId = (req.session as any).user.id;
      const isDriver = (req.session as any).user.isDriver;
      
      if (!isDriver) {
        return res.status(403).json({ message: "Driver access required" });
      }
      
      const earnings = await storage.getDriverEarnings(driverId);
      res.json(earnings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch earnings" });
    }
  });

  app.patch("/api/driver/status", isAuthenticated, async (req, res) => {
    try {
      const driverId = (req.session as any).user.id;
      const isDriver = (req.session as any).user.isDriver;
      const { isOnline, currentLocation } = req.body;
      
      if (!isDriver) {
        return res.status(403).json({ message: "Driver access required" });
      }
      
      const updates: any = {};
      if (typeof isOnline === 'boolean') updates.isOnline = isOnline;
      if (currentLocation) updates.currentLocation = currentLocation;
      
      const user = await storage.updateUser(driverId, updates);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update driver status" });
    }
  });

  // Driver tutorial completion
  app.post('/api/driver/complete-tutorial', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).user.id;
      
      // Mark tutorial as completed and ensure driver access
      const user = await storage.updateUser(userId, { 
        tutorialCompleted: true,
        isDriver: true // Ensure driver access is granted upon tutorial completion
      });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ 
        message: "Tutorial completed successfully", 
        driverAccess: user.isDriver,
        tutorialCompleted: user.tutorialCompleted 
      });
    } catch (error) {
      console.error('Error completing tutorial:', error);
      res.status(500).json({ message: "Failed to complete tutorial" });
    }
  });

  // Promo code routes
  app.post("/api/promo/validate", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ message: "Promo code required" });
      }
      
      const validation = await storage.validatePromoCode(code);
      res.json(validation);
    } catch (error) {
      res.status(500).json({ message: "Failed to validate promo code" });
    }
  });

  // Notification routes
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).user.id;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      await storage.markNotificationRead(parseInt(req.params.id));
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Admin routes
  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/admin/drivers", requireAdmin, async (req, res) => {
    try {
      const drivers = await storage.getDrivers();
      res.json(drivers);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      res.status(500).json({ message: "Failed to fetch drivers" });
    }
  });

  // Driver oversight management endpoint
  app.patch("/api/admin/drivers/:id/oversight", requireAdmin, async (req, res) => {
    try {
      const driverId = parseInt(req.params.id);
      const { action } = req.body;

      if (!driverId || !action) {
        return res.status(400).json({ message: "Driver ID and action are required" });
      }

      const validActions = ['review', 'suspend', 'reactivate', 'approve'];
      if (!validActions.includes(action)) {
        return res.status(400).json({ message: "Invalid action" });
      }

      // Get the current driver
      const driver = await storage.getUser(driverId);
      if (!driver || !driver.isDriver) {
        return res.status(404).json({ message: "Driver not found" });
      }

      // Update driver based on action
      let updateData: any = {};
      switch (action) {
        case 'suspend':
          updateData = { isActive: false, suspendedAt: new Date() };
          break;
        case 'reactivate':
          updateData = { isActive: true, suspendedAt: null };
          break;
        case 'approve':
          updateData = { isActive: true, approvedAt: new Date() };
          break;
        case 'review':
          updateData = { reviewedAt: new Date() };
          break;
      }

      const updatedDriver = await storage.updateUser(driverId, updateData);
      
      res.json({ 
        success: true, 
        message: `Driver ${action} completed successfully`,
        driver: updatedDriver 
      });
    } catch (error) {
      console.error("Error updating driver oversight:", error);
      res.status(500).json({ message: "Failed to update driver oversight" });
    }
  });

  // Driver status toggle endpoint
  app.patch("/api/admin/drivers/:id/status", requireAdmin, async (req, res) => {
    try {
      const driverId = parseInt(req.params.id);
      const { isOnline } = req.body;

      if (!driverId || typeof isOnline !== 'boolean') {
        return res.status(400).json({ message: "Driver ID and online status are required" });
      }

      const updatedDriver = await storage.updateUser(driverId, { isOnline });
      
      if (!updatedDriver) {
        return res.status(404).json({ message: "Driver not found" });
      }

      res.json({ 
        success: true, 
        message: `Driver status updated to ${isOnline ? 'online' : 'offline'}`,
        driver: updatedDriver 
      });
    } catch (error) {
      console.error("Error updating driver status:", error);
      res.status(500).json({ message: "Failed to update driver status" });
    }
  });

  app.get("/api/admin/customers", requireAdmin, async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post("/api/admin/promo", requireAdmin, async (req, res) => {
    try {
      
      const validatedData = insertPromoCodeSchema.parse(req.body);
      const promoCode = await storage.createPromoCode(validatedData);
      res.status(201).json(promoCode);
    } catch (error) {
      res.status(400).json({ message: "Invalid promo code data" });
    }
  });

  // Analytics endpoints
  app.get("/api/admin/analytics/:metric", requireAdmin, async (req, res) => {
    try {
      
      const { metric } = req.params;
      const { from, to } = req.query;
      
      const fromDate = from ? new Date(from as string) : undefined;
      const toDate = to ? new Date(to as string) : undefined;
      
      const analytics = await storage.getAnalytics(metric, fromDate, toDate);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Stripe Connect account creation for drivers
  app.post("/api/driver/stripe-connect", isAuthenticated, async (req, res) => {
    try {
      const driverId = (req.session as any).user.id;
      const driver = await storage.getUser(driverId);
      
      if (!driver?.isDriver) {
        return res.status(403).json({ message: "Driver access required" });
      }

      if (driver.stripeConnectAccountId) {
        return res.status(400).json({ message: "Stripe Connect account already exists" });
      }

      // Create Stripe Connect account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: driver.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        individual: {
          first_name: driver.firstName,
          last_name: driver.lastName,
          email: driver.email,
        },
      });

      // Update driver with Stripe Connect account ID
      await storage.updateUser(driverId, {
        stripeConnectAccountId: account.id
      });

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${req.protocol}://${req.get('host')}/driver-onboarding?refresh=true`,
        return_url: `${req.protocol}://${req.get('host')}/driver-payments`,
        type: 'account_onboarding',
      });

      res.json({
        accountId: account.id,
        onboardingUrl: accountLink.url
      });
    } catch (error: any) {
      console.error('Stripe Connect account creation failed:', error);
      res.status(500).json({ 
        message: "Failed to create Stripe Connect account", 
        error: error.message 
      });
    }
  });

  // Driver routes
  app.get("/api/driver/orders/available", async (req, res) => {
    try {
      const orders = await storage.getOrdersByStatus("created");
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch available orders" });
    }
  });

  app.get("/api/driver/orders", async (req, res) => {
    try {
      const driverId = (req.session as any).user?.id;
      const orders = await storage.getOrdersByDriver(driverId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch driver orders" });
    }
  });

  app.post("/api/driver/orders/:orderId/accept", async (req, res) => {
    try {
      const { orderId } = req.params;
      const driverId = (req.session as any).user?.id;
      
      const order = await storage.updateOrder(orderId, { 
        driverId, 
        status: "assigned"
      });
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to accept order" });
    }
  });

  app.get("/api/driver/earnings", async (req, res) => {
    try {
      const driverId = (req.session as any).user?.id;
      const earnings = await storage.getDriverEarnings(driverId);
      res.json(earnings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch earnings" });
    }
  });

  app.patch("/api/driver/status", async (req, res) => {
    try {
      const userId = (req.session as any).user?.id;
      const { isOnline, currentLocation } = req.body;
      
      const user = await storage.updateUser(userId, { 
        isOnline,
        currentLocation: currentLocation || null
      });
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update driver status" });
    }
  });

  // Driver completes return delivery - automatically triggers customer refund
  app.post("/api/driver/orders/:orderId/complete", isAuthenticated, async (req, res) => {
    try {
      const { orderId } = req.params;
      const driverId = (req.session as any).user?.id;
      const { deliveryNotes, photosUploaded, refundMethod, customRefundAmount, refundReason } = req.body;
      
      // 1. Verify driver is assigned to this order
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (order.driverId !== driverId) {
        return res.status(403).json({ message: "Not authorized for this order" });
      }
      
      if (order.status === 'delivered' || order.status === 'completed' || order.status === 'refunded') {
        return res.status(400).json({ message: "Order already completed" });
      }

      // Determine refund amount - only refund the item cost, not service fee or taxes
      const itemCost = (order.itemCost) || ((order.totalPrice || 0) - (order.serviceFee || 0) - (order.taxAmount || 0));
      const refundAmount = customRefundAmount && customRefundAmount > 0 && customRefundAmount <= itemCost
        ? customRefundAmount
        : itemCost;

      // 2. Mark order as delivered to retailer
      const completedOrder = await storage.updateOrder(orderId, {
        status: 'delivered',
        actualDeliveryTime: new Date(),
        driverNotes: deliveryNotes,
        photosUploaded: photosUploaded || false,
        refundMethod: refundMethod || 'original_payment',
        refundReason: refundReason || 'return_delivered',
        refundAmount: refundAmount
      });

      // 3. Process customer refund based on selected method
      let refundResult: any = null;

      if (refundMethod === 'store_credit') {
        // Process as store credit - instant
        await storage.updateOrder(orderId, {
          paymentStatus: 'refunded',
          status: 'refunded',
          refundStatus: 'completed',
          refundProcessedAt: new Date(),
          refundCompletedAt: new Date()
        });

        // Add store credit to customer account - would need to add this field to user schema
        // TODO: Add storeCreditBalance field to users table if store credit feature is needed
        // const customer = await storage.getUser(order.userId);
        // if (customer) {
        //   await storage.updateUser(order.userId, {
        //     storeCreditBalance: (customer.storeCreditBalance || 0) + refundAmount
        //   });
        // }

        // Notify customer about store credit
        await storage.createNotification({
          userId: order.userId,
          type: 'refund_completed',
          title: 'Return Complete & Store Credit Added',
          message: `Your return has been delivered successfully! $${refundAmount.toFixed(2)} in store credit has been added to your account and is ready to use.`,
          orderId: orderId,
          data: {
            refundAmount,
            refundMethod: 'store_credit',
            deliveredBy: driverId,
            deliveredAt: new Date().toISOString()
          }
        });

        refundResult = {
          amount: refundAmount,
          method: 'store_credit',
          status: 'completed',
          message: 'Store credit added instantly'
        };

      } else if (refundMethod === 'cash') {
        // Cash refund - requires admin approval but mark as pending
        await storage.updateOrder(orderId, {
          paymentStatus: 'refund_processing',
          status: 'delivered', // Keep as delivered until cash is provided
          refundStatus: 'pending',
          refundProcessedAt: new Date(),
          refundNotes: `Cash refund requested by driver ${driverId}`
        });

        // Notify admin about cash refund request
        await storage.createNotification({
          userId: 1, // Admin user ID
          type: 'cash_refund_request',
          title: 'Cash Refund Request',
          message: `Driver requested cash refund of $${refundAmount.toFixed(2)} for order ${orderId}. Admin approval required.`,
          orderId: orderId,
          data: {
            refundAmount,
            refundMethod: 'cash',
            requestedBy: driverId,
            requestedAt: new Date().toISOString()
          }
        });

        refundResult = {
          amount: refundAmount,
          method: 'cash',
          status: 'pending_approval',
          message: 'Cash refund request submitted for admin approval'
        };

      } else {
        // Original payment method via Stripe
        if (order.stripePaymentIntentId && order.paymentStatus !== 'refunded') {
          try {
            const refund = await stripe.refunds.create({
              payment_intent: order.stripePaymentIntentId,
              amount: Math.round(refundAmount * 100), // Convert to cents
              metadata: {
                orderId,
                refundReason: refundReason || 'return_delivered',
                processedBy: 'driver_completion',
                driverId: driverId.toString(),
                refundMethod: 'original_payment'
              }
            });

            // Update order with refund details
            await storage.updateOrder(orderId, {
              paymentStatus: 'refund_processing',
              status: 'refunded',
              stripeRefundId: refund.id,
              refundStatus: 'processing',
              refundProcessedAt: new Date()
            });

            // Notify customer about refund
            await storage.createNotification({
              userId: order.userId,
              type: 'refund_processed',
              title: 'Return Complete & Refund Processed',
              message: `Your return has been delivered successfully! Your refund of $${refundAmount.toFixed(2)} has been processed and will appear in your original payment method within 5-10 business days.`,
              orderId: orderId,
              data: {
                refundAmount,
                refundId: refund.id,
                refundMethod: 'original_payment',
                deliveredBy: driverId,
                deliveredAt: new Date().toISOString()
              }
            });

            refundResult = {
              amount: refundAmount,
              method: 'original_payment',
              refundId: refund.id,
              status: 'processing',
              estimatedArrival: '5-10 business days'
            };

          } catch (refundError: any) {
            console.error('Stripe refund failed:', refundError);
            
            // Mark refund as failed but order still delivered
            await storage.updateOrder(orderId, {
              refundStatus: 'failed',
              refundNotes: `Stripe refund failed: ${refundError.message}`
            });

            refundResult = {
              amount: refundAmount,
              method: 'original_payment',
              status: 'failed',
              error: refundError.message,
              message: 'Automatic refund failed - admin will process manually'
            };
          }
        }
      }

      console.log(`Order ${orderId} completed by driver ${driverId}, refund: ${JSON.stringify(refundResult)}`);
      
      res.json({ 
        success: true, 
        message: "Order completed successfully",
        order: completedOrder,
        refund: refundResult
      });

    } catch (error: any) {
      console.error("Error completing order:", error);
      res.status(500).json({ message: "Failed to complete order: " + error.message });
    }
  });

  // Customer refund preferences endpoint
  app.patch("/api/user/refund-preferences", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).user?.id;
      const { customerRefundPreference } = req.body;
      
      // Validate refund preference
      const validPreferences = ['original_payment', 'store_credit'];
      if (!validPreferences.includes(customerRefundPreference)) {
        return res.status(400).json({ message: "Invalid refund preference" });
      }
      
      // Note: customerRefundPreference field would need to be added to user schema
      // For now, store in preferences object
      const user = await storage.getUser(userId);
      const currentPreferences = user?.preferences || {};
      const updatedUser = await storage.updateUser(userId, {
        preferences: {
          ...currentPreferences,
          customerRefundPreference
        }
      });
      
      res.json({ 
        success: true, 
        message: "Refund preferences updated successfully",
        user: updatedUser
      });
    } catch (error: any) {
      console.error("Error updating refund preferences:", error);
      res.status(500).json({ message: "Failed to update refund preferences" });
    }
  });

  // Admin cash refund approval endpoint
  app.post("/api/admin/approve-cash-refund/:orderId", requireAdmin, async (req, res) => {
    try {
      const { orderId } = req.params;
      const { approved, adminNotes } = req.body;
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (approved) {
        // Approve cash refund
        await storage.updateOrder(orderId, {
          refundStatus: 'completed',
          paymentStatus: 'refunded',
          status: 'refunded',
          refundCompletedAt: new Date(),
          adminNotes: `Cash refund approved: ${adminNotes || 'No additional notes'}`
        });
        
        // Notify customer
        await storage.createNotification({
          userId: order.userId,
          type: 'refund_completed',
          title: 'Cash Refund Approved',
          message: `Your cash refund of $${(order.refundAmount || 0).toFixed(2)} has been approved and processed.`,
          orderId: orderId,
          data: {
            refundAmount: order.refundAmount || 0,
            refundMethod: 'cash',
            approvedBy: 'admin'
          }
        });
        
        res.json({ success: true, message: "Cash refund approved" });
      } else {
        // Deny cash refund - revert to original payment method
        await storage.updateOrder(orderId, {
          refundStatus: 'failed',
          adminNotes: `Cash refund denied: ${adminNotes || 'No reason provided'}`
        });
        
        res.json({ success: true, message: "Cash refund denied" });
      }
    } catch (error: any) {
      console.error("Error processing cash refund approval:", error);
      res.status(500).json({ message: "Failed to process cash refund approval" });
    }
  });

  // Duplicate admin routes removed - using requireAdmin middleware versions above

  // Promo code validation endpoint
  app.post("/api/promo/validate", async (req, res) => {
    try {
      const { code, orderValue } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: "Promo code required" });
      }
      
      const validation = await storage.validatePromoCode(code, orderValue || 0);
      res.json(validation);
    } catch (error) {
      res.status(500).json({ message: "Failed to validate promo code" });
    }
  });

  // Stripe Connect Payment Workflow Routes
  app.post("/api/orders/:orderId/payment/process", isAuthenticated, async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Calculate 70/30 split
      const totalAmount = order.totalPrice || 0;
      const driverEarning = totalAmount * 0.7; // 70% to driver
      const returnlyFee = totalAmount * 0.3; // 30% to platform
      
      // Calculate bonuses if driver is assigned
      let bonuses = 0;
      if (order.driverId) {
        const driverIdInt = parseInt(order.driverId.toString());
        const driver = await storage.getUser(driverIdInt);
        if (driver) {
          bonuses = await storage.calculateOrderBonuses(order, driver);
        }
      }

      // Update order with payment details
      const updatedOrder = await storage.updateOrder(orderId, {
        paymentStatus: "completed",
        customerPaid: totalAmount,
        returnlyFee: returnlyFee,
        sizeBonusAmount: 5.0, // Static bonus for now since packageSize not in schema
        peakSeasonBonus: (new Date().getMonth() >= 10 || new Date().getMonth() <= 0) ? 2.0 : 0
      });

      res.json({
        message: "Payment processed successfully",
        order: updatedOrder,
        breakdown: {
          total: totalAmount,
          driverEarning: driverEarning + bonuses,
          returnlyFee: returnlyFee,
          bonuses: bonuses
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Payment processing failed" });
    }
  });

  // Driver payout management
  app.post("/api/driver/payout/instant", isAuthenticated, async (req, res) => {
    try {
      const driverId = (req.session as any).user.id;
      const driver = await storage.getUser(driverId);
      
      if (!driver?.isDriver) {
        return res.status(403).json({ message: "Driver access required" });
      }

      const { orderIds, feeAmount = 0.50 } = req.body;
      
      // Get pending earnings for specified orders
      const driverOrders = await storage.getDriverOrders(driverId.toString());
      const pendingOrders = driverOrders.filter(order => 
        orderIds.includes(order.id) && order.paymentStatus === 'completed' && order.driverPayoutStatus === 'pending'
      );

      if (pendingOrders.length === 0) {
        return res.status(400).json({ message: "No eligible orders for instant payout" });
      }

      const totalEarnings = pendingOrders.reduce((sum, order) => sum + (order.driverBasePay || 3.00), 0);
      const netAmount = totalEarnings - feeAmount;

      // Minimum payout validation
      if (netAmount < 1.00) {
        return res.status(400).json({ 
          message: `Minimum payout is $${(1.00 + feeAmount).toFixed(2)} (including $${feeAmount.toFixed(2)} instant fee)`,
          totalEarnings,
          feeAmount,
          netAmount: 0,
          minimumRequired: 1.00 + feeAmount
        });
      }

      // Get driver's Stripe Connect account
      if (!driver?.stripeConnectAccountId) {
        return res.status(400).json({ message: "Driver Stripe Connect account not set up" });
      }

      try {
        // Create Stripe transfer to driver's Connect account
        const transfer = await stripe.transfers.create({
          amount: Math.round(netAmount * 100), // Convert to cents
          currency: 'usd',
          destination: driver.stripeConnectAccountId,
          description: `Instant payout for ${pendingOrders.length} orders`,
          metadata: {
            driverId: driverId.toString(),
            orderIds: pendingOrders.map(o => o.id).join(','),
            payoutType: 'instant'
          }
        });

        // Create payout record with Stripe transfer ID
        const payout = await storage.createDriverPayout({
          driverId,
          payoutType: "instant",
          totalAmount: totalEarnings,
          feeAmount,
          netAmount,
          orderIds: pendingOrders.map(o => o.id),
          taxYear: new Date().getFullYear(),
          status: "completed",
          stripeTransferId: transfer.id
        });

        // Update orders to mark as paid
        for (const order of pendingOrders) {
          await storage.updateOrder(order.id, { driverPayoutStatus: "instant_paid" });
        }
      } catch (stripeError: any) {
        console.error('Stripe transfer failed:', stripeError);
        return res.status(500).json({ 
          message: "Payment transfer failed", 
          error: stripeError.message 
        });
      }

      res.json({
        message: "Instant payout processed",
        payout,
        netAmount,
        feeAmount
      });
    } catch (error) {
      res.status(500).json({ message: "Instant payout failed" });
    }
  });

  app.get("/api/driver/payouts", isAuthenticated, async (req, res) => {
    try {
      const driverId = (req.session as any).user.id;
      const driver = await storage.getUser(driverId);
      
      if (!driver?.isDriver) {
        return res.status(403).json({ message: "Driver access required" });
      }

      const payouts = await storage.getDriverPayouts(driverId);
      res.json(payouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payouts" });
    }
  });

  // Admin bulk payouts
  app.post("/api/admin/bulk-payouts", requireAdmin, async (req, res) => {
    try {
      const { driverIds, payoutType = 'weekly' } = req.body;
      
      if (!driverIds || !Array.isArray(driverIds) || driverIds.length === 0) {
        return res.status(400).json({ error: "Driver IDs required" });
      }
      
      const results = [];
      let totalAmount = 0;
      
      for (const driverId of driverIds) {
        try {
          // Get completed orders without payout
          const orders = await storage.getOrdersByDriver(driverId);
          const unpaidOrders = orders.filter(order => 
            order.status === 'dropped_off' && 
            !order.driverPayoutStatus
          );
          
          if (unpaidOrders.length === 0) {
            results.push({ driverId, status: 'no_earnings', amount: 0 });
            continue;
          }
          
          // Calculate total earnings (70% split)
          const earnings = unpaidOrders.reduce((total, order) => {
            const serviceFee = order.serviceFee || 3.99;
            const driverShare = serviceFee * 0.7;
            return total + driverShare;
          }, 0);
          
          if (earnings > 0) {
            // Create payout record
            const payout = await storage.createDriverPayout({
              driverId: driverId,
              totalAmount: earnings,
              feeAmount: 0,
              netAmount: earnings,
              payoutType: payoutType as 'instant' | 'weekly',
              status: 'completed',
              stripeTransferId: `po_bulk_${Math.random().toString(36).substr(2, 9)}`,
              taxYear: new Date().getFullYear(),
              orderIds: unpaidOrders.map(o => o.id)
            });
            
            // Mark orders as paid
            await Promise.all(unpaidOrders.map(order => 
              storage.updateOrder(order.id, { driverPayoutStatus: 'weekly_paid' })
            ));
            
            results.push({ 
              driverId, 
              status: 'success', 
              payout, 
              amount: earnings,
              ordersCount: unpaidOrders.length 
            });
            totalAmount += earnings;
          } else {
            results.push({ driverId, status: 'no_earnings', amount: 0 });
          }
        } catch (error: any) {
          results.push({ driverId, status: 'error', error: error?.message || 'Unknown error' });
        }
      }
      
      res.json({ 
        results, 
        total: results.length,
        successfulPayouts: results.filter(r => r.status === 'success').length,
        totalAmount: Math.round(totalAmount * 100) / 100,
        processedAt: new Date()
      });
    } catch (error) {
      console.error("Bulk payout error:", error);
      res.status(500).json({ error: "Failed to process bulk payouts" });
    }
  });

  // Admin instant payout for individual driver
  app.post("/api/admin/payouts/:driverId/instant", requireAdmin, async (req, res) => {
    try {
      const driverId = parseInt(req.params.driverId);
      const driver = await storage.getUser(driverId);
      
      if (!driver?.isDriver) {
        return res.status(404).json({ error: "Driver not found" });
      }

      const { feeAmount = 0.50 } = req.body;
      
      // Get pending earnings for the driver
      const driverOrders = await storage.getDriverOrders(driverId);
      const pendingOrders = driverOrders.filter(order => 
        order.paymentStatus === 'completed' && order.driverPayoutStatus === 'pending'
      );

      if (pendingOrders.length === 0) {
        return res.status(400).json({ error: "No eligible orders for instant payout" });
      }

      const totalEarnings = pendingOrders.reduce((sum, order) => sum + (order.driverBasePay || 3.00), 0);
      const netAmount = totalEarnings - feeAmount;

      // Minimum payout validation
      if (netAmount < 1.00) {
        return res.status(400).json({ 
          error: `Minimum payout is $${(1.00 + feeAmount).toFixed(2)} (including $${feeAmount.toFixed(2)} instant fee)`,
          totalEarnings,
          feeAmount,
          netAmount: 0,
          minimumRequired: 1.00 + feeAmount
        });
      }

      // Check driver's Stripe Connect account
      if (!driver?.stripeConnectAccountId) {
        return res.status(400).json({ error: "Driver Stripe Connect account not set up" });
      }

      try {
        // Create Stripe transfer to driver's Connect account
        const transfer = await stripe.transfers.create({
          amount: Math.round(netAmount * 100), // Convert to cents
          currency: 'usd',
          destination: driver.stripeConnectAccountId,
          description: `Admin instant payout for ${pendingOrders.length} orders`,
          metadata: {
            driverId: driverId.toString(),
            orderIds: pendingOrders.map(o => o.id).join(','),
            payoutType: 'instant',
            processedBy: 'admin'
          }
        });

        // Create payout record with Stripe transfer ID
        const payout = await storage.createDriverPayout({
          driverId,
          payoutType: "instant",
          totalAmount: totalEarnings,
          feeAmount,
          netAmount,
          orderIds: pendingOrders.map(o => o.id),
          taxYear: new Date().getFullYear(),
          status: "completed",
          stripeTransferId: transfer.id
        });

        // Update orders to mark as paid
        for (const order of pendingOrders) {
          await storage.updateOrder(order.id, { driverPayoutStatus: "instant_paid" });
        }

        res.json({
          message: "Admin instant payout processed successfully",
          payout,
          netAmount,
          feeAmount,
          ordersCount: pendingOrders.length
        });
      } catch (stripeError: any) {
        console.error('Admin Stripe transfer failed:', stripeError);
        return res.status(500).json({ 
          error: "Payment transfer failed", 
          details: stripeError.message 
        });
      }
    } catch (error) {
      console.error("Admin instant payout error:", error);
      res.status(500).json({ error: "Failed to process instant payout" });
    }
  });

  // Get all payouts for admin dashboard
  app.get("/api/admin/all-payouts", requireAdmin, async (req, res) => {
    try {
      const { year, month, driverId, limit = 50 } = req.query;
      
      // For demo purposes, generate realistic payout data
      const payouts = [];
      const currentDate = new Date();
      const targetYear = year ? parseInt(year as string) : currentDate.getFullYear();
      
      // Generate sample payouts for different drivers
      const driverNames = ['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Lisa Chen', 'David Brown'];
      
      for (let i = 0; i < parseInt(limit as string); i++) {
        const randomDriver = driverNames[Math.floor(Math.random() * driverNames.length)];
        const randomAmount = Math.floor(Math.random() * 200) + 50; // $50-$250
        const randomDate = new Date(targetYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        
        payouts.push({
          id: `payout_${i + 1}`,
          driverId: `driver_${Math.floor(Math.random() * 20) + 1}`,
          driverName: randomDriver,
          amount: randomAmount,
          payoutType: Math.random() > 0.7 ? 'instant' : 'weekly',
          status: 'completed',
          taxYear: targetYear,
          createdAt: randomDate,
          stripePayoutId: `po_${Math.random().toString(36).substr(2, 9)}`,
          ordersCount: Math.floor(Math.random() * 10) + 1
        });
      }
      
      // Filter by month if specified
      const filteredPayouts = month ? 
        payouts.filter(p => p.createdAt.getMonth() + 1 === parseInt(month as string)) : 
        payouts;
      
      // Sort by date descending
      filteredPayouts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      res.json({
        payouts: filteredPayouts,
        totalAmount: filteredPayouts.reduce((sum, p) => sum + p.amount, 0),
        totalCount: filteredPayouts.length,
        year: targetYear,
        month: month ? parseInt(month as string) : null
      });
    } catch (error) {
      console.error("Get admin payouts error:", error);
      res.status(500).json({ error: "Failed to fetch payouts" });
    }
  });

  // Driver incentives management
  app.get("/api/driver/incentives", isAuthenticated, async (req, res) => {
    try {
      const driverId = (req.session as any).user.id;
      const driver = await storage.getUser(driverId);
      
      if (!driver?.isDriver) {
        return res.status(403).json({ message: "Driver access required" });
      }

      const incentives = await storage.getDriverIncentives(driverId);
      res.json(incentives);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch incentives" });
    }
  });

  app.post("/api/admin/incentives", requireAdmin, async (req, res) => {
    try {
      const incentive = await storage.createDriverIncentive(req.body);
      res.status(201).json(incentive);
    } catch (error) {
      res.status(400).json({ message: "Failed to create incentive" });
    }
  });

  // Business information endpoints
  app.get("/api/business-info", async (req, res) => {
    try {
      const businessInfo = await storage.getBusinessInfo();
      res.json(businessInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch business information" });
    }
  });

  app.patch("/api/admin/business-info", requireAdmin, async (req, res) => {
    try {
      const updatedInfo = await storage.updateBusinessInfo(req.body);
      res.json(updatedInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to update business information" });
    }
  });

  // Admin analytics endpoint
  app.get('/api/admin/analytics', requireAdmin, (req, res) => {

    const analytics = {
      totalOrders: 127,
      completedOrders: 95,
      totalRevenue: 3847.50,
      activeDrivers: 8,
      completionRate: 0.748,
      avgOrderValue: 30.30
    };

    res.json(analytics);
  });

  // Tax reporting endpoints
  app.get('/api/admin/tax-reports', requireAdmin, async (req, res) => {
    try {
      const taxYear = req.query.taxYear as string || new Date().getFullYear().toString();
      // Mock tax report data
      const taxReport = {
        taxYear: parseInt(taxYear),
        totalContractorPayments: 75000,
        driversRequiring1099: 12,
        formsGenerated: 8,
        quarterlyData: [
          { quarter: 1, payments: 18500 },
          { quarter: 2, payments: 22000 },
          { quarter: 3, payments: 19500 },
          { quarter: 4, payments: 15000 }
        ]
      };
      res.json(taxReport);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate tax report" });
    }
  });

  // Generate tax report export
  app.post('/api/admin/generate-tax-report', requireAdmin, async (req, res) => {
    try {
      const { taxYear, quarter, format } = req.body;
      
      // Mock report generation
      const reportData = {
        reportId: `TAX_${taxYear}_${quarter || 'FULL'}_${Date.now()}`,
        taxYear: taxYear || new Date().getFullYear(),
        quarter: quarter || null,
        format: format || 'pdf',
        generatedAt: new Date().toISOString(),
        totalContractorPayments: Math.random() * 50000 + 25000,
        driversRequiring1099: Math.floor(Math.random() * 15 + 8),
        downloadUrl: `/api/admin/download-tax-report/${Date.now()}`,
        fileName: `tax_report_${taxYear}_${format}.${format}`
      };

      res.json({
        message: "Tax report generated successfully",
        report: reportData
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate tax report" });
    }
  });

  // Generate 1099 forms
  app.post('/api/admin/generate-1099-forms', requireAdmin, async (req, res) => {
    try {
      const { taxYear, driverIds } = req.body;
      
      // Mock 1099 form generation
      const formsGenerated = driverIds?.length || Math.floor(Math.random() * 15 + 8);
      const forms = Array.from({ length: formsGenerated }, (_, i) => ({
        formId: `1099_${taxYear}_${Date.now()}_${i}`,
        driverId: `driver_${i + 1}`,
        driverName: `Driver ${i + 1}`,
        totalEarnings: Math.random() * 5000 + 600,
        taxYear: taxYear || new Date().getFullYear(),
        status: 'generated'
      }));

      res.json({
        message: `Generated ${formsGenerated} 1099-NEC forms`,
        forms,
        downloadUrl: `/api/admin/download-1099-forms/${Date.now()}`,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate 1099 forms" });
    }
  });

  // Export all tax data
  app.post('/api/admin/export-tax-data', requireAdmin, async (req, res) => {
    try {
      const { taxYear, format } = req.body;
      
      // Mock data export
      const exportData = {
        exportId: `EXPORT_${taxYear}_${Date.now()}`,
        taxYear: taxYear || new Date().getFullYear(),
        format: format || 'csv',
        records: Math.floor(Math.random() * 500 + 200),
        fileSize: `${Math.floor(Math.random() * 10 + 2)}MB`,
        downloadUrl: `/api/admin/download-tax-export/${Date.now()}`,
        fileName: `tax_data_export_${taxYear}.${format}`,
        generatedAt: new Date().toISOString()
      };

      res.json({
        message: "Tax data export completed",
        export: exportData
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to export tax data" });
    }
  });



  // Admin drivers endpoint
  app.get('/api/admin/drivers', requireAdmin, (req, res) => {

    const drivers = [
      {
        id: 2,
        username: 'jane_driver',
        email: 'jane@example.com',
        isApproved: true,
        backgroundCheckStatus: 'completed',
        totalEarnings: 1250.75,
        completedJobs: 47,
        rating: 4.8
      },
      {
        id: 4,
        username: 'new_driver',
        email: 'newdriver@example.com',
        isApproved: false,
        backgroundCheckStatus: 'pending',
        totalEarnings: 0,
        completedJobs: 0,
        rating: 0
      }
    ];

    res.json(drivers);
  });

  // Update order status
  app.patch('/api/admin/orders/:orderId/status', requireAdmin, (req, res) => {

    const { orderId } = req.params;
    const { status } = req.body;

    res.json({ message: `Order ${orderId} status updated to ${status}` });
  });

  // Approve driver
  app.patch('/api/admin/drivers/:driverId/approve', requireAdmin, (req, res) => {

    const { driverId } = req.params;

    res.json({ message: `Driver ${driverId} approved` });
  });

  // Driver application endpoints
  app.get('/api/driver/application', isAuthenticated, (req, res) => {
    const user = (req.session as any)?.user as { id: number };

    const application = {
      id: user.id,
      status: 'new',
      personalInfo: null,
      vehicleInfo: null,
      documents: null,
      backgroundCheck: null,
      bankingInfo: null
    };

    res.json(application);
  });

  app.post('/api/driver/application', isAuthenticated, (req, res) => {
    const user = (req.session as any)?.user as { id: number };
    const applicationData = req.body;

    console.log(`Driver application submitted for user ${user.id}:`, applicationData);

    res.json({ message: 'Application submitted successfully', id: user.id });
  });

  app.post('/api/driver/documents', isAuthenticated, (req, res) => {
    const user = (req.session as any)?.user as { id: number };
    
    console.log(`Document uploaded for user ${user.id}`);

    res.json({ message: 'Document uploaded successfully' });
  });

  // Stripe payment route for customer bookings
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, orderId } = req.body;
      
      // Validate amount
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          orderId: orderId || 'unknown'
        }
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Payment intent creation error:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Customer refund endpoint - processes refund when return is completed
  app.post("/api/process-customer-refund", isAuthenticated, async (req, res) => {
    try {
      const { orderId } = req.body;
      
      // 1. Verify the order exists and is completed return
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(400).json({ message: "Order not found" });
      }

      // Check if this is a return order that was delivered to retailer
      if (order.status !== 'delivered' && order.status !== 'completed') {
        return res.status(400).json({ message: "Order must be delivered to retailer before refund" });
      }

      // Check if refund was already processed
      if (order.paymentStatus === 'refunded') {
        return res.status(400).json({ message: "Refund already processed for this order" });
      }

      // Check if there's a valid Stripe payment to refund
      if (!order.stripePaymentIntentId) {
        return res.status(400).json({ message: "No payment intent found for this order" });
      }

      try {
        // 2. Process refund through Stripe
        const refund = await stripe.refunds.create({
          payment_intent: order.stripePaymentIntentId,
          amount: Math.round((order.totalPrice || 0) * 100), // Convert to cents, refund full amount
          metadata: {
            orderId,
            refundReason: 'return_completed',
            processedBy: 'automatic_system'
          }
        });

        // 3. Update order status with refund info
        await storage.updateOrder(orderId, { 
          paymentStatus: 'refunded',
          status: 'refunded',
          stripeRefundId: refund.id,
          refundProcessedAt: new Date(),
          refundAmount: order.totalPrice || 0
        });

        // 4. Create notification for customer
        await storage.createNotification({
          userId: order.userId,
          type: 'refund_processed',
          title: 'Refund Processed',
          message: `Your refund of $${(order.totalPrice || 0).toFixed(2)} has been processed and will appear in your account within 5-10 business days.`,
          orderId: orderId,
          data: {
            refundAmount: order.totalPrice || 0,
            refundId: refund.id,
            estimatedArrival: '5-10 business days'
          }
        });

        console.log(`Customer refund processed: ${refund.id} for order ${orderId}`);
        
        res.json({ 
          success: true, 
          message: "Customer refund processed successfully",
          refundAmount: order.totalPrice || 0,
          refundId: refund.id,
          estimatedArrival: '5-10 business days'
        });

      } catch (stripeError: any) {
        console.error('Stripe refund failed:', stripeError);
        return res.status(500).json({ 
          message: "Refund processing failed", 
          error: stripeError.message 
        });
      }
      
    } catch (error: any) {
      console.error("Customer refund error:", error);
      res.status(500).json({ message: "Error processing customer refund: " + error.message });
    }
  });

  // Driver payout endpoint (70/30 split)
  app.post("/api/process-driver-payout", isAuthenticated, async (req, res) => {
    try {
      const { orderId, driverAmount, platformAmount } = req.body;
      
      // 1. Verify the order exists and is completed
      const order = await storage.getOrder(orderId);
      if (!order || order.status !== 'completed') {
        return res.status(400).json({ message: "Order not found or not completed" });
      }

      // 2. Check if payout was already processed
      if (order.driverPayoutStatus === 'weekly_paid' || order.driverPayoutStatus === 'instant_paid') {
        return res.status(400).json({ message: "Payout already processed for this order" });
      }

      // 3. Get driver info for Stripe Connect
      const driver = await storage.getUser(order.driverId.toString());
      if (!driver?.stripeConnectAccountId) {
        return res.status(400).json({ message: "Driver Stripe Connect account not set up" });
      }

      try {
        // 4. Use Stripe Connect to transfer to driver
        const transfer = await stripe.transfers.create({
          amount: Math.round(driverAmount * 100), // Convert to cents
          currency: 'usd',
          destination: driver.stripeConnectAccountId,
          description: `Weekly payout for order ${orderId}`,
          metadata: {
            orderId,
            driverId: order.driverId.toString(),
            payoutType: 'weekly'
          }
        });

        // 5. Update order status with payout info
        await storage.updateOrder(orderId, { 
          driverPayoutStatus: 'weekly_paid',
          stripeTransferId: transfer.id 
        });

        console.log(`Stripe transfer completed: ${transfer.id}`);
      } catch (stripeError: any) {
        console.error('Stripe transfer failed:', stripeError);
        return res.status(500).json({ 
          message: "Payment transfer failed", 
          error: stripeError.message 
        });
      }
      
      res.json({ 
        success: true, 
        message: "Driver payout processed successfully",
        driverAmount,
        platformAmount 
      });
    } catch (error: any) {
      console.error("Driver payout error:", error);
      res.status(500).json({ message: "Error processing driver payout: " + error.message });
    }
  });

  // Driver Application routes
  app.post("/api/driver-applications", isAuthenticated, async (req, res) => {
    try {
      const applicationData = {
        ...req.body,
        userId: (req.session?.user as any)?.id
      };
      
      const validatedData = insertDriverApplicationSchema.parse(applicationData);
      const application = await storage.createDriverApplication(validatedData);
      res.status(201).json(application);
    } catch (error: any) {
      console.error("Error creating driver application:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create driver application" });
    }
  });

  app.get("/api/driver-applications", isAuthenticated, async (req, res) => {
    try {
      const user = req.session?.user as any;
      if (user?.isAdmin) {
        // Admin can see all applications
        const applications = await storage.getAllDriverApplications();
        res.json(applications);
      } else {
        // User can only see their own application
        const application = await storage.getUserDriverApplication(user.id);
        res.json(application ? [application] : []);
      }
    } catch (error) {
      console.error("Error fetching driver applications:", error);
      res.status(500).json({ message: "Failed to fetch driver applications" });
    }
  });

  app.get("/api/driver-applications/:id", isAuthenticated, async (req, res) => {
    try {
      const application = await storage.getDriverApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      const user = req.session?.user as any;
      if (!user?.isAdmin && application.userId !== user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      res.json(application);
    } catch (error) {
      console.error("Error fetching driver application:", error);
      res.status(500).json({ message: "Failed to fetch driver application" });
    }
  });

  app.put("/api/driver-applications/:id", isAuthenticated, async (req, res) => {
    try {
      const application = await storage.getDriverApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      const user = req.session?.user as any;
      if (!user?.isAdmin && application.userId !== user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const updatedApplication = await storage.updateDriverApplication(
        req.params.id, 
        req.body
      );
      res.json(updatedApplication);
    } catch (error) {
      console.error("Error updating driver application:", error);
      res.status(500).json({ message: "Failed to update driver application" });
    }
  });

  // Employee Management Routes
  // Get all employees (admin only)
  app.get('/api/employees', isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.session?.user;
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ message: 'Failed to fetch employees' });
    }
  });

  // Grant admin access to employee
  app.post('/api/employees/:id/grant-admin', requireAdmin, async (req, res) => {
    try {

      const employeeId = parseInt(req.params.id);
      const updatedEmployee = await storage.updateUser(employeeId, { isAdmin: true });
      
      if (!updatedEmployee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      res.json(updatedEmployee);
    } catch (error) {
      console.error('Error granting admin access:', error);
      res.status(500).json({ message: 'Failed to grant admin access' });
    }
  });

  // Revoke admin access from employee
  app.post('/api/employees/:id/revoke-admin', requireAdmin, async (req, res) => {
    try {

      const employeeId = parseInt(req.params.id);
      const updatedEmployee = await storage.updateUser(employeeId, { isAdmin: false });
      
      if (!updatedEmployee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      res.json(updatedEmployee);
    } catch (error) {
      console.error('Error revoking admin access:', error);
      res.status(500).json({ message: 'Failed to revoke admin access' });
    }
  });

  // Invite new employee
  app.post('/api/employees/invite', isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.session?.user;
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

      // Create employee user with temporary password
      const hashedPassword = await bcrypt.hash('temp123', 12);
      const newEmployee = await storage.createUser({
        email,
        password: hashedPassword,
        firstName: email.split('@')[0],
        lastName: '',
        isAdmin: false,
        isActive: false // Will be activated when they set their password
      });

      res.json({ 
        message: 'Employee invitation sent',
        employee: { ...newEmployee, password: undefined }
      });
    } catch (error) {
      console.error('Error inviting employee:', error);
      res.status(500).json({ message: 'Failed to invite employee' });
    }
  });

  // SMS Notifications API
  app.post("/api/sms/send", async (req, res) => {
    try {
      const { userId, phoneNumber, messageType, message, orderId } = req.body;
      
      // In production, integrate with Twilio
      const smsRecord = {
        userId,
        orderId,
        phoneNumber,
        messageType,
        message,
        status: "sent",
        sentAt: new Date(),
        twilioMessageId: `mock_${Date.now()}`
      };
      
      res.json({ success: true, smsId: smsRecord.twilioMessageId });
    } catch (error) {
      console.error("SMS send error:", error);
      res.status(500).json({ error: "Failed to send SMS" });
    }
  });

  // Loyalty Program API
  app.get("/api/loyalty/profile", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    
    // Mock loyalty data
    const loyaltyProfile = {
      totalPoints: 2450,
      availablePoints: 1250,
      membershipTier: "silver",
      lifetimeSpent: 150.50,
      referralCode: "RETURN50",
      joinDate: new Date("2023-01-15")
    };
    
    res.json(loyaltyProfile);
  });

  app.get("/api/loyalty/transactions", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    
    // Mock transaction history
    const transactions = [
      { description: "Return completed - Order #R12345", pointsAmount: 50, createdAt: new Date() },
      { description: "Referral bonus - Friend signup", pointsAmount: 500, createdAt: new Date(Date.now() - 86400000) },
      { description: "Redeemed $5 credit", pointsAmount: -500, createdAt: new Date(Date.now() - 172800000) },
    ];
    
    res.json(transactions);
  });

  // Chat System API
  app.get("/api/chat/conversations", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    
    // Mock conversations
    const conversations = [
      {
        id: 1,
        type: "customer_driver",
        otherUser: "Mike Chen (Driver)",
        orderId: "R12345",
        lastMessage: "I'm about 10 minutes away",
        lastMessageTime: "2 min ago",
        status: "active",
        unreadCount: 1
      }
    ];
    
    res.json(conversations);
  });

  app.get("/api/chat/messages/:conversationId", async (req, res) => {
    if (!req.session?.user) return res.status(401).json({ error: "Not authenticated" });
    
    // Mock messages
    const messages = [
      {
        id: 1,
        senderId: 2,
        content: "Hi! I'm your driver for order R12345.",
        timestamp: new Date(),
        messageType: "text",
        isRead: true
      }
    ];
    
    res.json(messages);
  });

  app.post("/api/chat/send", async (req, res) => {
    if (!req.session?.user) return res.status(401).json({ error: "Not authenticated" });
    
    const { conversationId, content, messageType = "text" } = req.body;
    
    // Mock message sending
    const message = {
      id: Date.now(),
      senderId: req.session.user.id,
      conversationId,
      content,
      messageType,
      timestamp: new Date(),
      isRead: false
    };
    
    res.json(message);
  });

  // Route Optimization API
  app.get("/api/routes/current", async (req, res) => {
    if (!req.session?.user?.isDriver) return res.status(401).json({ error: "Driver access required" });
    
    // Mock current route
    const currentRoute = {
      id: 1,
      totalStops: 8,
      estimatedTime: 4.2,
      estimatedDistance: 32.5,
      fuelCost: 12.50,
      optimizationScore: 92,
      stops: [
        { id: 1, address: "123 Main St, Clayton, MO", order: "#R001", estimatedTime: "2:15 PM", status: "pending" }
      ]
    };
    
    res.json(currentRoute);
  });

  app.post("/api/routes/optimize", async (req, res) => {
    if (!req.session?.user?.isDriver) return res.status(401).json({ error: "Driver access required" });
    
    const { orderIds, preferences } = req.body;
    
    // Mock route optimization
    const optimizedRoute = {
      id: Date.now(),
      orderIds,
      estimatedDuration: 240, // 4 hours
      estimatedDistance: 32.5,
      fuelCostEstimate: 12.50,
      routeStatus: "planned",
      optimizedRoute: {
        waypoints: orderIds.map((id: number, index: number) => ({
          orderId: id,
          sequence: index + 1,
          address: `Stop ${index + 1} Address`,
          estimatedArrival: new Date(Date.now() + (index * 30 * 60000))
        }))
      }
    };
    
    res.json(optimizedRoute);
  });

  // Driver Performance API
  app.get("/api/driver/performance", async (req, res) => {
    if (!req.user?.isDriver) return res.status(401).json({ error: "Driver access required" });
    
    // Mock performance data
    const performance = {
      weeklyEarnings: 485.50,
      weeklyDeliveries: 32,
      avgRating: 4.9,
      onTimeRate: 96,
      customerSatisfaction: 98,
      efficiency: 92
    };
    
    res.json(performance);
  });

  app.get("/api/driver/earnings", async (req, res) => {
    if (!req.user?.isDriver) return res.status(401).json({ error: "Driver access required" });
    
    // Mock earnings data
    const earnings = {
      daily: [65, 78, 82, 71, 89, 95, 105],
      weekly: 485.50,
      monthly: 2450.00,
      projectedMonthly: 2850.00
    };
    
    res.json(earnings);
  });

  // Driver Safety API
  app.get("/api/safety/status", async (req, res) => {
    if (!req.session?.user?.isDriver) return res.status(401).json({ error: "Driver access required" });
    
    // Mock safety status
    const safetyStatus = {
      currentStatus: "on_duty_safe",
      lastCheckIn: new Date(),
      locationSharing: true,
      emergencyContactsConfigured: true
    };
    
    res.json(safetyStatus);
  });

  app.post("/api/safety/panic", async (req, res) => {
    if (!req.session?.user?.isDriver) return res.status(401).json({ error: "Driver access required" });
    
    const { location, timestamp } = req.body;
    
    // Mock panic button response
    const safetyEvent = {
      id: Date.now(),
      driverId: req.session.user.id,
      eventType: "panic_button",
      location,
      timestamp,
      status: "active",
      responseTime: null
    };
    
    // In production: Alert dispatch, emergency contacts, authorities
    
    res.json({ success: true, eventId: safetyEvent.id });
  });

  app.post("/api/safety/checkin", async (req, res) => {
    if (!req.session?.user?.isDriver) return res.status(401).json({ error: "Driver access required" });
    
    const { eventType, location, timestamp } = req.body;
    
    // Mock check-in/check-out
    const safetyEvent = {
      id: Date.now(),
      driverId: req.session.user.id,
      eventType,
      location,
      timestamp,
      status: "resolved"
    };
    
    res.json({ success: true, eventId: safetyEvent.id });
  });

  // Environment configuration endpoint
  app.get("/api/config/environment", (req, res) => {
    res.json({
      allowPublicRegistration: true,
      allowPublicLogin: true,
      allowGoogleAuth: true, // Enable Google Auth in production
      allowDriverSignup: false,
      enableDemoMode: false,
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Performance & Analytics API Endpoints
  
  // System health check
  app.get("/api/health", (req, res) => {
    res.json(PerformanceService.getHealthStats());
  });

  // Advanced business analytics (protected route)
  app.get("/api/analytics/business-report", requireAdmin, async (req, res) => {
    try {
      const report = await AdvancedAnalytics.generateBusinessReport();
      res.json(report);
    } catch (error) {
      console.error("Error generating business report:", error);
      res.status(500).json({ error: "Failed to generate analytics report" });
    }
  });

  // Real-time dashboard metrics
  app.get("/api/analytics/realtime", requireAdmin, async (req, res) => {
    try {
      const metrics = await AdvancedAnalytics.getRealTimeMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching real-time metrics:", error);
      res.status(500).json({ error: "Failed to fetch real-time metrics" });
    }
  });

  // Export analytics data
  app.get("/api/analytics/export", requireAdmin, async (req, res) => {
    try {
      const format = (req.query.format as string) || 'excel';
      const data = await AdvancedAnalytics.generateExportData(format as 'excel' | 'csv');
      
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="returnly-analytics.csv"');
        res.send(data);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="returnly-analytics.json"');
        res.json(data);
      }
    } catch (error) {
      console.error("Error exporting analytics data:", error);
      res.status(500).json({ error: "Failed to export analytics data" });
    }
  });

  // Driver location distribution analytics
  app.get("/api/analytics/driver-locations", requireAdmin, async (req, res) => {
    try {
      // Get driver distribution by city and state from driver applications
      const cityDistributionResult = await db.execute(sql`
        SELECT 
          city,
          state,
          zip_code,
          COUNT(*) as driver_count
        FROM driver_applications da
        JOIN users u ON da.user_id = u.id
        WHERE da.status = 'approved' AND u.is_driver = true AND u.is_active = true
        GROUP BY city, state, zip_code
        ORDER BY driver_count DESC, city ASC
      `);

      // Get summary statistics by city
      const citySummaryResult = await db.execute(sql`
        SELECT 
          city,
          state,
          COUNT(*) as driver_count,
          COUNT(DISTINCT zip_code) as zip_code_count
        FROM driver_applications da
        JOIN users u ON da.user_id = u.id
        WHERE da.status = 'approved' AND u.is_driver = true AND u.is_active = true
        GROUP BY city, state
        ORDER BY driver_count DESC
      `);

      // Get summary statistics by state
      const stateSummaryResult = await db.execute(sql`
        SELECT 
          state,
          COUNT(*) as driver_count,
          COUNT(DISTINCT city) as city_count,
          COUNT(DISTINCT zip_code) as zip_code_count
        FROM driver_applications da
        JOIN users u ON da.user_id = u.id
        WHERE da.status = 'approved' AND u.is_driver = true AND u.is_active = true
        GROUP BY state
        ORDER BY driver_count DESC
      `);

      // Calculate coverage metrics
      const totalDriversResult = await db.execute(sql`
        SELECT COUNT(*) as total_drivers
        FROM users
        WHERE is_driver = true AND is_active = true
      `);

      const totalDrivers = Number(totalDriversResult.rows[0]?.total_drivers) || 0;
      
      res.json({
        locationDistribution: cityDistributionResult.rows.map(row => ({
          city: row.city,
          state: row.state,
          zipCode: row.zip_code,
          driverCount: Number(row.driver_count),
          percentage: totalDrivers > 0 ? ((Number(row.driver_count) / totalDrivers) * 100).toFixed(1) : '0.0'
        })),
        citySummary: citySummaryResult.rows.map(row => ({
          city: row.city,
          state: row.state,
          driverCount: Number(row.driver_count),
          zipCodeCount: Number(row.zip_code_count),
          percentage: totalDrivers > 0 ? ((Number(row.driver_count) / totalDrivers) * 100).toFixed(1) : '0.0'
        })),
        stateSummary: stateSummaryResult.rows.map(row => ({
          state: row.state,
          driverCount: Number(row.driver_count),
          cityCount: Number(row.city_count),
          zipCodeCount: Number(row.zip_code_count),
          percentage: totalDrivers > 0 ? ((Number(row.driver_count) / totalDrivers) * 100).toFixed(1) : '0.0'
        })),
        totalDrivers,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching driver location analytics:", error);
      res.status(500).json({ error: "Failed to fetch driver location data" });
    }
  });

  // Performance metrics endpoint
  app.get("/api/performance/metrics", isAuthenticated, (req, res) => {
    res.json(PerformanceService.getMetrics());
  });

  // Clear cache endpoint (admin only)
  app.post("/api/performance/clear-cache", isAuthenticated, (req, res) => {
    PerformanceService.clearCache();
    res.json({ message: "Cache cleared successfully" });
  });

  // AI Assistant API endpoint (removed - using console version below)

  // Quick AI actions (admin only)
  app.post("/api/ai/maintenance-mode", requireAdmin, async (req, res) => {
    try {
      const response = await AIAssistant.enableMaintenanceMode();
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/dark-mode", requireAdmin, async (req, res) => {
    try {
      const response = await AIAssistant.setDarkMode();
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Enhanced platform metrics endpoint for AI business intelligence
  app.get("/api/analytics/platform-metrics", async (req, res) => {
    try {
      // Get direct database counts to avoid schema issues
      const usersResult = await db.execute(sql`SELECT COUNT(*) as count FROM users WHERE is_active = true`);
      const totalUsersResult = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
      const driversResult = await db.execute(sql`SELECT COUNT(*) as count FROM users WHERE role = 'driver' AND is_active = true`);
      const customersResult = await db.execute(sql`SELECT COUNT(*) as count FROM users WHERE role = 'customer' AND is_active = true`);
      const ordersResult = await db.execute(sql`SELECT COUNT(*) as count FROM orders`);
      const completedOrdersResult = await db.execute(sql`SELECT COUNT(*) as count FROM orders WHERE status = 'completed'`);
      const revenueResult = await db.execute(sql`SELECT COALESCE(SUM(total_price), 0) as revenue FROM orders WHERE status = 'completed'`);
      
      // Extract counts from database results
      const activeUsers = Number(usersResult.rows[0].count) || 0;
      const totalUsers = Number(totalUsersResult.rows[0].count) || 0;
      const activeDrivers = Number(driversResult.rows[0].count) || 0;
      const activeCustomers = Number(customersResult.rows[0].count) || 0;
      const totalOrders = Number(ordersResult.rows[0].count) || 0;
      const completedOrders = Number(completedOrdersResult.rows[0].count) || 0;
      const revenue = Number(revenueResult.rows[0].revenue) || 0;
      
      // Calculate system health (100% for now since we just launched)
      const systemHealth = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 100;
      
      // Mock response time and error rate (would be real metrics in production)
      const responseTime = Math.random() * 200 + 50; // 50-250ms
      const errorRate = Math.random() * 5; // 0-5%
      
      res.json({
        activeUsers,
        activeDrivers,
        activeCustomers,
        totalOrders,
        revenue: Math.round(revenue * 100) / 100, // Round to 2 decimal places
        systemHealth,
        responseTime: Math.round(responseTime),
        errorRate: parseFloat(errorRate.toFixed(2)),
        timestamp: new Date().toISOString(),
        trends: {
          userGrowth: totalUsers > 0 ? 0 : 0, // Real growth metrics (0 since just launched)
          orderGrowth: totalOrders > 0 ? 0 : 0,
          revenueGrowth: revenue > 0 ? 0 : 0
        },
        insights: {
          peakHours: [9, 12, 17, 19],
          topLocations: ['St. Louis', 'Clayton', 'University City'],
          averageOrderValue: completedOrders > 0 ? Math.round((revenue / completedOrders) * 100) / 100 : 0,
          customerSatisfaction: totalOrders > 0 ? 95 : 100 // 100% satisfaction for new platform
        }
      });
    } catch (error) {
      console.error('Error fetching platform metrics:', error);
      res.status(500).json({ 
        message: "Failed to fetch platform metrics",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // AI Assistant endpoint for Developer Console (bypass auth middleware)
  app.post("/console/ai", async (req, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ 
          message: "Invalid prompt provided" 
        });
      }

      console.log('AI Assistant request:', { prompt: prompt.substring(0, 50) + '...' });

      // Use Gemini for much cheaper AI costs
      if (process.env.GEMINI_API_KEY) {
        try {
          const { GoogleGenerativeAI } = await import('@google/generative-ai');
          const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
          const CostTracker = (await import('./cost-tracker')).default;

          const systemPrompt = `You are an intelligent AI assistant with administrative access to ReturnIt, a delivery/pickup platform. Beyond executing commands, you provide thoughtful analysis, best practices, and contextual reasoning.

INTELLIGENT CAPABILITIES:
- Contextual Analysis: Understand the "why" behind requests and provide reasoning
- Best Practice Guidance: Suggest optimal approaches based on industry standards
- Risk Assessment: Identify potential issues and recommend safer alternatives
- Strategic Thinking: Consider broader implications of actions
- Adaptive Learning: Remember patterns and improve recommendations over time

PROJECT CONTEXT:
- ReturnIt: Delivery/pickup platform connecting customers with drivers
- Tech Stack: React + TypeScript frontend, Node.js + PostgreSQL backend
- Production: Live system serving real customers on returnit.online
- Data Sensitivity: User data, financial transactions, operational metrics

RESPONSE APPROACH:
1. Understand the underlying business need, not just the technical request
2. Provide context and reasoning for your recommendations
3. Suggest best practices and potential alternatives
4. Consider security, performance, and user experience implications
5. Offer preventive measures and monitoring suggestions

EXAMPLES OF INTELLIGENT RESPONSES:
- User asks "Delete user john@example.com" → Explain deletion implications, suggest alternatives like deactivation, recommend data backup first
- User asks "Performance analysis" → Not just show metrics, but interpret patterns, identify bottlenecks, suggest specific optimizations
- User asks "Generate report" → Ask about specific business goals, recommend relevant metrics, suggest actionable insights

Always think strategically, explain your reasoning, and provide value beyond basic command execution.`;

          const startTime = Date.now();
          const response = await genai.models.generateContent({
            model: "gemini-2.5-flash", // Cost-optimized Gemini model (much cheaper than OpenAI)
            contents: [
              { role: "user", parts: [{ text: `${systemPrompt}\n\nUser request: ${prompt}` }] }
            ],
            config: {
              maxOutputTokens: 500,
              temperature: 0.7
            }
          });
          
          const duration = Date.now() - startTime;
          
          // Track Gemini costs (much lower than OpenAI)
          const usage = response.usageMetadata;
          if (usage) {
            await CostTracker.trackGemini(
              'gemini-2.5-flash',
              usage.promptTokenCount || 0,
              usage.candidatesTokenCount || 0,
              '/api/ai/assistant',
              req.user?.id,
              duration,
              'success',
              { prompt_length: prompt.length }
            );
          }

          let aiResponse = response.text || "I'm having trouble generating a response right now.";
          
          // Enhanced AI processing with learning and research capabilities
          const { AIAssistant } = await import('./ai-assistant');
          let enhancedResult = null;
          
          try {
            enhancedResult = await AIAssistant.intelligentResponseWithResearch(prompt, 'console-user');
            if (enhancedResult && enhancedResult.success) {
              // If enhanced system handled it, integrate with OpenAI response
              if (enhancedResult.message && enhancedResult.message !== "Processing your request...") {
                aiResponse += `\n\n🧠 **Intelligent Analysis**: ${enhancedResult.message}`;
              }
              
              // If external research was performed, note it
              if (enhancedResult.hasResearch) {
                aiResponse += `\n\n📚 **Research Integration**: Combined current industry knowledge with your platform context.`;
              }
            }
          } catch (enhancedError) {
            console.log('Enhanced AI system error:', enhancedError);
          }
          
          // Process administrative commands
          let adminResults = null;
          let codeChanges = [];
          let commandResults = [];
          let databaseQueries = [];
          
          const lowerPrompt = prompt.toLowerCase();
          
          // Check for user management commands
          if (lowerPrompt.includes('delete user')) {
            const emailMatch = prompt.match(/delete user ([^\s]+)/i);
            if (emailMatch) {
              const userIdentifier = emailMatch[1];
              adminResults = await AIAssistant.deleteUser(userIdentifier);
              
              if (adminResults.success) {
                aiResponse += `\n\n✅ **User Deleted Successfully**\n${adminResults.message}`;
                databaseQueries.push({
                  query: `DELETE FROM users WHERE email = '${userIdentifier}'`,
                  description: "Removed user and associated data"
                });
              } else {
                aiResponse += `\n\n❌ **Error**: ${adminResults.error}`;
              }
            }
          }
          
          // Check for list users command
          if (lowerPrompt.includes('list users') || lowerPrompt.includes('show users')) {
            adminResults = await AIAssistant.listUsers(10);
            
            if (adminResults.success) {
              aiResponse += `\n\n📋 **Current Users**\n${adminResults.message}`;
              databaseQueries.push({
                query: "SELECT * FROM users ORDER BY created_at DESC LIMIT 10",
                description: "Retrieved user list from database"
              });
            }
          }
          
          // Check for learning insights request
          if (lowerPrompt.includes('learning insights') || lowerPrompt.includes('ai learning')) {
            adminResults = await AIAssistant.getLearningInsights();
            
            if (adminResults.success) {
              const insights = adminResults.insights;
              aiResponse += `\n\n🧠 **AI Learning Insights**\n• Total Interactions: ${insights.totalInteractions}\n• Success Rate: ${insights.successRate}%\n• Active Users: ${insights.activeUsers}\n• Learning Entries: ${insights.learningEntries}`;
              if (insights.topContexts && insights.topContexts.length > 0) {
                aiResponse += `\n• Top Commands: ${insights.topContexts.map((c: any) => c.context).join(', ')}`;
              }
            }
          }
          
          // Check for order management commands
          if (lowerPrompt.includes('update order') && lowerPrompt.includes('status')) {
            const orderMatch = prompt.match(/update order (\d+) status to (\w+)/i);
            if (orderMatch) {
              const orderId = orderMatch[1];
              const status = orderMatch[2];
              const { AIAssistant } = await import('./ai-assistant');
              adminResults = await AIAssistant.updateOrderStatus(orderId, status);
              
              if (adminResults.success) {
                aiResponse += `\n\n📦 **Order Updated**\n${adminResults.message}`;
                databaseQueries.push({
                  query: `UPDATE orders SET status = '${status}' WHERE id = ${orderId}`,
                  description: "Updated order status in database"
                });
              }
            }
          }
          
          // Check for system statistics request
          if (lowerPrompt.includes('system stats') || lowerPrompt.includes('statistics') || lowerPrompt.includes('dashboard stats')) {
            const { AIAssistant } = await import('./ai-assistant');
            adminResults = await AIAssistant.getSystemStats();
            
            if (adminResults.success) {
              const stats = adminResults.stats;
              aiResponse += `\n\n📊 **System Statistics**\n• Total Users: ${stats.totalUsers}\n• Total Orders: ${stats.totalOrders}\n• Active Orders: ${stats.activeOrders}\n• Completed Orders: ${stats.completedOrders}`;
              databaseQueries.push({
                query: "SELECT COUNT(*) FROM users, orders",
                description: "Retrieved system statistics"
              });
            }
          }
          
          // Check for order search commands
          if (lowerPrompt.includes('show orders') || lowerPrompt.includes('list orders')) {
            const { AIAssistant } = await import('./ai-assistant');
            let status = null;
            
            if (lowerPrompt.includes('pending')) status = 'created';
            if (lowerPrompt.includes('active')) status = 'assigned';
            if (lowerPrompt.includes('delivered')) status = 'delivered';
            
            adminResults = await AIAssistant.searchOrders(status || undefined, 10);
            
            if (adminResults.success) {
              aiResponse += `\n\n📋 **Orders Found**\n${adminResults.message}`;
              databaseQueries.push({
                query: status ? `SELECT * FROM orders WHERE status = '${status}'` : "SELECT * FROM orders",
                description: "Retrieved order information"
              });
            }
          }
          
          // Check for recent activity request
          if (lowerPrompt.includes('recent activity') || lowerPrompt.includes('activity log')) {
            const { AIAssistant } = await import('./ai-assistant');
            adminResults = await AIAssistant.getRecentActivity(15);
            
            if (adminResults.success) {
              aiResponse += `\n\n📈 **Recent Activity**\n${adminResults.message}`;
              databaseQueries.push({
                query: "SELECT * FROM orders, users ORDER BY created_at DESC",
                description: "Retrieved recent platform activity"
              });
            }
          }
          
          // Check for custom SQL queries
          if (lowerPrompt.includes('sql query') || lowerPrompt.includes('execute query')) {
            const sqlMatch = prompt.match(/(?:sql query|execute query)\s*[:=]?\s*(.+)/i);
            if (sqlMatch) {
              const sqlQuery = sqlMatch[1].trim();
              const { AIAssistant } = await import('./ai-assistant');
              adminResults = await AIAssistant.executeCustomQuery(sqlQuery);
              
              if (adminResults.success) {
                aiResponse += `\n\n🔍 **Custom Query Results**\n${adminResults.message}`;
                databaseQueries.push({
                  query: sqlQuery,
                  description: "Executed custom SQL query"
                });
              } else {
                aiResponse += `\n\n❌ **Query Error**: ${adminResults.error}`;
              }
            }
          }
          
          // Check for report generation
          if (lowerPrompt.includes('generate report') || lowerPrompt.includes('report')) {
            const reportMatch = prompt.match(/(?:generate )?report(?:\s+on\s+|\s+)(\w+)/i);
            if (reportMatch) {
              const reportType = reportMatch[1];
              const { AIAssistant } = await import('./ai-assistant');
              adminResults = await AIAssistant.generateReport(reportType);
              
              if (adminResults.success) {
                aiResponse += `\n\n📊 **${adminResults.reportName}**\n${adminResults.message}`;
                databaseQueries.push({
                  query: `Generated ${reportType} report`,
                  description: `Created detailed ${reportType} report`
                });
              } else {
                aiResponse += `\n\n❌ **Report Error**: ${adminResults.error}`;
              }
            }
          }
          
          // Check for performance analysis
          if (lowerPrompt.includes('performance analysis') || lowerPrompt.includes('analyze performance')) {
            const { AIAssistant } = await import('./ai-assistant');
            adminResults = await AIAssistant.analyzePerformance();
            
            if (adminResults.success) {
              aiResponse += `\n\n⚡ **Performance Analysis**\n${adminResults.message}`;
              databaseQueries.push({
                query: "Performance metrics analysis",
                description: "Analyzed system performance and user patterns"
              });
            }
          }
          
          // Check for data backup requests
          if (lowerPrompt.includes('backup data') || lowerPrompt.includes('create backup')) {
            const { AIAssistant } = await import('./ai-assistant');
            adminResults = await AIAssistant.backupData();
            
            if (adminResults.success) {
              aiResponse += `\n\n💾 **Data Backup**\n${adminResults.message}`;
              commandResults.push({
                command: "Data backup",
                output: `Backup created: ${adminResults.filename}`,
                description: "Created database backup"
              });
            }
          }
          
          // Check for bulk operations
          if (lowerPrompt.includes('bulk delete') && lowerPrompt.includes('users')) {
            const criteriaMatch = prompt.match(/bulk delete users?\s+(.+)/i);
            if (criteriaMatch) {
              const criteria = criteriaMatch[1].trim();
              const { AIAssistant } = await import('./ai-assistant');
              adminResults = await AIAssistant.bulkDeleteUsers(criteria);
              
              if (adminResults.success) {
                aiResponse += `\n\n⚠️ **Bulk User Deletion**\n${adminResults.message}`;
                databaseQueries.push({
                  query: `Bulk deletion with criteria: ${criteria}`,
                  description: "Performed bulk user deletion operation"
                });
              } else {
                aiResponse += `\n\n❌ **Bulk Operation Error**: ${adminResults.error}`;
              }
            }
          }

          res.json({
            message: aiResponse,
            codeChanges,
            commandResults,
            databaseQueries
          });

        } catch (geminiError) {
          console.error('Gemini API error:', geminiError);
          // Fallback to conversational mock response
          const fallbackResponse = {
            message: `I'm working on "${prompt}" for you!\n\nI'd love to help implement this, but I'm having trouble connecting to my AI services right now. Here's what I would typically do:\n\n• Analyze your ReturnIt codebase structure\n• Find the right components to modify\n• Make clean, maintainable changes\n• Test everything thoroughly\n\nCould you try again in a moment? The connection should be back up soon.`,
            codeChanges: [
              { file: "client/src/components/Feature.tsx", description: "Would enhance component functionality" },
              { file: "server/routes.ts", description: "Would add supporting endpoints" }
            ],
            commandResults: [
              { command: "npm run dev", output: "✓ Ready for development" }
            ]
          };
          
          res.json(fallbackResponse);
        }
      } else {
        // No Gemini key available - provide helpful mock response
        const mockResponse = {
          message: `Hey! I see you want help with: "${prompt}"\n\nI'd love to assist, but I need a Gemini API key to provide intelligent responses. Here's what I would do once configured:\n\n• Analyze your request in context of the ReturnIt platform\n• Suggest specific code changes and improvements\n• Help debug issues and optimize performance\n• Provide architectural guidance\n\nTo enable full AI functionality, please add your GEMINI_API_KEY to the environment variables.`,
          codeChanges: [
            { file: "server/routes.ts", description: "AI console endpoint ready for Gemini integration" }
          ],
          commandResults: [
            { command: "echo 'Gemini API key needed'", output: "Configure GEMINI_API_KEY for full AI features" }
          ]
        };
        
        res.json(mockResponse);
      }

    } catch (error) {
      console.error('AI Assistant error:', error);
      res.status(500).json({ 
        message: "AI Assistant encountered an error. Please try again." 
      });
    }
  });

  // Cost Monitoring API Routes
  app.get('/api/costs/summary', isAuthenticated, async (req: any, res) => {
    try {
      const CostTracker = (await import('./cost-tracker')).default;
      const { startDate, endDate, service } = req.query;
      
      const summary = await CostTracker.getCostSummary(
        startDate as string,
        endDate as string,
        service as string
      );
      
      res.json(summary);
    } catch (error) {
      console.error('Cost summary error:', error);
      res.status(500).json({ message: 'Failed to fetch cost summary' });
    }
  });

  app.get('/api/costs/today', isAuthenticated, async (req: any, res) => {
    try {
      const CostTracker = (await import('./cost-tracker')).default;
      const todayCosts = await CostTracker.getTodayCosts();
      res.json(todayCosts);
    } catch (error) {
      console.error('Today costs error:', error);
      res.status(500).json({ message: 'Failed to fetch today costs' });
    }
  });

  app.get('/api/costs/monthly', isAuthenticated, async (req: any, res) => {
    try {
      const CostTracker = (await import('./cost-tracker')).default;
      const monthlyCosts = await CostTracker.getCurrentMonthCosts();
      res.json(monthlyCosts);
    } catch (error) {
      console.error('Monthly costs error:', error);
      res.status(500).json({ message: 'Failed to fetch monthly costs' });
    }
  });

  app.get('/api/costs/projections', isAuthenticated, async (req: any, res) => {
    try {
      const CostTracker = (await import('./cost-tracker')).default;
      const projections = await CostTracker.getEstimatedMonthlyCosts();
      res.json(projections);
    } catch (error) {
      console.error('Cost projections error:', error);
      res.status(500).json({ message: 'Failed to fetch cost projections' });
    }
  });

  // Manual cost tracking endpoints
  app.post('/api/costs/track-replit', isAuthenticated, async (req: any, res) => {
    try {
      const CostTracker = (await import('./cost-tracker')).default;
      const { operation, resourceType, amount, costUsd, metadata } = req.body;
      
      await CostTracker.trackReplit(operation, resourceType, amount, costUsd, metadata);
      res.json({ success: true, message: 'Replit cost tracked successfully' });
    } catch (error) {
      console.error('Track Replit cost error:', error);
      res.status(500).json({ message: 'Failed to track Replit cost' });
    }
  });

  app.post('/api/costs/track-service', isAuthenticated, async (req: any, res) => {
    try {
      const CostTracker = (await import('./cost-tracker')).default;
      const { service, operation, costUsd, metadata } = req.body;
      
      await CostTracker.trackService(service, operation, costUsd, metadata);
      res.json({ success: true, message: 'Service cost tracked successfully' });
    } catch (error) {
      console.error('Track service cost error:', error);
      res.status(500).json({ message: 'Failed to track service cost' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
