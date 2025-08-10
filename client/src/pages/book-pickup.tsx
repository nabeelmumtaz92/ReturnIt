import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth-simple";
import { ArrowLeft, Package } from "lucide-react";

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
    pickupAddress: '',
    retailer: '',
    itemDescription: '',
    notes: ''
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('/api/orders', 'POST', data);
    },
    onSuccess: (order) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pickupAddress || !formData.retailer || !formData.itemDescription) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
              Fill out the details below to schedule your return pickup. Base price: $3.99
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Pickup Address */}
              <div className="space-y-2">
                <Label htmlFor="pickup-address" className="text-amber-900 font-medium">
                  Pickup Address *
                </Label>
                <Input
                  id="pickup-address"
                  data-testid="input-pickup-address"
                  value={formData.pickupAddress}
                  onChange={(e) => handleInputChange('pickupAddress', e.target.value)}
                  placeholder="123 Main St, Apt 2C, City, State 12345"
                  required
                />
              </div>

              {/* Retailer */}
              <div className="space-y-2">
                <Label htmlFor="retailer" className="text-amber-900 font-medium">
                  Return to Retailer *
                </Label>
                <Select
                  value={formData.retailer}
                  onValueChange={(value) => handleInputChange('retailer', value)}
                  required
                >
                  <SelectTrigger data-testid="select-retailer">
                    <SelectValue placeholder="Select retailer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Target">Target</SelectItem>
                    <SelectItem value="Amazon">Amazon</SelectItem>
                    <SelectItem value="Best Buy">Best Buy</SelectItem>
                    <SelectItem value="Nike">Nike</SelectItem>
                    <SelectItem value="Zara">Zara</SelectItem>
                    <SelectItem value="Home Depot">Home Depot</SelectItem>
                    <SelectItem value="Macy's">Macy's</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Item Description */}
              <div className="space-y-2">
                <Label htmlFor="item-description" className="text-amber-900 font-medium">
                  Item Description *
                </Label>
                <Input
                  id="item-description"
                  data-testid="input-item-description"
                  value={formData.itemDescription}
                  onChange={(e) => handleInputChange('itemDescription', e.target.value)}
                  placeholder="e.g., Nike Shoes - Wrong Size, Blue Sweater - Defective"
                  required
                />
              </div>

              {/* Optional Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-amber-900 font-medium">
                  Special Instructions (optional)
                </Label>
                <Textarea
                  id="notes"
                  data-testid="textarea-notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any special pickup instructions..."
                  rows={3}
                />
              </div>

              {/* Pricing */}
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex justify-between items-center">
                  <span className="text-amber-900 font-medium">Pickup Service:</span>
                  <span className="text-amber-900 font-bold text-lg">$3.99</span>
                </div>
                <p className="text-amber-700 text-sm mt-1">
                  Professional pickup and return delivery service
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-3"
                  disabled={createOrderMutation.isPending}
                  data-testid="button-book-pickup"
                >
                  {createOrderMutation.isPending ? "Booking Pickup..." : "Book Pickup - $3.99"}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}