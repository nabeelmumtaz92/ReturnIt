import crypto from 'crypto';
import { storage } from './storage';
import type { 
  WebhookEndpoint, 
  InsertWebhookDelivery, 
  WebhookEventType,
  Order 
} from '@shared/schema';

interface WebhookPayload {
  event: WebhookEventType;
  data: {
    order: Partial<Order>;
    timestamp: string;
    webhook_id: string;
    [key: string]: any;
  };
  metadata?: {
    merchant_id: string;
    environment: string;
    api_version: string;
  };
}

interface DeliveryOptions {
  orderId?: string;
  retryCount?: number;
  metadata?: Record<string, any>;
}

class WebhookService {
  private retryQueue: Map<number, NodeJS.Timeout> = new Map();

  /**
   * Fire a webhook event to all registered merchant endpoints
   */
  async fireWebhook(
    eventType: WebhookEventType, 
    order: Partial<Order>,
    options: DeliveryOptions = {}
  ): Promise<void> {
    try {
      console.log(`🔗 Firing webhook: ${eventType} for order ${order.id}`);
      
      // Get all active webhook endpoints that are subscribed to this event
      const endpoints = await this.getActiveEndpointsForEvent(eventType);
      
      if (endpoints.length === 0) {
        console.log(`📭 No webhook endpoints registered for event: ${eventType}`);
        return;
      }

      // Fire webhook to each endpoint
      const deliveryPromises = endpoints.map(endpoint => 
        this.deliverWebhook(endpoint, eventType, order, options)
      );

      await Promise.allSettled(deliveryPromises);
      
      console.log(`✅ Webhook ${eventType} fired to ${endpoints.length} endpoints`);
    } catch (error) {
      console.error(`❌ Error firing webhook ${eventType}:`, error);
    }
  }

  /**
   * Deliver webhook to a specific endpoint with retry logic
   */
  private async deliverWebhook(
    endpoint: WebhookEndpoint,
    eventType: WebhookEventType,
    order: Partial<Order>,
    options: DeliveryOptions = {}
  ): Promise<void> {
    const webhookId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    
    // Build webhook payload matching the format from your attached context
    const payload: WebhookPayload = {
      event: eventType,
      data: {
        order: {
          id: order.id,
          tracking_number: order.trackingNumber,
          status: order.status,
          customer_name: `${order.customerFirstName || ''} ${order.customerLastName || ''}`.trim(),
          pickup_address: order.pickupStreetAddress,
          pickup_city: order.pickupCity,
          pickup_state: order.pickupState,
          pickup_zip: order.pickupZipCode,
          retailer: order.retailer,
          items: order.itemDescription,
          driver_id: order.driverId,
          pickup_eta: order.scheduledPickupDate,
          created_at: order.createdAt,
          updated_at: order.updatedAt
        },
        timestamp,
        webhook_id: webhookId,
        ...options.metadata
      },
      metadata: {
        merchant_id: endpoint.merchantId,
        environment: process.env.NODE_ENV || 'development',
        api_version: '1.0'
      }
    };

    // Create delivery record
    const deliveryRecord: InsertWebhookDelivery = {
      webhookEndpointId: endpoint.id,
      eventType,
      orderId: order.id || null,
      requestPayload: payload,
      attemptNumber: options.retryCount || 1
    };

    try {
      // Sign the payload
      const signature = this.signPayload(payload, endpoint.secret);
      
      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'ReturnIt-Webhooks/1.0',
        'X-ReturnIt-Event': eventType,
        'X-ReturnIt-Signature': signature,
        'X-ReturnIt-Webhook-ID': webhookId,
        'X-ReturnIt-Timestamp': timestamp,
        'X-ReturnIt-Merchant': endpoint.merchantId
      };

      console.log(`📤 Delivering webhook to ${endpoint.merchantName}: ${eventType}`);

      // Make HTTP request
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(endpoint.timeoutSeconds * 1000)
      });

      const responseText = await response.text();
      
      // Update delivery record
      await storage.createWebhookDelivery({
        ...deliveryRecord,
        httpStatus: response.status,
        response: responseText.slice(0, 1000), // Truncate response
        isSuccessful: response.ok,
        deliveredAt: response.ok ? new Date() : null,
        requestHeaders: headers,
        responseHeaders: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        console.log(`✅ Webhook delivered successfully to ${endpoint.merchantName}`);
      } else {
        console.error(`❌ Webhook delivery failed to ${endpoint.merchantName}: ${response.status}`);
        await this.scheduleRetry(endpoint, eventType, order, options, 
          `HTTP ${response.status}: ${responseText}`);
      }

    } catch (error: any) {
      console.error(`❌ Webhook delivery error to ${endpoint.merchantName}:`, error.message);
      
      // Record failed delivery
      await storage.createWebhookDelivery({
        ...deliveryRecord,
        isSuccessful: false,
        errorMessage: error.message,
        errorCode: error.code || 'DELIVERY_FAILED'
      });

      await this.scheduleRetry(endpoint, eventType, order, options, error.message);
    }
  }

  /**
   * Schedule webhook retry with exponential backoff
   */
  private async scheduleRetry(
    endpoint: WebhookEndpoint,
    eventType: WebhookEventType,
    order: Partial<Order>,
    options: DeliveryOptions,
    errorMessage: string
  ): Promise<void> {
    const retryCount = (options.retryCount || 1) + 1;
    
    if (retryCount > endpoint.maxRetries) {
      console.error(`🚫 Max retries exceeded for webhook ${eventType} to ${endpoint.merchantName}`);
      return;
    }

    // Exponential backoff: base delay * 2^(retry-1)
    const delaySeconds = endpoint.retryBackoffSeconds * Math.pow(2, retryCount - 2);
    const retryAt = new Date(Date.now() + delaySeconds * 1000);
    
    console.log(`⏰ Scheduling retry ${retryCount}/${endpoint.maxRetries} for ${endpoint.merchantName} in ${delaySeconds}s`);

    const timeoutId = setTimeout(async () => {
      this.retryQueue.delete(endpoint.id);
      await this.deliverWebhook(endpoint, eventType, order, { ...options, retryCount });
    }, delaySeconds * 1000);

    this.retryQueue.set(endpoint.id, timeoutId);
  }

  /**
   * Get active webhook endpoints subscribed to a specific event
   */
  private async getActiveEndpointsForEvent(eventType: WebhookEventType): Promise<WebhookEndpoint[]> {
    const allEndpoints = await storage.getActiveWebhookEndpoints();
    
    return allEndpoints.filter(endpoint => 
      endpoint.isActive && 
      (endpoint.enabledEvents as string[]).includes(eventType)
    );
  }

  /**
   * Sign webhook payload using HMAC-SHA256
   */
  private signPayload(payload: WebhookPayload, secret: string): string {
    const payloadString = JSON.stringify(payload);
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payloadString);
    return `sha256=${hmac.digest('hex')}`;
  }

  /**
   * Verify webhook signature (for testing/validation)
   */
  public verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    const providedSignature = signature.replace('sha256=', '');
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    );
  }

  /**
   * Convenience methods for common webhook events
   */
  async fireReturnCreated(order: Partial<Order>): Promise<void> {
    await this.fireWebhook('return.created', order, { orderId: order.id });
  }

  async fireReturnAssigned(order: Partial<Order>, driverId?: number): Promise<void> {
    await this.fireWebhook('return.assigned', order, { 
      orderId: order.id,
      metadata: { driver_id: driverId }
    });
  }

  async firePickupStarted(order: Partial<Order>): Promise<void> {
    await this.fireWebhook('pickup.started', order, { orderId: order.id });
  }

  async firePickupCompleted(order: Partial<Order>): Promise<void> {
    await this.fireWebhook('pickup.completed', order, { orderId: order.id });
  }

  async fireReturnDelivered(order: Partial<Order>): Promise<void> {
    await this.fireWebhook('return.delivered', order, { orderId: order.id });
  }

  async fireReturnCompleted(order: Partial<Order>): Promise<void> {
    await this.fireWebhook('return.completed', order, { orderId: order.id });
  }

  async fireReturnCancelled(order: Partial<Order>, reason?: string): Promise<void> {
    await this.fireWebhook('return.cancelled', order, { 
      orderId: order.id,
      metadata: { cancellation_reason: reason }
    });
  }

  /**
   * Cleanup retry timers on shutdown
   */
  public cleanup(): void {
    for (const timeoutId of this.retryQueue.values()) {
      clearTimeout(timeoutId);
    }
    this.retryQueue.clear();
  }
}

export const webhookService = new WebhookService();
export default webhookService;