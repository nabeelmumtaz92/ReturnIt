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
import { ArrowLeft, Package, CreditCard, Search, MapPin, Minus, Plus, User, Navigation, Home, Shield, AlertTriangle, Clock } from "lucide-react";
import PaymentMethods from "@/components/PaymentMethods";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import StoreLocator from "@/components/StoreLocator";
import RoutePreview from "@/components/RoutePreview";
import { PaymentBreakdown } from "@/components/PaymentBreakdown";
import { calculatePaymentWithValue, getItemSizeByValue } from "@shared/paymentCalculator";
import type { RouteInfo as PaymentRouteInfo } from "@shared/paymentCalculator";
import { type Location, type PlaceResult, type RouteInfo, type NearbyStore } from "@/lib/locationServices";
import Footer from "@/components/Footer";

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
    itemValue: '',
    // Preferred time slot
    preferredTimeSlot: '',
    // Pickup location preference
    pickupLocation: 'inside', // 'inside' or 'outside'
    pickupInstructions: '', // Special instructions for outside pickup
    // Instructions
    notes: '',
    // Receipt upload
    receiptPhoto: null as File | null,
    // Liability acceptance
    acceptsLiabilityTerms: false,
    
    // Return Authorization Fields
    purchaseType: '', // 'online' or 'in_store'
    hasOriginalTags: false,
    receiptUploaded: false,
    returnLabelFile: null as File | null, // For online returns
    authorizationSigned: false
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

  // Item sizes based on value ranges - all standardized to $3.99
  const itemSizes = [
    { size: 'S', label: 'Small', description: 'Under $25 (jewelry, books, small items)', basePrice: 3.99, upcharge: 0, valueRange: 'Under $25' },
    { size: 'M', label: 'Medium', description: '$25-$99 (clothing, shoes, electronics)', basePrice: 3.99, upcharge: 0, valueRange: '$25-$99' },
    { size: 'L', label: 'Large', description: '$100-$299 (appliances, multiple items)', basePrice: 3.99, upcharge: 0, valueRange: '$100-$299' },
    { size: 'XL', label: 'Extra Large', description: '$300+ (furniture, large electronics)', basePrice: 3.99, upcharge: 0, valueRange: '$300+' }
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

  // Calculate total price using value-aware pricing that ensures customers never pay out of pocket
  const calculateTotal = () => {
    const itemValue = parseFloat(formData.itemValue as string);
    if (!itemValue || itemValue <= 0) return 0;
    
    const paymentRouteInfo: PaymentRouteInfo = {
      distance: routeInfo?.distance || 0,
      estimatedTime: routeInfo?.duration || 0  // Use duration from locationServices RouteInfo
    };
    
    const breakdown = calculatePaymentWithValue(
      paymentRouteInfo,
      itemValue,
      formData.numberOfItems,
      false, // isRush
      0      // tip
    );
    
    return breakdown.totalPrice;
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

  // Auto-update item size when value changes
  useEffect(() => {
    const value = parseFloat(formData.itemValue);
    if (!isNaN(value) && value > 0) {
      const autoSize = getItemSizeByValue(value);
      if (autoSize !== formData.itemSize) {
        setFormData(prev => ({ ...prev, itemSize: autoSize }));
      }
    }
  }, [formData.itemValue]);

  // Update total when form data changes
  useEffect(() => {
    setTotalAmount(calculateTotal());
  }, [formData.itemSize, formData.numberOfItems, formData.itemValue, routeInfo]);

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

    // Validate return authorization requirements
    if (!formData.purchaseType) {
      toast({
        title: "Purchase Type Required",
        description: "Please specify if this was an online or in-store purchase",
        variant: "destructive",
      });
      return;
    }

    if (!formData.hasOriginalTags) {
      toast({
        title: "Tags Required",
        description: "Please confirm that original tags are still attached",
        variant: "destructive",
      });
      return;
    }

    if (!formData.receiptUploaded) {
      toast({
        title: "Receipt Required",
        description: "Please upload your receipt or order confirmation",
        variant: "destructive",
      });
      return;
    }

    if (!formData.authorizationSigned) {
      toast({
        title: "Authorization Required",
        description: "Please authorize ReturnIt to process this return on your behalf",
        variant: "destructive",
      });
      return;
    }
    
    // Validate outside pickup requirements
    if (formData.pickupLocation === 'outside') {
      if (!formData.pickupInstructions.trim()) {
        toast({
          title: "Pickup Instructions Required",
          description: "Please provide specific instructions for outside pickup location",
          variant: "destructive",
        });
        return;
      }
      
      if (!formData.acceptsLiabilityTerms) {
        toast({
          title: "Liability Terms Required",
          description: "Please accept the liability terms for outside pickup",
          variant: "destructive",
        });
        return;
      }
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
      pickupLocation: formData.pickupLocation,
      pickupInstructions: formData.pickupInstructions,
      acceptsLiabilityTerms: formData.acceptsLiabilityTerms,
      paymentMethod: method,
      paymentDetails: details,
      totalAmount,
      
      // Return Authorization Fields
      purchaseType: formData.purchaseType,
      hasOriginalTags: formData.hasOriginalTags,
      receiptUploaded: formData.receiptUploaded,
      authorizationSigned: formData.authorizationSigned,
      requiresInStoreReturn: formData.purchaseType === 'in_store',
      requiresCarrierDropoff: formData.purchaseType === 'online'
    };

    createOrderMutation.mutate(orderData);
    
    // Navigate to checkout page with order details after successful order creation
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'numberOfItems' ? parseInt(value as string) : value
    }));
  };

  // Handle receipt upload for return authorization
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        receiptPhoto: file,
        receiptUploaded: true
      }));
      toast({
        title: "Receipt uploaded",
        description: "Your receipt has been attached to this return",
      });
    }
  };

  // Handle return label upload for online purchases
  const handleReturnLabelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        returnLabelFile: file
      }));
      toast({
        title: "Return label uploaded",
        description: "Your return label/QR code has been attached",
      });
    }
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
            alt="ReturnIt Logo" 
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

  // Use single clear delivery handoff image for consistent professional appearance
  const selectedImage = deliveryHandoffImg;

  return (
    <div className="min-h-screen relative">
      {/* Background Hero Image */}
      <div 
        className="absolute inset-0 z-0 bg-img-enhanced"
        style={{
          backgroundImage: `url(${selectedImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-white/75"></div>
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
              <div className="text-xl font-bold text-amber-900 cursor-pointer hover:text-amber-700 transition-colors">
                Return It
              </div>
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
                
                <div className="flex flex-col gap-4">
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
                
                <div className="flex flex-col gap-4">
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

              {/* Return Authorization Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="h-5 w-5 text-amber-600" />
                  <Label className="text-amber-800 font-semibold text-lg">Return Authorization</Label>
                </div>
                
                {/* Purchase Type Question */}
                <div className="space-y-3 p-4 bg-amber-50/80 rounded-lg border border-amber-200">
                  <Label className="text-amber-800 font-medium text-base">
                    Was this purchase made online? *
                  </Label>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="purchaseType"
                        value="online"
                        checked={formData.purchaseType === 'online'}
                        onChange={(e) => handleInputChange('purchaseType', e.target.value)}
                        className="text-amber-600 focus:ring-amber-500"
                        data-testid="radio-purchase-online"
                      />
                      <span className="text-amber-800">Yes - Online Purchase</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="purchaseType"
                        value="in_store"
                        checked={formData.purchaseType === 'in_store'}
                        onChange={(e) => handleInputChange('purchaseType', e.target.value)}
                        className="text-amber-600 focus:ring-amber-500"
                        data-testid="radio-purchase-store"
                      />
                      <span className="text-amber-800">No - In-Store Purchase</span>
                    </label>
                  </div>
                </div>

                {/* Conditional Requirements based on Purchase Type */}
                {formData.purchaseType && (
                  <div className="space-y-4 p-4 bg-white/60 rounded-lg border border-amber-200">
                    {/* Tag Requirement - Always Required */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasOriginalTags"
                        checked={formData.hasOriginalTags}
                        onCheckedChange={(checked) => handleInputChange('hasOriginalTags', checked)}
                        className="border-amber-400 text-amber-600"
                        data-testid="checkbox-original-tags"
                      />
                      <Label htmlFor="hasOriginalTags" className="text-amber-800 font-medium">
                        Original tags are still attached *
                      </Label>
                    </div>
                    <p className="text-amber-700 text-sm ml-6">
                      Most stores require items to be in "like new" condition with original tags.
                    </p>

                    {/* Receipt Upload - Always Required */}
                    <div className="space-y-2">
                      <Label className="text-amber-800 font-medium">
                        {formData.purchaseType === 'online' ? 'Upload Receipt/Order Confirmation *' : 'Upload Store Receipt *'}
                      </Label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleReceiptUpload}
                        className="block w-full text-sm text-amber-800 
                                   file:mr-4 file:py-2 file:px-4 
                                   file:rounded-md file:border-0
                                   file:text-sm file:font-medium
                                   file:bg-amber-100 file:text-amber-800
                                   hover:file:bg-amber-200"
                        data-testid="input-receipt-upload"
                      />
                      <p className="text-amber-700 text-sm">
                        {formData.purchaseType === 'online' 
                          ? 'Upload a screenshot of your email receipt or order confirmation.'
                          : 'Upload a photo of your store receipt for proof of purchase.'
                        }
                      </p>
                    </div>

                    {/* Return Label Upload - Only for Online Purchases */}
                    {formData.purchaseType === 'online' && (
                      <div className="space-y-2">
                        <Label className="text-amber-800 font-medium">
                          Upload Return Label or QR Code (Optional)
                        </Label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleReturnLabelUpload}
                          className="block w-full text-sm text-amber-800 
                                     file:mr-4 file:py-2 file:px-4 
                                     file:rounded-md file:border-0
                                     file:text-sm file:font-medium
                                     file:bg-amber-100 file:text-amber-800
                                     hover:file:bg-amber-200"
                          data-testid="input-return-label-upload"
                        />
                        <p className="text-amber-700 text-sm">
                          If you have a return label or QR code from the retailer, upload it here. 
                          Otherwise, our driver will help process the return at the carrier location.
                        </p>
                      </div>
                    )}

                    {/* Authorization Signature */}
                    <div className="space-y-3 p-3 bg-amber-50/50 rounded border border-amber-300">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="authorizationSigned"
                          checked={formData.authorizationSigned}
                          onCheckedChange={(checked) => handleInputChange('authorizationSigned', checked)}
                          className="border-amber-400 text-amber-600"
                          data-testid="checkbox-authorization"
                        />
                        <Label htmlFor="authorizationSigned" className="text-amber-800 font-medium">
                          I authorize ReturnIt to process this return on my behalf *
                        </Label>
                      </div>
                      <p className="text-amber-700 text-xs ml-6">
                        This digital authorization allows our driver to act as your proxy when returning items 
                        {formData.purchaseType === 'online' ? ' to carrier locations.' : ' to the store.'}
                      </p>
                    </div>

                    {/* Requirements Summary */}
                    <div className="p-3 bg-green-50/80 rounded border border-green-200">
                      <h4 className="text-green-800 font-medium mb-2">
                        {formData.purchaseType === 'online' ? 'Online Return Process:' : 'In-Store Return Process:'}
                      </h4>
                      <ul className="text-green-700 text-sm space-y-1">
                        <li>• Driver will carry your receipt and authorization</li>
                        {formData.purchaseType === 'online' ? (
                          <>
                            <li>• Item will be taken to UPS/FedEx/USPS drop-off location</li>
                            <li>• Return label will be printed or attached by carrier</li>
                          </>
                        ) : (
                          <>
                            <li>• Driver will take item to the store counter</li>
                            <li>• Store associate will process the return using your receipt</li>
                          </>
                        )}
                        <li>• You'll receive updates on the return status</li>
                      </ul>
                    </div>
                  </div>
                )}
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
                
                <div className="flex flex-col gap-4">
                  <div>
                    <Label htmlFor="itemValue" className="text-amber-800 font-medium">
                      Item Value *
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-800">$</span>
                      <Input
                        id="itemValue"
                        type="number"
                        placeholder="0.00"
                        value={formData.itemValue}
                        onChange={(e) => handleInputChange('itemValue', e.target.value)}
                        className="bg-white/80 border-amber-300 focus:border-amber-500 pl-8"
                        required
                        min="0"
                        step="0.01"
                        data-testid="input-item-value"
                      />
                    </div>
                    <p className="text-xs text-amber-600 mt-1">Original purchase price of the item</p>
                  </div>
                  
                  <div>
                    <Label className="text-amber-800 font-medium">
                      Auto-Detected Size Category
                    </Label>
                    <div className="p-3 bg-amber-50/60 border border-amber-300 rounded-md">
                      {(() => {
                        const value = parseFloat(formData.itemValue);
                        if (isNaN(value) || value <= 0) {
                          return <span className="text-amber-600 text-sm">Enter item value to see category</span>;
                        }
                        
                        const detectedSize = getItemSizeByValue(value);
                        const sizeInfo = itemSizes.find(s => s.size === detectedSize);
                        
                        return (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-amber-800">{sizeInfo?.label}</span>
                              {sizeInfo?.upcharge && sizeInfo.upcharge > 0 && (
                                <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded">
                                  +${sizeInfo.upcharge.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-amber-600">{sizeInfo?.valueRange}</span>
                          </div>
                        );
                      })()}
                    </div>
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

              {/* Pickup Location Preference */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Home className="h-5 w-5 text-amber-600" />
                  <Label className="text-amber-800 font-semibold text-lg">Pickup Location</Label>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.pickupLocation === 'inside' 
                        ? 'border-amber-500 bg-amber-50' 
                        : 'border-gray-300 bg-white hover:border-amber-300'
                    }`}
                    onClick={() => handleInputChange('pickupLocation', 'inside')}
                    data-testid="option-pickup-inside"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Home className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-amber-900">Inside Pickup</h3>
                        <p className="text-sm text-amber-700">Driver will ring doorbell and collect items from you directly</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-green-600">✓ Secure handoff</p>
                          <p className="text-xs text-green-600">✓ Receipt confirmation</p>
                          <p className="text-xs text-green-600">✓ Full liability protection</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.pickupLocation === 'outside' 
                        ? 'border-amber-500 bg-amber-50' 
                        : 'border-gray-300 bg-white hover:border-amber-300'
                    }`}
                    onClick={() => handleInputChange('pickupLocation', 'outside')}
                    data-testid="option-pickup-outside"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Package className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-amber-900">Outside Pickup</h3>
                        <p className="text-sm text-amber-700">Leave items outside - driver will collect without contact</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-blue-600">✓ Contactless pickup</p>
                          <p className="text-xs text-blue-600">✓ Convenient scheduling</p>
                          <p className="text-xs text-orange-600 flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Limited liability protection
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Outside Pickup Instructions */}
                {formData.pickupLocation === 'outside' && (
                  <div className="space-y-4 bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-orange-900">Outside Pickup Instructions</h4>
                        <p className="text-sm text-orange-700 mt-1">
                          Please provide specific details about where items will be left for pickup
                        </p>
                      </div>
                    </div>
                    
                    <Textarea
                      placeholder="e.g., 'Left by front door in Amazon box', 'Behind planter on porch', 'In garage by side door'"
                      value={formData.pickupInstructions}
                      onChange={(e) => handleInputChange('pickupInstructions', e.target.value)}
                      className="bg-white border-orange-300 focus:border-orange-500"
                      rows={3}
                      data-testid="textarea-pickup-instructions"
                    />
                    
                    <div className="bg-white p-4 rounded border border-orange-200">
                      <h5 className="font-semibold text-orange-900 mb-2 flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Outside Pickup Liability Terms
                      </h5>
                      <div className="text-sm text-orange-800 space-y-2">
                        <p><strong>By choosing outside pickup, you acknowledge and agree that:</strong></p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Items will be left unattended outside your residence</li>
                          <li>ReturnIt and our drivers are NOT liable for lost, stolen, damaged, or missing items</li>
                          <li>Weather, theft, or other external factors may affect your items</li>
                          <li>You assume full risk and responsibility for items left outside</li>
                          <li>Photo documentation will be provided as proof of pickup attempt</li>
                          <li>No refunds will be provided for items not found at specified location</li>
                        </ul>
                        <div className="mt-3 p-2 bg-orange-100 rounded border border-orange-300">
                          <p className="text-xs text-orange-900">
                            <strong>Recommendation:</strong> For valuable items over $100, we strongly recommend choosing "Inside Pickup" 
                            to ensure secure handoff and full liability protection.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="acceptsLiabilityTerms"
                        checked={formData.acceptsLiabilityTerms}
                        onCheckedChange={(checked) => 
                          handleInputChange('acceptsLiabilityTerms', checked === true)
                        }
                        data-testid="checkbox-liability-terms"
                      />
                      <Label htmlFor="acceptsLiabilityTerms" className="text-sm text-orange-900 font-medium">
                        I understand and accept the liability terms for outside pickup *
                      </Label>
                    </div>
                  </div>
                )}
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

              {/* Pricing Display */}
              {formData.itemValue && parseFloat(formData.itemValue) > 0 && (
                <div className="space-y-4">
                  {/* Subtotal */}
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-900 font-semibold text-lg">Subtotal:</span>
                      <span className="text-amber-900 font-bold text-xl" data-testid="text-subtotal-amount">
                        $3.99
                      </span>
                    </div>
                    {routeInfo && (
                      <p className="text-xs text-amber-600">
                        ETA: {routeInfo.duration} • Price locked at booking
                      </p>
                    )}
                  </div>

                  {/* Fees Breakdown */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="text-blue-900 font-semibold mb-3">Fees & Taxes</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Service Fee (15%):</span>
                        <span className="font-medium">$0.60</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Processing Fee:</span>
                        <span className="font-medium">$0.30</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Tax (8.99%):</span>
                        <span className="font-medium">$0.44</span>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-green-900 font-bold text-lg">Total:</span>
                      <span className="text-green-900 font-bold text-2xl" data-testid="text-final-total">
                        $5.33
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="text-gray-900 font-semibold mb-3">Payment Method</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant={selectedPaymentMethod === 'card' ? 'default' : 'outline'}
                          onClick={() => setSelectedPaymentMethod('card')}
                          className="h-12"
                          data-testid="button-payment-card"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Debit/Credit
                        </Button>
                        <Button
                          type="button"
                          variant={selectedPaymentMethod === 'paypal' ? 'default' : 'outline'}
                          onClick={() => setSelectedPaymentMethod('paypal')}
                          className="h-12"
                          data-testid="button-payment-paypal"
                        >
                          💳 PayPal
                        </Button>
                      </div>
                      
                      {selectedPaymentMethod === 'card' && (
                        <div className="space-y-3 mt-4 p-3 bg-gray-50 rounded border">
                          <div>
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input
                              id="cardNumber"
                              placeholder="1234 5678 9012 3456"
                              className="bg-white"
                              data-testid="input-card-number"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="expiry">Expiry</Label>
                              <Input
                                id="expiry"
                                placeholder="MM/YY"
                                className="bg-white"
                                data-testid="input-card-expiry"
                              />
                            </div>
                            <div>
                              <Label htmlFor="cvv">CVV</Label>
                              <Input
                                id="cvv"
                                placeholder="123"
                                className="bg-white"
                                data-testid="input-card-cvv"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="cardName">Name on Card</Label>
                            <Input
                              id="cardName"
                              placeholder="John Doe"
                              className="bg-white"
                              data-testid="input-card-name"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-3"
                  disabled={createOrderMutation.isPending || !selectedPaymentMethod}
                  data-testid="button-book-pickup"
                >
                  {createOrderMutation.isPending ? "Booking Pickup..." : "Book Pickup"}
                </Button>
                {!selectedPaymentMethod && (
                  <p className="text-sm text-red-600 mt-2 text-center">
                    Please select a payment method to continue
                  </p>
                )}
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}