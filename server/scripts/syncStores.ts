import { PlacesSyncService } from '../services/placesSync';
import { storage } from '../storage';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.error('❌ GOOGLE_MAPS_API_KEY environment variable is required');
  process.exit(1);
}

console.log('🚀 Starting Google Places store sync...');
console.log('📍 Target: 600+ St. Louis metro area retail locations\n');

const syncService = new PlacesSyncService(GOOGLE_MAPS_API_KEY, storage);

syncService.syncStLouisStores()
  .then(result => {
    console.log('\n✅ Sync Complete!');
    console.log(`📊 Total stores synced: ${result.synced}`);
    console.log(`❌ Errors: ${result.errors.length}`);
    
    if (result.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      result.errors.forEach(err => console.log(`  - ${err}`));
    }
    
    console.log('\n📈 Breakdown by retailer:');
    Object.entries(result.retailers)
      .sort(([, a], [, b]) => b - a)
      .forEach(([retailer, count]) => {
        if (count > 0) {
          console.log(`  ${retailer}: ${count} locations`);
        }
      });
    
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Sync failed:', error);
    process.exit(1);
  });
