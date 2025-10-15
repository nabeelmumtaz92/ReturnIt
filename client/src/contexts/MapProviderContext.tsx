import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MapProvider, MapProviderType, UserMapPreferences, defaultMapPreferences } from '@/../../shared/types/mapProvider';
import { useQuery } from '@tanstack/react-query';

interface MapProviderContextType {
  currentProvider: MapProvider;
  setProvider: (provider: MapProvider) => void;
  preferences: UserMapPreferences;
  updatePreferences: (prefs: Partial<UserMapPreferences>) => void;
  isProviderAvailable: (provider: MapProvider) => boolean;
  availableProviders: MapProvider[];
}

const MapProviderContext = createContext<MapProviderContextType | undefined>(undefined);

interface MapProviderProviderProps {
  children: ReactNode;
}

export function MapProviderProvider({ children }: MapProviderProviderProps) {
  const [currentProvider, setCurrentProvider] = useState<MapProvider>(MapProviderType.MAPBOX);
  const [preferences, setPreferences] = useState<UserMapPreferences>(defaultMapPreferences);

  // Fetch user from auth endpoint to get their preferences
  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  // Load user's map preferences from their account
  useEffect(() => {
    const userPrefs = (user as any)?.preferences?.mapPreferences;
    if (userPrefs) {
      setPreferences(userPrefs);
      setCurrentProvider(userPrefs.preferredProvider || MapProviderType.MAPBOX);
    } else {
      // Load from localStorage for non-authenticated users
      const stored = localStorage.getItem('mapPreferences');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setPreferences(parsed);
          setCurrentProvider(parsed.preferredProvider || MapProviderType.MAPBOX);
        } catch (error) {
          console.error('Failed to parse stored map preferences:', error);
        }
      }
    }
  }, [user]);

  // Check which providers have valid API keys
  const availableProviders = [
    MapProviderType.MAPBOX,
    MapProviderType.GOOGLE_MAPS,
    MapProviderType.OPENSTREETMAP,
    MapProviderType.APPLE_MAPS,
  ].filter(provider => isProviderAvailable(provider));

  function isProviderAvailable(provider: MapProvider): boolean {
    switch (provider) {
      case MapProviderType.MAPBOX:
        return !!import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
      case MapProviderType.GOOGLE_MAPS:
        return !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      case MapProviderType.OPENSTREETMAP:
        // OpenStreetMap doesn't require an API key
        return true;
      case MapProviderType.APPLE_MAPS:
        // Apple Maps works on iOS devices without additional setup
        return true;
      default:
        return false;
    }
  }

  function setProvider(provider: MapProvider) {
    if (!isProviderAvailable(provider)) {
      console.warn(`Map provider ${provider} is not available. Missing API key.`);
      return;
    }
    
    setCurrentProvider(provider);
    updatePreferences({ preferredProvider: provider });
  }

  async function updatePreferences(prefs: Partial<UserMapPreferences>) {
    const newPreferences = { ...preferences, ...prefs };
    setPreferences(newPreferences);

    // Save to localStorage
    localStorage.setItem('mapPreferences', JSON.stringify(newPreferences));

    // If user is authenticated, save to their account
    if (user) {
      try {
        await fetch('/api/user/preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mapPreferences: newPreferences,
          }),
        });
      } catch (error) {
        console.error('Failed to save map preferences:', error);
      }
    }
  }

  return (
    <MapProviderContext.Provider
      value={{
        currentProvider,
        setProvider,
        preferences,
        updatePreferences,
        isProviderAvailable,
        availableProviders,
      }}
    >
      {children}
    </MapProviderContext.Provider>
  );
}

export function useMapProvider() {
  const context = useContext(MapProviderContext);
  if (context === undefined) {
    throw new Error('useMapProvider must be used within a MapProviderProvider');
  }
  return context;
}
