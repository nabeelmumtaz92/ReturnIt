import { db } from '../db';
import { donationLocations } from '@shared/schema';

// Initial St. Louis area donation locations
const INITIAL_DONATION_LOCATIONS = [
  {
    organizationName: 'Goodwill',
    locationName: 'Goodwill South County',
    type: 'nonprofit',
    streetAddress: '4177 S Lindbergh Blvd',
    city: 'St. Louis',
    state: 'MO',
    zipCode: '63127',
    formattedAddress: '4177 S Lindbergh Blvd, St. Louis, MO 63127',
    phoneNumber: '(314) 544-4333',
    website: 'https://www.goodwillstl.org',
    coordinates: { lat: 38.5261, lng: -90.3645 },
    latitude: '38.5261',
    longitude: '-90.3645',
    operatingHours: {
      monday: { open: '09:00', close: '20:00' },
      tuesday: { open: '09:00', close: '20:00' },
      wednesday: { open: '09:00', close: '20:00' },
      thursday: { open: '09:00', close: '20:00' },
      friday: { open: '09:00', close: '20:00' },
      saturday: { open: '09:00', close: '20:00' },
      sunday: { open: '10:00', close: '18:00' }
    },
    acceptedItems: ['clothing', 'electronics', 'furniture', 'books', 'household'],
    restrictions: 'No mattresses, large appliances, or hazardous materials',
    isActive: true,
    requiresAppointment: false,
    providesReceipt: true,
    dropoffInstructions: 'Drive to back entrance. Staff will assist with unloading.',
    parkingInstructions: 'Parking available in rear lot',
    contactPerson: 'Donation Center Manager',
    totalDonations: 0
  },
  {
    organizationName: 'Salvation Army',
    locationName: 'Salvation Army St. Louis',
    type: 'charity',
    streetAddress: '3740 Marine Ave',
    city: 'St. Louis',
    state: 'MO',
    zipCode: '63118',
    formattedAddress: '3740 Marine Ave, St. Louis, MO 63118',
    phoneNumber: '(314) 772-5400',
    website: 'https://salvationarmystl.org',
    coordinates: { lat: 38.5856, lng: -90.2254 },
    latitude: '38.5856',
    longitude: '-90.2254',
    operatingHours: {
      monday: { open: '09:00', close: '17:00' },
      tuesday: { open: '09:00', close: '17:00' },
      wednesday: { open: '09:00', close: '17:00' },
      thursday: { open: '09:00', close: '17:00' },
      friday: { open: '09:00', close: '17:00' },
      saturday: { open: '09:00', close: '15:00' },
      sunday: { open: 'closed', close: 'closed' }
    },
    acceptedItems: ['clothing', 'furniture', 'electronics', 'household'],
    restrictions: 'Call ahead for large furniture donations',
    isActive: true,
    requiresAppointment: false,
    providesReceipt: true,
    dropoffInstructions: 'Ring bell at donation door. Staff will assist.',
    parkingInstructions: 'Street parking available',
    contactPerson: 'Donation Coordinator',
    totalDonations: 0
  },
  {
    organizationName: 'St. Vincent de Paul',
    locationName: 'St. Vincent de Paul Thrift Store',
    type: 'nonprofit',
    streetAddress: '1310 Papin St',
    city: 'St. Louis',
    state: 'MO',
    zipCode: '63103',
    formattedAddress: '1310 Papin St, St. Louis, MO 63103',
    phoneNumber: '(314) 241-2324',
    website: 'https://svdpstl.org',
    coordinates: { lat: 38.6240, lng: -90.2045 },
    latitude: '38.6240',
    longitude: '-90.2045',
    operatingHours: {
      monday: { open: '09:00', close: '16:00' },
      tuesday: { open: '09:00', close: '16:00' },
      wednesday: { open: '09:00', close: '16:00' },
      thursday: { open: '09:00', close: '16:00' },
      friday: { open: '09:00', close: '16:00' },
      saturday: { open: '09:00', close: '14:00' },
      sunday: { open: 'closed', close: 'closed' }
    },
    acceptedItems: ['clothing', 'household', 'furniture', 'books'],
    restrictions: 'No electronics or large appliances',
    isActive: true,
    requiresAppointment: false,
    providesReceipt: true,
    dropoffInstructions: 'Use side entrance marked "Donations"',
    parkingInstructions: 'Free parking lot on Papin Street',
    contactPerson: 'Store Manager',
    totalDonations: 0
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
