import { type User, type InsertUser, type Order, type InsertOrder } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getOrder(id: string): Promise<Order | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private orders: Map<string, Order>;
  private nextUserId: number = 1;

  constructor() {
    this.users = new Map();
    this.orders = new Map();
    
    // Initialize with demo user and order
    const demoUser: User = {
      id: 1,
      username: 'demo',
      email: 'demo@returnly.com',
      password: 'demo123', // In production, this would be hashed
      isDriver: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(1, demoUser);
    
    const demoOrder: Order = {
      id: 'DEMO01',
      userId: 1,
      status: 'created',
      pickupAddress: '500 Market St, Apt 2C',
      retailer: 'Target',
      itemDescription: 'Nike Shoes - Wrong Size',
      price: '$3.99',
      driverId: null,
      createdAt: new Date(Date.now() - 20 * 60 * 1000),
      updatedAt: new Date(Date.now() - 20 * 60 * 1000)
    };
    this.orders.set('DEMO01', demoOrder);
    this.nextUserId = 2;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      isDriver: insertUser.isDriver ?? false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = Math.random().toString(36).slice(2, 8).toUpperCase();
    const order: Order = {
      ...insertOrder,
      id,
      status: 'created',
      price: insertOrder.price ?? '$3.99',
      driverId: insertOrder.driverId ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, ...updates };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
}

export const storage = new MemStorage();
