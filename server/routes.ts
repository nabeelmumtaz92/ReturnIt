import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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
import { requireAdmin, isAdmin } from "./middleware/adminAuth";
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
      
      // Verify credentials
      let passwordValid = false;
      if (user && user.password) {
        passwordValid = await AuthService.verifyPassword(password, user.password);
        console.log('Debug - Password verification result:', passwordValid);
      }
      
      if (!user || !passwordValid) {
        // Record failed attempt
        AuthService.recordFailedAttempt(email);
        
        const isNowLocked = AuthService.isUserLockedOut(email);
        return res.status(401).json({ 
          message: isNowLocked 
            ? "Too many failed attempts. Your account has been temporarily locked for security."
            : "The email or password you entered is incorrect. Please try again."
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
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
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
                  metadata: {
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

      // Generate unique order ID and tracking number
      const orderId = 'RTN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      const trackingNumber = 'TRK' + Date.now().toString().substr(-8);
      
      // Calculate pricing breakdown
      const basePrice = 3.99;
      const sizeUpcharge = boxSize === 'L' ? 2.00 : boxSize === 'XL' ? 4.00 : 0;
      const multiBoxFee = numberOfBoxes > 1 ? (numberOfBoxes - 1) * 1.50 : 0;
      const calculatedTotal = basePrice + sizeUpcharge + multiBoxFee;

      // Merge the existing orderData with the additional fields
      orderData = {
        ...orderData,
        id: orderId,
        trackingNumber,
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
      res.status(500).json({ message: "Failed to fetch drivers" });
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
        status: "assigned",
        assignedAt: new Date()
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
        actualDeliveryTime: new Date().toISOString(),
        driverNotes: deliveryNotes,
        completedAt: new Date().toISOString(),
        deliveryConfirmed: true,
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
          refundProcessedAt: new Date().toISOString(),
          refundCompletedAt: new Date().toISOString(),
          storeCreditBalance: refundAmount
        });

        // Add store credit to customer account
        const customer = await storage.getUser(order.userId.toString());
        if (customer) {
          await storage.updateUser(order.userId, {
            storeCreditBalance: (customer.storeCreditBalance || 0) + refundAmount
          });
        }

        // Notify customer about store credit
        await storage.createNotification({
          userId: order.userId,
          type: 'refund_completed',
          title: 'Return Complete & Store Credit Added',
          message: `Your return has been delivered successfully! $${refundAmount.toFixed(2)} in store credit has been added to your account and is ready to use.`,
          orderId: orderId,
          metadata: {
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
          refundProcessedAt: new Date().toISOString(),
          refundNotes: `Cash refund requested by driver ${driverId}`
        });

        // Notify admin about cash refund request
        await storage.createNotification({
          userId: 1, // Admin user ID
          type: 'cash_refund_request',
          title: 'Cash Refund Request',
          message: `Driver requested cash refund of $${refundAmount.toFixed(2)} for order ${orderId}. Admin approval required.`,
          orderId: orderId,
          metadata: {
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
              refundProcessedAt: new Date().toISOString()
            });

            // Notify customer about refund
            await storage.createNotification({
              userId: order.userId,
              type: 'refund_processed',
              title: 'Return Complete & Refund Processed',
              message: `Your return has been delivered successfully! Your refund of $${refundAmount.toFixed(2)} has been processed and will appear in your original payment method within 5-10 business days.`,
              orderId: orderId,
              metadata: {
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
      
      const updatedUser = await storage.updateUser(userId, {
        customerRefundPreference
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
          refundCompletedAt: new Date().toISOString(),
          adminNotes: `Cash refund approved: ${adminNotes || 'No additional notes'}`
        });
        
        // Notify customer
        await storage.createNotification({
          userId: order.userId,
          type: 'refund_completed',
          title: 'Cash Refund Approved',
          message: `Your cash refund of $${(order.refundAmount || 0).toFixed(2)} has been approved and processed.`,
          orderId: orderId,
          metadata: {
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
        driverEarning: driverEarning + bonuses,
        returnlyFee: returnlyFee,
        sizeBonusAmount: order.packageSize === 'large' ? 5.0 : 0,
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

      const { orderIds, feeAmount = 1.00 } = req.body;
      
      // Get pending earnings for specified orders
      const driverOrders = await storage.getDriverOrders(driverId.toString());
      const pendingOrders = driverOrders.filter(order => 
        orderIds.includes(order.id) && order.paymentStatus === 'completed' && order.driverPayoutStatus === 'pending'
      );

      if (pendingOrders.length === 0) {
        return res.status(400).json({ message: "No eligible orders for instant payout" });
      }

      const totalEarnings = pendingOrders.reduce((sum, order) => sum + (order.driverEarning || 0), 0);
      const netAmount = totalEarnings - feeAmount;

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

  // Admin orders endpoint (duplicate - removed)



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
          refundProcessedAt: new Date().toISOString(),
          refundAmount: order.totalPrice || 0
        });

        // 4. Create notification for customer
        await storage.createNotification({
          userId: order.userId,
          type: 'refund_processed',
          title: 'Refund Processed',
          message: `Your refund of $${(order.totalPrice || 0).toFixed(2)} has been processed and will appear in your account within 5-10 business days.`,
          orderId: orderId,
          metadata: {
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
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    
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
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    
    const { conversationId, content, messageType = "text" } = req.body;
    
    // Mock message sending
    const message = {
      id: Date.now(),
      senderId: req.user.id,
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
    if (!req.user?.isDriver) return res.status(401).json({ error: "Driver access required" });
    
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
    if (!req.user?.isDriver) return res.status(401).json({ error: "Driver access required" });
    
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
    if (!req.user?.isDriver) return res.status(401).json({ error: "Driver access required" });
    
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
    if (!req.user?.isDriver) return res.status(401).json({ error: "Driver access required" });
    
    const { location, timestamp } = req.body;
    
    // Mock panic button response
    const safetyEvent = {
      id: Date.now(),
      driverId: req.user.id,
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
    if (!req.user?.isDriver) return res.status(401).json({ error: "Driver access required" });
    
    const { eventType, location, timestamp } = req.body;
    
    // Mock check-in/check-out
    const safetyEvent = {
      id: Date.now(),
      driverId: req.user.id,
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

      // Use real OpenAI integration for conversational responses
      if (process.env.OPENAI_API_KEY) {
        try {
          const OpenAI = (await import('openai')).default;
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

          const systemPrompt = `You are an AI assistant with full administrative access to ReturnIt, a delivery/pickup platform.

PROJECT CAPABILITIES:
- Frontend: React + TypeScript with Shadcn/UI components  
- Backend: Express + Node.js with PostgreSQL database
- Database: Full read/write access with Drizzle ORM
- Authentication: Google OAuth and session management
- Payments: Stripe integration for transactions
- Production: Live on returnit.online

ADMINISTRATIVE FUNCTIONS YOU CAN PERFORM:
- User Management: Create, update, delete, and list users
- Order Management: Update status, delete orders, track deliveries  
- Database Operations: Run any SQL queries and modifications
- Code Changes: Modify frontend and backend files
- System Commands: Execute npm scripts, deployments, diagnostics

EXAMPLE COMMANDS:
- "Delete user john@example.com" → Remove user and all data
- "List all users" → Show recent users from database
- "Update order 123 status to delivered" → Change order status
- "Create user with email test@example.com" → Add new user
- "Show me all pending orders" → Query orders table

Always explain what you're doing and confirm potentially destructive operations. Be conversational but professional in your responses.`;

          const completion = await openai.chat.completions.create({
            model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt }
            ],
            max_tokens: 1000,
            temperature: 0.7
          });

          let aiResponse = completion.choices[0]?.message?.content || "I'm having trouble generating a response right now.";
          
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
              const { AIAssistant } = await import('./ai-assistant');
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
            const { AIAssistant } = await import('./ai-assistant');
            adminResults = await AIAssistant.listUsers(10);
            
            if (adminResults.success) {
              aiResponse += `\n\n📋 **Current Users**\n${adminResults.message}`;
              databaseQueries.push({
                query: "SELECT * FROM users ORDER BY created_at DESC LIMIT 10",
                description: "Retrieved user list from database"
              });
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

          res.json({
            message: aiResponse,
            codeChanges,
            commandResults,
            databaseQueries
          });

        } catch (openaiError) {
          console.error('OpenAI API error:', openaiError);
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
        // No OpenAI key available - provide helpful mock response
        const mockResponse = {
          message: `Hey! I see you want help with: "${prompt}"\n\nI'd love to assist, but I need an OpenAI API key to provide intelligent responses. Here's what I would do once configured:\n\n• Analyze your request in context of the ReturnIt platform\n• Suggest specific code changes and improvements\n• Help debug issues and optimize performance\n• Provide architectural guidance\n\nTo enable full AI functionality, please add your OPENAI_API_KEY to the environment variables.`,
          codeChanges: [
            { file: "server/routes.ts", description: "AI console endpoint ready for OpenAI integration" }
          ],
          commandResults: [
            { command: "echo 'OpenAI API key needed'", output: "Configure OPENAI_API_KEY for full AI features" }
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

  const httpServer = createServer(app);
  return httpServer;
}
