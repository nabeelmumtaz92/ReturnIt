/**
 * Offer Sync Service
 * Syncs affiliate offers from all configured networks into the database
 * Auto-approves all offers (status='active') unless manually paused
 */

import { db } from '../db';
import { partnerOffers } from '@shared/schema';
import { getAllConfiguredConnectors, type AffiliateOffer } from './affiliateConnectors';
import { eq, and, sql } from 'drizzle-orm';

export interface SyncResult {
  network: string;
  success: boolean;
  offersFetched: number;
  offersInserted: number;
  offersUpdated: number;
  error?: string;
  duration: number;
}

export interface SyncSummary {
  startTime: Date;
  endTime: Date;
  totalDuration: number;
  totalOffersFetched: number;
  totalOffersInserted: number;
  totalOffersUpdated: number;
  expiredOffersMarkedInactive: number;
  results: SyncResult[];
  errors: string[];
}

export class OfferSyncService {
  /**
   * Sync offers from all configured affiliate networks
   */
  async syncAllNetworks(): Promise<SyncSummary> {
    const startTime = new Date();
    const results: SyncResult[] = [];
    const errors: string[] = [];
    
    let totalOffersFetched = 0;
    let totalOffersInserted = 0;
    let totalOffersUpdated = 0;
    
    console.log('[Offer Sync] Starting sync from all configured networks...');
    
    try {
      // Get all configured connectors
      const connectors = getAllConfiguredConnectors();
      
      if (connectors.length === 0) {
        const message = 'No affiliate network connectors configured. Add API credentials to environment variables.';
        console.warn(`[Offer Sync] ${message}`);
        errors.push(message);
      }
      
      // Sync from each network
      for (const connector of connectors) {
        try {
          const result = await this.syncFromNetwork(connector);
          results.push(result);
          
          if (result.success) {
            totalOffersFetched += result.offersFetched;
            totalOffersInserted += result.offersInserted;
            totalOffersUpdated += result.offersUpdated;
          } else if (result.error) {
            errors.push(result.error);
          }
        } catch (error: any) {
          const errorMessage = `Failed to sync from ${connector.constructor.name}: ${error.message}`;
          console.error(`[Offer Sync] ${errorMessage}`);
          errors.push(errorMessage);
        }
      }
      
      // Mark expired offers as inactive
      const expiredCount = await this.markExpiredOffersInactive();
      
      const endTime = new Date();
      const totalDuration = endTime.getTime() - startTime.getTime();
      
      console.log(`[Offer Sync] Sync complete. Duration: ${totalDuration}ms, Fetched: ${totalOffersFetched}, Inserted: ${totalOffersInserted}, Updated: ${totalOffersUpdated}, Expired: ${expiredCount}`);
      
      return {
        startTime,
        endTime,
        totalDuration,
        totalOffersFetched,
        totalOffersInserted,
        totalOffersUpdated,
        expiredOffersMarkedInactive: expiredCount,
        results,
        errors,
      };
    } catch (error: any) {
      console.error('[Offer Sync] Fatal error during sync:', error);
      errors.push(`Fatal sync error: ${error.message}`);
      
      return {
        startTime,
        endTime: new Date(),
        totalDuration: Date.now() - startTime.getTime(),
        totalOffersFetched,
        totalOffersInserted,
        totalOffersUpdated,
        expiredOffersMarkedInactive: 0,
        results,
        errors,
      };
    }
  }
  
  /**
   * Sync offers from a specific network connector
   */
  private async syncFromNetwork(connector: any): Promise<SyncResult> {
    const startTime = Date.now();
    const networkName = this.getNetworkName(connector);
    
    console.log(`[Offer Sync] Syncing from ${networkName}...`);
    
    try {
      // Authenticate
      const authenticated = await connector.authenticate();
      if (!authenticated) {
        return {
          network: networkName,
          success: false,
          offersFetched: 0,
          offersInserted: 0,
          offersUpdated: 0,
          error: `Authentication failed for ${networkName}`,
          duration: Date.now() - startTime,
        };
      }
      
      // Fetch offers (limit to 500 per network to respect rate limits)
      const offers = await connector.fetchOffers({ limit: 500 });
      
      console.log(`[Offer Sync] Fetched ${offers.length} offers from ${networkName}`);
      
      // Upsert offers into database
      let inserted = 0;
      let updated = 0;
      
      for (const offer of offers) {
        const result = await this.upsertOffer(offer);
        if (result === 'inserted') inserted++;
        else if (result === 'updated') updated++;
      }
      
      return {
        network: networkName,
        success: true,
        offersFetched: offers.length,
        offersInserted: inserted,
        offersUpdated: updated,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      const errorMessage = `${networkName} sync failed: ${error.message}`;
      console.error(`[Offer Sync] ${errorMessage}`);
      
      return {
        network: networkName,
        success: false,
        offersFetched: 0,
        offersInserted: 0,
        offersUpdated: 0,
        error: errorMessage,
        duration: Date.now() - startTime,
      };
    }
  }
  
  /**
   * Upsert a single offer into the database
   * Auto-approves by setting status='active'
   */
  private async upsertOffer(offer: AffiliateOffer): Promise<'inserted' | 'updated' | 'skipped'> {
    try {
      // Check if offer already exists
      const existing = await db.query.partnerOffers.findFirst({
        where: and(
          eq(partnerOffers.network, offer.network),
          eq(partnerOffers.networkOfferId, offer.networkOfferId)
        ),
      });
      
      const offerData = {
        network: offer.network,
        networkOfferId: offer.networkOfferId,
        brand: offer.advertiserName, // Map advertiserName to brand
        category: offer.category,
        title: offer.title,
        description: offer.description || '',
        couponCode: offer.couponCode,
        affiliateLink: offer.trackingUrl, // Map trackingUrl to affiliateLink
        imageUrl: offer.imageUrl,
        validFrom: new Date(), // Set to now if not provided
        validTo: offer.expiresAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Default 90 days if not provided
        commissionRate: offer.commissionRate ? offer.commissionRate.toString() : null,
        autoSyncedAt: new Date(), // Last sync timestamp
      };
      
      if (existing) {
        // Update existing offer
        // CRITICAL: Preserve manual admin pauses - never overwrite if pausedBy is set
        const shouldPreserveStatus = existing.pausedBy !== null; // Manual pause by admin
        
        await db.update(partnerOffers)
          .set({
            ...offerData,
            updatedAt: new Date(),
            // Only update status if NOT manually paused by admin
            status: shouldPreserveStatus 
              ? existing.status // Preserve admin's manual pause
              : (offer.isActive && (!offer.expiresAt || offer.expiresAt > new Date()) 
                  ? 'active' 
                  : 'paused'),
          })
          .where(eq(partnerOffers.id, existing.id));
        
        return 'updated';
      } else {
        // Insert new offer - auto-approve by setting status='active'
        await db.insert(partnerOffers).values({
          ...offerData,
          status: 'active', // Auto-approval
          priority: 0, // Default priority
        });
        
        return 'inserted';
      }
    } catch (error: any) {
      // Handle unique constraint violations gracefully
      if (error.code === '23505') { // PostgreSQL unique violation
        console.warn(`[Offer Sync] Duplicate offer detected: ${offer.network}/${offer.networkOfferId}`);
        return 'skipped';
      }
      
      console.error('[Offer Sync] Error upserting offer:', error);
      throw error;
    }
  }
  
  /**
   * Mark all expired offers as inactive
   */
  private async markExpiredOffersInactive(): Promise<number> {
    try {
      const result = await db.update(partnerOffers)
        .set({ 
          status: 'paused',
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(partnerOffers.status, 'active'),
            sql`${partnerOffers.validTo} < NOW()`
          )
        )
        .returning({ id: partnerOffers.id });
      
      const count = result.length;
      
      if (count > 0) {
        console.log(`[Offer Sync] Marked ${count} expired offers as inactive`);
      }
      
      return count;
    } catch (error: any) {
      console.error('[Offer Sync] Error marking expired offers:', error);
      return 0;
    }
  }
  
  /**
   * Get network name from connector instance
   */
  private getNetworkName(connector: any): string {
    const className = connector.constructor.name;
    
    // Extract network name from class name (e.g., "ImpactConnector" -> "impact")
    return className.replace('Connector', '').toLowerCase();
  }
  
  /**
   * Get sync statistics from database
   */
  async getSyncStats(): Promise<{
    totalOffers: number;
    activeOffers: number;
    pausedOffers: number;
    byNetwork: { network: string; count: number }[];
    lastSyncedAt?: Date;
  }> {
    try {
      // Get total counts
      const all = await db.query.partnerOffers.findMany();
      const active = all.filter((o: any) => o.status === 'active');
      const paused = all.filter((o: any) => o.status === 'paused');
      
      // Count by network
      const byNetwork = all.reduce((acc: any, offer: any) => {
        const existing = acc.find((n: any) => n.network === offer.network);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ network: offer.network, count: 1 });
        }
        return acc;
      }, [] as { network: string; count: number }[]);
      
      // Get last sync time
      const lastSynced = all.reduce((latest: any, offer: any) => {
        if (!offer.autoSyncedAt) return latest;
        if (!latest || offer.autoSyncedAt > latest) return offer.autoSyncedAt;
        return latest;
      }, null as Date | null);
      
      return {
        totalOffers: all.length,
        activeOffers: active.length,
        pausedOffers: paused.length,
        byNetwork,
        lastSyncedAt: lastSynced || undefined,
      };
    } catch (error) {
      console.error('[Offer Sync] Error getting stats:', error);
      return {
        totalOffers: 0,
        activeOffers: 0,
        pausedOffers: 0,
        byNetwork: [],
      };
    }
  }
}

// Export singleton instance
export const offerSyncService = new OfferSyncService();
