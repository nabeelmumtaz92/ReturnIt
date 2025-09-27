# ReturnIt Webhook & API Guide

## Overview
ReturnIt's webhook infrastructure enables real-time communication with merchant partners, payment processors, and third-party services for enterprise-grade integrations.

## Webhook Architecture

### Supported Webhook Types
- **Order Status Updates**: Real-time order lifecycle events
- **Payment Notifications**: Stripe webhook for payment events  
- **Merchant Policy Updates**: Retailer return policy changes
- **Driver Location Updates**: GPS tracking events
- **System Health Notifications**: Infrastructure alerts

### Webhook Infrastructure
```typescript
// Core webhook service
class WebhookService {
  private endpoints: Map<string, WebhookEndpoint> = new Map();
  private retryQueue: RetryQueue = new RetryQueue();
  
  async sendWebhook(event: WebhookEvent): Promise<void> {
    const endpoints = this.getEndpointsForEvent(event.type);
    
    for (const endpoint of endpoints) {
      await this.deliverWebhook(endpoint, event);
    }
  }
}
```

## Merchant Webhook Configuration

### Adding Merchant Endpoints
```bash
# API endpoint to register merchant webhooks
POST /api/admin/webhooks/merchants

{
  "merchantId": "walmart_returns",
  "name": "Walmart Returns Integration",
  "url": "https://api.walmart.com/v1/returns/webhooks/returnit",
  "secret": "webhook_secret_key",
  "events": ["order.created", "order.completed", "order.cancelled"],
  "retryPolicy": {
    "maxRetries": 3,
    "backoffMultiplier": 2,
    "maxBackoffMinutes": 60
  }
}
```

### Webhook Event Types
```typescript
// Standard webhook events
interface WebhookEvents {
  // Order lifecycle
  'order.created': OrderCreatedEvent;
  'order.assigned': OrderAssignedEvent;  
  'order.picked_up': OrderPickedUpEvent;
  'order.delivered': OrderDeliveredEvent;
  'order.completed': OrderCompletedEvent;
  'order.cancelled': OrderCancelledEvent;
  
  // Payment events
  'payment.succeeded': PaymentSucceededEvent;
  'payment.failed': PaymentFailedEvent;
  'payout.completed': PayoutCompletedEvent;
  
  // Driver events
  'driver.location_updated': DriverLocationEvent;
  'driver.assigned': DriverAssignedEvent;
  'driver.unavailable': DriverUnavailableEvent;
  
  // System events
  'system.alert': SystemAlertEvent;
  'policy.updated': PolicyUpdatedEvent;
}
```

### Merchant Webhook Example
```javascript
// Example merchant webhook payload
const orderCompletedWebhook = {
  event: 'order.completed',
  timestamp: '2025-01-27T15:30:00Z',
  data: {
    orderId: 'ret_abc123',
    merchantOrderId: 'walmart_789',
    customerId: 12345,
    driverId: 67890,
    items: [
      {
        sku: 'ELECT001',
        name: 'Wireless Headphones',
        returnReason: 'defective',
        condition: 'damaged'
      }
    ],
    completion: {
      deliveredAt: '2025-01-27T15:25:00Z',
      location: {
        lat: 38.6270,
        lng: -90.1994,
        address: 'Target Store #1234, St. Louis, MO'
      },
      signature: 'base64_signature_data',
      photos: ['photo1_url', 'photo2_url']
    }
  },
  signature: 'sha256=webhook_signature_hash'
};
```

## Webhook Security

### Signature Verification
```typescript
// Verify webhook signatures
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha256=${expectedSignature}`)
  );
}

// Middleware for webhook endpoints
app.use('/webhooks/*', (req, res, next) => {
  const signature = req.headers['x-webhook-signature'];
  const secret = getWebhookSecret(req.path);
  
  if (!verifyWebhookSignature(req.body, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  next();
});
```

### Rate Limiting
```typescript
// Rate limiting for webhook endpoints
import rateLimit from 'express-rate-limit';

const webhookRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many webhook requests',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/webhooks', webhookRateLimit);
```

## Retry Logic & Error Handling

### Automatic Retry Configuration
```typescript
interface RetryPolicy {
  maxRetries: number;        // Default: 3
  backoffMultiplier: number; // Default: 2 (exponential backoff)
  maxBackoffMinutes: number; // Default: 60 minutes
  retryableStatusCodes: number[]; // [500, 502, 503, 504, 429]
}

// Default retry schedule
const defaultRetrySchedule = [
  30,    // 30 seconds
  120,   // 2 minutes  
  600,   // 10 minutes
  3600   // 1 hour (final attempt)
];
```

### Retry Implementation
```typescript
class WebhookRetryService {
  async deliverWebhook(
    endpoint: WebhookEndpoint, 
    event: WebhookEvent,
    attempt: number = 1
  ): Promise<void> {
    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': event.type,
          'X-Webhook-Signature': this.generateSignature(event, endpoint.secret)
        },
        body: JSON.stringify(event),
        timeout: 30000 // 30 second timeout
      });
      
      if (!response.ok && this.shouldRetry(response.status)) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Success - log delivery
      console.log(`Webhook delivered: ${endpoint.name} - ${event.type}`);
      
    } catch (error) {
      if (attempt < endpoint.retryPolicy.maxRetries) {
        const delay = this.calculateBackoff(attempt, endpoint.retryPolicy);
        
        console.log(`Webhook failed, retrying in ${delay}ms: ${endpoint.name}`);
        
        setTimeout(() => {
          this.deliverWebhook(endpoint, event, attempt + 1);
        }, delay);
      } else {
        console.error(`Webhook failed permanently: ${endpoint.name} - ${error.message}`);
        await this.logFailedWebhook(endpoint, event, error);
      }
    }
  }
  
  private shouldRetry(statusCode: number): boolean {
    return [500, 502, 503, 504, 429].includes(statusCode);
  }
  
  private calculateBackoff(attempt: number, policy: RetryPolicy): number {
    const baseDelay = 30000; // 30 seconds
    const delay = baseDelay * Math.pow(policy.backoffMultiplier, attempt - 1);
    const maxDelay = policy.maxBackoffMinutes * 60 * 1000;
    
    return Math.min(delay, maxDelay);
  }
}
```

## API Endpoint Management

### Core API Endpoints
```typescript
// Webhook management APIs
app.get('/api/admin/webhooks', requireAdmin, getWebhooks);
app.post('/api/admin/webhooks', requireAdmin, createWebhook);
app.put('/api/admin/webhooks/:id', requireAdmin, updateWebhook);
app.delete('/api/admin/webhooks/:id', requireAdmin, deleteWebhook);

// Webhook testing
app.post('/api/admin/webhooks/:id/test', requireAdmin, testWebhook);
app.get('/api/admin/webhooks/:id/logs', requireAdmin, getWebhookLogs);

// Merchant integration
app.post('/api/webhooks/stripe', handleStripeWebhook);
app.post('/api/webhooks/walmart', handleWalmartWebhook);
app.post('/api/webhooks/shopify', handleShopifyWebhook);
```

### Adding New Merchant Endpoints
```typescript
// Example: Adding Target webhook integration
async function addTargetWebhook() {
  const webhook = await storage.createWebhookEndpoint({
    merchantId: 'target_returns',
    name: 'Target Returns Integration',
    url: 'https://api.target.com/v2/returns/webhooks/returnit',
    secret: process.env.TARGET_WEBHOOK_SECRET,
    events: [
      'order.created',
      'order.completed', 
      'order.cancelled',
      'policy.updated'
    ],
    retryPolicy: {
      maxRetries: 5,
      backoffMultiplier: 2,
      maxBackoffMinutes: 120
    },
    isActive: true
  });
  
  console.log(`Target webhook configured: ${webhook.id}`);
}
```

### Removing Merchant Endpoints
```typescript
// Safely remove webhook endpoint
async function removeWebhookEndpoint(webhookId: string) {
  // 1. Disable webhook (stop sending new events)
  await storage.updateWebhookEndpoint(webhookId, { isActive: false });
  
  // 2. Wait for pending deliveries to complete
  await this.waitForPendingDeliveries(webhookId);
  
  // 3. Archive webhook logs
  await this.archiveWebhookLogs(webhookId);
  
  // 4. Delete webhook endpoint
  await storage.deleteWebhookEndpoint(webhookId);
  
  console.log(`Webhook endpoint removed: ${webhookId}`);
}
```

## Stripe Webhook Integration

### Stripe Event Handling
```typescript
// Stripe webhook endpoint
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
    case 'transfer.created':
      await handleDriverPayout(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  res.status(200).json({ received: true });
});
```

## Merchant-Specific Integrations

### Walmart Returns API
```typescript
// Walmart webhook handler
app.post('/api/webhooks/walmart', async (req, res) => {
  try {
    const { event, data } = req.body;
    
    switch (event) {
      case 'return_policy_updated':
        await updateWalmartReturnPolicy(data);
        break;
      case 'return_processed':
        await syncWalmartReturnStatus(data);
        break;
      case 'inventory_updated':
        await updateWalmartInventory(data);
        break;
    }
    
    res.status(200).json({ status: 'processed' });
  } catch (error) {
    console.error('Walmart webhook error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});
```

### Shopify Integration
```typescript
// Shopify webhook handler  
app.post('/api/webhooks/shopify', async (req, res) => {
  const hmac = req.get('X-Shopify-Hmac-Sha256');
  const body = req.body;
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  
  // Verify Shopify webhook
  const calculatedHmac = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');
    
  if (calculatedHmac !== hmac) {
    return res.status(401).send('Unauthorized');
  }
  
  const event = req.get('X-Shopify-Topic');
  
  switch (event) {
    case 'orders/create':
      await handleShopifyOrderCreated(req.body);
      break;
    case 'orders/updated':
      await handleShopifyOrderUpdated(req.body);
      break;
    case 'orders/cancelled':
      await handleShopifyOrderCancelled(req.body);
      break;
  }
  
  res.status(200).json({ status: 'ok' });
});
```

## Webhook Monitoring & Logging

### Delivery Tracking
```typescript
interface WebhookDeliveryLog {
  id: string;
  webhookId: string;
  eventType: string;
  url: string;
  httpStatus: number;
  responseTime: number;
  attempt: number;
  deliveredAt: Date;
  error?: string;
  responseBody?: string;
}

// Log all webhook deliveries
async function logWebhookDelivery(
  webhook: WebhookEndpoint,
  event: WebhookEvent, 
  response: Response,
  attempt: number
) {
  await storage.createWebhookDeliveryLog({
    webhookId: webhook.id,
    eventType: event.type,
    url: webhook.url,
    httpStatus: response.status,
    responseTime: Date.now() - event.timestamp,
    attempt,
    deliveredAt: new Date(),
    responseBody: await response.text()
  });
}
```

### Webhook Analytics
```typescript
// Webhook performance analytics
async function getWebhookAnalytics(timeframe: string = '24h') {
  const analytics = await sql`
    SELECT 
      webhook_id,
      event_type,
      COUNT(*) as total_deliveries,
      COUNT(*) FILTER (WHERE http_status BETWEEN 200 AND 299) as successful_deliveries,
      AVG(response_time) as avg_response_time,
      MAX(attempt) as max_retry_attempts
    FROM webhook_delivery_logs 
    WHERE delivered_at > NOW() - INTERVAL '${timeframe}'
    GROUP BY webhook_id, event_type
    ORDER BY total_deliveries DESC
  `;
  
  return analytics;
}
```

## Testing Webhooks

### Manual Testing
```bash
# Test webhook endpoint
curl -X POST https://returnit.online/api/webhooks/test \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: sha256=test_signature" \
  -d '{
    "event": "order.completed",
    "data": {
      "orderId": "test_123",
      "status": "completed"
    }
  }'
```

### Automated Testing
```typescript
// Webhook testing utilities
class WebhookTester {
  async testWebhookEndpoint(webhookId: string): Promise<TestResult> {
    const webhook = await storage.getWebhookEndpoint(webhookId);
    
    const testEvent = {
      event: 'test.ping',
      timestamp: new Date().toISOString(),
      data: { test: true }
    };
    
    try {
      const response = await this.deliverWebhook(webhook, testEvent);
      
      return {
        success: response.ok,
        statusCode: response.status,
        responseTime: response.responseTime,
        error: response.ok ? null : await response.text()
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 0,
        responseTime: 0,
        error: error.message
      };
    }
  }
}
```

## Troubleshooting Common Issues

### Webhook Delivery Failures
1. **Check endpoint URL**: Verify webhook URL is accessible
2. **Verify signatures**: Ensure signature verification is correct
3. **Check rate limits**: Monitor for rate limiting issues
4. **Review logs**: Check webhook delivery logs for patterns
5. **Test manually**: Use curl or Postman to test endpoint

### High Retry Rates
1. **Endpoint performance**: Check if merchant endpoint is slow
2. **Network issues**: Monitor for connectivity problems
3. **Status codes**: Review which status codes are causing retries
4. **Adjust retry policy**: Modify backoff settings if needed

### Missing Events
1. **Event registration**: Ensure endpoint is subscribed to event type
2. **Filter conditions**: Check if events meet delivery criteria
3. **Webhook active status**: Verify webhook endpoint is active
4. **Event generation**: Confirm events are being generated correctly

## Security Best Practices

### Webhook Security Checklist
- [ ] **Signature verification**: Always verify webhook signatures
- [ ] **HTTPS only**: Never send webhooks over HTTP
- [ ] **Rate limiting**: Implement rate limiting on webhook endpoints
- [ ] **IP allowlisting**: Consider IP restrictions for sensitive webhooks
- [ ] **Secret rotation**: Regularly rotate webhook secrets
- [ ] **Logging**: Log all webhook attempts for security monitoring
- [ ] **Timeout handling**: Set reasonable timeouts for webhook deliveries

### Contact Information
- **Webhook Support**: nabeelmumtaz92@gmail.com
- **Technical Issues**: [Engineering team]
- **Merchant Integration**: [Partnership team]
- **Security Incidents**: [Security team]