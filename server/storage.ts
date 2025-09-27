import { 
  type User, type InsertUser, type Order, type InsertOrder,
  type PromoCode, type InsertPromoCode, type DriverEarning, type InsertDriverEarning,
  type Notification, type InsertNotification, type Analytics, type InsertAnalytics,
  type DriverPayout, type InsertDriverPayout, type DriverIncentive, type InsertDriverIncentive,
  type BusinessInfo, type InsertBusinessInfo,
  type DriverApplication, type InsertDriverApplication,
  type TrackingEvent, type InsertTrackingEvent,
  OrderStatus, type OrderStatus as OrderStatusType,
  type Location, LocationSchema
} from "@shared/schema";
import { generateUniqueTrackingNumber } from "@shared/utils/trackingNumberGenerator";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getDrivers(isOnline?: boolean): Promise<User[]>;
  getCustomers(): Promise<User[]>;
  getEmployees(): Promise<User[]>;
  
  // Order operations
  getOrder(id: string): Promise<Order | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  getDriverOrders(driverId: number): Promise<Order[]>;
  getAvailableOrders(): Promise<Order[]>;
  getOrdersByStatus(status: OrderStatusType): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined>;
  assignOrderToDriver(orderId: string, driverId: number): Promise<Order | undefined>;
  updateDriverStatus(driverId: number, status: string): Promise<User | undefined>;
  getOrdersByDriver(driverId: number): Promise<Order[]>;
  
  // Promo code operations
  getPromoCode(code: string): Promise<PromoCode | undefined>;
  createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode>;
  validatePromoCode(code: string): Promise<{ valid: boolean; discount?: number; type?: string }>;
  updatePromoCode(code: string, updates: Partial<PromoCode>): Promise<PromoCode | undefined>;
  
  // Driver earnings
  getDriverEarnings(driverId: number): Promise<DriverEarning[]>;
  createDriverEarning(earning: InsertDriverEarning): Promise<DriverEarning>;
  
  // Notifications
  getUserNotifications(userId: number): Promise<Notification[]>;
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<void>;
  markNotificationAsRead(id: number): Promise<boolean>;
  
  // Payment methods
  getPaymentRecords(): Promise<any[]>;
  getPaymentSummary(): Promise<any>;
  exportPaymentData(format: string, dateRange: string, status: string): Promise<Buffer>;
  generateTaxReport(year: number): Promise<Buffer>;
  generate1099Forms(year: number): Promise<Buffer>;
  
  // Analytics
  recordAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getAnalytics(metric: string, from?: Date, to?: Date): Promise<Analytics[]>;
  
  // Driver payouts and Stripe Connect
  createDriverPayout(payout: InsertDriverPayout): Promise<DriverPayout>;
  getDriverPayouts(driverId: number): Promise<DriverPayout[]>;
  updateDriverPayout(id: number, updates: Partial<DriverPayout>): Promise<DriverPayout | undefined>;
  
  // Driver incentives and bonuses
  createDriverIncentive(incentive: InsertDriverIncentive): Promise<DriverIncentive>;
  getDriverIncentives(driverId: number): Promise<DriverIncentive[]>;
  calculateOrderBonuses(order: Order, driver: User): Promise<number>;
  
  // Business information
  getBusinessInfo(): Promise<BusinessInfo | undefined>;
  updateBusinessInfo(info: InsertBusinessInfo): Promise<BusinessInfo>;

  // Driver Applications
  createDriverApplication(application: InsertDriverApplication): Promise<DriverApplication>;
  getDriverApplication(id: string): Promise<DriverApplication | undefined>;
  getUserDriverApplication(userId: number): Promise<DriverApplication | undefined>;
  updateDriverApplication(id: string, updates: Partial<DriverApplication>): Promise<DriverApplication | undefined>;
  getAllDriverApplications(): Promise<DriverApplication[]>;

  // Tracking operations
  getOrderByTrackingNumber(trackingNumber: string): Promise<Order | undefined>;
  updateDriverLocation(driverId: number, location: Location): Promise<User | undefined>;
  getDriverLocation(driverId: number): Promise<Location | undefined>;
  getOrderCurrentLocation(orderId: string): Promise<Location | undefined>;
  getOrderLocationByTracking(trackingNumber: string): Promise<Location | undefined>;
  createTrackingEvent(trackingEvent: InsertTrackingEvent): Promise<TrackingEvent>;
  getOrderTrackingEvents(orderId: string): Promise<TrackingEvent[]>;
  getTrackingEvent(id: number): Promise<TrackingEvent | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private orders: Map<string, Order>;
  private promoCodes: Map<string, PromoCode>;
  private driverEarnings: Map<number, DriverEarning>;
  private notifications: Map<number, Notification>;
  private analytics: Map<string, Analytics>;
  private driverPayouts: Map<number, DriverPayout>;
  private driverIncentives: Map<number, DriverIncentive>;
  private businessInfo: BusinessInfo | undefined;
  private driverApplications: Map<string, DriverApplication>;
  private paymentRecords: Map<string, any>;
  private trackingEvents: Map<number, TrackingEvent>;
  private trackingNumberIndex: Map<string, string>; // trackingNumber -> orderId for O(1) lookup
  private nextUserId: number = 1;
  private nextNotificationId: number = 1;
  private nextEarningId: number = 1;
  private nextPromoId: number = 1;
  private nextAnalyticsId: number = 1;
  private nextPayoutId: number = 1;
  private nextIncentiveId: number = 1;
  private nextTrackingEventId: number = 1;

  constructor() {
    this.users = new Map();
    this.orders = new Map();
    this.promoCodes = new Map();
    this.driverEarnings = new Map();
    this.notifications = new Map();
    this.analytics = new Map();
    this.driverPayouts = new Map();
    this.driverIncentives = new Map();
    this.driverApplications = new Map();
    this.paymentRecords = new Map();
    this.trackingEvents = new Map();
    this.trackingNumberIndex = new Map();
    
    // Master Administrator account (real data only)
    const masterAdmin: User = {
      id: 1,
      email: 'nabeelmumtaz92@gmail.com',
      password: '$2b$12$/XVGfZQjZwmNkfjYKWBEuu.I3wRFH.09omnyVs1BJSishGXXtCGgC', // hashed 'Mumtanab00-0'
      firstName: 'Nabeel',
      lastName: 'Mumtaz',
      phone: '6362544821',
      dateOfBirth: '1990-01-01',
      isDriver: true,
      tutorialCompleted: true,
      isAdmin: true,
      isActive: true,
      role: 'admin',
      department: 'management',
      employeeId: 'ADM001',
      permissions: ['admin', 'driver', 'customer'],
      profileImage: null,
      preferences: { role: 'master_admin' },
      addresses: [],
      paymentMethods: [],
      driverLicense: null,
      vehicleInfo: null,
      bankInfo: null,
      driverRating: 5.0,
      totalEarnings: 0,
      completedDeliveries: 0,
      isOnline: false,
      currentLocation: null,
      stripeConnectAccountId: null,
      stripeOnboardingComplete: false,
      paymentPreference: 'weekly',
      instantPayFeePreference: 1.00,
      hireDate: new Date('2025-01-01'),
      assignedCity: 'st-louis',
      serviceZones: [],
      emergencyContacts: [],
      lastSafetyCheck: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(1, masterAdmin);
    
    // Test user for testing purposes
    const testUser: User = {
      id: 99,
      email: 'test@returnit.online',
      password: '$2b$10$JGzTnuHXUj7688DLWRzDe.bvFhY/9M35WX6nqSpBxe.HALDFDBb12', // hashed 'Test123!'
      firstName: 'Test',
      lastName: 'User',
      phone: '(555) 123-4567',
      dateOfBirth: '1990-01-01',
      isDriver: false,
      tutorialCompleted: false,
      isAdmin: false,
      isActive: true,
      role: 'customer',
      department: null,
      employeeId: null,
      permissions: ['customer'],
      profileImage: null,
      preferences: {},
      addresses: [],
      paymentMethods: [],
      driverLicense: null,
      vehicleInfo: null,
      bankInfo: null,
      driverRating: 5.0,
      totalEarnings: 0,
      completedDeliveries: 0,
      isOnline: false,
      currentLocation: null,
      stripeConnectAccountId: null,
      stripeOnboardingComplete: false,
      paymentPreference: 'weekly',
      instantPayFeePreference: 1.00,
      hireDate: null,
      assignedCity: 'st-louis',
      serviceZones: [],
      emergencyContacts: [],
      lastSafetyCheck: null,
      availableHours: {},
      preferredRoutes: [],
      serviceRadius: 25.0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(99, testUser);
    
    // Second Master Administrator account
    const masterAdmin2: User = {
      id: 2,
      email: 'durremumtaz@gmail.com',
      password: '$2b$12$aPORhavz.6yYMICwNn7cz.CMM2w/s/s3yM.Aqs1hbUpDdx/OxItYu', // hashed 'dsm1208'
      firstName: 'Durre',
      lastName: 'Mumtaz',
      phone: '6362544822',
      dateOfBirth: '1988-12-08',
      isDriver: false,
      tutorialCompleted: true,
      isAdmin: true,
      isActive: true,
      role: 'admin',
      department: 'management',
      employeeId: 'ADM002',
      permissions: ['admin', 'customer'],
      profileImage: null,
      preferences: { role: 'master_admin' },
      addresses: [],
      paymentMethods: [],
      driverLicense: null,
      vehicleInfo: null,
      bankInfo: null,
      driverRating: 5.0,
      totalEarnings: 0,
      completedDeliveries: 0,
      isOnline: false,
      currentLocation: null,
      stripeConnectAccountId: null,
      stripeOnboardingComplete: false,
      paymentPreference: 'weekly',
      instantPayFeePreference: 1.00,
      hireDate: new Date('2025-01-01'),
      assignedCity: 'st-louis',
      serviceZones: [],
      emergencyContacts: [],
      lastSafetyCheck: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(2, masterAdmin2);
    
    // Test users for comprehensive testing
    const testCustomer: User = {
      id: 3,
      email: 'testuser@test.com',
      password: '$2b$12$ftLGflVQZ9Br7ltRBCCrkubpZgme6Ur9T7/LfhH/BdOQAkOo1Ez4O', // hashed 'test123!'
      firstName: 'Test',
      lastName: 'User',
      phone: '+15551234567',
      dateOfBirth: null,
      isDriver: false,
      tutorialCompleted: true,
      isAdmin: false,
      isActive: true,
      role: 'customer',
      department: null,
      employeeId: null,
      permissions: ['customer'],
      profileImage: null,
      preferences: {},
      addresses: [],
      paymentMethods: [],
      driverLicense: null,
      vehicleInfo: null,
      bankInfo: null,
      driverRating: 5.0,
      totalEarnings: 0,
      completedDeliveries: 0,
      isOnline: false,
      currentLocation: null,
      stripeConnectAccountId: null,
      stripeOnboardingComplete: false,
      paymentPreference: 'weekly',
      instantPayFeePreference: 1.00,
      hireDate: null,
      assignedCity: 'st-louis',
      serviceZones: [],
      emergencyContacts: [],
      lastSafetyCheck: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(3, testCustomer);
    
    const testDriver: User = {
      id: 4,
      email: 'testdriver@test.com',
      password: '$2b$12$ftLGflVQZ9Br7ltRBCCrkubpZgme6Ur9T7/LfhH/BdOQAkOo1Ez4O', // hashed 'test123!'
      firstName: 'Test',
      lastName: 'Driver',
      phone: '+15551234568',
      dateOfBirth: null,
      isDriver: true,
      tutorialCompleted: true,
      isAdmin: false,
      isActive: true,
      role: 'driver',
      department: null,
      employeeId: 'DRV004',
      permissions: ['driver'],
      profileImage: null,
      preferences: {},
      addresses: [],
      paymentMethods: [],
      driverLicense: null,
      vehicleInfo: null,
      bankInfo: null,
      driverRating: 5.0,
      totalEarnings: 0,
      completedDeliveries: 0,
      isOnline: false,
      currentLocation: null,
      stripeConnectAccountId: null,
      stripeOnboardingComplete: false,
      paymentPreference: 'weekly',
      instantPayFeePreference: 1.00,
      hireDate: new Date('2025-01-01'),
      assignedCity: 'st-louis',
      serviceZones: [],
      emergencyContacts: [],
      lastSafetyCheck: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(4, testDriver);
    
    // Production data only - no additional demo content
    
    this.nextUserId = 5;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const user: User = { 
      id,
      email: insertUser.email,
      password: insertUser.password,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      phone: insertUser.phone || null,
      dateOfBirth: insertUser.dateOfBirth || null,
      isDriver: insertUser.isDriver ?? false,
      isAdmin: insertUser.isAdmin ?? false,
      isActive: insertUser.isActive ?? true,
      role: insertUser.role || 'customer',
      department: insertUser.department || null,
      employeeId: insertUser.employeeId || null,
      permissions: insertUser.permissions || [],
      profileImage: insertUser.profileImage || null,
      preferences: insertUser.preferences || {},
      addresses: insertUser.addresses || [],
      paymentMethods: insertUser.paymentMethods || [],
      driverLicense: insertUser.driverLicense || null,
      vehicleInfo: insertUser.vehicleInfo || null,
      bankInfo: insertUser.bankInfo || null,
      driverRating: insertUser.driverRating ?? 5.0,
      totalEarnings: insertUser.totalEarnings ?? 0,
      completedDeliveries: insertUser.completedDeliveries ?? 0,
      isOnline: insertUser.isOnline ?? false,
      currentLocation: insertUser.currentLocation || null,
      stripeConnectAccountId: insertUser.stripeConnectAccountId || null,
      stripeOnboardingComplete: insertUser.stripeOnboardingComplete ?? false,
      paymentPreference: insertUser.paymentPreference || 'weekly',
      instantPayFeePreference: insertUser.instantPayFeePreference ?? 1.00,
      tutorialCompleted: insertUser.tutorialCompleted ?? false,
      hireDate: insertUser.hireDate || null,
      assignedCity: insertUser.assignedCity || 'st-louis',
      serviceZones: insertUser.serviceZones || [],
      emergencyContacts: insertUser.emergencyContacts || [],
      lastSafetyCheck: insertUser.lastSafetyCheck || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getDrivers(isOnline?: boolean): Promise<User[]> {
    const drivers = Array.from(this.users.values()).filter(user => user.isDriver);
    if (isOnline !== undefined) {
      return drivers.filter(driver => driver.isOnline === isOnline);
    }
    return drivers;
  }

  async getCustomers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => 
      user.role === 'customer' || (!user.role && !user.isDriver && !user.isAdmin)
    );
  }

  async getEmployees(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Order operations
  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getDriverOrders(driverId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.driverId === driverId);
  }

  async getAvailableOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => 
      order.status === OrderStatus.CREATED && !order.driverId
    );
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = Math.random().toString(36).slice(2, 8).toUpperCase();
    
    // Generate unique tracking number with collision handling
    const trackingNumber = await generateUniqueTrackingNumber(async (tn) => {
      return this.trackingNumberIndex.has(tn);
    });
    
    const order: Order = {
      id,
      trackingNumber,
      userId: insertOrder.userId,
      status: OrderStatus.CREATED,
      trackingEnabled: insertOrder.trackingEnabled ?? true,
      trackingExpiresAt: insertOrder.trackingExpiresAt || null,
      pickupStreetAddress: insertOrder.pickupStreetAddress,
      pickupCity: insertOrder.pickupCity,
      pickupState: insertOrder.pickupState,
      pickupZipCode: insertOrder.pickupZipCode,
      pickupCoordinates: insertOrder.pickupCoordinates || null,
      pickupLocation: insertOrder.pickupLocation || 'inside',
      pickupInstructions: insertOrder.pickupInstructions || null,
      acceptsLiabilityTerms: insertOrder.acceptsLiabilityTerms ?? false,
      pickupWindow: insertOrder.pickupWindow || null,
      scheduledPickupTime: insertOrder.scheduledPickupTime || null,
      actualPickupTime: insertOrder.actualPickupTime || null,
      retailer: insertOrder.retailer,
      retailerLocation: insertOrder.retailerLocation || null,
      returnAddress: insertOrder.returnAddress || null,
      returnCoordinates: insertOrder.returnCoordinates || null,
      itemCategory: insertOrder.itemCategory,
      itemDescription: insertOrder.itemDescription,
      estimatedWeight: insertOrder.estimatedWeight || null,
      itemPhotos: insertOrder.itemPhotos || [],
      returnReason: insertOrder.returnReason || null,
      originalOrderNumber: insertOrder.originalOrderNumber || null,
      purchaseType: insertOrder.purchaseType || 'online',
      hasOriginalTags: insertOrder.hasOriginalTags ?? false,
      receiptUploaded: insertOrder.receiptUploaded ?? false,
      receiptUrl: insertOrder.receiptUrl || null,
      returnLabelUrl: insertOrder.returnLabelUrl || null,
      authorizationSigned: insertOrder.authorizationSigned ?? false,
      authorizationSignature: insertOrder.authorizationSignature || null,
      authorizationTimestamp: insertOrder.authorizationTimestamp || null,
      requiresInStoreReturn: insertOrder.requiresInStoreReturn ?? false,
      requiresCarrierDropoff: insertOrder.requiresCarrierDropoff ?? false,
      numberOfItems: insertOrder.numberOfItems ?? 1,
      itemSize: insertOrder.itemSize || 'M',
      packagingType: insertOrder.packagingType || 'bag',
      basePrice: insertOrder.basePrice ?? 3.99,
      distanceFee: insertOrder.distanceFee ?? 0,
      timeFee: insertOrder.timeFee ?? 0,
      sizeUpcharge: insertOrder.sizeUpcharge ?? 0,
      multiItemFee: insertOrder.multiItemFee ?? 0,
      serviceFee: insertOrder.serviceFee ?? 0,
      taxAmount: insertOrder.taxAmount ?? 0,
      totalOrderValue: insertOrder.totalOrderValue || null,
      valueTier: insertOrder.valueTier || null,
      valueTierFee: insertOrder.valueTierFee ?? 0,
      serviceFeeRate: insertOrder.serviceFeeRate ?? 0.15,
      driverValueBonus: insertOrder.driverValueBonus ?? 0,
      rushFee: insertOrder.rushFee ?? 0,
      surcharges: insertOrder.surcharges || [],
      discountCode: insertOrder.discountCode || null,
      discountAmount: insertOrder.discountAmount ?? 0,
      tip: insertOrder.tip ?? 0,
      totalPrice: insertOrder.totalPrice ?? 3.99,
      itemRefundAmount: insertOrder.itemRefundAmount || null,
      customerPaid: insertOrder.customerPaid || null,
      driverBasePay: insertOrder.driverBasePay ?? 0,
      driverDistancePay: insertOrder.driverDistancePay ?? 0,
      driverTimePay: insertOrder.driverTimePay ?? 0,
      driverSizeBonus: insertOrder.driverSizeBonus ?? 0,
      driverTip: insertOrder.driverTip ?? 0,
      driverTotalEarning: insertOrder.driverTotalEarning ?? 0,
      companyServiceFee: insertOrder.companyServiceFee ?? 0,
      companyBaseFeeShare: insertOrder.companyBaseFeeShare ?? 0,
      companyDistanceFeeShare: insertOrder.companyDistanceFeeShare ?? 0,
      companyTimeFeeShare: insertOrder.companyTimeFeeShare ?? 0,
      companyTotalRevenue: insertOrder.companyTotalRevenue ?? 0,
      stripePaymentIntentId: insertOrder.stripePaymentIntentId || null,
      stripeChargeId: insertOrder.stripeChargeId || null,
      paymentStatus: insertOrder.paymentStatus || 'pending',
      paymentMethod: insertOrder.paymentMethod || 'stripe',
      originalPaymentMethod: insertOrder.originalPaymentMethod || null,
      stripeRefundId: insertOrder.stripeRefundId || null,
      refundAmount: insertOrder.refundAmount || null,
      driverId: insertOrder.driverId || null,
      driverAssignedAt: insertOrder.driverAssignedAt || null,
      estimatedDeliveryTime: insertOrder.estimatedDeliveryTime || null,
      actualDeliveryTime: insertOrder.actualDeliveryTime || null,
      statusHistory: [{ status: OrderStatus.CREATED, timestamp: new Date().toISOString(), note: 'Order created' }],
      customerNotes: insertOrder.customerNotes || null,
      driverNotes: insertOrder.driverNotes || null,
      adminNotes: insertOrder.adminNotes || null,
      notifications: insertOrder.notifications || [],
      customerRating: insertOrder.customerRating || null,
      driverRating: insertOrder.driverRating || null,
      customerFeedback: insertOrder.customerFeedback || null,
      driverFeedback: insertOrder.driverFeedback || null,
      priority: insertOrder.priority || 'standard',
      isFragile: insertOrder.isFragile ?? false,
      requiresSignature: insertOrder.requiresSignature ?? false,
      insuranceValue: insertOrder.insuranceValue || null,
      itemCost: insertOrder.itemCost || null,
      refundMethod: insertOrder.refundMethod || null,
      refundStatus: insertOrder.refundStatus || null,
      refundProcessedAt: insertOrder.refundProcessedAt || null,
      refundCompletedAt: insertOrder.refundCompletedAt || null,
      refundReason: insertOrder.refundReason || null,
      returnRefused: insertOrder.returnRefused ?? false,
      returnRefusedReason: insertOrder.returnRefusedReason || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.orders.set(id, order);
    // Maintain tracking index for O(1) lookups
    if (trackingNumber) {
      this.trackingNumberIndex.set(trackingNumber, id);
    }
    return order;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, ...updates, updatedAt: new Date() };
    
    // Update status history if status changed
    if (updates.status && updates.status !== order.status) {
      updatedOrder.statusHistory = [
        ...(Array.isArray(order.statusHistory) ? order.statusHistory : []),
        { status: updates.status, timestamp: new Date().toISOString(), note: `Status updated to ${updates.status}` }
      ];
    }
    
    // Update tracking index if tracking number changed
    if (updates.trackingNumber && updates.trackingNumber !== order.trackingNumber) {
      // Remove old tracking number from index
      if (order.trackingNumber) {
        this.trackingNumberIndex.delete(order.trackingNumber);
      }
      // Add new tracking number to index
      this.trackingNumberIndex.set(updates.trackingNumber, id);
    }
    
    this.orders.set(id, updatedOrder);
    
    // Create payment record when order is completed
    if (updates.status === 'completed') {
      await this.createPaymentRecord(updatedOrder);
    }
    
    return updatedOrder;
  }

  async getOrdersByStatus(status: OrderStatusType): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.status === status);
  }

  async assignOrderToDriver(orderId: string, driverId: number): Promise<Order | undefined> {
    const order = this.orders.get(orderId);
    if (!order) return undefined;

    const updatedOrder = {
      ...order,
      driverId,
      driverAssignedAt: new Date(),
      status: OrderStatus.ASSIGNED as OrderStatusType,
      updatedAt: new Date()
    };

    this.orders.set(orderId, updatedOrder);
    return updatedOrder;
  }

  async updateDriverStatus(driverId: number, status: string): Promise<User | undefined> {
    const user = this.users.get(driverId);
    if (!user) return undefined;

    const updatedUser = {
      ...user,
      status: status as any, // We'll need to add this to the User type if needed
      updatedAt: new Date()
    };

    this.users.set(driverId, updatedUser);
    return updatedUser;
  }

  // Payment tracking methods
  async createPaymentRecord(order: Order): Promise<void> {
    const user = this.users.get(order.driverId!);
    if (!user) return;

    const paymentRecord = {
      id: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      orderId: order.id,
      transactionDate: new Date(),
      driverEarnings: {
        basePay: order.driverBasePay || 3.00,
        distancePay: order.driverDistancePay || 0,
        timePay: order.driverTimePay || 0,
        sizeBonus: order.driverSizeBonus || 0,
        tip: order.tip || 0,
        total: (order.driverBasePay || 3.00) + (order.driverDistancePay || 0) + 
               (order.driverTimePay || 0) + (order.driverSizeBonus || 0) + (order.tip || 0)
      },
      companyRevenue: {
        serviceFee: order.companyServiceFee || 0.99,
        distanceFee: order.distanceFee || 0,
        timeFee: order.timeFee || 0,
        total: (order.companyServiceFee || 0.99) + (order.distanceFee || 0) + (order.timeFee || 0)
      },
      customerPayment: {
        basePrice: order.basePrice || 3.99,
        surcharges: Array.isArray(order.surcharges) ? order.surcharges.reduce((sum, s) => sum + s.amount, 0) : 0,
        taxes: (order.totalPrice || 3.99) * 0.0899, // 8.99% Missouri St. Louis County tax rate
        total: order.totalPrice || 3.99
      },
      driverId: order.driverId!,
      driverName: `${user.firstName} ${user.lastName}`,
      paymentMethod: 'stripe',
      status: 'completed',
      taxYear: new Date().getFullYear(),
      quarter: Math.ceil((new Date().getMonth() + 1) / 3)
    };

    this.paymentRecords.set(paymentRecord.id, paymentRecord);
  }

  async getPaymentRecords(): Promise<any[]> {
    return Array.from(this.paymentRecords.values());
  }

  async getPaymentSummary(): Promise<any> {
    const records = Array.from(this.paymentRecords.values());
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyRecords = records.filter(r => {
      const recordDate = new Date(r.transactionDate);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });

    const yearlyRecords = records.filter(r => {
      const recordDate = new Date(r.transactionDate);
      return recordDate.getFullYear() === currentYear;
    });

    const totalDriverEarnings = monthlyRecords.reduce((sum, r) => sum + r.driverEarnings.total, 0);
    const totalCompanyRevenue = monthlyRecords.reduce((sum, r) => sum + r.companyRevenue.total, 0);
    const totalCustomerPayments = monthlyRecords.reduce((sum, r) => sum + r.customerPayment.total, 0);

    const quarterlyRevenue = [1, 2, 3, 4].map(quarter => {
      const quarterRecords = yearlyRecords.filter(r => r.quarter === quarter);
      return quarterRecords.reduce((sum, r) => sum + r.companyRevenue.total, 0);
    });

    const activeDrivers = new Set(yearlyRecords.map(r => r.driverId)).size;
    const driverEarningsMap = new Map();
    
    yearlyRecords.forEach(r => {
      const current = driverEarningsMap.get(r.driverId) || 0;
      driverEarningsMap.set(r.driverId, current + r.driverEarnings.total);
    });

    const driversRequiring1099 = Array.from(driverEarningsMap.values()).filter(earnings => earnings >= 600).length;

    return {
      totalDriverEarnings,
      totalCompanyRevenue,
      totalCustomerPayments,
      totalTransactions: monthlyRecords.length,
      monthlyDriverPayments: totalDriverEarnings,
      monthlyCompanyRevenue: totalCompanyRevenue,
      q1Revenue: quarterlyRevenue[0],
      q2Revenue: quarterlyRevenue[1],
      q3Revenue: quarterlyRevenue[2],
      q4Revenue: quarterlyRevenue[3],
      activeDriversCount: activeDrivers,
      totalDriverPayments: yearlyRecords.reduce((sum, r) => sum + r.driverEarnings.total, 0),
      driversRequiring1099
    };
  }

  async exportPaymentData(format: string, dateRange: string, status: string): Promise<Buffer> {
    // Mock Excel export - in production, use a library like ExcelJS
    const records = Array.from(this.paymentRecords.values());
    const csvData = this.generatePaymentCSV(records);
    return Buffer.from(csvData, 'utf8');
  }

  async generateTaxReport(year: number): Promise<Buffer> {
    const records = Array.from(this.paymentRecords.values())
      .filter(r => r.taxYear === year);
    
    const taxData = this.generateTaxCSV(records);
    return Buffer.from(taxData, 'utf8');
  }

  async generate1099Forms(year: number): Promise<Buffer> {
    const records = Array.from(this.paymentRecords.values())
      .filter(r => r.taxYear === year);
    
    const driverEarnings = new Map();
    records.forEach(r => {
      const current = driverEarnings.get(r.driverId) || { total: 0, driverName: r.driverName };
      current.total += r.driverEarnings.total;
      driverEarnings.set(r.driverId, current);
    });

    const form1099Data = this.generate1099CSV(driverEarnings, year);
    return Buffer.from(form1099Data, 'utf8');
  }

  private generatePaymentCSV(records: any[]): string {
    const headers = [
      'Payment ID', 'Order ID', 'Transaction Date', 'Driver Name',
      'Driver Base Pay', 'Driver Distance Pay', 'Driver Time Pay', 'Driver Size Bonus', 'Driver Tip', 'Driver Total',
      'Company Service Fee', 'Company Distance Fee', 'Company Time Fee', 'Company Total',
      'Customer Base Price', 'Customer Surcharges', 'Customer Taxes', 'Customer Total',
      'Payment Method', 'Status', 'Tax Year', 'Quarter'
    ];

    const rows = records.map(r => [
      r.id, r.orderId, r.transactionDate, r.driverName,
      r.driverEarnings.basePay, r.driverEarnings.distancePay, r.driverEarnings.timePay, 
      r.driverEarnings.sizeBonus, r.driverEarnings.tip, r.driverEarnings.total,
      r.companyRevenue.serviceFee, r.companyRevenue.distanceFee, r.companyRevenue.timeFee, r.companyRevenue.total,
      r.customerPayment.basePrice, r.customerPayment.surcharges, r.customerPayment.taxes, r.customerPayment.total,
      r.paymentMethod, r.status, r.taxYear, r.quarter
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private generateTaxCSV(records: any[]): string {
    const headers = ['Tax Year', 'Quarter', 'Total Revenue', 'Driver Payments', 'Net Income', 'Estimated Tax'];
    
    const quarterlyData = [1, 2, 3, 4].map(quarter => {
      const quarterRecords = records.filter(r => r.quarter === quarter);
      const totalRevenue = quarterRecords.reduce((sum, r) => sum + r.companyRevenue.total, 0);
      const driverPayments = quarterRecords.reduce((sum, r) => sum + r.driverEarnings.total, 0);
      const netIncome = totalRevenue;
      const estimatedTax = netIncome * 0.21; // 21% corporate tax rate

      return [
        records[0]?.taxYear || new Date().getFullYear(),
        `Q${quarter}`,
        totalRevenue.toFixed(2),
        driverPayments.toFixed(2),
        netIncome.toFixed(2),
        estimatedTax.toFixed(2)
      ];
    });

    return [headers, ...quarterlyData].map(row => row.join(',')).join('\n');
  }

  private generate1099CSV(driverEarnings: Map<number, any>, year: number): string {
    const headers = ['Driver ID', 'Driver Name', 'Total Earnings', 'Tax Year', 'Requires 1099'];
    
    const rows = Array.from(driverEarnings.entries()).map(([driverId, data]) => [
      driverId,
      data.driverName,
      data.total.toFixed(2),
      year,
      data.total >= 600 ? 'Yes' : 'No'
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  // Promo code operations
  async getPromoCode(code: string): Promise<PromoCode | undefined> {
    return this.promoCodes.get(code);
  }

  async createPromoCode(insertPromoCode: InsertPromoCode): Promise<PromoCode> {
    const promoCode: PromoCode = {
      id: this.nextPromoId++,
      code: insertPromoCode.code,
      description: insertPromoCode.description || null,
      discountType: insertPromoCode.discountType,
      discountValue: insertPromoCode.discountValue,
      minOrderValue: insertPromoCode.minOrderValue ?? null,
      maxUses: insertPromoCode.maxUses ?? null,
      currentUses: 0,
      isActive: insertPromoCode.isActive ?? true,
      validFrom: insertPromoCode.validFrom ?? new Date(),
      validUntil: insertPromoCode.validUntil ?? null,
      createdAt: new Date()
    };
    this.promoCodes.set(insertPromoCode.code, promoCode);
    return promoCode;
  }

  async validatePromoCode(code: string): Promise<{ valid: boolean; discount?: number; type?: string }> {
    const promo = this.promoCodes.get(code);
    if (!promo || !promo.isActive) {
      return { valid: false };
    }
    
    const now = new Date();
    if (promo.validUntil && now > promo.validUntil) {
      return { valid: false };
    }
    
    if (promo.maxUses && (promo.currentUses ?? 0) >= promo.maxUses) {
      return { valid: false };
    }
    
    return {
      valid: true,
      discount: promo.discountValue,
      type: promo.discountType
    };
  }

  async updatePromoCode(code: string, updates: Partial<PromoCode>): Promise<PromoCode | undefined> {
    const promo = this.promoCodes.get(code);
    if (!promo) return undefined;
    
    const updatedPromo = { ...promo, ...updates };
    this.promoCodes.set(code, updatedPromo);
    return updatedPromo;
  }

  // Driver earnings
  async getDriverEarnings(driverId: number): Promise<DriverEarning[]> {
    return Array.from(this.driverEarnings.values()).filter(earning => earning.driverId === driverId);
  }

  async createDriverEarning(insertEarning: InsertDriverEarning): Promise<DriverEarning> {
    const earning: DriverEarning = {
      id: this.nextEarningId++,
      driverId: insertEarning.driverId,
      orderId: insertEarning.orderId,
      baseEarning: insertEarning.baseEarning,
      tipEarning: insertEarning.tipEarning ?? null,
      bonusEarning: insertEarning.bonusEarning ?? null,
      totalEarning: insertEarning.totalEarning,
      status: insertEarning.status ?? 'pending',
      paidAt: insertEarning.paidAt ?? null,
      createdAt: new Date()
    };
    this.driverEarnings.set(earning.id, earning);
    return earning;
  }

  // Notifications
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(notif => notif.userId === userId);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const notification: Notification = {
      id: this.nextNotificationId++,
      userId: insertNotification.userId,
      orderId: insertNotification.orderId || null,
      type: insertNotification.type,
      title: insertNotification.title,
      message: insertNotification.message,
      data: insertNotification.data ?? {},
      isRead: insertNotification.isRead ?? false,
      channel: insertNotification.channel ?? 'app',
      createdAt: new Date()
    };
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(notif => notif.userId === userId);
  }

  async markNotificationRead(id: number): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = true;
      this.notifications.set(id, notification);
    }
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = true;
      this.notifications.set(id, notification);
      return true;
    }
    return false;
  }

  // Analytics
  async recordAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const analytics: Analytics = {
      id: this.nextAnalyticsId++,
      metric: insertAnalytics.metric,
      value: insertAnalytics.value,
      dimensions: insertAnalytics.dimensions ?? {},
      timestamp: insertAnalytics.timestamp || new Date()
    };
    this.analytics.set(`${analytics.metric}-${analytics.id}`, analytics);
    return analytics;
  }

  async getAnalytics(metric: string, from?: Date, to?: Date): Promise<Analytics[]> {
    let results = Array.from(this.analytics.values()).filter(a => a.metric === metric);
    
    if (from) {
      results = results.filter(a => a.timestamp >= from);
    }
    if (to) {
      results = results.filter(a => a.timestamp <= to);
    }
    
    return results.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  // Additional required methods

  async getAllDrivers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.isDriver);
  }

  async getOrdersByDriver(driverId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.driverId === driverId);
  }


  // Driver payouts and Stripe Connect methods
  async createDriverPayout(insertPayout: InsertDriverPayout): Promise<DriverPayout> {
    const payout: DriverPayout = {
      id: this.nextPayoutId++,
      driverId: insertPayout.driverId,
      payoutType: insertPayout.payoutType,
      totalAmount: insertPayout.totalAmount,
      feeAmount: insertPayout.feeAmount || 0,
      netAmount: insertPayout.netAmount,
      stripeTransferId: insertPayout.stripeTransferId || null,
      status: insertPayout.status || "pending",
      orderIds: insertPayout.orderIds || [],
      taxYear: insertPayout.taxYear,
      form1099Generated: insertPayout.form1099Generated || false,
      form1099Url: insertPayout.form1099Url || null,
      createdAt: new Date(),
      completedAt: insertPayout.completedAt || null
    };
    this.driverPayouts.set(payout.id, payout);
    return payout;
  }

  async getDriverPayouts(driverId: number): Promise<DriverPayout[]> {
    return Array.from(this.driverPayouts.values()).filter(payout => payout.driverId === driverId);
  }

  async updateDriverPayout(id: number, updates: Partial<DriverPayout>): Promise<DriverPayout | undefined> {
    const payout = this.driverPayouts.get(id);
    if (!payout) return undefined;
    
    const updatedPayout = { ...payout, ...updates };
    this.driverPayouts.set(id, updatedPayout);
    return updatedPayout;
  }

  // Driver incentives and bonuses methods
  async createDriverIncentive(insertIncentive: InsertDriverIncentive): Promise<DriverIncentive> {
    const incentive: DriverIncentive = {
      id: this.nextIncentiveId++,
      driverId: insertIncentive.driverId,
      orderId: insertIncentive.orderId || null,
      incentiveType: insertIncentive.incentiveType,
      description: insertIncentive.description,
      amount: insertIncentive.amount,
      isActive: insertIncentive.isActive !== false,
      qualificationCriteria: insertIncentive.qualificationCriteria || {},
      packageSize: insertIncentive.packageSize || null,
      multiStopCount: insertIncentive.multiStopCount || null,
      peakSeasonMultiplier: insertIncentive.peakSeasonMultiplier || null,
      createdAt: new Date(),
      earnedAt: insertIncentive.earnedAt || null
    };
    this.driverIncentives.set(incentive.id, incentive);
    return incentive;
  }

  async getDriverIncentives(driverId: number): Promise<DriverIncentive[]> {
    return Array.from(this.driverIncentives.values()).filter(incentive => incentive.driverId === driverId);
  }

  async calculateOrderBonuses(order: Order, driver: User): Promise<number> {
    let totalBonus = 0;

    // Size-based bonus for Large packages
    if (order.itemSize === 'L' || order.itemSize === 'XL') {
      totalBonus += 5.00; // $5 bonus for large packages
    }

    // Peak season bonus (November-January)
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 10 || currentMonth <= 0) { // Nov, Dec, Jan
      totalBonus += 2.00; // $2 peak season bonus
    }

    // Multi-stop bonus calculation would need order context
    // For now, assuming single pickup per order

    return totalBonus;
  }

  // Business information methods
  async getBusinessInfo(): Promise<BusinessInfo | undefined> {
    if (!this.businessInfo) {
      // Initialize with default business info
      this.businessInfo = {
        id: 1,
        companyName: "ReturnIt",
        tagline: "Making Returns Effortless",
        description: "At ReturnIt, we believe returning an item should be as easy as ordering it. We're the first on-demand service dedicated to picking up unwanted purchases from your doorstep and returning them to the store for you. No more long lines, no more printing labels, and no more hassle — just a simple, stress-free way to handle returns.",
        headquarters: "St. Louis, MO",
        supportEmail: "support@returnit.com",
        supportPhone: "(636) 254-4821",
        businessHours: "Mon–Sat, 8 AM – 8 PM CST",
        instagramHandle: "@ReturnIt",
        facebookUrl: "facebook.com/ReturnIt",
        twitterHandle: "@ReturnIt",
        missionStatement: "Founded with the mission to save you time and effort, ReturnIt partners with local drivers to ensure every return is handled quickly, safely, and securely. Whether it's a small package or a bulky box, we've got you covered.",
        foundingStory: "Founded in 2024 in St. Louis, Missouri, ReturnIt was created to solve the growing frustration with online returns. Our founders experienced firsthand the time-consuming process of returning items and envisioned a better way.",
        updatedAt: new Date()
      };
    }
    return this.businessInfo;
  }

  async updateBusinessInfo(info: InsertBusinessInfo): Promise<BusinessInfo> {
    const currentInfo = await this.getBusinessInfo();
    
    this.businessInfo = {
      id: currentInfo?.id || 1,
      companyName: info.companyName || currentInfo?.companyName || "ReturnIt",
      tagline: info.tagline || currentInfo?.tagline || "Making Returns Effortless",
      description: info.description || currentInfo?.description || "",
      headquarters: info.headquarters || currentInfo?.headquarters || "St. Louis, MO",
      supportEmail: info.supportEmail || currentInfo?.supportEmail || "support@returnit.com",
      supportPhone: info.supportPhone || currentInfo?.supportPhone || "(555) 123-4567",
      businessHours: info.businessHours || currentInfo?.businessHours || "Mon–Sat, 8 AM – 8 PM CST",
      instagramHandle: info.instagramHandle || currentInfo?.instagramHandle || "@ReturnItApp",
      facebookUrl: info.facebookUrl || currentInfo?.facebookUrl || "facebook.com/ReturnIt",
      twitterHandle: info.twitterHandle || currentInfo?.twitterHandle || "@ReturnIt",
      missionStatement: info.missionStatement || currentInfo?.missionStatement || "",
      foundingStory: info.foundingStory || currentInfo?.foundingStory || "",
      updatedAt: new Date()
    };
    
    return this.businessInfo;
  }
  // Driver Application methods
  async createDriverApplication(application: InsertDriverApplication): Promise<DriverApplication> {
    const id = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newApplication: DriverApplication = {
      id,
      ...application,
      status: application.status || 'pending',
      gender: application.gender || null,
      isVeteran: application.isVeteran ?? null,
      hasDisability: application.hasDisability ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.driverApplications.set(id, newApplication);
    return newApplication;
  }

  async getDriverApplication(id: string): Promise<DriverApplication | undefined> {
    return this.driverApplications.get(id);
  }

  async getUserDriverApplication(userId: number): Promise<DriverApplication | undefined> {
    return Array.from(this.driverApplications.values()).find(app => app.userId === userId);
  }

  async updateDriverApplication(id: string, updates: Partial<DriverApplication>): Promise<DriverApplication | undefined> {
    const existing = this.driverApplications.get(id);
    if (!existing) return undefined;
    
    const updated = { 
      ...existing, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.driverApplications.set(id, updated);
    return updated;
  }

  async getAllDriverApplications(): Promise<DriverApplication[]> {
    return Array.from(this.driverApplications.values());
  }

  // Tracking operations
  async getOrderByTrackingNumber(trackingNumber: string): Promise<Order | undefined> {
    // Use O(1) index lookup for performance
    const orderId = this.trackingNumberIndex.get(trackingNumber);
    if (!orderId) return undefined;
    
    const order = this.orders.get(orderId);
    if (!order) return undefined;
    
    // Enforce tracking permissions
    if (!order.trackingEnabled) return undefined;
    if (order.trackingExpiresAt && order.trackingExpiresAt < new Date()) return undefined;
    
    return order;
  }

  async updateDriverLocation(driverId: number, location: Location): Promise<User | undefined> {
    const user = this.users.get(driverId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, currentLocation: location, updatedAt: new Date() };
    this.users.set(driverId, updatedUser);
    return updatedUser;
  }

  async getDriverLocation(driverId: number): Promise<Location | undefined> {
    const user = this.users.get(driverId);
    return user ? user.currentLocation as Location : undefined;
  }

  async getOrderCurrentLocation(orderId: string): Promise<Location | undefined> {
    const order = this.orders.get(orderId);
    if (!order || !order.driverId) return undefined;
    
    return this.getDriverLocation(order.driverId);
  }

  async getOrderLocationByTracking(trackingNumber: string): Promise<Location | undefined> {
    const order = await this.getOrderByTrackingNumber(trackingNumber);
    if (!order) return undefined;
    
    return this.getOrderCurrentLocation(order.id);
  }

  async createTrackingEvent(trackingEventData: InsertTrackingEvent): Promise<TrackingEvent> {
    const id = this.nextTrackingEventId++;
    const trackingEvent: TrackingEvent = {
      id,
      orderId: trackingEventData.orderId,
      eventType: trackingEventData.eventType,
      description: trackingEventData.description,
      location: trackingEventData.location || null,
      driverId: trackingEventData.driverId || null,
      metadata: trackingEventData.metadata || {},
      timestamp: new Date()
    };
    this.trackingEvents.set(id, trackingEvent);
    return trackingEvent;
  }

  async getOrderTrackingEvents(orderId: string): Promise<TrackingEvent[]> {
    return Array.from(this.trackingEvents.values())
      .filter(event => event.orderId === orderId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async getTrackingEvent(id: number): Promise<TrackingEvent | undefined> {
    return this.trackingEvents.get(id);
  }
}

// DatabaseStorage implementation
import { db } from "./db";
import { eq, and, sql, desc, asc } from "drizzle-orm";
import { users, orders, promoCodes } from "@shared/schema";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Order operations
  async createOrder(orderData: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(orderData)
      .returning();
    return order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set(updates)
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async deleteOrder(id: string): Promise<boolean> {
    const result = await db.delete(orders).where(eq(orders.id, id));
    return result.rowCount > 0;
  }

  async getAllOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getDriverOrders(driverId: number): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.driverId, driverId)).orderBy(desc(orders.createdAt));
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.status, status)).orderBy(desc(orders.createdAt));
  }

  // Implement other IStorage methods as needed...
  async createPromoCode(promoData: InsertPromoCode): Promise<PromoCode> {
    const [promo] = await db.insert(promoCodes).values(promoData).returning();
    return promo;
  }

  async getPromoCode(code: string): Promise<PromoCode | undefined> {
    const [promo] = await db.select().from(promoCodes).where(eq(promoCodes.code, code));
    return promo;
  }

  async updatePromoCode(code: string, updates: Partial<PromoCode>): Promise<PromoCode | undefined> {
    const [promo] = await db.update(promoCodes).set(updates).where(eq(promoCodes.code, code)).returning();
    return promo;
  }

  async deletePromoCode(code: string): Promise<boolean> {
    const result = await db.delete(promoCodes).where(eq(promoCodes.code, code));
    return result.rowCount > 0;
  }

  async getAllPromoCodes(): Promise<PromoCode[]> {
    return db.select().from(promoCodes);
  }

  // Driver and Customer operations for DatabaseStorage
  async getDrivers(isOnline?: boolean): Promise<User[]> {
    const drivers = await db.select().from(users).where(eq(users.isDriver, true));
    if (isOnline !== undefined) {
      return drivers.filter(driver => driver.isOnline === isOnline);
    }
    return drivers;
  }

  async getCustomers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, 'customer'));
  }

  async getEmployees(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Add stubs for other methods to satisfy interface
  async getDriverEarnings(driverId: number): Promise<DriverEarning[]> { return []; }
  async createDriverEarning(earning: InsertDriverEarning): Promise<DriverEarning> { 
    return {} as DriverEarning; 
  }
  async getNotifications(userId: number): Promise<Notification[]> { return []; }
  async createNotification(notification: InsertNotification): Promise<Notification> {
    return {} as Notification;
  }
  async markNotificationAsRead(id: number): Promise<boolean> { return true; }
  async deleteNotification(id: number): Promise<boolean> { return true; }
  async createAnalytics(analytics: InsertAnalytics): Promise<Analytics> {
    return {} as Analytics;
  }
  async getAnalytics(metric: string, from?: Date, to?: Date): Promise<Analytics[]> { return []; }
  async updateAnalytics(id: number, updates: Partial<Analytics>): Promise<Analytics | undefined> {
    return {} as Analytics;
  }
  async deleteAnalytics(id: number): Promise<boolean> { return true; }
  async createDriverPayout(payout: InsertDriverPayout): Promise<DriverPayout> {
    return {} as DriverPayout;
  }
  async getDriverPayouts(driverId: number): Promise<DriverPayout[]> { return []; }
  async getAllDriverPayouts(): Promise<DriverPayout[]> { return []; }
  async updateDriverPayout(id: number, updates: Partial<DriverPayout>): Promise<DriverPayout | undefined> {
    return {} as DriverPayout;
  }
  async createDriverIncentive(incentive: InsertDriverIncentive): Promise<DriverIncentive> {
    return {} as DriverIncentive;
  }
  async getDriverIncentives(driverId: number): Promise<DriverIncentive[]> { return []; }
  async calculateOrderBonuses(order: Order, driver: User): Promise<number> { return 0; }
  async getBusinessInfo(): Promise<BusinessInfo | undefined> { return undefined; }
  async updateBusinessInfo(info: InsertBusinessInfo): Promise<BusinessInfo> {
    return {} as BusinessInfo;
  }
  async createDriverApplication(application: InsertDriverApplication): Promise<DriverApplication> {
    return {} as DriverApplication;
  }
  async getDriverApplication(id: string): Promise<DriverApplication | undefined> { return undefined; }
  async getUserDriverApplication(userId: number): Promise<DriverApplication | undefined> { return undefined; }
  async updateDriverApplication(id: string, updates: Partial<DriverApplication>): Promise<DriverApplication | undefined> {
    return undefined;
  }
  async getAllDriverApplications(): Promise<DriverApplication[]> { return []; }
}

// Switch to DatabaseStorage - temporarily using MemStorage for testing
export const storage = new MemStorage();

// Production storage initialized
