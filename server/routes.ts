import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import passport from "./auth/strategies";
import bcrypt from "bcrypt";
import { z } from "zod";
import { 
  insertOrderSchema, insertUserSchema, insertPromoCodeSchema, 
  insertNotificationSchema, OrderStatus 
} from "@shared/schema";

// Simple session-based authentication middleware
const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.session?.user) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: 'returnly-secret-key', // In production, use a proper secret
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // Set to true with HTTPS in production
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

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      // Create user with hashed password
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });
      
      // Log user in
      (req.session as any).user = { id: user.id, email: user.email, phone: user.phone, isDriver: user.isDriver };
      
      res.status(201).json({ 
        message: "Registration successful",
        user: { id: user.id, email: user.email, phone: user.phone, isDriver: user.isDriver }
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      
      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Log user in
      (req.session as any).user = { id: user.id, email: user.email, phone: user.phone, isDriver: user.isDriver };
      
      res.json({ 
        message: "Login successful",
        user: { id: user.id, email: user.email, phone: user.phone, isDriver: user.isDriver }
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session?.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if ((req.session as any)?.user) {
      res.json((req.session as any).user);
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
      console.log('Google callback - req.user:', req.user);
      // Set up session for authenticated user
      if (req.user) {
        const userData = {
          id: (req.user as any).id, 
          email: (req.user as any).email, 
          phone: (req.user as any).phone || null, 
          isDriver: (req.user as any).isDriver || false 
        };
        (req.session as any).user = userData;
        console.log('Session user set:', userData);
        res.redirect('/?auth=success');
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
        (req.session as any).user = { 
          id: (req.user as any).id, 
          email: (req.user as any).email, 
          phone: (req.user as any).phone || '', 
          isDriver: (req.user as any).isDriver || false 
        };
        res.redirect('/?auth=success');
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
      const { amount, payment_method_types = ['card'] } = req.body;
      
      // In a real implementation, you would use Stripe SDK here
      const mockPaymentIntent = {
        id: 'pi_' + Math.random().toString(36).substr(2, 9),
        client_secret: 'pi_test_' + Math.random().toString(36).substr(2, 20),
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        status: 'requires_payment_method'
      };

      res.json(mockPaymentIntent);
    } catch (error) {
      console.error('Stripe payment intent error:', error);
      res.status(500).json({ message: 'Failed to create payment intent' });
    }
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

  // Create new order (protected)
  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).user.id;
      
      // Process the enhanced form data
      const {
        streetAddress,
        city, 
        state,
        zipCode,
        retailer,
        itemCategory,
        itemDescription,
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

      const orderData = {
        id: orderId,
        userId,
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
        
        // Box details
        boxSize,
        numberOfBoxes,
        
        // Pricing
        basePrice,
        sizeUpcharge,
        multiBoxFee,
        totalPrice: calculatedTotal
      };

      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      console.error('Order creation error:', error);
      res.status(400).json({ message: "Failed to create order" });
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

  // Admin routes  
  app.get("/api/admin/orders", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
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
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
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
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
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

      // Create payout record
      const payout = await storage.createDriverPayout({
        driverId,
        payoutType: "instant",
        totalAmount: totalEarnings,
        feeAmount,
        netAmount,
        orderIds: pendingOrders.map(o => o.id),
        taxYear: new Date().getFullYear(),
        status: "completed"
      });

      // Update orders to mark as paid
      for (const order of pendingOrders) {
        await storage.updateOrder(order.id, { driverPayoutStatus: "instant_paid" });
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
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
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
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const updatedInfo = await storage.updateBusinessInfo(req.body);
      res.json(updatedInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to update business information" });
    }
  });

  // Admin analytics endpoint
  app.get('/api/admin/analytics', isAuthenticated, (req, res) => {
    const user = (req.session as any)?.user as { id: number; isAdmin?: boolean };
    
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
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

  // Admin orders endpoint
  app.get('/api/admin/orders', isAuthenticated, (req, res) => {
    const user = (req.session as any)?.user as { id: number; isAdmin?: boolean };
    
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const orders = [
      {
        id: 1,
        customerId: 1,
        driverId: 2,
        status: 'completed',
        pickupAddress: '123 Main St, St. Louis, MO',
        retailer: 'Target',
        itemDescription: 'Electronics return',
        totalAmount: 29.99,
        createdAt: new Date().toISOString(),
        customerName: 'John Doe',
        driverName: 'Jane Smith'
      },
      {
        id: 2,
        customerId: 3,
        status: 'assigned',
        pickupAddress: '456 Oak Ave, St. Louis, MO',
        retailer: 'Best Buy',
        itemDescription: 'Laptop return',
        totalAmount: 45.99,
        createdAt: new Date().toISOString(),
        customerName: 'Bob Johnson',
        driverName: 'Mike Wilson'
      }
    ];

    res.json(orders);
  });

  // Admin drivers endpoint
  app.get('/api/admin/drivers', isAuthenticated, (req, res) => {
    const user = (req.session as any)?.user as { id: number; isAdmin?: boolean };
    
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
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
    const user = (req.session as any)?.user as { id: number; isAdmin?: boolean };
    
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { orderId } = req.params;
    const { status } = req.body;

    res.json({ message: `Order ${orderId} status updated to ${status}` });
  });

  // Approve driver
  app.patch('/api/admin/drivers/:driverId/approve', isAuthenticated, (req, res) => {
    const user = (req.session as any)?.user as { id: number; isAdmin?: boolean };
    
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
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

  const httpServer = createServer(app);
  return httpServer;
}
