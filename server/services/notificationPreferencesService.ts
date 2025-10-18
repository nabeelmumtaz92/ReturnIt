import { db } from "../db";
import { userNotificationPreferences } from "@shared/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface NotificationPreferences {
  enableInApp: boolean;
  enablePush: boolean;
  enableEmail: boolean;
}

export class NotificationPreferencesService {
  /**
   * Get user's notification preferences
   * Auto-creates with defaults if doesn't exist
   */
  async getPreferences(userId: number): Promise<any> {
    let prefs = await db.query.userNotificationPreferences.findFirst({
      where: eq(userNotificationPreferences.userId, userId)
    });

    // Create default preferences if they don't exist
    if (!prefs) {
      const [newPrefs] = await db.insert(userNotificationPreferences).values({
        userId,
        enableInApp: true,  // Always on (can't be disabled)
        enablePush: true,   // Default opt-in
        enableEmail: true,  // Default opt-in
        unsubscribeToken: nanoid(32), // Generate unique token for email unsubscribe
      }).returning();
      
      prefs = newPrefs;
    }

    return prefs;
  }

  /**
   * Update user's notification preferences
   */
  async updatePreferences(
    userId: number, 
    updates: Partial<NotificationPreferences>
  ): Promise<any> {
    // Ensure preferences exist
    await this.getPreferences(userId);

    // Hard-guard: Never allow in-app notifications to be disabled
    const safeUpdates = { ...updates };
    if ('enableInApp' in safeUpdates) {
      delete safeUpdates.enableInApp;
      console.warn(`Attempt to modify enableInApp for user ${userId} was blocked`);
    }

    // Update preferences
    const [updated] = await db.update(userNotificationPreferences)
      .set({
        ...safeUpdates,
        updatedAt: new Date(),
      })
      .where(eq(userNotificationPreferences.userId, userId))
      .returning();

    return updated;
  }

  /**
   * Handle email unsubscribe via token
   * Used for CAN-SPAM compliance
   */
  async unsubscribeByToken(token: string, reason?: string): Promise<boolean> {
    const [updated] = await db.update(userNotificationPreferences)
      .set({
        enableEmail: false,
        unsubscribedAt: new Date(),
        unsubscribeReason: reason || "User clicked unsubscribe link",
        updatedAt: new Date(),
      })
      .where(eq(userNotificationPreferences.unsubscribeToken, token))
      .returning();

    // Log failed unsubscribe attempts for monitoring
    if (!updated) {
      console.warn(`Failed unsubscribe attempt with token: ${token.substring(0, 8)}... (possible abuse)`);
    }

    return !!updated;
  }

  /**
   * Get preferences by unsubscribe token
   * Used to display unsubscribe confirmation page
   */
  async getPreferencesByToken(token: string): Promise<any> {
    return await db.query.userNotificationPreferences.findFirst({
      where: eq(userNotificationPreferences.unsubscribeToken, token)
    });
  }

  /**
   * Check if user can receive emails
   * Returns false if user has unsubscribed
   */
  async canSendEmail(userId: number): Promise<boolean> {
    const prefs = await this.getPreferences(userId);
    return prefs.enableEmail;
  }

  /**
   * Check if user can receive push notifications
   */
  async canSendPush(userId: number): Promise<boolean> {
    const prefs = await this.getPreferences(userId);
    return prefs.enablePush;
  }

  /**
   * Get notification channels available for a user
   * Returns array of channels: ['in_app', 'push', 'email']
   */
  async getAvailableChannels(userId: number): Promise<string[]> {
    const prefs = await this.getPreferences(userId);
    const channels: string[] = [];

    // In-app is always available
    channels.push('in_app');

    if (prefs.enablePush) {
      channels.push('push');
    }

    if (prefs.enableEmail) {
      channels.push('email');
    }

    return channels;
  }

  /**
   * Re-subscribe to emails after unsubscribing
   */
  async resubscribeEmail(userId: number): Promise<any> {
    const [updated] = await db.update(userNotificationPreferences)
      .set({
        enableEmail: true,
        unsubscribedAt: null,
        unsubscribeReason: null,
        updatedAt: new Date(),
      })
      .where(eq(userNotificationPreferences.userId, userId))
      .returning();

    return updated;
  }
}

// Export singleton instance
export const notificationPreferencesService = new NotificationPreferencesService();
