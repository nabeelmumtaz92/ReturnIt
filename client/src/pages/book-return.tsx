import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth-simple";
import { Package, MapPin, CreditCard, ArrowLeft, ArrowRight, Check, Loader2, Shield, AlertCircle, FileText, HelpCircle, X, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ObjectUploader } from "@/components/ObjectUploader";
import { BrandLogo } from "@/components/BrandLogo";

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
  retailerName: string; // Changed: First select retailer name
  retailerLocation: string; // New: Then select specific store location
  retailer: string; // Combined value for backend
  storeDestinationName: string; // Editable store name
  storeDestinationAddress: string; // Editable store address
  storeDestinationCity: string; // Editable city
  storeDestinationState: string; // Editable state
  items: ReturnItem[]; // Multiple items in one return order
  notes: string;
  boxSize: string;
  numberOfBoxes: number;
  // Photo verification (MANDATORY - at least one required)
  receiptPhotoUrl?: string;
  tagsPhotoUrl?: string;
  packagingPhotoUrl?: string;
  // Page 3
  serviceTier: 'standard' | 'priority' | 'instant'; // Service tier selection
  tip: number;
  paymentMethod: string;
}

// Store locations for each retailer (St. Louis area)
// Format: "City, State - Address - Store Name"
const STORE_LOCATIONS: Record<string, string[]> = {
  'Adidas': [
    'St. Louis, MO - 249 West County Center - Adidas West County',
    'Hazelwood, MO - 5555 St. Louis Mills Blvd - Adidas Outlet',
  ],
  'Amazon': [
    'St. Louis, MO - Use Kohl\'s or Whole Foods for returns - Amazon Returns',
  ],
  'Apple': [
    'St. Louis, MO - 249 West County Center - Apple West County',
    'St. Louis, MO - 1155 St. Louis Galleria - Apple Galleria',
    'Chesterfield, MO - 230 Chesterfield Mall - Apple Chesterfield',
  ],
  'Authorized Appliance': [
    'St. Louis, MO - 5641 S Lindbergh Blvd - Authorized Appliance',
  ],
  'Barnes & Noble': [
    'Chesterfield, MO - 1600 Clarkson Rd - Barnes & Noble Chesterfield',
    'Creve Coeur, MO - 11500 Olive Blvd - Barnes & Noble Creve Coeur',
  ],
  'Best Buy': [
    'Brentwood, MO - 2701 S Brentwood Blvd - Best Buy Brentwood',
    'Chesterfield, MO - 1830 Clarkson Rd - Best Buy Chesterfield',
    'St. Louis, MO - 5650 S Lindbergh Blvd - Best Buy South County',
  ],
  'Blush Boutique': [
    'Kirkwood, MO - 143 W Argonne Dr - Blush Boutique Kirkwood',
  ],
  'Catholic Supply of St. Louis': [
    'St. Louis, MO - 6759 Chippewa St - Catholic Supply',
  ],
  'Cato Fashions': [
    'Arnold, MO - 3926 Vogel Rd - Cato Fashions Arnold',
  ],
  'Cha Boutique': [
    'Ladue, MO - 9666 Clayton Rd - Cha Boutique Ladue',
  ],
  'Clayton Claire Boutique': [
    'Clayton, MO - 8008 Maryland Ave - Clayton Claire Boutique',
  ],
  'Costco': [
    'St. Louis, MO - 7130 Lansdowne Ave - Costco Richmond Heights',
    'Town and Country, MO - 13550 S Outer Forty Rd - Costco Town and Country',
  ],
  'DNA Boutique': [
    'St. Louis, MO - 1311 Washington Ave - DNA Boutique Downtown',
  ],
  'Designer Resale Boutique': [
    'St. Peters, MO - 3800 Mexico Rd - Designer Resale Boutique',
  ],
  'Dierbergs Markets': [
    'St. Louis, MO - 6700 Clayton Rd - Dierbergs Clayton',
    'Chesterfield, MO - 17701 Chesterfield Airport Rd - Dierbergs Chesterfield',
    'Kirkwood, MO - 10233 Manchester Rd - Dierbergs Kirkwood',
  ],
  'East • West': [
    'St. Louis, MO - 4660 Maryland Ave - East West Central West End',
  ],
  'Gap': [
    'St. Louis, MO - 249 West County Center - Gap West County',
    'St. Louis, MO - 1155 St. Louis Galleria - Gap Galleria',
    'Chesterfield, MO - 230 Chesterfield Mall - Gap Chesterfield',
  ],
  'Golden Gems': [
    'St. Louis, MO - 3108 Locust St - Golden Gems City Foundry',
  ],
  'H&M': [
    'St. Louis, MO - 1155 St. Louis Galleria - H&M Galleria',
    'St. Louis, MO - 221 West County Center - H&M West County',
  ],
  'Home Depot': [
    'Brentwood, MO - 2720 S Brentwood Blvd - Home Depot Brentwood',
    'St. Louis, MO - 5901 Arsenal St - Home Depot South City',
    'Chesterfield, MO - 17050 North Outer 40 Rd - Home Depot Chesterfield',
  ],
  'IKEA': [
    'St. Louis, MO - 1 IKEA Way - IKEA St. Louis',
  ],
  'JCPenney': [
    'St. Louis, MO - 249 West County Center - JCPenney West County',
    'St. Louis, MO - 1155 St. Louis Galleria - JCPenney Galleria',
  ],
  'Kohl\'s': [
    'Brentwood, MO - 2701 S Brentwood Blvd - Kohl\'s Brentwood',
    'St. Louis, MO - 3959 S Grand Blvd - Kohl\'s South Grand',
    'Chesterfield, MO - 17421 Chesterfield Airport Rd - Kohl\'s Chesterfield',
  ],
  'L.L.Bean': [
    'St. Louis, MO - Order online for returns - L.L.Bean',
  ],
  'Levine Hat Company': [
    'St. Louis, MO - 1416 Washington Ave - Levine Hat Company',
  ],
  'Lowe\'s': [
    'Brentwood, MO - 2901 S Brentwood Blvd - Lowe\'s Brentwood',
    'St. Louis, MO - 6700 S Lindbergh Blvd - Lowe\'s South County',
    'Chesterfield, MO - 15750 Olive Blvd - Lowe\'s Chesterfield',
  ],
  'MOD Boutique': [
    'Ladue, MO - 9643 Clayton Rd - MOD Boutique Ladue',
    'Kirkwood, MO - 140 W Argonne Dr - MOD Boutique Kirkwood',
    'St. Charles, MO - 3720 Veterans Memorial Pkwy - MOD Boutique St. Charles',
  ],
  'Macy\'s': [
    'St. Louis, MO - 249 West County Center - Macy\'s West County',
    'St. Louis, MO - 1155 St. Louis Galleria - Macy\'s Galleria',
  ],
  'Marta\'s Boutique': [
    'Ellisville, MO - 9208 Clayton Rd - Marta\'s Boutique Ellisville',
  ],
  'Micro Center': [
    'Brentwood, MO - 1565 S Brentwood Blvd - Micro Center Brentwood',
  ],
  'Nike': [
    'Hazelwood, MO - 5555 St. Louis Mills Blvd - Nike Factory Store',
    'St. Louis, MO - 249 West County Center - Nike West County',
  ],
  'Nordstrom': [
    'St. Louis, MO - 249 West County Center - Nordstrom West County',
    'St. Louis, MO - 1155 St. Louis Galleria - Nordstrom Rack Galleria',
  ],
  'Paperdolls Boutique': [
    'St. Louis, MO - Multiple locations - Paperdolls Boutique',
  ],
  'REI': [
    'Brentwood, MO - 1703 S Brentwood Blvd - REI Brentwood',
  ],
  'Randall\'s': [
    'St. Louis, MO - Online only - Randall\'s',
  ],
  'Sam\'s Club': [
    'Bridgeton, MO - 3660 Pennridge Dr - Sam\'s Club Bridgeton',
    'St. Louis, MO - 6001 S Lindbergh Blvd - Sam\'s Club South County',
  ],
  'Schnucks': [
    'St. Louis, MO - 4171 Laclede Ave - Schnucks Central West End',
    'Clayton, MO - 8400 Forsyth Blvd - Schnucks Clayton',
    'Kirkwood, MO - 10233 Manchester Rd - Schnucks Kirkwood',
  ],
  'Target': [
    'Brentwood, MO - 2801 S Brentwood Blvd - Target Brentwood',
    'Chesterfield, MO - 17300 Chesterfield Airport Rd - Target Chesterfield',
    'St. Louis, MO - 4200 S Grand Blvd - Target South City',
    'Clayton, MO - 8024 Bonhomme Ave - Target Clayton',
  ],
  'TJ Maxx': [
    'Brentwood, MO - 2701 S Brentwood Blvd - TJ Maxx Brentwood',
    'Chesterfield, MO - 17040 North Outer 40 Rd - TJ Maxx Chesterfield',
  ],
  'Ulta Beauty': [
    'Brentwood, MO - 2701 S Brentwood Blvd - Ulta Beauty Brentwood',
    'St. Louis, MO - 249 West County Center - Ulta Beauty West County',
    'Chesterfield, MO - 17301 Chesterfield Airport Rd - Ulta Beauty Chesterfield',
  ],
  'Walmart': [
    'Lemay, MO - 4551 Lemay Ferry Rd - Walmart Supercenter Lemay Ferry',
    'Des Peres, MO - 3751 Marketplace Dr - Walmart Supercenter Manchester',
    'St. Louis, MO - 3615 Telegraph Rd - Walmart Supercenter Telegraph',
    'Bridgeton, MO - 3849 Dunn Rd - Walmart Supercenter Bridgeton',
  ],
  'Whole Foods': [
    'Brentwood, MO - 1601 S Brentwood Blvd - Whole Foods Brentwood',
    'Town and Country, MO - 224 N Woods Mill Rd - Whole Foods Town and Country',
  ],
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
  const tier = SERVICE_TIERS[formData.serviceTier || 'standard'];
  const basePrice = tier.price; // Base pickup fee from selected tier
  
  // Size upcharge based on box size
  const sizeUpcharges: Record<string, number> = {
    'small': 0,
    'medium': 2.00,
    'large': 4.00,
    'xlarge': 6.00
  };
  
  const sizeUpcharge = sizeUpcharges[formData.boxSize] || 0;
  const multiBoxFee = formData.numberOfBoxes > 1 ? (formData.numberOfBoxes - 1) * 3.00 : 0;
  
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
  
  const [page, setPage] = useState(1);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<FormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    streetAddress: '',
    city: 'St. Louis',
    state: 'MO',
    zipCode: '',
    retailerName: '',
    retailerLocation: '',
    retailer: '',
    storeDestinationName: '',
    storeDestinationAddress: '',
    storeDestinationCity: '',
    storeDestinationState: '',
    items: [{
      id: crypto.randomUUID(),
      orderName: '',
      itemDescription: '',
      itemValue: ''
    }],
    notes: '',
    boxSize: 'small',
    numberOfBoxes: 1,
    serviceTier: 'standard',
    tip: 0,
    paymentMethod: 'card'
  });

  const pricing = useMemo(() => calculatePricing(formData), [formData]);

  // Item management functions
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: crypto.randomUUID(),
          orderName: '',
          itemDescription: '',
          itemValue: ''
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

  const updateItem = (itemId: string, field: keyof ReturnItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  // Photo upload handlers
  const handleReceiptGetUploadUrl = async () => {
    const response: any = await apiRequest("POST", "/api/objects/upload");
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
        
        const response: any = await apiRequest("PUT", `/api/orders/temp/receipt`, {
          receiptUrl: tempUploadUrl,
        });
        
        const durableObjectPath = response.objectPath;
        
        setFormData(prev => ({ 
          ...prev, 
          receiptPhotoUrl: durableObjectPath,
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

  const handleTagsGetUploadUrl = async () => {
    const response: any = await apiRequest("POST", "/api/objects/upload");
    return {
      method: "PUT" as const,
      url: response.uploadURL,
    };
  };

  const handleTagsUploadComplete = useCallback(async (result: any) => {
    if (result.successful && result.successful.length > 0) {
      try {
        const uploadedFile = result.successful[0];
        const tempUploadUrl = uploadedFile.uploadURL;
        
        const response: any = await apiRequest("PUT", `/api/orders/temp/receipt`, {
          receiptUrl: tempUploadUrl,
        });
        
        const durableObjectPath = response.objectPath;
        
        setFormData(prev => ({ 
          ...prev, 
          tagsPhotoUrl: durableObjectPath,
        }));
        
        toast({
          title: "Tags photo uploaded",
          description: "Photo of original tags uploaded successfully",
        });
      } catch (error) {
        console.error("Error finalizing tags photo upload:", error);
        toast({
          title: "Upload failed",
          description: "Failed to upload tags photo. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handlePackagingGetUploadUrl = async () => {
    const response: any = await apiRequest("POST", "/api/objects/upload");
    return {
      method: "PUT" as const,
      url: response.uploadURL,
    };
  };

  const handlePackagingUploadComplete = useCallback(async (result: any) => {
    if (result.successful && result.successful.length > 0) {
      try {
        const uploadedFile = result.successful[0];
        const tempUploadUrl = uploadedFile.uploadURL;
        
        const response: any = await apiRequest("PUT", `/api/orders/temp/receipt`, {
          receiptUrl: tempUploadUrl,
        });
        
        const durableObjectPath = response.objectPath;
        
        setFormData(prev => ({ 
          ...prev, 
          packagingPhotoUrl: durableObjectPath,
        }));
        
        toast({
          title: "Packaging photo uploaded",
          description: "Photo of original packaging uploaded successfully",
        });
      } catch (error) {
        console.error("Error finalizing packaging photo upload:", error);
        toast({
          title: "Upload failed",
          description: "Failed to upload packaging photo. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

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
    
    setValidationErrors(new Set());
    return true;
  };

  const handleNextPage = async () => {
    if (!validatePage(page)) {
      return;
    }

    if (page === 3) {
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
      
      // Combine all items into order name and description
      const orderName = data.items.map(item => item.orderName).join(', ');
      const itemDescription = data.items.map((item, index) => 
        `Item ${index + 1}: ${item.orderName} - ${item.itemDescription} ($${item.itemValue})`
      ).join('\n');
      
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
        
        // Return details
        retailer: data.retailer,
        itemCategory: 'Other',
        itemDescription: itemDescription,
        orderName: orderName,
        
        // Box details
        boxSize: data.boxSize,
        numberOfBoxes: data.numberOfBoxes,
        
        // Required fields with defaults
        purchaseType: 'online',
        itemSize: data.boxSize,
        numberOfItems: data.items.length,
        hasOriginalTags: false,
        receiptUploaded: !!(data.receiptPhotoUrl || data.tagsPhotoUrl || data.packagingPhotoUrl),
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

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-3xl mx-auto px-4">
        {/* Header with Return It logo link */}
        <div className="text-center mb-8">
          <BrandLogo size="lg" linkToHome={true} className="justify-center" />
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Book a Return</h1>
          {page <= 3 && <p className="text-muted-foreground text-lg">Step {page} of 3</p>}
        </div>

        {/* Professional progress bar */}
        {page <= 3 && (
          <div className="mb-10">
            <div className="flex items-start justify-between gap-2">
              {[
                { num: 1, label: 'Pickup Info' },
                { num: 2, label: 'Return Details' },
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

        <Card className="shadow-lg border-border/50">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-3 text-2xl">
              {page === 1 && <><MapPin className="h-6 w-6 text-[#B8956A]" /> Pickup Information</>}
              {page === 2 && <><Package className="h-6 w-6 text-[#B8956A]" /> Return Details</>}
              {page === 3 && <><Check className="h-6 w-6 text-[#B8956A]" /> Review</>}
              {page === 4 && <><CreditCard className="h-6 w-6 text-[#B8956A]" /> Payment</>}
            </CardTitle>
            <CardDescription className="text-base">
              {page === 1 && "Where should we pick up your return?"}
              {page === 2 && "Tell us about the item you're returning"}
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
                      placeholder="John"
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
                      placeholder="Doe"
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
                    placeholder="your@email.com"
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
                    placeholder="(314) 555-1234"
                    className={`mt-1.5 ${validationErrors.has('phone') ? 'border-red-500 border-2' : ''}`}
                    required
                    data-testid="input-phone"
                  />
                </div>

                <Separator className="my-6" />

                <div>
                  <Label htmlFor="streetAddress" className="text-sm font-semibold">Street Address *</Label>
                  <Input
                    id="streetAddress"
                    value={formData.streetAddress}
                    onChange={(e) => updateField('streetAddress', e.target.value)}
                    placeholder="123 Main St, Apt 4B"
                    className={`mt-1.5 ${validationErrors.has('streetAddress') ? 'border-red-500 border-2' : ''}`}
                    required
                    data-testid="input-street-address"
                  />
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="city" className="text-sm font-semibold">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        placeholder="St. Louis"
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
                        placeholder="MO"
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
                      placeholder="63101"
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
                <div>
                  <Label htmlFor="retailerName" className="text-sm font-semibold">Retailer *</Label>
                  <Select value={formData.retailerName} onValueChange={(value) => updateField('retailerName', value)}>
                    <SelectTrigger className={`mt-1.5 ${validationErrors.has('retailerName') ? 'border-red-500 border-2' : ''}`} data-testid="select-retailer-name">
                      <SelectValue placeholder="Select retailer" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {Object.keys(STORE_LOCATIONS).sort().map((retailer) => (
                        <SelectItem key={retailer} value={retailer}>
                          {retailer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.retailerName && (
                  <div>
                    <Label htmlFor="retailerLocation" className="text-sm font-semibold">Store Location *</Label>
                    <Select value={formData.retailerLocation} onValueChange={(value) => updateField('retailerLocation', value)}>
                      <SelectTrigger className={`mt-1.5 ${validationErrors.has('retailerLocation') ? 'border-red-500 border-2' : ''}`} data-testid="select-retailer-location">
                        <SelectValue placeholder="Select store location" />
                      </SelectTrigger>
                      <SelectContent>
                        {STORE_LOCATIONS[formData.retailerName]?.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.retailerLocation && (
                  <div className="space-y-4 p-4 bg-amber-50/30 border border-amber-200 rounded-lg">
                    <h3 className="text-sm font-semibold text-amber-900 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Return Destination (Editable)
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
                          placeholder="MO"
                          className="mt-1.5 bg-white"
                          required
                          data-testid="input-store-state"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Multiple Items Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Items to Return *</Label>
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
                          placeholder="Black Purse, Running Shoes, etc."
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
                          placeholder="Describe the item you're returning..."
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
                            placeholder="50.00"
                            step="0.01"
                            className={`pl-7 ${validationErrors.has(`item-${index}-itemValue`) ? 'border-red-500 border-2' : ''}`}
                            required
                            data-testid={`input-item-value-${index}`}
                          />
                        </div>
                      </div>
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

                <Separator className="my-6" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="boxSize" className="text-sm font-semibold">Package Size *</Label>
                    <Select value={formData.boxSize} onValueChange={(value) => updateField('boxSize', value)}>
                      <SelectTrigger className="mt-1.5" data-testid="select-box-size">
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
                  <div>
                    <Label htmlFor="numberOfBoxes" className="text-sm font-semibold">Number of Boxes/Bags</Label>
                    <Input
                      id="numberOfBoxes"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={formData.numberOfBoxes}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty string for deletion, or validate numeric input
                        if (value === '') {
                          updateField('numberOfBoxes', '');
                        } else {
                          const numValue = parseInt(value);
                          if (!isNaN(numValue) && numValue >= 1 && numValue <= 5) {
                            updateField('numberOfBoxes', numValue);
                          } else if (!isNaN(numValue) && numValue > 5) {
                            // Cap at 5
                            updateField('numberOfBoxes', 5);
                          }
                        }
                      }}
                      onBlur={(e) => {
                        // If empty on blur, reset to 1
                        if (e.target.value === '') {
                          updateField('numberOfBoxes', 1);
                        }
                      }}
                      placeholder="1"
                      className="mt-1.5"
                      data-testid="input-number-of-boxes"
                    />
                    {formData.numberOfBoxes > 1 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        +${((formData.numberOfBoxes - 1) * 3).toFixed(2)} multi-package fee
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-semibold">Special Instructions (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    placeholder="Any special pickup instructions..."
                    rows={2}
                    className="mt-1.5"
                    data-testid="input-notes"
                  />
                </div>

                <Separator className="my-6" />

                {/* Photo Verification - MANDATORY */}
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
                        <h4 className="font-semibold text-red-900">Photo Verification Required</h4>
                        <p className="text-sm text-red-700 mt-1 font-medium">
                          Upload at least 1 of the 3 options below (preferably all 3)
                        </p>
                        <p className="text-xs text-red-600 mt-2">
                          This protects you, our drivers, and ensures a smooth return process.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-amber-600" />
                      <Label className="text-foreground font-semibold text-base">Upload at least 1 (preferably all 3) *</Label>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Upload at least 1 of the 3 options (preferably all 3):</p>
                    
                    {/* Option 1: Receipt Photo */}
                    <div className="space-y-2 p-3 bg-white rounded border border-border">
                      <div className="flex items-start space-x-2">
                        <div className="flex-1">
                          <Label className="text-foreground font-semibold">1. Receipt or Order Confirmation</Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            📄 Take a clear photo of your paper receipt or screenshot your email confirmation
                          </p>
                        </div>
                      </div>
                      <ObjectUploader
                        maxNumberOfFiles={1}
                        maxFileSize={10485760}
                        onGetUploadParameters={handleReceiptGetUploadUrl}
                        onComplete={handleReceiptUploadComplete}
                        variant="outline"
                        size="sm"
                        testId="button-upload-receipt"
                      >
                        {formData.receiptPhotoUrl ? 'Change Receipt Photo' : 'Upload Receipt Photo'}
                      </ObjectUploader>
                      {formData.receiptPhotoUrl && (
                        <div className="flex items-center space-x-2 text-green-600 text-sm">
                          <Check className="h-4 w-4" />
                          <span className="font-medium">Receipt photo uploaded ✓</span>
                        </div>
                      )}
                    </div>

                    {/* Option 2: Tags Photo */}
                    <div className="space-y-2 p-3 bg-white rounded border border-border">
                      <div className="flex items-start space-x-2">
                        <div className="flex-1">
                          <Label className="text-foreground font-semibold">2. Original Tags</Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            🏷️ Take a photo showing the item with original tags still attached
                          </p>
                        </div>
                      </div>
                      <ObjectUploader
                        maxNumberOfFiles={1}
                        maxFileSize={10485760}
                        onGetUploadParameters={handleTagsGetUploadUrl}
                        onComplete={handleTagsUploadComplete}
                        variant="outline"
                        size="sm"
                        testId="button-upload-tags"
                      >
                        {formData.tagsPhotoUrl ? 'Change Tags Photo' : 'Upload Tags Photo'}
                      </ObjectUploader>
                      {formData.tagsPhotoUrl && (
                        <div className="flex items-center space-x-2 text-green-600 text-sm">
                          <Check className="h-4 w-4" />
                          <span className="font-medium">Tags photo uploaded ✓</span>
                        </div>
                      )}
                    </div>

                    {/* Option 3: Packaging Photo */}
                    <div className="space-y-2 p-3 bg-white rounded border border-border">
                      <div className="flex items-start space-x-2">
                        <div className="flex-1">
                          <Label className="text-foreground font-semibold">3. Original Packaging</Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            📦 Take a photo showing the item in its original packaging
                          </p>
                        </div>
                      </div>
                      <ObjectUploader
                        maxNumberOfFiles={1}
                        maxFileSize={10485760}
                        onGetUploadParameters={handlePackagingGetUploadUrl}
                        onComplete={handlePackagingUploadComplete}
                        variant="outline"
                        size="sm"
                        testId="button-upload-packaging"
                      >
                        {formData.packagingPhotoUrl ? 'Change Packaging Photo' : 'Upload Packaging Photo'}
                      </ObjectUploader>
                      {formData.packagingPhotoUrl && (
                        <div className="flex items-center space-x-2 text-green-600 text-sm">
                          <Check className="h-4 w-4" />
                          <span className="font-medium">Packaging photo uploaded ✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
                        <h4 className="font-semibold text-blue-900">🏪 Return Destination</h4>
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
                    Return Details
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
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Package Size:</span>
                      <span className="font-medium capitalize">{formData.boxSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Number of Packages:</span>
                      <span className="font-medium">{formData.numberOfBoxes}</span>
                    </div>
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
                        <span className="text-muted-foreground">Size Upcharge ({formData.boxSize})</span>
                        <span className="font-medium">${pricing.sizeUpcharge.toFixed(2)}</span>
                      </div>
                    )}
                    {pricing.multiBoxFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Multi-Package Fee ({formData.numberOfBoxes} boxes/bags)</span>
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
                        placeholder="0.00"
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
                  onClick={() => setLocation('/')}
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
                  onClick={() => page > 1 ? setPage(page - 1) : setLocation('/')}
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
      </div>
    </div>
  );
}
