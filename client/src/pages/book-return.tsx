import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth-simple";
import { Package, MapPin, CreditCard, ArrowLeft, ArrowRight } from "lucide-react";

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
  retailer: string;
  itemDescription: string;
  itemValue: string;
  orderName: string;
  notes: string;
  // Page 3
  paymentMethod: string;
}

export default function BookReturn() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    retailer: '',
    itemDescription: '',
    itemValue: '',
    orderName: '',
    notes: '',
    paymentMethod: 'card'
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const createOrderMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest('POST', '/api/orders', {
        // User info (optional for guests)
        userId: user?.id || null,
        customerEmail: data.email,
        customerPhone: data.phone,
        
        // Pickup details (use field names server expects)
        streetAddress: data.streetAddress,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        notes: data.notes,
        
        // Return details
        retailer: data.retailer,
        itemCategory: 'Other', // Default category
        itemDescription: data.itemDescription,
        orderName: data.orderName,
        
        // Required fields with defaults
        purchaseType: 'online', // Default to online purchase
        itemSize: 'M', // Default to medium size
        numberOfItems: 1,
        hasOriginalTags: false,
        receiptUploaded: false,
        acceptsLiabilityTerms: true,
        
        // Pricing
        itemValue: parseFloat(data.itemValue) || 0,
        totalPrice: 12.00,
        basePrice: 12.00,
        
        // Status
        status: 'created',
        paymentMethod: data.paymentMethod
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your return pickup has been scheduled. We'll contact you soon!",
      });
      setLocation('/');
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
    console.log('Form Data being submitted:', formData);
    console.log('Mapped order data:', {
      userId: user?.id || null,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      pickupStreetAddress: formData.streetAddress,
      pickupCity: formData.city,
      pickupState: formData.state,
      pickupZipCode: formData.zipCode,
    });
    createOrderMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Book a Return</h1>
          <p className="text-muted-foreground">Step {page} of 3</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex gap-2">
            <div className={`h-2 flex-1 rounded-full ${page >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 flex-1 rounded-full ${page >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 flex-1 rounded-full ${page >= 3 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {page === 1 && <><MapPin className="h-5 w-5" /> Pickup Information</>}
              {page === 2 && <><Package className="h-5 w-5" /> Return Details</>}
              {page === 3 && <><CreditCard className="h-5 w-5" /> Review & Payment</>}
            </CardTitle>
            <CardDescription>
              {page === 1 && "Where should we pick up your return?"}
              {page === 2 && "Tell us about the item you're returning"}
              {page === 3 && "Review your information and confirm"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* PAGE 1: Contact & Address */}
            {page === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => updateField('firstName', e.target.value)}
                      placeholder="John"
                      data-testid="input-first-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => updateField('lastName', e.target.value)}
                      placeholder="Doe"
                      data-testid="input-last-name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="your@email.com"
                    data-testid="input-email"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    data-testid="input-phone"
                  />
                </div>

                <div>
                  <Label htmlFor="streetAddress">Street Address *</Label>
                  <Input
                    id="streetAddress"
                    value={formData.streetAddress}
                    onChange={(e) => updateField('streetAddress', e.target.value)}
                    placeholder="123 Main St, Apt 4B"
                    data-testid="input-street-address"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="St. Louis"
                      data-testid="input-city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      placeholder="MO"
                      maxLength={2}
                      data-testid="input-state"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => updateField('zipCode', e.target.value)}
                    placeholder="63101"
                    maxLength={5}
                    data-testid="input-zip-code"
                  />
                </div>
              </div>
            )}

            {/* PAGE 2: Return Details */}
            {page === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="retailer">Retailer *</Label>
                  <Input
                    id="retailer"
                    value={formData.retailer}
                    onChange={(e) => updateField('retailer', e.target.value)}
                    placeholder="Target, Nike, H&M, etc."
                    data-testid="input-retailer"
                  />
                </div>

                <div>
                  <Label htmlFor="orderName">Order Name *</Label>
                  <Input
                    id="orderName"
                    value={formData.orderName}
                    onChange={(e) => updateField('orderName', e.target.value)}
                    placeholder="Black Purse, Running Shoes, etc."
                    data-testid="input-order-name"
                  />
                </div>

                <div>
                  <Label htmlFor="itemDescription">Item Description *</Label>
                  <Textarea
                    id="itemDescription"
                    value={formData.itemDescription}
                    onChange={(e) => updateField('itemDescription', e.target.value)}
                    placeholder="Describe the item you're returning..."
                    rows={3}
                    data-testid="input-item-description"
                  />
                </div>

                <div>
                  <Label htmlFor="itemValue">Item Value *</Label>
                  <Input
                    id="itemValue"
                    type="number"
                    value={formData.itemValue}
                    onChange={(e) => updateField('itemValue', e.target.value)}
                    placeholder="50.00"
                    step="0.01"
                    data-testid="input-item-value"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Special Instructions (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    placeholder="Any special pickup instructions..."
                    rows={2}
                    data-testid="input-notes"
                  />
                </div>
              </div>
            )}

            {/* PAGE 3: Review */}
            {page === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Pickup Information</h3>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>{formData.firstName} {formData.lastName}</p>
                    <p>{formData.email}</p>
                    <p>{formData.phone}</p>
                    <p>{formData.streetAddress}</p>
                    <p>{formData.city}, {formData.state} {formData.zipCode}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Return Details</h3>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p><span className="font-medium">Retailer:</span> {formData.retailer}</p>
                    <p><span className="font-medium">Item:</span> {formData.orderName}</p>
                    <p><span className="font-medium">Value:</span> ${formData.itemValue}</p>
                    <p><span className="font-medium">Description:</span> {formData.itemDescription}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Payment</h3>
                  <div className="text-sm text-muted-foreground">
                    <p>Total: <span className="text-lg font-bold text-foreground">$12.00</span></p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => page > 1 ? setPage(page - 1) : setLocation('/')}
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {page < 3 ? (
                <Button
                  onClick={() => setPage(page + 1)}
                  data-testid="button-next"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={createOrderMutation.isPending}
                  data-testid="button-submit"
                >
                  {createOrderMutation.isPending ? "Submitting..." : "Book Return"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
