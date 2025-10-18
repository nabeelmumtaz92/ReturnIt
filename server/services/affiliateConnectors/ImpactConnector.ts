/**
 * Impact.com Affiliate Network Connector
 * Docs: https://integrations.impact.com/impact-publisher
 */

import { BaseConnector, AffiliateOffer, ConnectorConfig } from './BaseConnector';

interface ImpactConfig extends ConnectorConfig {
  accountSid: string;
  authToken: string;
}

export class ImpactConnector extends BaseConnector {
  private accountSid: string;
  private authToken: string;
  private baseUrl = 'https://api.impact.com';
  
  constructor(config: ImpactConfig) {
    super('impact', config);
    
    if (!config.accountSid || !config.authToken) {
      throw new Error('Impact.com requires accountSid and authToken');
    }
    
    this.accountSid = config.accountSid;
    this.authToken = config.authToken;
  }
  
  /**
   * Authenticate using HTTP Basic Auth
   */
  async authenticate(): Promise<boolean> {
    try {
      await this.validateCredentials();
      return true;
    } catch (error) {
      console.error('[Impact] Authentication failed:', error);
      return false;
    }
  }
  
  /**
   * Validate API credentials by making a test request
   */
  async validateCredentials(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/Mediapartners/${this.accountSid}/Accounts`;
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      
      const response = await this.makeRequest(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
        },
      });
      
      return response.ok;
    } catch (error) {
      this.handleError(error, 'validateCredentials');
    }
  }
  
  /**
   * Fetch list of available catalogs
   */
  private async getCatalogs(): Promise<any[]> {
    const url = `${this.baseUrl}/Mediapartners/${this.accountSid}/Catalogs`;
    const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
    
    const response = await this.makeRequest(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
    });
    
    const data = await response.json();
    return Array.isArray(data.Catalogs) ? data.Catalogs : [];
  }
  
  /**
   * Fetch offers from Impact.com Catalogs API
   * Note: Impact requires fetching items from specific catalog IDs
   */
  async fetchOffers(options?: {
    category?: string;
    advertiser?: string;
    limit?: number;
    offset?: number;
    catalogId?: string;
  }): Promise<AffiliateOffer[]> {
    try {
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      const limit = options?.limit || 100;
      const offset = options?.offset || 0;
      
      // Calculate 1-based page number
      const page = Math.floor(offset / limit) + 1;
      
      let allOffers: any[] = [];
      
      // If specific catalogId provided, fetch from that catalog only
      if (options?.catalogId) {
        const url = `${this.baseUrl}/Mediapartners/${this.accountSid}/Catalogs/${options.catalogId}/Items`;
        const queryParams = new URLSearchParams();
        queryParams.append('PageSize', limit.toString());
        queryParams.append('Page', page.toString());
        
        const fullUrl = `${url}?${queryParams.toString()}`;
        
        const response = await this.makeRequest(fullUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json',
          },
        });
        
        const data = await response.json();
        allOffers = Array.isArray(data.Items) ? data.Items : [];
      } else {
        // Multi-catalog fetching: only supports offset=0 (first page)
        if (offset > 0) {
          throw new Error('Impact connector requires catalogId parameter for paginated requests (offset > 0). Fetch catalogs first, then query specific catalogId.');
        }
        
        // Fetch all available catalogs first
        const catalogs = await this.getCatalogs();
        
        if (catalogs.length === 0) {
          console.warn('[Impact] No catalogs found for account');
          return [];
        }
        
        // Fetch items from each catalog (up to limit across all catalogs)
        const itemsPerCatalog = Math.ceil(limit / catalogs.length);
        
        for (const catalog of catalogs) {
          const catalogId = catalog.Id || catalog.CatalogId;
          if (!catalogId) continue;
          
          try {
            const url = `${this.baseUrl}/Mediapartners/${this.accountSid}/Catalogs/${catalogId}/Items`;
            const queryParams = new URLSearchParams();
            queryParams.append('PageSize', itemsPerCatalog.toString());
            queryParams.append('Page', '1'); // First page only for multi-catalog mode
            
            const fullUrl = `${url}?${queryParams.toString()}`;
            
            const response = await this.makeRequest(fullUrl, {
              method: 'GET',
              headers: {
                'Authorization': `Basic ${auth}`,
                'Accept': 'application/json',
              },
            });
            
            const data = await response.json();
            const items = Array.isArray(data.Items) ? data.Items : [];
            allOffers.push(...items);
            
            // Stop if we've reached the limit
            if (allOffers.length >= limit) {
              break;
            }
          } catch (error) {
            console.warn(`[Impact] Error fetching items from catalog ${catalogId}:`, error);
            // Continue with other catalogs
          }
        }
        
        // Trim to requested limit
        allOffers = allOffers.slice(0, limit);
      }
      
      return allOffers.map((offer: any) => this.normalizeOffer(offer));
    } catch (error) {
      this.handleError(error, 'fetchOffers');
    }
  }
  
  /**
   * Normalize Impact.com offer to standard format
   */
  protected normalizeOffer(rawOffer: any): AffiliateOffer {
    return {
      networkOfferId: rawOffer.Id?.toString() || rawOffer.CatalogItemId?.toString(),
      network: 'impact',
      advertiserName: rawOffer.AdvertiserName || rawOffer.CampaignName || 'Unknown',
      advertiserId: rawOffer.CampaignId?.toString(),
      title: rawOffer.Name || rawOffer.ProductName || 'No title',
      description: rawOffer.Description || rawOffer.ProductDescription || '',
      category: rawOffer.Category || rawOffer.CategoryName,
      trackingUrl: rawOffer.TrackingLink || rawOffer.ClickUrl || '',
      imageUrl: rawOffer.ImageUrl || rawOffer.ImageLink,
      commissionRate: rawOffer.CommissionRate ? parseFloat(rawOffer.CommissionRate) : undefined,
      expiresAt: rawOffer.EndDate ? new Date(rawOffer.EndDate) : undefined,
      terms: rawOffer.Terms,
      couponCode: rawOffer.PromoCode,
      isActive: rawOffer.Status === 'Active' || rawOffer.IsActive === true,
      lastSyncedAt: new Date(),
    };
  }
  
  getRateLimits() {
    return {
      requestsPerMinute: 120,
      requestsPerDay: 50000,
    };
  }
}
