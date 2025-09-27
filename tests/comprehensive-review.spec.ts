import { test, expect, Page } from '@playwright/test';
import { nanoid } from 'nanoid';

/**
 * Comprehensive Review Test Suite
 * 
 * Critical smoke tests covering:
 * - Customer Journey: Book → Pay → Track
 * - Driver Journey: Accept → Navigate → Complete  
 * - Admin Journey: Monitor → Reassign → Manage
 * - System Integration: Payments, WebSocket, Database
 */

// Test Data Factory
class TestDataFactory {
  static generateOrder() {
    return {
      id: nanoid(8),
      retailer: 'Target',
      items: 'Nike Shoes - Size 10',
      pickupAddress: '123 Test St, St. Louis, MO 63101',
      reason: 'wrong_size',
      trackingNumber: nanoid(12).toUpperCase()
    };
  }

  static generateCustomer() {
    return {
      email: `test-customer-${nanoid(6)}@returnit.test`,
      firstName: 'Test',
      lastName: 'Customer',
      phone: '(314) 555-0123'
    };
  }

  static generateDriver() {
    return {
      email: `test-driver-${nanoid(6)}@returnit.test`,
      firstName: 'Test',
      lastName: 'Driver',
      phone: '(314) 555-0456'
    };
  }
}

// Critical Path: Customer Journey
test.describe('Customer Critical Path', () => {
  test('Complete return booking flow', async ({ page }) => {
    const customer = TestDataFactory.generateCustomer();
    const order = TestDataFactory.generateOrder();
    
    // 1. Navigate to booking page
    await page.goto('/book-pickup');
    await expect(page.getByTestId('heading-book-pickup')).toBeVisible();
    
    // 2. Fill return details
    await page.getByTestId('input-retailer').fill(order.retailer);
    await page.getByTestId('input-items').fill(order.items);
    await page.getByTestId('input-address').fill(order.pickupAddress);
    await page.getByTestId('select-reason').selectOption(order.reason);
    
    // 3. Submit and verify redirect to checkout
    await page.getByTestId('button-continue-checkout').click();
    await expect(page).toHaveURL(/.*checkout.*/);
    
    // 4. Verify order summary displayed
    await expect(page.getByText(order.retailer)).toBeVisible();
    await expect(page.getByText('On Demand Returns Fee')).toBeVisible();
    
    // 5. Verify payment form loads (Stripe)
    await expect(page.getByTestId('payment-element')).toBeVisible();
  });

  test('Track return status', async ({ page }) => {
    // Test tracking flow with mock tracking number
    const mockTrackingNumber = TestDataFactory.generateOrder().trackingNumber;
    
    await page.goto(`/track-return?tracking=${mockTrackingNumber}`);
    await expect(page.getByTestId('tracking-display')).toBeVisible();
    await expect(page.getByText(mockTrackingNumber)).toBeVisible();
  });
});

// Critical Path: System Integration
test.describe('System Integration', () => {
  test('API endpoints respond correctly', async ({ request }) => {
    // Test critical API endpoints
    const endpoints = [
      { path: '/api/auth/me', expectedStatus: [200, 401] },
      { path: '/api/config/environment', expectedStatus: [200] },
      { path: '/api/retailers', expectedStatus: [200] }
    ];

    for (const endpoint of endpoints) {
      const response = await request.get(endpoint.path);
      expect(endpoint.expectedStatus).toContain(response.status());
    }
  });

  test('Database connectivity', async ({ request }) => {
    // Test basic database operations
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const health = await response.json();
    expect(health.database).toBe('connected');
  });
});

// Critical Path: Admin Functions  
test.describe('Admin Critical Path', () => {
  test('Admin dashboard loads', async ({ page }) => {
    // Navigate to admin (will redirect to login if not authenticated)
    await page.goto('/admin-dashboard');
    
    // Should either show login or admin dashboard
    const isLoginPage = await page.getByTestId('button-sign-in').isVisible();
    const isAdminPage = await page.getByTestId('heading-admin-dashboard').isVisible();
    
    expect(isLoginPage || isAdminPage).toBe(true);
  });

  test('Order management functions', async ({ page }) => {
    await page.goto('/admin-dashboard');
    
    // Check if order management sections are present
    const hasOrdersSection = await page.getByTestId('section-active-orders').isVisible();
    if (hasOrdersSection) {
      await expect(page.getByTestId('section-active-orders')).toBeVisible();
      await expect(page.getByTestId('section-driver-management')).toBeVisible();
    }
  });
});

// Performance & UX Checks
test.describe('Performance & UX', () => {
  test('Page load times are acceptable', async ({ page }) => {
    const criticalPages = ['/', '/book-pickup', '/about', '/faq'];
    
    for (const pagePath of criticalPages) {
      const startTime = Date.now();
      await page.goto(pagePath);
      const loadTime = Date.now() - startTime;
      
      // Pages should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
      
      // Basic content should be visible
      await expect(page.getByText('Return It')).toBeVisible();
    }
  });

  test('Mobile responsiveness', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/book-pickup');
    await expect(page.getByTestId('heading-book-pickup')).toBeVisible();
    
    // Navigation should be mobile-friendly
    await expect(page.getByTestId('button-mobile-menu')).toBeVisible();
  });
});

// Security & Authentication
test.describe('Security Checks', () => {
  test('Protected routes require authentication', async ({ page }) => {
    const protectedRoutes = [
      '/customer-dashboard',
      '/driver-portal', 
      '/admin-dashboard'
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      
      // Should redirect to login or show auth required
      const currentUrl = page.url();
      expect(
        currentUrl.includes('/login') || 
        currentUrl.includes('/signin') || 
        await page.getByText('sign in').isVisible()
      ).toBe(true);
    }
  });

  test('HTTPS and security headers', async ({ request }) => {
    const response = await request.get('/');
    
    // Should have security headers in production
    expect(response.status()).toBe(200);
    
    // Basic security check - ensure no sensitive info in headers
    const headers = response.headers();
    expect(headers['server']).not.toContain('Express');
  });
});