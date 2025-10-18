/**
 * Affiliate Network Connectors Index
 * Centralized export for all affiliate network integrations
 */

import { BaseConnector } from './BaseConnector';
import { ImpactConnector } from './ImpactConnector';
import { RakutenConnector } from './RakutenConnector';
import { CJConnector } from './CJConnector';

export { BaseConnector, type AffiliateOffer, type ConnectorConfig } from './BaseConnector';
export { ImpactConnector } from './ImpactConnector';
export { RakutenConnector } from './RakutenConnector';
export { CJConnector } from './CJConnector';

/**
 * Factory function to create connector instances from environment variables
 */
export function createConnectorFromEnv(network: 'impact' | 'rakuten' | 'cj'): BaseConnector | null {
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
  const networks: ('impact' | 'rakuten' | 'cj')[] = ['impact', 'rakuten', 'cj'];
  const connectors: BaseConnector[] = [];
  
  for (const network of networks) {
    const connector = createConnectorFromEnv(network);
    if (connector) {
      connectors.push(connector);
    }
  }
  
  return connectors;
}
