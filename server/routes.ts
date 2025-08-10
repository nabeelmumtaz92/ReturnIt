import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertOrderSchema, insertUserSchema, insertPromoCodeSchema, 
  insertNotificationSchema, OrderStatus 
} from "@shared/schema";
import session from "express-session";

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

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.username) || 
                           await storage.getUserByEmail(validatedData.email);
      
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      // Create user (password should be hashed in production)
      const user = await storage.createUser(validatedData);
      
      // Log user in
      (req.session as any).user = { id: user.id, username: user.username, isDriver: user.isDriver };
      
      res.status(201).json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        isDriver: user.isDriver 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) { // In production, compare hashed passwords
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Log user in
      (req.session as any).user = { id: user.id, username: user.username, isDriver: user.isDriver };
      
      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        isDriver: user.isDriver 
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
      const validatedData = insertOrderSchema.parse({
        ...req.body,
        userId
      });
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: "Invalid order data" });
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

  const httpServer = createServer(app);
  return httpServer;
}
