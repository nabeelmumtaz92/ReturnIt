import { pgTable, text, timestamp, integer, boolean, real, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
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
  dateOfBirth: text("date_of_birth"),
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
  
  // Tutorial and onboarding tracking
  tutorialCompleted: boolean("tutorial_completed").default(false),
  hireDate: timestamp("hire_date"),
  
  // Multi-city expansion fields
  assignedCity: text("assigned_city").default("st-louis"),
  serviceZones: jsonb("service_zones").default([]),
  
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
  pickupLocation: text("pickup_location").default("inside").notNull(), // 'inside' or 'outside'
  pickupInstructions: text("pickup_instructions"),
  acceptsLiabilityTerms: boolean("accepts_liability_terms").default(false).notNull(), // Required for outside pickup
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
  
  // Item and pricing details
  numberOfItems: integer("number_of_items").default(1).notNull(),
  itemSize: text("item_size").notNull(), // S, M, L, XL (individual item size)
  packagingType: text("packaging_type").default("bag"), // bag, box, envelope, none
  
  // Pricing breakdown
  basePrice: real("base_price").default(3.99), // Minimum service fee
  distanceFee: real("distance_fee").default(0), // $0.50 per mile
  timeFee: real("time_fee").default(0), // $12/hour estimated time
  sizeUpcharge: real("size_upcharge").default(0), // L: +$2, XL: +$4
  multiItemFee: real("multi_item_fee").default(0), // $1.00 per additional item
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

// Customer Service Tickets
export const supportTickets = pgTable("support_tickets", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: integer("user_id").references(() => users.id),
  orderId: text("order_id").references(() => orders.id),
  category: text("category").notNull(), // technical, payment, delivery, general
  priority: text("priority").default("medium"), // low, medium, high, urgent
  status: text("status").default("open"), // open, in_progress, waiting, resolved, closed
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  assignedAgent: integer("assigned_agent").references(() => users.id),
  tags: jsonb("tags").default([]),
  attachments: jsonb("attachments").default([]),
  resolution: text("resolution"),
  customerSatisfaction: integer("customer_satisfaction"), // 1-5 rating
  timeToResolution: integer("time_to_resolution"), // minutes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

// Support Ticket Messages
export const ticketMessages = pgTable("ticket_messages", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  ticketId: integer("ticket_id").references(() => supportTickets.id).notNull(),
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

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
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
export type SupportTicket = typeof supportTickets.$inferSelect;
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