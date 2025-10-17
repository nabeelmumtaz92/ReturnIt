import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocation, Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth-simple";
import { trackEvent } from "@/lib/posthog";
import { Package, CreditCard, Search, MapPin, Minus, Plus, User, Navigation, Home, Shield, AlertTriangle, Clock, Truck, Store, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { ObjectUploader } from "@/components/ObjectUploader";
import PaymentMethods from "@/components/PaymentMethods";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import StoreLocator from "@/components/StoreLocator";
import StoreAutocomplete from "@/components/StoreAutocomplete";
import RoutePreview from "@/components/RoutePreview";
import { PaymentBreakdown } from "@/components/PaymentBreakdown";
import CompanySelector from "@/components/CompanySelector";
import { calculatePaymentWithValue, getItemSizeByValue } from "@shared/paymentCalculator";
import type { RouteInfo as PaymentRouteInfo } from "@shared/paymentCalculator";
import { validateOrderPolicy, determinePolicyAction, PolicyAction, formatPolicyMessage } from "@shared/policyValidator";
import { PolicyValidator } from "@shared/policy.rules";
import { type Location, type PlaceResult, type RouteInfo, type NearbyStore } from "@/lib/locationServices";
import Footer from "@/components/Footer";

export default function BookPickup() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for guest checkout flow
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState<any>(null);

  const [formData, setFormData] = useState({
    // Customer info
    firstName: '',
    lastName: '',
    email: '',
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
    pickupMethod: 'handoff', // 'handoff' or 'door_dropoff'
    pickupInstructions: '', // Special instructions for outside pickup
    // Instructions
    notes: '',
    // Return authorization & purchase type
    purchaseType: '', // 'online' or 'in_store'
    purchaseDate: '', // When item was purchased - critical for return window validation
    hasOriginalPackaging: false, // Whether item has original packaging (separate from tags)
    hasOriginalTags: false,
    receiptImage: null as File | null,
    receiptUrl: '', // URL to uploaded receipt in object storage
    returnLabelImage: null as File | null,
    returnLabelUrl: '', // URL to uploaded return label in object storage
    authorizationSigned: false,
    acceptsLiabilityTerms: false,
    // Tip for driver (100% goes to driver)
    tip: 0
  });

  // Step management
  const [currentStep, setCurrentStep] = useState<'step1' | 'step2' | 'step3' | 'step4'>('step1');

  // Save booking data to localStorage for guest users
  useEffect(() => {
    if (!isAuthenticated && currentStep !== 'step1') {
      localStorage.setItem('guestBookingData', JSON.stringify(formData));
    }
  }, [formData, isAuthenticated, currentStep]);

  // Restore booking data after authentication
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const savedData = localStorage.getItem('guestBookingData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          
          // Migration: Handle old fullName format
          if (parsedData.fullName && !parsedData.firstName && !parsedData.lastName) {
            const nameParts = parsedData.fullName.split(' ');
            parsedData.firstName = nameParts[0] || '';
            parsedData.lastName = nameParts.slice(1).join(' ') || '';
            delete parsedData.fullName;
          }
          
          setFormData(prev => ({ ...prev, ...parsedData }));
          localStorage.removeItem('guestBookingData');
          toast({
            title: "Welcome back!",
            description: "Your booking information has been restored.",
          });
        } catch (error) {
          console.error('Error restoring booking data:', error);
        }
      }
    }
  }, [isAuthenticated, isLoading, toast]);

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
  const [isAnyLocationSelected, setIsAnyLocationSelected] = useState(false); // Track if "any location" option is selected
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [pricingBreakdown, setPricingBreakdown] = useState<ReturnType<typeof calculatePaymentWithValue> | null>(null);
  const [policyValidation, setPolicyValidation] = useState<{ isValid: boolean; message: string; warnings: string[] } | null>(null);
  const [merchantPolicyValidation, setMerchantPolicyValidation] = useState<{ isValid: boolean; message: string; violations: string[] } | null>(null);
  const [isValidatingPolicy, setIsValidatingPolicy] = useState(false);

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
    const required = isAuthenticated 
      ? ['firstName', 'lastName', 'phone', 'streetAddress']
      : ['firstName', 'lastName', 'phone', 'email', 'streetAddress'];
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
      'purchaseDate',
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

    // Check for at least ONE return requirement (tags, packaging, or receipt)
    const hasAtLeastOneRequirement = formData.hasOriginalTags || formData.hasOriginalPackaging || formData.receiptUrl || formData.receiptImage;
    
    if (!hasAtLeastOneRequirement) {
      toast({
        title: "Return Requirements Not Met",
        description: "You must have at least ONE of the following: original tags, original packaging, or receipt. The store may refuse your return without these items.",
        variant: "destructive",
      });
      return;
    }

    // Block booking if merchant policy validation is pending or violated
    if (isValidatingPolicy || !merchantPolicyValidation) {
      toast({
        title: "Policy Validation Pending",
        description: "Please wait while we validate your return against the store's policy...",
        variant: "default",
      });
      return;
    }

    if (!merchantPolicyValidation.isValid) {
      toast({
        title: "Return Policy Violation",
        description: merchantPolicyValidation.message || "This return does not meet the store's return policy requirements. Please review the policy details above.",
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

    // Check if user is authenticated before submitting
    if (!isAuthenticated) {
      // Save booking data for after authentication
      setPendingBookingData(formData);
      localStorage.setItem('guestBookingData', JSON.stringify(formData));
      localStorage.setItem('pendingPaymentMethod', selectedPaymentMethod);
      setShowAuthPrompt(true);
      return;
    }

    // Construct order data from all form data
    const orderData = {
      // Customer info
      customerName: `${formData.firstName} ${formData.lastName}`.trim(),
      customerPhone: formData.phone,
      customerEmail: user?.email || formData.email || '',
      
      // Pickup details
      pickupAddress: formData.streetAddress,
      pickupLocation: formData.pickupLocation,
      pickupMethod: formData.pickupMethod,
      signatureRequired: formData.pickupMethod === 'handoff',
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
        lat: selectedStore.location.lat,
        lng: selectedStore.location.lng
      } : null,
      dropoffAddress: selectedStore?.address || formData.retailer,
      
      // Purchase info
      purchaseType: formData.purchaseType,
      purchaseDate: formData.purchaseDate,
      hasOriginalTags: formData.hasOriginalTags,
      hasOriginalPackaging: formData.hasOriginalPackaging,
      receiptUrl: formData.receiptUrl || null,
      receiptUploaded: formData.receiptUrl !== '' || formData.receiptImage !== null,
      
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
      tip: formData.tip || 0, // Tip amount (100% goes to driver)
      
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

  // Cursor position tracking for inputs
  const inputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});
  const cursorPositions = useRef<{[key: string]: number | null}>({});

  // Generic input handler
  // Synchronously invalidate merchant policy validation when relevant fields change
  const invalidateMerchantPolicy = useCallback(() => {
    setMerchantPolicyValidation(null);
    setIsValidatingPolicy(true);
  }, []);

  const handleInputChange = useCallback((field: string, value: any, element?: HTMLInputElement) => {
    // Save cursor position if input element is provided
    if (element && (element.type === 'text' || element.type === 'email' || element.type === 'tel')) {
      cursorPositions.current[field] = element.selectionStart;
      inputRefs.current[field] = element;
    }

    // CRITICAL: Invalidate policy SYNCHRONOUSLY for policy-relevant fields
    const policyRelevantFields = ['retailer', 'itemCategories', 'purchaseDate', 'hasOriginalTags', 'hasOriginalPackaging', 'receiptImage', 'receiptUrl', 'purchaseType'];
    if (policyRelevantFields.includes(field)) {
      setMerchantPolicyValidation(null);
      setIsValidatingPolicy(true);
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Restore cursor position after render
  useEffect(() => {
    Object.keys(cursorPositions.current).forEach(field => {
      const position = cursorPositions.current[field];
      const element = inputRefs.current[field];
      
      if (element && position !== null) {
        element.setSelectionRange(position, position);
        cursorPositions.current[field] = null;
      }
    });
  });

  // Category toggle handler for multi-select
  const handleCategoryToggle = useCallback((category: string) => {
    // CRITICAL: Invalidate policy SYNCHRONOUSLY when categories change
    setMerchantPolicyValidation(null);
    setIsValidatingPolicy(true);
    
    setFormData(prev => ({
      ...prev,
      itemCategories: prev.itemCategories.includes(category)
        ? prev.itemCategories.filter(c => c !== category)
        : [...prev.itemCategories, category]
    }));
  }, []);

  // Receipt upload handlers
  const handleReceiptGetUploadUrl = async () => {
    const response = await apiRequest("POST", "/api/objects/upload");
    return {
      method: "PUT" as const,
      url: response.uploadURL,
    };
  };

  const handleReceiptUploadComplete = useCallback(async (result: any) => {
    if (result.successful && result.successful.length > 0) {
      try {
        const uploadedFile = result.successful[0];
        const tempUploadUrl = uploadedFile.uploadURL;
        
        // CRITICAL: Finalize upload by setting ACL and getting durable object path
        // This must happen immediately after upload to establish ownership
        const response = await apiRequest("PUT", `/api/orders/temp/receipt`, {
          receiptUrl: tempUploadUrl,
        });
        
        const durableObjectPath = response.objectPath;
        
        // CRITICAL: Invalidate policy SYNCHRONOUSLY when receipt changes
        setMerchantPolicyValidation(null);
        setIsValidatingPolicy(true);
        
        // Update formData with the DURABLE object path, not the expiring presigned URL
        setFormData(prev => ({ 
          ...prev, 
          receiptUrl: durableObjectPath,
          receiptImage: uploadedFile.meta as any // Keep for backward compatibility
        }));
        
        toast({
          title: "Receipt uploaded",
          description: "Your receipt has been uploaded successfully",
        });
      } catch (error) {
        console.error("Error finalizing receipt upload:", error);
        toast({
          title: "Upload failed",
          description: "Failed to save receipt. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

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

  // Store autocomplete selection handler - auto-fills dropoff address
  const handleStoreAutocompleteSelect = (store: any) => {
    console.log('🏪 Store selected from autocomplete:', store);
    
    // Note: formData.retailer is already set by StoreAutocomplete's onChange
    // We just need to handle additional state and UI feedback here
    
    // Check if "Any Location" was selected
    if (store.isAnyLocation) {
      // For "any location", just update company info and clear specific location
      setFormData(prev => ({
        ...prev,
        selectedCompany: { name: store.storeName }, // For compatibility
      }));

      // Clear any previously selected specific location
      setSelectedStore(null);
      setDropoffLocation(null);
      setIsAnyLocationSelected(true);

      toast({
        title: "Any location selected",
        description: `Driver will deliver to the nearest ${store.storeName} location`,
      });
    } else {
      // Specific location selected - set all address details
      setFormData(prev => ({
        ...prev,
        selectedCompany: { name: store.storeName }, // For compatibility
      }));

      // Auto-fill dropoff address from selected store
      const fullAddress = `${store.streetAddress}, ${store.city}, ${store.state} ${store.zipCode}`;
      
      // Create dropoff location with approximate coordinates (will be geocoded later)
      setDropoffLocation({
        lat: 0, // Will be geocoded by the system
        lng: 0
      });

      // Set as selected store for display
      setSelectedStore({
        placeId: `store-${store.id}`, // Add required placeId
        name: store.displayName,
        address: fullAddress,
        location: { lat: 0, lng: 0 },
        distance: 'TBD',
        isOpen: true
      });

      setIsAnyLocationSelected(false);

      toast({
        title: "Store selected",
        description: `${store.displayName} - Address auto-filled`,
      });
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
    const abortController = new AbortController();
    let isCurrentRequest = true;
    
    const validateMerchantPolicy = async () => {
      // Require real customer data - no policy validation with fake dates
      if (formData.retailer && formData.itemCategories.length > 0 && formData.purchaseDate) {
        // CRITICAL: Set to null immediately to invalidate stale results and disable button
        setMerchantPolicyValidation(null);
        
        try {
          // First, fetch merchant policy for the selected retailer
          const response = await fetch(`/api/merchants/policies/${encodeURIComponent(formData.retailer)}`, {
            signal: abortController.signal
          });
          let merchantPolicy = null;
          
          if (response.ok) {
            merchantPolicy = await response.json();
          }

          // CRITICAL: Ignore results from stale requests
          if (!isCurrentRequest) return;

          // Validate ALL selected categories (not just first one)
          const categoryValidationResults = [];
          for (const category of formData.itemCategories) {
            const bookingAttempt = {
              retailer: formData.retailer,
              itemCategory: category, // Validate each category individually
              itemDescription: formData.itemDescription || formData.orderName || 'Item return',
              itemValue: parseFloat(formData.itemValue) || 0,
              numberOfItems: formData.numberOfItems || 1,
              originalPackaging: formData.hasOriginalPackaging || false, // Use REAL packaging status
              purchaseDate: formData.purchaseDate, // MUST be real customer input - no fallback
              receiptUploaded: formData.receiptUrl !== '' || formData.receiptImage !== null,
              tagsAttached: formData.hasOriginalTags || false,
              purchaseLocation: formData.purchaseType === 'in_store' ? 'in_store' : 'online'
            };

            // Validate each category
            const categoryResult = await PolicyValidator.validateBookingAttempt(bookingAttempt, merchantPolicy);
            categoryValidationResults.push({ category, result: categoryResult });
          }

          // CRITICAL: Double-check we're still the current request
          if (!isCurrentRequest) return;

          // Combine results - if ANY category fails, the entire validation fails
          const validationResult = {
            isValid: categoryValidationResults.every(r => r.result.isValid),
            violations: categoryValidationResults.flatMap(r => r.result.violations)
          };

          if (validationResult.isValid) {
            setMerchantPolicyValidation({
              isValid: true,
              message: `✅ Return accepted under ${formData.retailer}'s policy`,
              violations: []
            });
            setIsValidatingPolicy(false);
          } else {
            setMerchantPolicyValidation({
              isValid: false,
              message: `❌ Return not allowed: ${validationResult.violations[0]?.message || 'Policy violation'}`,
              violations: validationResult.violations.map(v => v.message)
            });
            setIsValidatingPolicy(false);
          }
        } catch (error) {
          // Ignore aborted requests
          if (error instanceof Error && error.name === 'AbortError') return;
          
          // Only handle errors from current request
          if (!isCurrentRequest) return;
          
          console.error('Merchant policy validation error:', error);
          setMerchantPolicyValidation({
            isValid: true, // Default to allow if validation fails
            message: `⚠️ Unable to validate ${formData.retailer} policy - proceeding with caution`,
            violations: []
          });
          setIsValidatingPolicy(false);
        }
      } else {
        setMerchantPolicyValidation(null);
      }
    };

    validateMerchantPolicy();
    
    // Cleanup: abort request and mark as stale when dependencies change
    return () => {
      abortController.abort();
      isCurrentRequest = false;
    };
  }, [formData.retailer, formData.itemCategories.join(','), formData.itemValue, formData.receiptImage, formData.receiptUrl, formData.hasOriginalTags, formData.hasOriginalPackaging, formData.purchaseType, formData.itemDescription, formData.orderName, formData.numberOfItems, formData.purchaseDate]);

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
      // Track order creation in PostHog
      trackEvent('order_created', {
        orderId: data.id,
        retailer: formData.retailer,
        itemValue: formData.itemValue,
        totalPrice: data.totalPrice,
        paymentMethod: selectedPaymentMethod?.type,
      });
      
      toast({
        title: "Pickup scheduled!",
        description: "Your return pickup has been scheduled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setLocation('/orders');
    },
    onError: (error: any) => {
      // Track failed order creation
      trackEvent('order_creation_failed', {
        error: error.message,
        retailer: formData.retailer,
      });
      
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-foreground font-medium">First Name *</Label>
              <Input id="firstName" placeholder="John" value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value, e.target as HTMLInputElement)}
                className="bg-white/80 border-border focus:border-primary"
                required data-testid="input-first-name" />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-foreground font-medium">Last Name *</Label>
              <Input id="lastName" placeholder="Doe" value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value, e.target as HTMLInputElement)}
                className="bg-white/80 border-border focus:border-primary"
                required data-testid="input-last-name" />
            </div>
          </div>
          <div>
            <Label htmlFor="phone" className="text-foreground font-medium">Phone Number *</Label>
            <Input id="phone" type="tel" placeholder="(555) 123-4567" value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value, e.target as HTMLInputElement)}
              className="bg-white/80 border-border focus:border-primary"
              required data-testid="input-phone" />
          </div>
          {!isAuthenticated && (
            <div>
              <Label htmlFor="email" className="text-foreground font-medium">Email Address *</Label>
              <Input id="email" type="email" placeholder="your@email.com" value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value, e.target as HTMLInputElement)}
                className="bg-white/80 border-border focus:border-primary"
                required data-testid="input-email" />
              <p className="text-xs text-muted-foreground mt-1">We'll create your account with this email</p>
            </div>
          )}
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
        
        {/* Store Location Autocomplete - Type store name, see all locations */}
        <StoreAutocomplete
          label="Store Name & Location"
          placeholder="Type store name (e.g., Target, Walmart)..."
          value={formData.retailer}
          onChange={(value) => handleInputChange('retailer', value)}
          onStoreSelect={handleStoreAutocompleteSelect}
          required
          className="mb-4"
          data-testid="input-store-autocomplete"
        />

        {/* Optional: Keep CompanySelector for backwards compatibility - can be removed later */}
        <div className="text-sm text-muted-foreground mb-2">
          Or browse by company:
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

            {/* Show "Any Location" indicator or specific store details */}
            {isAnyLocationSelected ? (
              <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Store className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-amber-800">
                      Any {formData.retailer.replace(' (Any Location)', '')} Location
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      ✓ Driver will deliver to the nearest location based on your pickup address
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        )}

        {/* Policy Validation Results - Only show when form has retailer and categories */}
        {formData.retailer && formData.itemCategories.length > 0 && (policyValidation || merchantPolicyValidation) && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <Label className="text-amber-800 font-medium text-sm">Return Policy Status</Label>
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
                          <p key={index} className="text-xs text-amber-600 bg-amber-50 p-1 rounded mt-1">
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
                  ? 'bg-amber-50/80 border-amber-200' 
                  : 'bg-red-50/80 border-red-200'
              }`}>
                <div className="flex items-start space-x-2">
                  {merchantPolicyValidation.isValid ? (
                    <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${
                      merchantPolicyValidation.isValid ? 'text-amber-800' : 'text-red-800'
                    }`}>
                      Store Return Policy
                    </p>
                    <p className={`text-xs mt-1 ${
                      merchantPolicyValidation.isValid ? 'text-amber-600' : 'text-red-600'
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

          {/* Pickup Method */}
          <div className="space-y-3 bg-white/60 p-4 rounded-lg border border-border">
            <Label className="text-foreground font-semibold flex items-center">
              <User className="h-4 w-4 mr-2" />
              Pickup Method *
            </Label>
            <div className="space-y-2">
              <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <input type="radio" name="pickupMethod" value="handoff"
                  checked={formData.pickupMethod === 'handoff'}
                  onChange={(e) => handleInputChange('pickupMethod', e.target.value)}
                  className="mt-1 text-primary focus:ring-primary" data-testid="radio-pickup-handoff" />
                <div className="flex-1">
                  <span className="text-foreground font-medium">Hand to Driver</span>
                  <p className="text-sm text-muted-foreground mt-1">I will be present to hand items directly to the driver (signature required)</p>
                </div>
              </label>
              <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <input type="radio" name="pickupMethod" value="door_dropoff"
                  checked={formData.pickupMethod === 'door_dropoff'}
                  onChange={(e) => handleInputChange('pickupMethod', e.target.value)}
                  className="mt-1 text-primary focus:ring-primary" data-testid="radio-pickup-door-dropoff" />
                <div className="flex-1">
                  <span className="text-foreground font-medium">Leave at Front Door</span>
                  <p className="text-sm text-muted-foreground mt-1">Items will be left outside for driver pickup (no signature required)</p>
                </div>
              </label>
            </div>
          </div>

          {formData.pickupMethod === 'door_dropoff' && (
            <div className="space-y-4 bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-900">Door Drop-off Liability Terms</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Important: Please read and acknowledge the following terms for leaving items at your door
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded border border-amber-200">
                <div className="text-sm text-amber-800 space-y-2">
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>No signature required:</strong> Driver will take photos as proof of pickup</li>
                    <li><strong>Liability:</strong> ReturnIt and our drivers are NOT liable if items are lost, stolen, damaged, or missing before driver arrives</li>
                    <li><strong>Weather exposure:</strong> Items may be affected by weather conditions while left outside</li>
                    <li><strong>Theft risk:</strong> Items left unattended may be vulnerable to theft</li>
                    <li><strong>Your responsibility:</strong> You assume full risk for items left outside before pickup</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-2 bg-white p-3 rounded border border-amber-300">
                <Checkbox 
                  id="doorDropoffLiability" 
                  checked={formData.acceptsLiabilityTerms}
                  onCheckedChange={(checked) => handleInputChange('acceptsLiabilityTerms', checked === true)}
                  className="mt-0.5 border-amber-600 text-amber-600"
                  data-testid="checkbox-door-dropoff-liability"
                />
                <Label htmlFor="doorDropoffLiability" className="text-sm text-amber-900 cursor-pointer">
                  I understand and accept the liability terms. ReturnIt is not responsible if items are stolen, damaged, or lost before the driver picks them up.
                </Label>
              </div>

              <Textarea
                placeholder="Where will items be left? (e.g., 'By front door in Amazon box', 'Behind planter on porch', 'In garage by side door')"
                value={formData.pickupInstructions}
                onChange={(e) => handleInputChange('pickupInstructions', e.target.value)}
                className="bg-white border-amber-300 focus:border-amber-500"
                rows={3}
                data-testid="textarea-pickup-instructions"
              />
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
            {/* Purchase Date - REQUIRED for policy validation */}
            <div className="space-y-2">
              <Label htmlFor="purchaseDate" className="text-foreground font-medium">When did you purchase this item? *</Label>
              <Input 
                id="purchaseDate" 
                type="date" 
                value={formData.purchaseDate}
                onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="bg-white/80 border-border focus:border-primary"
                required 
                data-testid="input-purchase-date" 
              />
              <p className="text-xs text-muted-foreground">
                This is required to validate the return against {formData.retailer}'s return window policy
              </p>
            </div>

            {/* Return Requirements Warning */}
            {!formData.hasOriginalTags && !formData.hasOriginalPackaging && !formData.receiptUrl && !formData.receiptImage && (
              <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-300 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-900">Return Requirements Warning</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Most stores require at least ONE of the following for returns: original tags, original packaging, or receipt. 
                    Without these items, the store may refuse your return.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-foreground font-semibold">Return Requirements (At least 1 required) *</Label>
              <p className="text-sm text-muted-foreground">Select all that apply to increase return acceptance:</p>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="hasOriginalTags" checked={!!formData.hasOriginalTags}
                  onCheckedChange={(checked) => handleInputChange('hasOriginalTags', checked === true)}
                  className="border-primary text-primary"
                  data-testid="checkbox-original-tags" />
                <Label htmlFor="hasOriginalTags" className="text-foreground font-medium">
                  Original tags are still attached
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="hasOriginalPackaging" checked={!!formData.hasOriginalPackaging}
                  onCheckedChange={(checked) => handleInputChange('hasOriginalPackaging', checked === true)}
                  className="border-primary text-primary"
                  data-testid="checkbox-original-packaging" />
                <Label htmlFor="hasOriginalPackaging" className="text-foreground font-medium">
                  Item has original packaging (box, bag, etc.)
                </Label>
              </div>
            </div>

            {/* Receipt upload */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">
                {formData.purchaseType === 'online' ? 'Upload Receipt/Order Confirmation' : 'Upload Store Receipt'}
              </Label>
              <ObjectUploader
                maxNumberOfFiles={1}
                maxFileSize={10485760}
                onGetUploadParameters={handleReceiptGetUploadUrl}
                onComplete={handleReceiptUploadComplete}
                variant="outline"
                size="default"
                testId="button-upload-receipt"
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>{formData.receiptUrl ? 'Change Receipt' : 'Upload Receipt'}</span>
                </div>
              </ObjectUploader>
              {formData.receiptUrl && (
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Receipt uploaded successfully</span>
                </div>
              )}
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
        <Button 
          type="submit" 
          className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2"
          disabled={isValidatingPolicy || !merchantPolicyValidation}
          data-testid="button-step3-next"
        >
          {(isValidatingPolicy || !merchantPolicyValidation) ? (
            <span className="flex items-center space-x-2">
              <span className="animate-spin">⏳</span>
              <span>Validating Policy...</span>
            </span>
          ) : (
            'Next Step'
          )}
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

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h4 className="text-amber-900 font-semibold mb-3">Additional Fees</h4>
              <div className="space-y-2 text-sm">
                {pricingBreakdown.distanceFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-amber-700">Distance Fee:</span>
                    <span className="font-medium">${pricingBreakdown.distanceFee.toFixed(2)}</span>
                  </div>
                )}
                {pricingBreakdown.timeFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-amber-700">Time Fee:</span>
                    <span className="font-medium">${pricingBreakdown.timeFee.toFixed(2)}</span>
                  </div>
                )}
                {pricingBreakdown.sizeUpcharge > 0 && (
                  <div className="flex justify-between">
                    <span className="text-amber-700">Size Upcharge:</span>
                    <span className="font-medium">${pricingBreakdown.sizeUpcharge.toFixed(2)}</span>
                  </div>
                )}
                {pricingBreakdown.multiItemFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-amber-700">Multi-Item Fee:</span>
                    <span className="font-medium">${pricingBreakdown.multiItemFee.toFixed(2)}</span>
                  </div>
                )}
                {pricingBreakdown.smallOrderFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-amber-700">Small Order Fee:</span>
                    <span className="font-medium">${pricingBreakdown.smallOrderFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="text-amber-700">Service Fee (15%):</span>
                  <span className="font-medium">${pricingBreakdown.serviceFee.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-green-700">Service Total:</span>
                  <span className="font-semibold">${pricingBreakdown.totalPrice.toFixed(2)}</span>
                </div>
                {formData.tip > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-green-700">Driver Tip:</span>
                    <span className="font-semibold">${formData.tip.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-green-300">
                  <span className="text-green-900 font-bold text-lg">Grand Total:</span>
                  <span className="text-green-900 font-bold text-2xl" data-testid="text-final-total">
                    ${(pricingBreakdown.totalPrice + (formData.tip || 0)).toFixed(2)}
                  </span>
                </div>
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

      {/* Tip for Driver (Optional) */}
      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
        <h4 className="text-amber-900 font-semibold mb-2">Tip Your Driver (Optional)</h4>
        <p className="text-sm text-amber-700 mb-3">100% of your tip goes directly to the driver</p>
        
        {/* Quick Tip Buttons */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <Button
            type="button"
            variant={formData.tip === 5 ? 'default' : 'outline'}
            onClick={() => handleInputChange('tip', 5)}
            className="h-10"
            data-testid="button-tip-5"
          >
            $5
          </Button>
          <Button
            type="button"
            variant={formData.tip === 10 ? 'default' : 'outline'}
            onClick={() => handleInputChange('tip', 10)}
            className="h-10"
            data-testid="button-tip-10"
          >
            $10
          </Button>
          <Button
            type="button"
            variant={formData.tip === 15 ? 'default' : 'outline'}
            onClick={() => handleInputChange('tip', 15)}
            className="h-10"
            data-testid="button-tip-15"
          >
            $15
          </Button>
          <Button
            type="button"
            variant={formData.tip === 20 ? 'default' : 'outline'}
            onClick={() => handleInputChange('tip', 20)}
            className="h-10"
            data-testid="button-tip-20"
          >
            $20
          </Button>
        </div>

        {/* Custom Tip Input */}
        <div>
          <Label htmlFor="customTip" className="text-amber-800">Custom Amount</Label>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-amber-900 font-semibold">$</span>
            <Input
              id="customTip"
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter custom amount"
              value={formData.tip || ''}
              onChange={(e) => handleInputChange('tip', parseFloat(e.target.value) || 0)}
              className="bg-white border-amber-300"
              data-testid="input-custom-tip"
            />
          </div>
        </div>

        {formData.tip > 0 && (
          <div className="mt-3 p-2 bg-amber-100 rounded text-center">
            <p className="text-sm text-amber-800">
              Thank you! Driver will receive <strong>${formData.tip.toFixed(2)}</strong>
            </p>
          </div>
        )}
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
  // Guest checkout is allowed - no authentication check here

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-transparent via-transparent to-transparent">
      {/* Sticky Header - Stitch Pattern */}
      <header className="bg-[#f8f7f5]/80 dark:bg-[#231b0f]/80 backdrop-blur-sm sticky top-0 z-50 border-b border-primary/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            <BackButton fallbackUrl="/" />
            <h1 className="text-lg font-bold text-center flex-1 pr-8">New Order</h1>
          </div>
        </div>
      </header>

      {/* Main Form Card - Stitch Shadow Pattern */}
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Tabs defaultValue="return" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 h-auto" data-testid="tabs-order-type">
            <TabsTrigger value="return" className="text-xs sm:text-sm py-2.5" data-testid="tab-return">
              <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="truncate">Book Return</span>
            </TabsTrigger>
            <TabsTrigger value="exchange" className="text-xs sm:text-sm py-2.5" data-testid="tab-exchange">
              <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="truncate">Exchange</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="return" className="mt-0">
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
          </TabsContent>

          <TabsContent value="exchange" className="mt-0">
            <div className="bg-card rounded-xl shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_30px_-15px_rgba(249,152,6,0.2)] border border-border">
              <div className="p-24 text-center">
                <h2 className="text-6xl font-bold text-foreground">Coming Soon</h2>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />

      {/* Authentication Prompt Dialog */}
      <Dialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">Almost There!</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground pt-2">
              Create an account to complete your booking. We've saved all your information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="bg-accent/50 border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">Why create an account?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Track your pickup in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>View order history and receipts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Faster checkout next time</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <Link href={`/login?tab=register&returnTo=/book-pickup`}>
                <Button className="w-full bg-primary hover:bg-primary/90" data-testid="button-create-account">
                  <User className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
              </Link>
              <Link href={`/login?returnTo=/book-pickup`}>
                <Button variant="outline" className="w-full" data-testid="button-sign-in-auth">
                  Already have an account? Sign In
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}