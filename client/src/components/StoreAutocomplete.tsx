import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { MapPin, Loader2, Store } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface StoreLocation {
  id: number;
  googlePlaceId: string | null;
  retailerName: string;
  storeName: string;
  displayName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  formattedAddress: string | null;
  phoneNumber: string | null;
  website: string | null;
  latitude: string | null;
  longitude: string | null;
  category: string | null;
  isActive: boolean;
  acceptsReturns: boolean;
  acceptsThirdPartyReturns: boolean; // Critical: Can non-purchaser return items?
  thirdPartyReturnNotes: string | null; // Special requirements
  isAnyLocation?: boolean; // Flag for "any location" option
}

interface StoreAutocompleteProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (storeName: string) => void;
  onStoreSelect?: (store: StoreLocation) => void;
  required?: boolean;
  className?: string;
  'data-testid'?: string;
}

export default function StoreAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  onStoreSelect,
  required = false,
  className = '',
  'data-testid': testId
}: StoreAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Fetch store locations - shows all stores when empty, filters when typing
  const { data: storeLocations = [], isLoading } = useQuery<StoreLocation[]>({
    queryKey: ['/api/stores/search', value],
    queryFn: async () => {
      // Pass empty string when value is empty to get all stores, otherwise filter
      const query = value.trim() === '' ? '' : value;
      // When empty, fetch ALL stores (limit 1000), when filtering use smaller limit
      const limit = query === '' ? 1000 : 100;
      const response = await fetch(`/api/stores/search?query=${encodeURIComponent(query)}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to search stores');
      return response.json();
    },
    enabled: true, // Always enabled so dropdown can show on focus
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    onChange(query);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Show suggestions immediately when typing (or when empty for dropdown behavior)
    debounceTimer.current = setTimeout(() => {
      setShowSuggestions(true);
      setSelectedIndex(-1);
    }, 300);
  };

  const handleStoreSelect = (store: StoreLocation) => {
    console.log('🔵 StoreAutocomplete handleStoreSelect called with:', store);
    console.log('🔵 onStoreSelect callback exists?', !!onStoreSelect);
    
    if (store.isAnyLocation) {
      onChange(store.storeName + ' (Any Location)');
    } else {
      onChange(store.storeName);
    }
    
    if (onStoreSelect) {
      console.log('🔵 Calling onStoreSelect callback with store data');
      onStoreSelect(store);
    } else {
      console.warn('⚠️ onStoreSelect callback is not defined!');
    }
    
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;
    
    // Calculate total options (any location option + specific locations)
    const totalOptions = storeLocations.length > 0 ? storeLocations.length + 1 : 0;
    
    if (totalOptions === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < totalOptions - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < totalOptions) {
          // First option is "any location"
          if (selectedIndex === 0 && storeLocations.length > 0) {
            handleAnyLocationSelect();
          } else if (selectedIndex > 0 && selectedIndex <= storeLocations.length) {
            handleStoreSelect(storeLocations[selectedIndex - 1]);
          }
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleAnyLocationSelect = () => {
    if (storeLocations.length === 0) return;
    
    const firstStore = storeLocations[0];
    const anyLocationOption: StoreLocation = {
      ...firstStore,
      id: -1,
      isAnyLocation: true,
      displayName: `Any ${firstStore.storeName} Location`,
      streetAddress: 'Driver will deliver to nearest location',
      city: '',
      state: '',
      zipCode: ''
    };
    
    handleStoreSelect(anyLocationOption);
  };

  return (
    <div className={`relative ${className}`}>
      <Label htmlFor="store-autocomplete" className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative mt-1.5">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Store className="h-4 w-4" />
        </div>
        <Input
          ref={inputRef}
          id="store-autocomplete"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            console.log('🔵 Input focused, showing suggestions');
            setShowSuggestions(true);
          }}
          onBlur={() => {
            // Delay to allow click on suggestion
            console.log('🔵 Input blurred, hiding suggestions in 300ms');
            setTimeout(() => setShowSuggestions(false), 300);
          }}
          className="pl-10 pr-10"
          required={required}
          data-testid={testId}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && storeLocations.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 max-h-[300px] overflow-y-auto shadow-lg border border-border">
          <div className="py-1">
            {/* Any Location Option */}
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                console.log('🔵 Any Location clicked');
                handleAnyLocationSelect();
              }}
              className={`w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b border-border ${
                selectedIndex === 0 ? 'bg-accent' : ''
              }`}
              data-testid="store-suggestion-any-location"
            >
              <div className="flex items-start gap-3">
                <Store className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-primary">
                    Any {storeLocations[0].storeName} Location
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Driver will deliver to nearest location
                  </div>
                </div>
              </div>
            </button>

            {/* Specific Location Options */}
            {storeLocations.map((store, index) => (
              <button
                key={store.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  console.log('🔵 Store clicked (mouseDown):', store.storeName);
                  handleStoreSelect(store);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  console.log('🔵 Store clicked (onClick):', store.storeName);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-accent transition-colors ${
                  index + 1 === selectedIndex ? 'bg-accent' : ''
                }`}
                data-testid={`store-suggestion-${index}`}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">
                      {store.displayName || store.storeName}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {store.formattedAddress || `${store.streetAddress}, ${store.city}, ${store.state} ${store.zipCode}`}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* No results message */}
      {showSuggestions && !isLoading && value.length >= 2 && storeLocations.length === 0 && (
        <Card className="absolute z-50 w-full mt-1 shadow-lg border border-border">
          <div className="px-4 py-3 text-sm text-muted-foreground">
            No stores found matching "{value}"
          </div>
        </Card>
      )}
    </div>
  );
}
