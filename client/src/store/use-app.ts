import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  isDriver: boolean;
}

interface Order {
  id: string;
  status: string;
  createdAt: Date | number;
  customerName: string;
  pickupAddress: string;
  retailer: string;
  notes?: string;
  price: number;
}

interface AppState {
  user: User | null;
  orders: Record<string, Order>;
  createOrder: (order: Omit<Order, 'id' | 'status' | 'createdAt'>) => string;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  signIn: (name: string, asDriver: boolean) => void;
  signOut: () => void;
}

export const useApp = create<AppState>((set, get) => ({
  user: null,
  orders: {
    DEMO01: {
      id: 'DEMO01',
      status: 'created',
      createdAt: Date.now() - 20 * 60 * 1000,
      customerName: 'Jordan',
      pickupAddress: '500 Market St, Apt 2C',
      retailer: 'Target',
      notes: 'QR code in email',
      price: 15
    },
  },
  createOrder: (orderData) => {
    const id = Math.random().toString(36).slice(2, 8).toUpperCase();
    const order: Order = { 
      id, 
      status: 'created', 
      createdAt: Date.now(), 
      ...orderData 
    };
    set((state) => ({ 
      orders: { ...state.orders, [id]: order } 
    }));
    return id;
  },
  updateOrder: (id, patch) => {
    set((state) => ({
      orders: {
        ...state.orders,
        [id]: { ...state.orders[id], ...patch }
      }
    }));
  },
  signIn: (name, asDriver) => {
    set({ 
      user: { 
        id: 'u_' + Date.now(), 
        name, 
        isDriver: asDriver 
      } 
    });
  },
  signOut: () => set({ user: null }),
}));
