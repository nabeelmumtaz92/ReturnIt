// Map Provider Types for ReturnIt

export const MapProviderType = {
  APPLE_MAPS: 'apple_maps',
  GOOGLE_MAPS: 'google_maps',
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
};

export interface UserMapPreferences {
  preferredProvider: MapProvider;
  showTraffic: boolean;
  showSatelliteView: boolean;
  auto3D: boolean;
  darkModeMap: boolean;
}

export const defaultMapPreferences: UserMapPreferences = {
  preferredProvider: MapProviderType.APPLE_MAPS,
  showTraffic: true,
  showSatelliteView: false,
  auto3D: false,
  darkModeMap: false,
};
