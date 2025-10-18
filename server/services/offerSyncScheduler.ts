/**
 * Offer Sync Scheduler
 * Runs offer sync every 4 hours automatically
 */

import { offerSyncService } from './offerSyncService';

const SYNC_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

class OfferSyncScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  
  /**
   * Start the scheduler
   */
  start() {
    if (this.intervalId) {
      console.log('[Offer Sync Scheduler] Already running');
      return;
    }
    
    console.log('[Offer Sync Scheduler] Starting with 4-hour interval');
    
    // Run immediately on start (optional - comment out if you don't want initial sync)
    this.runSync();
    
    // Schedule recurring sync every 4 hours
    this.intervalId = setInterval(() => {
      this.runSync();
    }, SYNC_INTERVAL);
    
    console.log('[Offer Sync Scheduler] Scheduled to run every 4 hours');
  }
  
  /**
   * Stop the scheduler
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[Offer Sync Scheduler] Stopped');
    }
  }
  
  /**
   * Run sync (with duplicate prevention)
   */
  private async runSync() {
    if (this.isRunning) {
      console.log('[Offer Sync Scheduler] Sync already in progress, skipping');
      return;
    }
    
    this.isRunning = true;
    
    try {
      console.log('[Offer Sync Scheduler] Starting scheduled sync...');
      const result = await offerSyncService.syncAllNetworks();
      
      console.log(`[Offer Sync Scheduler] Sync completed: ${result.totalOffersFetched} fetched, ${result.totalOffersInserted} inserted, ${result.totalOffersUpdated} updated, ${result.expiredOffersMarkedInactive} expired`);
      
      if (result.errors.length > 0) {
        console.error(`[Offer Sync Scheduler] Sync completed with ${result.errors.length} errors:`, result.errors);
      }
    } catch (error) {
      console.error('[Offer Sync Scheduler] Sync failed:', error);
    } finally {
      this.isRunning = false;
    }
  }
  
  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      running: !!this.intervalId,
      syncInProgress: this.isRunning,
      intervalMs: SYNC_INTERVAL,
      intervalHours: SYNC_INTERVAL / (60 * 60 * 1000),
    };
  }
}

// Export singleton instance
export const offerSyncScheduler = new OfferSyncScheduler();
