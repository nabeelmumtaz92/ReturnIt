/**
 * Rakuten Advertising Affiliate Network Connector
 * Docs: https://developers.rakutenadvertising.com/
 */

import { BaseConnector, AffiliateOffer, ConnectorConfig } from './BaseConnector';

interface RakutenConfig extends ConnectorConfig {
  clientId: string;
  clientSecret: string;
  scopeId: string;
}

export class RakutenConnector extends BaseConnector {
  private clientId: string;
  private clientSecret: string;
  private scopeId: string;
  private accessToken?: string;
  private tokenExpiry?: Date;
  private baseUrl = 'https://api.rakutenadvertising.com';
  
  constructor(config: RakutenConfig) {
    super('rakuten', config);
    
    if (!config.clientId || !config.clientSecret || !config.scopeId) {
      throw new Error('Rakuten requires clientId, clientSecret, and scopeId');
    }
    
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.scopeId = config.scopeId;
  }
  
  /**
   * Authenticate using OAuth 2.0
   */
  async authenticate(): Promise<boolean> {
    try {
      const tokenUrl = 'https://api.rakutenadvertising.com/token';
      
      const response = await this.makeRequest(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          scope: this.scopeId,
        }).toString(),
      });
      
      const data = await response.json();
      
      this.accessToken = data.access_token;
      // Tokens typically expire in 3600 seconds (1 hour)
      this.tokenExpiry = new Date(Date.now() + (data.expires_in || 3600) * 1000);
      
      return true;
    } catch (error) {
      console.error('[Rakuten] Authentication failed:', error);
      return false;
    }
  }
  
  /**
   * Validate credentials by attempting authentication
   */
  async validateCredentials(): Promise<boolean> {
    return await this.authenticate();
  }
  
  /**
   * Ensure we have a valid access token
   */
  private async ensureAuthenticated(): Promise<void> {
    if (!this.accessToken || !this.tokenExpiry || this.tokenExpiry < new Date()) {
      const authenticated = await this.authenticate();
      if (!authenticated) {
        throw new Error('Failed to authenticate with Rakuten');
      }
    }
  }
  
  /**
   * Fetch offers using Rakuten Coupon Feed API
   */
  async fetchOffers(options?: {
    category?: string;
    advertiser?: string;
    limit?: number;
    offset?: number;
  }): Promise<AffiliateOffer[]> {
    try {
      await this.ensureAuthenticated();
      
      // Use Coupon Feed API for promotional offers
      const url = `${this.baseUrl}/v1/couponfeed`;
      
      const queryParams = new URLSearchParams();
      if (options?.category) queryParams.append('category', options.category);
      if (options?.advertiser) queryParams.append('network', options.advertiser);
      if (options?.limit) queryParams.append('resultsperpage', options.limit.toString());
      if (options?.offset) {
        const page = Math.floor((options.offset || 0) / (options.limit || 100)) + 1;
        queryParams.append('pagenumber', page.toString());
      }
      
      const fullUrl = queryParams.toString() ? `${url}?${queryParams.toString()}` : url;
      
      const response = await this.makeRequest(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json',
        },
      });
      
      const data = await response.json();
      
      // Rakuten returns array of coupons/offers
      const offers = Array.isArray(data.coupons) ? data.coupons : 
                     Array.isArray(data.offers) ? data.offers : 
                     Array.isArray(data) ? data : [];
      
      return offers.map((offer: any) => this.normalizeOffer(offer));
    } catch (error) {
      this.handleError(error, 'fetchOffers');
    }
  }
  
  /**
   * Normalize Rakuten offer to standard format
   */
  protected normalizeOffer(rawOffer: any): AffiliateOffer {
    return {
      networkOfferId: rawOffer.offer_id?.toString() || rawOffer.id?.toString() || rawOffer.coupon_id?.toString(),
      network: 'rakuten',
      advertiserName: rawOffer.advertiser_name || rawOffer.merchant_name || 'Unknown',
      advertiserId: rawOffer.advertiser_id?.toString() || rawOffer.mid?.toString(),
      title: rawOffer.offer_description || rawOffer.title || rawOffer.coupon_title || 'No title',
      description: rawOffer.long_description || rawOffer.description || rawOffer.coupon_description || '',
      category: rawOffer.category || rawOffer.product_category,
      trackingUrl: rawOffer.click_url || rawOffer.tracking_url || rawOffer.link || '',
      imageUrl: rawOffer.creative_url || rawOffer.image_url,
      commissionRate: rawOffer.commission_rate ? parseFloat(rawOffer.commission_rate) : undefined,
      expiresAt: rawOffer.end_date ? new Date(rawOffer.end_date) : 
                 rawOffer.expiration_date ? new Date(rawOffer.expiration_date) : undefined,
      terms: rawOffer.terms_and_conditions || rawOffer.restrictions,
      couponCode: rawOffer.coupon_code || rawOffer.promo_code,
      isActive: rawOffer.status === 'active' || rawOffer.is_active === true,
      lastSyncedAt: new Date(),
    };
  }
  
  getRateLimits() {
    return {
      requestsPerMinute: 100,
      requestsPerDay: 25000,
    };
  }
}
