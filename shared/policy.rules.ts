import { z } from 'zod';
import type { PolicyConfig, SelectMerchantPolicy } from './schema';

// Booking attempt data structure
export const BookingAttemptSchema = z.object({
  itemDescription: z.string(),
  itemCategory: z.string(),
  retailer: z.string(),
  purchaseDate: z.string()
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, "Invalid purchase date format")
    .refine((date) => {
      const parsed = new Date(date);
      const now = new Date();
      return parsed <= now;
    }, "Purchase date cannot be in the future"),
  receiptUploaded: z.boolean().default(false),
  tagsAttached: z.boolean().default(false),
  originalPackaging: z.boolean().default(false),
  itemValue: z.number().optional(),
  numberOfItems: z.number().default(1)
});

export type BookingAttempt = z.infer<typeof BookingAttemptSchema>;

// Policy validation result
export interface PolicyValidationResult {
  isValid: boolean;
  violations: PolicyViolation[];
  warnings: string[];
  merchantPolicy: SelectMerchantPolicy | null;
}

export interface PolicyViolation {
  type: 'return_window_expired' | 'receipt_required' | 'tags_required' | 'original_packaging_required' | 'category_excluded' | 'holiday_extension_expired';
  message: string;
  details?: Record<string, any>;
}

/**
 * POLICY ENGINE V1 - Core validation logic for merchant return policies
 */
export class PolicyValidator {
  
  /**
   * Validate a customer booking attempt against merchant policy
   */
  static validateBookingAttempt(
    bookingAttempt: BookingAttempt, 
    merchantPolicy: SelectMerchantPolicy | null
  ): PolicyValidationResult {
    
    const violations: PolicyViolation[] = [];
    const warnings: string[] = [];

    // No policy means no restrictions (allow booking)
    if (!merchantPolicy || !merchantPolicy.isActive) {
      return {
        isValid: true,
        violations: [],
        warnings: [],
        merchantPolicy
      };
    }

    const policy = merchantPolicy.policy as PolicyConfig;
    
    // 1. Validate return window
    const returnWindowViolation = this.validateReturnWindow(bookingAttempt, policy);
    if (returnWindowViolation) violations.push(returnWindowViolation);

    // 2. Validate receipt requirement
    const receiptViolation = this.validateReceiptRequirement(bookingAttempt, policy);
    if (receiptViolation) violations.push(receiptViolation);

    // 3. Validate tags requirement
    const tagsViolation = this.validateTagsRequirement(bookingAttempt, policy);
    if (tagsViolation) violations.push(tagsViolation);

    // 4. Validate original packaging requirement
    const packagingViolation = this.validateOriginalPackaging(bookingAttempt, policy);
    if (packagingViolation) violations.push(packagingViolation);

    // 5. Validate item category
    const categoryViolation = this.validateItemCategory(bookingAttempt, policy);
    if (categoryViolation) violations.push(categoryViolation);

    // 6. Check for warnings (non-blocking issues)
    const policyWarnings = this.checkPolicyWarnings(bookingAttempt, policy);
    warnings.push(...policyWarnings);

    return {
      isValid: violations.length === 0,
      violations,
      warnings,
      merchantPolicy
    };
  }

  /**
   * Validate return window with holiday extension support
   */
  private static validateReturnWindow(
    bookingAttempt: BookingAttempt, 
    policy: PolicyConfig
  ): PolicyViolation | null {
    
    const purchaseDate = new Date(bookingAttempt.purchaseDate);
    const now = new Date();
    
    // SECURITY: Guard against invalid dates that could bypass validation
    if (isNaN(purchaseDate.getTime())) {
      return {
        type: 'return_window_expired',
        message: `This return is not eligible per ${bookingAttempt.retailer} return policy: invalid purchase date provided.`,
        details: {
          purchaseDate: bookingAttempt.purchaseDate,
          error: 'Invalid date format'
        }
      };
    }
    
    // SECURITY: Guard against future dates
    if (purchaseDate > now) {
      return {
        type: 'return_window_expired',
        message: `This return is not eligible per ${bookingAttempt.retailer} return policy: purchase date cannot be in the future.`,
        details: {
          purchaseDate: bookingAttempt.purchaseDate,
          error: 'Future date not allowed'
        }
      };
    }
    
    const daysSincePurchase = Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));

    let effectiveReturnWindow = policy.returnWindowDays;

    // Apply holiday extension if applicable
    if (policy.holidayExtension.enabled && policy.holidayExtension.start && policy.holidayExtension.end) {
      const holidayStart = new Date(policy.holidayExtension.start);
      const holidayEnd = new Date(policy.holidayExtension.end);
      
      // If purchase was during holiday period, extend return window
      if (purchaseDate >= holidayStart && purchaseDate <= holidayEnd) {
        effectiveReturnWindow = Math.max(policy.returnWindowDays, 90); // Default holiday extension to 90 days
      }
    }

    if (daysSincePurchase > effectiveReturnWindow) {
      return {
        type: 'return_window_expired',
        message: `This return is not eligible per ${bookingAttempt.retailer} return policy: return window of ${effectiveReturnWindow} days has expired (purchased ${daysSincePurchase} days ago).`,
        details: {
          purchaseDate: bookingAttempt.purchaseDate,
          daysSincePurchase,
          allowedDays: effectiveReturnWindow,
          holidayExtensionApplied: policy.holidayExtension.enabled
        }
      };
    }

    return null;
  }

  /**
   * Validate receipt requirement
   */
  private static validateReceiptRequirement(
    bookingAttempt: BookingAttempt, 
    policy: PolicyConfig
  ): PolicyViolation | null {
    
    if (policy.receiptRequired && !bookingAttempt.receiptUploaded) {
      return {
        type: 'receipt_required',
        message: `This return is not eligible per ${bookingAttempt.retailer} return policy: receipt is required but not provided.`,
        details: {
          receiptRequired: true,
          receiptUploaded: bookingAttempt.receiptUploaded
        }
      };
    }

    return null;
  }

  /**
   * Validate tags requirement
   */
  private static validateTagsRequirement(
    bookingAttempt: BookingAttempt, 
    policy: PolicyConfig
  ): PolicyViolation | null {
    
    if (policy.tagsRequired && !bookingAttempt.tagsAttached) {
      return {
        type: 'tags_required',
        message: `This return is not eligible per ${bookingAttempt.retailer} return policy: original tags must be attached.`,
        details: {
          tagsRequired: true,
          tagsAttached: bookingAttempt.tagsAttached
        }
      };
    }

    return null;
  }

  /**
   * Validate original packaging requirement
   */
  private static validateOriginalPackaging(
    bookingAttempt: BookingAttempt, 
    policy: PolicyConfig
  ): PolicyViolation | null {
    
    if (policy.originalPackagingRequired && !bookingAttempt.originalPackaging) {
      return {
        type: 'original_packaging_required',
        message: `This return is not eligible per ${bookingAttempt.retailer} return policy: original packaging is required.`,
        details: {
          originalPackagingRequired: true,
          originalPackaging: bookingAttempt.originalPackaging
        }
      };
    }

    return null;
  }

  /**
   * Validate item category against allowed/excluded lists
   */
  private static validateItemCategory(
    bookingAttempt: BookingAttempt, 
    policy: PolicyConfig
  ): PolicyViolation | null {
    
    const itemCategory = bookingAttempt.itemCategory.toLowerCase().trim();

    // Check excluded categories first (more restrictive)
    const excludedMatch = policy.excludedCategories.find(
      excluded => itemCategory.includes(excluded.toLowerCase())
    );
    
    if (excludedMatch) {
      return {
        type: 'category_excluded',
        message: `This return is not eligible per ${bookingAttempt.retailer} return policy: ${excludedMatch} items cannot be returned.`,
        details: {
          itemCategory: bookingAttempt.itemCategory,
          excludedCategory: excludedMatch,
          excludedCategories: policy.excludedCategories
        }
      };
    }

    // Check allowed categories (if specified)
    if (policy.allowedCategories.length > 0) {
      const allowedMatch = policy.allowedCategories.find(
        allowed => itemCategory.includes(allowed.toLowerCase())
      );
      
      if (!allowedMatch) {
        return {
          type: 'category_excluded',
          message: `This return is not eligible per ${bookingAttempt.retailer} return policy: ${bookingAttempt.itemCategory} is not in the list of returnable categories.`,
          details: {
            itemCategory: bookingAttempt.itemCategory,
            allowedCategories: policy.allowedCategories
          }
        };
      }
    }

    return null;
  }

  /**
   * Check for non-blocking policy warnings
   */
  private static checkPolicyWarnings(
    bookingAttempt: BookingAttempt, 
    policy: PolicyConfig
  ): string[] {
    
    const warnings: string[] = [];

    // Restocking fee warning
    if (policy.restockingFee.enabled && policy.restockingFee.percentage > 0) {
      warnings.push(`A ${policy.restockingFee.percentage}% restocking fee may apply to this return.`);
    }

    // Store credit warning
    if (policy.refundMethod === 'store_credit') {
      warnings.push(`Refund will be issued as store credit only.`);
    } else if (policy.refundMethod === 'exchange_only') {
      warnings.push(`This item can only be exchanged, not refunded.`);
    }

    return warnings;
  }

  /**
   * Generate human-readable error message for customer display
   */
  static generateCustomerErrorMessage(violations: PolicyViolation[], retailer: string): string {
    if (violations.length === 0) return '';

    if (violations.length === 1) {
      return violations[0].message;
    }

    const messages = violations.map(v => v.message.replace(`per ${retailer} return policy: `, ''));
    return `This return is not eligible per ${retailer} return policy: ${messages.join(', ')}.`;
  }

  /**
   * Check if booking attempt is valid for a specific merchant
   */
  static async isValidForMerchant(
    bookingAttempt: BookingAttempt,
    merchantId: string,
    getMerchantPolicy: (merchantId: string) => Promise<SelectMerchantPolicy | null>
  ): Promise<PolicyValidationResult> {
    
    const merchantPolicy = await getMerchantPolicy(merchantId);
    return this.validateBookingAttempt(bookingAttempt, merchantPolicy);
  }
}

/**
 * Utility functions for policy management
 */
export class PolicyUtils {
  
  /**
   * Get default policy configuration for new merchants
   */
  static getDefaultPolicyConfig(): PolicyConfig {
    return {
      returnWindowDays: 30,
      receiptRequired: true,
      tagsRequired: true,
      originalPackagingRequired: false,
      allowedCategories: [],
      excludedCategories: ["Final Sale", "Clearance", "Digital Downloads"],
      holidayExtension: {
        enabled: true,
        start: null,
        end: null
      },
      refundMethod: "original_payment",
      restockingFee: {
        enabled: false,
        percentage: 0
      }
    };
  }

  /**
   * Create policy violation record data
   */
  static createViolationRecord(
    merchantId: string,
    customerId: number | null,
    bookingAttempt: BookingAttempt,
    violations: PolicyViolation[],
    merchantPolicy: SelectMerchantPolicy | null
  ) {
    return {
      merchantId,
      customerId,
      violationType: violations[0]?.type || 'unknown',
      violationReason: PolicyValidator.generateCustomerErrorMessage(violations, bookingAttempt.retailer),
      attemptedBookingData: bookingAttempt,
      policyData: merchantPolicy?.policy || {}
    };
  }
}