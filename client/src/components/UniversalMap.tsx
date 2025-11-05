import { useRef, useEffect, useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker as GoogleMarker, Polyline, InfoWindow } from '@react-google-maps/api';
import { useMapProvider } from '@/contexts/MapProviderContext';
import { MapProviderType } from '@/../../shared/types/mapProvider';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  label?: string;
  icon?: React.ReactNode;
  color?: string;
  onClick?: () => void;
}

export interface MapRoute {
  coordinates: [number, number][];
  color?: string;
  width?: number;
}

interface UniversalMapProps {
  initialLatitude?: number;
  initialLongitude?: number;
  initialZoom?: number;
  markers?: MapMarker[];
  routes?: MapRoute[];
  showControls?: boolean;
  showGeolocate?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  onMapLoad?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function UniversalMap({
  initialLatitude = 38.6270,
  initialLongitude = -90.1994,
  initialZoom = 11,
  markers = [],
  routes = [],
  showControls = true,
  showGeolocate = true,
  onMapClick,
  onMapLoad,
  className = '',
  style = {},
}: UniversalMapProps) {
  const { currentProvider, preferences } = useMapProvider();
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Google Maps state
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);

  // Auto-fit bounds when markers change (for Google Maps)
  useEffect(() => {
    if (googleMapRef.current && markers.length > 0 && currentProvider === MapProviderType.GOOGLE_MAPS) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach(marker => {
        bounds.extend({ lat: marker.latitude, lng: marker.longitude });
      });
      googleMapRef.current.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
    }
  }, [markers, currentProvider]);

  // Handle Google Map load
  const onGoogleMapLoad = useCallback((map: google.maps.Map) => {
    googleMapRef.current = map;
    
    // Fit bounds if markers exist
    if (markers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach(marker => {
        bounds.extend({ lat: marker.latitude, lng: marker.longitude });
      });
      map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
    }
    
    if (onMapLoad) {
      onMapLoad();
    }
  }, [markers, onMapLoad]);

  // Handle Google Map click
  const onGoogleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (onMapClick && e.latLng) {
      onMapClick(e.latLng.lat(), e.latLng.lng());
    }
    setSelectedMarker(null);
  }, [onMapClick]);

  // Handle geolocation for Google Maps
  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (googleMapRef.current) {
          googleMapRef.current.panTo({ lat: latitude, lng: longitude });
          googleMapRef.current.setZoom(15);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  }, []);

  // Render Google Maps
  const renderGoogleMaps = () => {
    if (!GOOGLE_MAPS_API_KEY) {
      return <MapUnavailableMessage provider="Google Maps" reason="VITE_GOOGLE_MAPS_API_KEY not configured" />;
    }

    const mapContainerStyle = {
      width: '100%',
      height: '100%',
      minHeight: '400px',
    };

    const center = {
      lat: initialLatitude,
      lng: initialLongitude,
    };

    const options: google.maps.MapOptions = {
      zoom: initialZoom,
      disableDefaultUI: !showControls,
      zoomControl: showControls,
      mapTypeControl: showControls,
      streetViewControl: showControls,
      fullscreenControl: showControls,
      clickableIcons: true,
    };

    return (
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={initialZoom}
          options={options}
          onLoad={onGoogleMapLoad}
          onClick={onGoogleMapClick}
        >
          {/* Render markers */}
          {markers.map((marker) => {
            // Only define custom icon if google is loaded and marker has color
            const customIcon = marker.color && window.google?.maps ? {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: marker.color,
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 8,
            } : undefined;

            return (
              <GoogleMarker
                key={marker.id}
                position={{ lat: marker.latitude, lng: marker.longitude }}
                onClick={() => {
                  setSelectedMarker(marker.id);
                  if (marker.onClick) {
                    marker.onClick();
                  }
                }}
                icon={customIcon}
              >
                {selectedMarker === marker.id && marker.label && (
                  <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                    <div className="p-2">
                      <p className="font-semibold text-sm">{marker.label}</p>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMarker>
            );
          })}

          {/* Render routes */}
          {routes.map((route, index) => (
            <Polyline
              key={`route-${index}`}
              path={route.coordinates.map(([lng, lat]) => ({ lat, lng }))}
              options={{
                strokeColor: route.color || '#3b82f6',
                strokeWeight: route.width || 4,
                strokeOpacity: 0.8,
              }}
            />
          ))}

          {/* Geolocation button */}
          {showGeolocate && (
            <button
              onClick={handleGeolocate}
              style={{
                position: 'absolute',
                right: '10px',
                top: '60px',
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '2px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                cursor: 'pointer',
                padding: '10px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                zIndex: 1000,
              }}
              title="Go to my location"
            >
              📍
            </button>
          )}
        </GoogleMap>
      </LoadScript>
    );
  };

  // Render Apple Maps (placeholder - would work natively on iOS)
  const renderAppleMaps = () => {
    return (
      <MapUnavailableMessage 
        provider="Apple Maps" 
        reason="Apple Maps is available on iOS devices through the native driver and customer apps."
      />
    );
  };

  // Select the appropriate map renderer
  const renderMap = () => {
    switch (currentProvider) {
      case MapProviderType.APPLE_MAPS:
        return renderAppleMaps();
      case MapProviderType.GOOGLE_MAPS:
        return renderGoogleMaps();
      default:
        // Default to Google Maps for web, Apple Maps for native
        return renderGoogleMaps();
    }
  };

  return (
    <div className="relative w-full h-full min-h-[400px]" data-testid="universal-map">
      {renderMap()}
    </div>
  );
}

// Component to show when a map provider is unavailable
function MapUnavailableMessage({ provider, reason }: { provider: string; reason: string }) {
  return (
    <Card className="w-full h-full min-h-[400px] flex items-center justify-center border-border bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
      <CardContent className="text-center p-6">
        <AlertCircle className="h-12 w-12 mx-auto text-[#f99806] mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {provider} Unavailable
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {reason}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Please select a different map provider in your settings or contact support.
        </p>
      </CardContent>
    </Card>
  );
}
