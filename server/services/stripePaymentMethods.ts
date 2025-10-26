/**
 * Stripe Payment Methods Service
 * 
 * PCI-compliant service for managing driver payment methods via Stripe:
 * - Financial Connections for bank accounts (ACH)
 * - Setup Intents for debit cards
 * - External accounts on Stripe Connect
 * 
 * Security: Stores ONLY Stripe references, never raw card/bank data
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
});

export interface BankAccountSetupResult {
  financialConnectionsSessionId: string;
  clientSecret: string;
}

export interface CardSetupResult {
  setupIntentId: string;
  clientSecret: string;
}

export interface BankAccountDetails {
  id: string;
  last4: string;
  bankName: string;
  accountHolderName: string;
  status: 'verified' | 'pending_verification' | 'verification_failed';
}

export interface CardDetails {
  id: string;
  last4: string;
  brand: string;
  instantPayEligible: boolean;
}

export interface InstantPayoutResult {
  transferId: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: 'pending' | 'paid' | 'failed';
  estimatedArrival: Date;
}

/**
 * Create a Financial Connections session for linking bank accounts
 * @param stripeConnectAccountId The driver's Stripe Connect account ID
 * @param driverId The driver's user ID (for metadata)
 */
export async function createFinancialConnectionsSession(
  stripeConnectAccountId: string,
  driverId: number
): Promise<BankAccountSetupResult> {
  try {
    const session = await stripe.financialConnections.sessions.create({
      account_holder: {
        type: 'account',
        account: stripeConnectAccountId,
      },
      permissions: ['payment_method', 'balances'],
      filters: {
        countries: ['US'],
      },
    });

    return {
      financialConnectionsSessionId: session.id,
      clientSecret: session.client_secret,
    };
  } catch (error: any) {
    console.error('Error creating Financial Connections session:', error);
    throw new Error(`Failed to create bank account setup: ${error.message}`);
  }
}

/**
 * Retrieve and attach a bank account from Financial Connections
 * @param financialConnectionsAccountId The Financial Connections account ID
 * @param stripeConnectAccountId The driver's Stripe Connect account ID
 */
export async function attachBankAccountFromFinancialConnections(
  financialConnectionsAccountId: string,
  stripeConnectAccountId: string
): Promise<BankAccountDetails> {
  try {
    // Retrieve the financial connections account
    const financialAccount = await stripe.financialConnections.accounts.retrieve(
      financialConnectionsAccountId
    );

    // Create external account on the Connect account
    const externalAccount = await stripe.accounts.createExternalAccount(
      stripeConnectAccountId,
      {
        external_account: financialConnectionsAccountId,
      }
    );

    // Type guard to ensure it's a bank account
    if (externalAccount.object !== 'bank_account') {
      throw new Error('External account is not a bank account');
    }

    return {
      id: externalAccount.id,
      last4: externalAccount.last4,
      bankName: externalAccount.bank_name || 'Unknown Bank',
      accountHolderName: externalAccount.account_holder_name || '',
      status: externalAccount.status === 'verified' ? 'verified' : 
              externalAccount.status === 'verification_failed' ? 'verification_failed' : 
              'pending_verification',
    };
  } catch (error: any) {
    console.error('Error attaching bank account:', error);
    throw new Error(`Failed to attach bank account: ${error.message}`);
  }
}

/**
 * Create a Setup Intent for adding a debit card
 * @param stripeConnectAccountId The driver's Stripe Connect account ID
 * @param driverId The driver's user ID (for metadata)
 */
export async function createCardSetupIntent(
  stripeConnectAccountId: string,
  driverId: number
): Promise<CardSetupResult> {
  try {
    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: ['card'],
      usage: 'off_session',
      metadata: {
        driver_id: driverId.toString(),
        connect_account: stripeConnectAccountId,
        purpose: 'instant_payout',
      },
    });

    return {
      setupIntentId: setupIntent.id,
      clientSecret: setupIntent.client_secret!,
    };
  } catch (error: any) {
    console.error('Error creating card setup intent:', error);
    throw new Error(`Failed to create card setup: ${error.message}`);
  }
}

/**
 * Retrieve card details from a payment method
 * @param paymentMethodId The Stripe payment method ID
 */
export async function getCardDetails(paymentMethodId: string): Promise<CardDetails> {
  try {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    if (paymentMethod.type !== 'card' || !paymentMethod.card) {
      throw new Error('Payment method is not a card');
    }

    const card = paymentMethod.card;
    
    // Instant pay is only available for debit cards
    const instantPayEligible = card.funding === 'debit';

    return {
      id: paymentMethod.id,
      last4: card.last4,
      brand: card.brand,
      instantPayEligible,
    };
  } catch (error: any) {
    console.error('Error retrieving card details:', error);
    throw new Error(`Failed to retrieve card details: ${error.message}`);
  }
}

/**
 * Attach a payment method to the platform account
 * Note: For Connect payouts, we use external accounts instead
 * @param paymentMethodId The payment method to attach
 * @param customerId The Stripe customer ID to attach to
 */
export async function attachPaymentMethodToCustomer(
  paymentMethodId: string,
  customerId: string
): Promise<void> {
  try {
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  } catch (error: any) {
    console.error('Error attaching payment method:', error);
    throw new Error(`Failed to attach payment method: ${error.message}`);
  }
}

/**
 * Create an instant payout to a bank account or card
 * @param stripeConnectAccountId The driver's Stripe Connect account ID
 * @param destination The external account ID or payment method ID
 * @param amount Amount in cents
 * @param fee Fee in cents (charged to driver)
 */
export async function createInstantPayout(
  stripeConnectAccountId: string,
  destination: string,
  amount: number,
  fee: number
): Promise<InstantPayoutResult> {
  try {
    const netAmount = amount - fee;

    // Create transfer from Connect account to external account
    const transfer = await stripe.transfers.create({
      amount: netAmount,
      currency: 'usd',
      destination: stripeConnectAccountId,
      metadata: {
        type: 'instant_payout',
        fee_cents: fee.toString(),
        gross_amount_cents: amount.toString(),
      },
    });

    // Create payout to external account
    const payout = await stripe.payouts.create({
      amount: netAmount,
      currency: 'usd',
      destination: destination,
      method: 'instant', // Instant payout
    }, {
      stripeAccount: stripeConnectAccountId,
    });

    return {
      transferId: transfer.id,
      amount,
      fee,
      netAmount,
      status: payout.status === 'paid' ? 'paid' : 
              payout.status === 'failed' ? 'failed' : 
              'pending',
      estimatedArrival: new Date(payout.arrival_date * 1000),
    };
  } catch (error: any) {
    console.error('Error creating instant payout:', error);
    throw new Error(`Failed to create instant payout: ${error.message}`);
  }
}

/**
 * Delete an external account from a Connect account
 * @param stripeConnectAccountId The driver's Stripe Connect account ID
 * @param externalAccountId The external account ID to delete
 */
export async function deleteExternalAccount(
  stripeConnectAccountId: string,
  externalAccountId: string
): Promise<void> {
  try {
    await stripe.accounts.deleteExternalAccount(
      stripeConnectAccountId,
      externalAccountId
    );
  } catch (error: any) {
    console.error('Error deleting external account:', error);
    throw new Error(`Failed to delete payment method: ${error.message}`);
  }
}

/**
 * Detach a payment method
 * @param paymentMethodId The payment method ID to detach
 */
export async function detachPaymentMethod(paymentMethodId: string): Promise<void> {
  try {
    await stripe.paymentMethods.detach(paymentMethodId);
  } catch (error: any) {
    console.error('Error detaching payment method:', error);
    throw new Error(`Failed to remove payment method: ${error.message}`);
  }
}

/**
 * Validate Connect account can receive instant payouts
 * @param stripeConnectAccountId The driver's Stripe Connect account ID
 */
export async function validateInstantPayoutEligibility(
  stripeConnectAccountId: string
): Promise<{ eligible: boolean; reason?: string }> {
  try {
    const account = await stripe.accounts.retrieve(stripeConnectAccountId);

    // Check if account is verified and active
    if (!account.details_submitted) {
      return { eligible: false, reason: 'Account verification incomplete' };
    }

    if (!account.payouts_enabled) {
      return { eligible: false, reason: 'Payouts not enabled on account' };
    }

    // Check if there are any restrictions
    if (account.requirements?.disabled_reason) {
      return { eligible: false, reason: account.requirements.disabled_reason };
    }

    return { eligible: true };
  } catch (error: any) {
    console.error('Error validating instant payout eligibility:', error);
    return { eligible: false, reason: error.message };
  }
}

export default {
  createFinancialConnectionsSession,
  attachBankAccountFromFinancialConnections,
  createCardSetupIntent,
  getCardDetails,
  attachPaymentMethodToCustomer,
  createInstantPayout,
  deleteExternalAccount,
  detachPaymentMethod,
  validateInstantPayoutEligibility,
};
