import { pgTable, text, timestamp, integer, boolean, real, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Location schema for type safety
export const LocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  accuracy: z.number().optional(),
  heading: z.number().optional(),
  speed: z.number().optional(),
  timestamp: z.string()
});

export type Location = z.infer<typeof LocationSchema>;

// Enhanced Users table with profiles and preferences
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  dateOfBirth: text("date_of_birth"),
  isDriver: boolean("is_driver").default(false).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  role: text("role").default("customer"), // customer, driver, support, admin, manager
  department: text("department"), // support, operations, management, etc.
  employeeId: text("employee_id"),
  permissions: jsonb("permissions").default([]), // Array of specific permissions
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
  
  // Tutorial and onboarding tracking
  tutorialCompleted: boolean("tutorial_completed").default(false),
  hireDate: timestamp("hire_date"),
  
  // Multi-city expansion fields
  assignedCity: text("assigned_city").default("st-louis"),
  serviceZones: jsonb("service_zones").default([]),
  
  // Driver schedule and route management
  availableHours: jsonb("available_hours").default({}), // Weekly schedule: {monday: {start: "09:00", end: "17:00", available: true}, ...}
  preferredRoutes: jsonb("preferred_routes").default([]), // Array of preferred areas/routes
  serviceRadius: real("service_radius").default(25.0), // Maximum distance willing to travel (miles)
  
  // Emergency and safety features
  emergencyContacts: jsonb("emergency_contacts").default([]),
  lastSafetyCheck: timestamp("last_safety_check"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// SMS Notifications table
export const smsNotifications = pgTable("sms_notifications", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: integer("user_id").references(() => users.id).notNull(),
  orderId: integer("order_id").references(() => orders.id),
  phoneNumber: text("phone_number").notNull(),
  messageType: text("message_type").notNull(), // order_confirmed, driver_assigned, driver_arriving, delivered, etc.
  message: text("message").notNull(),
  status: text("status").notNull().default("pending"), // pending, sent, delivered, failed
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  failureReason: text("failure_reason"),
  twilioMessageId: text("twilio_message_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Customer Loyalty Program
export const loyaltyProgram = pgTable("loyalty_program", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: integer("user_id").references(() => users.id).notNull(),
  totalPoints: integer("total_points").default(0).notNull(),
  availablePoints: integer("available_points").default(0).notNull(),
  membershipTier: text("membership_tier").default("bronze").notNull(), // bronze, silver, gold, platinum
  tierBenefits: jsonb("tier_benefits").default({}),
  lifetimeSpent: real("lifetime_spent").default(0).notNull(),
  referralCode: text("referral_code").unique(),
  referredBy: integer("referred_by").references(() => users.id),
  joinDate: timestamp("join_date").defaultNow().notNull(),
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
});

// Loyalty Transactions
export const loyaltyTransactions = pgTable("loyalty_transactions", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: integer("user_id").references(() => users.id).notNull(),
  orderId: integer("order_id").references(() => orders.id),
  transactionType: text("transaction_type").notNull(), // earned, redeemed, expired, bonus
  pointsAmount: integer("points_amount").notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Real-time Chat System
export const chatConversations = pgTable("chat_conversations", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  orderId: integer("order_id").references(() => orders.id),
  customerId: integer("customer_id").references(() => users.id).notNull(),
  driverId: integer("driver_id").references(() => users.id),
  supportAgentId: integer("support_agent_id").references(() => users.id),
  conversationType: text("conversation_type").notNull(), // customer_driver, customer_support, driver_dispatch
  status: text("status").default("active").notNull(), // active, closed, escalated
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  conversationId: integer("conversation_id").references(() => chatConversations.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  messageType: text("message_type").default("text").notNull(), // text, image, location, system
  messageContent: text("message_content").notNull(),
  attachments: jsonb("attachments").default([]),
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Route Optimization
export const routeOptimization = pgTable("route_optimization", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  driverId: integer("driver_id").references(() => users.id).notNull(),
  routeDate: timestamp("route_date").notNull(),
  orderIds: jsonb("order_ids").notNull(), // Array of order IDs
  optimizedRoute: jsonb("optimized_route").notNull(), // Optimized waypoints
  estimatedDuration: integer("estimated_duration"), // In minutes
  estimatedDistance: real("estimated_distance"), // In miles
  actualDuration: integer("actual_duration"),
  actualDistance: real("actual_distance"),
  fuelCostEstimate: real("fuel_cost_estimate"),
  routeStatus: text("route_status").default("planned").notNull(), // planned, in_progress, completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Driver Safety Features
export const driverSafety = pgTable("driver_safety", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  driverId: integer("driver_id").references(() => users.id).notNull(),
  eventType: text("event_type").notNull(), // panic_button, check_in, check_out, emergency_alert
  location: jsonb("location").notNull(), // GPS coordinates
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  status: text("status").default("active").notNull(), // active, resolved, false_alarm
  emergencyContacts: jsonb("emergency_contacts").default([]),
  responseTime: integer("response_time"), // Minutes to resolution
  resolvedBy: integer("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  notes: text("notes"),
  metadata: jsonb("metadata").default({}),
});

// Return Label Generation (Design Only - Not Implemented)
export const returnLabels = pgTable("return_labels", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  retailerName: text("retailer_name").notNull(),
  labelType: text("label_type").notNull(), // qr_code, barcode, pdf_label
  labelUrl: text("label_url"),
  trackingNumber: text("tracking_number"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  usedAt: timestamp("used_at"),
  status: text("status").default("generated").notNull(), // generated, printed, used, expired
});

// Driver Documents table for digital document management
export const driverDocuments = pgTable("driver_documents", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  driverId: integer("driver_id").references(() => users.id).notNull(),
  documentType: text("document_type").notNull(), // drivers-license, vehicle-registration, insurance, etc.
  documentTitle: text("document_title").notNull(),
  documentCategory: text("document_category").notNull(), // identity, vehicle, insurance, background, legal, tax
  status: text("status").notNull().default("pending"), // pending, uploaded, approved, rejected
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  uploadedAt: timestamp("uploaded_at"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewNotes: text("review_notes"),
  expiresAt: timestamp("expires_at"),
  isRequired: boolean("is_required").default(true).notNull(),
  digitalSignature: text("digital_signature"),
  signedAt: timestamp("signed_at"),
  metadata: jsonb("metadata").default({}), // Additional document metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Enhanced Orders table with comprehensive tracking
// Individual Items within Orders (all items go to same store per order)
export const orderItems = pgTable("order_items", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  orderId: text("order_id").notNull(),
  itemName: text("item_name"),
  itemDescription: text("item_description"),
  itemValue: real("item_value").notNull(), // Individual item value
  category: text("category"), // Electronics, Clothing, etc.
  condition: text("condition"), // New, Used, Damaged
  reason: text("reason"), // Reason for return
  originalOrderNumber: text("original_order_number"), // Customer's original order number for this item
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: text("status").notNull().default("created"), // created, confirmed, assigned, pickup_scheduled, picked_up, in_transit, delivered, completed, cancelled, refunded, return_refused
  trackingNumber: text("tracking_number").unique(),
  trackingEnabled: boolean("tracking_enabled").default(true).notNull(),
  trackingExpiresAt: timestamp("tracking_expires_at"),
  
  // Pickup details
  pickupStreetAddress: text("pickup_street_address").notNull(),
  pickupCity: text("pickup_city").notNull(),
  pickupState: text("pickup_state").notNull(),
  pickupZipCode: text("pickup_zip_code").notNull(),
  pickupCoordinates: jsonb("pickup_coordinates"),
  pickupLocation: text("pickup_location").default("inside").notNull(), // 'inside' or 'outside'
  pickupInstructions: text("pickup_instructions"),
  acceptsLiabilityTerms: boolean("accepts_liability_terms").default(false).notNull(), // Required for outside pickup
  pickupWindow: jsonb("pickup_window"), // start/end times
  scheduledPickupTime: timestamp("scheduled_pickup_time"),
  actualPickupTime: timestamp("actual_pickup_time"),
  
  // Return details (single store per order)
  retailer: text("retailer").notNull(), // Store name where ALL items will be returned
  retailerLocation: jsonb("retailer_location"), // Store location data
  returnAddress: text("return_address"), // Physical store address
  returnCoordinates: jsonb("return_coordinates"), // Store GPS coordinates
  itemCategory: text("item_category").notNull(), // Electronics, Clothing, Home & Garden, Beauty & Health, Books & Media, Other
  itemDescription: text("item_description"),
  estimatedWeight: text("estimated_weight"), // Optional weight estimate for logistics
  itemPhotos: jsonb("item_photos").default([]),
  returnReason: text("return_reason"),
  originalOrderNumber: text("original_order_number"),
  
  // Return Authorization Fields
  purchaseType: text("purchase_type").notNull(), // "online" or "in_store" 
  hasOriginalTags: boolean("has_original_tags").default(false).notNull(),
  receiptUploaded: boolean("receipt_uploaded").default(false).notNull(),
  receiptUrl: text("receipt_url"), // URL to uploaded receipt/proof of purchase
  returnLabelUrl: text("return_label_url"), // For online returns - uploaded label or QR
  authorizationSigned: boolean("authorization_signed").default(false).notNull(),
  authorizationSignature: text("authorization_signature"), // Digital signature data
  authorizationTimestamp: timestamp("authorization_timestamp"),
  requiresInStoreReturn: boolean("requires_in_store_return").default(false).notNull(),
  requiresCarrierDropoff: boolean("requires_carrier_dropoff").default(false).notNull(),
  
  // Item and pricing details
  numberOfItems: integer("number_of_items").default(1).notNull(),
  itemSize: text("item_size").notNull(), // S, M, L, XL (individual item size)
  packagingType: text("packaging_type").default("bag"), // bag, box, envelope, none
  
  // Pricing breakdown
  basePrice: real("base_price").default(3.99), // Base service fee (always applied)
  distanceFee: real("distance_fee").default(0), // $0.50 per mile
  timeFee: real("time_fee").default(0), // $12/hour estimated time
  sizeUpcharge: real("size_upcharge").default(0), // L: +$2, XL: +$4
  multiItemFee: real("multi_item_fee").default(0), // $1.00 per additional item
  serviceFee: real("service_fee").default(0), // 15% of subtotal
  taxAmount: real("tax_amount").default(0), // Sales tax on service
  
  // Tiered value-based pricing (based on total order value)
  totalOrderValue: real("total_order_value"), // Combined value of all items in this order
  valueTier: text("value_tier"), // Standard, Basic, Express, Basic+, Value, Value+, Enhanced, Enhanced+, Premium, Premium+, Ultra Premium, Ultra Premium+, Elite Luxury
  valueTierFee: real("value_tier_fee").default(0), // Fixed fee based on value tier
  serviceFeeRate: real("service_fee_rate").default(0.15), // Variable service fee rate (15% to 35%)
  driverValueBonus: real("driver_value_bonus").default(0), // Driver bonus for value tier handling
  
  // Optional fees and discounts
  rushFee: real("rush_fee").default(0), // Same-day pickup +$3
  surcharges: jsonb("surcharges").default([]),
  discountCode: text("discount_code"),
  discountAmount: real("discount_amount").default(0),
  tip: real("tip").default(0),
  totalPrice: real("total_price"), // Full amount paid by customer
  itemRefundAmount: real("item_refund_amount"), // Calculated refundable amount (excludes service fee/tax)
  
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
  paymentStatus: text("payment_status").default("pending"), // pending, completed, failed, refunded, refund_processing, refund_failed
  paymentMethod: text("payment_method").default("stripe"), // stripe, paypal, apple_pay, google_pay
  originalPaymentMethod: text("original_payment_method"), // card, bank_account, paypal, etc.
  
  // Refund tracking fields
  stripeRefundId: text("stripe_refund_id"),
  refundAmount: real("refund_amount"), // Actual amount refunded (item cost only)
  itemCost: real("item_cost"), // Item cost only (excludes service fee and taxes)
  refundMethod: text("refund_method"), // original_payment, store_credit, cash, check
  refundStatus: text("refund_status"), // pending, processing, completed, failed
  refundProcessedAt: timestamp("refund_processed_at"),
  refundCompletedAt: timestamp("refund_completed_at"),
  refundReason: text("refund_reason"), // return_delivered, damaged_item, customer_request, admin_override, return_refused
  
  // Failed return handling
  returnRefused: boolean("return_refused").default(false), // Store refused to accept return
  returnRefusedReason: text("return_refused_reason"), // Why store refused (expired return window, no receipt, damaged, policy violation)
  returnRefusedPhotos: jsonb("return_refused_photos").default([]), // Photos of refused return attempt
  returnToCustomer: boolean("return_to_customer").default(false), // Driver returned items to customer
  returnToCustomerTime: timestamp("return_to_customer_time"), // When items were returned to customer
  returnToCustomerPhotos: jsonb("return_to_customer_photos").default([]), // Photos of customer return
  additionalDeliveryFee: real("additional_delivery_fee").default(0), // Extra fee for return to customer trip
  refundNotes: text("refund_notes"),
  
  // Customer refund preferences
  customerRefundPreference: text("customer_refund_preference").default("original_payment"), // original_payment, store_credit
  storeCreditBalance: real("store_credit_balance").default(0),
  storeCreditUsed: real("store_credit_used").default(0),
  
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
  orderId: text("order_id").references(() => orders.id), // Optional reference to order
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

// Business Intelligence - Fact Tables
export const factOrders = pgTable("fact_orders", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  orderId: text("order_id").references(() => orders.id).notNull(),
  customerId: integer("customer_id").references(() => users.id).notNull(),
  driverId: integer("driver_id").references(() => users.id),
  merchantId: integer("merchant_id"),
  dateId: integer("date_id").notNull(),
  regionId: integer("region_id").notNull(),
  serviceLevel: text("service_level").notNull(),
  orderValue: real("order_value").notNull(),
  revenue: real("revenue").notNull(),
  driverPayout: real("driver_payout").notNull(),
  platformFee: real("platform_fee").notNull(),
  distance: real("distance"),
  duration: integer("duration"), // minutes
  status: text("status").notNull(),
  pickupTime: timestamp("pickup_time"),
  deliveryTime: timestamp("delivery_time"),
  slaCompliance: boolean("sla_compliance").default(true),
  exceptionFlag: boolean("exception_flag").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const factPayments = pgTable("fact_payments", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  orderId: text("order_id").references(() => orders.id).notNull(),
  transactionId: text("transaction_id").notNull().unique(),
  customerId: integer("customer_id").references(() => users.id).notNull(),
  merchantId: integer("merchant_id"),
  dateId: integer("date_id").notNull(),
  amount: real("amount").notNull(),
  fees: real("fees").notNull(),
  netAmount: real("net_amount").notNull(),
  paymentMethod: text("payment_method").notNull(),
  processorResponse: jsonb("processor_response").default({}),
  riskScore: real("risk_score"),
  threeDSecure: boolean("three_d_secure").default(false),
  status: text("status").notNull(), // authorized, captured, refunded, voided, failed
  failureReason: text("failure_reason"),
  chargebackFlag: boolean("chargeback_flag").default(false),
  refundAmount: real("refund_amount").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  settledAt: timestamp("settled_at"),
});

export const factPayouts = pgTable("fact_payouts", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  payoutId: integer("payout_id").references(() => driverPayouts.id).notNull(),
  driverId: integer("driver_id").references(() => users.id).notNull(),
  dateId: integer("date_id").notNull(),
  regionId: integer("region_id").notNull(),
  payoutType: text("payout_type").notNull(), // weekly, instant
  grossEarnings: real("gross_earnings").notNull(),
  fees: real("fees").notNull(),
  netPayout: real("net_payout").notNull(),
  orderCount: integer("order_count").notNull(),
  tips: real("tips").default(0),
  bonuses: real("bonuses").default(0),
  adjustments: real("adjustments").default(0),
  taxWithholdings: real("tax_withholdings").default(0),
  status: text("status").notNull(),
  processingTime: integer("processing_time"), // minutes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const factTickets = pgTable("fact_tickets", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  ticketId: integer("ticket_id").notNull(),
  customerId: integer("customer_id").references(() => users.id),
  orderId: text("order_id").references(() => orders.id),
  assignedAgentId: integer("assigned_agent_id").references(() => users.id),
  dateId: integer("date_id").notNull(),
  category: text("category").notNull(),
  priority: text("priority").notNull(),
  channel: text("channel").notNull(),
  firstResponseTime: integer("first_response_time"), // minutes
  resolutionTime: integer("resolution_time"), // minutes
  totalMessages: integer("total_messages").notNull(),
  escalationLevel: integer("escalation_level").default(0),
  satisfactionScore: integer("satisfaction_score"), // 1-5
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const factFeedback = pgTable("fact_feedback", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  feedbackId: integer("feedback_id").notNull(),
  entityType: text("entity_type").notNull(), // order, driver, merchant, app
  entityId: text("entity_id").notNull(),
  customerId: integer("customer_id").references(() => users.id).notNull(),
  orderId: text("order_id").references(() => orders.id),
  driverId: integer("driver_id").references(() => users.id),
  dateId: integer("date_id").notNull(),
  source: text("source").notNull(), // post-pickup, post-delivery, app-store, survey
  rating: integer("rating"), // 1-5
  npsScore: integer("nps_score"), // 0-10
  sentiment: text("sentiment"), // positive, neutral, negative
  category: text("category"),
  severity: text("severity"), // low, medium, high, critical
  hasComment: boolean("has_comment").default(false),
  autoTicketCreated: boolean("auto_ticket_created").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Business Intelligence - Dimension Tables
export const dimDate = pgTable("dim_date", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  dateValue: timestamp("date_value").notNull().unique(),
  dayOfWeek: integer("day_of_week").notNull(),
  dayName: text("day_name").notNull(),
  month: integer("month").notNull(),
  monthName: text("month_name").notNull(),
  quarter: integer("quarter").notNull(),
  year: integer("year").notNull(),
  isWeekend: boolean("is_weekend").default(false),
  isHoliday: boolean("is_holiday").default(false),
  fiscalYear: integer("fiscal_year").notNull(),
  fiscalQuarter: integer("fiscal_quarter").notNull(),
});

export const dimRegion = pgTable("dim_region", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  regionName: text("region_name").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCodes: jsonb("zip_codes").default([]),
  timezone: text("timezone").notNull(),
  population: integer("population"),
  marketSize: text("market_size"), // small, medium, large
  isActive: boolean("is_active").default(true),
  launchDate: timestamp("launch_date").defaultNow(),
});

export const dimMerchant = pgTable("dim_merchant", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  merchantName: text("merchant_name").notNull(),
  category: text("category").notNull(),
  tier: text("tier"), // bronze, silver, gold, enterprise
  onboardingDate: timestamp("onboarding_date").notNull(),
  status: text("status").default("active"),
  avgOrderValue: real("avg_order_value"),
  returnPolicy: jsonb("return_policy").default({}),
  isActive: boolean("is_active").default(true),
});

export const dimServiceLevel = pgTable("dim_service_level", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  serviceName: text("service_name").notNull(),
  description: text("description"),
  basePrice: real("base_price").notNull(),
  slaHours: integer("sla_hours"),
  features: jsonb("features").default([]),
  isActive: boolean("is_active").default(true),
});

// Transaction Management
export const transactions = pgTable("transactions", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  transactionId: text("transaction_id").notNull().unique(),
  orderId: text("order_id").references(() => orders.id).notNull(),
  customerId: integer("customer_id").references(() => users.id).notNull(),
  merchantOfRecord: text("merchant_of_record"),
  amount: real("amount").notNull(),
  currency: text("currency").default("USD"),
  status: text("status").notNull(), // authorized, captured, refunded, voided, failed
  paymentMethod: text("payment_method").notNull(),
  paymentMethodDetails: jsonb("payment_method_details").default({}),
  processorTransactionId: text("processor_transaction_id"),
  processorResponse: jsonb("processor_response").default({}),
  threeDSecureData: jsonb("three_d_secure_data").default({}),
  avsResult: text("avs_result"),
  cvvResult: text("cvv_result"),
  riskScore: real("risk_score"),
  riskFlags: jsonb("risk_flags").default([]),
  fraudulent: boolean("fraudulent").default(false),
  chargebackFlag: boolean("chargeback_flag").default(false),
  chargebackDate: timestamp("chargeback_date"),
  chargebackReason: text("chargeback_reason"),
  refunds: jsonb("refunds").default([]),
  disputeEvidence: jsonb("dispute_evidence").default({}),
  idempotencyKey: text("idempotency_key").unique(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  capturedAt: timestamp("captured_at"),
  settledAt: timestamp("settled_at"),
  refundedAt: timestamp("refunded_at"),
});

// Enhanced Support System
export const supportTicketsEnhanced = pgTable("support_tickets_enhanced", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  ticketNumber: text("ticket_number").notNull().unique(),
  customerId: integer("customer_id").references(() => users.id),
  orderId: text("order_id").references(() => orders.id),
  assignedAgentId: integer("assigned_agent_id").references(() => users.id),
  category: text("category").notNull(), // order_issue, payment, refund, general
  priority: text("priority").default("medium"), // low, medium, high, urgent
  status: text("status").default("open"), // open, in_progress, waiting, resolved, closed
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  channel: text("channel").notNull(), // chat, email, phone, app
  tags: jsonb("tags").default([]),
  satisfaction: integer("satisfaction"), // 1-5 rating
  satisfactionComment: text("satisfaction_comment"),
  internalNotes: text("internal_notes"),
  escalationLevel: integer("escalation_level").default(0),
  slaBreached: boolean("sla_breached").default(false),
  firstResponseTime: integer("first_response_time"), // minutes
  resolutionTime: integer("resolution_time"), // minutes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
  closedAt: timestamp("closed_at"),
});

export const supportMessages = pgTable("support_messages", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  ticketId: integer("ticket_id").references(() => supportTicketsEnhanced.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  senderType: text("sender_type").notNull(), // customer, agent, system
  messageType: text("message_type").default("text"), // text, attachment, system, canned_response
  content: text("content").notNull(),
  attachments: jsonb("attachments").default([]),
  isInternal: boolean("is_internal").default(false),
  cannedResponseId: integer("canned_response_id"),
  readBy: jsonb("read_by").default([]), // Array of user IDs who read this
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cannedResponses = pgTable("canned_responses", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  tags: jsonb("tags").default([]),
  usageCount: integer("usage_count").default(0),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Live Chat System (Enhanced)
export const liveChatSessions = pgTable("live_chat_sessions", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  sessionId: text("session_id").notNull().unique(),
  customerId: integer("customer_id").references(() => users.id),
  orderId: text("order_id").references(() => orders.id),
  assignedAgentId: integer("assigned_agent_id").references(() => users.id),
  status: text("status").default("active"), // active, waiting, transferred, ended
  channel: text("channel").default("web"), // web, mobile, whatsapp
  priority: text("priority").default("normal"), // low, normal, high, vip
  queue: text("queue"), // general, technical, billing, vip
  language: text("language").default("en"),
  customerVerified: boolean("customer_verified").default(false),
  tags: jsonb("tags").default([]),
  satisfaction: integer("satisfaction"), // 1-5 rating
  waitTime: integer("wait_time"), // seconds before agent assignment
  chatDuration: integer("chat_duration"), // seconds
  messageCount: integer("message_count").default(0),
  transferCount: integer("transfer_count").default(0),
  escalated: boolean("escalated").default(false),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  assignedAt: timestamp("assigned_at"),
  endedAt: timestamp("ended_at"),
});

export const liveChatMessages = pgTable("live_chat_messages", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  sessionId: integer("session_id").references(() => liveChatSessions.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  senderType: text("sender_type").notNull(), // customer, agent, system, bot
  messageType: text("message_type").default("text"), // text, image, file, card, quick_action
  content: text("content").notNull(),
  richContent: jsonb("rich_content").default({}), // Cards, buttons, etc.
  attachments: jsonb("attachments").default([]),
  quickActions: jsonb("quick_actions").default([]),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  edited: boolean("edited").default(false),
  editedAt: timestamp("edited_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Customer Feedback & VOC System
export const customerFeedback = pgTable("customer_feedback", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  customerId: integer("customer_id").references(() => users.id).notNull(),
  orderId: text("order_id").references(() => orders.id),
  driverId: integer("driver_id").references(() => users.id),
  entityType: text("entity_type").notNull(), // order, driver, merchant, app, article
  entityId: text("entity_id").notNull(),
  source: text("source").notNull(), // post-pickup, post-delivery, app-store, survey, help-article
  feedbackType: text("feedback_type").notNull(), // rating, nps, comment, thumbs
  rating: integer("rating"), // 1-5 stars
  npsScore: integer("nps_score"), // 0-10
  thumbsUp: boolean("thumbs_up"),
  comment: text("comment"),
  sentiment: text("sentiment"), // positive, neutral, negative
  sentimentScore: real("sentiment_score"), // -1 to 1
  categories: jsonb("categories").default([]), // Auto-categorized topics
  tags: jsonb("tags").default([]),
  severity: text("severity").default("low"), // low, medium, high, critical
  actionRequired: boolean("action_required").default(false),
  linkedTicketId: integer("linked_ticket_id").references(() => supportTicketsEnhanced.id),
  escalated: boolean("escalated").default(false),
  responded: boolean("responded").default(false),
  responseText: text("response_text"),
  respondedAt: timestamp("responded_at"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Financial Operations
export const financialAccounts = pgTable("financial_accounts", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  accountType: text("account_type").notNull(), // cash, accounts_receivable, accounts_payable, reserve
  accountName: text("account_name").notNull(),
  accountNumber: text("account_number").unique(),
  balance: real("balance").default(0),
  currency: text("currency").default("USD"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  parentAccountId: integer("parent_account_id"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const journalEntries = pgTable("journal_entries", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  entryNumber: text("entry_number").notNull().unique(),
  entryDate: timestamp("entry_date").defaultNow().notNull(),
  description: text("description").notNull(),
  reference: text("reference"), // Order ID, Payout ID, etc.
  totalAmount: real("total_amount").notNull(),
  status: text("status").default("posted"), // draft, posted, reversed
  entryType: text("entry_type").notNull(), // order_revenue, payout, adjustment, refund
  approvedBy: integer("approved_by").references(() => users.id),
  reversedBy: integer("reversed_by").references(() => users.id),
  reversalReason: text("reversal_reason"),
  metadata: jsonb("metadata").default({}),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reversedAt: timestamp("reversed_at"),
});

export const journalEntryLines = pgTable("journal_entry_lines", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  journalEntryId: integer("journal_entry_id").references(() => journalEntries.id).notNull(),
  accountId: integer("account_id").references(() => financialAccounts.id).notNull(),
  debitAmount: real("debit_amount").default(0),
  creditAmount: real("credit_amount").default(0),
  description: text("description").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Enhanced Tax Reporting
export const taxProfiles = pgTable("tax_profiles", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: integer("user_id").references(() => users.id).notNull(),
  taxYear: integer("tax_year").notNull(),
  businessType: text("business_type"), // sole_proprietor, llc, corporation
  ein: text("ein"),
  ssn: text("ssn"), // Encrypted
  legalName: text("legal_name").notNull(),
  businessName: text("business_name"),
  addresses: jsonb("addresses").default([]),
  w9Status: text("w9_status").default("not_requested"), // not_requested, requested, received, verified
  w9RequestedAt: timestamp("w9_requested_at"),
  w9ReceivedAt: timestamp("w9_received_at"),
  w9Url: text("w9_url"),
  tinMatchingStatus: text("tin_matching_status"), // pending, matched, failed
  backupWithholding: boolean("backup_withholding").default(false),
  withholdingRate: real("withholding_rate").default(0.24),
  electronicDelivery: boolean("electronic_delivery").default(false),
  emailDelivery: boolean("email_delivery").default(true),
  mailingAddress: jsonb("mailing_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tax1099Records = pgTable("tax_1099_records", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: integer("user_id").references(() => users.id).notNull(),
  taxYear: integer("tax_year").notNull(),
  formType: text("form_type").default("1099-NEC"), // 1099-NEC, 1099-K
  grossPayments: real("gross_payments").notNull(),
  federalWithheld: real("federal_withheld").default(0),
  stateWithheld: real("state_withheld").default(0),
  adjustments: real("adjustments").default(0),
  correctedAmount: real("corrected_amount"),
  isCorrected: boolean("is_corrected").default(false),
  originalRecordId: integer("original_record_id"),
  status: text("status").default("draft"), // draft, filed, corrected, voided
  filedAt: timestamp("filed_at"),
  deliveryMethod: text("delivery_method"), // electronic, postal
  deliveredAt: timestamp("delivered_at"),
  bounced: boolean("bounced").default(false),
  bounceReason: text("bounce_reason"),
  pdfUrl: text("pdf_url"),
  xmlData: text("xml_data"),
  transmissionId: text("transmission_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Payment Reconciliation
export const paymentReconciliation = pgTable("payment_reconciliation", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  reconciliationDate: timestamp("reconciliation_date").defaultNow().notNull(),
  processorName: text("processor_name").notNull(), // stripe, adyen, etc.
  settlementId: text("settlement_id").notNull(),
  settlementAmount: real("settlement_amount").notNull(),
  settledTransactions: integer("settled_transactions").notNull(),
  unmatchedItems: integer("unmatched_items").default(0),
  totalFees: real("total_fees").notNull(),
  netSettlement: real("net_settlement").notNull(),
  status: text("status").default("pending"), // pending, matched, discrepancy, resolved
  discrepancyAmount: real("discrepancy_amount").default(0),
  discrepancyReason: text("discrepancy_reason"),
  resolvedBy: integer("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  processorData: jsonb("processor_data").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Risk Management
export const riskProfiles = pgTable("risk_profiles", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  entityType: text("entity_type").notNull(), // customer, driver, merchant
  entityId: integer("entity_id").notNull(),
  riskScore: real("risk_score").default(0), // 0-100
  riskLevel: text("risk_level").default("low"), // low, medium, high, blocked
  riskFactors: jsonb("risk_factors").default([]),
  velocityLimits: jsonb("velocity_limits").default({}),
  blocklist: boolean("blocklist").default(false),
  allowlist: boolean("allowlist").default(false),
  fraudulent: boolean("fraudulent").default(false),
  safetyIncidents: integer("safety_incidents").default(0),
  chargebackHistory: jsonb("chargeback_history").default([]),
  lastRiskAssessment: timestamp("last_risk_assessment").defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  companyName: text("company_name").default("ReturnIt"),
  tagline: text("tagline").default("Making Returns Effortless"),
  description: text("description"),
  headquarters: text("headquarters").default("St. Louis, MO"),
  supportEmail: text("support_email").default("support@returnit.com"),
  supportPhone: text("support_phone").default("6362544821"),
  businessHours: text("business_hours").default("Mon–Sat, 8 AM – 8 PM CST"),
  instagramHandle: text("instagram_handle").default("@ReturnItApp"),
  facebookUrl: text("facebook_url").default("facebook.com/ReturnIt"),
  twitterHandle: text("twitter_handle").default("@ReturnIt"),
  missionStatement: text("mission_statement"),
  foundingStory: text("founding_story"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Cities and Market Management
export const cities = pgTable("cities", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: text("name").notNull().unique(),
  state: text("state").notNull(),
  region: text("region").notNull(), // midwest, northeast, south, west
  isActive: boolean("is_active").default(true),
  launchDate: timestamp("launch_date"),
  marketManager: integer("market_manager").references(() => users.id),
  serviceArea: jsonb("service_area").default({}), // Geographic boundaries
  basePricing: jsonb("base_pricing").default({}), // City-specific pricing
  localRegulations: jsonb("local_regulations").default({}),
  partnerRetailers: jsonb("partner_retailers").default([]),
  population: integer("population"),
  marketPotential: text("market_potential").default("medium"), // low, medium, high
  competitorAnalysis: jsonb("competitor_analysis").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


// Support Ticket Messages
export const ticketMessages = pgTable("ticket_messages", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  ticketId: integer("ticket_id").references(() => supportTicketsEnhanced.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  messageType: text("message_type").default("text"), // text, file, image
  attachments: jsonb("attachments").default([]),
  isInternal: boolean("is_internal").default(false), // internal agent notes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Real-time Order Tracking Events
export const trackingEvents = pgTable("tracking_events", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  orderId: text("order_id").references(() => orders.id).notNull(),
  eventType: text("event_type").notNull(), // pickup_scheduled, driver_assigned, en_route, picked_up, delivered
  description: text("description").notNull(),
  location: jsonb("location"), // GPS coordinates
  driverId: integer("driver_id").references(() => users.id),
  metadata: jsonb("metadata").default({}),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Customer Reviews and Ratings
export const reviews = pgTable("reviews", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  orderId: text("order_id").references(() => orders.id).notNull(),
  customerId: integer("customer_id").references(() => users.id).notNull(),
  driverId: integer("driver_id").references(() => users.id),
  overallRating: integer("overall_rating").notNull(), // 1-5 stars
  serviceRating: integer("service_rating"), // 1-5 stars
  timelinessRating: integer("timeliness_rating"), // 1-5 stars
  communicationRating: integer("communication_rating"), // 1-5 stars
  reviewText: text("review_text"),
  wouldRecommend: boolean("would_recommend"),
  isPublic: boolean("is_public").default(true),
  flaggedInappropriate: boolean("flagged_inappropriate").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Driver Performance Analytics
export const driverPerformance = pgTable("driver_performance", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  driverId: integer("driver_id").references(() => users.id).notNull(),
  date: timestamp("date").notNull(),
  totalOrders: integer("total_orders").default(0),
  completedOrders: integer("completed_orders").default(0),
  cancelledOrders: integer("cancelled_orders").default(0),
  avgRating: real("avg_rating"),
  totalEarnings: real("total_earnings").default(0),
  onlineHours: real("online_hours").default(0),
  avgPickupTime: real("avg_pickup_time"), // minutes
  avgDeliveryTime: real("avg_delivery_time"), // minutes
  customerFeedbackScore: real("customer_feedback_score"),
  completionRate: real("completion_rate"), // percentage
  safetyIncidents: integer("safety_incidents").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Corporate Partnerships
export const partnerships = pgTable("partnerships", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  partnershipType: text("partnership_type").notNull(), // retailer, logistics, corporate
  status: text("status").default("prospect"), // prospect, negotiating, active, inactive
  contractValue: real("contract_value"),
  discountRate: real("discount_rate"), // percentage discount
  volumeThreshold: integer("volume_threshold"), // minimum orders
  serviceAreas: jsonb("service_areas").default([]),
  specialTerms: text("special_terms"),
  accountManager: integer("account_manager").references(() => users.id),
  contractStartDate: timestamp("contract_start_date"),
  contractEndDate: timestamp("contract_end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Bulk Order Imports
export const bulkOrderImports = pgTable("bulk_order_imports", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  importedBy: integer("imported_by").references(() => users.id).notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),
  totalRows: integer("total_rows"),
  successfulImports: integer("successful_imports").default(0),
  failedImports: integer("failed_imports").default(0),
  errors: jsonb("errors").default([]),
  status: text("status").default("processing"), // processing, completed, failed
  importType: text("import_type").notNull(), // orders, customers, drivers
  mapping: jsonb("mapping").default({}), // column mapping configuration
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Emergency Alerts and Safety
export const emergencyAlerts = pgTable("emergency_alerts", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  driverId: integer("driver_id").references(() => users.id).notNull(),
  orderId: text("order_id").references(() => orders.id),
  alertType: text("alert_type").notNull(), // emergency_911, safety_concern, breakdown, accident
  location: jsonb("location").notNull(), // GPS coordinates
  description: text("description"),
  isResolved: boolean("is_resolved").default(false),
  responseTime: integer("response_time"), // minutes
  responderNotes: text("responder_notes"),
  emergencyContacts: jsonb("emergency_contacts").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
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
  dateOfBirth: z.string().optional(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  trackingNumber: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  pickupStreetAddress: z.string().min(10, "Pickup address must be detailed"),
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

// New table insert schemas
export const insertCitySchema = createInsertSchema(cities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTicketsEnhanced).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTicketMessageSchema = createInsertSchema(ticketMessages).omit({
  id: true,
  createdAt: true,
});

export const insertTrackingEventSchema = createInsertSchema(trackingEvents).omit({
  id: true,
  timestamp: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertDriverPerformanceSchema = createInsertSchema(driverPerformance).omit({
  id: true,
  createdAt: true,
});

export const insertPartnershipSchema = createInsertSchema(partnerships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBulkOrderImportSchema = createInsertSchema(bulkOrderImports).omit({
  id: true,
  createdAt: true,
});

export const insertEmergencyAlertSchema = createInsertSchema(emergencyAlerts).omit({
  id: true,
  createdAt: true,
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

// New table types
export type City = typeof cities.$inferSelect;
export type InsertCity = z.infer<typeof insertCitySchema>;
export type SupportTicket = typeof supportTicketsEnhanced.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type TicketMessage = typeof ticketMessages.$inferSelect;
export type InsertTicketMessage = z.infer<typeof insertTicketMessageSchema>;
export type TrackingEvent = typeof trackingEvents.$inferSelect;
export type InsertTrackingEvent = z.infer<typeof insertTrackingEventSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type DriverPerformance = typeof driverPerformance.$inferSelect;
export type InsertDriverPerformance = z.infer<typeof insertDriverPerformanceSchema>;
export type Partnership = typeof partnerships.$inferSelect;
export type InsertPartnership = z.infer<typeof insertPartnershipSchema>;
export type BulkOrderImport = typeof bulkOrderImports.$inferSelect;
export type InsertBulkOrderImport = z.infer<typeof insertBulkOrderImportSchema>;
export type EmergencyAlert = typeof emergencyAlerts.$inferSelect;
export type InsertEmergencyAlert = z.infer<typeof insertEmergencyAlertSchema>;

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

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

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

// Driver applications and onboarding
export const driverApplications = pgTable("driver_applications", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // Personal Information
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  
  // Demographic Information (EEO Compliance)
  gender: text("gender"), // Male, Female, Non-binary, Prefer not to answer
  isVeteran: boolean("is_veteran"), // Yes, No, Prefer not to answer
  hasDisability: boolean("has_disability"), // Yes, No, Prefer not to answer
  ethnicityRace: text("ethnicity_race"), // Hispanic/Latino, White, Black/African American, Asian, Native American, Pacific Islander, Two or more races, Prefer not to answer
  
  // Vehicle Information
  vehicleMake: text("vehicle_make").notNull(),
  vehicleModel: text("vehicle_model").notNull(),
  vehicleYear: text("vehicle_year").notNull(),
  vehicleColor: text("vehicle_color").notNull(),
  licensePlate: text("license_plate").notNull(),
  vehicleType: text("vehicle_type").notNull(), // car, truck, van, etc.
  
  // Document Status
  driversLicenseUploaded: boolean("drivers_license_uploaded").default(false),
  driversLicenseVerified: boolean("drivers_license_verified").default(false),
  vehicleRegistrationUploaded: boolean("vehicle_registration_uploaded").default(false),
  vehicleRegistrationVerified: boolean("vehicle_registration_verified").default(false),
  insuranceUploaded: boolean("insurance_uploaded").default(false),
  insuranceVerified: boolean("insurance_verified").default(false),
  selfieUploaded: boolean("selfie_uploaded").default(false),
  selfieVerified: boolean("selfie_verified").default(false),
  
  // Background Check
  backgroundCheckStatus: text("background_check_status").default("pending"), // pending, in_progress, approved, rejected
  backgroundCheckProvider: text("background_check_provider"), // checkr, etc.
  backgroundCheckId: text("background_check_id"),
  
  // Terms and Agreement
  termsAccepted: boolean("terms_accepted").default(false),
  termsAcceptedAt: timestamp("terms_accepted_at"),
  
  // Application Status
  status: text("status").default("draft"), // draft, submitted, under_review, approved, rejected
  reviewNotes: text("review_notes"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schemas for driver application
export const insertDriverApplicationSchema = createInsertSchema(driverApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for driver application
export type DriverApplication = typeof driverApplications.$inferSelect;
export type InsertDriverApplication = z.infer<typeof insertDriverApplicationSchema>;

// Driver application status enum
export const DriverApplicationStatus = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

export const DocumentTypeEnum = {
  LICENSE: 'drivers-license',
  REGISTRATION: 'vehicle-registration',
  INSURANCE: 'insurance',
  SELFIE: 'selfie'
} as const;

// Cost Tracking for API Usage and Platform Costs
export const costTracking = pgTable("cost_tracking", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  service: text("service").notNull(), // openai, replit, stripe, twilio, etc.
  operation: text("operation").notNull(), // chat.completion, api.call, deployment, etc.
  model: text("model"), // gpt-3.5-turbo, gpt-4o, etc.
  inputTokens: integer("input_tokens").default(0),
  outputTokens: integer("output_tokens").default(0),
  totalTokens: integer("total_tokens").default(0),
  costUsd: real("cost_usd").notNull().default(0),
  requestId: text("request_id"),
  userId: integer("user_id").references(() => users.id),
  endpoint: text("endpoint"), // /api/ai/assistant, /api/notifications, etc.
  duration: integer("duration_ms"), // Request duration in milliseconds
  status: text("status").default("success"), // success, error, timeout
  metadata: jsonb("metadata").default({}), // Additional context
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Daily Cost Summary for efficient querying
export const dailyCostSummary = pgTable("daily_cost_summary", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  date: text("date").notNull(), // YYYY-MM-DD
  service: text("service").notNull(),
  totalRequests: integer("total_requests").default(0),
  totalTokens: integer("total_tokens").default(0),
  totalCostUsd: real("total_cost_usd").default(0),
  avgCostPerRequest: real("avg_cost_per_request").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Cost tracking schemas
export const insertCostTrackingSchema = createInsertSchema(costTracking).omit({
  id: true,
  createdAt: true,
});

export const insertDailyCostSummarySchema = createInsertSchema(dailyCostSummary).omit({
  id: true,
  createdAt: true,
});

// Types
export type CostTracking = typeof costTracking.$inferSelect;
export type InsertCostTracking = z.infer<typeof insertCostTrackingSchema>;
export type DailyCostSummary = typeof dailyCostSummary.$inferSelect;
export type InsertDailyCostSummary = z.infer<typeof insertDailyCostSummarySchema>;