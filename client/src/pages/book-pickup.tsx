import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth-simple";
import { ArrowLeft, Package, CreditCard, Search, MapPin, Minus, Plus, User, Navigation } from "lucide-react";
import PaymentMethods from "@/components/PaymentMethods";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import StoreLocator from "@/components/StoreLocator";
import RoutePreview from "@/components/RoutePreview";
import { type Location, type PlaceResult, type RouteInfo, type NearbyStore } from "@/lib/locationServices";

// Import delivery images
import deliveryCarImg from "@assets/Delivery Driver- Box in Car_1754856749497.jpeg";
import deliveryHandoffImg from "@assets/Delivery Driver- Handoff_1754856749519.jpeg";
import deliveryOutsideImg from "@assets/Delivery Driver- outside_1754856749521.jpeg";
import deliveryReceivingImg from "@assets/Delivery Driver Receiving Box_1754856749524.jpeg";

export default function BookPickup() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to book a pickup",
        variant: "destructive",
      });
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, setLocation, toast]);

  const [formData, setFormData] = useState({
    // Customer info
    fullName: '',
    phone: '',
    // Address fields
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    // Retailer selection
    retailer: '',
    retailerQuery: '',
    // Return details
    orderName: '', // NEW: Order name like "Black Purse"
    returnReason: '',
    // Item details
    itemCategories: [] as string[], // Changed to array for multiple selection
    itemDescription: '',
    estimatedWeight: '',
    // Item details
    itemSize: 'M',
    numberOfItems: 1,
    // Preferred time slot
    preferredTimeSlot: '',
    // Instructions
    notes: '',
    // Receipt upload
    receiptPhoto: null as File | null
  });

  // Location and routing state
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null);
  const [selectedStore, setSelectedStore] = useState<NearbyStore | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [calculatedFare, setCalculatedFare] = useState<number>(0);

  const [currentStep, setCurrentStep] = useState<'details' | 'payment'>('details');
  const [totalAmount, setTotalAmount] = useState(3.99);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [showRetailerDropdown, setShowRetailerDropdown] = useState(false);
  const [filteredRetailers, setFilteredRetailers] = useState<string[]>([]);

  // Common retailers for autocomplete
  const commonRetailers = [
    'Walmart', 'Target', 'Amazon', 'Best Buy', 'Home Depot', 'Lowes', 'CVS', 'Walgreens',
    'Macys', 'Kohls', 'TJ Maxx', 'Marshall\'s', 'Costco', 'Sam\'s Club', 'Dick\'s Sporting Goods',
    'GameStop', 'Barnes & Noble', 'Bed Bath & Beyond', 'Bath & Body Works', 'Victoria\'s Secret',
    'Nike', 'Adidas', 'Old Navy', 'Gap', 'Banana Republic', 'J.Crew', 'American Eagle',
    'Hollister', 'Forever 21', 'H&M', 'Zara', 'Uniqlo', 'REI', 'Nordstrom', 'Nordstrom Rack'
  ];

  // Item categories
  const itemCategories = [
    'Electronics',
    'Clothing & Apparel', 
    'Home & Garden',
    'Beauty & Health',
    'Books & Media',
    'Other'
  ];

  // Item sizes with correct pricing per requirements
  const itemSizes = [
    { size: 'S', label: 'Small', description: 'Books, jewelry, small electronics', basePrice: 3.99, upcharge: 0 },
    { size: 'M', label: 'Medium', description: 'Clothing, shoes, small home goods', basePrice: 3.99, upcharge: 0 },
    { size: 'L', label: 'Large', description: 'Small appliances, multiple items', basePrice: 3.99, upcharge: 2.00 },
    { size: 'XL', label: 'Extra Large', description: 'Large electronics, furniture pieces', basePrice: 3.99, upcharge: 4.00 }
  ];

  // Return reasons dropdown options
  const returnReasons = [
    "Doesn't fit",
    "Wrong item", 
    "Damaged item",
    "No longer needed",
    "Received extra item",
    "Defective product",
    "Other"
  ];

  // Time slot options
  const timeSlots = [
    "Morning (8 AM - 12 PM)",
    "Afternoon (12 PM - 5 PM)", 
    "Evening (5 PM - 8 PM)"
  ];

  // Calculate total price - use route-based fare if available, otherwise use item-based pricing
  const calculateTotal = () => {
    if (calculatedFare > 0) {
      const multiItemFee = formData.numberOfItems > 1 ? (formData.numberOfItems - 1) * 1.00 : 0;
      return calculatedFare + multiItemFee;
    }
    
    const selectedItemSize = itemSizes.find(item => item.size === formData.itemSize);
    const basePrice = selectedItemSize?.basePrice || 3.99;
    const sizeUpcharge = selectedItemSize?.upcharge || 0;
    const multiItemFee = formData.numberOfItems > 1 ? (formData.numberOfItems - 1) * 1.00 : 0;
    
    return basePrice + sizeUpcharge + multiItemFee;
  };

  // Handle location updates
  const handlePickupLocationSelect = (location: Location) => {
    setPickupLocation(location);
  };

  const handleStoreSelect = (store: NearbyStore) => {
    setSelectedStore(store);
    setDropoffLocation(store.location);
    setFormData(prev => ({ 
      ...prev, 
      retailer: store.name 
    }));
  };

  const handleFareCalculated = (fare: number, route: RouteInfo) => {
    setCalculatedFare(fare);
    setRouteInfo(route);
  };

  // Handle retailer search
  const handleRetailerSearch = (query: string) => {
    setFormData(prev => ({ ...prev, retailerQuery: query }));
    
    if (query.length > 0) {
      const filtered = commonRetailers.filter(retailer =>
        retailer.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredRetailers(filtered.slice(0, 8)); // Show top 8 matches
      setShowRetailerDropdown(true);
    } else {
      setShowRetailerDropdown(false);
    }
  };

  // Select retailer from dropdown
  const selectRetailer = (retailer: string) => {
    setFormData(prev => ({ ...prev, retailer, retailerQuery: retailer }));
    setShowRetailerDropdown(false);
  };

  // Update total when form data changes
  useEffect(() => {
    setTotalAmount(calculateTotal());
  }, [formData.itemSize, formData.numberOfItems]);

  const createOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/orders', 'POST', data);
    },
    onSuccess: (order: any) => {
      toast({
        title: "Order Created!",
        description: "Proceeding to payment...",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      // Navigate to checkout page with order details
      setTimeout(() => {
        setLocation(`/checkout?amount=${order.totalPrice}&orderId=${order.id}`);
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Booking failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  });

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const required = ['fullName', 'phone', 'streetAddress', 'city', 'state', 'zipCode', 'retailer', 'orderName', 'returnReason', 'preferredTimeSlot'];
    const missing = required.filter(field => !formData[field as keyof typeof formData]);
    
    if (formData.itemCategories.length === 0) {
      missing.push('itemCategories');
    }
    
    if (missing.length > 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep('payment');
  };

  const handlePaymentSelect = (method: string, details?: any) => {
    setSelectedPaymentMethod(method);
    
    const orderData = {
      streetAddress: formData.streetAddress,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      retailer: formData.retailer,
      itemCategory: formData.itemCategories.join(', '), // Convert array to comma-separated string
      itemDescription: formData.itemDescription,
      estimatedWeight: formData.estimatedWeight,
      itemSize: formData.itemSize,
      numberOfItems: formData.numberOfItems,
      notes: formData.notes,
      paymentMethod: method,
      paymentDetails: details,
      totalAmount
    };

    createOrderMutation.mutate(orderData);
    
    // Navigate to checkout page with order details after successful order creation
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'numberOfItems' ? parseInt(value as string) : value
    }));
  };

  // Handle multiple item category selection
  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      itemCategories: prev.itemCategories.includes(category)
        ? prev.itemCategories.filter(c => c !== category)
        : [...prev.itemCategories, category]
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-200 via-yellow-100 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <img 
            src="/logo-cardboard-deep.png" 
            alt="Returnly Logo" 
            className="h-16 w-auto mx-auto mb-4 animate-pulse"
          />
          <p className="text-amber-800">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // Random delivery image selection for this page
  const bookingPageImages = [deliveryCarImg, deliveryHandoffImg, deliveryOutsideImg, deliveryReceivingImg];
  const selectedImage = bookingPageImages[Math.floor(Math.random() * bookingPageImages.length)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-200 via-yellow-100 to-orange-100 relative">
      {/* Background Hero Image */}
      <div 
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: `url(${selectedImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/')}
              className="text-amber-800 hover:text-amber-900"
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Link href="/">
              <img 
                src="/logo-cardboard-deep.png" 
                alt="Returnly Logo" 
                className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
            <span className="text-xl font-bold text-amber-900">Book Pickup</span>
          </div>
          <div className="text-amber-800 text-sm">
            Welcome, {user?.username}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-900">
              <Package className="h-5 w-5 mr-2" />
              Schedule Return Pickup
            </CardTitle>
            <CardDescription>
              Fill out the details below to schedule your return pickup
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleDetailsSubmit}>
            <CardContent className="space-y-6">
              {/* Customer Information Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <User className="h-5 w-5 text-amber-600" />
                  <Label className="text-amber-800 font-semibold text-lg">Contact Information</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName" className="text-amber-800 font-medium">
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="bg-white/80 border-amber-300 focus:border-amber-500"
                      required
                      data-testid="input-full-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-amber-800 font-medium">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="bg-white/80 border-amber-300 focus:border-amber-500"
                      required
                      data-testid="input-phone"
                    />
                  </div>
                </div>
              </div>

              {/* Enhanced Pickup Address Section with Google Autocomplete */}
              <div className="space-y-4">
                <AddressAutocomplete
                  label="Pickup Address"
                  placeholder="Enter your pickup address"
                  value={formData.streetAddress}
                  onChange={(address, placeResult) => {
                    handleInputChange('streetAddress', address);
                    if (placeResult) {
                      handlePickupLocationSelect(placeResult.location);
                    }
                  }}
                  onLocationSelect={handlePickupLocationSelect}
                  required
                  data-testid="input-pickup-address"
                />
              </div>

              {/* Order Details Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Package className="h-5 w-5 text-amber-600" />
                  <Label className="text-amber-800 font-semibold text-lg">Return Details</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="orderName" className="text-amber-800 font-medium">
                      Order Name/Description *
                    </Label>
                    <Input
                      id="orderName"
                      type="text"
                      placeholder="e.g., Black Purse, Nike Shoes"
                      value={formData.orderName}
                      onChange={(e) => handleInputChange('orderName', e.target.value)}
                      className="bg-white/80 border-amber-300 focus:border-amber-500"
                      required
                      data-testid="input-order-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="returnReason" className="text-amber-800 font-medium">
                      Return Reason *
                    </Label>
                    <Select value={formData.returnReason} onValueChange={(value) => handleInputChange('returnReason', value)}>
                      <SelectTrigger className="bg-white/80 border-amber-300 focus:border-amber-500" data-testid="select-return-reason">
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {returnReasons.map((reason) => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Enhanced Retailer Selection with Store Locator */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Search className="h-5 w-5 text-amber-600" />
                  <Label className="text-amber-800 font-semibold text-lg">Return to Retailer</Label>
                </div>
                
                <div className="relative">
                  <Label htmlFor="retailerSearch" className="text-amber-800 font-medium">
                    Start typing retailer name *
                  </Label>
                  <Input
                    id="retailerSearch"
                    type="text"
                    placeholder="e.g., Walmart, Target, Amazon..."
                    value={formData.retailerQuery}
                    onChange={(e) => handleRetailerSearch(e.target.value)}
                    onFocus={() => formData.retailerQuery.length > 0 && setShowRetailerDropdown(true)}
                    className="bg-white/80 border-amber-300 focus:border-amber-500"
                    required
                    data-testid="input-retailer-search"
                  />
                  
                  {showRetailerDropdown && filteredRetailers.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-amber-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                      {filteredRetailers.map((retailer, index) => (
                        <div
                          key={index}
                          onClick={() => selectRetailer(retailer)}
                          className="px-4 py-2 hover:bg-amber-50 cursor-pointer border-b border-amber-100 last:border-b-0"
                          data-testid={`option-retailer-${index}`}
                        >
                          {retailer}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {formData.retailer && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-amber-700 bg-amber-50/60 p-2 rounded">
                      <span>Selected:</span>
                      <span className="font-medium">{formData.retailer}</span>
                    </div>
                    
                    {/* Store Locator */}
                    <StoreLocator
                      retailerName={formData.retailer}
                      onStoreSelect={handleStoreSelect}
                      customerLocation={pickupLocation || undefined}
                    />
                  </div>
                )}
              </div>

              {/* Item Categories - Multiple Selection */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Package className="h-5 w-5 text-amber-600" />
                  <Label className="text-amber-800 font-semibold text-lg">Item Categories</Label>
                </div>
                <p className="text-sm text-amber-700 mb-3">Select all categories that apply to your return items *</p>
                
                <div className="grid grid-cols-2 gap-3">
                  {itemCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={formData.itemCategories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                        data-testid={`checkbox-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                      />
                      <Label
                        htmlFor={`category-${category}`}
                        className="text-sm font-normal text-amber-800 cursor-pointer"
                      >
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
                
                {formData.itemCategories.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-amber-700 bg-amber-50/60 p-2 rounded">
                    <span>Selected:</span>
                    <span className="font-medium">{formData.itemCategories.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Estimated Weight */}
              <div className="space-y-2">
                <Label htmlFor="estimatedWeight" className="text-amber-800 font-medium">
                  Estimated Weight (optional)
                </Label>
                <Input
                  id="estimatedWeight"
                  type="text"
                  placeholder="e.g., 2 lbs, 5 lbs, 10+ lbs"
                  value={formData.estimatedWeight}
                  onChange={(e) => handleInputChange('estimatedWeight', e.target.value)}
                  className="bg-white/80 border-amber-300 focus:border-amber-500"
                  data-testid="input-estimated-weight"
                />
                <p className="text-xs text-amber-600">Help our drivers prepare for pickup</p>
              </div>

              {/* Item Description */}
              <div className="space-y-2">
                <Label htmlFor="itemDescription" className="text-amber-800 font-medium">
                  Item Description (optional)
                </Label>
                <Textarea
                  id="itemDescription"
                  placeholder="Describe what you're returning (optional)..."
                  value={formData.itemDescription}
                  onChange={(e) => handleInputChange('itemDescription', e.target.value)}
                  className="bg-white/80 border-amber-300 focus:border-amber-500"
                  rows={3}
                  data-testid="textarea-item-description"
                />
              </div>

              {/* Item Size and Quantity */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Package className="h-5 w-5 text-amber-600" />
                  <Label className="text-amber-800 font-semibold text-lg">Item Details</Label>
                </div>
                <p className="text-sm text-amber-700 mb-3">Select the size of each individual item you're returning</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="itemSize" className="text-amber-800 font-medium">
                      Item Size *
                    </Label>
                    <Select
                      value={formData.itemSize}
                      onValueChange={(value) => handleInputChange('itemSize', value)}
                      required
                    >
                      <SelectTrigger data-testid="select-item-size">
                        <SelectValue placeholder="Select item size" />
                      </SelectTrigger>
                      <SelectContent>
                        {itemSizes.map((item) => (
                          <SelectItem key={item.size} value={item.size}>
                            <div className="flex flex-col">
                              <span className="font-medium">{item.label}</span>
                              <span className="text-xs text-gray-500">{item.description}</span>
                              {item.upcharge > 0 && <span className="text-xs text-amber-600">+${item.upcharge.toFixed(2)}</span>}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="numberOfItems" className="text-amber-800 font-medium">
                      Number of Items *
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleInputChange('numberOfItems', Math.max(1, formData.numberOfItems - 1).toString())}
                        disabled={formData.numberOfItems <= 1}
                        data-testid="button-decrease-items"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="px-3 py-2 bg-amber-50 border border-amber-300 rounded text-center min-w-[60px]" data-testid="text-item-count">
                        {formData.numberOfItems}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleInputChange('numberOfItems', Math.min(10, formData.numberOfItems + 1).toString())}
                        disabled={formData.numberOfItems >= 10}
                        data-testid="button-increase-items"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-amber-600 mt-1">Each additional item +$1.00</p>
                  </div>
                </div>
              </div>

              {/* Preferred Time Slot */}
              <div className="space-y-2">
                <Label htmlFor="preferredTimeSlot" className="text-amber-800 font-medium">
                  Preferred Pickup Time *
                </Label>
                <Select value={formData.preferredTimeSlot} onValueChange={(value) => handleInputChange('preferredTimeSlot', value)}>
                  <SelectTrigger className="bg-white/80 border-amber-300 focus:border-amber-500" data-testid="select-time-slot">
                    <SelectValue placeholder="Select preferred time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Receipt Upload */}
              <div className="space-y-2">
                <Label htmlFor="receiptPhoto" className="text-amber-800 font-medium">
                  Receipt or Return Label (optional)
                </Label>
                <Input
                  id="receiptPhoto"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFormData(prev => ({ ...prev, receiptPhoto: file }));
                  }}
                  className="bg-white/80 border-amber-300 focus:border-amber-500"
                  data-testid="input-receipt-photo"
                />
                <p className="text-xs text-amber-600">Upload a photo of your receipt or prepaid return label</p>
              </div>

              {/* Optional Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-amber-800 font-medium">
                  Special Instructions (optional)
                </Label>
                <Textarea
                  id="notes"
                  data-testid="textarea-notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any special pickup instructions..."
                  rows={3}
                  className="bg-white/80 border-amber-300 focus:border-amber-500"
                />
              </div>

              {/* Route Preview and Dynamic Pricing */}
              {pickupLocation && dropoffLocation && (
                <RoutePreview
                  pickupLocation={pickupLocation}
                  dropoffLocation={dropoffLocation}
                  pickupAddress={formData.streetAddress}
                  dropoffAddress={selectedStore?.address || formData.retailer}
                  onFareCalculated={handleFareCalculated}
                />
              )}

              {/* Dynamic Pricing - Route-based or fallback to item-based */}
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="space-y-2">
                  {routeInfo ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-amber-800">Distance-based fare ({routeInfo.distance}):</span>
                        <span className="text-amber-900 font-medium">
                          ${calculatedFare.toFixed(2)}
                        </span>
                      </div>
                      
                      {formData.numberOfItems > 1 && (
                        <div className="flex justify-between items-center">
                          <span className="text-amber-800">Additional items ({formData.numberOfItems - 1} × $1.00):</span>
                          <span className="text-amber-900 font-medium">+${((formData.numberOfItems - 1) * 1.00).toFixed(2)}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-amber-800">Base service fee:</span>
                        <span className="text-amber-900 font-medium">$3.99</span>
                      </div>
                      
                      {(() => {
                        const selectedSize = itemSizes.find(item => item.size === formData.itemSize);
                        return selectedSize?.upcharge && selectedSize.upcharge > 0 ? (
                          <div className="flex justify-between items-center">
                            <span className="text-amber-800">{selectedSize.label} item upcharge:</span>
                            <span className="text-amber-900 font-medium">+${selectedSize.upcharge.toFixed(2)}</span>
                          </div>
                        ) : null;
                      })()}
                      
                      {formData.numberOfItems > 1 && (
                        <div className="flex justify-between items-center">
                          <span className="text-amber-800">Additional items ({formData.numberOfItems - 1} × $1.00):</span>
                          <span className="text-amber-900 font-medium">+${((formData.numberOfItems - 1) * 1.00).toFixed(2)}</span>
                        </div>
                      )}
                      
                      {(() => {
                        const selectedSize = itemSizes.find(item => item.size === formData.itemSize);
                        const basePrice = selectedSize?.basePrice || 3.99;
                        const sizeUpcharge = selectedSize?.upcharge || 0;
                        const multiItemFee = formData.numberOfItems > 1 ? (formData.numberOfItems - 1) * 1.00 : 0;
                        const currentSubtotal = basePrice + sizeUpcharge + multiItemFee;
                        
                        return currentSubtotal < 8.00 ? (
                          <div className="flex justify-between items-center">
                            <span className="text-amber-800">Small order fee (under $8):</span>
                            <span className="text-amber-900 font-medium">+$2.00</span>
                          </div>
                        ) : null;
                      })()}
                    </>
                  )}
                  
                  <hr className="border-amber-300" />
                  <div className="flex justify-between items-center">
                    <span className="text-amber-900 font-semibold text-lg">Total:</span>
                    <span className="text-amber-900 font-bold text-xl" data-testid="text-total-amount">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                  
                  {routeInfo && (
                    <p className="text-xs text-amber-600 mt-2">
                      ETA: {routeInfo.duration} • Fare locked at booking
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-3"
                  disabled={createOrderMutation.isPending}
                  data-testid="button-book-pickup"
                >
                  {createOrderMutation.isPending ? "Booking Pickup..." : `Book Pickup - $${totalAmount.toFixed(2)}`}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}