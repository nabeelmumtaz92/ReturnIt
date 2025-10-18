/**
 * Engagement Service
 * 
 * Handles post-return engagement events and triggers offer distribution
 * when a driver marks a return as complete.
 */

import { db } from '../db';
import { partnerOffers, engagementPrompts, type PartnerOffer } from '@shared/schema';
import { eq, and, or, gt, isNull, desc, sql } from 'drizzle-orm';

export interface ReturnCompletedEvent {
  orderId: string;
  userId: number;
  brand?: string;
  category?: string;
  retailerName?: string;
  completedAt: Date;
}

interface MatchedOffer extends PartnerOffer {
  matchType: 'brand' | 'category' | 'generic';
}

export class EngagementService {
  // URL whitelist for affiliate links (security)
  private readonly ALLOWED_DOMAINS = [
    'amazon.com',
    'walmart.com',
    'impact.com',
    'rakuten.com',
    'cj.com',
    'jdoqocy.com', // CJ redirect domain
    'anrdoezrs.net', // CJ redirect domain
    'dpbolvw.net', // CJ redirect domain
    'awin1.com', // Alternative network
    'shareasale.com' // Alternative network
  ];

  /**
   * Handle return_completed event
   * Triggered when driver marks order as delivered
   */
  async onReturnCompleted(event: ReturnCompletedEvent): Promise<void> {
    try {
      console.log('[Engagement] Return completed event received:', {
        orderId: event.orderId,
        userId: event.userId,
        brand: event.brand,
        retailer: event.retailerName,
        completedAt: event.completedAt
      });

      // Check if engagement system is enabled
      if (!this.isEnabled()) {
        console.log('[Engagement] System disabled via kill switch');
        return;
      }

      // Check if user is eligible for rollout
      if (!this.isUserEligible(event.userId)) {
        console.log('[Engagement] User not in rollout percentage');
        return;
      }

      // Rate limiting: Check if user already received an offer for this order
      const existingPrompt = await this.hasExistingPrompt(event.orderId, event.userId);
      if (existingPrompt) {
        console.log('[Engagement] Offer already sent for this order');
        return;
      }

      // Select best matching offer
      const matchedOffer = await this.selectBestOffer(event.brand, event.category);
      
      if (!matchedOffer) {
        console.log('[Engagement] No eligible offers found');
        return;
      }

      console.log('[Engagement] Matched offer:', {
        offerId: matchedOffer.id,
        brand: matchedOffer.brand,
        matchType: matchedOffer.matchType,
        network: matchedOffer.network
      });

      // TODO (Task 9): Show in-app offer banner
      // TODO (Task 10): Send web push notification
      // TODO (Task 11): Send email notification (with quota check)
      // TODO (Task 14): Log engagement prompt event in database

      console.log('[Engagement] Offer processing complete (notification channels pending)');

    } catch (error) {
      console.error('[Engagement] Error handling return completed event:', error);
      // Don't throw - engagement failures shouldn't block order completion
    }
  }

  /**
   * Select the best matching offer from active pool
   * Priority: brand match > category match > generic
   */
  private async selectBestOffer(
    brand?: string,
    category?: string
  ): Promise<MatchedOffer | null> {
    const now = new Date();

    // Base filter: active status + not expired
    const baseConditions = and(
      eq(partnerOffers.status, 'active'),
      or(
        isNull(partnerOffers.validTo),
        gt(partnerOffers.validTo, now)
      )
    );

    // 1. Try brand match first (highest priority)
    if (brand) {
      const brandMatch = await db
        .select()
        .from(partnerOffers)
        .where(
          and(
            baseConditions!,
            sql`LOWER(${partnerOffers.brand}) = LOWER(${brand})`
          )
        )
        .orderBy(desc(partnerOffers.priority))
        .limit(1);

      if (brandMatch.length > 0 && this.isUrlWhitelisted(brandMatch[0].affiliateLink)) {
        return { ...brandMatch[0], matchType: 'brand' };
      }
    }

    // 2. Try category match (medium priority)
    if (category) {
      const categoryMatch = await db
        .select()
        .from(partnerOffers)
        .where(
          and(
            baseConditions!,
            sql`LOWER(${partnerOffers.category}) = LOWER(${category})`
          )
        )
        .orderBy(desc(partnerOffers.priority))
        .limit(1);

      if (categoryMatch.length > 0 && this.isUrlWhitelisted(categoryMatch[0].affiliateLink)) {
        return { ...categoryMatch[0], matchType: 'category' };
      }
    }

    // 3. Fall back to generic offer (lowest priority)
    const genericMatch = await db
      .select()
      .from(partnerOffers)
      .where(baseConditions!)
      .orderBy(desc(partnerOffers.priority))
      .limit(1);

    if (genericMatch.length > 0 && this.isUrlWhitelisted(genericMatch[0].affiliateLink)) {
      return { ...genericMatch[0], matchType: 'generic' };
    }

    return null;
  }

  /**
   * Check if an offer was already sent for this order (rate limiting)
   */
  private async hasExistingPrompt(orderId: string, userId: number): Promise<boolean> {
    const existing = await db
      .select()
      .from(engagementPrompts)
      .where(
        and(
          eq(engagementPrompts.orderId, orderId),
          eq(engagementPrompts.userId, userId)
        )
      )
      .limit(1);

    return existing.length > 0;
  }

  /**
   * URL whitelist validation for security
   * Prevents malicious affiliate links
   */
  private isUrlWhitelisted(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      // Check if domain or subdomain matches whitelist
      return this.ALLOWED_DOMAINS.some(domain => {
        return hostname === domain || hostname.endsWith(`.${domain}`);
      });
    } catch (error) {
      console.error('[Engagement] Invalid URL:', url, error);
      return false;
    }
  }

  /**
   * Check if engagement system is enabled (master kill switch)
   * TODO (Task 17): Implement master kill switch and rollout controls
   */
  isEnabled(): boolean {
    // For now, always enabled. Will add admin toggle in Task 17
    return true;
  }

  /**
   * Check if user is eligible for engagement (rollout percentage)
   * TODO (Task 17): Implement gradual rollout (start with 10% of users)
   */
  isUserEligible(userId: number): boolean {
    // For now, all users eligible. Will add percentage rollout in Task 17
    return true;
  }
}

// Singleton instance
export const engagementService = new EngagementService();
