import Stripe from 'stripe';
import { db } from '../server/db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

async function createDriverStripeAccount() {
  try {
    // Get the driver
    const [driver] = await db.select().from(users).where(eq(users.email, 'nmumtaz7@gmail.com'));
    
    if (!driver) {
      throw new Error('Driver not found');
    }

    if (driver.stripeConnectAccountId) {
      console.log('⚠️  Driver already has a Stripe Connect account:', driver.stripeConnectAccountId);
      return driver.stripeConnectAccountId;
    }

    console.log('📝 Creating Stripe Connect account for:', driver.email);

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: driver.email || undefined,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      individual: {
        first_name: driver.firstName || undefined,
        last_name: driver.lastName || undefined,
        email: driver.email || undefined,
        phone: driver.phone || undefined,
      },
    });

    console.log('✅ Stripe Connect account created:', account.id);

    // Update driver with Stripe Connect account ID
    await db.update(users)
      .set({ stripeConnectAccountId: account.id })
      .where(eq(users.id, driver.id));

    console.log('✅ Driver updated with Stripe Connect account ID');

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `https://returnit.online/driver-onboarding?refresh=true`,
      return_url: `https://returnit.online/driver-payments`,
      type: 'account_onboarding',
    });

    console.log('\n🔗 Onboarding Link:');
    console.log(accountLink.url);
    console.log('\n📋 Account Details:');
    console.log('   Account ID:', account.id);
    console.log('   Email:', driver.email);
    console.log('   Name:', `${driver.firstName} ${driver.lastName}`);
    console.log('\n✅ Setup complete! Use the onboarding link above to complete Stripe verification.');

    return account.id;
  } catch (error) {
    console.error('❌ Error creating Stripe Connect account:', error);
    throw error;
  }
}

createDriverStripeAccount()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
