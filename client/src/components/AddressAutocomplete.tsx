import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { locationService, useCurrentLocation, type PlaceResult } from '@/lib/locationServices';
import { useToast } from '@/hooks/use-toast';

interface AddressAutocompleteProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (address: string, placeResult?: PlaceResult) => void;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  required?: boolean;
  className?: string;
  'data-testid'?: string;
}

export default function AddressAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  onLocationSelect,
  required = false,
  className = '',
  'data-testid': testId
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { getCurrentLocation, isLoading: locationLoading } = useCurrentLocation();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    locationService.initializeGoogleMaps().catch(err => {
      console.warn('Google Maps not configured - address autocomplete will use basic input');
      // Silently degrade - don't show error to users, just log for developers
    });
  }, [toast]);

  const searchPlaces = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await locationService.searchPlaces(query);
      setSuggestions(results);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Address search failed:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    onChange(query);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce search
    debounceTimer.current = setTimeout(() => {
      searchPlaces(query);
    }, 300);
  };

  const handleSuggestionSelect = async (suggestion: PlaceResult) => {
    try {
      const placeDetails = await locationService.getPlaceDetails(suggestion.placeId);
      onChange(placeDetails.formattedAddress, placeDetails);
      
      if (onLocationSelect) {
        onLocationSelect(placeDetails.location);
      }
      
      setShowSuggestions(false);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Failed to get place details:', error);
      toast({
        title: "Address error",
        description: "Could not load address details",
        variant: "destructive",
      });
    }
  };

  const handleCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();
      
      // Reverse geocode to get address
      if (!window.google?.maps?.Geocoder) {
        throw new Error('Google Maps not loaded');
      }
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { location: new google.maps.LatLng(location.lat, location.lng) },
        (results, status) => {
          if (status === 'OK' && results?.[0]) {
            const address = results[0].formatted_address;
            onChange(address, {
              placeId: results[0].place_id,
              formattedAddress: address,
              name: address.split(',')[0],
              location
            });
            
            if (onLocationSelect) {
              onLocationSelect(location);
            }
            
            toast({
              title: "Location found",
              description: "Current location set as pickup address",
            });
          } else {
            throw new Error('Could not determine address from location');
          }
        }
      );
    } catch (error) {
      console.error('Location error:', error);
      toast({
        title: "Location error",
        description: "Could not access your current location",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow clicking
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  return (
    <div className="relative">
      <Label htmlFor={testId} className="text-amber-800 font-medium">
        {label} {required && '*'}
      </Label>
      
      <div className="flex space-x-2 mt-1">
        <div className="relative flex-1">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-600" />
            <Input
              ref={inputRef}
              id={testId}
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              onFocus={() => value.length >= 3 && setShowSuggestions(true)}
              className={`pl-10 bg-white/80 border-amber-300 focus:border-amber-500 ${className}`}
              required={required}
              data-testid={testId}
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-600 animate-spin" />
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <Card className="absolute top-full left-0 right-0 mt-1 bg-white border border-amber-300 shadow-lg z-50 max-h-64 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.placeId}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className={`px-4 py-3 hover:bg-amber-50 cursor-pointer border-b border-amber-100 last:border-b-0 ${
                    index === selectedIndex ? 'bg-amber-50' : ''
                  }`}
                  data-testid={`suggestion-${index}`}
                >
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-amber-900 truncate">
                        {suggestion.name}
                      </p>
                      <p className="text-xs text-amber-600 truncate">
                        {suggestion.formattedAddress}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCurrentLocation}
          disabled={locationLoading}
          className="border-amber-300 text-amber-700 hover:bg-amber-50 px-3"
          data-testid="button-current-location"
        >
          {locationLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <p className="text-xs text-amber-600 mt-1">
        Start typing your address or use current location
      </p>
    </div>
  );
}