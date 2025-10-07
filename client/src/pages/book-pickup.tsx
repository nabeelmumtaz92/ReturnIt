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
import { ArrowLeft, Package, CreditCard, Search, MapPin, Minus, Plus, User, Navigation, Home, Shield, AlertTriangle, Clock, Truck, Store, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import PaymentMethods from "@/components/PaymentMethods";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import StoreLocator from "@/components/StoreLocator";
import RoutePreview from "@/components/RoutePreview";
import { PaymentBreakdown } from "@/components/PaymentBreakdown";
import CompanySelector from "@/components/CompanySelector";
import { calculatePaymentWithValue, getItemSizeByValue } from "@shared/paymentCalculator";
import type { RouteInfo as PaymentRouteInfo } from "@shared/paymentCalculator";
import { validateOrderPolicy, determinePolicyAction, PolicyAction, formatPolicyMessage } from "@shared/policyValidator";
import { PolicyValidator } from "@shared/policy.rules";
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
    // Company selection (enhanced retailer system)
    selectedCompany: null as any,
    selectedLocation: null as any,
    selectedReturnPolicy: null as any,
    retailer: '', // Keep for backwards compatibility
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
    // Return authorization & purchase type
    purchaseType: '', // 'online' or 'in_store'
    purchaseDate: '', // When item was purchased - critical for return window validation
    hasOriginalPackaging: false, // Whether item has original packaging (separate from tags)
    hasOriginalTags: false,
    receiptImage: null as File | null,
    returnLabelImage: null as File | null,
    authorizationSigned: false,
    acceptsLiabilityTerms: false
  });

  // Step management
  const [currentStep, setCurrentStep] = useState<'step1' | 'step2' | 'step3' | 'step4'>('step1');

  // State for UI interactions  
  const [showRetailerDropdown, setShowRetailerDropdown] = useState(false);
  const [filteredRetailers, setFilteredRetailers] = useState<string[]>([]);
  
  // Company selection handler
  const handleCompanySelect = (company: any, location?: any, policy?: any) => {
    setFormData(prev => ({
      ...prev,
      selectedCompany: company,
      selectedLocation: location,
      selectedReturnPolicy: policy,
      retailer: company.name // Set retailer name for backwards compatibility
    }));
    console.log('🏢 Company selected:', company.name, 'Location:', location?.name, 'Policy:', policy);
  };
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null);
  const [selectedStore, setSelectedStore] = useState<NearbyStore | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [pricingBreakdown, setPricingBreakdown] = useState<ReturnType<typeof calculatePaymentWithValue> | null>(null);
  const [policyValidation, setPolicyValidation] = useState<{ isValid: boolean; message: string; warnings: string[] } | null>(null);
  const [merchantPolicyValidation, setMerchantPolicyValidation] = useState<{ isValid: boolean; message: string; violations: string[] } | null>(null);

  // Item categories for multiple selection
  const itemCategories = [
    "Clothing & Accessories",
    "Electronics", 
    "Home & Garden",
    "Toys & Games",
    "Books & Media",
    "Health & Beauty",
    "Sports & Outdoors",
    "Other"
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

  // Item size info based on value ranges
  const itemSizes = [
    { size: 'XS', label: 'Extra Small', valueRange: '$0 - $25', upcharge: 0 },
    { size: 'S', label: 'Small', valueRange: '$25 - $50', upcharge: 0 },
    { size: 'M', label: 'Medium', valueRange: '$50 - $100', upcharge: 0 },
    { size: 'L', label: 'Large', valueRange: '$100 - $200', upcharge: 2 },
    { size: 'XL', label: 'Extra Large', valueRange: '$200+', upcharge: 5 }
  ];

  // Available retailers from database (fetched on component mount)
  const [availableRetailers, setAvailableRetailers] = useState<string[]>([]);
  
  // Fallback popular retailers for autocomplete if database fetch fails
  const popularRetailers = [
    "Amazon", "Target", "Walmart", "Best Buy", "Macy's", "Nordstrom", "REI", "Nike", 
    "Adidas", "Gap", "Old Navy", "H&M", "Zara", "Anthropologie", "Urban Outfitters",
    "ASOS", "Wayfair", "Home Depot", "Lowe's", "Bed Bath & Beyond", "Williams Sonoma",
    "Pottery Barn", "West Elm", "Crate & Barrel", "Costco", "Sam's Club", "TJ Maxx",
    "Marshall's", "DSW", "Foot Locker", "Dick's Sporting Goods", "Barnes & Noble"
  ];

  // Step 1: Customer Information & Address
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const required = ['fullName', 'phone', 'streetAddress'];
    const missing = required.filter(field => !formData[field as keyof typeof formData]);
    
    if (missing.length > 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentStep('step2');
  };

  // Step 2: Return Details & Item Information
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const required = ['retailer', 'orderName', 'returnReason', 'itemValue'];
    const missing = required.filter(field => !formData[field as keyof typeof formData]);
    
    // DEBUG: Log all values to help troubleshoot
    console.log('🔍 Step 2 Validation Debug:', {
      retailer: formData.retailer,
      orderName: formData.orderName,
      returnReason: formData.returnReason,
      itemValue: formData.itemValue,
      itemCategories: formData.itemCategories,
      missing: missing
    });
    
    if (formData.itemCategories.length === 0) {
      toast({
        title: "Item Categories Required",
        description: "Please select at least one item category",
        variant: "destructive",
      });
      return;
    }
    
    if (missing.length > 0) {
      toast({
        title: "Missing information",
        description: `Please fill in all required fields. Missing: ${missing.join(', ')}`,
        variant: "destructive",
      });
      console.error('❌ Missing required fields:', missing);
      return;
    }
    
    console.log('✅ Step 2 validation passed, advancing to step 3');
    setCurrentStep('step3');
  };

  // Step 3: Pickup Preferences & Authorization
  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const requiredFields = [
      'preferredTimeSlot',
      'pickupLocation',
      'purchaseType',
      'hasOriginalTags',
      'authorizationSigned'
    ];

    // Check for outside pickup liability acceptance
    if (formData.pickupLocation === 'outside' && !formData.acceptsLiabilityTerms) {
      toast({
        title: "Liability Terms Required",
        description: "You must accept the liability terms for outside pickup",
        variant: "destructive",
      });
      return;
    }

    // Check all required fields
    const missingFields = requiredFields.filter(field => {
      const value = formData[field as keyof typeof formData];
      return !value || value === '';
    });

    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Information",
        description: "Please complete all required fields before proceeding",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep('step4');
  };

  // Step 4: Payment & Final Submission
  const handleStep4Submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate payment method selected
    if (!selectedPaymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method to continue",
        variant: "destructive",
      });
      return;
    }

    // Construct order data from all form data
    const orderData = {
      // Customer info
      customerName: formData.fullName,
      customerPhone: formData.phone,
      customerEmail: user?.email,
      
      // Pickup details
      pickupAddress: formData.streetAddress,
      pickupLocation: formData.pickupLocation,
      pickupInstructions: formData.pickupInstructions || '',
      preferredTimeSlot: formData.preferredTimeSlot,
      
      // Return details
      orderName: formData.orderName,
      returnReason: formData.returnReason,
      itemDescription: formData.itemDescription,
      itemCategories: formData.itemCategories,
      itemValue: parseFloat(formData.itemValue) || 0,
      numberOfItems: formData.numberOfItems || 1,
      
      // Retailer info (CRITICAL for reporting)
      retailer: formData.retailer,
      retailerLocation: selectedStore ? {
        name: selectedStore.name,
        address: selectedStore.address,
        lat: selectedStore.lat,
        lng: selectedStore.lng
      } : null,
      dropoffAddress: selectedStore?.address || formData.retailer,
      
      // Purchase info
      purchaseType: formData.purchaseType,
      purchaseDate: formData.purchaseDate,
      hasOriginalTags: formData.hasOriginalTags,
      
      // Authorization
      authorizationSigned: formData.authorizationSigned,
      acceptsLiabilityTerms: formData.acceptsLiabilityTerms,
      
      // Pricing & Route
      totalPrice: pricingBreakdown?.totalPrice || 3.99,
      basePrice: pricingBreakdown?.basePrice || 3.99,
      distanceFee: pricingBreakdown?.distanceFee || 0,
      timeFee: pricingBreakdown?.timeFee || 0,
      serviceFee: pricingBreakdown?.serviceFee || 0,
      distance: routeInfo?.distance || 'N/A',
      estimatedTime: routeInfo?.duration || 'N/A',
      
      // Payment
      paymentMethod: selectedPaymentMethod,
      paymentStatus: 'pending',
      
      // Status
      status: 'created',
    };

    // Submit order
    createOrderMutation.mutate(orderData);
  };

  // Navigate back between steps
  const handleBackStep = () => {
    if (currentStep === 'step4') setCurrentStep('step3');
    else if (currentStep === 'step3') setCurrentStep('step2');
    else if (currentStep === 'step2') setCurrentStep('step1');
  };

  // Generic input handler
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Category toggle handler for multi-select
  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      itemCategories: prev.itemCategories.includes(category)
        ? prev.itemCategories.filter(c => c !== category)
        : [...prev.itemCategories, category]
    }));
  };

  // Receipt upload handler
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, receiptImage: file }));
      toast({
        title: "Receipt uploaded",
        description: `${file.name} has been attached`,
      });
    }
  };

  // Return label upload handler  
  const handleReturnLabelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, returnLabelImage: file }));
      toast({
        title: "Return label uploaded",
        description: `${file.name} has been attached`,
      });
    }
  };

  // Retailer search with filtering
  const handleRetailerSearch = (query: string) => {
    setFormData(prev => ({ ...prev, retailerQuery: query }));
    
    if (query.length > 0) {
      // Use available retailers from database, fallback to popular retailers
      const retailersToFilter = availableRetailers.length > 0 ? availableRetailers : popularRetailers;
      const filtered = retailersToFilter.filter(retailer =>
        retailer.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredRetailers(filtered);
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

  // Store selection handler
  const handleStoreSelect = (store: NearbyStore) => {
    setSelectedStore(store);
    if (store.location) {
      setDropoffLocation(store.location);
    }
  };

  // Pickup location selection handler
  const handlePickupLocationSelect = (location: Location) => {
    setPickupLocation(location);
  };

  // Route fare calculation handler with pricing calculation
  const handleFareCalculated = (fare: number, routeInfo: RouteInfo) => {
    setRouteInfo(routeInfo);
    
    // Calculate pricing breakdown using payment calculator
    const itemValue = parseFloat(formData.itemValue) || 50; // Default to $50 if no value
    const numberOfItems = formData.numberOfItems || 1;
    const paymentRouteInfo: PaymentRouteInfo = {
      distance: parseFloat(routeInfo.distance.replace(' miles', '')) || 0,
      estimatedTime: parseFloat(routeInfo.duration.replace(' mins', '')) || 0
    };
    
    const breakdown = calculatePaymentWithValue(
      paymentRouteInfo,
      itemValue,
      numberOfItems,
      false, // not rush delivery
      0 // no tip initially
    );
    
    setPricingBreakdown(breakdown);
  };

  // Recalculate pricing when form data changes
  useEffect(() => {
    if (routeInfo && formData.itemValue) {
      const itemValue = parseFloat(formData.itemValue) || 50;
      const numberOfItems = formData.numberOfItems || 1;
      const paymentRouteInfo: PaymentRouteInfo = {
        distance: parseFloat(routeInfo.distance.replace(' miles', '')) || 0,
        estimatedTime: parseFloat(routeInfo.duration.replace(' mins', '')) || 0
      };
      
      const breakdown = calculatePaymentWithValue(
        paymentRouteInfo,
        itemValue,
        numberOfItems,
        false, // not rush delivery  
        0 // no tip initially
      );
      
      setPricingBreakdown(breakdown);
    }
  }, [formData.itemValue, formData.numberOfItems, routeInfo]);

  // Validate order against policies in real-time
  useEffect(() => {
    if (formData.itemDescription || formData.itemCategories.length > 0 || formData.retailer) {
      const result = validateOrderPolicy({
        itemDescription: formData.itemDescription,
        itemCategory: formData.itemCategories.join(', '), // Convert array to string
        retailer: formData.retailer,
        itemValue: parseFloat(formData.itemValue) || 0,
        numberOfItems: formData.numberOfItems || 1,
        estimatedWeight: formData.estimatedWeight
      });

      const action = determinePolicyAction(result);
      const message = formatPolicyMessage(result);

      setPolicyValidation({
        isValid: action !== PolicyAction.BLOCK,
        message,
        warnings: result.warnings
      });
    }
  }, [formData.itemDescription, formData.itemCategories, formData.retailer, formData.itemValue, formData.numberOfItems, formData.estimatedWeight]);

  // Validate merchant-specific return policies
  useEffect(() => {
    const validateMerchantPolicy = async () => {
      // Require real customer data - no policy validation with fake dates
      if (formData.retailer && formData.itemCategories.length > 0 && formData.purchaseDate) {
        try {
          // First, fetch merchant policy for the selected retailer
          const response = await fetch(`/api/merchants/policies/${encodeURIComponent(formData.retailer)}`);
          let merchantPolicy = null;
          
          if (response.ok) {
            merchantPolicy = await response.json();
          }

          // Validate ALL selected categories (not just first one)
          const categoryValidationResults = [];
          for (const category of formData.itemCategories) {
            const bookingAttempt = {
              retailer: formData.retailer,
              itemCategory: category, // Validate each category individually
              itemDescription: formData.itemDescription || formData.orderName || 'Item return',
              itemValue: parseFloat(formData.itemValue) || 0,
              numberOfItems: formData.numberOfItems || 1,
              originalPackaging: formData.hasOriginalPackaging, // Use REAL packaging status
              purchaseDate: formData.purchaseDate, // MUST be real customer input - no fallback
              receiptUploaded: formData.receiptImage !== null,
              tagsAttached: formData.hasOriginalTags,
              purchaseLocation: formData.purchaseType === 'in_store' ? 'in_store' : 'online'
            };

            // Validate each category
            const categoryResult = await PolicyValidator.validateBookingAttempt(bookingAttempt, merchantPolicy);
            categoryValidationResults.push({ category, result: categoryResult });
          }

          // Combine results - if ANY category fails, the entire validation fails
          const validationResult = {
            isAllowed: categoryValidationResults.every(r => r.result.isAllowed),
            violations: categoryValidationResults.flatMap(r => r.result.violations)
          };

          if (validationResult.isAllowed) {
            setMerchantPolicyValidation({
              isValid: true,
              message: `✅ Return accepted under ${formData.retailer}'s policy`,
              violations: []
            });
          } else {
            setMerchantPolicyValidation({
              isValid: false,
              message: `❌ Return not allowed: ${validationResult.violations[0]?.violationReason || 'Policy violation'}`,
              violations: validationResult.violations.map(v => v.violationReason)
            });
          }
        } catch (error) {
          console.error('Merchant policy validation error:', error);
          setMerchantPolicyValidation({
            isValid: true, // Default to allow if validation fails
            message: `⚠️ Unable to validate ${formData.retailer} policy - proceeding with caution`,
            violations: []
          });
        }
      } else {
        setMerchantPolicyValidation(null);
      }
    };

    validateMerchantPolicy();
  }, [formData.retailer, formData.itemCategories, formData.itemValue, formData.receiptImage, formData.hasOriginalTags, formData.purchaseType, formData.itemDescription, formData.orderName, formData.numberOfItems]);

  // Fetch available retailers on component mount
  useEffect(() => {
    const fetchRetailers = async () => {
      try {
        const response = await fetch('/api/stores/retailers');
        if (response.ok) {
          const retailers = await response.json();
          const retailerNames = retailers.map((r: any) => r.retailer_name);
          setAvailableRetailers(retailerNames);
        } else {
          // Fallback to popular retailers if API fails
          setAvailableRetailers(popularRetailers);
        }
      } catch (error) {
        console.error('Error fetching retailers:', error);
        setAvailableRetailers(popularRetailers);
      }
    };
    
    fetchRetailers();
  }, []);

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return apiRequest('/api/orders', 'POST', orderData);
    },
    onSuccess: (data) => {
      toast({
        title: "Pickup scheduled!",
        description: "Your return pickup has been scheduled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setLocation('/orders');
    },
    onError: (error: any) => {
      toast({
        title: "Error scheduling pickup",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // ---------- RENDER HELPERS (keeps JSX shallow so tags always balance) ----------
  const Step1 = () => (
    <div className="space-y-6">
      {/* Contact */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-3">
          <User className="h-5 w-5 text-primary" />
          <Label className="text-foreground font-semibold text-lg">Contact Information</Label>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="fullName" className="text-foreground font-medium">Full Name *</Label>
            <Input id="fullName" placeholder="John Doe" value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="bg-white/80 border-border focus:border-primary"
              required data-testid="input-full-name" />
          </div>
          <div>
            <Label htmlFor="phone" className="text-foreground font-medium">Phone Number *</Label>
            <Input id="phone" type="tel" placeholder="(555) 123-4567" value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="bg-white/80 border-border focus:border-primary"
              required data-testid="input-phone" />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <AddressAutocomplete
          label="Pickup Address"
          placeholder="Enter your pickup address"
          value={formData.streetAddress}
          onChange={(address, placeResult) => {
            handleInputChange('streetAddress', address);
            if (placeResult) handlePickupLocationSelect(placeResult.location);
          }}
          onLocationSelect={handlePickupLocationSelect}
          required
          data-testid="input-pickup-address"
        />
      </div>

      {/* Next */}
      <div className="flex justify-end pt-4">
        <Button type="submit" className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2" data-testid="button-step1-next">
          Next Step
        </Button>
      </div>
    </div>
  );

  const Step2 = () => (
    <div className="space-y-6">
      {/* Return details */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-3">
          <Package className="h-5 w-5 text-primary" />
          <Label className="text-foreground font-semibold text-lg">Return Details</Label>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="orderName" className="text-foreground font-medium">Order Name/Description *</Label>
            <Input id="orderName" placeholder="e.g., Black Purse, Nike Shoes" value={formData.orderName}
              onChange={(e) => handleInputChange('orderName', e.target.value)}
              className="bg-white/80 border-border focus:border-primary"
              required data-testid="input-order-name" />
          </div>
          <div>
            <Label htmlFor="returnReason" className="text-foreground font-medium">Return Reason *</Label>
            <Select value={formData.returnReason} onValueChange={(v) => handleInputChange('returnReason', v)}>
              <SelectTrigger className="bg-white/80 border-border focus:border-primary" data-testid="select-return-reason">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {returnReasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Retailer */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-3">
          <MapPin className="h-5 w-5 text-primary" />
          <Label className="text-foreground font-semibold text-lg">Retailer Information</Label>
        </div>
        <CompanySelector
          selectedCompany={formData.selectedCompany}
          selectedLocation={formData.selectedLocation}
          onCompanySelect={handleCompanySelect}
          placeholder="Search for a store (e.g., Target, Walmart, Best Buy)..."
          showReturnPolicyDetails={false}
          purchaseDate={formData.purchaseDate}
          className="bg-white/80"
        />

        {formData.retailer && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-accent/60 p-2 rounded">
              <span>Selected:</span><span className="font-medium">{formData.retailer}</span>
            </div>
            <StoreLocator
              retailerName={formData.retailer}
              onStoreSelect={handleStoreSelect}
              customerLocation={pickupLocation || undefined}
            />
            
            {/* Display selected store information */}
            {selectedStore && (
              <div className="mt-3 p-3 bg-green-50/80 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Store className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-green-800">
                      Store Selected: {selectedStore.name}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {selectedStore.address}
                    </p>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-xs text-green-600">
                        📍 {selectedStore.distance}
                      </span>
                      {selectedStore.isOpen ? (
                        <span className="text-xs text-green-600">🟢 Open</span>
                      ) : (
                        <span className="text-xs text-red-600">🔴 Closed</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Policy Validation Results */}
        {(policyValidation || merchantPolicyValidation) && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <Label className="text-blue-800 font-medium text-sm">Return Policy Status</Label>
            </div>
            
            {/* General Return It Policies */}
            {policyValidation && (
              <div className={`p-3 rounded-lg border ${
                policyValidation.isValid 
                  ? 'bg-green-50/80 border-green-200' 
                  : 'bg-red-50/80 border-red-200'
              }`}>
                <div className="flex items-start space-x-2">
                  {policyValidation.isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${
                      policyValidation.isValid ? 'text-green-800' : 'text-red-800'
                    }`}>
                      Return It Safety Check
                    </p>
                    <p className={`text-xs mt-1 ${
                      policyValidation.isValid ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {policyValidation.message}
                    </p>
                    {policyValidation.warnings.length > 0 && (
                      <div className="mt-2">
                        {policyValidation.warnings.map((warning, index) => (
                          <p key={index} className="text-xs text-orange-600 bg-orange-50 p-1 rounded mt-1">
                            ⚠️ {warning}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Merchant-Specific Policies */}
            {merchantPolicyValidation && (
              <div className={`p-3 rounded-lg border ${
                merchantPolicyValidation.isValid 
                  ? 'bg-blue-50/80 border-blue-200' 
                  : 'bg-red-50/80 border-red-200'
              }`}>
                <div className="flex items-start space-x-2">
                  {merchantPolicyValidation.isValid ? (
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${
                      merchantPolicyValidation.isValid ? 'text-blue-800' : 'text-red-800'
                    }`}>
                      Store Return Policy
                    </p>
                    <p className={`text-xs mt-1 ${
                      merchantPolicyValidation.isValid ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {merchantPolicyValidation.message}
                    </p>
                    {merchantPolicyValidation.violations.length > 0 && (
                      <div className="mt-2">
                        {merchantPolicyValidation.violations.map((violation, index) => (
                          <p key={index} className="text-xs text-red-600 bg-red-50 p-1 rounded mt-1">
                            ❌ {violation}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Item categories + value */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-3">
          <Package className="h-5 w-5 text-primary" />
          <Label className="text-foreground font-semibold text-lg">Item Information</Label>
        </div>

        {/* Categories */}
        <div>
          <Label className="text-foreground font-medium">Item Categories *</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {itemCategories.map((category) => (
              <label key={category} className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={formData.itemCategories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                  data-testid={`checkbox-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                />
                <span className="text-foreground">{category}</span>
              </label>
            ))}
          </div>
          {formData.itemCategories.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-accent/60 p-2 mt-2 rounded">
              <span>Selected:</span><span className="font-medium">{formData.itemCategories.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Value */}
        <div>
          <Label htmlFor="itemValue" className="text-foreground font-medium">Item Value (USD) *</Label>
          <Input id="itemValue" type="number" placeholder="25.99" value={formData.itemValue}
            onChange={(e) => handleInputChange('itemValue', e.target.value)}
            className="bg-white/80 border-border focus:border-primary"
            required data-testid="input-item-value" />
        </div>

        {/* Auto size + qty */}
        <div className="flex flex-col gap-4">
          <div>
            <Label className="text-foreground font-medium">Auto-Detected Size Category</Label>
            <div className="p-3 bg-accent/60 border border-border rounded-md">
              {(() => {
                const v = parseFloat(formData.itemValue);
                if (isNaN(v) || v <= 0) return <span className="text-primary text-sm">Enter item value to see category</span>;
                const detected = getItemSizeByValue(v);
                const sizeInfo = itemSizes.find(s => s.size === detected);
                return (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-foreground">{sizeInfo?.label}</span>
                      {sizeInfo?.upcharge && sizeInfo.upcharge > 0 && (
                        <span className="text-xs bg-accent text-foreground px-2 py-1 rounded">
                          +${sizeInfo.upcharge.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-primary">{sizeInfo?.valueRange}</span>
                  </div>
                );
              })()}
            </div>
          </div>

          <div>
            <Label htmlFor="numberOfItems" className="text-foreground font-medium">Number of Items *</Label>
            <div className="flex items-center space-x-2">
              <Button type="button" variant="outline" size="sm"
                onClick={() => handleInputChange('numberOfItems', Math.max(1, formData.numberOfItems - 1).toString())}
                disabled={formData.numberOfItems <= 1} data-testid="button-decrease-items">
                <Minus className="h-4 w-4" />
              </Button>
              <span className="px-3 py-2 bg-accent border border-border rounded text-center min-w-[60px]" data-testid="text-item-count">
                {formData.numberOfItems}
              </span>
              <Button type="button" variant="outline" size="sm"
                onClick={() => handleInputChange('numberOfItems', Math.min(10, formData.numberOfItems + 1).toString())}
                disabled={formData.numberOfItems >= 10} data-testid="button-increase-items">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-primary mt-1">Each additional item +$1.00</p>
          </div>
        </div>

        {/* Optional details */}
        <div className="space-y-2">
          <Label htmlFor="estimatedWeight" className="text-foreground font-medium">Estimated Weight (optional)</Label>
          <Input id="estimatedWeight" placeholder="e.g., 2 lbs, 5 lbs, 10+ lbs" value={formData.estimatedWeight}
            onChange={(e) => handleInputChange('estimatedWeight', e.target.value)}
            className="bg-white/80 border-border focus:border-primary"
            data-testid="input-estimated-weight" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="itemDescription" className="text-foreground font-medium">Item Description (optional)</Label>
          <Textarea id="itemDescription" rows={3} placeholder="Describe what you're returning..."
            value={formData.itemDescription}
            onChange={(e) => handleInputChange('itemDescription', e.target.value)}
            className="bg-white/80 border-border focus:border-primary"
            data-testid="textarea-item-description" />
        </div>
      </div>

      {/* Nav */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={handleBackStep}
          className="border-border text-foreground hover:bg-accent/50"
          data-testid="button-step2-back">
          Back
        </Button>
        <Button type="submit" className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2" data-testid="button-step2-next">
          Next Step
        </Button>
      </div>
    </div>
  );

  const Step3 = () => (
    <div className="space-y-6">
      {/* Pickup prefs */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-3">
          <Clock className="h-5 w-5 text-primary" />
          <Label className="text-foreground font-semibold text-lg">Pickup Preferences</Label>
        </div>

        {/* Time slot */}
        <div>
          <Label className="text-foreground font-medium">Preferred Time Slot *</Label>
          <Select value={formData.preferredTimeSlot} onValueChange={(v) => handleInputChange('preferredTimeSlot', v)}>
            <SelectTrigger className="bg-white/80 border-border focus:border-primary" data-testid="select-time-slot">
              <SelectValue placeholder="Select preferred time" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Pickup location */}
        <div className="space-y-3">
          <Label className="text-foreground font-medium">Pickup Location Preference *</Label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="pickupLocation" value="inside"
                checked={formData.pickupLocation === 'inside'}
                onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                className="text-primary focus:ring-primary" data-testid="radio-pickup-inside" />
              <span className="text-foreground">Inside (at door)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="pickupLocation" value="outside"
                checked={formData.pickupLocation === 'outside'}
                onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                className="text-primary focus:ring-primary" data-testid="radio-pickup-outside" />
              <span className="text-foreground">Outside (specific location)</span>
            </label>
          </div>

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
                  <Shield className="h-4 w-4 mr-2" /> Outside Pickup Liability Terms
                </h5>
                <div className="text-sm text-orange-800 space-y-2">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Items will be left unattended outside your residence</li>
                    <li>Return It and our drivers are NOT liable for lost, stolen, damaged, or missing items</li>
                    <li>Weather, theft, or other external factors may affect your items</li>
                    <li>You assume full risk and responsibility for items left outside</li>
                    <li>Photo documentation will be provided as proof of pickup attempt</li>
                    <li>No refunds will be provided for items not found at specified location</li>
                  </ul>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acceptsLiabilityTerms"
                  checked={!!formData.acceptsLiabilityTerms}
                  onCheckedChange={(checked) => handleInputChange('acceptsLiabilityTerms', checked === true)}
                  data-testid="checkbox-liability-terms"
                />
                <Label htmlFor="acceptsLiabilityTerms" className="text-sm text-orange-900 font-medium">
                  I understand and accept the liability terms for outside pickup *
                </Label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Authorization */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-3">
          <Shield className="h-5 w-5 text-primary" />
          <Label className="text-foreground font-semibold text-lg">Return Authorization</Label>
        </div>

        {/* Purchase type */}
        <div className="space-y-3 p-4 bg-accent/80 rounded-lg border border-border">
          <Label className="text-foreground font-medium text-base">Was this purchase made online? *</Label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="purchaseType" value="online"
                checked={formData.purchaseType === 'online'}
                onChange={(e) => handleInputChange('purchaseType', e.target.value)}
                className="text-primary focus:ring-primary" data-testid="radio-purchase-online" />
              <span className="text-foreground">Yes - Online Purchase</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="purchaseType" value="in_store"
                checked={formData.purchaseType === 'in_store'}
                onChange={(e) => handleInputChange('purchaseType', e.target.value)}
                className="text-primary focus:ring-primary" data-testid="radio-purchase-store" />
              <span className="text-foreground">No - In-Store Purchase</span>
            </label>
          </div>
        </div>

        {formData.purchaseType && (
          <div className="space-y-4 p-4 bg-white/60 rounded-lg border border-border">
            <div className="flex items-center space-x-2">
              <Checkbox id="hasOriginalTags" checked={!!formData.hasOriginalTags}
                onCheckedChange={(checked) => handleInputChange('hasOriginalTags', checked === true)}
                className="border-primary text-primary"
                data-testid="checkbox-original-tags" />
              <Label htmlFor="hasOriginalTags" className="text-foreground font-medium">
                Original tags are still attached *
              </Label>
            </div>

            {/* Receipt upload */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">
                {formData.purchaseType === 'online' ? 'Upload Receipt/Order Confirmation *' : 'Upload Store Receipt *'}
              </Label>
              <input
                type="file" accept="image/*,application/pdf" onChange={handleReceiptUpload}
                className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-accent file:text-foreground hover:file:bg-accent"
                data-testid="input-receipt-upload"
              />
            </div>

            {/* Optional return label for online */}
            {formData.purchaseType === 'online' && (
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Upload Return Label or QR Code (Optional)</Label>
                <input
                  type="file" accept="image/*,application/pdf" onChange={handleReturnLabelUpload}
                  className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-accent file:text-foreground hover:file:bg-accent"
                  data-testid="input-return-label-upload"
                />
              </div>
            )}

            {/* Authorization */}
            <div className="space-y-3 p-3 bg-accent/50 rounded border border-border">
              <div className="flex items-center space-x-2">
                <Checkbox id="authorizationSigned" checked={!!formData.authorizationSigned}
                  onCheckedChange={(checked) => handleInputChange('authorizationSigned', checked === true)}
                  className="border-primary text-primary" data-testid="checkbox-authorization" />
                <Label htmlFor="authorizationSigned" className="text-foreground font-medium">
                  I authorize Return It to process this return on my behalf *
                </Label>
              </div>
              <p className="text-muted-foreground text-xs ml-6">
                This digital authorization allows our driver to act as your proxy when returning items
                {formData.purchaseType === 'online' ? ' to carrier locations.' : ' to the store.'}
              </p>
            </div>

            {/* Summary */}
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

      {/* Nav */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={handleBackStep}
          className="border-border text-foreground hover:bg-accent/50">
          Back
        </Button>
        <Button type="submit" className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2">
          Next Step
        </Button>
      </div>
    </div>
  );

  const Step4 = () => (
    <div className="space-y-6">
      {/* Route preview */}
      {pickupLocation && dropoffLocation && (
        <RoutePreview
          pickupLocation={pickupLocation}
          dropoffLocation={dropoffLocation}
          pickupAddress={formData.streetAddress}
          dropoffAddress={selectedStore?.address || formData.retailer}
          onFareCalculated={handleFareCalculated}
        />
      )}

      {/* Dynamic Pricing */}
      <div className="space-y-4">
        {pricingBreakdown ? (
          <>
            <div className="bg-accent p-4 rounded-lg border border-border">
              <div className="flex justify-between items-center">
                <span className="text-foreground font-semibold text-lg">Base Service:</span>
                <span className="text-foreground font-bold text-xl" data-testid="text-base-amount">${pricingBreakdown.basePrice.toFixed(2)}</span>
              </div>
              {routeInfo && (
                <p className="text-xs text-primary">
                  ETA: {routeInfo.duration} • Distance: {routeInfo.distance}
                </p>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="text-blue-900 font-semibold mb-3">Additional Fees</h4>
              <div className="space-y-2 text-sm">
                {pricingBreakdown.distanceFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-blue-700">Distance Fee:</span>
                    <span className="font-medium">${pricingBreakdown.distanceFee.toFixed(2)}</span>
                  </div>
                )}
                {pricingBreakdown.timeFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-blue-700">Time Fee:</span>
                    <span className="font-medium">${pricingBreakdown.timeFee.toFixed(2)}</span>
                  </div>
                )}
                {pricingBreakdown.sizeUpcharge > 0 && (
                  <div className="flex justify-between">
                    <span className="text-blue-700">Size Upcharge:</span>
                    <span className="font-medium">${pricingBreakdown.sizeUpcharge.toFixed(2)}</span>
                  </div>
                )}
                {pricingBreakdown.multiItemFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-blue-700">Multi-Item Fee:</span>
                    <span className="font-medium">${pricingBreakdown.multiItemFee.toFixed(2)}</span>
                  </div>
                )}
                {pricingBreakdown.smallOrderFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-blue-700">Small Order Fee:</span>
                    <span className="font-medium">${pricingBreakdown.smallOrderFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="text-blue-700">Service Fee (15%):</span>
                  <span className="font-medium">${pricingBreakdown.serviceFee.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-green-900 font-bold text-lg">Total:</span>
                <span className="text-green-900 font-bold text-2xl" data-testid="text-final-total">${pricingBreakdown.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-accent p-4 rounded-lg border border-border">
            <div className="flex justify-between items-center">
              <span className="text-foreground font-semibold text-lg">Base Service:</span>
              <span className="text-foreground font-bold text-xl" data-testid="text-base-amount">$3.99</span>
            </div>
            <p className="text-xs text-primary mt-2">Final pricing will be calculated with route information</p>
          </div>
        )}
      </div>

      {/* Payment */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="text-gray-900 font-semibold mb-3">Payment Method</h4>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant={selectedPaymentMethod === 'card' ? 'default' : 'outline'}
              onClick={() => setSelectedPaymentMethod('card')} className="h-12" data-testid="button-payment-card">
              <CreditCard className="h-4 w-4 mr-2" /> Debit/Credit
            </Button>
            <Button type="button" variant={selectedPaymentMethod === 'paypal' ? 'default' : 'outline'}
              onClick={() => setSelectedPaymentMethod('paypal')} className="h-12" data-testid="button-payment-paypal">
              💳 PayPal
            </Button>
          </div>

          {selectedPaymentMethod === 'card' && (
            <div className="space-y-3 mt-4 p-3 bg-gray-50 rounded border">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="bg-white" data-testid="input-card-number" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="expiry">Expiry</Label>
                  <Input id="expiry" placeholder="MM/YY" className="bg-white" data-testid="input-card-expiry" />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" className="bg-white" data-testid="input-card-cvv" />
                </div>
              </div>
              <div>
                <Label htmlFor="cardName">Name on Card</Label>
                <Input id="cardName" placeholder="John Doe" className="bg-white" data-testid="input-card-name" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3"
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
    </div>
  );

  // ---------- AUTH GUARDS ----------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#231b0f] flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold text-foreground mx-auto mb-4 animate-pulse">Return It</div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return null;

  // ---------- UI ----------
  const selectedImage = deliveryHandoffImg;

  return (
    <div className="min-h-screen bg-gradient-to-br from-transparent via-transparent to-transparent">
      {/* Hero */}
      <div className="w-full bg-white/90 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 max-w-6xl mx-auto">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">Schedule Your Return</h1>
              <p className="text-xl text-muted-foreground mb-6">On Demand Returns for returns, exchanges, and donations</p>
              <div className="flex items-center justify-center lg:justify-start gap-4 text-primary">
                <div className="flex items-center gap-2"><Package className="h-5 w-5" /><span>Free Pickup</span></div>
                <div className="flex items-center gap-2"><Truck className="h-5 w-5" /><span>Same Day</span></div>
              </div>
            </div>
            <div className="flex-1 max-w-md">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-border">
                <img src={selectedImage} alt="Professional delivery service" className="w-full h-64 object-cover" />
                <div className="p-4 bg-gradient-to-r from-transparent to-transparent">
                  <p className="text-sm text-muted-foreground font-medium">On Demand Returns pickup and delivery service</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Header - Stitch Pattern */}
      <header className="bg-[#f8f7f5]/80 dark:bg-[#231b0f]/80 backdrop-blur-sm sticky top-0 z-50 border-b border-primary/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            <Button variant="ghost" size="sm" onClick={() => setLocation('/')} className="p-2 -ml-2" data-testid="button-back-home">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold text-center flex-1 pr-8">New Return Order</h1>
          </div>
        </div>
      </header>

      {/* Main Form Card - Stitch Shadow Pattern */}
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="bg-card rounded-xl shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_30px_-15px_rgba(249,152,6,0.2)] border border-border">
          <div className="p-6 border-b border-border">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">
                {currentStep === 'step1' && "Contact Information"}
                {currentStep === 'step2' && "Return Details"}
                {currentStep === 'step3' && "Pickup Preferences"}
                {currentStep === 'step4' && "Payment & Review"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentStep === 'step1' && "Let's start with your contact information and pickup address"}
                {currentStep === 'step2' && "Tell us about the items you're returning"}
                {currentStep === 'step3' && "Set your pickup preferences and return authorization"}
                {currentStep === 'step4' && "Review your order and complete payment"}
              </p>
            </div>

            {/* Progress Indicator - Stitch Style */}
            <div className="flex items-center justify-between px-1">
              {(['step1','step2','step3','step4'] as const).map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`h-1 flex-1 rounded-full transition-colors ${currentStep === s || (['step2','step3','step4'].includes(currentStep) && i < (['step1','step2','step3','step4'] as const).indexOf(currentStep)) ? 'bg-primary' : 'bg-muted'}`}></div>
                  {i < 3 && <div className="w-2"></div>}
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={
              currentStep === 'step1' ? handleStep1Submit :
              currentStep === 'step2' ? handleStep2Submit :
              currentStep === 'step3' ? handleStep3Submit :
              handleStep4Submit
            }
          >
            <div className="p-6 space-y-6">
              {currentStep === 'step1' && <Step1 />}
              {currentStep === 'step2' && <Step2 />}
              {currentStep === 'step3' && <Step3 />}
              {currentStep === 'step4' && <Step4 />}
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}