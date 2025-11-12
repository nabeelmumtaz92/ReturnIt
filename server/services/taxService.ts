import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export interface TaxCalculationInput {
  address: {
    line1: string;
    line2?: string; // Optional address line 2
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  amount: number; // Taxable amount in dollars (excludes tips, donations)
  isDonation?: boolean; // If true, return zero tax (donations are tax-exempt)
}

export interface TaxCalculationResult {
  taxAmount: number; // Tax amount in dollars (e.g., 1.75)
  effectiveTaxRate: number; // Tax rate as decimal (e.g., 0.0875 for 8.75%)
  taxJurisdictionName: string; // "St. Louis County, MO" or similar
  grandTotal: number; // Subtotal + tax
}

export class TaxService {
  /**
   * Calculate sales tax for a given address and amount using Stripe Tax
   * @param input - Address and taxable amount
   * @returns Tax calculation results
   */
  async calculateTax(input: TaxCalculationInput): Promise<TaxCalculationResult> {
    try {
      // Handle tax-exempt donations
      if (input.isDonation) {
        return this.calculateDonationTax();
      }
      
      // Convert amount to cents for Stripe
      const amountInCents = Math.round(input.amount * 100);
      
      // Create a tax calculation using Stripe Tax
      const calculation = await stripe.tax.calculations.create({
        currency: 'usd',
        line_items: [
          {
            amount: amountInCents,
            reference: 'return-delivery-service',
          },
        ],
        customer_details: {
          address: {
            line1: input.address.line1,
            ...(input.address.line2 && { line2: input.address.line2 }),
            city: input.address.city,
            state: input.address.state,
            postal_code: input.address.postalCode,
            country: input.address.country || 'US',
          },
          address_source: 'shipping', // Using shipping address for tax calculation
        },
      });

      // Extract tax details from Stripe response
      const taxAmountInCents = calculation.tax_amount_exclusive;
      const taxAmount = taxAmountInCents / 100;
      
      // Calculate effective tax rate
      const effectiveTaxRate = input.amount > 0 ? taxAmount / input.amount : 0;
      
      // Get jurisdiction name from tax breakdown
      let taxJurisdictionName = 'Unknown';
      if (calculation.tax_breakdown && calculation.tax_breakdown.length > 0) {
        // Use city and state from input address for jurisdiction name
        taxJurisdictionName = `${input.address.city}, ${input.address.state}`;
      }
      
      const grandTotal = input.amount + taxAmount;
      
      return {
        taxAmount: Number(taxAmount.toFixed(2)),
        effectiveTaxRate: Number(effectiveTaxRate.toFixed(4)),
        taxJurisdictionName,
        grandTotal: Number(grandTotal.toFixed(2)),
      };
    } catch (error) {
      console.error('[TaxService] Error calculating tax:', error);
      
      // Fallback: If Stripe Tax fails, return zero tax
      // In production, you might want to use a default tax rate for your state
      console.warn('[TaxService] Using fallback (no tax) due to calculation error');
      return {
        taxAmount: 0,
        effectiveTaxRate: 0,
        taxJurisdictionName: 'Tax calculation unavailable',
        grandTotal: input.amount,
      };
    }
  }

  /**
   * Calculate tax for donations (should always be 0 - donations are tax-exempt)
   */
  async calculateDonationTax(): Promise<TaxCalculationResult> {
    return {
      taxAmount: 0,
      effectiveTaxRate: 0,
      taxJurisdictionName: 'Tax-exempt (donation)',
      grandTotal: 0, // Donations are free
    };
  }
}

export const taxService = new TaxService();
