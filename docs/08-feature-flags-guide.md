# ReturnIt Feature Flags Guide

## Overview
Feature flags enable safe deployment of new features, A/B testing, and emergency feature disabling without code deployments.

## Feature Flag Architecture

### Current Implementation
```typescript
// Simple feature flag system
interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  environment: 'all' | 'development' | 'staging' | 'production';
  userPercentage?: number; // Gradual rollout
  userSegments?: string[]; // Target specific user groups
  createdAt: Date;
  updatedAt: Date;
}

// In-memory feature flags (future: database-backed)
const featureFlags = new Map<string, FeatureFlag>();
```

### Feature Flag Usage
```typescript
// Check feature flags in code
function isFeatureEnabled(flagKey: string, userId?: number): boolean {
  const flag = featureFlags.get(flagKey);
  
  if (!flag || !flag.enabled) return false;
  
  // Environment check
  if (flag.environment !== 'all' && flag.environment !== process.env.NODE_ENV) {
    return false;
  }
  
  // Percentage rollout
  if (flag.userPercentage && userId) {
    const userHash = hash(userId) % 100;
    return userHash < flag.userPercentage;
  }
  
  return true;
}

// Usage in API endpoints
app.get('/api/new-feature', (req, res) => {
  const user = (req.session as any).user;
  
  if (!isFeatureEnabled('new_feature_enabled', user?.id)) {
    return res.status(404).json({ message: 'Feature not available' });
  }
  
  // New feature logic
  res.json({ message: 'New feature active!' });
});
```

## Current Feature Flags

### Active Feature Flags
```typescript
const currentFlags = [
  {
    key: 'advanced_analytics',
    name: 'Advanced Analytics Dashboard',
    description: 'Enable comprehensive business analytics',
    enabled: true,
    environment: 'all'
  },
  {
    key: 'ai_support_chat',
    name: 'AI-Powered Support Chat', 
    description: 'Gemini-powered customer support assistant',
    enabled: true,
    environment: 'all'
  },
  {
    key: 'driver_incentives_v2',
    name: 'Enhanced Driver Incentives',
    description: 'New incentive calculation system',
    enabled: false, // Disabled until tested
    environment: 'development'
  },
  {
    key: 'real_time_tracking',
    name: 'Real-time GPS Tracking',
    description: 'Live driver location updates',
    enabled: true,
    environment: 'all'
  },
  {
    key: 'merchant_webhooks',
    name: 'Merchant Webhook Integration',
    description: 'Real-time merchant notifications',
    enabled: true,
    environment: 'production'
  }
];
```

### Frontend Feature Flags
```typescript
// React hook for feature flags
function useFeatureFlag(flagKey: string): boolean {
  const { user } = useAuth();
  
  return useMemo(() => {
    return isFeatureEnabled(flagKey, user?.id);
  }, [flagKey, user?.id]);
}

// Usage in components
function DashboardPage() {
  const showAdvancedAnalytics = useFeatureFlag('advanced_analytics');
  const showAIChat = useFeatureFlag('ai_support_chat');
  
  return (
    <div>
      <BasicDashboard />
      
      {showAdvancedAnalytics && (
        <AdvancedAnalyticsPanel />
      )}
      
      {showAIChat && (
        <AISupportChatWidget />
      )}
    </div>
  );
}
```

## Feature Flag Management

### API Endpoints
```typescript
// Admin-only feature flag management
app.get('/api/admin/feature-flags', requireAdmin, async (req, res) => {
  const flags = Array.from(featureFlags.values());
  res.json(flags);
});

app.post('/api/admin/feature-flags', requireAdmin, async (req, res) => {
  const { key, name, description, enabled, environment } = req.body;
  
  const flag: FeatureFlag = {
    key,
    name,
    description,
    enabled,
    environment,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  featureFlags.set(key, flag);
  res.status(201).json(flag);
});

app.put('/api/admin/feature-flags/:key', requireAdmin, async (req, res) => {
  const { key } = req.params;
  const existing = featureFlags.get(key);
  
  if (!existing) {
    return res.status(404).json({ message: 'Feature flag not found' });
  }
  
  const updated = {
    ...existing,
    ...req.body,
    updatedAt: new Date()
  };
  
  featureFlags.set(key, updated);
  res.json(updated);
});
```

### Emergency Feature Disable
```bash
# Quickly disable a problematic feature
curl -X PUT https://returnit.online/api/admin/feature-flags/problematic_feature \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}' \
  -u admin:password

# Disable for specific environment only
curl -X PUT https://returnit.online/api/admin/feature-flags/new_feature \
  -H "Content-Type: application/json" \
  -d '{"environment": "development"}' \
  -u admin:password
```

## Gradual Rollout Strategies

### Percentage-Based Rollout
```typescript
// Roll out to 10% of users initially
const gradualRollout = {
  key: 'new_checkout_flow',
  name: 'New Checkout Flow',
  enabled: true,
  userPercentage: 10, // Start with 10%
  environment: 'production'
};

// Increase percentage over time
const rolloutSchedule = [
  { day: 1, percentage: 10 },   // 10% for first day
  { day: 3, percentage: 25 },   // 25% after 3 days if stable
  { day: 7, percentage: 50 },   // 50% after a week
  { day: 14, percentage: 100 }  // Full rollout after 2 weeks
];
```

### User Segment Targeting
```typescript
// Target specific user groups
const segmentedRollout = {
  key: 'premium_features',
  name: 'Premium Features',
  enabled: true,
  userSegments: ['premium_customers', 'beta_testers'],
  environment: 'production'
};

// Check user segments
function isInSegment(userId: number, segment: string): boolean {
  // Check user properties, subscription status, etc.
  const user = getUserById(userId);
  
  switch (segment) {
    case 'premium_customers':
      return user.subscriptionTier === 'premium';
    case 'beta_testers':
      return user.betaTester === true;
    case 'power_users':
      return user.orderCount > 50;
    default:
      return false;
  }
}
```

## A/B Testing with Feature Flags

### A/B Test Configuration
```typescript
interface ABTest {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  variants: {
    control: { percentage: number; config: any };
    variant_a: { percentage: number; config: any };
    variant_b?: { percentage: number; config: any };
  };
  metrics: string[]; // Metrics to track
  startDate: Date;
  endDate?: Date;
}

// Example A/B test
const checkoutFlowTest: ABTest = {
  key: 'checkout_flow_test',
  name: 'Checkout Flow Optimization',
  description: 'Test new vs old checkout flow',
  enabled: true,
  variants: {
    control: { 
      percentage: 50, 
      config: { flow: 'original' }
    },
    variant_a: { 
      percentage: 50, 
      config: { flow: 'streamlined' }
    }
  },
  metrics: ['conversion_rate', 'abandonment_rate', 'completion_time'],
  startDate: new Date('2025-01-27'),
  endDate: new Date('2025-02-10')
};
```

### A/B Test Implementation
```typescript
// Get user's test variant
function getABTestVariant(testKey: string, userId: number): string {
  const test = abTests.get(testKey);
  if (!test || !test.enabled) return 'control';
  
  const userHash = hash(`${testKey}_${userId}`) % 100;
  let cumulative = 0;
  
  for (const [variant, config] of Object.entries(test.variants)) {
    cumulative += config.percentage;
    if (userHash < cumulative) {
      return variant;
    }
  }
  
  return 'control';
}

// Usage in React components
function CheckoutPage() {
  const { user } = useAuth();
  const variant = getABTestVariant('checkout_flow_test', user.id);
  
  return (
    <div>
      {variant === 'control' && <OriginalCheckoutFlow />}
      {variant === 'variant_a' && <StreamlinedCheckoutFlow />}
    </div>
  );
}
```

## Feature Flag Best Practices

### Naming Conventions
```typescript
// Good naming patterns
const namingConventions = {
  feature: 'new_dashboard_v2',
  experiment: 'checkout_flow_test_jan2025', 
  bugfix: 'fix_payment_validation',
  performance: 'cache_optimization_enabled',
  integration: 'stripe_connect_v2'
};

// Include context in description
const goodDescriptions = [
  'Enable new React-based analytics dashboard',
  'Test streamlined checkout vs original flow',
  'Fix validation bug in payment processing',
  'Enable Redis caching for order queries'
];
```

### Flag Lifecycle Management
```typescript
// Flag lifecycle states
enum FlagState {
  DEVELOPMENT = 'development',
  TESTING = 'testing', 
  PARTIAL_ROLLOUT = 'partial_rollout',
  FULL_ROLLOUT = 'full_rollout',
  DEPRECATING = 'deprecating',
  REMOVED = 'removed'
}

// Automatic flag cleanup
async function cleanupOldFlags() {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  for (const [key, flag] of featureFlags) {
    // Remove flags that have been fully rolled out for > 1 month
    if (flag.enabled && flag.userPercentage === 100 && 
        flag.updatedAt < oneMonthAgo) {
      console.log(`Removing fully-rolled flag: ${key}`);
      featureFlags.delete(key);
    }
  }
}
```

### Feature Flag Testing
```typescript
// Test feature flag behavior
describe('Feature Flags', () => {
  it('should enable feature for target percentage', () => {
    const flag = {
      key: 'test_feature',
      enabled: true,
      userPercentage: 50
    };
    
    let enabledCount = 0;
    for (let userId = 1; userId <= 1000; userId++) {
      if (isFeatureEnabled('test_feature', userId)) {
        enabledCount++;
      }
    }
    
    // Should be approximately 50% (within 10% margin)
    expect(enabledCount).toBeGreaterThan(450);
    expect(enabledCount).toBeLessThan(550);
  });
});
```

## Emergency Procedures

### Kill Switch Activation
```typescript
// Emergency disable all non-critical features
async function activateKillSwitch() {
  const criticalFeatures = [
    'core_booking_flow',
    'payment_processing', 
    'driver_assignment'
  ];
  
  for (const [key, flag] of featureFlags) {
    if (!criticalFeatures.includes(key)) {
      flag.enabled = false;
      flag.updatedAt = new Date();
      console.log(`Emergency disabled: ${key}`);
    }
  }
  
  console.log('🚨 Kill switch activated - non-critical features disabled');
}

// Emergency endpoint
app.post('/api/admin/emergency/kill-switch', requireAdmin, async (req, res) => {
  await activateKillSwitch();
  res.json({ message: 'Kill switch activated' });
});
```

### Rollback Procedures
```typescript
// Rollback a feature that's causing issues
async function rollbackFeature(flagKey: string) {
  const flag = featureFlags.get(flagKey);
  if (!flag) return;
  
  // Save current state for potential restore
  const backup = { ...flag };
  
  // Disable feature
  flag.enabled = false;
  flag.updatedAt = new Date();
  
  console.log(`Feature rolled back: ${flagKey}`);
  
  // Store backup for potential restoration
  await storage.createFeatureFlagBackup(flagKey, backup);
}
```

## Monitoring & Analytics

### Feature Flag Metrics
```typescript
// Track feature flag usage
interface FlagMetrics {
  flagKey: string;
  totalUsers: number;
  enabledUsers: number;
  conversionRate?: number;
  errorRate?: number;
  performanceImpact?: number;
}

// Monitor flag performance
async function trackFlagMetrics(flagKey: string, userId: number, outcome: string) {
  await storage.createFlagMetric({
    flagKey,
    userId,
    outcome, // 'success', 'error', 'conversion'
    timestamp: new Date()
  });
}
```

### Feature Flag Dashboard
```typescript
// Real-time flag status dashboard
app.get('/api/admin/feature-flags/dashboard', requireAdmin, async (req, res) => {
  const flagStats = [];
  
  for (const [key, flag] of featureFlags) {
    const metrics = await getFlagMetrics(key);
    
    flagStats.push({
      key,
      name: flag.name,
      enabled: flag.enabled,
      environment: flag.environment,
      userPercentage: flag.userPercentage,
      metrics: {
        totalUsers: metrics.totalUsers,
        enabledUsers: metrics.enabledUsers,
        successRate: metrics.successRate,
        errorRate: metrics.errorRate
      }
    });
  }
  
  res.json(flagStats);
});
```

## Future Enhancements

### Database-Backed Flags
```sql
-- Future: Store flags in database for persistence
CREATE TABLE feature_flags (
  key VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  environment VARCHAR(50) DEFAULT 'all',
  user_percentage INTEGER DEFAULT 100,
  user_segments TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Advanced Targeting
```typescript
// Future: More sophisticated targeting
interface AdvancedTargeting {
  geoLocation?: string[];      // Target specific regions
  deviceType?: string[];       // Mobile, desktop, tablet
  userAgent?: string[];        // Specific browsers
  customAttributes?: Record<string, any>;
}
```

### Integration with Analytics
```typescript
// Future: Automatic A/B test result analysis
async function analyzeABTestResults(testKey: string) {
  const results = await getABTestMetrics(testKey);
  
  const analysis = {
    winner: determineWinner(results),
    significance: calculateSignificance(results),
    recommendation: generateRecommendation(results)
  };
  
  return analysis;
}
```

## Contact Information
- **Feature Flag Owner**: nabeelmumtaz92@gmail.com
- **Engineering Team**: [Engineering team contact]
- **Product Team**: [Product team contact]