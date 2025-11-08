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
    name: 'Goodwill West County',
    organizationType: 'nonprofit',
    streetAddress: '13825 Manchester Rd',
    city: 'Manchester',
    state: 'MO',
    zipCode: '63011',
    phone: '(636) 227-5400',
    email: 'donations@goodwillstl.org',
    website: 'https://www.goodwillstl.org',
    hoursOfOperation: 'Mon-Sat 9am-9pm, Sun 10am-7pm',
    acceptedItems: 'Clothing, electronics, furniture, books, household items',
    specialInstructions: 'Pull around to donation center on east side of building. Staff available to help unload. Large parking area.',
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
    name: 'Salvation Army Family Thrift Store',
    organizationType: 'charity',
    streetAddress: '3949 Gravois Ave',
    city: 'St. Louis',
    state: 'MO',
    zipCode: '63116',
    phone: '(314) 664-3800',
    email: 'donations@salvationarmystl.org',
    website: 'https://salvationarmystl.org',
    hoursOfOperation: 'Mon-Sat 9am-7pm, Sun 11am-5pm',
    acceptedItems: 'Clothing, shoes, accessories, small household items',
    specialInstructions: 'Donations accepted at front counter during business hours. Limited parking on street.',
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
  },
  {
    name: 'Habitat for Humanity ReStore - North',
    organizationType: 'nonprofit',
    streetAddress: '5240 Fyler Ave',
    city: 'St. Louis',
    state: 'MO',
    zipCode: '63139',
    phone: '(314) 621-4900',
    email: 'restore@stlhabitat.org',
    website: 'https://www.habitatstl.org/restore',
    hoursOfOperation: 'Wed-Fri 9am-6pm, Sat 9am-5pm',
    acceptedItems: 'Building materials, furniture, appliances, doors, windows, lighting fixtures, hardware',
    specialInstructions: 'Drive to loading dock on west side. Staff available to assist. Please call ahead for large donations.',
    isActive: true
  },
  {
    name: 'Habitat for Humanity ReStore - South',
    organizationType: 'nonprofit',
    streetAddress: '10402 Tesson Ferry Rd',
    city: 'St. Louis',
    state: 'MO',
    zipCode: '63123',
    phone: '(314) 540-5757',
    email: 'restore@stlhabitat.org',
    website: 'https://www.habitatstl.org/restore',
    hoursOfOperation: 'Wed-Fri 9am-6pm, Sat 9am-5pm',
    acceptedItems: 'Building materials, furniture, appliances, cabinets, flooring, plumbing fixtures',
    specialInstructions: 'Pull around back to donation entrance. Volunteers will help unload. Ample parking available.',
    isActive: true
  },
  {
    name: 'Veterans of Foreign Wars (VFW) Thrift Store',
    organizationType: 'charity',
    streetAddress: '8661 Olive Blvd',
    city: 'University City',
    state: 'MO',
    zipCode: '63132',
    phone: '(314) 997-0065',
    email: 'donations@vfwstl.org',
    website: 'https://www.vfwstl.org',
    hoursOfOperation: 'Mon-Sat 10am-5pm, Closed Sundays',
    acceptedItems: 'Clothing, shoes, household goods, books, small electronics',
    specialInstructions: 'Donations accepted at rear entrance. Ring doorbell for assistance. Street parking available.',
    isActive: true
  },
  {
    name: 'Disabled American Veterans (DAV) Thrift Store',
    organizationType: 'charity',
    streetAddress: '9740 Page Ave',
    city: 'Overland',
    state: 'MO',
    zipCode: '63132',
    phone: '(314) 427-3328',
    email: 'donations@davstl.org',
    website: 'https://www.dav.org',
    hoursOfOperation: 'Mon-Sat 9am-6pm, Sun 11am-5pm',
    acceptedItems: 'Clothing, furniture, household items, electronics, books',
    specialInstructions: 'Drive to side entrance for donations. Staff available during all business hours. Parking lot in front.',
    isActive: true
  },
  {
    name: 'St. Louis Area Foodbank',
    organizationType: 'nonprofit',
    streetAddress: '1644 Lotsie Blvd',
    city: 'St. Louis',
    state: 'MO',
    zipCode: '63132',
    phone: '(314) 292-6262',
    email: 'info@stlfoodbank.org',
    website: 'https://www.stlfoodbank.org',
    hoursOfOperation: 'Mon-Fri 8am-4pm',
    acceptedItems: 'Non-perishable food items, canned goods, dry goods (no clothing or household items)',
    specialInstructions: 'Use main entrance. Reception will direct you to donation area. Large parking lot available.',
    isActive: true
  },
  {
    name: 'Crisis Nursery of Greater St. Louis',
    organizationType: 'nonprofit',
    streetAddress: '1421 N 11th St',
    city: 'St. Louis',
    state: 'MO',
    zipCode: '63106',
    phone: '(314) 768-3201',
    email: 'donations@crisisnurserykids.org',
    website: 'https://www.crisisnurserykids.org',
    hoursOfOperation: 'Mon-Fri 9am-5pm (by appointment)',
    acceptedItems: 'Baby clothes, diapers, wipes, formula, baby toys, children\'s books',
    specialInstructions: 'Call ahead to schedule donation drop-off. Use front entrance. Street parking only.',
    isActive: true
  },
  {
    name: 'Bethesda Thrift Store',
    organizationType: 'charity',
    streetAddress: '9740 Midland Blvd',
    city: 'Overland',
    state: 'MO',
    zipCode: '63114',
    phone: '(314) 427-2988',
    email: 'donations@bethesdastl.org',
    website: 'https://www.bethesdastl.org',
    hoursOfOperation: 'Mon-Sat 9am-5pm, Closed Sundays',
    acceptedItems: 'Clothing, furniture, household goods, books, small appliances',
    specialInstructions: 'Donations accepted at rear loading dock. Ring buzzer for assistance. Free parking lot.',
    isActive: true
  }
];

async function seedDonationLocations() {
  try {
    console.log('🌱 Seeding donation locations...');
    
    for (const location of INITIAL_DONATION_LOCATIONS) {
      await db.insert(donationLocations).values(location).onConflictDoNothing();
      console.log(`✅ Added: ${location.name}`);
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
