// Map Provider Types for ReturnIt

export const MapProviderType = {
  MAPBOX: 'mapbox',
  GOOGLE_MAPS: 'google_maps',
  OPENSTREETMAP: 'openstreetmap',
  APPLE_MAPS: 'apple_maps',
} as const;

export type MapProvider = typeof MapProviderType[keyof typeof MapProviderType];

export interface MapProviderConfig {
  id: MapProvider;
  name: string;
  description: string;
  requiresApiKey: boolean;
  features: {
    realTimeTracking: boolean;
    turnByTurnNavigation: boolean;
    satelliteView: boolean;
    trafficData: boolean;
  };
  pricing: 'free' | 'paid' | 'freemium';
}

export const MAP_PROVIDERS: Record<MapProvider, MapProviderConfig> = {
  [MapProviderType.MAPBOX]: {
    id: MapProviderType.MAPBOX,
    name: 'Mapbox',
    description: 'High-quality maps with excellent customization and real-time tracking',
    requiresApiKey: true,
    features: {
      realTimeTracking: true,
      turnByTurnNavigation: true,
      satelliteView: true,
      trafficData: true,
    },
    pricing: 'freemium',
  },
  [MapProviderType.GOOGLE_MAPS]: {
    id: MapProviderType.GOOGLE_MAPS,
    name: 'Google Maps',
    description: 'The most comprehensive map data with excellent POI information',
    requiresApiKey: true,
    features: {
      realTimeTracking: true,
      turnByTurnNavigation: true,
      satelliteView: true,
      trafficData: true,
    },
    pricing: 'paid',
  },
  [MapProviderType.OPENSTREETMAP]: {
    id: MapProviderType.OPENSTREETMAP,
    name: 'OpenStreetMap',
    description: 'Free and open-source maps with community-driven data',
    requiresApiKey: false,
    features: {
      realTimeTracking: true,
      turnByTurnNavigation: false,
      satelliteView: false,
      trafficData: false,
    },
    pricing: 'free',
  },
  [MapProviderType.APPLE_MAPS]: {
    id: MapProviderType.APPLE_MAPS,
    name: 'Apple Maps',
    description: 'Native iOS experience with privacy-focused design',
    requiresApiKey: false,
    features: {
      realTimeTracking: true,
      turnByTurnNavigation: true,
      satelliteView: true,
      trafficData: true,
    },
    pricing: 'free',
  },
};

export interface UserMapPreferences {
  preferredProvider: MapProvider;
  showTraffic: boolean;
  showSatelliteView: boolean;
  auto3D: boolean;
  darkModeMap: boolean;
}

export const defaultMapPreferences: UserMapPreferences = {
  preferredProvider: MapProviderType.MAPBOX,
  showTraffic: true,
  showSatelliteView: false,
  auto3D: false,
  darkModeMap: false,
};
