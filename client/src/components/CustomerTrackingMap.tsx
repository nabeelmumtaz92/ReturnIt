import { useEffect, useState, useRef } from 'react';
import Map, { Marker, Layer, Source, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Package, MapPin, Navigation, Truck, Home } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface CustomerTrackingMapProps {
  driverLocation: {
    lat: number;
    lng: number;
    accuracy?: number;
    timestamp: string;
  };
  pickupLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  deliveryLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  orderStatus: string;
}

export default function CustomerTrackingMap({
  driverLocation,
  pickupLocation,
  deliveryLocation,
  orderStatus
}: CustomerTrackingMapProps) {
  const mapRef = useRef<any>(null);
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  // Calculate bounds to fit all markers
  const [viewport, setViewport] = useState(() => {
    const lats = [driverLocation.lat, pickupLocation.lat];
    const lngs = [driverLocation.lng, pickupLocation.lng];
    
    if (deliveryLocation) {
      lats.push(deliveryLocation.lat);
      lngs.push(deliveryLocation.lng);
    }

    const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

    return {
      latitude: avgLat,
      longitude: avgLng,
      zoom: 12
    };
  });

  // Auto-fit bounds when locations change
  useEffect(() => {
    if (mapRef.current) {
      const bounds: [[number, number], [number, number]] = [
        [
          Math.min(driverLocation.lng, pickupLocation.lng, deliveryLocation?.lng || driverLocation.lng),
          Math.min(driverLocation.lat, pickupLocation.lat, deliveryLocation?.lat || driverLocation.lat)
        ],
        [
          Math.max(driverLocation.lng, pickupLocation.lng, deliveryLocation?.lng || driverLocation.lng),
          Math.max(driverLocation.lat, pickupLocation.lat, deliveryLocation?.lat || driverLocation.lat)
        ]
      ];

      mapRef.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        duration: 1000
      });
    }
  }, [driverLocation, pickupLocation, deliveryLocation]);

  // Create route line from driver to pickup or delivery
  // Normalize status to lowercase for comparison
  const normalizedStatus = orderStatus.toLowerCase();
  const isAfterPickup = normalizedStatus === 'picked_up' || 
                        normalizedStatus === 'in_transit' || 
                        normalizedStatus === 'en_route' ||
                        normalizedStatus === 'delivered';
  
  const routeGeoJSON = {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: [
        [driverLocation.lng, driverLocation.lat],
        isAfterPickup && deliveryLocation
          ? [deliveryLocation.lng, deliveryLocation.lat]
          : [pickupLocation.lng, pickupLocation.lat]
      ]
    }
  };

  if (!MAPBOX_TOKEN) {
    console.error('❌ VITE_MAPBOX_ACCESS_TOKEN is not configured. Live map tracking is unavailable.');
    return (
      <Card className="w-full h-96 flex items-center justify-center border-border bg-gradient-to-r from-orange-50 to-yellow-50">
        <CardContent className="text-center p-6">
          <MapPin className="h-12 w-12 mx-auto text-[#f99806] mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Map Unavailable</h3>
          <p className="text-gray-600 mb-4">
            The real-time map view requires Mapbox configuration.
          </p>
          <p className="text-sm text-gray-500">
            Your driver's location is still being tracked. Check the coordinates above or refresh the page.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-lg overflow-hidden shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]" data-testid="customer-tracking-map">
      <Map
        ref={mapRef}
        {...viewport}
        onMove={evt => setViewport(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />

        {/* Route line */}
        <Source id="route" type="geojson" data={routeGeoJSON}>
          <Layer
            id="route-line"
            type="line"
            paint={{
              'line-color': '#f99806',
              'line-width': 4,
              'line-dasharray': [2, 2]
            }}
          />
        </Source>

        {/* Driver's current location with pulsing animation */}
        <Marker
          latitude={driverLocation.lat}
          longitude={driverLocation.lng}
          anchor="center"
        >
          <div className="relative" data-testid="marker-driver-location">
            <div className="absolute -inset-3 bg-[#f99806] rounded-full opacity-30 animate-ping"></div>
            <div className="relative bg-[#f99806] rounded-full p-3 shadow-lg ring-4 ring-white">
              <Truck className="h-6 w-6 text-white" />
            </div>
          </div>
        </Marker>

        {/* Pickup location */}
        <Marker
          latitude={pickupLocation.lat}
          longitude={pickupLocation.lng}
          anchor="center"
        >
          <div 
            className="relative"
            data-testid="marker-pickup-location"
          >
            <div className="bg-blue-600 rounded-full p-3 shadow-lg ring-4 ring-white">
              <Package className="h-6 w-6 text-white" />
            </div>
            {!isAfterPickup && (
              <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                P
              </div>
            )}
          </div>
        </Marker>

        {/* Delivery location (if available) */}
        {deliveryLocation && (
          <Marker
            latitude={deliveryLocation.lat}
            longitude={deliveryLocation.lng}
            anchor="center"
          >
            <div 
              className="relative"
              data-testid="marker-delivery-location"
            >
              <div className="bg-green-600 rounded-full p-3 shadow-lg ring-4 ring-white">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                D
              </div>
            </div>
          </Marker>
        )}
      </Map>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)] p-3 border border-gray-200">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#f99806] rounded-full flex items-center justify-center">
              <Truck className="h-4 w-4 text-white" />
            </div>
            <span className="text-gray-900 font-medium">Driver Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Package className="h-4 w-4 text-white" />
            </div>
            <span className="text-gray-900 font-medium">Pickup Location</span>
          </div>
          {deliveryLocation && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <Home className="h-4 w-4 text-white" />
              </div>
              <span className="text-gray-900 font-medium">Delivery Location</span>
            </div>
          )}
        </div>
      </div>

      {/* Live indicator */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)] px-3 py-2 border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-semibold text-gray-900">LIVE TRACKING</span>
        </div>
      </div>

      {/* Accuracy indicator */}
      {driverLocation.accuracy && (
        <div className="absolute top-14 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)] px-3 py-1.5 border border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-700">
            <Navigation className="h-3 w-3" />
            <span>Accuracy: ±{driverLocation.accuracy}m</span>
          </div>
        </div>
      )}
    </div>
  );
}
