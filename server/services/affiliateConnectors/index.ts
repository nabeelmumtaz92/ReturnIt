/**
 * Affiliate Network Connectors Index
 * Centralized export for all affiliate network integrations
 */

import { BaseConnector } from './BaseConnector';
import { ImpactConnector } from './ImpactConnector';
import { RakutenConnector } from './RakutenConnector';
import { CJConnector } from './CJConnector';
import { AmazonAssociatesConnector } from './AmazonAssociatesConnector';
import { WalmartAffiliatesConnector } from './WalmartAffiliatesConnector';

export { BaseConnector, type AffiliateOffer, type ConnectorConfig } from './BaseConnector';
export { ImpactConnector } from './ImpactConnector';
export { RakutenConnector } from './RakutenConnector';
export { CJConnector } from './CJConnector';
export { AmazonAssociatesConnector } from './AmazonAssociatesConnector';
export { WalmartAffiliatesConnector } from './WalmartAffiliatesConnector';

/**
 * Factory function to create connector instances from environment variables
 */
export function createConnectorFromEnv(network: 'impact' | 'rakuten' | 'cj' | 'amazon' | 'walmart'): BaseConnector | null {
  try {
    switch (network) {
      case 'impact':
        if (!process.env.IMPACT_ACCOUNT_SID || !process.env.IMPACT_AUTH_TOKEN) {
          console.warn('[Connector Factory] Impact.com credentials not found');
          return null;
        }
        return new ImpactConnector({
          accountSid: process.env.IMPACT_ACCOUNT_SID,
          authToken: process.env.IMPACT_AUTH_TOKEN,
        });
      
      case 'rakuten':
        if (!process.env.RAKUTEN_CLIENT_ID || !process.env.RAKUTEN_CLIENT_SECRET || !process.env.RAKUTEN_SCOPE_ID) {
          console.warn('[Connector Factory] Rakuten credentials not found');
          return null;
        }
        return new RakutenConnector({
          clientId: process.env.RAKUTEN_CLIENT_ID,
          clientSecret: process.env.RAKUTEN_CLIENT_SECRET,
          scopeId: process.env.RAKUTEN_SCOPE_ID,
        });
      
      case 'cj':
        if (!process.env.CJ_ACCESS_TOKEN || !process.env.CJ_PUBLISHER_ID) {
          console.warn('[Connector Factory] CJ credentials not found');
          return null;
        }
        return new CJConnector({
          accessToken: process.env.CJ_ACCESS_TOKEN,
          publisherId: process.env.CJ_PUBLISHER_ID,
        });
      
      case 'amazon':
        if (!process.env.AMAZON_ACCESS_KEY || !process.env.AMAZON_SECRET_KEY || !process.env.AMAZON_PARTNER_TAG) {
          console.warn('[Connector Factory] Amazon Associates credentials not found');
          return null;
        }
        return new AmazonAssociatesConnector({
          accessKey: process.env.AMAZON_ACCESS_KEY,
          secretKey: process.env.AMAZON_SECRET_KEY,
          partnerTag: process.env.AMAZON_PARTNER_TAG,
        });
      
      case 'walmart':
        if (!process.env.WALMART_CONSUMER_ID || !process.env.WALMART_PRIVATE_KEY) {
          console.warn('[Connector Factory] Walmart Affiliates credentials not found');
          return null;
        }
        
        // Handle base64-encoded private key
        let decodedKey = process.env.WALMART_PRIVATE_KEY;
        if (!decodedKey.includes('BEGIN RSA PRIVATE KEY')) {
          try {
            decodedKey = Buffer.from(decodedKey, 'base64').toString('utf-8');
          } catch (error) {
            console.error('[Connector Factory] Invalid Walmart private key format');
            return null;
          }
        }
        
        return new WalmartAffiliatesConnector({
          consumerId: process.env.WALMART_CONSUMER_ID,
          privateKey: decodedKey,
          keyVersion: process.env.WALMART_KEY_VERSION || '1',
        });
      
      default:
        console.warn(`[Connector Factory] Unknown network: ${network}`);
        return null;
    }
  } catch (error) {
    console.error(`[Connector Factory] Error creating ${network} connector:`, error);
    return null;
  }
}

/**
 * Get all configured connectors
 */
export function getAllConfiguredConnectors(): BaseConnector[] {
  const networks: ('impact' | 'rakuten' | 'cj' | 'amazon' | 'walmart')[] = [
    'impact', 
    'rakuten', 
    'cj', 
    'amazon', 
    'walmart'
  ];
  const connectors: BaseConnector[] = [];
  
  for (const network of networks) {
    const connector = createConnectorFromEnv(network);
    if (connector) {
      connectors.push(connector);
    }
  }
  
  return connectors;
}
