import { 
  type User, type InsertUser, type Order, type InsertOrder,
  type PromoCode, type InsertPromoCode, type DriverEarning, type InsertDriverEarning,
  type Notification, type InsertNotification, type Analytics, type InsertAnalytics,
  type DriverPayout, type InsertDriverPayout, type DriverIncentive, type InsertDriverIncentive,
  type BusinessInfo, type InsertBusinessInfo,
  OrderStatus
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getDrivers(isOnline?: boolean): Promise<User[]>;
  
  // Order operations
  getOrder(id: string): Promise<Order | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  getDriverOrders(driverId: number): Promise<Order[]>;
  getAvailableOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined>;
  
  // Promo code operations
  getPromoCode(code: string): Promise<PromoCode | undefined>;
  createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode>;
  validatePromoCode(code: string): Promise<{ valid: boolean; discount?: number; type?: string }>;
  
  // Driver earnings
  getDriverEarnings(driverId: number): Promise<DriverEarning[]>;
  createDriverEarning(earning: InsertDriverEarning): Promise<DriverEarning>;
  
  // Notifications
  getUserNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<void>;
  
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
  private nextUserId: number = 1;
  private nextNotificationId: number = 1;
  private nextEarningId: number = 1;
  private nextPromoId: number = 1;
  private nextAnalyticsId: number = 1;
  private nextPayoutId: number = 1;
  private nextIncentiveId: number = 1;

  constructor() {
    this.users = new Map();
    this.orders = new Map();
    this.promoCodes = new Map();
    this.driverEarnings = new Map();
    this.notifications = new Map();
    this.analytics = new Map();
    this.driverPayouts = new Map();
    this.driverIncentives = new Map();
    
    // Master Administrator account
    const masterAdmin: User = {
      id: 1,
      email: 'nabeelmumtaz92@gmail.com',
      password: '$2b$12$Fa9lpRHHCkE0bK.HJZiU/uQ1ahOuSvQYS.sH6dSQVsQSqT7V.nLkC', // hashed 'admin123'
      firstName: 'Nabeel',
      lastName: 'Mumtaz',
      phone: '+1-555-0123',
      isDriver: true,  // Driver access for testing
      isAdmin: true,   // Admin access
      isActive: true,
      profileImage: null,
      preferences: { role: 'master_admin' },
      addresses: [
        {
          type: 'home',
          street: '1234 Main St',
          city: 'St. Louis',
          state: 'MO',
          zipCode: '63101',
          isDefault: true
        }
      ],
      paymentMethods: [],
      driverLicense: 'DL98765432',
      vehicleInfo: {
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        color: 'Silver',
        licensePlate: 'RET-001',
        capacity: 'Large'
      },
      bankInfo: {
        routingNumber: '123456789',
        accountNumber: '*****1234',
        accountType: 'checking'
      },
      driverRating: 4.9,
      totalEarnings: 2847.50,
      completedDeliveries: 156,
      isOnline: true,
      currentLocation: {
        latitude: 38.6270,
        longitude: -90.1994,
        address: 'Downtown St. Louis, MO'
      },
      stripeConnectAccountId: 'acct_master123',
      stripeOnboardingComplete: true,
      paymentPreference: 'instant',
      instantPayFeePreference: 0.50,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(1, masterAdmin);
    
    // Demo user with limited access
    const demoUser: User = {
      id: 2,
      email: 'demo@returnly.com',
      password: '$2b$12$t/xI0Ofb0d/mGpHkZqGGvOISgiEr5o9mdki3uXo2gpMpK2NiTGgK6', // hashed 'demo123'
      firstName: 'Demo',
      lastName: 'User',
      phone: '+1-555-0124',
      isDriver: false,  // No driver access
      isAdmin: false,   // No admin access
      isActive: true,
      profileImage: null,
      preferences: { role: 'super_admin' },
      addresses: [
        {
          type: 'home',
          street: '1234 Main St',
          city: 'St. Louis',
          state: 'MO',
          zipCode: '63101',
          isDefault: true
        }
      ],
      paymentMethods: [],
      driverLicense: 'DL123456789',
      vehicleInfo: {
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        color: 'Silver',
        licensePlate: 'RET-001',
        capacity: 'Large'
      },
      bankInfo: {
        routingNumber: '123456789',
        accountNumber: '*****1234',
        accountType: 'checking'
      },
      driverRating: 4.9,
      totalEarnings: 2847.50,
      completedDeliveries: 156,
      isOnline: true,
      currentLocation: {
        latitude: 38.6270,
        longitude: -90.1994,
        address: 'Downtown St. Louis, MO'
      },
      stripeConnectAccountId: 'acct_demo123',
      stripeOnboardingComplete: true,
      paymentPreference: 'instant',
      instantPayFeePreference: 0.50,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(2, demoUser);
    
    // Demo driver
    const demoDriver: User = {
      id: 3,
      email: 'driver@returnly.com',
      password: '$2b$12$HgHCeh4iUcf7w4z/u/77F.L6hV.Je0QhgaSkA1cjhhXrWV/JJgsoa', // hashed 'driver123'
      firstName: 'Demo',
      lastName: 'Driver',
      phone: '+1-555-0124',
      isDriver: true,
      isAdmin: false,
      isActive: true,
      profileImage: null,
      preferences: {},
      addresses: [],
      paymentMethods: [],
      driverLicense: 'DL12345678',
      vehicleInfo: { make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'ABC123' },
      bankInfo: { accountNumber: '****1234', routingNumber: '021000021' },
      driverRating: 4.8,
      totalEarnings: 2450.50,
      completedDeliveries: 127,
      isOnline: true,
      currentLocation: { lat: 37.7749, lng: -122.4194 },
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    };
    this.users.set(3, demoDriver);
    
    const demoOrder: Order = {
      id: 'DEMO01',
      userId: 2,
      status: OrderStatus.PICKED_UP,
      trackingNumber: 'RTN001',
      pickupAddress: '500 Market St, Apt 2C, San Francisco, CA 94105',
      pickupCoordinates: { lat: 37.7879, lng: -122.3961 },
      pickupInstructions: 'Ring doorbell, building entrance on Market St',
      pickupWindow: { start: '2024-01-15T10:00:00Z', end: '2024-01-15T14:00:00Z' },
      scheduledPickupTime: new Date('2024-01-15T12:00:00Z'),
      actualPickupTime: new Date('2024-01-15T12:15:00Z'),
      retailer: 'Target',
      returnAddress: '1955 Mission St, San Francisco, CA 94103',
      returnCoordinates: { lat: 37.7693, lng: -122.4178 },
      itemDescription: 'Nike Air Max 270 - Size 10 - Black/White',
      itemCategory: 'Footwear',
      itemPhotos: ['/api/uploads/demo-shoes-1.jpg'],
      returnReason: 'Wrong size ordered',
      originalOrderNumber: 'TARGET123456789',
      basePrice: 3.99,
      surcharges: [],
      discountCode: 'RETURN50',
      discountAmount: 1.99,
      totalPrice: 2.00,
      tip: 2.50,
      driverId: 2,
      driverAssignedAt: new Date('2024-01-15T11:30:00Z'),
      estimatedDeliveryTime: new Date('2024-01-15T15:00:00Z'),
      actualDeliveryTime: null,
      statusHistory: [
        { status: 'created', timestamp: '2024-01-15T09:00:00Z', note: 'Order created' },
        { status: 'confirmed', timestamp: '2024-01-15T09:05:00Z', note: 'Payment confirmed' },
        { status: 'assigned', timestamp: '2024-01-15T11:30:00Z', note: 'Driver assigned' },
        { status: 'picked_up', timestamp: '2024-01-15T12:15:00Z', note: 'Package picked up' }
      ],
      customerNotes: 'Please handle with care - shoes are in original box',
      driverNotes: 'Customer was ready, easy pickup',
      adminNotes: null,
      notifications: [],
      customerRating: null,
      driverRating: null,
      customerFeedback: null,
      driverFeedback: null,
      priority: 'standard',
      isFragile: false,
      requiresSignature: false,
      insuranceValue: null,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
    };
    this.orders.set('DEMO01', demoOrder);
    
    // Demo promo codes
    const promoCodes = [
      { code: 'RETURN50', description: '50% off your first return', discountType: 'percentage', discountValue: 50, minOrderValue: 0 },
      { code: 'BUNDLE25', description: '$2.50 off multiple items', discountType: 'fixed', discountValue: 2.50, minOrderValue: 5.00 },
      { code: 'STUDENT15', description: '15% student discount', discountType: 'percentage', discountValue: 15, minOrderValue: 0 },
      { code: 'FREESHIP', description: 'Free delivery', discountType: 'free_delivery', discountValue: 3.99, minOrderValue: 0 }
    ];
    
    promoCodes.forEach(promo => {
      const promoCode: PromoCode = {
        id: this.nextPromoId++,
        ...promo,
        maxUses: promo.code === 'RETURN50' ? 1000 : 500,
        currentUses: Math.floor(Math.random() * 100),
        isActive: true,
        validFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      };
      this.promoCodes.set(promo.code, promoCode);
    });
    
    this.nextUserId = 3;
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
      isDriver: insertUser.isDriver ?? false,
      isAdmin: insertUser.isAdmin ?? false,
      isActive: insertUser.isActive ?? true,
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
    const trackingNumber = `RTN${Date.now().toString().slice(-6)}`;
    
    const order: Order = {
      id,
      trackingNumber,
      userId: insertOrder.userId,
      status: OrderStatus.CREATED,
      pickupAddress: insertOrder.pickupAddress,
      pickupCoordinates: insertOrder.pickupCoordinates || null,
      pickupInstructions: insertOrder.pickupInstructions || null,
      pickupWindow: insertOrder.pickupWindow || null,
      scheduledPickupTime: insertOrder.scheduledPickupTime || null,
      actualPickupTime: insertOrder.actualPickupTime || null,
      retailer: insertOrder.retailer,
      returnAddress: insertOrder.returnAddress || null,
      returnCoordinates: insertOrder.returnCoordinates || null,
      itemDescription: insertOrder.itemDescription,
      itemCategory: insertOrder.itemCategory || null,
      itemPhotos: insertOrder.itemPhotos || [],
      returnReason: insertOrder.returnReason || null,
      originalOrderNumber: insertOrder.originalOrderNumber || null,
      basePrice: insertOrder.basePrice ?? 3.99,
      surcharges: insertOrder.surcharges || [],
      discountCode: insertOrder.discountCode || null,
      discountAmount: insertOrder.discountAmount ?? 0,
      totalPrice: insertOrder.totalPrice ?? 3.99,
      tip: insertOrder.tip ?? 0,
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
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, ...updates, updatedAt: new Date() };
    
    // Update status history if status changed
    if (updates.status && updates.status !== order.status) {
      updatedOrder.statusHistory = [
        ...(order.statusHistory || []),
        { status: updates.status, timestamp: new Date().toISOString(), note: `Status updated to ${updates.status}` }
      ];
    }
    
    this.orders.set(id, updatedOrder);
    return updatedOrder;
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

  async markNotificationRead(id: number): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = true;
      this.notifications.set(id, notification);
    }
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
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getAllDrivers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.isDriver);
  }

  async getOrdersByDriver(driverId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.driverId === driverId);
  }

  async getDriverOrders(driverId: string): Promise<Order[]> {
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
    if (order.packageSize === 'large') {
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
        companyName: "Returnly",
        tagline: "Making Returns Effortless",
        description: "At Returnly, we believe returning an item should be as easy as ordering it. We're the first on-demand service dedicated to picking up unwanted purchases from your doorstep and returning them to the store for you. No more long lines, no more printing labels, and no more hassle — just a simple, stress-free way to handle returns.",
        headquarters: "St. Louis, MO",
        supportEmail: "support@returnly.com",
        supportPhone: "(636) 254-4821",
        businessHours: "Mon–Sat, 8 AM – 8 PM CST",
        instagramHandle: "@Returnly",
        facebookUrl: "facebook.com/Returnly",
        twitterHandle: "@Returnly",
        missionStatement: "Founded with the mission to save you time and effort, Returnly partners with local drivers to ensure every return is handled quickly, safely, and securely. Whether it's a small package or a bulky box, we've got you covered.",
        foundingStory: "Founded in 2024 in St. Louis, Missouri, Returnly was created to solve the growing frustration with online returns. Our founders experienced firsthand the time-consuming process of returning items and envisioned a better way.",
        updatedAt: new Date()
      };
    }
    return this.businessInfo;
  }

  async updateBusinessInfo(info: InsertBusinessInfo): Promise<BusinessInfo> {
    const currentInfo = await this.getBusinessInfo();
    
    this.businessInfo = {
      id: currentInfo?.id || 1,
      companyName: info.companyName || currentInfo?.companyName || "Returnly",
      tagline: info.tagline || currentInfo?.tagline || "Making Returns Effortless",
      description: info.description || currentInfo?.description || "",
      headquarters: info.headquarters || currentInfo?.headquarters || "St. Louis, MO",
      supportEmail: info.supportEmail || currentInfo?.supportEmail || "support@returnly.com",
      supportPhone: info.supportPhone || currentInfo?.supportPhone || "(555) 123-4567",
      businessHours: info.businessHours || currentInfo?.businessHours || "Mon–Sat, 8 AM – 8 PM CST",
      instagramHandle: info.instagramHandle || currentInfo?.instagramHandle || "@ReturnlyApp",
      facebookUrl: info.facebookUrl || currentInfo?.facebookUrl || "facebook.com/Returnly",
      twitterHandle: info.twitterHandle || currentInfo?.twitterHandle || "@Returnly",
      missionStatement: info.missionStatement || currentInfo?.missionStatement || "",
      foundingStory: info.foundingStory || currentInfo?.foundingStory || "",
      updatedAt: new Date()
    };
    
    return this.businessInfo;
  }
}

export const storage = new MemStorage();

// Initialize demo data
(async () => {
  // Create demo users
  await storage.createUser({
    username: "demo",
    email: "demo@returnly.com",
    password: "demo123",
    firstName: "Demo",
    lastName: "User"
  });

  await storage.createUser({
    username: "driver1",
    email: "driver@returnly.com", 
    password: "driver123",
    firstName: "John",
    lastName: "Driver",
    isDriver: true
  });

  await storage.createUser({
    username: "admin",
    email: "admin@returnly.com",
    password: "admin123", 
    firstName: "Admin",
    lastName: "User",
    isAdmin: true
  });

  // Create demo orders
  const demoOrder1 = await storage.createOrder({
    userId: "1",
    pickupAddress: "123 Main St, San Francisco, CA 94105",
    retailer: "Target",
    itemDescription: "Smart TV - Wrong size ordered",
    returnReason: "size_issue",
    basePrice: 3.99,
    tip: 2.00,
    totalPrice: 5.99,
    priority: "standard"
  });

  const demoOrder2 = await storage.createOrder({
    userId: "1", 
    pickupAddress: "456 Oak Ave, San Francisco, CA 94102",
    retailer: "Best Buy",
    itemDescription: "Laptop - Defective screen",
    returnReason: "defective",
    basePrice: 3.99,
    tip: 5.00,
    totalPrice: 8.99,
    priority: "urgent",
    isFragile: true
  });

  // Create demo promo codes
  await storage.createPromoCode({
    code: "RETURN50",
    description: "50% off your first return",
    discountType: "percentage",
    discountValue: 50,
    maxUses: 100
  });

  await storage.createPromoCode({
    code: "BUNDLE25", 
    description: "$2.50 off orders over $5",
    discountType: "fixed",
    discountValue: 2.50,
    minOrderValue: 5.00,
    maxUses: 50
  });

  await storage.createPromoCode({
    code: "FREESHIP",
    description: "Free delivery on any order",
    discountType: "free_delivery",
    discountValue: 3.99,
    maxUses: 25
  });

  console.log("Demo data initialized successfully");
})();
