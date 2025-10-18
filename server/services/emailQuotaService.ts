import { db } from "../db";
import { emailQuotaTracker } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface QuotaStatus {
  canSendEmail: boolean;
  emailsSentToday: number;
  emailsSentMonth: number;
  quotaDaily: number;
  quotaMonthly: number;
  remainingToday: number;
  remainingMonth: number;
  isPaused: boolean;
  pauseReason?: string;
}

export class EmailQuotaService {
  /**
   * Check if we can send an email based on current quota limits
   * Auto-creates today's record if it doesn't exist
   * Auto-resets daily/monthly counters if needed
   */
  async canSendEmail(): Promise<boolean> {
    const status = await this.getQuotaStatus();
    return status.canSendEmail;
  }

  /**
   * Get current quota status with auto-reset logic
   */
  async getQuotaStatus(): Promise<QuotaStatus> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    // Try to get or create today's record
    let record = await db.query.emailQuotaTracker.findFirst({
      where: eq(emailQuotaTracker.date, today)
    });

    if (!record) {
      // Get yesterday's record to carry over monthly count
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayRecord = await db.query.emailQuotaTracker.findFirst({
        where: eq(emailQuotaTracker.date, yesterday)
      });

      // Determine if we need to reset monthly count
      const emailsSentMonth = 
        yesterdayRecord && yesterdayRecord.month === currentMonth 
          ? yesterdayRecord.emailsSentMonth 
          : 0;

      // Create today's record
      const [newRecord] = await db.insert(emailQuotaTracker).values({
        date: today,
        month: currentMonth,
        emailsSentToday: 0,
        emailsSentMonth,
        quotaDaily: 100,
        quotaMonthly: 3000,
        safetyBuffer: 5,
        isPaused: false,
      }).returning();

      record = newRecord;
    }

    // Calculate remaining quota with safety buffer (95% of total quota)
    // This ensures we stop at 95/100 daily and 2,850/3,000 monthly regardless of safetyBuffer value
    const SAFETY_PERCENTAGE = 0.95; // Stop at 95% to prevent overruns
    const effectiveDailyLimit = Math.floor(record.quotaDaily * SAFETY_PERCENTAGE);
    const effectiveMonthlyLimit = Math.floor(record.quotaMonthly * SAFETY_PERCENTAGE);

    const remainingToday = Math.max(0, effectiveDailyLimit - record.emailsSentToday);
    const remainingMonth = Math.max(0, effectiveMonthlyLimit - record.emailsSentMonth);

    // Can send if: not paused AND within daily limit AND within monthly limit
    const canSendEmail = 
      !record.isPaused && 
      record.emailsSentToday < effectiveDailyLimit && 
      record.emailsSentMonth < effectiveMonthlyLimit;

    return {
      canSendEmail,
      emailsSentToday: record.emailsSentToday,
      emailsSentMonth: record.emailsSentMonth,
      quotaDaily: record.quotaDaily,
      quotaMonthly: record.quotaMonthly,
      remainingToday,
      remainingMonth,
      isPaused: record.isPaused,
      pauseReason: record.pauseReason || undefined,
    };
  }

  /**
   * Increment email count after successfully sending an email
   * Auto-pauses if we hit the safety buffer limit
   */
  async incrementEmailCount(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update counters
    await db.update(emailQuotaTracker)
      .set({
        emailsSentToday: sql`${emailQuotaTracker.emailsSentToday} + 1`,
        emailsSentMonth: sql`${emailQuotaTracker.emailsSentMonth} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(emailQuotaTracker.date, today));

    // Check if we need to auto-pause
    const status = await this.getQuotaStatus();
    if (!status.canSendEmail && !status.isPaused) {
      await this.autoPause("Daily or monthly quota limit reached (safety buffer)");
    }
  }

  /**
   * Auto-pause email sending when quota is reached
   */
  private async autoPause(reason: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await db.update(emailQuotaTracker)
      .set({
        isPaused: true,
        pausedAt: new Date(),
        pauseReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(emailQuotaTracker.date, today));
  }

  /**
   * Manually pause email sending (admin control)
   */
  async manualPause(adminId: number, reason: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await db.update(emailQuotaTracker)
      .set({
        isPaused: true,
        pausedAt: new Date(),
        pauseReason: reason,
        manuallyPausedBy: adminId,
        updatedAt: new Date(),
      })
      .where(eq(emailQuotaTracker.date, today));
  }

  /**
   * Manually unpause email sending (admin control)
   */
  async manualUnpause(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await db.update(emailQuotaTracker)
      .set({
        isPaused: false,
        pausedAt: null,
        pauseReason: null,
        manuallyPausedBy: null,
        updatedAt: new Date(),
      })
      .where(eq(emailQuotaTracker.date, today));
  }

  /**
   * Update quota limits (admin control)
   */
  async updateQuotaLimits(
    dailyLimit?: number, 
    monthlyLimit?: number, 
    safetyBuffer?: number
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updates: any = { updatedAt: new Date() };
    if (dailyLimit !== undefined) updates.quotaDaily = dailyLimit;
    if (monthlyLimit !== undefined) updates.quotaMonthly = monthlyLimit;
    if (safetyBuffer !== undefined) updates.safetyBuffer = safetyBuffer;

    await db.update(emailQuotaTracker)
      .set(updates)
      .where(eq(emailQuotaTracker.date, today));
  }

  /**
   * Get historical quota data for analytics (last 30 days)
   */
  async getHistoricalData(days: number = 30): Promise<any[]> {
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    const records = await db.query.emailQuotaTracker.findMany({
      where: sql`${emailQuotaTracker.date} >= ${startDate} AND ${emailQuotaTracker.date} <= ${endDate}`,
      orderBy: (table, { desc }) => [desc(table.date)],
    });

    return records;
  }
}

// Export singleton instance
export const emailQuotaService = new EmailQuotaService();
