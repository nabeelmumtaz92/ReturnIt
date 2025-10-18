/**
 * Walmart Affiliates Connector
 * Integrates with Walmart Affiliates API via walmart.io
 * 
 * Setup:
 * 1. Sign up at https://affiliates.walmart.com/
 * 2. Generate RSA key pair:
 *    openssl genrsa -out privateKey.pem 2048
 *    openssl rsa -in privateKey.pem -pubout -out publicKey.pem
 * 3. Upload public key at https://walmart.io/ → Applications
 * 4. Set environment variables:
 *    - WALMART_CONSUMER_ID (from walmart.io dashboard)
 *    - WALMART_PRIVATE_KEY (contents of privateKey.pem - base64 or raw)
 *    - WALMART_KEY_VERSION (usually "1")
 * 
 * API Documentation: https://walmart.io/docs/affiliates/v1/affiliate-marketing-api
 */

import crypto from 'crypto';
import { BaseConnector, type AffiliateOffer, type ConnectorConfig } from './BaseConnector';

interface WalmartConfig extends ConnectorConfig {
  consumerId: string;
  privateKey: string;
  keyVersion: string;
}

export class WalmartAffiliatesConnector extends BaseConnector {
  private consumerId: string;
  private privateKey: string;
  private keyVersion: string;
  private baseUrl = 'https://developer.api.walmart.com/api-proxy/service/affil/product/v2';
  
  constructor(config: WalmartConfig) {
    super('Walmart Affiliates', config);
    this.consumerId = config.consumerId;
    this.privateKey = config.privateKey;
    this.keyVersion = config.keyVersion;
  }
  
  /**
   * Authenticate with Walmart API (validates credentials)
   */
  async authenticate(): Promise<boolean> {
    try {
      const offers = await this.fetchOffers({ category: 'all', limit: 1 });
      return offers.length >= 0; // Success even if no results
    } catch (error) {
      console.error('[Walmart Affiliates] Authentication failed:', error);
      return false;
    }
  }
  
  /**
   * Validate API credentials
   */
  async validateCredentials(): Promise<boolean> {
    return this.authenticate();
  }
  
  /**
   * Fetch offers from Walmart Affiliates API (BaseConnector interface)
   */
  async fetchOffers(options?: {
    category?: string;
    advertiser?: string;
    limit?: number;
    offset?: number;
  }): Promise<AffiliateOffer[]> {
    const {
      category = 'all',
      advertiser,
      limit = 25,
      offset = 0
    } = options || {};
    
    const page = Math.floor(offset / limit) + 1;
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (advertiser) {
      queryParams.append('query', advertiser);
    }
    queryParams.append('categoryId', category);
    queryParams.append('count', limit.toString());
    queryParams.append('start', ((page - 1) * limit + 1).toString());
    queryParams.append('format', 'json');
    
    const endpoint = `/items?${queryParams.toString()}`;
    
    try {
      const headers = this.generateWalmartHeaders();
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Walmart API error: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      
      // Parse and normalize offers
      return this.normalizeOffers(data);
      
    } catch (error) {
      console.error('[Walmart Affiliates] Fetch error:', error);
      throw error;
    }
  }
  
  /**
   * Generate Walmart authentication headers using RSA signature
   */
  private generateWalmartHeaders(): Record<string, string> {
    const timestamp = Date.now().toString();
    
    // Create signature string
    const sortedHashString = `${this.consumerId}\n${timestamp}\n${this.keyVersion}\n`;
    
    // Sign with private key
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(sortedHashString);
    sign.end();
    
    const signature = sign.sign(this.privateKey, 'base64');
    
    return {
      'WM_SEC.AUTH_SIGNATURE': signature,
      'WM_CONSUMER.INTIMESTAMP': timestamp,
      'WM_CONSUMER.ID': this.consumerId,
      'WM_SEC.KEY_VERSION': this.keyVersion,
      'Accept': 'application/json'
    };
  }
  
  /**
   * Normalize Walmart offers to standard format
   */
  private normalizeOffers(apiResponse: any): AffiliateOffer[] {
    const items = apiResponse?.items || [];
    
    return items.map((item: any) => this.normalizeOffer(item));
  }
  
  /**
   * Normalize single Walmart offer (BaseConnector interface)
   */
  protected normalizeOffer(item: any): AffiliateOffer {
    return {
      networkOfferId: item.itemId?.toString() || '',
      network: 'walmart',
      advertiserName: item.brandName || 'Walmart',
      advertiserId: undefined,
      title: item.name || 'Walmart Product',
      description: item.shortDescription || item.longDescription || '',
      trackingUrl: item.affiliateAddToCartUrl || item.productUrl || '',
      imageUrl: item.largeImage || item.mediumImage || item.thumbnailImage,
      category: this.extractCategory(item.categoryPath),
      commissionRate: 4.0, // Walmart standard affiliate rate
      isActive: item.stock === 'Available',
      expiresAt: undefined, // Walmart affiliate links don't expire
      lastSyncedAt: new Date()
    };
  }
  
  /**
   * Extract primary category from category path
   */
  private extractCategory(categoryPath?: string): string {
    if (!categoryPath) return 'General';
    
    // Category path is like "Electronics/Computers/Laptops"
    const parts = categoryPath.split('/');
    return parts[0] || 'General';
  }
  
  /**
   * Get Walmart-specific rate limits
   */
  getRateLimits(): { requestsPerMinute: number; requestsPerDay?: number } {
    return {
      requestsPerMinute: 60, // Standard API rate limit
      requestsPerDay: 5000 // Generous daily limit
    };
  }
}
