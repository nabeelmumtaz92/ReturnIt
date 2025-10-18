/**
 * Amazon Associates Connector
 * Integrates with Amazon Product Advertising API 5.0
 * 
 * Setup:
 * 1. Sign up at https://affiliate-program.amazon.com/
 * 2. Complete 3 qualified sales to get API access
 * 3. Get credentials from https://webservices.amazon.com/paapi5/scratchpad/
 * 4. Set environment variables:
 *    - AMAZON_ACCESS_KEY (Public key)
 *    - AMAZON_SECRET_KEY (Secret key for signing)
 *    - AMAZON_PARTNER_TAG (Associate ID / Tracking ID)
 * 
 * API Documentation: https://webservices.amazon.com/paapi5/documentation/
 */

import crypto from 'crypto';
import { BaseConnector, type AffiliateOffer, type ConnectorConfig } from './BaseConnector';

interface AmazonConfig extends ConnectorConfig {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
  region?: string; // Default: 'us-east-1'
  host?: string; // Default: 'webservices.amazon.com'
}

export class AmazonAssociatesConnector extends BaseConnector {
  private accessKey: string;
  private secretKey: string;
  private partnerTag: string;
  private region: string;
  private host: string;
  private service = 'ProductAdvertisingAPI';
  
  constructor(config: AmazonConfig) {
    super('Amazon Associates', config);
    this.accessKey = config.accessKey;
    this.secretKey = config.secretKey;
    this.partnerTag = config.partnerTag;
    this.region = config.region || 'us-east-1';
    this.host = config.host || 'webservices.amazon.com';
  }
  
  /**
   * Authenticate with Amazon PA-API (validates credentials)
   */
  async authenticate(): Promise<boolean> {
    try {
      const offers = await this.internalFetchOffers({ keywords: 'test', limit: 1 });
      return offers.length >= 0; // Success even if no results
    } catch (error) {
      console.error('[Amazon Associates] Authentication failed:', error);
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
   * Fetch offers from Amazon Product Advertising API (BaseConnector interface)
   */
  async fetchOffers(options?: {
    category?: string;
    advertiser?: string;
    limit?: number;
    offset?: number;
  }): Promise<AffiliateOffer[]> {
    return this.internalFetchOffers({
      keywords: options?.category || 'all',
      brand: options?.advertiser,
      limit: options?.limit || 10
    });
  }
  
  /**
   * Internal fetch method with Amazon-specific parameters
   */
  private async internalFetchOffers(params: {
    keywords?: string;
    brand?: string;
    category?: string;
    limit?: number;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<AffiliateOffer[]> {
    const {
      keywords = 'all',
      brand,
      category,
      limit = 10,
      minPrice,
      maxPrice
    } = params;
    
    // Amazon PA-API 5.0 endpoint
    const endpoint = '/paapi5/searchitems';
    const target = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems';
    
    // Build request payload
    const payload: any = {
      PartnerTag: this.partnerTag,
      PartnerType: 'Associates',
      Keywords: keywords,
      ItemCount: Math.min(limit, 10), // Max 10 per request
      Resources: [
        'Images.Primary.Medium',
        'ItemInfo.Title',
        'ItemInfo.ByLineInfo',
        'Offers.Listings.Price'
      ]
    };
    
    // Add optional filters
    if (brand) payload.Brand = brand;
    if (category) payload.SearchIndex = category;
    if (minPrice) payload.MinPrice = minPrice * 100; // Convert to cents
    if (maxPrice) payload.MaxPrice = maxPrice * 100;
    
    const payloadString = JSON.stringify(payload);
    
    // Generate AWS Signature V4
    const headers = this.generateAWSSignature(endpoint, payloadString, target);
    
    try {
      const response = await fetch(`https://${this.host}${endpoint}`, {
        method: 'POST',
        headers,
        body: payloadString
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Amazon API error: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      
      // Parse and normalize offers
      return this.normalizeOffers(data);
      
    } catch (error) {
      console.error('[Amazon Associates] Fetch error:', error);
      throw error;
    }
  }
  
  /**
   * Generate AWS Signature Version 4 for authentication
   */
  private generateAWSSignature(
    endpoint: string,
    payload: string,
    target: string
  ): Record<string, string> {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, ''); // YYYYMMDDTHHMMSSZ
    const dateStamp = amzDate.slice(0, 8); // YYYYMMDD
    
    // Step 1: Create canonical request
    // Headers must be in alphabetical order and lowercase
    const canonicalHeaders = `content-encoding:amz-1.0\n` +
                            `content-type:application/json; charset=utf-8\n` +
                            `host:${this.host}\n` +
                            `x-amz-date:${amzDate}\n` +
                            `x-amz-target:${target}\n`;
    
    const signedHeaders = 'content-encoding;content-type;host;x-amz-date;x-amz-target';
    
    const payloadHash = crypto
      .createHash('sha256')
      .update(payload)
      .digest('hex');
    
    const canonicalRequest = `POST\n${endpoint}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
    
    // Step 2: Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${this.region}/${this.service}/aws4_request`;
    
    const canonicalRequestHash = crypto
      .createHash('sha256')
      .update(canonicalRequest)
      .digest('hex');
    
    const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${canonicalRequestHash}`;
    
    // Step 3: Calculate signature
    const kDate = crypto
      .createHmac('sha256', `AWS4${this.secretKey}`)
      .update(dateStamp)
      .digest();
    
    const kRegion = crypto
      .createHmac('sha256', kDate)
      .update(this.region)
      .digest();
    
    const kService = crypto
      .createHmac('sha256', kRegion)
      .update(this.service)
      .digest();
    
    const kSigning = crypto
      .createHmac('sha256', kService)
      .update('aws4_request')
      .digest();
    
    const signature = crypto
      .createHmac('sha256', kSigning)
      .update(stringToSign)
      .digest('hex');
    
    // Step 4: Build authorization header
    const authorizationHeader = 
      `${algorithm} Credential=${this.accessKey}/${credentialScope}, ` +
      `SignedHeaders=${signedHeaders}, Signature=${signature}`;
    
    // Note: Do NOT include 'Host' header in the returned object
    // Node.js Fetch sets it automatically and throws if you try to set it manually
    // Host is only needed in the canonical request for signing
    return {
      'Content-Encoding': 'amz-1.0',
      'Content-Type': 'application/json; charset=utf-8',
      'X-Amz-Date': amzDate,
      'X-Amz-Target': target,
      'Authorization': authorizationHeader
    };
  }
  
  /**
   * Normalize Amazon offers to standard format
   */
  private normalizeOffers(apiResponse: any): AffiliateOffer[] {
    const items = apiResponse?.SearchResult?.Items || [];
    
    return items.map((item: any) => this.normalizeOffer(item));
  }
  
  /**
   * Normalize single Amazon offer (BaseConnector interface)
   */
  protected normalizeOffer(item: any): AffiliateOffer {
    const price = item.Offers?.Listings?.[0]?.Price?.Amount;
    const brand = item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || 
                 item.ItemInfo?.ByLineInfo?.Manufacturer?.DisplayValue;
    
    return {
      networkOfferId: item.ASIN,
      network: 'amazon',
      advertiserName: brand || 'Amazon',
      advertiserId: undefined,
      title: item.ItemInfo?.Title?.DisplayValue || 'Amazon Product',
      description: item.ItemInfo?.Features?.DisplayValues?.join('. ') || '',
      trackingUrl: item.DetailPageURL, // Already includes partner tag
      imageUrl: item.Images?.Primary?.Medium?.URL,
      category: 'General', // Amazon doesn't return category in response
      commissionRate: this.estimateCommissionRate(item.ASIN), // Varies by category
      isActive: true,
      expiresAt: undefined, // Amazon links don't expire
      lastSyncedAt: new Date()
    };
  }
  
  /**
   * Estimate commission rate based on product category
   * Amazon commission rates: 1-10% depending on category
   * https://affiliate-program.amazon.com/help/operating/schedule
   */
  private estimateCommissionRate(asin: string): number {
    // Default to 3% (most common rate for general products)
    // In production, you'd map ASIN to category and use actual rates
    return 3.0;
  }
  
  /**
   * Get Amazon-specific rate limits
   */
  getRateLimits(): { requestsPerMinute: number; requestsPerDay?: number } {
    return {
      requestsPerMinute: 1, // Amazon PA-API: 1 request per second = 60/min
      requestsPerDay: 8640 // Automatically scales with usage
    };
  }
}
