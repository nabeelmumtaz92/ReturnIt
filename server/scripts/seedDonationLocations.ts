import { db } from '../db';
import { donationLocations } from '@shared/schema';

// Initial St. Louis area donation locations
// Matches simplified schema structure
const INITIAL_DONATION_LOCATIONS = [
  {
    name: 'Goodwill South County',
    organizationType: 'nonprofit',
    streetAddress: '4177 S Lindbergh Blvd',
    city: 'St. Louis',
    state: 'MO',
    zipCode: '63127',
    phone: '(314) 544-4333',
    email: 'donations@goodwillstl.org',
    website: 'https://www.goodwillstl.org',
    hoursOfOperation: 'Mon-Sat 9am-8pm, Sun 10am-6pm',
    acceptedItems: 'Clothing, electronics, furniture, books, household items',
    specialInstructions: 'Drive to back entrance. Staff will assist with unloading. Parking available in rear lot. No mattresses, large appliances, or hazardous materials.',
    isActive: true
  },
  {
    name: 'Salvation Army St. Louis',
    organizationType: 'charity',
    streetAddress: '3740 Marine Ave',
    city: 'St. Louis',
    state: 'MO',
    zipCode: '63118',
    phone: '(314) 772-5400',
    email: 'donations@salvationarmystl.org',
    website: 'https://salvationarmystl.org',
    hoursOfOperation: 'Mon-Fri 9am-5pm, Sat 9am-3pm, Closed Sundays',
    acceptedItems: 'Clothing, furniture, electronics, household items',
    specialInstructions: 'Ring bell at donation door. Staff will assist. Street parking available. Call ahead for large furniture donations.',
    isActive: true
  },
  {
    name: 'St. Vincent de Paul Thrift Store',
    organizationType: 'nonprofit',
    streetAddress: '1310 Papin St',
    city: 'St. Louis',
    state: 'MO',
    zipCode: '63103',
    phone: '(314) 241-2324',
    email: 'donations@svdpstl.org',
    website: 'https://svdpstl.org',
    hoursOfOperation: 'Mon-Fri 9am-4pm, Sat 9am-2pm, Closed Sundays',
    acceptedItems: 'Clothing, household items, furniture, books',
    specialInstructions: 'Use side entrance marked "Donations". Free parking lot on Papin Street. No electronics or large appliances.',
    isActive: true
  }
];

async function seedDonationLocations() {
  try {
    console.log('🌱 Seeding donation locations...');
    
    for (const location of INITIAL_DONATION_LOCATIONS) {
      await db.insert(donationLocations).values(location).onConflictDoNothing();
      console.log(`✅ Added: ${location.organizationName} - ${location.locationName}`);
    }
    
    console.log('\n🎉 Donation locations seeded successfully!');
    console.log(`📍 Added ${INITIAL_DONATION_LOCATIONS.length} donation locations`);
    
  } catch (error) {
    console.error('❌ Error seeding donation locations:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDonationLocations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedDonationLocations };
