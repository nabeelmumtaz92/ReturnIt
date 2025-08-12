import { pgTable, text, timestamp, integer, boolean, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enhanced Users table with profiles and preferences
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
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
  
  // Stripe Connect fields for drivers
  stripeConnectAccountId: text("stripe_connect_account_id"),
  stripeOnboardingComplete: boolean("stripe_onboarding_complete").default(false),
  paymentPreference: text("payment_preference").default("weekly"), // weekly, instant
  instantPayFeePreference: real("instant_pay_fee").default(1.00), // $0.50-$1.00 fee
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
  pickupStreetAddress: text("pickup_street_address").notNull(),
  pickupCity: text("pickup_city").notNull(),
  pickupState: text("pickup_state").notNull(),
  pickupZipCode: text("pickup_zip_code").notNull(),
  pickupCoordinates: jsonb("pickup_coordinates"),
  pickupInstructions: text("pickup_instructions"),
  pickupWindow: jsonb("pickup_window"), // start/end times
  scheduledPickupTime: timestamp("scheduled_pickup_time"),
  actualPickupTime: timestamp("actual_pickup_time"),
  
  // Return details
  retailer: text("retailer").notNull(),
  retailerLocation: jsonb("retailer_location"), // Store location data
  returnAddress: text("return_address"),
  returnCoordinates: jsonb("return_coordinates"),
  itemCategory: text("item_category").notNull(), // Electronics, Clothing, Home & Garden, Beauty & Health, Books & Media, Other
  itemDescription: text("item_description"),
  estimatedWeight: text("estimated_weight"), // Optional weight estimate for logistics
  itemPhotos: jsonb("item_photos").default([]),
  returnReason: text("return_reason"),
  originalOrderNumber: text("original_order_number"),
  
  // Box and pricing details
  boxSize: text("box_size").notNull(), // S, M, L, XL
  numberOfBoxes: integer("number_of_boxes").default(1).notNull(),
  
  // Pricing breakdown
  basePrice: real("base_price").default(3.99), // Minimum service fee
  distanceFee: real("distance_fee").default(0), // $0.50 per mile
  timeFee: real("time_fee").default(0), // $12/hour estimated time
  sizeUpcharge: real("size_upcharge").default(0), // L: +$2, XL: +$4
  multiBoxFee: real("multi_box_fee").default(0), // $1.50 per additional box
  serviceFee: real("service_fee").default(0), // 15% of subtotal
  
  // Optional fees and discounts
  rushFee: real("rush_fee").default(0), // Same-day pickup +$3
  surcharges: jsonb("surcharges").default([]),
  discountCode: text("discount_code"),
  discountAmount: real("discount_amount").default(0),
  tip: real("tip").default(0),
  totalPrice: real("total_price"),
  
  // Payment breakdown
  customerPaid: real("customer_paid"),
  driverBasePay: real("driver_base_pay").default(0), // $3 minimum per delivery
  driverDistancePay: real("driver_distance_pay").default(0), // $0.35 per mile
  driverTimePay: real("driver_time_pay").default(0), // $8/hour
  driverSizeBonus: real("driver_size_bonus").default(0), // L: +$1, XL: +$2
  driverTip: real("driver_tip").default(0), // 100% of customer tip
  driverTotalEarning: real("driver_total_earning").default(0),
  
  // Company revenue
  companyServiceFee: real("company_service_fee").default(0), // 15% service fee
  companyBaseFeeShare: real("company_base_fee_share").default(0), // $0.99 from base price
  companyDistanceFeeShare: real("company_distance_fee_share").default(0), // $0.15 per mile
  companyTimeFeeShare: real("company_time_fee_share").default(0), // $4/hour
  companyTotalRevenue: real("company_total_revenue").default(0),
  
  // Stripe Connect payment fields
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeChargeId: text("stripe_charge_id"),
  paymentStatus: text("payment_status").default("pending"), // pending, completed, failed, refunded
  peakSeasonBonus: real("peak_season_bonus").default(0),
  multiStopBonus: real("multi_stop_bonus").default(0),
  driverPayoutStatus: text("driver_payout_status").default("pending"), // pending, instant_paid, weekly_paid
  
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

// Driver payouts table for Stripe Connect payments
export const driverPayouts = pgTable("driver_payouts", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  driverId: integer("driver_id").references(() => users.id).notNull(),
  payoutType: text("payout_type").notNull(), // weekly, instant
  totalAmount: real("total_amount").notNull(),
  feeAmount: real("fee_amount").default(0), // Fee for instant payouts
  netAmount: real("net_amount").notNull(),
  stripeTransferId: text("stripe_transfer_id"),
  status: text("status").default("pending"), // pending, completed, failed
  orderIds: jsonb("order_ids").default([]), // Array of order IDs included
  taxYear: integer("tax_year").notNull(),
  form1099Generated: boolean("form_1099_generated").default(false),
  form1099Url: text("form_1099_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Incentives and bonuses tracking
export const driverIncentives = pgTable("driver_incentives", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  driverId: integer("driver_id").references(() => users.id).notNull(),
  orderId: text("order_id").references(() => orders.id),
  incentiveType: text("incentive_type").notNull(), // size_bonus, peak_season, multi_stop, referral
  description: text("description").notNull(),
  amount: real("amount").notNull(),
  isActive: boolean("is_active").default(true),
  qualificationCriteria: jsonb("qualification_criteria").default({}),
  packageSize: text("package_size"), // for size bonuses
  multiStopCount: integer("multi_stop_count"), // for multi-stop bonuses
  peakSeasonMultiplier: real("peak_season_multiplier"), // for peak season
  createdAt: timestamp("created_at").defaultNow().notNull(),
  earnedAt: timestamp("earned_at"),
});

// Business information and contact details
export const businessInfo = pgTable("business_info", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  companyName: text("company_name").default("Returnly"),
  tagline: text("tagline").default("Making Returns Effortless"),
  description: text("description"),
  headquarters: text("headquarters").default("St. Louis, MO"),
  supportEmail: text("support_email").default("support@returnly.com"),
  supportPhone: text("support_phone").default("(555) 123-4567"),
  businessHours: text("business_hours").default("Mon–Sat, 8 AM – 8 PM CST"),
  instagramHandle: text("instagram_handle").default("@ReturnlyApp"),
  facebookUrl: text("facebook_url").default("facebook.com/Returnly"),
  twitterHandle: text("twitter_handle").default("@Returnly"),
  missionStatement: text("mission_statement"),
  foundingStory: text("founding_story"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

export const insertDriverPayoutSchema = createInsertSchema(driverPayouts).omit({
  id: true,
  createdAt: true,
});

export const insertDriverIncentiveSchema = createInsertSchema(driverIncentives).omit({
  id: true,
  createdAt: true,
});

export const insertBusinessInfoSchema = createInsertSchema(businessInfo).omit({
  id: true,
  updatedAt: true,
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
export type DriverPayout = typeof driverPayouts.$inferSelect;
export type InsertDriverPayout = z.infer<typeof insertDriverPayoutSchema>;
export type DriverIncentive = typeof driverIncentives.$inferSelect;
export type InsertDriverIncentive = z.infer<typeof insertDriverIncentiveSchema>;
export type BusinessInfo = typeof businessInfo.$inferSelect;
export type InsertBusinessInfo = z.infer<typeof insertBusinessInfoSchema>;

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