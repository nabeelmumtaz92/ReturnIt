import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth-simple";
import { Package, MapPin, CreditCard, ArrowLeft, ArrowRight, Check, Loader2, Shield, AlertCircle, FileText, HelpCircle, X, Plus, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NativePhotoUploader } from "@/components/NativePhotoUploader";
import { BrandLogo } from "@/components/BrandLogo";
import StoreAutocomplete from "@/components/StoreAutocomplete";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DonationLocation } from "@shared/schema";

// Load Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface ReturnItem {
  id: string;
  orderName: string;
  itemDescription: string;
  itemValue: string;
  boxSize: string;
  numberOfBoxes: number;
  numberOfBags: number;
}

interface FormData {
  // Page 1
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  // Page 2
  isDonation: boolean; // true for donation pickups, false for returns/exchanges
  isExchange: boolean; // true for exchanges, false for returns/donations
  donationLocationId: number | null; // ID of selected charity (for server validation)
  retailerName: string; // First select retailer name (or donation org name if isDonation)
  retailerLocation: string; // Then select specific store location (or donation location if isDonation)
  retailer: string; // Combined value for backend
  storeDestinationName: string; // Editable store name (or donation org name)
  storeDestinationAddress: string; // Editable store address (or donation location address)
  storeDestinationCity: string; // Editable city
  storeDestinationState: string; // Editable state
  storeDestinationZip: string; // Editable ZIP code
  items: ReturnItem[]; // Multiple items in one return order
  notes: string;
  // Photo verification (MANDATORY - at least one required)
  receiptPhotoUrl?: string;
  tagsPhotoUrl?: string;
  packagingPhotoUrl?: string;
  donationPhotoUrls?: string[]; // Multiple photo URLs for donations (up to 12)
  // Exchange-specific fields
  itemIHaveDescription?: string; // Required for exchanges - what customer wants to exchange
  itemIWantDescription?: string; // Required for exchanges - what customer wants to receive
  itemIHavePhotoUrls?: string[]; // Required for exchanges - photos of item to exchange
  itemIWantPhotoUrls?: string[]; // Optional for exchanges - photos of desired item
  // Page 3
  serviceTier: 'standard' | 'priority' | 'instant'; // Service tier selection
  tip: number;
  paymentMethod: string;
}

// Simple geocoding for St. Louis area ZIP codes (approximate coordinates)
const ZIP_COORDINATES: Record<string, { lat: number; lng: number }> = {
  '63101': { lat: 38.6270, lng: -90.1994 }, // Downtown
  '63102': { lat: 38.6350, lng: -90.1880 },
  '63103': { lat: 38.6340, lng: -90.2080 },
  '63104': { lat: 38.6040, lng: -90.2360 },
  '63105': { lat: 38.6450, lng: -90.3340 }, // Clayton
  '63106': { lat: 38.6580, lng: -90.2160 },
  '63107': { lat: 38.6680, lng: -90.2220 },
  '63108': { lat: 38.6380, lng: -90.2650 },
  '63109': { lat: 38.5740, lng: -90.2860 },
  '63110': { lat: 38.5980, lng: -90.2540 },
  '63111': { lat: 38.5420, lng: -90.2660 },
  '63112': { lat: 38.6540, lng: -90.2680 },
  '63113': { lat: 38.6760, lng: -90.2380 },
  '63114': { lat: 38.7020, lng: -90.3340 },
  '63115': { lat: 38.6880, lng: -90.2040 },
  '63116': { lat: 38.5680, lng: -90.2680 },
  '63117': { lat: 38.6620, lng: -90.3120 },
  '63118': { lat: 38.5860, lng: -90.2280 },
  '63119': { lat: 38.5780, lng: -90.3360 }, // Webster Groves
  '63120': { lat: 38.7060, lng: -90.2620 },
  '63121': { lat: 38.7380, lng: -90.3140 },
  '63122': { lat: 38.5920, lng: -90.3840 },
  '63123': { lat: 38.5380, lng: -90.3140 },
  '63124': { lat: 38.6320, lng: -90.3660 }, // Ladue
  '63125': { lat: 38.4840, lng: -90.2980 },
  '63126': { lat: 38.5460, lng: -90.3860 },
  '63127': { lat: 38.5260, lng: -90.3640 },
  '63128': { lat: 38.4880, lng: -90.3660 },
  '63129': { lat: 38.4720, lng: -90.3220 },
  '63130': { lat: 38.6660, lng: -90.3300 }, // University City
  '63131': { lat: 38.6140, lng: -90.4540 },
  '63132': { lat: 38.6720, lng: -90.3680 },
  '63133': { lat: 38.7260, lng: -90.2780 },
  '63134': { lat: 38.7340, lng: -90.3620 },
  '63135': { lat: 38.7600, lng: -90.2780 },
  '63136': { lat: 38.7520, lng: -90.3140 },
  '63137': { lat: 38.7700, lng: -90.2420 },
  '63138': { lat: 38.7860, lng: -90.2160 },
  '63139': { lat: 38.6160, lng: -90.2940 },
  '63140': { lat: 38.6960, lng: -90.2940 },
  '63141': { lat: 38.6620, lng: -90.4340 },
  '63143': { lat: 38.6060, lng: -90.3320 }, // Brentwood
  '63144': { lat: 38.6080, lng: -90.3180 },
  '63146': { lat: 38.7080, lng: -90.4340 },
};

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Parse store location to get coordinates
function getStoreCoordinates(storeLocation: string): { lat: number; lng: number } {
  // Extract city from store location string (format: "City, State - Address - Store Name")
  const cityMatch = storeLocation.match(/^([^,]+)/);
  const city = cityMatch ? cityMatch[1].trim() : '';
  
  // Map cities to approximate coordinates
  const cityCoordinates: Record<string, { lat: number; lng: number }> = {
    'Brentwood': { lat: 38.6167, lng: -90.3461 },
    'Chesterfield': { lat: 38.6631, lng: -90.5772 },
    'Clayton': { lat: 38.6456, lng: -90.3234 },
    'Kirkwood': { lat: 38.5833, lng: -90.4067 },
    'St. Louis': { lat: 38.6270, lng: -90.1994 },
    'Des Peres': { lat: 38.6000, lng: -90.4333 },
    'Lemay': { lat: 38.5156, lng: -90.2881 },
    'Bridgeton': { lat: 38.7692, lng: -90.4184 },
    'Town and Country': { lat: 38.6250, lng: -90.4750 },
  };
  
  return cityCoordinates[city] || { lat: 38.6270, lng: -90.1994 }; // Default to downtown St. Louis
}

// Service tier pricing
const SERVICE_TIERS = {
  standard: {
    name: 'Standard',
    price: 6.99,
    driverEarns: 5.00,
    description: '1-3 hour pickup window',
    icon: '📦'
  },
  priority: {
    name: 'Priority',
    price: 9.99,
    driverEarns: 8.00,
    description: 'Under 1 hour pickup',
    icon: '⚡'
  },
  instant: {
    name: 'Instant',
    price: 12.99,
    driverEarns: 10.00,
    description: 'ASAP pickup',
    icon: '🚀'
  }
};

// Pricing calculation based on business rules
function calculatePricing(formData: FormData & { tip?: number }) {
  // DONATIONS ARE FREE - only optional tip to driver
  if (formData.isDonation) {
    const tip = formData.tip || 0;
    return {
      basePrice: 0,
      sizeUpcharge: 0,
      multiBoxFee: 0,
      totalItemValue: 0,
      distance: 0,
      subtotal: 0,
      serviceFee: 0,
      fuelFee: 0,
      tax: 0,
      tip,
      total: tip // Donations are FREE - customer only pays optional tip
    };
  }
  
  const tier = SERVICE_TIERS[formData.serviceTier || 'standard'];
  const basePrice = tier.price; // Base pickup fee from selected tier
  
  // Size upcharge based on box size
  const sizeUpcharges: Record<string, number> = {
    'small': 0,
    'medium': 2.00,
    'large': 4.00,
    'xlarge': 6.00
  };
  
  // Calculate size upcharges and multi-box fees from ALL items
  const sizeUpcharge = formData.items.reduce((sum, item) => {
    return sum + (sizeUpcharges[item.boxSize] || 0);
  }, 0);
  
  // Calculate total packages across ALL items (only first package is free for entire order)
  // Explicitly convert to numbers to handle empty strings during editing
  const totalPackagesAllItems = formData.items.reduce((sum, item) => {
    const boxes = typeof item.numberOfBoxes === 'number' ? item.numberOfBoxes : parseInt(item.numberOfBoxes as any) || 0;
    const bags = typeof item.numberOfBags === 'number' ? item.numberOfBags : parseInt(item.numberOfBags as any) || 0;
    return sum + boxes + bags;
  }, 0);
  const multiBoxFee = totalPackagesAllItems > 1 ? (totalPackagesAllItems - 1) * 3.00 : 0;
  
  // Calculate total item values
  const totalItemValue = formData.items.reduce((sum, item) => {
    const value = parseFloat(item.itemValue) || 0;
    return sum + value;
  }, 0);
  
  // Calculate distance for fuel fee
  let distance = 10; // Default 10 miles if calculation fails
  let fuelFee = 1.25; // Default fuel fee
  
  if (formData.zipCode && formData.retailerLocation) {
    const pickupCoords = ZIP_COORDINATES[formData.zipCode] || { lat: 38.6270, lng: -90.1994 };
    const storeCoords = getStoreCoordinates(formData.retailerLocation);
    
    // Calculate straight-line distance and apply 1.3x factor for actual roads
    const straightLineDistance = calculateDistance(
      pickupCoords.lat,
      pickupCoords.lng,
      storeCoords.lat,
      storeCoords.lng
    );
    distance = straightLineDistance * 1.3; // Account for actual road distance
    
    // Calculate fuel fee based on distance
    // Assumptions: $3.50/gallon gas, 25 MPG average, round trip
    const gasPrice = 3.50;
    const mpg = 25;
    const roundTripDistance = distance * 2;
    fuelFee = (roundTripDistance / mpg) * gasPrice;
    fuelFee = Math.max(fuelFee, 1.25); // Minimum $1.25 fuel fee
  }
  
  const subtotal = basePrice + sizeUpcharge + multiBoxFee;
  const taxRate = 0; // 0% tax
  const tip = formData.tip || 0;
  
  // Service fee is 5.5% of total order
  // Since serviceFee is part of total, we need to calculate it algebraically:
  // total = subtotal + fuelFee + tax + serviceFee + tip
  // serviceFee = total * 0.055
  // Solving: total = (subtotal + fuelFee + tax + tip) / (1 - 0.055)
  const baseBeforeServiceFee = subtotal + fuelFee + tip;
  const tax = baseBeforeServiceFee * taxRate;
  const totalBeforeServiceFee = baseBeforeServiceFee + tax;
  const serviceFee = totalBeforeServiceFee * (0.055 / (1 - 0.055)); // 5.5% of final total
  
  const total = totalBeforeServiceFee + serviceFee;
  
  return {
    basePrice,
    sizeUpcharge,
    multiBoxFee,
    totalItemValue,
    distance: Math.round(distance * 10) / 10, // Round to 1 decimal
    subtotal,
    serviceFee,
    fuelFee,
    tax,
    tip,
    total
  };
}

// Payment Form Component
function PaymentForm({ amount, onSuccess }: { amount: number; onSuccess: (paymentIntent: any) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed.",
        });
        onSuccess(paymentIntent);
      }
    } catch (err: any) {
      toast({
        title: "Payment Error",
        description: err.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-[#B8956A] hover:bg-[#A0805A] text-white"
        data-testid="button-confirm-payment"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </Button>
    </form>
  );
}

export default function BookReturn() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [bookingType, setBookingType] = useState<'return' | 'exchange' | 'donation'>('return');
  const [page, setPage] = useState(1);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());
  const [selectedStore, setSelectedStore] = useState<any | null>(null); // Track selected store for third-party warning
  const [formData, setFormData] = useState<FormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    streetAddress: '',
    city: 'St. Louis',
    state: 'MO',
    zipCode: '',
    isDonation: false, // donation toggle
    isExchange: false, // exchange toggle
    donationLocationId: null, // ID of selected charity location (for server validation)
    retailerName: '',
    retailerLocation: '',
    retailer: '',
    storeDestinationName: '',
    storeDestinationAddress: '',
    storeDestinationCity: '',
    storeDestinationState: '',
    storeDestinationZip: '',
    items: [{
      id: crypto.randomUUID(),
      orderName: '',
      itemDescription: '',
      itemValue: '',
      boxSize: 'small',
      numberOfBoxes: 0,
      numberOfBags: 0
    }],
    notes: '',
    itemIHaveDescription: '',
    itemIWantDescription: '',
    itemIHavePhotoUrls: [],
    itemIWantPhotoUrls: [],
    serviceTier: 'standard',
    tip: 0,
    paymentMethod: 'card'
  });
  
  // Fetch donation locations from API
  const { data: donationLocations, isLoading: isLoadingDonations } = useQuery<DonationLocation[]>({
    queryKey: ['/api/donation-locations'],
    enabled: bookingType === 'donation' // Only fetch when on donation tab
  });

  const pricing = useMemo(() => calculatePricing(formData), [formData]);

  // Calculate total boxes and bags across all items
  const getTotalItems = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.numberOfBoxes || 0) + (item.numberOfBags || 0);
    }, 0);
  };

  // Item management functions
  const addItem = () => {
    const totalItems = getTotalItems();
    if (totalItems >= 8) {
      toast({
        title: "Maximum items reached",
        description: "You can have a maximum of 8 boxes/bags total across all items in one order.",
        variant: "destructive"
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: crypto.randomUUID(),
          orderName: '',
          itemDescription: '',
          itemValue: '',
          boxSize: 'small',
          numberOfBoxes: 0,
          numberOfBags: 0
        }
      ]
    }));
  };

  const removeItem = (itemId: string) => {
    if (formData.items.length <= 1) {
      toast({
        title: "Cannot remove",
        description: "You must have at least one item",
        variant: "destructive",
      });
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const updateItem = (itemId: string, field: keyof ReturnItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          // Handle numberOfBoxes and numberOfBags - allow empty string temporarily, will be normalized on blur
          if (field === 'numberOfBoxes' || field === 'numberOfBags') {
            if (value === '') {
              return { ...item, [field]: value as any };
            }
            return { ...item, [field]: typeof value === 'string' ? parseInt(value) : value };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    }));
  };

  // Photo upload handlers - simplified with NativePhotoUploader
  const handleReceiptPhotosChange = (urls: string[]) => {
    setFormData(prev => ({
      ...prev,
      receiptPhotoUrl: urls[0] || undefined, // First URL for backward compatibility
      donationPhotoUrls: prev.isDonation ? urls : undefined, // All URLs for donations
    }));
  };

  const handleTagsPhotoChange = (urls: string[]) => {
    setFormData(prev => ({
      ...prev,
      tagsPhotoUrl: urls[0] || undefined,
    }));
  };

  const handlePackagingPhotoChange = (urls: string[]) => {
    setFormData(prev => ({
      ...prev,
      packagingPhotoUrl: urls[0] || undefined,
    }));
  };

  const handleItemIHavePhotosChange = (urls: string[]) => {
    setFormData(prev => ({
      ...prev,
      itemIHavePhotoUrls: urls,
    }));
  };

  const handleItemIWantPhotosChange = (urls: string[]) => {
    setFormData(prev => ({
      ...prev,
      itemIWantPhotoUrls: urls,
    }));
  };

  // Validate current page before proceeding
  const validatePage = (pageNum: number): boolean => {
    const errors = new Set<string>();
    
    if (pageNum === 1) {
      if (!formData.firstName) errors.add('firstName');
      if (!formData.lastName) errors.add('lastName');
      if (!formData.email) errors.add('email');
      if (!formData.phone) errors.add('phone');
      if (!formData.streetAddress) errors.add('streetAddress');
      if (!formData.city) errors.add('city');
      if (!formData.state) errors.add('state');
      if (!formData.zipCode) errors.add('zipCode');
      
      if (errors.size > 0) {
        setValidationErrors(errors);
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return false;
      }
    } else if (pageNum === 2) {
      if (!formData.retailerName) errors.add('retailerName');
      if (!formData.retailerLocation) errors.add('retailerLocation');
      
      // EXCHANGE MODE: Different validation rules
      if (formData.isExchange) {
        // Require "Item I Have" description
        if (!formData.itemIHaveDescription) {
          errors.add('itemIHaveDescription');
        }
        
        // Require at least one "Item I Have" photo
        if (!formData.itemIHavePhotoUrls || formData.itemIHavePhotoUrls.length === 0) {
          errors.add('itemIHavePhotos');
          toast({
            title: "Photo Required",
            description: "Please upload at least one photo of the item you want to exchange",
            variant: "destructive",
          });
          return false;
        }
        
        if (errors.size > 0) {
          setValidationErrors(errors);
          toast({
            title: "Missing Information",
            description: "Please fill in all required Exchange fields",
            variant: "destructive",
          });
          return false;
        }
      } else {
        // RETURN/DONATION MODE: Standard validation
        // Validate all items
        let hasEmptyItems = false;
        formData.items.forEach((item, index) => {
          if (!item.orderName) {
            errors.add(`item-${index}-orderName`);
            hasEmptyItems = true;
          }
          if (!item.itemDescription) {
            errors.add(`item-${index}-itemDescription`);
            hasEmptyItems = true;
          }
          if (!item.itemValue) {
            errors.add(`item-${index}-itemValue`);
            hasEmptyItems = true;
          }
        });
        
        if (hasEmptyItems) {
          toast({
            title: "Missing Item Information",
            description: "Please fill in all item details (name, description, and value)",
            variant: "destructive",
          });
          return false;
        }
        
        // MANDATORY: At least one photo required
        if (!formData.receiptPhotoUrl && !formData.tagsPhotoUrl && !formData.packagingPhotoUrl) {
          errors.add('photoRequired');
          toast({
            title: "Photo Verification Required",
            description: "You must upload at least one photo: receipt, tags, or packaging",
            variant: "destructive",
          });
          return false;
        }
        
        if (errors.size > 0) {
          setValidationErrors(errors);
          toast({
            title: "Missing Information",
            description: "Please fill in all required fields",
            variant: "destructive",
          });
          return false;
        }
      }
    }
    
    setValidationErrors(new Set());
    return true;
  };

  const handleNextPage = async () => {
    console.log('🔐 handleNextPage - Current page:', page, 'isAuthenticated:', isAuthenticated, 'user:', user);
    
    if (!validatePage(page)) {
      return;
    }

    // SECURITY: Require authentication BEFORE proceeding from page 1 to page 2
    if (page === 1 && !isAuthenticated) {
      console.warn('🚫 Blocking navigation from page 1 - not authenticated');
      toast({
        title: "Sign In Required",
        description: "Please sign in before continuing with your booking.",
        variant: "destructive",
      });
      // Save current form data to session storage so we can restore it after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('bookingFormData', JSON.stringify(formData));
        sessionStorage.setItem('bookingReturnUrl', '/book-return');
      }
      setLocation('/login');
      return;
    }

    if (page === 3) {
      // Double-check authentication before creating payment intent
      if (!isAuthenticated) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to complete your booking.",
          variant: "destructive",
        });
        setLocation('/login');
        return;
      }

      // Create payment intent before going to payment page (page 4)
      try {
        const response = await apiRequest('POST', '/api/create-payment-intent', {
          amount: pricing.total,
        });
        setClientSecret(response.clientSecret);
        setPage(4);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to initialize payment",
          variant: "destructive",
        });
      }
    } else {
      setPage(page + 1);
    }
  };

  const updateField = (field: keyof FormData, value: string | number) => {
    // Clear validation error for this field when user starts typing
    if (validationErrors.has(field)) {
      setValidationErrors(prev => {
        const newErrors = new Set(prev);
        newErrors.delete(field);
        return newErrors;
      });
    }
    
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // When retailer name changes, reset location and update combined retailer field
      if (field === 'retailerName') {
        updated.retailerLocation = '';
        updated.retailer = value as string;
      }
      
      // When location is selected, parse and auto-fill address fields
      // Format: "City, State - Address - Store Name"
      if (field === 'retailerLocation' && value) {
        const locationString = value as string;
        const parts = locationString.split(' - ');
        
        if (parts.length >= 3) {
          const [cityState, address, storeName] = parts;
          const [city, state] = cityState.split(', ');
          
          // Auto-fill the store location fields (editable by user)
          updated.retailer = locationString;
          updated.storeDestinationName = storeName;
          updated.storeDestinationAddress = address;
          updated.storeDestinationCity = city;
          updated.storeDestinationState = state;
          
          toast({
            title: "Store location selected",
            description: `${storeName} - ${address}, ${city}, ${state}`,
          });
        } else {
          updated.retailer = locationString;
        }
      }
      
      return updated;
    });
  };

  const createOrderMutation = useMutation({
    mutationFn: async (data: FormData & { paymentIntentId?: string }) => {
      const pricing = calculatePricing(data);
      
      // EXCHANGE MODE: Use Exchange-specific fields
      let orderName, itemDescription, largestBoxSize, totalBoxes, totalBags;
      
      if (data.isExchange) {
        // For Exchanges: Use "Item I Have" description as order name and item description
        orderName = data.itemIHaveDescription || 'Exchange Order';
        itemDescription = `Exchange Request:\n\nItem I Have: ${data.itemIHaveDescription || 'Not specified'}\n\nItem I Want: ${data.itemIWantDescription || 'Not specified'}`;
        
        // Exchanges default to small package (can be updated by driver)
        largestBoxSize = 'small';
        totalBoxes = 0;
        totalBags = 0;
      } else {
        // RETURN/DONATION MODE: Combine all items into order name and description
        orderName = data.items.map(item => item.orderName).join(', ');
        itemDescription = data.items.map((item, index) => {
          const boxes = item.numberOfBoxes || 0;
          const bags = item.numberOfBags || 0;
          const packageInfo = [];
          if (boxes > 0) packageInfo.push(`${boxes} ${boxes === 1 ? 'box' : 'boxes'}`);
          if (bags > 0) packageInfo.push(`${bags} ${bags === 1 ? 'bag' : 'bags'}`);
          return `Item ${index + 1}: ${item.orderName} - ${item.itemDescription} ($${item.itemValue}) - ${item.boxSize} package, ${packageInfo.join(' + ')}`;
        }).join('\n');
        
        // Aggregate box details from all items for backend compatibility
        const sizeRanking = { small: 1, medium: 2, large: 3, xlarge: 4 };
        largestBoxSize = data.items.reduce((largest, item) => {
          return sizeRanking[item.boxSize as keyof typeof sizeRanking] > sizeRanking[largest as keyof typeof sizeRanking] 
            ? item.boxSize 
            : largest;
        }, 'small');
        totalBoxes = data.items.reduce((sum, item) => sum + (item.numberOfBoxes || 0), 0);
        totalBags = data.items.reduce((sum, item) => sum + (item.numberOfBags || 0), 0);
      }
      
      return apiRequest('POST', '/api/orders', {
        // User info (optional for guests)
        userId: user?.id || null,
        customerEmail: data.email,
        customerPhone: data.phone,
        
        // Pickup details
        streetAddress: data.streetAddress,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        notes: data.notes,
        
        // Booking type flags
        isDonation: data.isDonation || false,
        isExchange: data.isExchange || false,
        
        // Exchange-specific fields (only sent if isExchange=true)
        ...(data.isExchange && {
          itemIHaveDescription: data.itemIHaveDescription,
          itemIWantDescription: data.itemIWantDescription,
          itemIHavePhotoUrls: data.itemIHavePhotoUrls || [],
          itemIWantPhotoUrls: data.itemIWantPhotoUrls || [],
        }),
        
        // Return details
        retailer: data.retailer,
        itemCategory: 'Other',
        itemDescription: itemDescription,
        orderName: orderName,
        
        // Box details - aggregated from per-item data (or defaults for Exchange)
        boxSize: largestBoxSize,
        numberOfBoxes: totalBoxes,
        numberOfBags: totalBags,
        
        // Required fields with defaults
        purchaseType: 'online',
        itemSize: largestBoxSize,
        numberOfItems: data.isExchange ? 1 : data.items.length,
        hasOriginalTags: false,
        receiptUploaded: data.isExchange 
          ? !!(data.itemIHavePhotoUrls && data.itemIHavePhotoUrls.length > 0)
          : !!(data.receiptPhotoUrl || data.tagsPhotoUrl || data.packagingPhotoUrl),
        acceptsLiabilityTerms: true,
        
        // Pricing (send essential values - service fee and tax are included in total)
        itemValue: pricing.totalItemValue,
        basePrice: pricing.basePrice,
        sizeUpcharge: pricing.sizeUpcharge,
        multiBoxFee: pricing.multiBoxFee,
        totalPrice: pricing.total,
        // returnlyFee represents platform revenue (service fee + our margin)
        returnlyFee: pricing.serviceFee,
        
        // Payment
        status: 'paid',
        paymentMethod: 'card',
        paymentIntentId: data.paymentIntentId,
      });
    },
    onSuccess: (data) => {
      setConfirmedOrder(data);
      setPage(5); // Show confirmation page
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create order",
        variant: "destructive",
      });
    },
  });

  const handlePaymentSuccess = (paymentIntent: any) => {
    // After successful payment, create the order
    createOrderMutation.mutate({ ...formData, paymentIntentId: paymentIntent.id });
  };

  // Keyboard navigation for tabs with focus management
  const handleTabKeyDown = (e: React.KeyboardEvent, type: 'return' | 'exchange' | 'donation') => {
    const tabs: Array<'return' | 'exchange' | 'donation'> = ['return', 'exchange', 'donation'];
    const currentIndex = tabs.indexOf(type);
    
    let nextIndex = currentIndex;
    
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = tabs.length - 1;
    }
    
    if (nextIndex !== currentIndex) {
      const newType = tabs[nextIndex];
      setBookingType(newType);
      setFormData(prev => ({ 
        ...prev, 
        isDonation: newType === 'donation',
        isExchange: newType === 'exchange'
      }));
      setPage(1);
      
      // Move focus to the newly selected tab
      setTimeout(() => {
        const newTab = document.getElementById(`tab-${newType}`);
        if (newTab) {
          newTab.focus();
        }
      }, 0);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-3xl mx-auto px-4">
        {/* Header with Return It logo link */}
        <div className="text-center mb-8">
          <BrandLogo size="lg" linkToHome={true} className="justify-center" />
        </div>

        {/* Modern Segmented Control Tabs */}
        <div className="mb-8">
          <div 
            role="tablist" 
            aria-label="Booking type selection"
            className="relative flex sm:flex-row flex-col w-full rounded-2xl bg-gradient-to-br from-[#FAF8F4] to-[#F5F0E8] p-1.5 shadow-lg ring-1 ring-black/5 mb-6 gap-2 sm:gap-0"
          >
            {/* Animated Active Indicator - Desktop only */}
            <motion.div
              layoutId="bookingTab"
              className="absolute inset-y-1.5 rounded-xl bg-gradient-to-r from-[#C8A676] to-[#B8956A] shadow-xl hidden sm:block"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              style={{
                left: bookingType === 'return' ? '0.375rem' : bookingType === 'exchange' ? 'calc(33.333% + 0.125rem)' : 'calc(66.666% + 0.125rem)',
                width: 'calc(33.333% - 0.25rem)'
              }}
            />
            
            {/* Return Tab */}
            <button
              id="tab-return"
              type="button"
              onClick={() => {
                setBookingType('return');
                setFormData(prev => ({ ...prev, isDonation: false, isExchange: false }));
                setPage(1);
              }}
              onKeyDown={(e) => handleTabKeyDown(e, 'return')}
              tabIndex={bookingType === 'return' ? 0 : -1}
              className={cn(
                "relative z-10 flex-1 rounded-xl py-4 px-4 text-sm font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8956A]",
                bookingType === 'return' 
                  ? "text-white sm:text-white text-[#2F2A23] sm:bg-transparent bg-gradient-to-r from-[#C8A676] to-[#B8956A] shadow-lg sm:shadow-none" 
                  : "text-[#8C7654] hover:text-[#2F2A23] hover:bg-white/40 active:scale-95"
              )}
              role="tab"
              aria-selected={bookingType === 'return'}
              aria-controls="booking-content"
              data-testid="tab-return"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">📦</span>
                <span>Book Return</span>
              </div>
            </button>

            {/* Exchange Tab */}
            <button
              id="tab-exchange"
              type="button"
              onClick={() => {
                setBookingType('exchange');
                setFormData(prev => ({ ...prev, isDonation: false, isExchange: true }));
                setPage(1);
              }}
              onKeyDown={(e) => handleTabKeyDown(e, 'exchange')}
              tabIndex={bookingType === 'exchange' ? 0 : -1}
              className={cn(
                "relative z-10 flex-1 rounded-xl py-4 px-4 text-sm font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8956A]",
                bookingType === 'exchange' 
                  ? "text-white sm:text-white text-[#2F2A23] sm:bg-transparent bg-gradient-to-r from-[#C8A676] to-[#B8956A] shadow-lg sm:shadow-none" 
                  : "text-[#8C7654] hover:text-[#2F2A23] hover:bg-white/40 active:scale-95"
              )}
              role="tab"
              aria-selected={bookingType === 'exchange'}
              aria-controls="booking-content"
              data-testid="tab-exchange"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">🔄</span>
                <span>Book Exchange</span>
              </div>
            </button>

            {/* Donation Tab */}
            <button
              id="tab-donation"
              type="button"
              onClick={() => {
                setBookingType('donation');
                setFormData(prev => ({ ...prev, isDonation: true, isExchange: false }));
                setPage(1);
              }}
              onKeyDown={(e) => handleTabKeyDown(e, 'donation')}
              tabIndex={bookingType === 'donation' ? 0 : -1}
              className={cn(
                "relative z-10 flex-1 rounded-xl py-4 px-4 text-sm font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8956A]",
                bookingType === 'donation' 
                  ? "text-white sm:text-white text-[#2F2A23] sm:bg-transparent bg-gradient-to-r from-[#C8A676] to-[#B8956A] shadow-lg sm:shadow-none" 
                  : "text-[#8C7654] hover:text-[#2F2A23] hover:bg-white/40 active:scale-95"
              )}
              role="tab"
              aria-selected={bookingType === 'donation'}
              aria-controls="booking-content"
              data-testid="tab-donation"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">❤️</span>
                <span>Book Donation</span>
              </div>
            </button>
          </div>
          {page <= 3 && <p className="text-muted-foreground text-lg text-center font-medium">Step {page} of 3</p>}
        </div>

        {/* Tab Content Panel */}
        <div id="booking-content" role="tabpanel" aria-labelledby={`tab-${bookingType}`}>
          {/* Exchange uses same form flow as Returns/Donations */}
          {/* All three booking types use the same form structure */}
          {(
            <>
            {/* Professional progress bar */}
            {page <= 3 && (
              <div className="mb-10">
                <div className="flex items-start justify-between gap-2">
                  {[
                    { num: 1, label: 'Personal Info' },
                    { num: 2, label: bookingType === 'donation' ? 'Donation Details' : 'Return Details' },
                    { num: 3, label: 'Review' }
                  ].map((step, index) => (
                    <div key={step.num} className="flex flex-col items-center flex-1 min-w-0">
                      <div className="flex items-center w-full">
                        {index > 0 && (
                          <div className={`flex-1 h-0.5 ${
                            page > step.num - 1 ? 'bg-[#B8956A]' : 'bg-muted-foreground/20'
                          }`} />
                        )}
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 flex-shrink-0 ${
                          page >= step.num 
                            ? 'bg-[#B8956A] border-[#B8956A] text-white' 
                            : 'bg-background border-muted-foreground/20 text-muted-foreground'
                        }`}>
                          {page > step.num ? <Check className="h-5 w-5" /> : step.num}
                        </div>
                        {index < 2 && (
                          <div className={`flex-1 h-0.5 ${
                            page > step.num ? 'bg-[#B8956A]' : 'bg-muted-foreground/20'
                          }`} />
                        )}
                      </div>
                      <span className="text-xs sm:text-sm font-medium mt-2 text-center w-full">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exchange Notice Banner */}
            {bookingType === 'exchange' && page === 1 && (
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🔄</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-2">How Exchanges Work</h4>
                    <p className="text-sm text-blue-800 mb-2">
                      Our driver will pick up your original item, return it to the store, get your exchange item, and deliver it to you.
                    </p>
                    <p className="text-xs text-blue-700 italic">
                      Note: Exchange pricing and availability may vary by retailer. Contact support for details.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Card className="shadow-lg border-border/50">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-3 text-2xl">
              {page === 1 && <><User className="h-6 w-6 text-[#B8956A]" /> Personal Information</>}
              {page === 2 && <><Package className="h-6 w-6 text-[#B8956A]" /> {bookingType === 'return' ? 'Return Details' : bookingType === 'exchange' ? 'Exchange Details' : 'Donation Details'}</>}
              {page === 3 && <><Check className="h-6 w-6 text-[#B8956A]" /> Review</>}
              {page === 4 && <><CreditCard className="h-6 w-6 text-[#B8956A]" /> Payment</>}
            </CardTitle>
            <CardDescription className="text-base">
              {page === 1 && (bookingType === 'return' ? "Where should we pick up your return?" : bookingType === 'exchange' ? "Where should we pick up your exchange?" : "Where should we pick up your donation?")}
              {page === 2 && (bookingType === 'return' ? "Tell us about the item you're returning" : bookingType === 'exchange' ? "Tell us about the item you're exchanging" : "Tell us about the item you're donating")}
              {page === 3 && "Review your information before payment"}
              {page === 4 && "Complete your booking"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {/* PAGE 1: Contact & Address */}
            {page === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-semibold">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => updateField('firstName', e.target.value)}
                      placeholder="First name"
                      className={`mt-1.5 ${validationErrors.has('firstName') ? 'border-red-500 border-2' : ''}`}
                      required
                      data-testid="input-first-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-semibold">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => updateField('lastName', e.target.value)}
                      placeholder="Last name"
                      className={`mt-1.5 ${validationErrors.has('lastName') ? 'border-red-500 border-2' : ''}`}
                      required
                      data-testid="input-last-name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-semibold">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="Email address"
                    className={`mt-1.5 ${validationErrors.has('email') ? 'border-red-500 border-2' : ''}`}
                    required
                    data-testid="input-email"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-semibold">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="Phone number"
                    className={`mt-1.5 ${validationErrors.has('phone') ? 'border-red-500 border-2' : ''}`}
                    required
                    data-testid="input-phone"
                  />
                </div>

                <Separator className="my-6" />

                <AddressAutocomplete
                  label="Pickup Address"
                  placeholder="Start typing your address..."
                  value={formData.streetAddress}
                  onChange={(address, placeResult) => {
                    // Update street address as user types
                    setFormData(prev => ({
                      ...prev,
                      streetAddress: address
                    }));

                    // When a place is selected, use structured address components
                    if (placeResult?.addressComponents) {
                      const components = placeResult.addressComponents;
                      
                      // Build full street address from components
                      const streetAddress = [
                        components.streetNumber,
                        components.street
                      ].filter(Boolean).join(' ') || address;

                      setFormData(prev => ({
                        ...prev,
                        streetAddress: streetAddress,
                        city: components.city || prev.city,
                        state: components.state || prev.state,
                        zipCode: components.zipCode || prev.zipCode
                      }));

                      // Clear validation errors for auto-filled fields
                      setValidationErrors(prev => {
                        const newErrors = new Set(prev);
                        newErrors.delete('streetAddress');
                        if (components.city) newErrors.delete('city');
                        if (components.state) newErrors.delete('state');
                        if (components.zipCode) newErrors.delete('zipCode');
                        return newErrors;
                      });
                    }
                  }}
                  required
                  className={validationErrors.has('streetAddress') ? 'border-red-500 border-2' : ''}
                  data-testid="autocomplete-pickup-address"
                />

                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="city" className="text-sm font-semibold">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        placeholder="City"
                        className={`mt-1.5 ${validationErrors.has('city') ? 'border-red-500 border-2' : ''}`}
                        required
                        data-testid="input-city"
                      />
                    </div>
                    <div className="col-span-1">
                      <Label htmlFor="state" className="text-sm font-semibold">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => updateField('state', e.target.value)}
                        placeholder="State"
                        maxLength={2}
                        className={`mt-1.5 ${validationErrors.has('state') ? 'border-red-500 border-2' : ''}`}
                        required
                        data-testid="input-state"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="zipCode" className="text-sm font-semibold">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => updateField('zipCode', e.target.value)}
                      placeholder="ZIP code"
                      className={`mt-1.5 ${validationErrors.has('zipCode') ? 'border-red-500 border-2' : ''}`}
                      required
                      data-testid="input-zip-code"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 2: Return Details */}
            {page === 2 && (
              <div className="space-y-5">
                {/* Show different UI based on donation mode */}
                {!formData.isDonation ? (
                  // RETURN MODE: Show store autocomplete and destination fields
                  <>
                    <StoreAutocomplete
                      label="Store Location"
                      placeholder="Type to search stores..."
                      value={formData.retailer}
                      onChange={(value) => {
                        // Clear selected store when user types (reset warning)
                        setSelectedStore(null);
                        
                        // Update retailer text as user types
                        setFormData(prev => ({
                          ...prev,
                          retailer: value,
                          retailerName: value // Also update retailerName for validation
                        }));
                      }}
                      onStoreSelect={(store) => {
                        console.log('🏪 Store selected:', store);
                        console.log('🏪 Store fields:', {
                          storeName: store.storeName,
                          streetAddress: store.streetAddress,
                          city: store.city,
                          state: store.state,
                          zipCode: store.zipCode,
                          acceptsThirdPartyReturns: store.acceptsThirdPartyReturns
                        });
                        
                        // Save the full store object for warning display
                        setSelectedStore(store);
                        
                        // Auto-fill ALL store details when user selects a location from dropdown
                        setFormData(prev => {
                          const updated = {
                            ...prev,
                            retailerName: store.retailerName, // For validation (line 552)
                            retailer: `${store.storeName} - ${store.streetAddress}, ${store.city}, ${store.state}`, // Display value
                            retailerLocation: store.formattedAddress || `${store.streetAddress}, ${store.city}, ${store.state} ${store.zipCode}`, // For validation (line 553)
                            storeDestinationName: store.storeName,
                            storeDestinationAddress: store.streetAddress,
                            storeDestinationCity: store.city,
                            storeDestinationState: store.state,
                            storeDestinationZip: store.zipCode
                          };
                          console.log('🏪 Updated form data:', updated);
                          return updated;
                        });
                        
                        // Clear ALL validation errors for store-related fields
                        setValidationErrors(prev => {
                          const newErrors = new Set(prev);
                          newErrors.delete('retailerName');
                          newErrors.delete('retailerLocation');
                          newErrors.delete('storeDestinationName');
                          newErrors.delete('storeDestinationAddress');
                          newErrors.delete('storeDestinationCity');
                          newErrors.delete('storeDestinationState');
                          return newErrors;
                        });
                        
                        // Show success toast
                        toast({
                          title: "Store selected",
                          description: `${store.storeName} - ${store.streetAddress}, ${store.city}, ${store.state}`,
                        });
                      }}
                      required
                      className="mb-4"
                      data-testid="autocomplete-store"
                    />

                    {/* Third-Party Return Warning */}
                    {selectedStore && !selectedStore.acceptsThirdPartyReturns && (
                      <div className="p-4 bg-red-50 border-2 border-red-400 rounded-lg" data-testid="alert-third-party-warning">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-red-900 mb-1">
                              ⚠️ Third-Party Return Warning
                            </h4>
                            <p className="text-sm text-red-800 mb-2">
                              <strong>{selectedStore.retailerName}</strong> may not accept returns from someone other than the original purchaser.
                            </p>
                            {selectedStore.thirdPartyReturnNotes && (
                              <p className="text-xs text-red-700 bg-red-100 p-2 rounded border border-red-300 mb-2">
                                <strong>Store Policy:</strong> {selectedStore.thirdPartyReturnNotes}
                              </p>
                            )}
                            <p className="text-xs text-red-700 font-medium">
                              📋 This return may be rejected at the store. Consider choosing a store that accepts third-party returns (Target, Kohl's, JCPenney, Macy's, Nordstrom, Home Depot, Lowe's).
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 p-4 bg-amber-50/30 border border-amber-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-amber-900 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {bookingType === 'return' ? 'Return Destination (Editable)' : bookingType === 'exchange' ? 'Exchange Destination (Editable)' : 'Donation Destination (Editable)'}
                  </h3>
                    
                    <div>
                      <Label htmlFor="storeDestinationName" className="text-sm font-semibold">Store Name *</Label>
                      <Input
                        id="storeDestinationName"
                        value={formData.storeDestinationName}
                        onChange={(e) => updateField('storeDestinationName', e.target.value)}
                        placeholder="Store Name"
                        className="mt-1.5 bg-white"
                        required
                        data-testid="input-store-name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="storeDestinationAddress" className="text-sm font-semibold">Address *</Label>
                      <Input
                        id="storeDestinationAddress"
                        value={formData.storeDestinationAddress}
                        onChange={(e) => updateField('storeDestinationAddress', e.target.value)}
                        placeholder="Street Address"
                        className="mt-1.5 bg-white"
                        required
                        data-testid="input-store-address"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="storeDestinationCity" className="text-sm font-semibold">City *</Label>
                        <Input
                          id="storeDestinationCity"
                          value={formData.storeDestinationCity}
                          onChange={(e) => updateField('storeDestinationCity', e.target.value)}
                          placeholder="City"
                          className="mt-1.5 bg-white"
                          required
                          data-testid="input-store-city"
                        />
                      </div>
                      <div>
                        <Label htmlFor="storeDestinationState" className="text-sm font-semibold">State *</Label>
                        <Input
                          id="storeDestinationState"
                          value={formData.storeDestinationState}
                          onChange={(e) => updateField('storeDestinationState', e.target.value)}
                          placeholder="State"
                          className="mt-1.5 bg-white"
                          required
                          data-testid="input-store-state"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="storeDestinationZip" className="text-sm font-semibold">ZIP Code *</Label>
                      <Input
                        id="storeDestinationZip"
                        value={formData.storeDestinationZip}
                        onChange={(e) => updateField('storeDestinationZip', e.target.value)}
                        placeholder="ZIP code"
                        className="mt-1.5 bg-white"
                        required
                        data-testid="input-store-zip"
                      />
                    </div>
                </div>
                  </>
                ) : (
                  // DONATION MODE: Show donation location selector
                  <div className="space-y-4 p-4 bg-green-50/30 border border-green-200 rounded-lg">
                    <h3 className="text-sm font-semibold text-green-900 flex items-center">
                      ♻️ Select Donation Drop-off Location
                    </h3>
                    
                    <div>
                      <Label htmlFor="donationLocation" className="text-sm font-semibold">Charity Organization *</Label>
                      <Select
                        value={formData.donationLocationId?.toString() || ''}
                        onValueChange={(value) => {
                          // Find the selected donation location by ID
                          const locationId = parseInt(value);
                          const selectedLocation = donationLocations?.find((loc: any) => loc.id === locationId);
                          
                          if (selectedLocation) {
                            setFormData(prev => ({
                              ...prev,
                              donationLocationId: selectedLocation.id,
                              retailer: value,
                              retailerName: selectedLocation.name,
                              retailerLocation: `${selectedLocation.streetAddress}, ${selectedLocation.city}, ${selectedLocation.state} ${selectedLocation.zipCode}`,
                              storeDestinationName: selectedLocation.name,
                              storeDestinationAddress: selectedLocation.streetAddress,
                              storeDestinationCity: selectedLocation.city,
                              storeDestinationState: selectedLocation.state,
                              storeDestinationZip: selectedLocation.zipCode
                            }));
                          }
                        }}
                        disabled={isLoadingDonations}
                      >
                        <SelectTrigger className="mt-1.5 bg-white" data-testid="select-donation-location">
                          <SelectValue placeholder={isLoadingDonations ? "Loading charities..." : "Choose a charity..."} />
                        </SelectTrigger>
                        <SelectContent>
                          {donationLocations && donationLocations.length > 0 ? (
                            donationLocations.map((location: any) => (
                              <SelectItem 
                                key={location.id} 
                                value={location.id.toString()}
                                data-testid={`option-${location.name.toLowerCase().replace(/\s+/g, '-')}`}
                              >
                                {location.name} - {location.streetAddress}, {location.city}, {location.state}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>No charities available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-green-700 mt-2">
                        💡 Your items will be picked up and delivered to this charity location
                      </p>
                    </div>

                    {formData.retailer && (
                      <div className="p-3 bg-white rounded-lg border border-green-200">
                        <p className="text-sm font-semibold text-green-900 mb-1">
                          Drop-off Location:
                        </p>
                        <p className="text-sm text-green-800">
                          {formData.storeDestinationName}
                        </p>
                        <p className="text-xs text-green-700">
                          {formData.storeDestinationAddress}, {formData.storeDestinationCity}, {formData.storeDestinationState} {formData.storeDestinationZip}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* EXCHANGE MODE: Show Item I Have & Item I Want sections */}
                {formData.isExchange && (
                  <div className="space-y-5">
                    {/* Item I Have Section */}
                    <div className="space-y-4 p-5 bg-blue-50/50 border-2 border-blue-300 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Package className="h-5 w-5 text-blue-600" />
                        <Label className="text-foreground font-semibold text-lg">Item I Have (Required) *</Label>
                      </div>
                      <p className="text-sm text-blue-700 font-medium">
                        📦 Tell us about the item you want to exchange
                      </p>
                      
                      <div>
                        <Label htmlFor="itemIHaveDescription" className="text-sm font-semibold">Description *</Label>
                        <Textarea
                          id="itemIHaveDescription"
                          value={formData.itemIHaveDescription}
                          onChange={(e) => updateField('itemIHaveDescription', e.target.value)}
                          placeholder="Describe the item you want to exchange (e.g., 'Black Nike Air Max Size 10' or 'iPhone 13 Pro 128GB Silver')"
                          rows={3}
                          className="mt-1.5 bg-white"
                          required
                          data-testid="input-item-i-have-description"
                        />
                      </div>

                      <div className="space-y-2">
                        <NativePhotoUploader
                          maxFiles={5}
                          maxFileSize={10485760}
                          onUploadComplete={handleItemIHavePhotosChange}
                          currentUrls={formData.itemIHavePhotoUrls || []}
                          buttonText="Add"
                          variant="outline"
                          size="sm"
                          testId="button-upload-item-i-have"
                          label="Photos of Item I Have *"
                        />
                        <p className="text-xs text-muted-foreground">
                          📸 Upload clear photos of the item you're exchanging (up to 5 photos)
                        </p>
                      </div>
                    </div>

                    {/* Item I Want Section */}
                    <div className="space-y-4 p-5 bg-green-50/50 border-2 border-green-300 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Package className="h-5 w-5 text-green-600" />
                        <Label className="text-foreground font-semibold text-lg">Item I Want (Optional)</Label>
                      </div>
                      <p className="text-sm text-green-700 font-medium">
                        🎁 Tell us about the item you want to receive in exchange
                      </p>
                      
                      <div>
                        <Label htmlFor="itemIWantDescription" className="text-sm font-semibold">Description</Label>
                        <Textarea
                          id="itemIWantDescription"
                          value={formData.itemIWantDescription}
                          onChange={(e) => updateField('itemIWantDescription', e.target.value)}
                          placeholder="Describe what you want to exchange for (e.g., 'Same shoe in Size 11' or 'iPhone 14 Pro in any color')"
                          rows={3}
                          className="mt-1.5 bg-white"
                          data-testid="input-item-i-want-description"
                        />
                      </div>

                      <div className="space-y-2">
                        <NativePhotoUploader
                          maxFiles={3}
                          maxFileSize={10485760}
                          onUploadComplete={handleItemIWantPhotosChange}
                          currentUrls={formData.itemIWantPhotoUrls || []}
                          buttonText="Add"
                          variant="outline"
                          size="sm"
                          testId="button-upload-item-i-want"
                          label="Photos of Item I Want (Optional)"
                        />
                        <p className="text-xs text-muted-foreground">
                          📸 Upload reference photos of what you want (up to 3 photos)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Multiple Items Section - Only show for Returns and Donations */}
                {!formData.isExchange && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">
                      {bookingType === 'return' ? 'Items to Return *' : bookingType === 'exchange' ? 'Items to Exchange *' : 'Items to Donate *'}
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {formData.items.length} item{formData.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {formData.items.map((item, index) => (
                    <div key={item.id} className="p-4 border-2 border-border rounded-lg bg-muted/30 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Item {index + 1}
                        </h4>
                        {formData.items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            data-testid={`button-remove-item-${index}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div>
                        <Label htmlFor={`orderName-${item.id}`} className="text-sm font-semibold">Item Name *</Label>
                        <Input
                          id={`orderName-${item.id}`}
                          value={item.orderName}
                          onChange={(e) => updateItem(item.id, 'orderName', e.target.value)}
                          placeholder="Item name"
                          className={`mt-1.5 ${validationErrors.has(`item-${index}-orderName`) ? 'border-red-500 border-2' : ''}`}
                          required
                          data-testid={`input-order-name-${index}`}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`itemDescription-${item.id}`} className="text-sm font-semibold">Item Description *</Label>
                        <Textarea
                          id={`itemDescription-${item.id}`}
                          value={item.itemDescription}
                          onChange={(e) => updateItem(item.id, 'itemDescription', e.target.value)}
                          placeholder="Item description"
                          rows={2}
                          className={`mt-1.5 ${validationErrors.has(`item-${index}-itemDescription`) ? 'border-red-500 border-2' : ''}`}
                          required
                          data-testid={`input-item-description-${index}`}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`itemValue-${item.id}`} className="text-sm font-semibold">Item Value *</Label>
                        <div className="relative mt-1.5">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            id={`itemValue-${item.id}`}
                            type="number"
                            value={item.itemValue}
                            onChange={(e) => updateItem(item.id, 'itemValue', e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            className={`pl-7 ${validationErrors.has(`item-${index}-itemValue`) ? 'border-red-500 border-2' : ''}`}
                            required
                            data-testid={`input-item-value-${index}`}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`boxSize-${item.id}`} className="text-sm font-semibold">Package Size *</Label>
                        <Select value={item.boxSize} onValueChange={(value) => updateItem(item.id, 'boxSize', value)}>
                          <SelectTrigger className="mt-1.5" data-testid={`select-box-size-${index}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small (Shoebox/Bag)</SelectItem>
                            <SelectItem value="medium">Medium (+ $2.00)</SelectItem>
                            <SelectItem value="large">Large (+ $4.00)</SelectItem>
                            <SelectItem value="xlarge">Extra Large (+ $6.00)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`numberOfBoxes-${item.id}`} className="text-sm font-semibold">Boxes (0-3)</Label>
                          <Input
                            id={`numberOfBoxes-${item.id}`}
                            type="number"
                            min="0"
                            max="3"
                            value={item.numberOfBoxes === 0 ? '0' : (item.numberOfBoxes || '')}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '') {
                                updateItem(item.id, 'numberOfBoxes', '' as any);
                              } else {
                                const numValue = parseInt(value);
                                if (!isNaN(numValue)) {
                                  const otherItemsTotal = formData.items
                                    .filter(i => i.id !== item.id)
                                    .reduce((sum, i) => sum + (i.numberOfBoxes || 0) + (i.numberOfBags || 0), 0);
                                  const proposedTotal = otherItemsTotal + numValue + (item.numberOfBags || 0);
                                  if (proposedTotal <= 8) {
                                    updateItem(item.id, 'numberOfBoxes', numValue);
                                  }
                                }
                              }
                            }}
                            onBlur={(e) => {
                              const currentValue = parseInt(e.target.value);
                              if (isNaN(currentValue) || currentValue < 0) {
                                updateItem(item.id, 'numberOfBoxes', 0);
                              } else if (currentValue > 3) {
                                updateItem(item.id, 'numberOfBoxes', 3);
                              }
                            }}
                            placeholder="0"
                            className="mt-1.5"
                            data-testid={`input-number-of-boxes-${index}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`numberOfBags-${item.id}`} className="text-sm font-semibold">Bags (0-5)</Label>
                          <Input
                            id={`numberOfBags-${item.id}`}
                            type="number"
                            min="0"
                            max="5"
                            value={item.numberOfBags === 0 ? '0' : (item.numberOfBags || '')}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '') {
                                updateItem(item.id, 'numberOfBags', '' as any);
                              } else {
                                const numValue = parseInt(value);
                                if (!isNaN(numValue)) {
                                  const otherItemsTotal = formData.items
                                    .filter(i => i.id !== item.id)
                                    .reduce((sum, i) => sum + (i.numberOfBoxes || 0) + (i.numberOfBags || 0), 0);
                                  const proposedTotal = otherItemsTotal + (item.numberOfBoxes || 0) + numValue;
                                  if (proposedTotal <= 8) {
                                    updateItem(item.id, 'numberOfBags', numValue);
                                  }
                                }
                              }
                            }}
                            onBlur={(e) => {
                              const currentValue = parseInt(e.target.value);
                              if (isNaN(currentValue) || currentValue < 0) {
                                updateItem(item.id, 'numberOfBags', 0);
                              } else if (currentValue > 5) {
                                updateItem(item.id, 'numberOfBags', 5);
                              }
                            }}
                            placeholder="0"
                            className="mt-1.5"
                            data-testid={`input-number-of-bags-${index}`}
                          />
                        </div>
                      </div>
                      {getTotalItems() > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Total items: {getTotalItems()}/8 boxes & bags
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Add Another Item Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                    className="w-full border-dashed border-2 hover:bg-muted/50"
                    data-testid="button-add-item"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Item
                  </Button>

                  {/* Total Value Display */}
                  {formData.items.length > 1 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-amber-900">Total Item Value:</span>
                        <span className="text-lg font-bold text-amber-900">${pricing.totalItemValue.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
                )}

                {/* Notes Section - Show for all booking types */}
                <div>
                  <Label htmlFor="notes" className="text-sm font-semibold">Special Instructions (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    placeholder="Special instructions (optional)"
                    rows={2}
                    className="mt-1.5"
                    data-testid="input-notes"
                  />
                </div>

                {/* Photo Verification - MANDATORY - Only show for Returns and Donations */}
                {!formData.isExchange && (
                <>
                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Shield className="h-5 w-5 text-red-600" />
                    <Label className="text-foreground font-semibold text-lg">Photo Verification (Required) *</Label>
                  </div>

                  {/* Warning if no photos uploaded */}
                  {!formData.receiptPhotoUrl && !formData.tagsPhotoUrl && !formData.packagingPhotoUrl && (
                    <div className="flex items-start space-x-2 p-3 bg-red-50 border-2 border-red-400 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-900">
                          {formData.isDonation ? "Take Photos for Confirmation" : "Photo Verification Required"}
                        </h4>
                        <p className="text-sm text-red-700 mt-1 font-medium">
                          {formData.isDonation 
                            ? "Upload at least 1 photo of your items (up to 12 photos allowed)"
                            : "Upload at least 1 of the 3 options below (preferably all 3)"}
                        </p>
                        <p className="text-xs text-red-600 mt-2">
                          This protects you, our drivers, and ensures a smooth {formData.isDonation ? "donation" : "return"} process.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-amber-600" />
                      <Label className="text-foreground font-semibold text-base">
                        {formData.isDonation ? "Upload at least 1 photo (up to 12) *" : "Upload at least 1 (preferably all 3) *"}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                      {formData.isDonation 
                        ? "Upload at least 1 photo of your items (maximum 12 photos):" 
                        : "Upload at least 1 of the 3 options (preferably all 3):"}
                    </p>
                    
                    {/* Option 1: Receipt Photo (or Item Photos for donations) */}
                    <div className="space-y-2 p-3 bg-white rounded border border-border">
                      <NativePhotoUploader
                        maxFiles={formData.isDonation ? 12 : 1}
                        maxFileSize={10485760}
                        onUploadComplete={handleReceiptPhotosChange}
                        currentUrls={formData.isDonation ? (formData.donationPhotoUrls || []) : (formData.receiptPhotoUrl ? [formData.receiptPhotoUrl] : [])}
                        buttonText="Add"
                        variant="outline"
                        size="sm"
                        testId="button-upload-receipt"
                        label={formData.isDonation ? "Item Photos" : "1. Receipt or Order Confirmation"}
                      />
                      <p className="text-xs text-muted-foreground">
                        {formData.isDonation 
                          ? "📸 Take clear photos of your items (1-12 photos)"
                          : "📄 Take a clear photo of your paper receipt or screenshot your email confirmation"}
                      </p>
                    </div>

                    {/* Option 2: Tags Photo - Hide for donations */}
                    {!formData.isDonation && (
                      <div className="space-y-2 p-3 bg-white rounded border border-border">
                        <NativePhotoUploader
                          maxFiles={1}
                          maxFileSize={10485760}
                          onUploadComplete={handleTagsPhotoChange}
                          currentUrls={formData.tagsPhotoUrl ? [formData.tagsPhotoUrl] : []}
                          buttonText="Add"
                          variant="outline"
                          size="sm"
                          testId="button-upload-tags"
                          label="2. Original Tags"
                        />
                        <p className="text-xs text-muted-foreground">
                          🏷️ Take a photo showing the item with original tags still attached
                        </p>
                      </div>
                    )}

                    {/* Option 3: Packaging Photo - Hide for donations */}
                    {!formData.isDonation && (
                      <div className="space-y-2 p-3 bg-white rounded border border-border">
                        <NativePhotoUploader
                          maxFiles={1}
                          maxFileSize={10485760}
                          onUploadComplete={handlePackagingPhotoChange}
                          currentUrls={formData.packagingPhotoUrl ? [formData.packagingPhotoUrl] : []}
                          buttonText="Add"
                          variant="outline"
                          size="sm"
                          testId="button-upload-packaging"
                          label="3. Original Packaging"
                        />
                        <p className="text-xs text-muted-foreground">
                          📦 Take a photo showing the item in its original packaging
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                </>
                )}
              </div>
            )}

            {/* PAGE 3: Review */}
            {page === 3 && (
              <div className="space-y-6">
                {/* Address Verification Section */}
                <div className="bg-blue-50 border-2 border-blue-300 p-5 rounded-lg">
                  <h3 className="font-bold text-lg mb-4 text-blue-900 flex items-center gap-2">
                    <MapPin className="h-6 w-6" />
                    ⚠️ Verify Your Addresses
                  </h3>
                  <p className="text-sm text-blue-800 mb-4">
                    Please carefully review both addresses below. Make sure they are correct before proceeding to payment.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pickup Address */}
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-blue-900">📍 Pickup Location</h4>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setPage(1)}
                          className="h-7 text-xs"
                          data-testid="button-edit-pickup"
                        >
                          Edit
                        </Button>
                      </div>
                      <div className="text-sm space-y-1 text-gray-700">
                        <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                        <p>{formData.streetAddress}</p>
                        <p>{formData.city}, {formData.state} {formData.zipCode}</p>
                        <p className="text-blue-600">{formData.phone}</p>
                      </div>
                    </div>
                    
                    {/* Return Destination */}
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-blue-900">
                          {bookingType === 'return' ? '🏪 Return Destination' : bookingType === 'exchange' ? '🏪 Exchange Destination' : '❤️ Donation Destination'}
                        </h4>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setPage(2)}
                          className="h-7 text-xs"
                          data-testid="button-edit-destination"
                        >
                          Edit
                        </Button>
                      </div>
                      <div className="text-sm space-y-1 text-gray-700">
                        <p className="font-medium">{formData.storeDestinationName || formData.retailerName}</p>
                        <p>{formData.storeDestinationAddress}</p>
                        <p>{formData.storeDestinationCity}, {formData.storeDestinationState}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 p-5 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#B8956A]" />
                    Contact Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{formData.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 p-5 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#B8956A]" />
                    {bookingType === 'return' ? 'Return Details' : bookingType === 'exchange' ? 'Exchange Details' : 'Donation Details'}
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Retailer:</span>
                      <span className="font-medium">{formData.retailerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Store Location:</span>
                      <span className="font-medium text-right max-w-[60%]">{formData.retailerLocation}</span>
                    </div>
                    
                    <Separator className="my-2" />
                    
                    {/* Items List */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">Items ({formData.items.length}):</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setPage(2)}
                          className="h-7 text-xs"
                          data-testid="button-edit-items"
                        >
                          Edit
                        </Button>
                      </div>
                      {formData.items.map((item, index) => (
                        <div key={item.id} className="p-3 bg-background border border-border rounded-lg space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="font-semibold text-foreground">Item {index + 1}:</span>
                            <span className="font-semibold text-[#B8956A]">${parseFloat(item.itemValue || '0').toFixed(2)}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p className="font-medium text-foreground">{item.orderName}</p>
                            <p className="mt-1">{item.itemDescription}</p>
                            <div className="mt-2 flex gap-3 text-xs">
                              <span className="capitalize">{item.boxSize} package</span>
                              <span>•</span>
                              <span>{item.numberOfBoxes} {item.numberOfBoxes === 1 ? 'box' : 'boxes'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {formData.items.length > 1 && (
                        <div className="flex justify-between pt-2 border-t border-border">
                          <span className="font-semibold">Total Item Value:</span>
                          <span className="font-bold text-[#B8956A]">${pricing.totalItemValue.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    
                    <Separator className="my-2" />
                    {formData.notes && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Notes:</span>
                        <span className="font-medium text-right max-w-[60%]">{formData.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Tier Selection */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-lg border-2 border-blue-200">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-blue-900">
                    ⏱️ Choose Your Pickup Speed
                  </h3>
                  <p className="text-sm text-blue-800 mb-4">
                    Select how quickly you need your return picked up
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.entries(SERVICE_TIERS).map(([key, tier]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => updateField('serviceTier', key as 'standard' | 'priority' | 'instant')}
                        className={`relative p-4 rounded-lg border-2 transition-all ${
                          formData.serviceTier === key
                            ? 'border-[#B8956A] bg-amber-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                        }`}
                        data-testid={`button-tier-${key}`}
                      >
                        {formData.serviceTier === key && (
                          <div className="absolute -top-2 -right-2 bg-[#B8956A] text-white rounded-full p-1">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                        <div className="text-3xl mb-2">{tier.icon}</div>
                        <div className="font-bold text-lg text-gray-900">{tier.name}</div>
                        <div className="text-sm text-gray-600 mb-2">{tier.description}</div>
                        <div className="text-2xl font-bold text-[#B8956A]">${tier.price.toFixed(2)}</div>
                        <div className="text-xs text-green-700 mt-1">
                          💰 Driver earns ${tier.driverEarns.toFixed(2)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/30 p-5 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-[#B8956A]" />
                    Price Breakdown
                  </h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Pickup Fee ({SERVICE_TIERS[formData.serviceTier].name})</span>
                      <span className="font-medium">${pricing.basePrice.toFixed(2)}</span>
                    </div>
                    {pricing.sizeUpcharge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size Upcharge</span>
                        <span className="font-medium">${pricing.sizeUpcharge.toFixed(2)}</span>
                      </div>
                    )}
                    {pricing.multiBoxFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Multi-Package Fee</span>
                        <span className="font-medium">${pricing.multiBoxFee.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">${pricing.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service Fee (5.5%)</span>
                      <span className="font-medium">${pricing.serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fuel Fee ({pricing.distance} mi roundtrip)</span>
                      <span className="font-medium">${pricing.fuelFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium">${pricing.tax.toFixed(2)}</span>
                    </div>
                    <Separator className="bg-border" />
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-2xl font-bold text-[#B8956A]">${pricing.total.toFixed(2)}</span>
                    </div>
                    
                    {/* Extra Fees Disclaimer */}
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-900">
                        <span className="font-semibold">ℹ️ Note:</span> Your driver may charge extra fees for supplies (boxes, tape, etc.) purchased during delivery. Any additional charges will be billed separately to your payment method.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Add Tip Section */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-lg border-2 border-amber-200">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-amber-900">
                    ❤️ Add a Tip for Your Driver
                  </h3>
                  <div className="bg-white p-3 rounded-lg mb-4 border border-amber-300">
                    <div className="flex items-center gap-2 text-green-700 font-semibold">
                      <span className="text-2xl">💯</span>
                      <span className="text-sm">100% of your tip goes directly to your driver!</span>
                    </div>
                  </div>
                  
                  {/* Preset Tip Buttons - Higher Amounts */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <Button
                      type="button"
                      variant={formData.tip === 3 ? "default" : "outline"}
                      onClick={() => updateField('tip', 3)}
                      className={formData.tip === 3 ? "bg-[#B8956A] hover:bg-[#A07A4F]" : ""}
                      data-testid="button-tip-3"
                    >
                      <span className="text-lg font-bold">$3</span>
                    </Button>
                    <Button
                      type="button"
                      variant={formData.tip === 5 ? "default" : "outline"}
                      onClick={() => updateField('tip', 5)}
                      className={formData.tip === 5 ? "bg-[#B8956A] hover:bg-[#A07A4F]" : ""}
                      data-testid="button-tip-5"
                    >
                      <span className="text-lg font-bold">$5</span>
                      <br />
                      <span className="text-xs">⭐ Popular</span>
                    </Button>
                    <Button
                      type="button"
                      variant={formData.tip === 8 ? "default" : "outline"}
                      onClick={() => updateField('tip', 8)}
                      className={formData.tip === 8 ? "bg-[#B8956A] hover:bg-[#A07A4F]" : ""}
                      data-testid="button-tip-8"
                    >
                      <span className="text-lg font-bold">$8</span>
                      <br />
                      <span className="text-xs">🌟 Generous</span>
                    </Button>
                  </div>
                  
                  {/* Round-Up Option */}
                  {pricing.total % 1 !== 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const roundUpAmount = Math.ceil(pricing.total) - pricing.total;
                        updateField('tip', Number((formData.tip + roundUpAmount).toFixed(2)));
                      }}
                      className="w-full mb-4 border-dashed border-2 border-amber-400 hover:bg-amber-100"
                      data-testid="button-tip-roundup"
                    >
                      <span className="text-sm">
                        Round up to ${Math.ceil(pricing.total).toFixed(2)} 
                        <span className="font-semibold text-amber-700"> (+${(Math.ceil(pricing.total) - pricing.total).toFixed(2)})</span>
                      </span>
                    </Button>
                  )}
                  
                  {/* Custom Tip Input */}
                  <div>
                    <Label htmlFor="customTip" className="text-sm font-semibold text-amber-900">Custom Tip Amount</Label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="customTip"
                        type="number"
                        value={formData.tip || ''}
                        onChange={(e) => updateField('tip', parseFloat(e.target.value) || 0)}
                        placeholder="Enter amount"
                        step="0.01"
                        min="0"
                        className="pl-7"
                        data-testid="input-custom-tip"
                      />
                    </div>
                    {formData.tip > 0 && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-amber-300">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-amber-900">New Total with Tip:</span>
                          <span className="text-xl font-bold text-[#B8956A]">${pricing.total.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Terms and Policies - Clickable Links */}
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Important Terms & Policies
                  </h3>
                  <p className="text-sm text-muted-foreground">Click to view details:</p>
                  
                  <div className="flex flex-wrap gap-3">
                    {/* Cancellation Policy Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-amber-700 hover:text-amber-800 border-amber-300 hover:bg-amber-50" data-testid="link-cancellation-policy">
                          📋 Cancellation Policy
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-amber-900">
                            <span>📋</span> Cancellation Policy
                          </DialogTitle>
                        </DialogHeader>
                        <DialogDescription asChild>
                          <div className="space-y-3">
                            <p className="text-sm text-foreground">
                              A <strong className="text-amber-700">$4.99 cancellation fee</strong> will apply if you cancel after a driver has been dispatched to your location.
                            </p>
                            <p className="text-sm text-muted-foreground">
                              This fee covers driver compensation and operational costs.
                            </p>
                          </div>
                        </DialogDescription>
                      </DialogContent>
                    </Dialog>

                    {/* Service Requirements Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-blue-700 hover:text-blue-800 border-blue-300 hover:bg-blue-50" data-testid="link-service-requirements">
                          📸 Service Requirements
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-blue-900">
                            <span>📸</span> Service Requirements
                          </DialogTitle>
                        </DialogHeader>
                        <DialogDescription asChild>
                          <div>
                            <ul className="text-sm text-foreground space-y-2 list-none">
                              <li className="flex gap-2">
                                <span className="text-blue-600">•</span>
                                <div>
                                  <strong>Photo Verification:</strong> Driver will take a photo at drop-off for confirmation
                                </div>
                              </li>
                              <li className="flex gap-2">
                                <span className="text-blue-600">•</span>
                                <div>
                                  <strong>Proof of Purchase:</strong> Upload your receipt or order confirmation when available
                                </div>
                              </li>
                              <li className="flex gap-2">
                                <span className="text-blue-600">•</span>
                                <div>
                                  <strong>Package Condition:</strong> Items must be properly packaged and ready for pickup
                                </div>
                              </li>
                            </ul>
                          </div>
                        </DialogDescription>
                      </DialogContent>
                    </Dialog>

                    {/* Service Terms Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-800 border-gray-300 hover:bg-gray-50" data-testid="link-service-terms">
                          ⚖️ Service Terms
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-gray-900">
                            <span>⚖️</span> Service Terms
                          </DialogTitle>
                        </DialogHeader>
                        <DialogDescription asChild>
                          <div className="space-y-3">
                            <p className="text-sm text-foreground">
                              <strong>Service Area:</strong> Currently available in St. Louis, MO only. Expanding to additional cities soon.
                            </p>
                          </div>
                        </DialogDescription>
                      </DialogContent>
                    </Dialog>

                    {/* Need Help Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-green-700 hover:text-green-800 border-green-300 hover:bg-green-50" data-testid="link-need-help">
                          💬 Need Help?
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-green-900">
                            <span>💬</span> Need Help?
                          </DialogTitle>
                        </DialogHeader>
                        <DialogDescription asChild>
                          <div className="space-y-3">
                            <p className="text-sm text-foreground">
                              Questions about your return? Contact us:
                            </p>
                            <div className="space-y-2 text-sm">
                              <p className="flex items-center gap-2">
                                <span className="font-semibold">Phone:</span>
                                <a href="tel:6362544821" className="text-blue-600 hover:underline">(636) 254-4821</a>
                              </p>
                              <p className="flex items-center gap-2">
                                <span className="font-semibold">Email:</span>
                                <a href="mailto:support@returnit.online" className="text-blue-600 hover:underline">support@returnit.online</a>
                              </p>
                            </div>
                          </div>
                        </DialogDescription>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 4: Payment */}
            {page === 4 && (
              <div className="space-y-6">
                <div className="bg-muted/30 p-5 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-[#B8956A]" />
                    Price Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Pickup Fee</span>
                      <span className="font-medium">${pricing.basePrice.toFixed(2)}</span>
                    </div>
                    {pricing.sizeUpcharge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size Upcharge</span>
                        <span className="font-medium">${pricing.sizeUpcharge.toFixed(2)}</span>
                      </div>
                    )}
                    {pricing.multiBoxFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Multi-Package Fee</span>
                        <span className="font-medium">${pricing.multiBoxFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service Fee</span>
                      <span className="font-medium">${pricing.serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fuel Fee</span>
                      <span className="font-medium">${pricing.fuelFee.toFixed(2)}</span>
                    </div>
                    <Separator className="bg-border" />
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-2xl font-bold text-[#B8956A]">${pricing.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 p-5 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-[#B8956A]" />
                    Payment Information
                  </h3>
                  {clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <PaymentForm amount={pricing.total} onSuccess={handlePaymentSuccess} />
                    </Elements>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                      <span className="ml-2 text-amber-700">Initializing payment...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PAGE 5: Confirmation */}
            {page === 5 && confirmedOrder && (
              <div className="space-y-6 text-center py-8" data-testid="confirmation-page">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="confirmation-title">Booking Confirmed!</h2>
                  <p className="text-lg text-muted-foreground">Your return pickup has been scheduled</p>
                </div>

                <div className="bg-muted/30 p-6 rounded-lg text-left max-w-md mx-auto">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between pb-3 border-b">
                      <span className="font-semibold">Order ID:</span>
                      <span className="font-mono text-[#B8956A]" data-testid="text-order-id">{confirmedOrder.id || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tracking Number:</span>
                      <span className="font-medium" data-testid="text-tracking-number">{confirmedOrder.trackingNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Paid:</span>
                      <span className="font-bold text-lg text-[#B8956A]" data-testid="text-total-paid">
                        ${confirmedOrder.totalPrice ? confirmedOrder.totalPrice.toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>📧 A confirmation email has been sent to <strong>{formData.email}</strong></p>
                  <p>📞 We'll contact you at <strong>{formData.phone}</strong> to coordinate pickup</p>
                </div>

                <Button
                  onClick={() => setLocation('/welcome')}
                  className="bg-[#B8956A] hover:bg-[#A0805A] text-white px-8 mt-6"
                  data-testid="button-go-home"
                >
                  Go to Homepage
                </Button>
              </div>
            )}

            {/* Navigation Buttons */}
            {page < 4 && (
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => page > 1 ? setPage(page - 1) : setLocation('/welcome')}
                  className="px-6"
                  data-testid="button-back"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                <Button
                  onClick={handleNextPage}
                  className="bg-[#B8956A] hover:bg-[#A0805A] text-white px-8"
                  data-testid="button-next"
                >
                  {page === 3 ? 'Continue to Payment' : 'Next'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
          </>
        )}
        </div>
      </div>
    </div>
  );
}
