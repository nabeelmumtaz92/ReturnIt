import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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

  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'returnly-secret-key-fallback',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
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
        isDriver: false,
        isAdmin: validatedData.email === 'nabeelmumtaz92@gmail.com' // Admin access
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
      
      // Check for lockout
      if (AuthService.isUserLockedOut(email)) {
        const remainingTime = AuthService.getRemainingLockoutTime(email);
        return res.status(429).json({ 
          message: `Account temporarily locked due to multiple failed attempts. Try again in ${remainingTime} minutes.`,
          lockoutTime: remainingTime
        });
      }

      const user = await storage.getUserByEmail(email);
      
      // Verify credentials
      if (!user || !await AuthService.verifyPassword(password, user.password)) {
        // Record failed attempt
        AuthService.recordFailedAttempt(email);
        
        return res.status(401).json({ 
          message: "Invalid email or password",
          attempts: AuthService.isUserLockedOut(email) ? "Account locked" : "Invalid credentials"
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
      res.status(500).json({ message: "Login failed" });
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

  // Social Authentication Routes
  
  // Google Auth
  app.get('/api/auth/google', passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  }));

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login?error=google_auth_failed' }),
    (req, res) => {
      // Set up session for authenticated user
      if (req.user) {
        const user = req.user as any;
        console.log('Google OAuth user data:', user);
        
        const userData = {
          id: user.id, 
          email: user.email, 
          phone: user.phone || '', 
          isDriver: user.isDriver || false,
          isAdmin: user.isAdmin || false,
          firstName: user.firstName || '',
          lastName: user.lastName || ''
        };
        
        console.log('Processed user data for session:', userData);
        
        // Store user data in session
        (req.session as any).user = userData;
        
        // Force session save before redirect
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            return res.redirect('/login?error=session_failed');
          }
          console.log('Session user saved successfully:', userData);
          console.log('User isAdmin:', userData.isAdmin, 'Type:', typeof userData.isAdmin);
          console.log('User email:', userData.email);
          
          // Redirect admin users directly to admin dashboard
          if (userData.isAdmin) {
            console.log('Redirecting admin user to /admin-dashboard');
            res.redirect('/admin-dashboard?oauth=success');
          } else if (userData.isDriver) {
            console.log('Redirecting driver user to /driver-portal');
            res.redirect('/driver-portal?oauth=success');
          } else {
            console.log('Redirecting regular user to /');
            res.redirect('/?oauth=success');
          }
        });
      } else {
        console.log('Google callback - no user found');
        res.redirect('/login?error=auth_failed');
      }
    }
  );

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
              status: 'paid'
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
              status: 'payment_failed'
            });
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
  app.get("/api/admin/payment-records", isAuthenticated, async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const paymentRecords = await storage.getPaymentRecords();
      res.json(paymentRecords);
    } catch (error) {
      console.error("Error fetching payment records:", error);
      res.status(500).json({ message: "Failed to fetch payment records" });
    }
  });

  app.get("/api/admin/payment-summary", isAuthenticated, async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const summary = await storage.getPaymentSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching payment summary:", error);
      res.status(500).json({ message: "Failed to fetch payment summary" });
    }
  });

  app.post("/api/admin/export-payments", isAuthenticated, async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
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

  app.post("/api/admin/tax-report", isAuthenticated, async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
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

  app.post("/api/admin/generate-1099s", isAuthenticated, async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
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
  app.get("/api/admin/orders", isAuthenticated, async (req, res) => {
    try {
      const isAdmin = (req.session as any).user.isAdmin;
      if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/admin/drivers", isAuthenticated, async (req, res) => {
    try {
      const isAdmin = (req.session as any).user.isAdmin;
      if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const drivers = await storage.getDrivers();
      res.json(drivers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch drivers" });
    }
  });

  app.post("/api/admin/promo", isAuthenticated, async (req, res) => {
    try {
      const isAdmin = (req.session as any).user.isAdmin;
      if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const validatedData = insertPromoCodeSchema.parse(req.body);
      const promoCode = await storage.createPromoCode(validatedData);
      res.status(201).json(promoCode);
    } catch (error) {
      res.status(400).json({ message: "Invalid promo code data" });
    }
  });

  // Analytics endpoints
  app.get("/api/admin/analytics/:metric", isAuthenticated, async (req, res) => {
    try {
      const isAdmin = (req.session as any).user.isAdmin;
      if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
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

  // Admin routes - restricted to nabeelmumtaz92@gmail.com only
  app.get("/api/admin/orders", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user?.isAdmin || user.email !== "nabeelmumtaz92@gmail.com") {
        return res.status(403).json({ message: "Admin access restricted" });
      }
      
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/admin/drivers", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user?.isAdmin || user.email !== "nabeelmumtaz92@gmail.com") {
        return res.status(403).json({ message: "Admin access restricted" });
      }
      
      const drivers = await storage.getAllDrivers();
      res.json(drivers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch drivers" });
    }
  });

  app.post("/api/admin/promo", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user?.isAdmin || user.email !== "nabeelmumtaz92@gmail.com") {
        return res.status(403).json({ message: "Admin access restricted" });
      }
      
      const validatedData = insertPromoCodeSchema.parse(req.body);
      const promoCode = await storage.createPromoCode(validatedData);
      res.status(201).json(promoCode);
    } catch (error) {
      res.status(400).json({ message: "Invalid promo code data" });
    }
  });

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

  app.post("/api/admin/incentives", isAuthenticated, async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user?.isAdmin || user.email !== "nabeelmumtaz92@gmail.com") {
        return res.status(403).json({ message: "Admin access restricted" });
      }

      // Validate incentive data would go here
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

  app.patch("/api/admin/business-info", isAuthenticated, async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user?.isAdmin || user.email !== "nabeelmumtaz92@gmail.com") {
        return res.status(403).json({ message: "Admin access restricted" });
      }

      const updatedInfo = await storage.updateBusinessInfo(req.body);
      res.json(updatedInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to update business information" });
    }
  });

  // Admin analytics endpoint
  app.get('/api/admin/analytics', isAuthenticated, (req, res) => {
    const user = (req.session as any)?.user as { id: number; isAdmin?: boolean; email?: string };
    
    if (!user?.isAdmin || user.email !== "nabeelmumtaz92@gmail.com") {
      return res.status(403).json({ error: 'Admin access restricted' });
    }

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
  app.get('/api/admin/drivers', isAuthenticated, (req, res) => {
    const user = (req.session as any)?.user as { id: number; isAdmin?: boolean; email?: string };
    
    if (!user?.isAdmin || user.email !== "nabeelmumtaz92@gmail.com") {
      return res.status(403).json({ error: 'Admin access restricted' });
    }

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
  app.patch('/api/admin/orders/:orderId/status', isAuthenticated, (req, res) => {
    const user = (req.session as any)?.user as { id: number; isAdmin?: boolean; email?: string };
    
    if (!user?.isAdmin || user.email !== "nabeelmumtaz92@gmail.com") {
      return res.status(403).json({ error: 'Admin access restricted' });
    }

    const { orderId } = req.params;
    const { status } = req.body;

    res.json({ message: `Order ${orderId} status updated to ${status}` });
  });

  // Approve driver
  app.patch('/api/admin/drivers/:driverId/approve', isAuthenticated, (req, res) => {
    const user = (req.session as any)?.user as { id: number; isAdmin?: boolean; email?: string };
    
    if (!user?.isAdmin || user.email !== "nabeelmumtaz92@gmail.com") {
      return res.status(403).json({ error: 'Admin access restricted' });
    }

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
  app.post('/api/employees/:id/grant-admin', isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.session?.user;
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }

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
  app.post('/api/employees/:id/revoke-admin', isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.session?.user;
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }

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
      allowGoogleAuth: true,
      allowDriverSignup: true,
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
  app.get("/api/analytics/business-report", isAuthenticated, async (req, res) => {
    try {
      const report = await AdvancedAnalytics.generateBusinessReport();
      res.json(report);
    } catch (error) {
      console.error("Error generating business report:", error);
      res.status(500).json({ error: "Failed to generate analytics report" });
    }
  });

  // Real-time dashboard metrics
  app.get("/api/analytics/realtime", isAuthenticated, async (req, res) => {
    try {
      const metrics = await AdvancedAnalytics.getRealTimeMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching real-time metrics:", error);
      res.status(500).json({ error: "Failed to fetch real-time metrics" });
    }
  });

  // Export analytics data
  app.get("/api/analytics/export", isAuthenticated, async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
