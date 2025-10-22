import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth-simple";
import { Package, MapPin, CreditCard, ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

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
  itemDescription: string;
  itemValue: string;
  orderName: string;
  notes: string;
  boxSize: string;
  numberOfBoxes: number;
  // Page 3
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

// Pricing calculation based on business rules
function calculatePricing(formData: FormData) {
  const basePrice = 8.99; // Base pickup fee
  
  // Size upcharge based on box size
  const sizeUpcharges: Record<string, number> = {
    'small': 0,
    'medium': 2.00,
    'large': 4.00,
    'xlarge': 6.00
  };
  
  const sizeUpcharge = sizeUpcharges[formData.boxSize] || 0;
  const multiBoxFee = formData.numberOfBoxes > 1 ? (formData.numberOfBoxes - 1) * 3.00 : 0;
  
  const subtotal = basePrice + sizeUpcharge + multiBoxFee;
  const serviceFee = 1.50; // Platform service fee
  const fuelFee = 1.25; // Flat fuel fee
  const taxRate = 0; // 0% tax
  const tax = (subtotal + serviceFee + fuelFee) * taxRate;
  
  const total = subtotal + serviceFee + fuelFee + tax;
  
  return {
    basePrice,
    sizeUpcharge,
    multiBoxFee,
    subtotal,
    serviceFee,
    fuelFee,
    tax,
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
    itemDescription: '',
    itemValue: '',
    orderName: '',
    notes: '',
    boxSize: 'small',
    numberOfBoxes: 1,
    paymentMethod: 'card'
  });

  const pricing = useMemo(() => calculatePricing(formData), [formData]);

  // Validate current page before proceeding
  const validatePage = (pageNum: number): boolean => {
    if (pageNum === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || 
          !formData.phone || !formData.streetAddress || !formData.city || 
          !formData.state || !formData.zipCode) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return false;
      }
    } else if (pageNum === 2) {
      if (!formData.retailerName || !formData.retailerLocation || 
          !formData.orderName || !formData.itemDescription || !formData.itemValue) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleNextPage = async () => {
    if (!validatePage(page)) {
      return;
    }

    if (page === 2) {
      // Create payment intent before going to page 3
      try {
        const response = await apiRequest('POST', '/api/create-payment-intent', {
          amount: pricing.total,
        });
        setClientSecret(response.clientSecret);
        setPage(3);
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
          
          // Auto-fill the store location fields (NOT the pickup address)
          // These are displayed below for reference
          updated.retailer = locationString;
          
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
        itemDescription: data.itemDescription,
        orderName: data.orderName,
        
        // Box details
        boxSize: data.boxSize,
        numberOfBoxes: data.numberOfBoxes,
        
        // Required fields with defaults
        purchaseType: 'online',
        itemSize: data.boxSize,
        numberOfItems: 1,
        hasOriginalTags: false,
        receiptUploaded: false,
        acceptsLiabilityTerms: true,
        
        // Pricing (send essential values - service fee and tax are included in total)
        itemValue: parseFloat(data.itemValue) || 0,
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
      setPage(4); // Show confirmation page
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Book a Return</h1>
          {page < 4 && <p className="text-muted-foreground text-lg">Step {page} of 3</p>}
        </div>

        {/* Professional progress bar */}
        {page < 4 && (
          <div className="mb-10">
            <div className="flex items-center gap-3">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    page >= step 
                      ? 'bg-[#B8956A] border-[#B8956A] text-white' 
                      : 'bg-background border-muted-foreground/20 text-muted-foreground'
                  }`}>
                    {page > step ? <Check className="h-5 w-5" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      page > step ? 'bg-[#B8956A]' : 'bg-muted-foreground/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 px-1">
              <span className="text-sm font-medium">Pickup Info</span>
              <span className="text-sm font-medium">Return Details</span>
              <span className="text-sm font-medium">Review</span>
            </div>
          </div>
        )}

        <Card className="shadow-lg border-border/50">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-3 text-2xl">
              {page === 1 && <><MapPin className="h-6 w-6 text-[#B8956A]" /> Pickup Information</>}
              {page === 2 && <><Package className="h-6 w-6 text-[#B8956A]" /> Return Details</>}
              {page === 3 && <><CreditCard className="h-6 w-6 text-[#B8956A]" /> Review & Payment</>}
            </CardTitle>
            <CardDescription className="text-base">
              {page === 1 && "Where should we pick up your return?"}
              {page === 2 && "Tell us about the item you're returning"}
              {page === 3 && "Review your information and confirm"}
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
                      className="mt-1.5"
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
                      className="mt-1.5"
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
                    className="mt-1.5"
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
                    className="mt-1.5"
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
                    className="mt-1.5"
                    required
                    data-testid="input-street-address"
                  />
                </div>

                <div className="grid grid-cols-6 gap-4">
                  <div className="col-span-3">
                    <Label htmlFor="city" className="text-sm font-semibold">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="St. Louis"
                      className="mt-1.5"
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
                      className="mt-1.5"
                      required
                      data-testid="input-state"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="zipCode" className="text-sm font-semibold">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => updateField('zipCode', e.target.value)}
                      placeholder="63101"
                      className="mt-1.5"
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
                    <SelectTrigger className="mt-1.5" data-testid="select-retailer-name">
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
                      <SelectTrigger className="mt-1.5" data-testid="select-retailer-location">
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

                {formData.retailerLocation && (() => {
                  const parts = formData.retailerLocation.split(' - ');
                  if (parts.length >= 3) {
                    const [cityState, address, storeName] = parts;
                    const [city, state] = cityState.split(', ');
                    return (
                      <Card className="bg-amber-50 border-amber-200">
                        <CardContent className="p-4">
                          <h3 className="text-sm font-semibold text-amber-900 mb-2 flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            Return Destination
                          </h3>
                          <div className="space-y-1 text-sm text-amber-800">
                            <p className="font-semibold">{storeName}</p>
                            <p>{address}</p>
                            <p>{city}, {state}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                  return null;
                })()}

                <div>
                  <Label htmlFor="orderName" className="text-sm font-semibold">Order Name *</Label>
                  <Input
                    id="orderName"
                    value={formData.orderName}
                    onChange={(e) => updateField('orderName', e.target.value)}
                    placeholder="Black Purse, Running Shoes, etc."
                    className="mt-1.5"
                    required
                    data-testid="input-order-name"
                  />
                </div>

                <div>
                  <Label htmlFor="itemDescription" className="text-sm font-semibold">Item Description *</Label>
                  <Textarea
                    id="itemDescription"
                    value={formData.itemDescription}
                    onChange={(e) => updateField('itemDescription', e.target.value)}
                    placeholder="Describe the item you're returning..."
                    rows={3}
                    className="mt-1.5"
                    required
                    data-testid="input-item-description"
                  />
                </div>

                <div>
                  <Label htmlFor="itemValue" className="text-sm font-semibold">Item Value *</Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="itemValue"
                      type="number"
                      value={formData.itemValue}
                      onChange={(e) => updateField('itemValue', e.target.value)}
                      placeholder="50.00"
                      step="0.01"
                      className="pl-7"
                      required
                      data-testid="input-item-value"
                    />
                  </div>
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
                      type="number"
                      min="1"
                      max="5"
                      value={formData.numberOfBoxes}
                      onChange={(e) => updateField('numberOfBoxes', parseInt(e.target.value) || 1)}
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
              </div>
            )}

            {/* PAGE 3: Payment */}
            {page === 3 && (
              <div className="space-y-6">
                <div className="bg-muted/30 p-5 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-[#B8956A]" />
                    Price Breakdown
                  </h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Pickup Fee</span>
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
                      <span className="text-muted-foreground">Service Fee</span>
                      <span className="font-medium">${pricing.serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fuel Fee</span>
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

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <p className="text-sm text-amber-900">
                    <strong>Cancellation Policy:</strong> If you cancel after a driver has been dispatched, a $4.99 cancellation fee will apply to cover driver costs.
                  </p>
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

            {/* PAGE 4: Confirmation */}
            {page === 4 && confirmedOrder && (
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
            {page < 3 && (
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
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
            
            {page === 3 && (
              <div className="mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setPage(2)}
                  className="px-6"
                  data-testid="button-back-to-details"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Details
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
