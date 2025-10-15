import { useRef, useEffect, useState } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl, Layer, Source } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapProvider } from '@/contexts/MapProviderContext';
import { MapProviderType } from '@/../../shared/types/mapProvider';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, AlertCircle } from 'lucide-react';

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
  const mapRef = useRef<any>(null);
  const [viewport, setViewport] = useState({
    latitude: initialLatitude,
    longitude: initialLongitude,
    zoom: initialZoom,
  });

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Handle map click
  const handleMapClick = (event: any) => {
    if (onMapClick && event.lngLat) {
      onMapClick(event.lngLat.lat, event.lngLat.lng);
    }
  };

  // Handle map load
  useEffect(() => {
    if (mapRef.current && onMapLoad) {
      onMapLoad();
    }
  }, [mapRef.current]);

  // Auto-fit bounds when markers change
  useEffect(() => {
    if (mapRef.current && markers.length > 0) {
      const bounds: [[number, number], [number, number]] = [
        [
          Math.min(...markers.map(m => m.longitude)),
          Math.min(...markers.map(m => m.latitude)),
        ],
        [
          Math.max(...markers.map(m => m.longitude)),
          Math.max(...markers.map(m => m.latitude)),
        ],
      ];

      mapRef.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        duration: 1000,
      });
    }
  }, [markers]);

  // Determine map style based on preferences
  const getMapStyle = () => {
    if (currentProvider === MapProviderType.MAPBOX) {
      if (preferences.showSatelliteView) {
        return 'mapbox://styles/mapbox/satellite-streets-v12';
      }
      if (preferences.darkModeMap) {
        return 'mapbox://styles/mapbox/dark-v11';
      }
      return 'mapbox://styles/mapbox/streets-v12';
    }
    return 'mapbox://styles/mapbox/streets-v12';
  };

  // Render Mapbox Map
  const renderMapboxMap = () => {
    if (!MAPBOX_TOKEN) {
      return <MapUnavailableMessage provider="Mapbox" reason="VITE_MAPBOX_ACCESS_TOKEN not configured" />;
    }

    return (
      <Map
        ref={mapRef}
        {...viewport}
        onMove={evt => setViewport(evt.viewState)}
        onClick={handleMapClick}
        mapStyle={getMapStyle()}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%', ...style }}
        className={className}
      >
        {/* Render markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            latitude={marker.latitude}
            longitude={marker.longitude}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              marker.onClick?.();
            }}
          >
            <div className="cursor-pointer" style={{ color: marker.color || '#f99806' }}>
              {marker.icon || <MapPin className="h-8 w-8" fill="currentColor" />}
            </div>
          </Marker>
        ))}

        {/* Render routes */}
        {routes.map((route, index) => {
          const routeGeoJSON = {
            type: 'Feature' as const,
            properties: {},
            geometry: {
              type: 'LineString' as const,
              coordinates: route.coordinates,
            },
          };

          return (
            <Source key={`route-${index}`} id={`route-${index}`} type="geojson" data={routeGeoJSON}>
              <Layer
                id={`route-layer-${index}`}
                type="line"
                paint={{
                  'line-color': route.color || '#f99806',
                  'line-width': route.width || 4,
                  'line-opacity': 0.8,
                }}
              />
            </Source>
          );
        })}

        {/* Map controls */}
        {showControls && <NavigationControl position="top-right" />}
        {showGeolocate && <GeolocateControl position="top-right" />}
      </Map>
    );
  };

  // Render OpenStreetMap (using Leaflet via react-map-gl's raster tiles)
  const renderOpenStreetMap = () => {
    return (
      <Map
        ref={mapRef}
        {...viewport}
        onMove={evt => setViewport(evt.viewState)}
        onClick={handleMapClick}
        mapStyle={{
          version: 8,
          sources: {
            'raster-tiles': {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            },
          },
          layers: [
            {
              id: 'simple-tiles',
              type: 'raster',
              source: 'raster-tiles',
              minzoom: 0,
              maxzoom: 22,
            },
          ],
        }}
        style={{ width: '100%', height: '100%', ...style }}
        className={className}
      >
        {/* Render markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            latitude={marker.latitude}
            longitude={marker.longitude}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              marker.onClick?.();
            }}
          >
            <div className="cursor-pointer" style={{ color: marker.color || '#f99806' }}>
              {marker.icon || <MapPin className="h-8 w-8" fill="currentColor" />}
            </div>
          </Marker>
        ))}

        {/* Map controls */}
        {showControls && <NavigationControl position="top-right" />}
        {showGeolocate && <GeolocateControl position="top-right" />}
      </Map>
    );
  };

  // Render Google Maps (placeholder - requires @react-google-maps/api package)
  const renderGoogleMaps = () => {
    if (!GOOGLE_MAPS_API_KEY) {
      return <MapUnavailableMessage provider="Google Maps" reason="VITE_GOOGLE_MAPS_API_KEY not configured" />;
    }

    return (
      <MapUnavailableMessage 
        provider="Google Maps" 
        reason="Google Maps rendering is coming soon. For now, please use Mapbox or OpenStreetMap."
      />
    );
  };

  // Render Apple Maps (placeholder - would work natively on iOS)
  const renderAppleMaps = () => {
    return (
      <MapUnavailableMessage 
        provider="Apple Maps" 
        reason="Apple Maps is available on iOS devices through the native driver app."
      />
    );
  };

  // Select the appropriate map renderer
  const renderMap = () => {
    switch (currentProvider) {
      case MapProviderType.MAPBOX:
        return renderMapboxMap();
      case MapProviderType.GOOGLE_MAPS:
        return renderGoogleMaps();
      case MapProviderType.OPENSTREETMAP:
        return renderOpenStreetMap();
      case MapProviderType.APPLE_MAPS:
        return renderAppleMaps();
      default:
        return renderMapboxMap();
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
