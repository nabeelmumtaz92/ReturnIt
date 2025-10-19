import { storage } from './storage';
import { emailNotificationService } from './email-notifications';

class DailyStatsScheduler {
  private schedulerInterval: NodeJS.Timeout | null = null;
  private readonly ADMIN_EMAIL = 'admin@returnit.online'; // Default admin email
  private readonly SCHEDULE_HOUR = 8; // 8 AM CST
  
  /**
   * Start the daily stats scheduler
   */
  start() {
    console.log('📅 Starting daily stats scheduler...');
    
    // Run immediately on startup for testing (commented out for production)
    // this.sendDailyStats();
    
    // Check every hour if it's time to send the email
    this.schedulerInterval = setInterval(() => {
      this.checkAndSendStats();
    }, 60 * 60 * 1000); // Check every hour
    
    console.log(`✅ Daily stats scheduler started - will send at ${this.SCHEDULE_HOUR}:00 AM CST`);
  }
  
  /**
   * Stop the scheduler
   */
  stop() {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
      console.log('🛑 Daily stats scheduler stopped');
    }
  }
  
  /**
   * Check if it's time to send stats and send if needed
   */
  private async checkAndSendStats() {
    const now = new Date();
    const cstHour = this.getCSTHour(now);
    
    // Send at 8 AM CST
    if (cstHour === this.SCHEDULE_HOUR) {
      // Check if we already sent today
      const lastSentKey = 'daily_stats_last_sent';
      const today = now.toISOString().split('T')[0];
      
      // Use a simple in-memory check (in production, use database or Redis)
      if ((global as any)[lastSentKey] === today) {
        return; // Already sent today
      }
      
      await this.sendDailyStats();
      (global as any)[lastSentKey] = today;
    }
  }
  
  /**
   * Get current hour in CST timezone
   */
  private getCSTHour(date: Date): number {
    // CST is UTC-6 (or UTC-5 during daylight saving)
    // For simplicity, using UTC-6
    const utcHour = date.getUTCHours();
    let cstHour = utcHour - 6;
    if (cstHour < 0) cstHour += 24;
    return cstHour;
  }
  
  /**
   * Calculate and send daily stats
   */
  async sendDailyStats() {
    try {
      console.log('📊 Calculating daily stats for email...');
      
      // Get yesterday's date range
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setHours(23, 59, 59, 999);
      
      // Get all orders
      const allOrders = await storage.getAllOrders();
      
      // Filter orders from yesterday
      const yesterdayOrders = allOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= yesterday && orderDate <= yesterdayEnd;
      });
      
      // Calculate stats
      const totalOrders = yesterdayOrders.length;
      const completedOrders = yesterdayOrders.filter(
        order => order.status === 'delivered_to_store' || order.status === 'completed'
      ).length;
      
      // Calculate revenue
      let totalRevenue = 0;
      yesterdayOrders.forEach(order => {
        if (order.totalPrice) {
          totalRevenue += order.totalPrice;
        }
      });
      
      // Calculate payouts (70/30 split)
      const driverPayouts = totalRevenue * 0.70;
      const platformRevenue = totalRevenue * 0.30;
      
      // Get active drivers count
      const allDrivers = await storage.getDrivers();
      const activeDrivers = allDrivers.filter(driver => {
        return yesterdayOrders.some(order => order.driverId === driver.id);
      }).length;
      
      // Format date
      const dateStr = yesterday.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Send email
      await emailNotificationService.sendDailyStatsSummary({
        totalOrders,
        completedOrders,
        totalRevenue,
        driverPayouts,
        platformRevenue,
        activeDrivers,
        date: dateStr
      }, this.ADMIN_EMAIL);
      
      console.log(`✅ Daily stats email sent successfully for ${dateStr}`);
      console.log(`   Orders: ${totalOrders}, Completed: ${completedOrders}, Revenue: $${totalRevenue.toFixed(2)}`);
      
    } catch (error) {
      console.error('❌ Failed to send daily stats email:', error);
    }
  }
  
  /**
   * Manually trigger daily stats email (for testing)
   */
  async triggerManual() {
    console.log('🔧 Manually triggering daily stats email...');
    await this.sendDailyStats();
  }
}

// Export singleton instance
export const dailyStatsScheduler = new DailyStatsScheduler();
