import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Gift, DollarSign, CheckCircle, AlertCircle } from "lucide-react";
import Header from "@/components/Header";

export default function RefundPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [refundPreference, setRefundPreference] = useState(user?.customerRefundPreference || "original_payment");

  // Update refund preference mutation
  const updateMutation = useMutation({
    mutationFn: async (preference: string) => {
      return apiRequest("PATCH", "/api/user/refund-preferences", { 
        customerRefundPreference: preference 
      });
    },
    onSuccess: () => {
      toast({
        title: "Preferences Updated",
        description: "Your refund preferences have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(refundPreference);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Header />
      
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Refund Preferences</h1>
          <p className="text-gray-600 mt-2">Choose how you'd like to receive refunds for your returns</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Current Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Store Credit Balance</Label>
                  <p className="text-2xl font-bold text-green-600">
                    ${(user?.storeCreditBalance || 0).toFixed(2)}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Default Refund Method</Label>
                  <p className="font-semibold capitalize">
                    {(user?.customerRefundPreference || "original_payment").replace("_", " ")}
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
                  <p className="text-sm text-blue-800">
                    When your return is completed by our driver, your refund will be processed 
                    according to your preferred method. You can change this at any time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Refund Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Refund Method</CardTitle>
              <CardDescription>
                Select how you'd like to receive refunds for future returns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={refundPreference}
                onValueChange={setRefundPreference}
              >
                {/* Original Payment Method */}
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem 
                    value="original_payment" 
                    id="original_payment" 
                    className="mt-1"
                    data-testid="radio-original-payment"
                  />
                  <Label htmlFor="original_payment" className="flex-1 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Original Payment Method</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Refund to your original credit card or bank account
                        </p>
                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                          <AlertCircle className="w-3 h-3" />
                          <span>Takes 5-10 business days</span>
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>

                {/* Store Credit */}
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem 
                    value="store_credit" 
                    id="store_credit" 
                    className="mt-1"
                    data-testid="radio-store-credit"
                  />
                  <Label htmlFor="store_credit" className="flex-1 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <Gift className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Store Credit</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Instant credit added to your ReturnIt account for future orders
                        </p>
                        <div className="mt-2 flex items-center gap-1 text-xs text-green-600 font-medium">
                          <CheckCircle className="w-3 h-3" />
                          <span>Instant - available immediately</span>
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending || refundPreference === user?.customerRefundPreference}
                className="w-full"
                data-testid="button-save-preferences"
              >
                {updateMutation.isPending ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  "Save Preferences"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Information Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* How Refunds Work */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How Refunds Work</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                <div>
                  <h4 className="font-semibold">Return Pickup</h4>
                  <p className="text-sm text-gray-600">Our driver picks up your return items</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                <div>
                  <h4 className="font-semibold">Delivery to Retailer</h4>
                  <p className="text-sm text-gray-600">Items are delivered to the store</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                <div>
                  <h4 className="font-semibold">Automatic Refund</h4>
                  <p className="text-sm text-gray-600">Your refund is processed automatically</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Store Credit Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Store Credit Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Instant availability</span>
              </div>
              
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Use for any future ReturnIt service</span>
              </div>
              
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Never expires</span>
              </div>
              
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Easy to track in your account</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}