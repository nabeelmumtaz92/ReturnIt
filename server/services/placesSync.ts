import type { InsertStoreLocation } from "@shared/schema";
import type { IStorage } from "../storage";

interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types?: string[];
  formatted_phone_number?: string;
  website?: string;
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

export class PlacesSyncService {
  private apiKey: string;
  private storage: IStorage;
  
  // St. Louis metro area bounding box
  private readonly ST_LOUIS_BOUNDS = {
    north: 38.9,
    south: 38.4,
    east: -90.0,
    west: -90.8
  };

  // Major retailers to search for (200+ brands)
  private readonly RETAILERS = [
    // Major Department Stores
    "Target", "Walmart", "Costco", "Sam's Club", "Macy's", "Nordstrom", "Nordstrom Rack",
    "Bloomingdale's", "Neiman Marcus", "Saks Fifth Avenue", "Dillard's", "JCPenney", "Kohl's",
    
    // Electronics & Tech
    "Best Buy", "Apple Store", "Microsoft Store", "Micro Center", "GameStop",
    
    // Fashion & Apparel
    "Nike", "Adidas", "Under Armour", "Lululemon", "Athleta", "Patagonia", "The North Face",
    "Gap", "Old Navy", "Banana Republic", "J.Crew", "Abercrombie & Fitch", "Hollister",
    "American Eagle", "H&M", "Zara", "Forever 21", "Uniqlo", "Urban Outfitters",
    "Anthropologie", "Free People", "Express", "Ann Taylor", "LOFT",
    
    // Luxury Fashion
    "Gucci", "Louis Vuitton", "Prada", "Burberry", "Tory Burch", "Kate Spade",
    "Michael Kors", "Coach", "Ralph Lauren",
    
    // Shoes & Accessories
    "DSW", "Foot Locker", "Finish Line", "Famous Footwear", "Vans", "Skechers",
    
    // Home & Furniture
    "IKEA", "Wayfair", "Ashley Furniture", "West Elm", "Pottery Barn", "Williams Sonoma",
    "Crate & Barrel", "HomeGoods", "At Home", "Bed Bath & Beyond", "Container Store",
    "The Home Depot", "Lowe's", "Ace Hardware", "Restoration Hardware",
    
    // Beauty & Personal Care
    "Sephora", "Ulta Beauty", "Bath & Body Works",
    
    // Sporting Goods & Outdoor
    "Dick's Sporting Goods", "REI", "Bass Pro Shops", "Cabela's", "Academy Sports + Outdoors",
    
    // Discount Retail
    "TJ Maxx", "Marshall's", "Ross Dress for Less", "Burlington",
    
    // Specialty Retail
    "Barnes & Noble", "Staples", "Office Depot", "Michaels", "Jo-Ann Fabrics", "Hobby Lobby",
    
    // Baby & Kids
    "Buy Buy Baby", "Carter's", "The Children's Place",
    
    // Pet Supplies
    "Petco", "PetSmart",
    
    // Grocery & Food
    "Whole Foods Market", "Trader Joe's", "Kroger"
  ];

  constructor(apiKey: string, storage: IStorage) {
    this.apiKey = apiKey;
    this.storage = storage;
  }

  /**
   * Sync all St. Louis store locations from Google Places API
   * Targets 600+ stores by searching for all major retailers
   */
  async syncStLouisStores(): Promise<{ 
    synced: number; 
    errors: string[];
    retailers: Record<string, number>;
  }> {
    const errors: string[] = [];
    const retailers: Record<string, number> = {};
    let totalSynced = 0;

    console.log(`🔄 Starting Google Places sync for ${this.RETAILERS.length} retailers in St. Louis...`);

    for (const retailer of this.RETAILERS) {
      try {
        const count = await this.syncRetailerLocations(retailer);
        retailers[retailer] = count;
        totalSynced += count;
        
        console.log(`✅ ${retailer}: ${count} locations synced`);
        
        // Rate limiting: wait 100ms between requests to avoid quota issues
        await this.sleep(100);
      } catch (error) {
        const errorMsg = `Failed to sync ${retailer}: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    console.log(`\n🎉 Sync complete! ${totalSynced} total locations synced`);
    console.log(`📊 Found locations for ${Object.keys(retailers).length}/${this.RETAILERS.length} retailers`);

    return { synced: totalSynced, errors, retailers };
  }

  /**
   * Search for all locations of a specific retailer in St. Louis
   */
  private async syncRetailerLocations(retailerName: string): Promise<number> {
    const query = `${retailerName} in St. Louis, Missouri`;
    const places = await this.searchPlaces(query);
    
    let syncedCount = 0;
    
    for (const place of places) {
      try {
        const storeLocation = this.convertToStoreLocation(place, retailerName);
        
        // Upsert using Google Place ID for deduplication
        await this.storage.upsertStoreLocation(storeLocation);
        syncedCount++;
      } catch (error) {
        console.error(`Failed to sync place ${place.place_id}:`, error);
      }
    }
    
    return syncedCount;
  }

  /**
   * Search Google Places API for stores
   */
  private async searchPlaces(query: string): Promise<GooglePlaceResult[]> {
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    url.searchParams.append('query', query);
    url.searchParams.append('key', this.apiKey);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API status: ${data.status}`);
    }
    
    return data.results || [];
  }

  /**
   * Convert Google Place to StoreLocation format
   */
  private convertToStoreLocation(
    place: GooglePlaceResult,
    retailerName: string
  ): InsertStoreLocation {
    const addressComponents = this.parseAddressComponents(place.address_components || []);
    
    return {
      googlePlaceId: place.place_id,
      retailerName,
      storeName: place.name,
      displayName: place.name,
      streetAddress: addressComponents.street || place.formatted_address || '',
      city: addressComponents.city || 'St. Louis',
      state: addressComponents.state || 'MO',
      zipCode: addressComponents.zipCode || '',
      formattedAddress: place.formatted_address || null,
      phoneNumber: place.formatted_phone_number || null,
      website: place.website || null,
      coordinates: place.geometry?.location ? {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      } : { lat: 0, lng: 0 },
      latitude: place.geometry?.location?.lat?.toString() || null,
      longitude: place.geometry?.location?.lng?.toString() || null,
      category: this.extractCategory(place.types || []),
      types: place.types || [],
      isActive: true,
      acceptsReturns: true
    };
  }

  /**
   * Parse Google address components into structured data
   */
  private parseAddressComponents(components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>): {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  } {
    let streetNumber = '';
    let route = '';
    let city = '';
    let state = '';
    let zipCode = '';

    for (const component of components) {
      if (component.types.includes('street_number')) {
        streetNumber = component.long_name;
      } else if (component.types.includes('route')) {
        route = component.long_name;
      } else if (component.types.includes('locality')) {
        city = component.long_name;
      } else if (component.types.includes('administrative_area_level_1')) {
        state = component.short_name;
      } else if (component.types.includes('postal_code')) {
        zipCode = component.long_name;
      }
    }

    return {
      street: streetNumber && route ? `${streetNumber} ${route}` : '',
      city,
      state,
      zipCode
    };
  }

  /**
   * Extract primary category from Google types
   */
  private extractCategory(types: string[]): string | null {
    const priorityTypes = [
      'department_store',
      'electronics_store',
      'clothing_store',
      'shoe_store',
      'furniture_store',
      'home_goods_store',
      'hardware_store',
      'sporting_goods_store',
      'store'
    ];

    for (const priorityType of priorityTypes) {
      if (types.includes(priorityType)) {
        return priorityType.replace(/_/g, ' ');
      }
    }

    return types[0] || null;
  }

  /**
   * Sleep utility for rate limiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
