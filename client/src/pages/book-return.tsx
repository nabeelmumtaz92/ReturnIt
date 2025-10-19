import { useState, useMemo } from "react";
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
import { Package, MapPin, CreditCard, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
const STORE_LOCATIONS: Record<string, string[]> = {
  'Target': [
    'Target - Brentwood (2801 S Brentwood Blvd)',
    'Target - Chesterfield (17300 Chesterfield Airport Rd)',
    'Target - South City (4200 S Grand Blvd)',
    'Target - Clayton (8024 Bonhomme Ave)',
  ],
  'Nike': [
    'Nike Factory Store - St. Louis Outlets (5555 St. Louis Mills Blvd)',
    'Nike Store - West County Center (249 West County Center)',
  ],
  'H&M': [
    'H&M - Galleria (1155 St. Louis Galleria)',
    'H&M - West County (221 West County Center)',
  ],
  'Best Buy': [
    'Best Buy - Brentwood (2701 S Brentwood Blvd)',
    'Best Buy - Chesterfield (1830 Clarkson Rd)',
    'Best Buy - South County (5650 S Lindbergh Blvd)',
  ],
  'Walmart': [
    'Walmart Supercenter - Lemay Ferry (4551 Lemay Ferry Rd)',
    'Walmart Supercenter - Manchester (3751 Marketplace Dr)',
    'Walmart Supercenter - Telegraph (3615 Telegraph Rd)',
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
  const taxRate = 0.0875; // 8.75% tax (St. Louis rate)
  const tax = (subtotal + serviceFee) * taxRate;
  
  const total = subtotal + serviceFee + tax;
  
  return {
    basePrice,
    sizeUpcharge,
    multiBoxFee,
    subtotal,
    serviceFee,
    tax,
    total
  };
}

export default function BookReturn() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [page, setPage] = useState(1);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
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

  const updateField = (field: keyof FormData, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // When retailer name changes, reset location and update combined retailer field
      if (field === 'retailerName') {
        updated.retailerLocation = '';
        updated.retailer = value as string;
      }
      
      // When location is selected, update combined retailer field
      if (field === 'retailerLocation' && value) {
        updated.retailer = value as string;
      }
      
      return updated;
    });
  };

  const createOrderMutation = useMutation({
    mutationFn: async (data: FormData) => {
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
        
        // Status
        status: 'created',
        paymentMethod: data.paymentMethod
      });
    },
    onSuccess: (data) => {
      console.log('Order created successfully:', data);
      console.log('Order ID:', data?.id);
      console.log('Tracking Number:', data?.trackingNumber);
      console.log('Total Price:', data?.totalPrice);
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

  const handleSubmit = () => {
    createOrderMutation.mutate(formData);
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
                    <SelectContent>
                      <SelectItem value="Target">Target</SelectItem>
                      <SelectItem value="Nike">Nike</SelectItem>
                      <SelectItem value="H&M">H&M</SelectItem>
                      <SelectItem value="Best Buy">Best Buy</SelectItem>
                      <SelectItem value="Walmart">Walmart</SelectItem>
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

                <div>
                  <Label htmlFor="orderName" className="text-sm font-semibold">Order Name *</Label>
                  <Input
                    id="orderName"
                    value={formData.orderName}
                    onChange={(e) => updateField('orderName', e.target.value)}
                    placeholder="Black Purse, Running Shoes, etc."
                    className="mt-1.5"
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

            {/* PAGE 3: Review */}
            {page === 3 && (
              <div className="space-y-6">
                <div className="bg-muted/30 p-5 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#B8956A]" />
                    Pickup Information
                  </h3>
                  <div className="space-y-1.5 text-sm">
                    <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                    <p className="text-muted-foreground">{formData.email}</p>
                    <p className="text-muted-foreground">{formData.phone}</p>
                    <p className="text-muted-foreground mt-2">{formData.streetAddress}</p>
                    <p className="text-muted-foreground">{formData.city}, {formData.state} {formData.zipCode}</p>
                  </div>
                </div>

                <div className="bg-muted/30 p-5 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#B8956A]" />
                    Return Details
                  </h3>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Retailer:</span>
                      <span className="font-medium">{formData.retailer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Item:</span>
                      <span className="font-medium">{formData.orderName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Value:</span>
                      <span className="font-medium">${formData.itemValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Package Size:</span>
                      <span className="font-medium capitalize">{formData.boxSize}</span>
                    </div>
                    {formData.numberOfBoxes > 1 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Number of Boxes/Bags:</span>
                        <span className="font-medium">{formData.numberOfBoxes}</span>
                      </div>
                    )}
                    {formData.itemDescription && (
                      <div className="mt-2 pt-2 border-t">
                        <span className="text-muted-foreground">Description:</span>
                        <p className="mt-1 text-foreground">{formData.itemDescription}</p>
                      </div>
                    )}
                  </div>
                </div>

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
                      <span className="text-muted-foreground">Tax (8.75%)</span>
                      <span className="font-medium">${pricing.tax.toFixed(2)}</span>
                    </div>
                    <Separator className="bg-border" />
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-2xl font-bold text-[#B8956A]">${pricing.total.toFixed(2)}</span>
                    </div>
                  </div>
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

                {page < 3 ? (
                  <Button
                    onClick={() => setPage(page + 1)}
                    className="bg-[#B8956A] hover:bg-[#A0805A] text-white px-8"
                    data-testid="button-next"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={createOrderMutation.isPending}
                    className="bg-[#B8956A] hover:bg-[#A0805A] text-white px-8"
                    data-testid="button-submit"
                  >
                    {createOrderMutation.isPending ? "Processing..." : "Book Return"}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
