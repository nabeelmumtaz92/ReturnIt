import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth-simple";
import { ArrowLeft, Package, CreditCard, Search, MapPin, Minus, Plus } from "lucide-react";
import PaymentMethods from "@/components/PaymentMethods";

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
    // Address fields
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    // Retailer selection
    retailer: '',
    retailerQuery: '',
    // Item details
    itemCategories: [] as string[], // Changed to array for multiple selection
    itemDescription: '',
    estimatedWeight: '',
    // Box details
    boxSize: 'M',
    numberOfBoxes: 1,
    // Instructions
    notes: ''
  });

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

  // Box sizes with pricing
  const boxSizes = [
    { size: 'S', label: 'Small (Shoe box)', basePrice: 3.99, upcharge: 0 },
    { size: 'M', label: 'Medium (Standard)', basePrice: 3.99, upcharge: 0 },
    { size: 'L', label: 'Large (+$2)', basePrice: 3.99, upcharge: 2.00 },
    { size: 'XL', label: 'Extra Large (+$4)', basePrice: 3.99, upcharge: 4.00 }
  ];

  // Calculate total price
  const calculateTotal = () => {
    const selectedBoxSize = boxSizes.find(box => box.size === formData.boxSize);
    const basePrice = selectedBoxSize?.basePrice || 3.99;
    const sizeUpcharge = selectedBoxSize?.upcharge || 0;
    const multiBoxFee = formData.numberOfBoxes > 1 ? (formData.numberOfBoxes - 1) * 1.50 : 0;
    
    return basePrice + sizeUpcharge + multiBoxFee;
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
  }, [formData.boxSize, formData.numberOfBoxes]);

  const createOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/orders', 'POST', data);
      return response.json();
    },
    onSuccess: (order: any) => {
      toast({
        title: "Pickup booked!",
        description: `Your pickup has been scheduled. Order ID: ${order.id}`,
      });
      setLocation(`/order-status/${order.id}`);
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
    const required = ['streetAddress', 'city', 'state', 'zipCode', 'retailer'];
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
      boxSize: formData.boxSize,
      numberOfBoxes: formData.numberOfBoxes,
      notes: formData.notes,
      paymentMethod: method,
      paymentDetails: details,
      totalAmount
    };

    createOrderMutation.mutate(orderData);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'numberOfBoxes' ? parseInt(value as string) : value
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-200 via-yellow-100 to-orange-100">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-50">
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
            <img 
              src="/logo-cardboard-deep.png" 
              alt="Returnly Logo" 
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-amber-900">Book Pickup</span>
          </div>
          <div className="text-amber-800 text-sm">
            Welcome, {user?.username}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
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
              {/* Enhanced Pickup Address Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <MapPin className="h-5 w-5 text-amber-600" />
                  <Label className="text-amber-800 font-semibold text-lg">Pickup Address</Label>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="streetAddress" className="text-amber-800 font-medium">
                      Street Address *
                    </Label>
                    <Input
                      id="streetAddress"
                      type="text"
                      placeholder="123 Main Street"
                      value={formData.streetAddress}
                      onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                      className="bg-white/80 border-amber-300 focus:border-amber-500"
                      required
                      data-testid="input-street-address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="city" className="text-amber-800 font-medium">
                        City *
                      </Label>
                      <Input
                        id="city"
                        type="text"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="bg-white/80 border-amber-300 focus:border-amber-500"
                        required
                        data-testid="input-city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-amber-800 font-medium">
                        State *
                      </Label>
                      <Input
                        id="state"
                        type="text"
                        placeholder="MO"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="bg-white/80 border-amber-300 focus:border-amber-500"
                        maxLength={2}
                        required
                        data-testid="input-state"
                      />
                    </div>
                  </div>
                  
                  <div className="w-1/2">
                    <Label htmlFor="zipCode" className="text-amber-800 font-medium">
                      Zip Code *
                    </Label>
                    <Input
                      id="zipCode"
                      type="text"
                      placeholder="12345"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      className="bg-white/80 border-amber-300 focus:border-amber-500"
                      required
                      data-testid="input-zip-code"
                    />
                  </div>
                </div>
              </div>

              {/* Retailer Autocomplete Section */}
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
                  <div className="flex items-center space-x-2 text-sm text-amber-700 bg-amber-50/60 p-2 rounded">
                    <span>Selected:</span>
                    <span className="font-medium">{formData.retailer}</span>
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

              {/* Box Size and Quantity */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Package className="h-5 w-5 text-amber-600" />
                  <Label className="text-amber-800 font-semibold text-lg">Box Details</Label>
                </div>
                <p className="text-sm text-amber-700 mb-3">Please use dropdown to describe the size of the box</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="boxSize" className="text-amber-800 font-medium">
                      Box Size *
                    </Label>
                    <Select
                      value={formData.boxSize}
                      onValueChange={(value) => handleInputChange('boxSize', value)}
                      required
                    >
                      <SelectTrigger data-testid="select-box-size">
                        <SelectValue placeholder="Select box size" />
                      </SelectTrigger>
                      <SelectContent>
                        {boxSizes.map((box) => (
                          <SelectItem key={box.size} value={box.size}>
                            {box.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="numberOfBoxes" className="text-amber-800 font-medium">
                      Number of Boxes *
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleInputChange('numberOfBoxes', Math.max(1, formData.numberOfBoxes - 1).toString())}
                        disabled={formData.numberOfBoxes <= 1}
                        data-testid="button-decrease-boxes"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="px-3 py-2 bg-amber-50 border border-amber-300 rounded text-center min-w-[60px]" data-testid="text-box-count">
                        {formData.numberOfBoxes}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleInputChange('numberOfBoxes', Math.min(10, formData.numberOfBoxes + 1).toString())}
                        disabled={formData.numberOfBoxes >= 10}
                        data-testid="button-increase-boxes"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
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

              {/* Dynamic Pricing */}
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-amber-800">Service fee:</span>
                    <span className="text-amber-900 font-medium">$3.99</span>
                  </div>
                  
                  {formData.boxSize === 'L' && (
                    <div className="flex justify-between items-center">
                      <span className="text-amber-800">Large box upcharge:</span>
                      <span className="text-amber-900 font-medium">+$2.00</span>
                    </div>
                  )}
                  
                  {formData.boxSize === 'XL' && (
                    <div className="flex justify-between items-center">
                      <span className="text-amber-800">Extra large box upcharge:</span>
                      <span className="text-amber-900 font-medium">+$4.00</span>
                    </div>
                  )}
                  
                  {formData.numberOfBoxes > 1 && (
                    <div className="flex justify-between items-center">
                      <span className="text-amber-800">Additional boxes ({formData.numberOfBoxes - 1} × $1.50):</span>
                      <span className="text-amber-900 font-medium">+${((formData.numberOfBoxes - 1) * 1.50).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <hr className="border-amber-300" />
                  <div className="flex justify-between items-center">
                    <span className="text-amber-900 font-semibold text-lg">Total:</span>
                    <span className="text-amber-900 font-bold text-xl" data-testid="text-total-amount">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
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