import { MapProvider, MAP_PROVIDERS, MapProviderType } from '@/../../shared/types/mapProvider';
import { useMapProvider } from '@/contexts/MapProviderContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Map, Navigation, Satellite, Cloud, Moon, Check } from 'lucide-react';

export default function MapProviderSelector() {
  const {
    currentProvider,
    setProvider,
    preferences,
    updatePreferences,
    isProviderAvailable,
    availableProviders,
  } = useMapProvider();

  return (
    <Card className="border-border" data-testid="map-provider-selector">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Map className="h-5 w-5 text-[#f99806]" />
          <CardTitle>Map Provider</CardTitle>
        </div>
        <CardDescription>
          Choose your preferred map service for tracking and navigation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider Selection */}
        <RadioGroup
          value={currentProvider}
          onValueChange={(value) => setProvider(value as MapProvider)}
          className="space-y-3"
        >
          {Object.values(MAP_PROVIDERS).map((provider) => {
            const isAvailable = isProviderAvailable(provider.id);
            const isSelected = currentProvider === provider.id;

            return (
              <div
                key={provider.id}
                className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-[#f99806] bg-amber-50 dark:bg-amber-950/20'
                    : 'border-border bg-white dark:bg-gray-900'
                } ${!isAvailable ? 'opacity-50' : 'cursor-pointer hover:border-[#f99806]/50'}`}
                onClick={() => isAvailable && setProvider(provider.id)}
                data-testid={`card-${provider.id}`}
              >
                <RadioGroupItem
                  value={provider.id}
                  id={provider.id}
                  disabled={!isAvailable}
                  className="mt-1 pointer-events-none"
                  data-testid={`radio-${provider.id}`}
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor={provider.id}
                      className={`font-semibold text-base ${
                        !isAvailable ? 'text-gray-400' : ''
                      }`}
                    >
                      {provider.name}
                    </Label>
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <Badge variant="default" className="bg-[#f99806] hover:bg-[#f99806]">
                          <Check className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                      {!isAvailable && (
                        <Badge variant="outline" className="text-xs">
                          API Key Required
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={
                          provider.pricing === 'free'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : provider.pricing === 'paid'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }
                      >
                        {provider.pricing === 'free' ? 'Free' : provider.pricing === 'paid' ? 'Paid' : 'Freemium'}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {provider.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {provider.features.realTimeTracking && (
                      <Badge variant="secondary" className="text-xs">
                        <Navigation className="h-3 w-3 mr-1" />
                        Live Tracking
                      </Badge>
                    )}
                    {provider.features.turnByTurnNavigation && (
                      <Badge variant="secondary" className="text-xs">
                        <Navigation className="h-3 w-3 mr-1" />
                        Turn-by-Turn
                      </Badge>
                    )}
                    {provider.features.satelliteView && (
                      <Badge variant="secondary" className="text-xs">
                        <Satellite className="h-3 w-3 mr-1" />
                        Satellite
                      </Badge>
                    )}
                    {provider.features.trafficData && (
                      <Badge variant="secondary" className="text-xs">
                        <Cloud className="h-3 w-3 mr-1" />
                        Traffic
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </RadioGroup>

        {/* Map Display Options */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h4 className="font-semibold text-sm">Display Options</h4>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-traffic">Show Traffic</Label>
              <p className="text-xs text-gray-500">Display real-time traffic conditions</p>
            </div>
            <Switch
              id="show-traffic"
              checked={preferences.showTraffic}
              onCheckedChange={(checked) => updatePreferences({ showTraffic: checked })}
              data-testid="switch-show-traffic"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="satellite-view">Satellite View</Label>
              <p className="text-xs text-gray-500">Use satellite imagery instead of street maps</p>
            </div>
            <Switch
              id="satellite-view"
              checked={preferences.showSatelliteView}
              onCheckedChange={(checked) => updatePreferences({ showSatelliteView: checked })}
              data-testid="switch-satellite-view"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode-map">Dark Mode Maps</Label>
              <p className="text-xs text-gray-500">Use dark theme for map display</p>
            </div>
            <Switch
              id="dark-mode-map"
              checked={preferences.darkModeMap}
              onCheckedChange={(checked) => updatePreferences({ darkModeMap: checked })}
              data-testid="switch-dark-mode"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-3d">Auto 3D Buildings</Label>
              <p className="text-xs text-gray-500">Show 3D buildings when zoomed in</p>
            </div>
            <Switch
              id="auto-3d"
              checked={preferences.auto3D}
              onCheckedChange={(checked) => updatePreferences({ auto3D: checked })}
              data-testid="switch-auto-3d"
            />
          </div>
        </div>

        {/* Info about available providers */}
        {availableProviders.length < Object.keys(MAP_PROVIDERS).length && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Some map providers require API keys. Contact your administrator to enable additional providers.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
