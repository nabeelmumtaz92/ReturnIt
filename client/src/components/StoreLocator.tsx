import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Navigation, Clock, Store, Loader2 } from 'lucide-react';
import { locationService, useCurrentLocation, type Location, type NearbyStore } from '@/lib/locationServices';
import { useToast } from '@/hooks/use-toast';

interface StoreLocatorProps {
  retailerName: string;
  onStoreSelect: (store: NearbyStore) => void;
  customerLocation?: Location;
  className?: string;
}

export default function StoreLocator({ 
  retailerName, 
  onStoreSelect, 
  customerLocation,
  className = '' 
}: StoreLocatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stores, setStores] = useState<NearbyStore[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState<NearbyStore | null>(null);
  const { getCurrentLocation } = useCurrentLocation();
  const { toast } = useToast();

  const searchNearbyStores = async (location: Location) => {
    setIsLoading(true);
    try {
      const nearbyStores = await locationService.findNearbyStores(location, retailerName);
      setStores(nearbyStores);
      
      if (nearbyStores.length === 0) {
        toast({
          title: "No stores found",
          description: `No ${retailerName} stores found nearby`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Store search failed:', error);
      toast({
        title: "Search failed",
        description: "Could not search for nearby stores",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoreLocatorOpen = async () => {
    setIsOpen(true);
    
    try {
      let searchLocation = customerLocation;
      
      if (!searchLocation) {
        searchLocation = await getCurrentLocation();
      }
      
      await searchNearbyStores(searchLocation);
    } catch (error) {
      console.error('Location error:', error);
      toast({
        title: "Location required",
        description: "Please enable location access to find nearby stores",
        variant: "destructive",
      });
    }
  };

  const handleStoreSelection = (store: NearbyStore) => {
    setSelectedStore(store);
    onStoreSelect(store);
    setIsOpen(false);
    
    toast({
      title: "Store selected",
      description: `${store.name} - ${store.address}`,
    });
  };

  const handleNavigateToStore = (store: NearbyStore) => {
    locationService.openNavigationApp(store.location);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            onClick={handleStoreLocatorOpen}
            className={`border-amber-300 text-amber-700 hover:bg-amber-50 ${className}`}
            data-testid="button-store-locator"
          >
            <Store className="h-4 w-4 mr-2" />
            Find Nearest {retailerName}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-amber-900 flex items-center">
              <Store className="h-5 w-5 mr-2" />
              Nearby {retailerName} Stores
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                <span className="ml-2 text-amber-700">Finding nearby stores...</span>
              </div>
            ) : stores.length > 0 ? (
              <div className="space-y-3">
                {stores.map((store, index) => (
                  <Card 
                    key={store.placeId}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedStore?.placeId === store.placeId 
                        ? 'border-amber-500 bg-amber-50' 
                        : 'border-amber-200 hover:border-amber-300'
                    }`}
                    onClick={() => handleStoreSelection(store)}
                    data-testid={`store-option-${index}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-amber-900 truncate">
                              {store.name}
                            </h3>
                            {store.isOpen ? (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Open
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Closed
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-amber-600 mb-2 line-clamp-2">
                            {store.address}
                          </p>
                          
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center text-sm text-amber-700">
                              <MapPin className="h-3 w-3 mr-1" />
                              {store.distance}
                            </div>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavigateToStore(store);
                              }}
                              className="border-blue-300 text-blue-700 hover:bg-blue-50 h-7 px-2"
                              data-testid={`navigate-to-store-${index}`}
                            >
                              <Navigation className="h-3 w-3 mr-1" />
                              Navigate
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Store className="h-12 w-12 text-amber-300 mx-auto mb-3" />
                <p className="text-amber-600 mb-2">No stores found nearby</p>
                <p className="text-sm text-amber-500">
                  Try searching for a different retailer or location
                </p>
              </div>
            )}
          </div>
          
          {stores.length > 0 && (
            <div className="border-t border-amber-200 pt-4">
              <p className="text-xs text-amber-600 text-center">
                Tap a store to select it as your drop-off location
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {selectedStore && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Store className="h-4 w-4 text-amber-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-900 truncate">
                Drop-off: {selectedStore.name}
              </p>
              <p className="text-xs text-amber-600 truncate">
                {selectedStore.address} • {selectedStore.distance}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleNavigateToStore(selectedStore)}
              className="text-blue-600 hover:text-blue-700 h-auto p-1"
            >
              <Navigation className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}