import { pgTable, text, timestamp, integer, boolean, real, jsonb, index, numeric, unique } from "drizzle-orm/pg-core";
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

// Business Intelligence API Response Types
export const KpiDataSchema = z.object({
  revenue: z.object({
    current: z.number(),
    growth: z.number(),
    trend: z.enum(['up', 'down'])
  }),
  orders: z.object({
    current: z.number(),
    growth: z.number(),
    trend: z.enum(['up', 'down'])
  }),
  avgOrderValue: z.object({
    current: z.number(),
    growth: z.number(),
    trend: z.enum(['up', 'down'])
  }),
  drivers: z.object({
    current: z.number(),
    growth: z.number(),
    trend: z.enum(['up', 'down'])
  })
});

export const DemandForecastItemSchema = z.object({
  day: z.string(),
  orders: z.number(),
  predictedOrders: z.number(),
  date: z.date()
});

export const PricingOptimizationItemSchema = z.object({
  service: z.string(),
  currentPrice: z.number(),
  recommendedPrice: z.number(),
  demandScore: z.number(),
  profitability: z.enum(['high', 'medium', 'low']),
  reasoning: z.string()
});

export const MarketExpansionItemSchema = z.object({
  area: z.string(),
  score: z.number(),
  population: z.number(),
  avgIncome: z.number(),
  competition: z.enum(['Low', 'Medium', 'High']),
  estimatedOrders: z.string(),
  investment: z.string(),
  breakeven: z.string()
});

// Company and Return Policy Database Tables
export const companies = pgTable("companies", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // URL-friendly identifier
  category: text("category").notNull(), // "department_store", "electronics", "clothing", "home_goods", etc.
  description: text("description"),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  
  // Location information
  headquarters: text("headquarters"),
  stLouisLocations: jsonb("st_louis_locations").default([]), // Array of store locations in St. Louis area
  serviceRadius: integer("service_radius").default(25), // Miles from St. Louis they serve
  
  // Business details
  businessType: text("business_type").notNull(), // "local", "regional", "national", "online_only"
  foundedYear: integer("founded_year"),
  employeeCount: text("employee_count"), // "1-10", "11-50", "51-200", "200+"
  
  // Return service preferences
  prefersInStore: boolean("prefers_in_store").default(false),
  allowsMailReturns: boolean("allows_mail_returns").default(true),
  usesReturnItService: boolean("uses_return_it_service").default(true),
  
  // Status
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  slugIdx: index("companies_slug_idx").on(table.slug),
  categoryIdx: index("companies_category_idx").on(table.category),
  isActiveIdx: index("companies_is_active_idx").on(table.isActive),
  isFeaturedIdx: index("companies_is_featured_idx").on(table.isFeatured),
}));

export const returnPolicies = pgTable("return_policies", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  
  // Basic policy terms
  returnWindowDays: integer("return_window_days").notNull(), // e.g., 30, 60, 90 days
  returnWindowType: text("return_window_type").notNull(), // "purchase", "delivery", "receipt"
  
  // Return conditions
  requiresReceipt: boolean("requires_receipt").default(true),
  requiresOriginalPackaging: boolean("requires_original_packaging").default(false),
  requiresOriginalTags: boolean("requires_original_tags").default(true),
  allowsWornItems: boolean("allows_worn_items").default(false),
  allowsOpenedItems: boolean("allows_opened_items").default(true),
  
  // Item condition requirements
  conditionRequirements: jsonb("condition_requirements").default({}), // Category-specific conditions
  
  // Return methods
  acceptsInStoreReturns: boolean("accepts_in_store_returns").default(true),
  acceptsMailReturns: boolean("accepts_mail_returns").default(true),
  acceptsPickupService: boolean("accepts_pickup_service").default(true),
  
  // Fees and refunds
  chargesRestockingFee: boolean("charges_restocking_fee").default(false),
  restockingFeePercent: real("restocking_fee_percent").default(0),
  refundMethod: text("refund_method").notNull(), // "original_payment", "store_credit", "exchange_only"
  refundProcessingDays: integer("refund_processing_days").default(5),
  
  // Special categories and exclusions
  excludedCategories: jsonb("excluded_categories").default([]), // ["electronics", "undergarments", etc.]
  specialCategoryRules: jsonb("special_category_rules").default({}),
  
  // Holiday and seasonal policies
  extendedHolidayWindow: boolean("extended_holiday_window").default(false),
  holidayExtensionDays: integer("holiday_extension_days").default(0),
  
  // Additional terms
  additionalTerms: text("additional_terms"),
  policyUrl: text("policy_url"), // Link to full policy on company website
  
  // Status
  isActive: boolean("is_active").default(true),
  effectiveDate: timestamp("effective_date").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const companyLocations = pgTable("company_locations", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  
  // Location details
  name: text("name").notNull(), // "Chesterfield Mall", "Downtown St. Louis", etc.
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  phone: text("phone"),
  
  // Coordinates for mapping
  coordinates: jsonb("coordinates"), // {lat: number, lng: number}
  
  // Store details
  storeType: text("store_type"), // "flagship", "outlet", "express", "warehouse"
  squareFootage: integer("square_footage"),
  
  // Hours and availability
  hours: jsonb("hours"), // Store hours by day of week
  acceptsReturns: boolean("accepts_returns").default(true),
  hasCustomerService: boolean("has_customer_service").default(true),
  
  // Return service preferences
  prefersAppointments: boolean("prefers_appointments").default(false),
  maxReturnsPerDay: integer("max_returns_per_day"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Route Optimization API Response Types
export const RouteStopSchema = z.object({
  id: z.union([z.string(), z.number()]), // Handle both MemStorage (string) and DatabaseStorage (number)
  address: z.string(),
  order: z.union([z.string(), z.number()]), // Same issue - order ID can be string or number
  estimatedTime: z.string(),
  status: z.string()
});

export const CurrentRouteSchema = z.object({
  id: z.string(),
  estimatedTime: z.number(),
  estimatedDistance: z.number(),
  fuelCost: z.number(),
  optimizationScore: z.number(),
  stops: z.array(RouteStopSchema)
});

export const OptimizedWaypointSchema = z.object({
  orderId: z.union([z.string(), z.number()]).optional(), // Handle mixed ID types
  sequence: z.number(),
  address: z.string(),
  estimatedArrival: z.date()
});

export const RouteOptimizationSchema = z.object({
  id: z.number(),
  orderIds: z.array(z.number()),
  estimatedDuration: z.number(),
  estimatedDistance: z.number(),
  fuelCostEstimate: z.number(),
  routeStatus: z.string(),
  optimizedRoute: z.object({
    waypoints: z.array(OptimizedWaypointSchema)
  })
});

// Type exports for frontend usage
export type KpiData = z.infer<typeof KpiDataSchema>;
export type DemandForecastItem = z.infer<typeof DemandForecastItemSchema>;
export type PricingOptimizationItem = z.infer<typeof PricingOptimizationItemSchema>;
export type MarketExpansionItem = z.infer<typeof MarketExpansionItemSchema>;
export type RouteStopZod = z.infer<typeof RouteStopSchema>;
export type CurrentRoute = z.infer<typeof CurrentRouteSchema>;
export type OptimizedWaypoint = z.infer<typeof OptimizedWaypointSchema>;
export type RouteOptimization = z.infer<typeof RouteOptimizationSchema>;

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
  vehicleInfo: jsonb("vehicle_info"), // Legacy field - keeping for compatibility
  // Detailed vehicle information
  vehicleMake: text("vehicle_make"),
  vehicleModel: text("vehicle_model"), 
  vehicleYear: integer("vehicle_year"),
  vehicleColor: text("vehicle_color"),
  vehicleType: text("vehicle_type"),
  licensePlate: text("license_plate"),
  vehicleInsurance: jsonb("vehicle_insurance"),
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
  
  // Stripe Identity Verification (for driver identity verification)
  stripeIdentitySessionId: text("stripe_identity_session_id"),
  stripeIdentityVerificationId: text("stripe_identity_verification_id"),
  stripeIdentityStatus: text("stripe_identity_status").default("not_started"), // not_started, processing, verified, requires_input, canceled
  stripeIdentityVerifiedAt: timestamp("stripe_identity_verified_at"),
  stripeIdentityVerificationData: jsonb("stripe_identity_verification_data"), // Full verification result from Stripe
  
  // Driver onboarding and application status
  applicationStatus: text("application_status").default("pending_review"), // pending_review, background_check_pending, background_check_approved, background_check_failed, documents_required, approved_active, rejected, waitlisted
  onboardingStep: text("onboarding_step").default("signup"), // signup, vehicle_info, identity_verification, background_check, documents, banking, approval, complete
  // Background check fields
  backgroundCheckConsent: boolean("background_check_consent").default(false),
  backgroundCheckStatus: text("background_check_status").default("not_started"), // not_started, in_progress, passed, failed, expired
  backgroundCheckId: text("background_check_id"), // External background check reference ID
  backgroundCheckCompletedAt: timestamp("background_check_completed_at"),
  backgroundCheckResults: jsonb("background_check_results"),
  projectedHireDate: timestamp("projected_hire_date"), // Estimated hire date for this driver's ZIP
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  otpVerified: boolean("otp_verified").default(false),
  termsAcceptedAt: timestamp("terms_accepted_at"),
  
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
  
  // GDPR/CCPA Compliance fields
  accountDeletionRequested: boolean("account_deletion_requested").default(false),
  deletedAt: timestamp("deleted_at"),
  dataExportRequestedAt: timestamp("data_export_requested_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  isDriverIdx: index("users_is_driver_idx").on(table.isDriver),
  isOnlineIdx: index("users_is_online_idx").on(table.isOnline),
  roleIdx: index("users_role_idx").on(table.role),
  applicationStatusIdx: index("users_application_status_idx").on(table.applicationStatus),
  stripeConnectAccountIdIdx: index("users_stripe_connect_account_id_idx").on(table.stripeConnectAccountId),
}));

// Push Subscriptions table for Web Push API notifications
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Web Push API subscription data
  endpoint: text("endpoint").notNull(),
  p256dhKey: text("p256dh_key").notNull(), // Public key for encryption
  authKey: text("auth_key").notNull(), // Authentication secret
  
  // Browser/device information
  userAgent: text("user_agent"),
  deviceType: text("device_type"), // desktop, mobile, tablet
  
  // Subscription management
  isEnabled: boolean("is_enabled").default(true).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at"), // Track when subscription was last used
}, (table) => ({
  userIdIdx: index("push_subscriptions_user_id_idx").on(table.userId),
  endpointIdx: index("push_subscriptions_endpoint_idx").on(table.endpoint),
  isEnabledIdx: index("push_subscriptions_is_enabled_idx").on(table.isEnabled),
  uniqueUserEndpoint: unique("unique_user_endpoint").on(table.userId, table.endpoint),
}));

// Driver Payment Methods table - PCI Compliant (Stripe references only)
export const driverPaymentMethods = pgTable("driver_payment_methods", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Stripe references (NEVER store raw card/bank data)
  stripePaymentMethodId: text("stripe_payment_method_id"), // For cards via Stripe Elements
  stripeExternalAccountId: text("stripe_external_account_id"), // For bank accounts via Financial Connections
  
  // Payment method type
  type: text("type").notNull(), // "card" or "bank_account"
  
  // Display metadata (last4, brand, bank name - safe to store)
  last4: text("last4"), // Last 4 digits for display
  brand: text("brand"), // "visa", "mastercard", "bank_of_america", etc.
  bankName: text("bank_name"), // For bank accounts
  accountHolderName: text("account_holder_name"),
  
  // Instant pay eligibility
  instantPayEligible: boolean("instant_pay_eligible").default(false).notNull(),
  instantPayFee: real("instant_pay_fee").default(0.50), // Fee for instant payout
  
  // Default payment method
  isDefault: boolean("is_default").default(false).notNull(),
  
  // Status and verification
  status: text("status").notNull().default("active"), // active, pending_verification, verification_failed, expired, removed
  verifiedAt: timestamp("verified_at"),
  verificationFailureReason: text("verification_failure_reason"),
  
  // Financial Connections specific (for bank accounts)
  financialConnectionsAccountId: text("financial_connections_account_id"),
  
  // Metadata and compliance
  metadata: jsonb("metadata").default({}),
  
  // Security audit trail
  addedByIp: text("added_by_ip"),
  lastUsedAt: timestamp("last_used_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("driver_payment_methods_user_id_idx").on(table.userId),
  statusIdx: index("driver_payment_methods_status_idx").on(table.status),
  isDefaultIdx: index("driver_payment_methods_is_default_idx").on(table.isDefault),
  instantPayEligibleIdx: index("driver_payment_methods_instant_pay_eligible_idx").on(table.instantPayEligible),
}));

// W-9 Tax Forms table - Driver tax information collection
export const w9Forms = pgTable("w9_forms", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  
  // Personal Information
  fullName: text("full_name").notNull(),
  businessName: text("business_name"), // Optional for sole proprietors
  taxClassification: text("tax_classification").notNull(), // "individual", "c_corp", "s_corp", "partnership", "llc", "other"
  llcTaxClassification: text("llc_tax_classification"), // For LLC: "c", "s", or "p"
  
  // Tax Identification
  taxIdType: text("tax_id_type").notNull(), // "ssn" or "ein"
  taxIdLast4: text("tax_id_last4").notNull(), // Last 4 digits for display (encrypted full number stored separately)
  taxIdEncrypted: text("tax_id_encrypted").notNull(), // Full encrypted SSN/EIN
  
  // Address Information
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  
  // Backup Withholding & Certifications
  exemptFromBackupWithholding: boolean("exempt_from_backup_withholding").default(false).notNull(),
  exemptionCode: text("exemption_code"), // FATCA exemption code if applicable
  
  // Electronic Signature
  signature: text("signature").notNull(), // Typed name or digital signature data
  signatureMethod: text("signature_method").notNull().default("typed"), // "typed" or "drawn"
  signatureData: text("signature_data"), // Base64 signature image if drawn
  signedAt: timestamp("signed_at").notNull(),
  ipAddress: text("ip_address").notNull(), // IP address when signed for audit trail
  
  // Compliance & Audit
  certifiedCorrect: boolean("certified_correct").default(true).notNull(),
  certificationText: text("certification_text").notNull(), // The certification statement they agreed to
  
  // W-9 specific fields
  accountNumbers: text("account_numbers"), // Optional list account numbers (if required by requester)
  
  // Status
  status: text("status").notNull().default("completed"), // "completed", "expired", "superseded"
  expiresAt: timestamp("expires_at"), // W-9s don't technically expire but good to track
  supersededBy: integer("superseded_by"), // Reference to newer W-9 if updated
  
  // Metadata
  formVersion: text("form_version").notNull().default("2024"), // IRS W-9 form version year
  metadata: jsonb("metadata").default({}),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("w9_forms_user_id_idx").on(table.userId),
  statusIdx: index("w9_forms_status_idx").on(table.status),
  signedAtIdx: index("w9_forms_signed_at_idx").on(table.signedAt),
}));

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

// Store Locations Database for comprehensive retailer-specific store locations
export const storeLocations = pgTable("store_locations", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  retailerName: text("retailer_name").notNull(), // Target, Walmart, Best Buy, etc.
  storeName: text("store_name").notNull(), // Target Store T-2841, Walmart Supercenter #123
  storeNumber: text("store_number"), // Internal store identifier: T-2841, #123, etc.
  streetAddress: text("street_address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  phoneNumber: text("phone_number"),
  coordinates: jsonb("coordinates").notNull(), // {lat: number, lng: number}
  storeHours: jsonb("store_hours").default({}), // Weekly hours: {monday: {open: "09:00", close: "21:00"}, ...}
  services: jsonb("services").default([]), // Available services: ["returns", "pickup", "customer-service"]
  returnPolicy: jsonb("return_policy").default({}), // Store-specific return policies
  isActive: boolean("is_active").default(true).notNull(),
  acceptsReturns: boolean("accepts_returns").default(true).notNull(),
  hasPickupService: boolean("has_pickup_service").default(false).notNull(),
  maxReturnValue: real("max_return_value"), // Maximum return value accepted
  specialInstructions: text("special_instructions"), // Special pickup/return instructions
  lastVerified: timestamp("last_verified").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  itemValue: real("item_value").notNull(), // Individual item value (customer-stated)
  category: text("category"), // Electronics, Clothing, etc.
  condition: text("condition"), // New, Used, Damaged
  reason: text("reason"), // Reason for return
  originalOrderNumber: text("original_order_number"), // Customer's original order number for this item
  
  // Driver Receipt Verification (prevents fake data)
  driverVerifiedPrice: real("driver_verified_price"), // Actual price from receipt scan
  driverVerifiedAt: timestamp("driver_verified_at"), // When driver confirmed
  priceDiscrepancy: real("price_discrepancy"), // Difference between customer/driver values
  verificationStatus: text("verification_status").default("pending"), // pending, verified, discrepancy_flagged
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").unique(), // Human-friendly order number (ORD-XXXXXX)
  userId: integer("user_id").references(() => users.id), // Nullable to support guest bookings
  status: text("status").notNull().default("created"), // created, confirmed, assigned, pickup_scheduled, picked_up, in_transit, delivered, completed, cancelled, refunded, return_refused
  trackingNumber: text("tracking_number").unique(),
  trackingEnabled: boolean("tracking_enabled").default(true).notNull(),
  trackingExpiresAt: timestamp("tracking_expires_at"),
  accessToken: text("access_token").unique(), // Secure token for accessing order details via URL
  
  // Pickup details
  pickupStreetAddress: text("pickup_street_address").notNull(),
  pickupCity: text("pickup_city").notNull(),
  pickupState: text("pickup_state").notNull(),
  pickupZipCode: text("pickup_zip_code").notNull(),
  pickupCoordinates: jsonb("pickup_coordinates"),
  pickupLocation: text("pickup_location").default("inside").notNull(), // 'inside' or 'outside'
  pickupMethod: text("pickup_method").default("handoff").notNull(), // 'handoff' (requires signature) or 'door_dropoff' (no signature)
  pickupInstructions: text("pickup_instructions"),
  acceptsLiabilityTerms: boolean("accepts_liability_terms").default(false).notNull(), // Required for door_dropoff
  signatureRequired: boolean("signature_required").default(true).notNull(), // false only for door_dropoff
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
  
  // Package details for pickup
  boxSize: text("box_size"), // Small, Medium, Large (boxes/bags)
  numberOfBoxes: integer("number_of_boxes").default(1), // Number of boxes/bags
  
  // Return Authorization Fields
  purchaseType: text("purchase_type").notNull(), // "online" or "in_store" 
  hasOriginalTags: boolean("has_original_tags").default(false).notNull(),
  receiptUploaded: boolean("receipt_uploaded").default(false).notNull(),
  receiptUrl: text("receipt_url"), // URL to uploaded receipt/proof of purchase (legacy)
  
  // Customer Proof of Purchase Photos (uploaded at booking - shown to driver for retailer verification)
  customerReceiptPhotoUrl: text("customer_receipt_photo_url"), // Photo of receipt or order confirmation
  customerTagsPhotoUrl: text("customer_tags_photo_url"), // Photo of original tags still attached
  customerPackagingPhotoUrl: text("customer_packaging_photo_url"), // Photo of item in original packaging
  
  returnLabelUrl: text("return_label_url"), // For online returns - uploaded label or QR
  authorizationSigned: boolean("authorization_signed").default(false).notNull(),
  authorizationSignature: text("authorization_signature"), // Digital signature data
  authorizationTimestamp: timestamp("authorization_timestamp"),
  
  // Pricing - simplified to match actual DB columns
  serviceTier: text("service_tier").default("standard").notNull(), // "standard" ($6.99), "priority" ($9.99), "instant" ($12.99)
  basePrice: real("base_price").default(8.99),
  sizeUpcharge: real("size_upcharge").default(0),
  multiBoxFee: real("multi_box_fee").default(0), // Actual DB column (not multiItemFee)
  serviceFee: real("service_fee").default(1.50), // Platform service fee
  fuelFee: real("fuel_fee").default(1.25), // Flat fuel surcharge
  surcharges: jsonb("surcharges").default([]),
  discountCode: text("discount_code"),
  discountAmount: real("discount_amount").default(0),
  tip: real("tip").default(0),
  totalPrice: real("total_price"),
  
  // Simplified payment breakdown - DB has aggregate fields
  customerPaid: real("customer_paid"),
  driverEarning: real("driver_earning").default(0), // Aggregate driver earning
  returnitFee: real("returnit_fee").default(0), // Platform fee
  sizeBonusAmount: real("size_bonus_amount").default(0),
  peakSeasonBonus: real("peak_season_bonus").default(0),
  multiStopBonus: real("multi_stop_bonus").default(0),
  
  // Stripe Connect payment fields
  stripePaymentIntentId: text("stripe_payment_intent_id").unique(), // SECURITY: Unique constraint prevents payment replay attacks
  stripeChargeId: text("stripe_charge_id"),
  paymentStatus: text("payment_status").default("pending"), // pending, completed, failed, refunded, refund_processing, refund_failed
  
  driverPayoutStatus: text("driver_payout_status").default("pending"), // pending, instant_paid, weekly_paid
  
  // Driver assignment
  driverId: integer("driver_id").references(() => users.id),
  driverAssignedAt: timestamp("driver_assigned_at"),
  estimatedDeliveryTime: timestamp("estimated_delivery_time"),
  actualDeliveryTime: timestamp("actual_delivery_time"),
  
  // Route and time tracking for distance+time payments
  routeDistanceMiles: real("route_distance_miles"), // Actual route distance
  estimatedDurationMinutes: integer("estimated_duration_minutes"), // Estimated delivery time
  actualDurationMinutes: integer("actual_duration_minutes"), // Actual time taken (for payment cap)
  timeCapMinutes: integer("time_cap_minutes"), // Max billable time (estimated ± 10 min)
  
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
  
  // API Integration Fields (Tier 2)
  externalOrderId: text("external_order_id"), // Retailer's original order ID
  apiMetadata: jsonb("api_metadata").default({}), // Additional retailer data
  createdViaApi: boolean("created_via_api").default(false), // Programmatic vs manual creation
  apiKeyId: integer("api_key_id").references(() => retailerApiKeys.id), // Which API key created this
  
  // Driver Completion Checklist (Like Spark) - Track ACTUAL outcomes
  driverCompletionConfirmed: boolean("driver_completion_confirmed").default(false), // Driver completed checklist
  driverCompletionTimestamp: timestamp("driver_completion_timestamp"), // When driver confirmed completion
  
  // Actual Return Outcome (What REALLY happened)
  actualReturnOutcome: text("actual_return_outcome"), // "refund_processed", "store_credit_issued", "exchange_completed", "donation_accepted", "return_refused"
  retailerAcceptedReturn: boolean("retailer_accepted_return"), // Did retailer accept the return?
  retailerIssuedRefund: boolean("retailer_issued_refund"), // Did retailer confirm they'll refund customer?
  retailerRefundMethod: text("retailer_refund_method"), // How retailer will refund: "original_payment", "store_credit", "gift_card", "exchange"
  retailerRefundAmount: real("retailer_refund_amount"), // Amount retailer confirmed they'll refund
  retailerRefundTimeline: text("retailer_refund_timeline"), // "3-5 business days", "7-10 business days", "immediate"
  
  // Donation confirmation
  donationConfirmed: boolean("donation_confirmed").default(false), // Charity accepted donation
  donationReceiptProvided: boolean("donation_receipt_provided").default(false), // Did charity give receipt for taxes?
  donationReceiptPhotos: jsonb("donation_receipt_photos").default([]), // Photos of donation receipt
  donationOrganization: text("donation_organization"), // Which charity/organization
  
  // Store credit / Gift card tracking
  storeCreditIssued: boolean("store_credit_issued").default(false), // Did retailer issue store credit?
  storeCreditAmount: real("store_credit_amount"), // Store credit dollar amount
  storeCreditCardNumber: text("store_credit_card_number"), // Last 4 digits of gift card
  
  // Driver completion notes
  driverCompletionNotes: text("driver_completion_notes"), // What driver observed at completion
  driverCompletionPhotos: jsonb("driver_completion_photos").default([]), // Evidence photos at completion
  
  // Driver verification photos (using Replit App Storage)
  pickupVerificationPhotos: jsonb("pickup_verification_photos").default([]), // Photos taken at customer pickup
  deliveryVerificationPhotos: jsonb("delivery_verification_photos").default([]), // Photos taken at store dropoff
  
  // Driver Receipt Verification (Data Integrity)
  receiptPhotoUrl: text("receipt_photo_url"), // Driver scans customer's receipt at pickup
  receiptVerifiedAt: timestamp("receipt_verified_at"), // When driver scanned receipt
  driverVerifiedTotal: real("driver_verified_total"), // Total from scanned receipt
  totalDiscrepancy: real("total_discrepancy"), // Difference between customer & driver totals
  discrepancyFlagged: boolean("discrepancy_flagged").default(false), // Auto-flag if >10% difference
  discrepancyNotes: text("discrepancy_notes"), // Why totals don't match
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("orders_user_id_idx").on(table.userId),
  driverIdIdx: index("orders_driver_id_idx").on(table.driverId),
  statusIdx: index("orders_status_idx").on(table.status),
  trackingNumberIdx: index("orders_tracking_number_idx").on(table.trackingNumber),
  createdAtIdx: index("orders_created_at_idx").on(table.createdAt),
  statusUserIdIdx: index("orders_status_user_id_idx").on(table.status, table.userId),
  statusDriverIdIdx: index("orders_status_driver_id_idx").on(table.status, table.driverId),
}));

// Order Audit Logs - Comprehensive tracking of all order actions
export const orderAuditLogs = pgTable("order_audit_logs", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  orderId: text("order_id").references(() => orders.id).notNull(),
  
  action: text("action").notNull(), // status_changed, driver_assigned, photo_uploaded, payment_processed, refund_issued, order_created, order_updated, notes_added, etc.
  performedBy: integer("performed_by").references(() => users.id), // Can be null for system actions
  performedByRole: text("performed_by_role").notNull(), // customer, driver, admin, system
  
  oldValue: jsonb("old_value"), // Previous state (for updates)
  newValue: jsonb("new_value"), // New state (for updates)
  metadata: jsonb("metadata").default({}), // Additional context (e.g., reason for change, location data, etc.)
  
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  
  timestamp: timestamp("timestamp").defaultNow().notNull(),
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
}, (table) => ({
  driverIdIdx: index("driver_earnings_driver_id_idx").on(table.driverId),
  orderIdIdx: index("driver_earnings_order_id_idx").on(table.orderId),
  statusIdx: index("driver_earnings_status_idx").on(table.status),
  driverIdStatusIdx: index("driver_earnings_driver_id_status_idx").on(table.driverId, table.status),
}));

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
}, (table) => ({
  userIdIdx: index("notifications_user_id_idx").on(table.userId),
  isReadIdx: index("notifications_is_read_idx").on(table.isRead),
  typeIdx: index("notifications_type_idx").on(table.type),
  createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
  userIdIsReadIdx: index("notifications_user_id_is_read_idx").on(table.userId, table.isRead),
}));

// Multi-Stop Routes for Batched Deliveries
export const routes = pgTable("routes", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  driverId: integer("driver_id").references(() => users.id).notNull(),
  status: text("status").notNull().default("pending"), // pending, active, completed, cancelled
  
  // Route summary
  totalStops: integer("total_stops").notNull(),
  totalDistance: real("total_distance").notNull(), // miles
  totalDuration: integer("total_duration").notNull(), // minutes
  totalEarnings: real("total_earnings").notNull(),
  
  // Route optimization
  optimizedSequence: jsonb("optimized_sequence").notNull().default([]), // Array of order IDs in optimal sequence
  routeCoordinates: jsonb("route_coordinates").default([]), // Polyline coordinates for map
  
  // Tracking
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  currentStopIndex: integer("current_stop_index").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  driverIdIdx: index("routes_driver_id_idx").on(table.driverId),
  statusIdx: index("routes_status_idx").on(table.status),
  driverIdStatusIdx: index("routes_driver_id_status_idx").on(table.driverId, table.status),
}));

// Route Stops - Individual orders within a multi-stop route
export const routeStops = pgTable("route_stops", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  routeId: integer("route_id").references(() => routes.id).notNull(),
  orderId: text("order_id").references(() => orders.id).notNull(),
  stopSequence: integer("stop_sequence").notNull(), // Order in the route (1, 2, 3...)
  status: text("status").notNull().default("pending"), // pending, completed, skipped
  
  // Stop details
  address: text("address").notNull(),
  coordinates: jsonb("coordinates"),
  estimatedArrival: timestamp("estimated_arrival"),
  actualArrival: timestamp("actual_arrival"),
  completedAt: timestamp("completed_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  routeIdIdx: index("route_stops_route_id_idx").on(table.routeId),
  orderIdIdx: index("route_stops_order_id_idx").on(table.orderId),
}));

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

// POLICY ENGINE V1 - Merchant Return Policies
export const merchantPolicies = pgTable("merchant_policies", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  merchantId: text("merchant_id").notNull().unique(), // External merchant identifier
  storeName: text("store_name").notNull(), // "Target", "Macy's", "Best Buy"
  
  // Store Location Information
  streetAddress: text("street_address"), // Physical store address
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  phone: text("phone"),
  website: text("website"),
  
  // Policy Configuration (jsonb for flexibility)
  policy: jsonb("policy").default({
    returnWindowDays: 30,
    receiptRequired: true,
    tagsRequired: true,
    originalPackagingRequired: false,
    allowedCategories: [],
    excludedCategories: [],
    holidayExtension: {
      enabled: false,
      start: null,
      end: null
    },
    refundMethod: "original_payment", // original_payment, store_credit, exchange_only
    restockingFee: {
      enabled: false,
      percentage: 0
    }
  }).notNull(),
  
  // Administrative
  isActive: boolean("is_active").default(true).notNull(),
  lastUpdatedBy: text("last_updated_by"), // Admin user who updated
  notes: text("notes"), // Internal notes about policy changes
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Policy Violation Tracking
export const policyViolations = pgTable("policy_violations", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  merchantId: text("merchant_id").notNull(),
  customerId: integer("customer_id").references(() => users.id),
  orderId: text("order_id").references(() => orders.id), // If order was created despite violation
  
  // Violation Details
  violationType: text("violation_type").notNull(), // return_window_expired, receipt_required, category_excluded, etc.
  violationReason: text("violation_reason").notNull(), // Human-readable description
  attemptedBookingData: jsonb("attempted_booking_data").notNull(), // What the customer tried to book
  policyData: jsonb("policy_data").notNull(), // Policy that was violated
  
  // Resolution
  resolved: boolean("resolved").default(false),
  resolution: text("resolution"), // override_allowed, customer_contacted, etc.
  resolvedBy: text("resolved_by"), // Admin user
  resolvedAt: timestamp("resolved_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
}, (table) => ({
  driverIdIdx: index("driver_payouts_driver_id_idx").on(table.driverId),
  statusIdx: index("driver_payouts_status_idx").on(table.status),
  taxYearIdx: index("driver_payouts_tax_year_idx").on(table.taxYear),
  createdAtIdx: index("driver_payouts_created_at_idx").on(table.createdAt),
  driverIdStatusIdx: index("driver_payouts_driver_id_status_idx").on(table.driverId, table.status),
}));

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
  companyName: text("company_name").default("Return It"),
  tagline: text("tagline").default("Return It. Give back, uplift others."),
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

// System Settings - stores configurable app-wide settings
export const appSettings = pgTable("app_settings", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  key: text("key").notNull().unique(), // e.g., 'base_price', 'holiday_surge_enabled'
  value: jsonb("value").notNull(), // Flexible storage for any JSON value
  description: text("description"),
  category: text("category").default("general"), // pricing, features, notifications, etc.
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

// Customer Reviews and Ratings (Customers review Drivers)
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

// Driver Reviews (Drivers review Orders and Customer Experience)
export const driverReviews = pgTable("driver_reviews", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  orderId: text("order_id").references(() => orders.id).notNull(),
  driverId: integer("driver_id").references(() => users.id).notNull(),
  customerId: integer("customer_id").references(() => users.id),
  overallRating: integer("overall_rating").notNull(), // 1-5 stars
  customerRating: integer("customer_rating"), // How easy was the customer? 1-5
  packageConditionRating: integer("package_condition_rating"), // Package condition 1-5
  locationRating: integer("location_rating"), // Location accessibility 1-5
  reviewText: text("review_text"),
  hadIssues: boolean("had_issues").default(false),
  issueDescription: text("issue_description"),
  wouldAcceptAgain: boolean("would_accept_again"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// App Reviews (Customers review the ReturnIt app itself)
export const appReviews = pgTable("app_reviews", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: integer("user_id").references(() => users.id).notNull(),
  orderId: text("order_id").references(() => orders.id), // Optional, if tied to an order
  overallRating: integer("overall_rating").notNull(), // 1-5 stars
  easeOfUseRating: integer("ease_of_use_rating"), // 1-5 stars
  featureRating: integer("feature_rating"), // 1-5 stars
  valueRating: integer("value_rating"), // Value for money 1-5
  reviewText: text("review_text"),
  wouldRecommend: boolean("would_recommend"),
  platform: text("platform").default("web"), // web, ios, android
  appVersion: text("app_version"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Company/Store Ratings Aggregation
export const companyRatings = pgTable("company_ratings", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  totalReviews: integer("total_reviews").default(0),
  averageRating: real("average_rating").default(5.0), // Decimal to tenths (e.g., 4.7)
  fiveStarCount: integer("five_star_count").default(0),
  fourStarCount: integer("four_star_count").default(0),
  threeStarCount: integer("three_star_count").default(0),
  twoStarCount: integer("two_star_count").default(0),
  oneStarCount: integer("one_star_count").default(0),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
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

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastUsedAt: true,
}).extend({
  endpoint: z.string().url("Invalid endpoint URL"),
  p256dhKey: z.string().min(1, "P256DH key required"),
  authKey: z.string().min(1, "Auth key required"),
});

export const insertDriverPaymentMethodSchema = createInsertSchema(driverPaymentMethods).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastUsedAt: true,
  verifiedAt: true,
}).extend({
  type: z.enum(["card", "bank_account"]),
  status: z.enum(["active", "pending_verification", "verification_failed", "expired", "removed"]).optional(),
});

// W-9 Forms
export const insertW9FormSchema = createInsertSchema(w9Forms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  taxIdEncrypted: z.string().min(9).max(11), // SSN (9) or EIN (10-11 with hyphen)
  taxIdLast4: z.string().length(4),
  fullName: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  zipCode: z.string().min(5).max(10),
  signature: z.string().min(1),
  signedAt: z.date(),
  ipAddress: z.string().min(1),
  certificationText: z.string().min(1),
});

export type InsertW9Form = z.infer<typeof insertW9FormSchema>;
export type SelectW9Form = typeof w9Forms.$inferSelect;

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

export const insertOrderAuditLogSchema = createInsertSchema(orderAuditLogs).omit({
  id: true,
  timestamp: true,
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

export const insertAppSettingsSchema = createInsertSchema(appSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// POLICY ENGINE SCHEMAS
// Policy Configuration TypeScript Interface (must be declared first)
export const PolicyConfigSchema = z.object({
  returnWindowDays: z.number().min(0).max(365),
  receiptRequired: z.boolean(),
  tagsRequired: z.boolean(),
  originalPackagingRequired: z.boolean(),
  allowedCategories: z.array(z.string()),
  excludedCategories: z.array(z.string()),
  holidayExtension: z.object({
    enabled: z.boolean(),
    start: z.string().nullable(),
    end: z.string().nullable()
  }),
  refundMethod: z.enum(["original_payment", "store_credit", "exchange_only"]),
  restockingFee: z.object({
    enabled: z.boolean(),
    percentage: z.number().min(0).max(100)
  })
});

export type PolicyConfig = z.infer<typeof PolicyConfigSchema>;

export const insertMerchantPolicySchema = createInsertSchema(merchantPolicies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  merchantId: z.string().min(1, "Merchant ID required"),
  storeName: z.string().min(1, "Store name required"),
  policy: PolicyConfigSchema
});

export const insertPolicyViolationSchema = createInsertSchema(policyViolations).omit({
  id: true,
  createdAt: true,
}).extend({
  merchantId: z.string().min(1, "Merchant ID required"),
  violationType: z.string().min(1, "Violation type required"),
  violationReason: z.string().min(1, "Violation reason required")
});

export type InsertMerchantPolicy = z.infer<typeof insertMerchantPolicySchema>;
export type SelectMerchantPolicy = typeof merchantPolicies.$inferSelect;
export type InsertPolicyViolation = z.infer<typeof insertPolicyViolationSchema>;
export type SelectPolicyViolation = typeof policyViolations.$inferSelect;

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

export const insertDriverReviewSchema = createInsertSchema(driverReviews).omit({
  id: true,
  createdAt: true,
});

export const insertAppReviewSchema = createInsertSchema(appReviews).omit({
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
export type DriverPaymentMethod = typeof driverPaymentMethods.$inferSelect;
export type InsertDriverPaymentMethod = z.infer<typeof insertDriverPaymentMethodSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderAuditLog = typeof orderAuditLogs.$inferSelect;
export type InsertOrderAuditLog = z.infer<typeof insertOrderAuditLogSchema>;
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
export type AppSetting = typeof appSettings.$inferSelect;
export type InsertAppSetting = z.infer<typeof insertAppSettingsSchema>;

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
export type DriverReview = typeof driverReviews.$inferSelect;
export type InsertDriverReview = z.infer<typeof insertDriverReviewSchema>;
export type AppReview = typeof appReviews.$inferSelect;
export type InsertAppReview = z.infer<typeof insertAppReviewSchema>;
export type CompanyRating = typeof companyRatings.$inferSelect;
export type DriverPerformance = typeof driverPerformance.$inferSelect;
export type InsertDriverPerformance = z.infer<typeof insertDriverPerformanceSchema>;
export type Partnership = typeof partnerships.$inferSelect;
export type InsertPartnership = z.infer<typeof insertPartnershipSchema>;
export type BulkOrderImport = typeof bulkOrderImports.$inferSelect;
export type InsertBulkOrderImport = z.infer<typeof insertBulkOrderImportSchema>;
export type EmergencyAlert = typeof emergencyAlerts.$inferSelect;
export type InsertEmergencyAlert = z.infer<typeof insertEmergencyAlertSchema>;

// Driver Order Assignments - manages order offers to drivers with timeout logic
export const driverOrderAssignments = pgTable("driver_order_assignments", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  orderId: text("order_id").references(() => orders.id).notNull(),
  driverId: integer("driver_id").references(() => users.id).notNull(),
  assignmentType: text("assignment_type").default("offer").notNull(), // offer, direct_assign, reassign
  status: text("status").default("pending").notNull(), // pending, accepted, declined, expired, cancelled
  offerExpiresAt: timestamp("offer_expires_at"), // Auto-decline after timeout
  respondedAt: timestamp("responded_at"),
  assignmentPriority: integer("assignment_priority").default(1), // 1 = highest priority
  estimatedDistance: real("estimated_distance"), // Distance from driver to pickup (miles)
  estimatedDuration: integer("estimated_duration"), // Estimated time to reach pickup (minutes)
  driverLocation: jsonb("driver_location"), // Driver's location when offer was made
  declineReason: text("decline_reason"), // Why driver declined (busy, too_far, break, etc.)
  reassignmentCount: integer("reassignment_count").default(0), // Track how many times order was reassigned
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Order Status History - comprehensive audit trail of all status changes
export const orderStatusHistory = pgTable("order_status_history", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  orderId: text("order_id").references(() => orders.id).notNull(),
  previousStatus: text("previous_status"),
  newStatus: text("new_status").notNull(),
  statusReason: text("status_reason"), // Reason for status change
  triggeredBy: integer("triggered_by").references(() => users.id), // User who triggered the change
  triggerType: text("trigger_type").default("manual").notNull(), // manual, automatic, timeout, system
  driverId: integer("driver_id").references(() => users.id), // Driver involved in status change
  location: jsonb("location"), // GPS location when status changed
  metadata: jsonb("metadata").default({}), // Additional context (photos, notes, etc.)
  estimatedTime: timestamp("estimated_time"), // When status change was expected
  actualTime: timestamp("actual_time").defaultNow().notNull(), // When status actually changed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Driver Location Pings - real-time GPS tracking for active drivers
export const driverLocationPings = pgTable("driver_location_pings", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  driverId: integer("driver_id").references(() => users.id).notNull(),
  orderId: text("order_id").references(() => orders.id), // Associated order if driver is on delivery
  location: jsonb("location").notNull(), // GPS coordinates with accuracy, heading, speed
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  isOnline: boolean("is_online").default(true).notNull(),
  isOnDelivery: boolean("is_on_delivery").default(false).notNull(),
  batteryLevel: integer("battery_level"), // Device battery percentage (optional)
  networkType: text("network_type"), // wifi, cellular, etc. (optional)
  accuracy: real("accuracy"), // GPS accuracy in meters
  source: text("source").default("mobile_app").notNull(), // mobile_app, web_app, system
});

// Order Cancellations - detailed tracking of why orders are cancelled
export const orderCancellations = pgTable("order_cancellations", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  orderId: text("order_id").references(() => orders.id).notNull(),
  cancellationType: text("cancellation_type").notNull(), // customer_cancel, driver_cancel, store_rejection, system_cancel, admin_cancel
  cancelledBy: integer("cancelled_by").references(() => users.id), // Who initiated cancellation
  driverId: integer("driver_id").references(() => users.id), // Driver involved if applicable
  cancellationReason: text("cancellation_reason").notNull(), // Specific reason code
  cancellationDetails: text("cancellation_details"), // Free-form explanation
  storeId: integer("store_id").references(() => storeLocations.id), // Store involved if store rejection
  refundAmount: real("refund_amount"), // Amount refunded to customer
  driverCompensation: real("driver_compensation"), // Compensation to driver if applicable
  photos: jsonb("photos").default([]), // Evidence photos if needed
  customerNotified: boolean("customer_notified").default(false),
  driverNotified: boolean("driver_notified").default(false),
  reassignAttempted: boolean("reassign_attempted").default(false),
  escalatedToSupport: boolean("escalated_to_support").default(false),
  resolutionNotes: text("resolution_notes"),
  resolvedBy: integer("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Status enums for type safety - EXTENDED with GPS routing states
export const OrderStatus = {
  CREATED: 'created',
  CONFIRMED: 'confirmed', 
  ASSIGNED: 'assigned',
  ACCEPTED: 'accepted', // Driver accepted the order
  PICKUP_SCHEDULED: 'pickup_scheduled',
  EN_ROUTE_TO_PICKUP: 'en_route_to_pickup', // Driver heading to customer
  PICKED_UP: 'picked_up', // Items collected from customer
  IN_TRANSIT: 'in_transit', // Legacy status for compatibility
  EN_ROUTE_TO_STORE: 'en_route_to_store', // Driver heading to dropoff store
  AT_STORE: 'at_store', // Driver arrived at store
  DROPPED_OFF: 'dropped_off', // Items delivered to store
  DELIVERED: 'delivered', // Legacy status for compatibility
  COMPLETED: 'completed', // Order fully complete
  CANCELLED: 'cancelled',
  STORE_REJECTED: 'store_rejected', // Store refused to accept return
  RETURN_TO_CUSTOMER: 'return_to_customer', // Returning items to customer after rejection
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

// New table insert schemas
export const insertDriverOrderAssignmentSchema = createInsertSchema(driverOrderAssignments).omit({
  id: true,
  createdAt: true,
});

export const insertOrderStatusHistorySchema = createInsertSchema(orderStatusHistory).omit({
  id: true,
  createdAt: true,
});

export const insertDriverLocationPingSchema = createInsertSchema(driverLocationPings).omit({
  id: true,
  timestamp: true,
});

export const insertOrderCancellationSchema = createInsertSchema(orderCancellations).omit({
  id: true,
  createdAt: true,
});

// Types
export type CostTracking = typeof costTracking.$inferSelect;
export type InsertCostTracking = z.infer<typeof insertCostTrackingSchema>;
export type DailyCostSummary = typeof dailyCostSummary.$inferSelect;
export type InsertDailyCostSummary = z.infer<typeof insertDailyCostSummarySchema>;

// New table types
export type DriverOrderAssignment = typeof driverOrderAssignments.$inferSelect;
export type InsertDriverOrderAssignment = z.infer<typeof insertDriverOrderAssignmentSchema>;
export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;
export type InsertOrderStatusHistory = z.infer<typeof insertOrderStatusHistorySchema>;
export type DriverLocationPing = typeof driverLocationPings.$inferSelect;
export type InsertDriverLocationPing = z.infer<typeof insertDriverLocationPingSchema>;
export type OrderCancellation = typeof orderCancellations.$inferSelect;
export type InsertOrderCancellation = z.infer<typeof insertOrderCancellationSchema>;

// Cancellation reason enums for type safety
export const CancellationReason = {
  // Customer cancellations
  CUSTOMER_CHANGED_MIND: 'customer_changed_mind',
  CUSTOMER_EMERGENCY: 'customer_emergency',
  CUSTOMER_FOUND_RECEIPT: 'customer_found_receipt', // Decided to return in-store
  
  // Driver cancellations  
  DRIVER_EMERGENCY: 'driver_emergency',
  DRIVER_VEHICLE_ISSUE: 'driver_vehicle_issue',
  DRIVER_TOO_FAR: 'driver_too_far',
  DRIVER_UNSAFE_LOCATION: 'driver_unsafe_location',
  DRIVER_CUSTOMER_UNAVAILABLE: 'driver_customer_unavailable',
  
  // Store rejections
  STORE_RETURN_WINDOW_EXPIRED: 'store_return_window_expired',
  STORE_NO_RECEIPT: 'store_no_receipt', 
  STORE_DAMAGED_ITEM: 'store_damaged_item',
  STORE_FINAL_SALE: 'store_final_sale',
  STORE_POLICY_VIOLATION: 'store_policy_violation',
  STORE_SYSTEM_DOWN: 'store_system_down',
  
  // System cancellations
  SYSTEM_TIMEOUT: 'system_timeout',
  SYSTEM_ERROR: 'system_error',
  PAYMENT_FAILED: 'payment_failed',
  
  // Admin cancellations
  ADMIN_FRAUD_SUSPECTED: 'admin_fraud_suspected',
  ADMIN_POLICY_VIOLATION: 'admin_policy_violation',
  ADMIN_CUSTOMER_REQUEST: 'admin_customer_request'
} as const;

export type CancellationReason = (typeof CancellationReason)[keyof typeof CancellationReason];

// Assignment status enum
export const AssignmentStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted', 
  DECLINED: 'declined',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
} as const;

export type AssignmentStatus = (typeof AssignmentStatus)[keyof typeof AssignmentStatus];

// === WEBHOOK SYSTEM FOR MERCHANT NOTIFICATIONS ===

// Webhook Endpoints - Merchant systems that want to receive notifications
export const webhookEndpoints = pgTable("webhook_endpoints", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  merchantId: text("merchant_id").notNull(), // External merchant identifier (e.g., "target", "macys", "shopify_store_123")
  merchantName: text("merchant_name").notNull(), // Human-readable name
  url: text("url").notNull(), // Webhook endpoint URL
  secret: text("secret").notNull(), // Secret for signing webhooks
  isActive: boolean("is_active").default(true).notNull(),
  description: text("description"), // Optional description
  
  // Event filtering - which events this endpoint wants to receive
  enabledEvents: jsonb("enabled_events").default([]).notNull(), // Array of event types
  
  // Configuration
  timeoutSeconds: integer("timeout_seconds").default(30).notNull(),
  maxRetries: integer("max_retries").default(3).notNull(),
  retryBackoffSeconds: integer("retry_backoff_seconds").default(60).notNull(),
  
  // Metadata
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Webhook Events - Catalog of all events ReturnIt can emit
export const webhookEvents = pgTable("webhook_events", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  eventType: text("event_type").notNull().unique(), // e.g., "return.created", "return.picked_up"
  displayName: text("display_name").notNull(), // Human-readable name
  description: text("description").notNull(), // Description of when this event fires
  schemaVersion: text("schema_version").default("1.0").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  samplePayload: jsonb("sample_payload").default({}), // Example payload structure
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Webhook Deliveries - Track individual webhook delivery attempts
export const webhookDeliveries = pgTable("webhook_deliveries", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  webhookEndpointId: integer("webhook_endpoint_id").references(() => webhookEndpoints.id).notNull(),
  eventType: text("event_type").notNull(),
  orderId: text("order_id").references(() => orders.id), // Associated order if applicable
  
  // Delivery details
  httpStatus: integer("http_status"), // Response status code
  response: text("response"), // Response body (truncated)
  attemptNumber: integer("attempt_number").default(1).notNull(),
  isSuccessful: boolean("is_successful").default(false).notNull(),
  
  // Timing
  deliveredAt: timestamp("delivered_at"),
  nextRetryAt: timestamp("next_retry_at"),
  
  // Request details
  requestHeaders: jsonb("request_headers").default({}),
  requestPayload: jsonb("request_payload").notNull(),
  responseHeaders: jsonb("response_headers").default({}),
  
  // Error tracking
  errorMessage: text("error_message"),
  errorCode: text("error_code"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Event Types Enum - ReturnIt's Webhook Event Catalog
export const WebhookEventType = {
  // Order Lifecycle Events
  RETURN_CREATED: 'return.created',              // Customer books a return
  RETURN_CONFIRMED: 'return.confirmed',          // Payment processed, order confirmed
  RETURN_ASSIGNED: 'return.assigned',            // Driver assigned to pickup
  RETURN_ACCEPTED: 'return.accepted',            // Driver accepted the pickup
  
  // Pickup Events
  PICKUP_SCHEDULED: 'pickup.scheduled',          // Pickup time scheduled
  PICKUP_ETA_UPDATED: 'pickup.eta_updated',      // ETA changed
  PICKUP_STARTED: 'pickup.started',              // Driver en route to customer
  PICKUP_ARRIVED: 'pickup.arrived',              // Driver arrived at customer
  PICKUP_COMPLETED: 'pickup.completed',          // Items collected from customer
  PICKUP_FAILED: 'pickup.failed',                // Pickup attempt failed
  
  // Transit Events  
  RETURN_IN_TRANSIT: 'return.in_transit',        // Items being transported to store
  RETURN_EN_ROUTE_TO_STORE: 'return.en_route_to_store', // Driver heading to dropoff
  RETURN_ARRIVED_AT_STORE: 'return.arrived_at_store',   // Driver at store location
  
  // Delivery Events
  RETURN_DELIVERED: 'return.delivered',          // Items delivered to store
  RETURN_PROCESSED: 'return.processed',          // Store processed the return
  RETURN_COMPLETED: 'return.completed',          // Return fully complete
  
  // Exception Events
  RETURN_CANCELLED: 'return.cancelled',          // Order cancelled
  RETURN_REJECTED_BY_STORE: 'return.rejected_by_store', // Store refused return
  RETURN_DRIVER_ABANDONED: 'return.driver_abandoned',   // Driver abandoned pickup
  RETURN_FAILED: 'return.failed',                // Return failed for any reason
  
  // Refund Events
  REFUND_INITIATED: 'refund.initiated',          // Refund process started
  REFUND_PROCESSING: 'refund.processing',        // Refund being processed
  REFUND_COMPLETED: 'refund.completed',          // Customer refunded
  REFUND_FAILED: 'refund.failed',                // Refund failed
  
  // Customer Communication Events
  CUSTOMER_NOTIFIED: 'customer.notified',        // Customer received notification
  CUSTOMER_UPDATED: 'customer.updated',          // Customer details updated
  
  // Driver Events (for enterprise clients who want driver insights)
  DRIVER_ASSIGNED: 'driver.assigned',            // Specific driver assigned
  DRIVER_LOCATION_UPDATED: 'driver.location_updated', // Driver location ping
  DRIVER_STATUS_UPDATED: 'driver.status_updated',     // Driver status change

  // Policy Engine Events (for merchant return policy management)
  POLICY_UPDATED: 'policy.updated',              // Merchant policy updated
  POLICY_VIOLATION_DETECTED: 'policy.violation_detected', // Customer attempted return outside policy
  POLICY_ENFORCED: 'policy.enforced',            // Return validated & accepted under current policy
  POLICY_EXPIRED: 'policy.expired'               // Return window expired for attempted return
} as const;

export type WebhookEventType = (typeof WebhookEventType)[keyof typeof WebhookEventType];

// Webhook Delivery Status Enum
export const WebhookDeliveryStatus = {
  PENDING: 'pending',
  SUCCESS: 'success', 
  FAILED: 'failed',
  RETRYING: 'retrying',
  MAX_RETRIES_EXCEEDED: 'max_retries_exceeded'
} as const;

export type WebhookDeliveryStatus = (typeof WebhookDeliveryStatus)[keyof typeof WebhookDeliveryStatus];

// Webhook schemas for type safety
export const insertWebhookEndpointSchema = createInsertSchema(webhookEndpoints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWebhookEventSchema = createInsertSchema(webhookEvents).omit({
  id: true,
  createdAt: true,
});

export const insertWebhookDeliverySchema = createInsertSchema(webhookDeliveries).omit({
  id: true,
  createdAt: true,
});

// Types
export type WebhookEndpoint = typeof webhookEndpoints.$inferSelect;
export type InsertWebhookEndpoint = z.infer<typeof insertWebhookEndpointSchema>;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type InsertWebhookEvent = z.infer<typeof insertWebhookEventSchema>;
export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;
export type InsertWebhookDelivery = z.infer<typeof insertWebhookDeliverySchema>;

// Customer Waitlist for pre-launch signups
export const customerWaitlist = pgTable("customer_waitlist", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  streetAddress: text("street_address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  coordinates: jsonb("coordinates"), // {lat: number, lng: number}
  addressVerified: boolean("address_verified").default(false),
  status: text("status").default("waitlist"), // waitlist, active, launched
  projectedLaunchDate: timestamp("projected_launch_date"),
  notificationPreferences: jsonb("notification_preferences").default({}), // email, sms preferences
  referralCode: text("referral_code"),
  referredBy: integer("referred_by"), // References customerWaitlist.id
  marketingOptIn: boolean("marketing_opt_in").default(true),
  launchedAt: timestamp("launched_at"),
  notifiedAt: timestamp("notified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ZIP Code Management for launch planning
export const zipCodeManagement = pgTable("zip_code_management", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  zipCode: text("zip_code").notNull().unique(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  isActive: boolean("is_active").default(false), // Service is live in this ZIP
  driverCount: integer("driver_count").default(0), // Number of approved drivers
  customerCount: integer("customer_count").default(0), // Number of waitlist customers
  projectedDriverHireDays: integer("projected_driver_hire_days").default(30), // Days until driver hiring
  projectedCustomerLaunchDays: integer("projected_customer_launch_days").default(45), // Days until customer launch
  minimumDrivers: integer("minimum_drivers").default(20), // Required drivers before launch
  launchPriority: integer("launch_priority").default(1), // 1=highest, 5=lowest priority
  notes: text("notes"),
  activatedAt: timestamp("activated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// OTP Verification for phone number verification
export const otpVerification = pgTable("otp_verification", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  phoneNumber: text("phone_number").notNull(),
  otpCode: text("otp_code").notNull(),
  purpose: text("purpose").notNull(), // signup, password_reset, phone_change
  isVerified: boolean("is_verified").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  verifiedAt: timestamp("verified_at"),
  attempts: integer("attempts").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Indeed Job Applications - Applications received from Indeed webhook
export const indeedApplications = pgTable("indeed_applications", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  indeedApplyId: text("indeed_apply_id").notNull().unique(), // Indeed's unique ID for this application
  jobId: text("job_id").notNull(), // Your internal job posting ID
  jobTitle: text("job_title").notNull(),
  
  // Candidate Information
  candidateName: text("candidate_name").notNull(),
  candidateEmail: text("candidate_email").notNull(),
  candidatePhone: text("candidate_phone"),
  
  // Application Content
  resume: text("resume"), // Resume text/URL
  coverLetter: text("cover_letter"),
  
  // Screening Questions & Answers
  screeningAnswers: jsonb("screening_answers").default([]), // Array of {questionId, question, answer}
  
  // Application Status
  status: text("status").default("new"), // new, reviewed, interviewed, rejected, hired
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewNotes: text("review_notes"),
  reviewedAt: timestamp("reviewed_at"),
  
  // Disposition (to sync back to Indeed)
  disposition: text("disposition"), // RECEIVED, REVIEWED, INTERVIEWED, OFFERED, HIRED, REJECTED
  dispositionSyncedAt: timestamp("disposition_synced_at"),
  
  // Raw Data
  rawData: jsonb("raw_data"), // Full Indeed webhook payload for debugging
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas for new tables
export const insertCustomerWaitlistSchema = createInsertSchema(customerWaitlist).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertZipCodeManagementSchema = createInsertSchema(zipCodeManagement).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOtpVerificationSchema = createInsertSchema(otpVerification).omit({
  id: true,
  createdAt: true,
});

export const insertIndeedApplicationSchema = createInsertSchema(indeedApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for new tables
export type CustomerWaitlist = typeof customerWaitlist.$inferSelect;
export type InsertCustomerWaitlist = z.infer<typeof insertCustomerWaitlistSchema>;
export type ZipCodeManagement = typeof zipCodeManagement.$inferSelect;
export type InsertZipCodeManagement = z.infer<typeof insertZipCodeManagementSchema>;
export type OtpVerification = typeof otpVerification.$inferSelect;
export type InsertOtpVerification = z.infer<typeof insertOtpVerificationSchema>;
export type IndeedApplication = typeof indeedApplications.$inferSelect;
export type InsertIndeedApplication = z.infer<typeof insertIndeedApplicationSchema>;

// === RETAILER SELF-SERVICE PORTAL TABLES ===

// Retailer Accounts - Links users to companies with admin permissions
export const retailerAccounts = pgTable("retailer_accounts", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: integer("user_id").references(() => users.id).notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  role: text("role").notNull().default("admin"), // admin, manager, viewer
  permissions: jsonb("permissions").default([]), // Array of specific permissions
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Retailer Subscriptions - Stripe billing and subscription management
export const retailerSubscriptions = pgTable("retailer_subscriptions", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  
  // Stripe details
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripePriceId: text("stripe_price_id"),
  
  // Plan details
  planType: text("plan_type").notNull().default("standard"), // starter, standard, premium, enterprise
  billingCycle: text("billing_cycle").notNull().default("monthly"), // monthly, annual
  monthlyFee: real("monthly_fee").notNull().default(0), // Base monthly fee
  transactionFee: real("transaction_fee").default(0), // Per-transaction fee (can be 0)
  
  // Status
  status: text("status").notNull().default("active"), // active, past_due, canceled, paused
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  canceledAt: timestamp("canceled_at"),
  
  // Usage tracking
  includedOrders: integer("included_orders").default(0), // Orders included in monthly fee
  totalOrders: integer("total_orders").default(0), // Total orders processed
  currentMonthOrders: integer("current_month_orders").default(0),
  
  // Trial
  trialEndsAt: timestamp("trial_ends_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Retailer API Keys - API authentication tokens
export const retailerApiKeys = pgTable("retailer_api_keys", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  
  name: text("name").notNull(), // User-friendly name
  keyPrefix: text("key_prefix").notNull(), // First 8 chars for identification (e.g., "ret_live_")
  keyHash: text("key_hash").notNull(), // Hashed full key
  
  // Permissions
  permissions: jsonb("permissions").default([]), // read, write, delete
  scopes: jsonb("scopes").default([]), // orders, analytics, webhooks
  
  // Status
  isActive: boolean("is_active").default(true).notNull(),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  
  // Rate limiting
  rateLimit: integer("rate_limit").default(1000), // Requests per hour
  currentUsage: integer("current_usage").default(0),
  
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  revokedAt: timestamp("revoked_at"),
});

// Retailer Invoices - Billing history and records
export const retailerInvoices = pgTable("retailer_invoices", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  subscriptionId: integer("subscription_id").references(() => retailerSubscriptions.id),
  
  // Stripe details
  stripeInvoiceId: text("stripe_invoice_id").unique(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  
  // Invoice details
  invoiceNumber: text("invoice_number").notNull().unique(),
  invoiceDate: timestamp("invoice_date").defaultNow().notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidAt: timestamp("paid_at"),
  
  // Amounts
  subtotal: real("subtotal").notNull(),
  tax: real("tax").default(0),
  total: real("total").notNull(),
  amountPaid: real("amount_paid").default(0),
  amountDue: real("amount_due").notNull(),
  
  // Line items
  lineItems: jsonb("line_items").default([]), // Array of {description, quantity, unitPrice, total}
  
  // Status
  status: text("status").notNull().default("draft"), // draft, open, paid, void, uncollectible
  
  // Billing period
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // Documents
  pdfUrl: text("pdf_url"),
  
  // Metadata
  notes: text("notes"),
  metadata: jsonb("metadata").default({}),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Retailer Webhooks - Outbound event notifications to retailer systems
export const retailerWebhooks = pgTable("retailer_webhooks", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  
  // Endpoint configuration
  url: text("url").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  secret: text("secret").notNull(), // HMAC signing secret
  
  // Event subscriptions
  subscribedEvents: jsonb("subscribed_events").default([]).notNull(), // Array of event names
  
  // Status and health
  isActive: boolean("is_active").default(true).notNull(),
  lastTriggeredAt: timestamp("last_triggered_at"),
  lastSuccessAt: timestamp("last_success_at"),
  lastFailureAt: timestamp("last_failure_at"),
  consecutiveFailures: integer("consecutive_failures").default(0),
  
  // Retry configuration
  maxRetries: integer("max_retries").default(3),
  retryBackoffMultiplier: integer("retry_backoff_multiplier").default(2),
  timeoutSeconds: integer("timeout_seconds").default(10),
  
  // Metadata
  metadata: jsonb("metadata").default({}),
  
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Retailer Webhook Deliveries - Track webhook delivery attempts
export const retailerWebhookDeliveries = pgTable("retailer_webhook_deliveries", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  webhookId: integer("webhook_id").references(() => retailerWebhooks.id).notNull(),
  
  // Event details
  eventType: text("event_type").notNull(),
  orderId: text("order_id").references(() => orders.id),
  
  // Request/Response
  requestPayload: jsonb("request_payload").notNull(),
  requestHeaders: jsonb("request_headers").default({}),
  responseStatus: integer("response_status"),
  responseBody: text("response_body"),
  responseHeaders: jsonb("response_headers"),
  
  // Timing
  attemptNumber: integer("attempt_number").default(1).notNull(),
  durationMs: integer("duration_ms"),
  
  // Status
  isSuccessful: boolean("is_successful").default(false),
  errorMessage: text("error_message"),
  
  // Next retry
  nextRetryAt: timestamp("next_retry_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Retailer Usage Metrics - Track API usage and order volume
export const retailerUsageMetrics = pgTable("retailer_usage_metrics", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  
  date: timestamp("date").notNull(), // Daily metrics
  
  // Order metrics
  ordersCreated: integer("orders_created").default(0),
  ordersCompleted: integer("orders_completed").default(0),
  ordersCancelled: integer("orders_cancelled").default(0),
  totalOrderValue: real("total_order_value").default(0),
  
  // API metrics
  apiRequestsTotal: integer("api_requests_total").default(0),
  apiRequestsSuccessful: integer("api_requests_successful").default(0),
  apiRequestsFailed: integer("api_requests_failed").default(0),
  
  // Webhook metrics
  webhooksDelivered: integer("webhooks_delivered").default(0),
  webhooksFailed: integer("webhooks_failed").default(0),
  
  // Financial metrics
  revenueGenerated: real("revenue_generated").default(0),
  feesCharged: real("fees_charged").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Company and Return Policy Types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ReturnPolicy = typeof returnPolicies.$inferSelect;
export type InsertReturnPolicy = typeof returnPolicies.$inferInsert;
export const insertReturnPolicySchema = createInsertSchema(returnPolicies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CompanyLocation = typeof companyLocations.$inferSelect;
export type InsertCompanyLocation = typeof companyLocations.$inferInsert;
export const insertCompanyLocationSchema = createInsertSchema(companyLocations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Retailer Portal Types
export type RetailerAccount = typeof retailerAccounts.$inferSelect;
export type InsertRetailerAccount = typeof retailerAccounts.$inferInsert;
export const insertRetailerAccountSchema = createInsertSchema(retailerAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type RetailerSubscription = typeof retailerSubscriptions.$inferSelect;
export type InsertRetailerSubscription = typeof retailerSubscriptions.$inferInsert;
export const insertRetailerSubscriptionSchema = createInsertSchema(retailerSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type RetailerApiKey = typeof retailerApiKeys.$inferSelect;
export type InsertRetailerApiKey = typeof retailerApiKeys.$inferInsert;
export const insertRetailerApiKeySchema = createInsertSchema(retailerApiKeys).omit({
  id: true,
  createdAt: true,
  revokedAt: true,
});

export type RetailerInvoice = typeof retailerInvoices.$inferSelect;
export type InsertRetailerInvoice = typeof retailerInvoices.$inferInsert;
export const insertRetailerInvoiceSchema = createInsertSchema(retailerInvoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Multi-Stop Route Types
export type Route = typeof routes.$inferSelect;
export type InsertRoute = typeof routes.$inferInsert;
export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type RouteStop = typeof routeStops.$inferSelect;
export type InsertRouteStop = typeof routeStops.$inferInsert;
export const insertRouteStopSchema = createInsertSchema(routeStops).omit({
  id: true,
  createdAt: true,
});

// Multi-Stop Route Response Schemas
export const MultiStopRouteSchema = z.object({
  id: z.number(),
  driverId: z.number(),
  status: z.string(),
  totalStops: z.number(),
  totalDistance: z.number(),
  totalDuration: z.number(),
  totalEarnings: z.number(),
  optimizedSequence: z.array(z.string()),
  stops: z.array(z.object({
    id: z.number(),
    orderId: z.string(),
    stopSequence: z.number(),
    status: z.string(),
    address: z.string(),
    coordinates: z.any().optional(),
    estimatedArrival: z.string().optional(),
    pickupTime: z.string().optional(),
    itemDescription: z.string().optional(),
    earnings: z.number(),
  })),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  currentStopIndex: z.number(),
  createdAt: z.string(),
});

export type MultiStopRoute = z.infer<typeof MultiStopRouteSchema>;

export type RetailerUsageMetric = typeof retailerUsageMetrics.$inferSelect;
export type InsertRetailerUsageMetric = typeof retailerUsageMetrics.$inferInsert;
export const insertRetailerUsageMetricSchema = createInsertSchema(retailerUsageMetrics).omit({
  id: true,
  createdAt: true,
});

export type RetailerWebhook = typeof retailerWebhooks.$inferSelect;
export type InsertRetailerWebhook = typeof retailerWebhooks.$inferInsert;
export const insertRetailerWebhookSchema = createInsertSchema(retailerWebhooks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type RetailerWebhookDelivery = typeof retailerWebhookDeliveries.$inferSelect;
export type InsertRetailerWebhookDelivery = typeof retailerWebhookDeliveries.$inferInsert;
export const insertRetailerWebhookDeliverySchema = createInsertSchema(retailerWebhookDeliveries).omit({
  id: true,
  createdAt: true,
});

// ============================================================================
// RETURN GRAPH - Proprietary Routing & Intelligence System
// ============================================================================
// The Return Graph is ReturnIt's competitive moat - a knowledge graph that learns
// which drop-off points work best, which stores accept third-party returns,
// and optimal routing strategies based on real-world performance data.

// Graph Nodes - Physical locations in the return network
export const graphNodes = pgTable("graph_nodes", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  
  // Node Type & Identity
  nodeType: text("node_type").notNull(), // "store", "dropoff_point", "partner_network", "collection_center"
  name: text("name").notNull(),
  
  // Reference to existing entities (if applicable)
  companyId: integer("company_id").references(() => companies.id),
  companyLocationId: integer("company_location_id").references(() => companyLocations.id),
  
  // Location Data
  address: text("address").notNull(),
  coordinates: jsonb("coordinates").notNull(), // {lat: number, lng: number}
  serviceArea: jsonb("service_area"), // Polygon or radius defining coverage area
  
  // Node Capabilities
  acceptsThirdPartyReturns: boolean("accepts_third_party_returns").default(false),
  acceptsAllBrands: boolean("accepts_all_brands").default(false),
  acceptedBrands: jsonb("accepted_brands").default([]), // Array of company IDs or names
  
  // Operational Details
  operatingHours: jsonb("operating_hours"), // Hours by day of week
  maxDailyCapacity: integer("max_daily_capacity").default(50),
  averageProcessingTime: integer("average_processing_time").default(5), // minutes
  
  // Quality Metrics (learned over time)
  successRate: real("success_rate").default(1.0), // 0.0 to 1.0
  averageWaitTime: integer("average_wait_time").default(0), // minutes
  customerSatisfactionScore: real("customer_satisfaction_score").default(5.0), // 1.0 to 5.0
  
  // Status & Metadata
  isActive: boolean("is_active").default(true),
  verifiedAt: timestamp("verified_at"), // Last time we confirmed node still works
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  nodeTypeIdx: index("graph_nodes_node_type_idx").on(table.nodeType),
  coordinatesIdx: index("graph_nodes_coordinates_idx").on(table.coordinates),
  isActiveIdx: index("graph_nodes_is_active_idx").on(table.isActive),
}));

// Graph Edges - Connections between nodes with multi-dimensional weights
export const graphEdges = pgTable("graph_edges", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  
  // Connection
  fromNodeId: integer("from_node_id").references(() => graphNodes.id).notNull(),
  toNodeId: integer("to_node_id").references(() => graphNodes.id).notNull(),
  
  // Multi-Dimensional Weights (used for pathfinding)
  distanceKm: real("distance_km").notNull(),
  estimatedTimeMinutes: integer("estimated_time_minutes").notNull(),
  
  // Learned Weights (improve over time with ML)
  acceptanceProbability: real("acceptance_probability").default(0.8), // 0.0 to 1.0
  historicalSuccessRate: real("historical_success_rate").default(1.0), // 0.0 to 1.0
  averageCompletionTime: integer("average_completion_time"), // actual minutes (vs estimated)
  
  // Cost Factors
  estimatedFuelCost: real("estimated_fuel_cost").default(0),
  trafficMultiplier: real("traffic_multiplier").default(1.0), // 1.0 = normal, 1.5 = heavy traffic
  
  // Routing Preferences
  preferredTimeWindows: jsonb("preferred_time_windows").default([]), // Best times to use this route
  avoidTimeWindows: jsonb("avoid_time_windows").default([]), // Times to avoid
  
  // Edge Quality
  reliabilityScore: real("reliability_score").default(1.0), // 0.0 to 1.0
  lastUsed: timestamp("last_used"),
  
  // Status
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  fromNodeIdx: index("graph_edges_from_node_idx").on(table.fromNodeId),
  toNodeIdx: index("graph_edges_to_node_idx").on(table.toNodeId),
  isActiveIdx: index("graph_edges_is_active_idx").on(table.isActive),
}));

// Routing Decisions - Log every routing decision for ML training
export const routingDecisions = pgTable("routing_decisions", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  
  // Order Context
  orderId: text("order_id").references(() => orders.id).notNull(),
  customerId: integer("customer_id").references(() => users.id),
  driverId: integer("driver_id").references(() => users.id),
  
  // Decision Details
  pickedNodeId: integer("picked_node_id").references(() => graphNodes.id).notNull(),
  alternativeNodeIds: jsonb("alternative_node_ids").default([]), // Other nodes considered
  
  // Algorithm & Criteria
  algorithmUsed: text("algorithm_used").notNull(), // "a_star", "dijkstra", "ml_optimized", "manual"
  optimizationCriteria: text("optimization_criteria").notNull(), // "distance", "time", "cost", "multi_criteria"
  
  // Input Weights Used for Decision
  weightDistance: real("weight_distance").default(0.4),
  weightTime: real("weight_time").default(0.3),
  weightAcceptance: real("weight_acceptance").default(0.2),
  weightCost: real("weight_cost").default(0.1),
  
  // Predicted Outcomes
  predictedDistance: real("predicted_distance"),
  predictedTime: integer("predicted_time"),
  predictedAcceptanceProbability: real("predicted_acceptance_probability"),
  predictedCost: real("predicted_cost"),
  
  // Actual Outcomes (filled in after completion)
  actualDistance: real("actual_distance"),
  actualTime: integer("actual_time"),
  wasAccepted: boolean("was_accepted"),
  actualCost: real("actual_cost"),
  
  // Success Metrics
  wasSuccessful: boolean("was_successful"),
  customerRating: integer("customer_rating"), // 1-5 stars
  issuesEncountered: jsonb("issues_encountered").default([]),
  
  // Learning Data
  predictionAccuracy: real("prediction_accuracy"), // How close predictions were to reality
  
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at")
}, (table) => ({
  orderIdIdx: index("routing_decisions_order_id_idx").on(table.orderId),
  pickedNodeIdx: index("routing_decisions_picked_node_idx").on(table.pickedNodeId),
  algorithmIdx: index("routing_decisions_algorithm_idx").on(table.algorithmUsed),
  createdAtIdx: index("routing_decisions_created_at_idx").on(table.createdAt),
}));

// Node Performance History - Track how nodes perform over time
export const nodePerformanceHistory = pgTable("node_performance_history", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  
  nodeId: integer("node_id").references(() => graphNodes.id).notNull(),
  
  // Time Period
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  periodType: text("period_type").notNull(), // "hourly", "daily", "weekly"
  
  // Performance Metrics
  totalAttempts: integer("total_attempts").default(0),
  successfulReturns: integer("successful_returns").default(0),
  rejectedReturns: integer("rejected_returns").default(0),
  
  // Timing Metrics
  avgWaitTime: integer("avg_wait_time").default(0), // minutes
  avgProcessingTime: integer("avg_processing_time").default(0), // minutes
  
  // Quality Metrics
  avgCustomerRating: real("avg_customer_rating"),
  issueRate: real("issue_rate").default(0), // Percentage of returns with issues
  
  // Capacity Metrics
  peakHourVolume: integer("peak_hour_volume").default(0),
  utilizationRate: real("utilization_rate").default(0), // Percentage of capacity used
  
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  nodeIdIdx: index("node_performance_history_node_id_idx").on(table.nodeId),
  periodStartIdx: index("node_performance_history_period_start_idx").on(table.periodStart),
}));

// Policy Rules - Dynamic rules learned from experience
export const graphPolicyRules = pgTable("graph_policy_rules", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  
  // Rule Identity
  ruleName: text("rule_name").notNull(),
  ruleType: text("rule_type").notNull(), // "acceptance", "routing", "timing", "capacity"
  
  // Scope
  appliesToNodeId: integer("applies_to_node_id").references(() => graphNodes.id),
  appliesToBrand: text("applies_to_brand"), // Specific company/brand
  appliesToCategory: text("applies_to_category"), // Product category
  
  // Rule Logic
  condition: jsonb("condition").notNull(), // Structured condition JSON
  action: jsonb("action").notNull(), // What to do when condition met
  
  // Learning Metadata
  confidenceScore: real("confidence_score").default(0.5), // 0.0 to 1.0 - how sure we are this rule is correct
  basedOnSampleSize: integer("based_on_sample_size").default(0), // How many observations
  
  // Rule Status
  isActive: boolean("is_active").default(true),
  learnedAt: timestamp("learned_at").defaultNow(),
  lastValidatedAt: timestamp("last_validated_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  ruleTypeIdx: index("graph_policy_rules_rule_type_idx").on(table.ruleType),
  nodeIdIdx: index("graph_policy_rules_node_id_idx").on(table.appliesToNodeId),
  isActiveIdx: index("graph_policy_rules_is_active_idx").on(table.isActive),
}));

// Return Graph Types & Schemas
export type GraphNode = typeof graphNodes.$inferSelect;
export type InsertGraphNode = typeof graphNodes.$inferInsert;
export const insertGraphNodeSchema = createInsertSchema(graphNodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type GraphEdge = typeof graphEdges.$inferSelect;
export type InsertGraphEdge = typeof graphEdges.$inferInsert;
export const insertGraphEdgeSchema = createInsertSchema(graphEdges).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type RoutingDecision = typeof routingDecisions.$inferSelect;
export type InsertRoutingDecision = typeof routingDecisions.$inferInsert;
export const insertRoutingDecisionSchema = createInsertSchema(routingDecisions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type NodePerformanceHistory = typeof nodePerformanceHistory.$inferSelect;
export type InsertNodePerformanceHistory = typeof nodePerformanceHistory.$inferInsert;
export const insertNodePerformanceHistorySchema = createInsertSchema(nodePerformanceHistory).omit({
  id: true,
  createdAt: true,
});

export type GraphPolicyRule = typeof graphPolicyRules.$inferSelect;
export type InsertGraphPolicyRule = typeof graphPolicyRules.$inferInsert;
export const insertGraphPolicyRuleSchema = createInsertSchema(graphPolicyRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================================================
// POST-PURCHASE ENGAGEMENT SYSTEM
// ============================================================================

// Partner Offers - All offers synced from affiliate networks
export const partnerOffers = pgTable("partner_offers", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  
  // Source tracking
  network: text("network").notNull(), // "impact", "rakuten", "cj", "amazon_direct", "walmart_direct"
  networkOfferId: text("network_offer_id").notNull(), // External offer ID from network
  
  // Brand and category
  brand: text("brand").notNull(), // "Nike", "Target", "H&M"
  category: text("category"), // "Shoes", "Clothing", "Electronics"
  
  // Offer details
  title: text("title").notNull(),
  description: text("description"),
  couponCode: text("coupon_code"), // "NIKE20" or null
  affiliateLink: text("affiliate_link").notNull(), // Tracking URL
  imageUrl: text("image_url"),
  
  // Validity period
  validFrom: timestamp("valid_from").notNull(),
  validTo: timestamp("valid_to").notNull(),
  
  // Financial - using numeric for precision
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }), // 8.50 = 8.5%
  
  // Status and control
  status: text("status").notNull().default("active"), // "pending", "active", "paused", "expired"
  priority: integer("priority").default(0), // Higher = shows first
  
  // Metadata
  autoSyncedAt: timestamp("auto_synced_at").defaultNow(),
  pausedBy: integer("paused_by").references(() => users.id),
  pausedAt: timestamp("paused_at"),
  pauseReason: text("pause_reason"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Unique constraint to prevent duplicate offers from same network
  networkOfferUnique: unique("partner_offers_network_offer_unique").on(table.network, table.networkOfferId),
  // Indexes for query performance
  networkIdx: index("partner_offers_network_idx").on(table.network),
  brandIdx: index("partner_offers_brand_idx").on(table.brand),
  categoryIdx: index("partner_offers_category_idx").on(table.category),
  statusIdx: index("partner_offers_status_idx").on(table.status),
  validToIdx: index("partner_offers_valid_to_idx").on(table.validTo),
}));

// Engagement Prompts - Track what offers were shown to users
export const engagementPrompts = pgTable("engagement_prompts", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  
  // References
  userId: integer("user_id").references(() => users.id).notNull(),
  orderId: text("order_id").references(() => orders.id).notNull(),
  offerId: integer("offer_id").references(() => partnerOffers.id).notNull(),
  
  // Channel tracking
  channels: jsonb("channels").default([]).notNull(), // ["in_app", "push", "email"]
  
  // Engagement tracking
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  viewedAt: timestamp("viewed_at"), // When user saw the offer
  clickedAt: timestamp("clicked_at"), // When user clicked
  
  // Conversion tracking (if available from affiliate network) - using numeric for precision
  conversionValue: numeric("conversion_value", { precision: 10, scale: 2 }), // Purchase amount if tracked
  affiliateCommission: numeric("affiliate_commission", { precision: 10, scale: 2 }), // Our commission earned
  conversionTrackedAt: timestamp("conversion_tracked_at"),
  
  // Metadata
  metadata: jsonb("metadata").default({}),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("engagement_prompts_user_id_idx").on(table.userId),
  orderIdIdx: index("engagement_prompts_order_id_idx").on(table.orderId),
  offerIdIdx: index("engagement_prompts_offer_id_idx").on(table.offerId),
  sentAtIdx: index("engagement_prompts_sent_at_idx").on(table.sentAt),
  clickedAtIdx: index("engagement_prompts_clicked_at_idx").on(table.clickedAt),
}));

// User Notification Preferences
export const userNotificationPreferences = pgTable("user_notification_preferences", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  
  // Channel preferences
  enableInApp: boolean("enable_in_app").default(true).notNull(), // Always true
  enablePush: boolean("enable_push").default(true).notNull(),
  enableEmail: boolean("enable_email").default(true).notNull(),
  
  // Unsubscribe tracking
  unsubscribeToken: text("unsubscribe_token").unique(), // For email unsubscribe links
  unsubscribedAt: timestamp("unsubscribed_at"),
  unsubscribeReason: text("unsubscribe_reason"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_notification_preferences_user_id_idx").on(table.userId),
  unsubscribeTokenIdx: index("user_notification_preferences_unsubscribe_token_idx").on(table.unsubscribeToken),
}));

// Email Quota Tracker - Auto-cutoff system to prevent costs
export const emailQuotaTracker = pgTable("email_quota_tracker", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  
  // Date tracking
  date: timestamp("date").notNull().unique(), // Date for this quota period
  month: text("month").notNull(), // "2025-10" for monthly tracking
  
  // Quota counts
  emailsSentToday: integer("emails_sent_today").default(0).notNull(),
  emailsSentMonth: integer("emails_sent_month").default(0).notNull(),
  
  // Limits (configurable)
  quotaDaily: integer("quota_daily").default(100).notNull(),
  quotaMonthly: integer("quota_monthly").default(3000).notNull(),
  safetyBuffer: integer("safety_buffer").default(5).notNull(), // Stop at 95 instead of 100
  
  // Status
  isPaused: boolean("is_paused").default(false).notNull(),
  pausedAt: timestamp("paused_at"),
  pauseReason: text("pause_reason"),
  
  // Manual override
  manuallyPausedBy: integer("manually_paused_by").references(() => users.id),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  dateIdx: index("email_quota_tracker_date_idx").on(table.date),
  monthIdx: index("email_quota_tracker_month_idx").on(table.month),
}));

// Engagement Analytics - Aggregated metrics (optional, can be calculated on-the-fly)
export const engagementAnalytics = pgTable("engagement_analytics", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  
  // Period
  date: timestamp("date").notNull(),
  offerId: integer("offer_id").references(() => partnerOffers.id).notNull(),
  
  // Metrics
  impressions: integer("impressions").default(0).notNull(), // Times shown
  views: integer("views").default(0).notNull(), // Actually viewed
  clicks: integer("clicks").default(0).notNull(),
  conversions: integer("conversions").default(0).notNull(),
  
  // Calculated rates - using numeric for precision
  ctr: numeric("ctr", { precision: 5, scale: 2 }).default("0"), // Click-through rate percentage
  conversionRate: numeric("conversion_rate", { precision: 5, scale: 2 }).default("0"), // Conversion rate percentage
  
  // Revenue - using numeric for precision
  revenueGenerated: numeric("revenue_generated", { precision: 10, scale: 2 }).default("0"),
  commissionEarned: numeric("commission_earned", { precision: 10, scale: 2 }).default("0"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  dateOfferIdx: index("engagement_analytics_date_offer_idx").on(table.date, table.offerId),
  offerIdIdx: index("engagement_analytics_offer_id_idx").on(table.offerId),
}));

// Type exports for post-purchase engagement
export type PartnerOffer = typeof partnerOffers.$inferSelect;
export type InsertPartnerOffer = typeof partnerOffers.$inferInsert;
export const insertPartnerOfferSchema = createInsertSchema(partnerOffers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type EngagementPrompt = typeof engagementPrompts.$inferSelect;
export type InsertEngagementPrompt = typeof engagementPrompts.$inferInsert;
export const insertEngagementPromptSchema = createInsertSchema(engagementPrompts).omit({
  id: true,
  createdAt: true,
});

export type UserNotificationPreference = typeof userNotificationPreferences.$inferSelect;
export type InsertUserNotificationPreference = typeof userNotificationPreferences.$inferInsert;
export const insertUserNotificationPreferenceSchema = createInsertSchema(userNotificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type EmailQuotaTracker = typeof emailQuotaTracker.$inferSelect;
export type InsertEmailQuotaTracker = typeof emailQuotaTracker.$inferInsert;
export const insertEmailQuotaTrackerSchema = createInsertSchema(emailQuotaTracker).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type EngagementAnalytic = typeof engagementAnalytics.$inferSelect;
export type InsertEngagementAnalytic = typeof engagementAnalytics.$inferInsert;
export const insertEngagementAnalyticSchema = createInsertSchema(engagementAnalytics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Messages - Customer-Driver real-time chat for active orders
export const messages = pgTable("messages", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  
  // Order association (orders.id is TEXT)
  orderId: text("order_id").references(() => orders.id).notNull(),
  
  // Sender information (users.id is INTEGER)
  senderId: integer("sender_id").references(() => users.id).notNull(),
  senderType: text("sender_type").notNull(), // "customer" or "driver"
  senderName: text("sender_name").notNull(), // Display name for chat
  
  // Message content
  messageText: text("message_text").notNull(),
  
  // Message metadata
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  orderIdIdx: index("messages_order_id_idx").on(table.orderId),
  senderIdIdx: index("messages_sender_id_idx").on(table.senderId),
  createdAtIdx: index("messages_created_at_idx").on(table.createdAt),
}));

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
  readAt: true,
});

// System Settings - Configurable operational parameters
export const systemSettings = pgTable("system_settings", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  
  // Setting identification
  key: text("key").notNull().unique(), // Unique setting identifier
  value: text("value").notNull(), // JSON-encoded value
  dataType: text("data_type").notNull(), // "number", "boolean", "string", "json"
  
  // Metadata
  category: text("category").notNull(), // "driver", "order", "timeout", "notification", etc.
  label: text("label").notNull(), // Human-readable label
  description: text("description"), // Detailed description of what this setting controls
  
  // Validation
  minValue: numeric("min_value"), // For numeric settings
  maxValue: numeric("max_value"), // For numeric settings
  allowedValues: jsonb("allowed_values"), // For enum-like settings
  
  // Status
  isActive: boolean("is_active").default(true).notNull(),
  lastModifiedBy: integer("last_modified_by").references(() => users.id),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  keyIdx: index("system_settings_key_idx").on(table.key),
  categoryIdx: index("system_settings_category_idx").on(table.category),
}));

export type SystemSetting = typeof systemSettings.$inferSelect;
export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;