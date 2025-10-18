/**
 * CJ (Commission Junction) Affiliate Network Connector
 * Docs: https://developers.cj.com/
 */

import { BaseConnector, AffiliateOffer, ConnectorConfig } from './BaseConnector';

interface CJConfig extends ConnectorConfig {
  accessToken: string;
  publisherId: string; // PID for generating tracking links
}

export class CJConnector extends BaseConnector {
  private accessToken: string;
  private publisherId: string;
  private baseUrl = 'https://ads.api.cj.com/query';
  
  constructor(config: CJConfig) {
    super('cj', config);
    
    if (!config.accessToken || !config.publisherId) {
      throw new Error('CJ requires accessToken and publisherId');
    }
    
    this.accessToken = config.accessToken;
    this.publisherId = config.publisherId;
  }
  
  /**
   * CJ uses Personal Access Token - no separate auth step needed
   */
  async authenticate(): Promise<boolean> {
    return await this.validateCredentials();
  }
  
  /**
   * Validate credentials by making a test GraphQL query
   */
  async validateCredentials(): Promise<boolean> {
    try {
      // Simple test query to verify token works
      const testQuery = `{
        advertisers(forPublisher: "${this.publisherId}") {
          count
        }
      }`;
      
      const response = await this.makeRequest(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: testQuery }),
      });
      
      const data = await response.json();
      return !data.errors && data.data;
    } catch (error) {
      console.error('[CJ] Credential validation failed:', error);
      return false;
    }
  }
  
  /**
   * Fetch offers using CJ GraphQL Product Feed API
   */
  async fetchOffers(options?: {
    category?: string;
    advertiser?: string;
    limit?: number;
    offset?: number;
  }): Promise<AffiliateOffer[]> {
    try {
      // Build GraphQL query for product search
      const limit = options?.limit || 100;
      const offset = options?.offset || 0;
      
      // Construct filter conditions
      let filters = '';
      if (options?.advertiser) {
        filters += `advertiserId: "${options.advertiser}"`;
      }
      if (options?.category) {
        filters += filters ? `, category: "${options.category}"` : `category: "${options.category}"`;
      }
      
      const graphqlQuery = `{
        products(${filters ? `${filters}, ` : ''}first: ${limit}, offset: ${offset}) {
          totalCount
          resultList {
            advertiserId
            advertiserName
            catalogId
            id
            title
            description
            category
            price {
              amount
              currency
            }
            imageUrl
            linkCode(pid: "${this.publisherId}") {
              clickUrl
            }
            inStock
          }
        }
      }`;
      
      const response = await this.makeRequest(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: graphqlQuery }),
      });
      
      const data = await response.json();
      
      if (data.errors) {
        console.error('[CJ] GraphQL errors:', data.errors);
        return [];
      }
      
      const products = data.data?.products?.resultList || [];
      
      return products.map((product: any) => this.normalizeOffer(product));
    } catch (error) {
      this.handleError(error, 'fetchOffers');
    }
  }
  
  /**
   * Normalize CJ product to standard offer format
   */
  protected normalizeOffer(rawOffer: any): AffiliateOffer {
    return {
      networkOfferId: rawOffer.id?.toString() || rawOffer.catalogId?.toString(),
      network: 'cj',
      advertiserName: rawOffer.advertiserName || 'Unknown',
      advertiserId: rawOffer.advertiserId?.toString(),
      title: rawOffer.title || rawOffer.name || 'No title',
      description: rawOffer.description || '',
      category: rawOffer.category,
      trackingUrl: rawOffer.linkCode?.clickUrl || rawOffer.clickUrl || '',
      imageUrl: rawOffer.imageUrl || rawOffer.image,
      commissionRate: rawOffer.commissionRate ? parseFloat(rawOffer.commissionRate) : undefined,
      expiresAt: rawOffer.endDate ? new Date(rawOffer.endDate) : undefined,
      terms: rawOffer.terms,
      couponCode: rawOffer.couponCode,
      isActive: rawOffer.inStock !== false, // Assume active if in stock
      lastSyncedAt: new Date(),
    };
  }
  
  getRateLimits() {
    return {
      requestsPerMinute: 120,
      requestsPerDay: 10000,
    };
  }
}
