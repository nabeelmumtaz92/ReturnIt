// Route estimation for delivery time and distance calculations

export interface RouteEstimate {
  distanceMiles: number;
  estimatedMinutes: number;
  timeCapMinutes: number;
}

/**
 * Estimate route distance and time using straight-line distance
 * This is a simplified calculation - in production you'd use Google Maps API
 */
export function estimateRoute(
  pickupLat: number,
  pickupLng: number,
  storeLat: number,
  storeLng: number
): RouteEstimate {
  // Calculate straight-line distance using Haversine formula
  const distanceMiles = calculateDistance(pickupLat, pickupLng, storeLat, storeLng);
  
  // Apply route factor (straight line * 1.3 for actual roads)
  const actualDistanceMiles = distanceMiles * 1.3;
  
  // Calculate time based on average city speed (25 mph including stops)
  const avgSpeedMph = 25;
  const drivingMinutes = (actualDistanceMiles / avgSpeedMph) * 60;
  
  // Add pickup and dropoff time (5 minutes each)
  const pickupDropoffBuffer = 10;
  const estimatedMinutes = Math.ceil(drivingMinutes + pickupDropoffBuffer);
  
  // Time cap: estimated + 10 minutes
  const timeCapMinutes = estimatedMinutes + 10;
  
  return {
    distanceMiles: Math.round(actualDistanceMiles * 10) / 10, // Round to 1 decimal
    estimatedMinutes,
    timeCapMinutes
  };
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * St. Louis area store coordinates (simplified - would come from database)
 */
export const STORE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Target - Brentwood': { lat: 38.6167, lng: -90.3461 },
  'Target - Chesterfield': { lat: 38.6631, lng: -90.5772 },
  'Target - South City': { lat: 38.5833, lng: -90.2367 },
  'Target - Clayton': { lat: 38.6456, lng: -90.3234 },
  'Best Buy - Brentwood': { lat: 38.6170, lng: -90.3450 },
  'Walmart - Lemay Ferry': { lat: 38.5156, lng: -90.2881 },
  // Add more stores as needed
};

/**
 * Get store coordinates by retailer name
 */
export function getStoreCoordinates(retailer: string): { lat: number; lng: number } | null {
  if (STORE_COORDINATES[retailer]) {
    return STORE_COORDINATES[retailer];
  }
  
  // Default to downtown St. Louis if store not found
  return { lat: 38.6270, lng: -90.1994 };
}
