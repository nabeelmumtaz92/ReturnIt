// Location Services - Google Maps integration for Returnly
import { useEffect, useState } from 'react';

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}

// Google Maps type declarations
declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: any);
    }
    
    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }
    
    enum TravelMode {
      DRIVING = 'DRIVING',
      WALKING = 'WALKING',
      BICYCLING = 'BICYCLING',
      TRANSIT = 'TRANSIT'
    }
    
    enum UnitSystem {
      METRIC = 0,
      IMPERIAL = 1
    }
    
    enum DistanceMatrixStatus {
      OK = 'OK',
      INVALID_REQUEST = 'INVALID_REQUEST',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR'
    }
    
    class DirectionsService {
      route(request: any, callback: (result: any, status: any) => void): void;
    }
    
    class DistanceMatrixService {
      getDistanceMatrix(request: any, callback: (result: any, status: any) => void): void;
    }
    
    class Geocoder {
      geocode(request: any, callback: (results: any[], status: string) => void): void;
    }
    
    namespace places {
      enum PlacesServiceStatus {
        OK = 'OK',
        UNKNOWN_ERROR = 'UNKNOWN_ERROR',
        OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
        REQUEST_DENIED = 'REQUEST_DENIED',
        INVALID_REQUEST = 'INVALID_REQUEST',
        ZERO_RESULTS = 'ZERO_RESULTS',
        NOT_FOUND = 'NOT_FOUND'
      }
      
      class AutocompleteService {
        getPlacePredictions(request: any, callback: (predictions: any[], status: any) => void): void;
      }
      
      class PlacesService {
        constructor(attrContainer: Element | Map);
        getDetails(request: any, callback: (place: any, status: any) => void): void;
        nearbySearch(request: any, callback: (results: any[], status: any) => void): void;
      }
    }
    
    namespace geometry {
      namespace spherical {
        function computeDistanceBetween(from: LatLng, to: LatLng): number;
      }
    }
  }
}

interface Location {
  lat: number;
  lng: number;
}

interface PlaceResult {
  placeId: string;
  formattedAddress: string;
  name: string;
  location: Location;
}

interface RouteInfo {
  distance: string;
  duration: string;
  distanceValue: number; // in meters
  durationValue: number; // in seconds
}

interface NearbyStore {
  placeId: string;
  name: string;
  address: string;
  location: Location;
  distance: string;
  isOpen: boolean;
}

class LocationService {
  private static instance: LocationService;
  private mapsApiKey: string;
  private autocompleteService: google.maps.places.AutocompleteService | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private directionsService: google.maps.DirectionsService | null = null;
  private distanceMatrixService: google.maps.DistanceMatrixService | null = null;

  constructor() {
    this.mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  }

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async initializeGoogleMaps(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        this.setupServices();
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.mapsApiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.setupServices();
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Maps API'));
      };
      
      document.head.appendChild(script);
    });
  }

  private setupServices(): void {
    if (window.google && window.google.maps) {
      this.autocompleteService = new google.maps.places.AutocompleteService();
      this.directionsService = new google.maps.DirectionsService();
      this.distanceMatrixService = new google.maps.DistanceMatrixService();
      
      // Create a dummy map for PlacesService
      const dummyMap = new google.maps.Map(document.createElement('div'));
      this.placesService = new google.maps.places.PlacesService(dummyMap);
    }
  }

  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(new Error(`Location error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  async searchPlaces(query: string): Promise<PlaceResult[]> {
    if (!this.autocompleteService) {
      throw new Error('Google Maps not initialized');
    }

    return new Promise((resolve, reject) => {
      this.autocompleteService!.getPlacePredictions(
        {
          input: query,
          types: ['address'],
          componentRestrictions: { country: 'us' }
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            const results = predictions.map(prediction => ({
              placeId: prediction.place_id,
              formattedAddress: prediction.description,
              name: prediction.structured_formatting.main_text,
              location: { lat: 0, lng: 0 } // Will be filled by getPlaceDetails
            }));
            resolve(results);
          } else {
            reject(new Error('No places found'));
          }
        }
      );
    });
  }

  async getPlaceDetails(placeId: string): Promise<PlaceResult> {
    if (!this.placesService) {
      throw new Error('Google Maps not initialized');
    }

    return new Promise((resolve, reject) => {
      this.placesService!.getDetails(
        {
          placeId,
          fields: ['name', 'formatted_address', 'geometry']
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            resolve({
              placeId,
              formattedAddress: place.formatted_address || '',
              name: place.name || '',
              location: {
                lat: place.geometry?.location?.lat() || 0,
                lng: place.geometry?.location?.lng() || 0
              }
            });
          } else {
            reject(new Error('Place details not found'));
          }
        }
      );
    });
  }

  async calculateRoute(origin: Location, destination: Location): Promise<RouteInfo> {
    if (!this.distanceMatrixService) {
      throw new Error('Google Maps not initialized');
    }

    return new Promise((resolve, reject) => {
      this.distanceMatrixService!.getDistanceMatrix(
        {
          origins: [new google.maps.LatLng(origin.lat, origin.lng)],
          destinations: [new google.maps.LatLng(destination.lat, destination.lng)],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.IMPERIAL,
          avoidHighways: false,
          avoidTolls: false
        },
        (response, status) => {
          if (status === google.maps.DistanceMatrixStatus.OK && response) {
            const element = response.rows[0].elements[0];
            if (element.status === 'OK') {
              resolve({
                distance: element.distance.text,
                duration: element.duration.text,
                distanceValue: element.distance.value,
                durationValue: element.duration.value
              });
            } else {
              reject(new Error('Route calculation failed'));
            }
          } else {
            reject(new Error('Distance Matrix API error'));
          }
        }
      );
    });
  }

  async findNearbyStores(location: Location, retailerName: string): Promise<NearbyStore[]> {
    if (!this.placesService) {
      throw new Error('Google Maps not initialized');
    }

    return new Promise((resolve, reject) => {
      const request = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius: 25000, // 25km radius
        keyword: retailerName,
        type: 'store'
      };

      this.placesService!.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const stores: NearbyStore[] = results.slice(0, 5).map(place => ({
            placeId: place.place_id || '',
            name: place.name || '',
            address: place.vicinity || '',
            location: {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0
            },
            distance: this.calculateDistance(location, {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0
            }),
            isOpen: place.opening_hours?.open_now || false
          }));
          resolve(stores);
        } else {
          reject(new Error('No nearby stores found'));
        }
      });
    });
  }

  private calculateDistance(origin: Location, destination: Location): string {
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(origin.lat, origin.lng),
      new google.maps.LatLng(destination.lat, destination.lng)
    );
    
    const miles = distance * 0.000621371; // Convert meters to miles
    return miles < 1 ? `${(miles * 5280).toFixed(0)} ft` : `${miles.toFixed(1)} mi`;
  }

  calculateFare(distanceValue: number, durationValue: number): number {
    // Base fare calculation logic
    const baseFare = 3.99;
    const perMileRate = 0.50;
    const perMinuteRate = 0.15;
    
    const miles = distanceValue * 0.000621371;
    const minutes = durationValue / 60;
    
    const distanceFee = miles * perMileRate;
    const timeFee = minutes * perMinuteRate;
    
    return Math.max(baseFare, baseFare + distanceFee + timeFee);
  }

  openNavigationApp(destination: Location, app: 'apple' | 'google' | 'waze' = 'google'): void {
    const { lat, lng } = destination;
    
    switch (app) {
      case 'apple':
        window.open(`http://maps.apple.com/?daddr=${lat},${lng}`);
        break;
      case 'waze':
        window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`);
        break;
      case 'google':
      default:
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
        break;
    }
  }

  isWithinGeofence(currentLocation: Location, targetLocation: Location, radiusMeters: number = 100): boolean {
    if (!window.google) return false;
    
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(currentLocation.lat, currentLocation.lng),
      new google.maps.LatLng(targetLocation.lat, targetLocation.lng)
    );
    
    return distance <= radiusMeters;
  }
}

// React hooks for location services
export const useLocationPermission = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestPermission = async () => {
    setIsLoading(true);
    try {
      const position = await LocationService.getInstance().getCurrentLocation();
      setHasPermission(true);
      return position;
    } catch (error) {
      setHasPermission(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    navigator.permissions?.query({ name: 'geolocation' }).then(result => {
      setHasPermission(result.state === 'granted');
    });
  }, []);

  return { hasPermission, isLoading, requestPermission };
};

export const useCurrentLocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const position = await LocationService.getInstance().getCurrentLocation();
      setLocation(position);
      return position;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Location access failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { location, error, isLoading, getCurrentLocation };
};

export const locationService = LocationService.getInstance();
export type { Location, PlaceResult, RouteInfo, NearbyStore };