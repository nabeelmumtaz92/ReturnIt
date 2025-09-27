import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for ReturnIt Comprehensive Reviews
 * 
 * Optimized for fast, reliable testing across all user personas
 */

export default defineConfig({
  // Test directory
  testDir: './tests',
  
  // Global timeout for each test
  timeout: 30000,
  
  // Global setup timeout 
  globalTimeout: 600000,
  
  // Expect timeout for assertions
  expect: {
    timeout: 5000,
  },
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests for stability during development
  workers: process.env.CI ? 1 : 1,
  
  // Reporter to use
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['line']
  ],
  
  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:5000',
    
    // Global timeout for actions like click, fill, etc.
    actionTimeout: 10000,
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Trace on failure for debugging
    trace: 'retain-on-failure',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // API Testing project
    {
      name: 'API',
      testMatch: '**/api/*.spec.ts',
      use: {
        // Skip browser for API tests
        ...devices['Desktop Chrome'],
      },
    }
  ],

  // Run local dev server before starting tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});