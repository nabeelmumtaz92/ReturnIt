import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Truck, Circle, Phone, Star } from "lucide-react";
import { useState } from "react";
import UniversalMap, { MapMarker } from "@/components/UniversalMap";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DriverLocation {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  isOnline: boolean;
  currentLocation: {
    latitude: number;
    longitude: number;
  } | null;
  driverRating: number;
  vehicleInfo: {
    make: string;
    model: string;
    year: string;
    color: string;
    licensePlate: string;
  };
}

export default function DriverLocations() {
  const [selectedDriver, setSelectedDriver] = useState<DriverLocation | null>(null);

  // Fetch active drivers with tracking data
  const { data: drivers, isLoading } = useQuery<DriverLocation[]>({
    queryKey: ['/api/admin/drivers/tracking'],
    refetchInterval: 10000, // Refresh every 10 seconds for real-time updates
  });

  // Convert drivers to map markers
  const markers: MapMarker[] = (drivers || [])
    .filter(driver => driver.currentLocation)
    .map(driver => ({
      id: driver.id.toString(),
      latitude: driver.currentLocation!.latitude,
      longitude: driver.currentLocation!.longitude,
      label: `${driver.firstName} ${driver.lastName}`,
      color: driver.isOnline ? '#22c55e' : '#64748b',
      onClick: () => setSelectedDriver(driver),
    }));

  const onlineDrivers = drivers?.filter(d => d.isOnline) || [];
  const driversWithLocation = drivers?.filter(d => d.currentLocation) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Driver Locations</h1>
        <p className="text-muted-foreground">Real-time driver tracking and location monitoring</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Circle className="h-5 w-5 text-green-600 fill-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Online Drivers</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-online-drivers">
                  {isLoading ? "..." : onlineDrivers.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Drivers</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-total-drivers">
                  {isLoading ? "..." : drivers?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#B8956A]/20 p-3 rounded-full">
                <MapPin className="h-5 w-5 text-[#B8956A]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tracked Drivers</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-tracked-drivers">
                  {isLoading ? "..." : driversWithLocation.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Live Driver Tracking Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-[500px] bg-muted/30 rounded-lg">
              <div className="text-center">
                <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                <p className="text-muted-foreground">Loading driver locations...</p>
              </div>
            </div>
          ) : driversWithLocation.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[500px] bg-muted/30 rounded-lg">
              <MapPin className="h-12 w-12 mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-center">
                No active drivers with location data available
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Drivers will appear on the map once they go online and share their location
              </p>
            </div>
          ) : (
            <div className="h-[500px] rounded-lg overflow-hidden border border-border" data-testid="map-container">
              <UniversalMap
                initialLatitude={38.6270} // St. Louis coordinates
                initialLongitude={-90.1994}
                initialZoom={11}
                markers={markers}
                showControls={true}
                showGeolocate={false}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Driver Details Modal */}
      <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-[#B8956A]" />
              Driver Details
            </DialogTitle>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-4">
              {/* Driver Info */}
              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <div className="bg-[#B8956A]/20 p-2 rounded-full">
                  <Truck className="h-5 w-5 text-[#B8956A]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {selectedDriver.firstName} {selectedDriver.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{selectedDriver.email}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedDriver.isOnline 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {selectedDriver.isOnline ? 'Online' : 'Offline'}
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedDriver.phone}</span>
                </div>
                {selectedDriver.driverRating > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span>{selectedDriver.driverRating.toFixed(1)} rating</span>
                  </div>
                )}
              </div>

              {/* Vehicle Info */}
              {selectedDriver.vehicleInfo && (
                <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium text-sm text-muted-foreground">Vehicle Information</h4>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Vehicle:</span>{' '}
                      {selectedDriver.vehicleInfo.year} {selectedDriver.vehicleInfo.make} {selectedDriver.vehicleInfo.model}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Color:</span> {selectedDriver.vehicleInfo.color}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">License Plate:</span> {selectedDriver.vehicleInfo.licensePlate}
                    </p>
                  </div>
                </div>
              )}

              {/* Location */}
              {selectedDriver.currentLocation && (
                <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Current Location
                  </h4>
                  <p className="text-sm font-mono">
                    {selectedDriver.currentLocation.latitude.toFixed(6)}, {selectedDriver.currentLocation.longitude.toFixed(6)}
                  </p>
                </div>
              )}

              <Button 
                onClick={() => setSelectedDriver(null)}
                className="w-full bg-[#B8956A] hover:bg-[#A0805A]"
                data-testid="button-close-driver-details"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
