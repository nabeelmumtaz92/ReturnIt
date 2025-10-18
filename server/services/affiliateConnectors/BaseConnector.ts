/**
 * Base Affiliate Network Connector
 * Abstract class for all affiliate network API integrations
 */

export interface AffiliateOffer {
  // Unique identifier from the affiliate network
  networkOfferId: string;
  
  // Network source (impact, rakuten, cj, amazon, walmart)
  network: string;
  
  // Advertiser/brand information
  advertiserName: string;
  advertiserId?: string;
  
  // Offer details
  title: string;
  description: string;
  category?: string;
  
  // Link and tracking
  trackingUrl: string;
  imageUrl?: string;
  
  // Terms and dates
  commissionRate?: number; // Percentage
  expiresAt?: Date;
  terms?: string;
  
  // Coupon code (if applicable)
  couponCode?: string;
  
  // Metadata
  isActive: boolean;
  lastSyncedAt: Date;
}

export interface ConnectorConfig {
  apiKey?: string;
  apiSecret?: string;
  accountId?: string;
  affiliateId?: string;
  timeout?: number;
}

export abstract class BaseConnector {
  protected config: ConnectorConfig;
  protected networkName: string;
  
  constructor(networkName: string, config: ConnectorConfig) {
    this.networkName = networkName;
    this.config = {
      timeout: 30000, // 30 second default timeout
      ...config
    };
  }
  
  /**
   * Authenticate with the affiliate network
   * Returns true if authentication is successful
   */
  abstract authenticate(): Promise<boolean>;
  
  /**
   * Fetch available offers from the network
   * Returns normalized offer data
   */
  abstract fetchOffers(options?: {
    category?: string;
    advertiser?: string;
    limit?: number;
    offset?: number;
  }): Promise<AffiliateOffer[]>;
  
  /**
   * Validate API credentials
   */
  abstract validateCredentials(): Promise<boolean>;
  
  /**
   * Get network-specific rate limit information
   */
  getRateLimits(): { requestsPerMinute: number; requestsPerDay?: number } {
    // Default conservative rate limits
    return {
      requestsPerMinute: 60,
      requestsPerDay: 10000
    };
  }
  
  /**
   * Normalize offer data to our standard format
   */
  protected abstract normalizeOffer(rawOffer: any): AffiliateOffer;
  
  /**
   * Handle API errors consistently
   */
  protected handleError(error: any, context: string): never {
    console.error(`[${this.networkName}] Error in ${context}:`, error);
    throw new Error(`${this.networkName} API error: ${error.message || 'Unknown error'}`);
  }
  
  /**
   * Make HTTP request with timeout and error handling
   */
  protected async makeRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeout);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error: any) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.config.timeout}ms`);
      }
      throw error;
    }
  }
}
