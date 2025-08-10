import { pgTable, text, timestamp, integer, boolean, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enhanced Users table with profiles and preferences
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  isDriver: boolean("is_driver").default(false).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  profileImage: text("profile_image"),
  preferences: jsonb("preferences").default({}),
  addresses: jsonb("addresses").default([]),
  paymentMethods: jsonb("payment_methods").default([]),
  // Driver-specific fields
  driverLicense: text("driver_license"),
  vehicleInfo: jsonb("vehicle_info"),
  bankInfo: jsonb("bank_info"),
  driverRating: real("driver_rating").default(5.0),
  totalEarnings: real("total_earnings").default(0),
  completedDeliveries: integer("completed_deliveries").default(0),
  isOnline: boolean("is_online").default(false),
  currentLocation: jsonb("current_location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Enhanced Orders table with comprehensive tracking
export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: text("status").notNull().default("created"), // created, confirmed, assigned, pickup_scheduled, picked_up, in_transit, delivered, completed, cancelled, refunded
  trackingNumber: text("tracking_number").unique(),
  
  // Pickup details
  pickupAddress: text("pickup_address").notNull(),
  pickupCoordinates: jsonb("pickup_coordinates"),
  pickupInstructions: text("pickup_instructions"),
  pickupWindow: jsonb("pickup_window"), // start/end times
  scheduledPickupTime: timestamp("scheduled_pickup_time"),
  actualPickupTime: timestamp("actual_pickup_time"),
  
  // Return details
  retailer: text("retailer").notNull(),
  returnAddress: text("return_address"),
  returnCoordinates: jsonb("return_coordinates"),
  itemDescription: text("item_description").notNull(),
  itemCategory: text("item_category"),
  itemPhotos: jsonb("item_photos").default([]),
  returnReason: text("return_reason"),
  originalOrderNumber: text("original_order_number"),
  
  // Pricing and payments
  basePrice: real("base_price").default(3.99),
  surcharges: jsonb("surcharges").default([]),
  discountCode: text("discount_code"),
  discountAmount: real("discount_amount").default(0),
  totalPrice: real("total_price"),
  tip: real("tip").default(0),
  
  // Driver assignment
  driverId: integer("driver_id").references(() => users.id),
  driverAssignedAt: timestamp("driver_assigned_at"),
  estimatedDeliveryTime: timestamp("estimated_delivery_time"),
  actualDeliveryTime: timestamp("actual_delivery_time"),
  
  // Tracking and communication
  statusHistory: jsonb("status_history").default([]),
  customerNotes: text("customer_notes"),
  driverNotes: text("driver_notes"),
  adminNotes: text("admin_notes"),
  notifications: jsonb("notifications").default([]),
  
  // Quality and feedback
  customerRating: integer("customer_rating"), // 1-5 stars
  driverRating: integer("driver_rating"), // 1-5 stars
  customerFeedback: text("customer_feedback"),
  driverFeedback: text("driver_feedback"),
  
  // Logistics
  priority: text("priority").default("standard"), // standard, express, urgent
  isFragile: boolean("is_fragile").default(false),
  requiresSignature: boolean("requires_signature").default(false),
  insuranceValue: real("insurance_value"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Promotional codes and discounts
export const promoCodes = pgTable("promo_codes", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  code: text("code").notNull().unique(),
  description: text("description"),
  discountType: text("discount_type").notNull(), // percentage, fixed, free_delivery
  discountValue: real("discount_value").notNull(),
  minOrderValue: real("min_order_value").default(0),
  maxUses: integer("max_uses"),
  currentUses: integer("current_uses").default(0),
  isActive: boolean("is_active").default(true),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Driver earnings and payouts
export const driverEarnings = pgTable("driver_earnings", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  driverId: integer("driver_id").references(() => users.id).notNull(),
  orderId: text("order_id").references(() => orders.id).notNull(),
  baseEarning: real("base_earning").notNull(),
  tipEarning: real("tip_earning").default(0),
  bonusEarning: real("bonus_earning").default(0),
  totalEarning: real("total_earning").notNull(),
  status: text("status").default("pending"), // pending, paid, cancelled
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notifications system
export const notifications = pgTable("notifications", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // order_update, payment, promotion, system
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data").default({}),
  isRead: boolean("is_read").default(false),
  channel: text("channel").default("app"), // app, email, sms, push
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Analytics and metrics
export const analytics = pgTable("analytics", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  metric: text("metric").notNull(),
  value: real("value").notNull(),
  dimensions: jsonb("dimensions").default({}),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Insert schemas with validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  trackingNumber: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  pickupAddress: z.string().min(10, "Pickup address must be detailed"),
  itemDescription: z.string().min(5, "Item description required"),
  retailer: z.string().min(2, "Retailer name required"),
});

export const insertPromoCodeSchema = createInsertSchema(promoCodes).omit({
  id: true,
  currentUses: true,
  createdAt: true,
});

export const insertDriverEarningSchema = createInsertSchema(driverEarnings).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
});

// Enhanced types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type DriverEarning = typeof driverEarnings.$inferSelect;
export type InsertDriverEarning = z.infer<typeof insertDriverEarningSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;

// Status enums for type safety
export const OrderStatus = {
  CREATED: 'created',
  CONFIRMED: 'confirmed',
  ASSIGNED: 'assigned',
  PICKUP_SCHEDULED: 'pickup_scheduled',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const;

export const NotificationType = {
  ORDER_UPDATE: 'order_update',
  PAYMENT: 'payment',
  PROMOTION: 'promotion',
  SYSTEM: 'system'
} as const;

export const DiscountType = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  FREE_DELIVERY: 'free_delivery'
} as const;