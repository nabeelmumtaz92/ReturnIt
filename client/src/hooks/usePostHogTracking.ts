import { useEffect } from 'react';
import { trackEvent, identifyUser } from '@/lib/posthog';
import { useAuth } from '@/hooks/useAuth-simple';

// Hook to automatically track user and key events
export function usePostHogTracking() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Identify user in PostHog
      identifyUser(user.id.toString(), {
        email: user.email,
        name: user.fullName,
        isDriver: user.isDriver,
        isAdmin: user.isAdmin,
        role: user.isAdmin ? 'admin' : user.isDriver ? 'driver' : 'customer',
      });
    }
  }, [isAuthenticated, user]);

  return { trackEvent };
}

// Predefined tracking events for common actions
export const Events = {
  // Order events
  ORDER_CREATED: 'order_created',
  ORDER_COMPLETED: 'order_completed',
  ORDER_CANCELLED: 'order_cancelled',
  ORDER_VIEWED: 'order_viewed',
  
  // Driver events
  DRIVER_ACCEPTED_ORDER: 'driver_accepted_order',
  DRIVER_PICKED_UP: 'driver_picked_up',
  DRIVER_DROPPED_OFF: 'driver_dropped_off',
  DRIVER_EARNINGS_VIEWED: 'driver_earnings_viewed',
  
  // Admin events
  ADMIN_VIEW_DASHBOARD: 'admin_view_dashboard',
  ADMIN_VIEW_ANALYTICS: 'admin_view_analytics',
  ADMIN_VIEW_ORDERS: 'admin_view_orders',
  ADMIN_VIEW_DRIVERS: 'admin_view_drivers',
  ADMIN_VIEW_CUSTOMERS: 'admin_view_customers',
  ADMIN_EXPORT_DATA: 'admin_export_data',
  
  // Customer events
  CUSTOMER_SIGNUP: 'customer_signup',
  CUSTOMER_LOGIN: 'customer_login',
  BOOKING_STARTED: 'booking_started',
  BOOKING_COMPLETED: 'booking_completed',
  PAYMENT_COMPLETED: 'payment_completed',
  
  // Navigation events
  PAGE_VIEW: '$pageview',
  BUTTON_CLICK: 'button_click',
  FORM_SUBMIT: 'form_submit',
} as const;
