import { create } from 'zustand';

interface User {
  id: number;
  name: string;
  email: string;
  isDriver: boolean;
  isAdmin?: boolean;
}

interface Order {
  id: string;
  status: string;
  createdAt: Date | string;
  customerName: string;
  pickupAddress: string;
  retailer: string;
  notes?: string;
  price: number;
  totalPrice?: number;
  customerId?: number;
  driverId?: number;
  companyInfo?: any;
}

interface AppState {
  user: User | null;
  orders: Record<string, Order>;
  isLoading: boolean;
  error: string | null;
  createOrder: (order: any) => Promise<string>;
  updateOrder: (id: string, patch: Partial<Order>) => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchOrder: (id: string) => Promise<Order | null>;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  signOut: () => void;
}

// API helper function
const apiRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }
  
  return response.json();
};

export const useApp = create<AppState>((set, get) => ({
  user: null,
  orders: {},
  isLoading: false,
  error: null,
  
  createOrder: async (orderData) => {
    set({ isLoading: true, error: null });
    try {
      const order = await apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
      
      // Add to local state
      set((state) => ({
        orders: { ...state.orders, [order.id]: order },
        isLoading: false
      }));
      
      return order.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  updateOrder: async (id, patch) => {
    set({ isLoading: true, error: null });
    try {
      const updatedOrder = await apiRequest(`/api/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      
      set((state) => ({
        orders: {
          ...state.orders,
          [id]: { ...state.orders[id], ...updatedOrder }
        },
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update order';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = get().user;
      let orders;
      
      if (user?.isDriver) {
        orders = await apiRequest('/api/driver/orders');
      } else {
        orders = await apiRequest('/api/customers/orders');
      }
      
      // Convert array to record for easier access
      const ordersRecord = orders.reduce((acc: Record<string, Order>, order: Order) => {
        acc[order.id] = order;
        return acc;
      }, {});
      
      set({ orders: ordersRecord, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  fetchOrder: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const order = await apiRequest(`/api/orders/${id}`);
      
      set((state) => ({
        orders: { ...state.orders, [id]: order },
        isLoading: false
      }));
      
      return order;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch order';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },
  
  setUser: (user) => {
    set({ user });
  },
  
  setError: (error) => {
    set({ error });
  },
  
  signOut: async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
      set({ user: null, orders: {}, error: null });
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state even if logout fails
      set({ user: null, orders: {}, error: null });
    }
  },
}));
