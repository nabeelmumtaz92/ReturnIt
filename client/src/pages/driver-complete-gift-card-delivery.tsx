import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Camera, CheckCircle, Gift, FileText, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function DriverCompleteGiftCardDelivery() {
  const [, params] = useRoute("/driver/complete-gift-card/:orderId");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [deliveryPhotosUploaded, setDeliveryPhotosUploaded] = useState(false);
  const [customerSignature, setCustomerSignature] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  // Fetch order details
  const { data: order, isLoading } = useQuery({
    queryKey: ["/api/orders", params?.orderId],
    enabled: !!params?.orderId,
  });

  // Complete gift card delivery mutation
  const completeMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", `/api/driver/orders/${params?.orderId}/complete-gift-card-delivery`, data);
    },
    onSuccess: () => {
      toast({
        title: "Gift Card Delivered Successfully",
        description: `The gift card has been delivered to the customer. Great job!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/orders"] });
      setLocation("/driver-dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error Completing Delivery",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleComplete = () => {
    // Validate delivery photos
    if (!deliveryPhotosUploaded) {
      toast({
        title: "Delivery Photos Required",
        description: "Please upload photos of the delivery for security purposes.",
        variant: "destructive",
      });
      return;
    }

    completeMutation.mutate({
      deliveryNotes,
      deliveryPhotos: photoUrls.length > 0 ? photoUrls : ["placeholder_photo_url"], // In production, use actual photo URLs
      customerSignature: customerSignature || null
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800 mx-auto"></div>
          <p className="mt-4 text-amber-800">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Order Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">The requested order could not be found.</p>
            <Link href="/driver-dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/driver-dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-amber-900 flex items-center gap-2">
            <Gift className="w-8 h-8" />
            Complete Gift Card Delivery
          </h1>
          <p className="text-gray-600 mt-2">
            Deliver the ${order.giftCardAmount?.toFixed(2)} gift card to the customer
          </p>
        </div>

        {/* Order Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-amber-900">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-semibold">#{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gift Card Amount</p>
              <p className="font-semibold text-lg text-green-600">
                ${order.giftCardAmount?.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Customer Address</p>
              <p className="font-semibold">{order.pickupAddress}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Customer Phone</p>
              <p className="font-semibold">{order.customerPhone || 'Not provided'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Completion Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-amber-900">Delivery Confirmation</CardTitle>
            <CardDescription>
              Complete the security requirements to finish the delivery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Photo Upload Section */}
            <div className="border-2 border-dashed border-amber-200 rounded-lg p-6 bg-amber-50">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="deliveryPhotos"
                  checked={deliveryPhotosUploaded}
                  onCheckedChange={(checked) => setDeliveryPhotosUploaded(checked as boolean)}
                  data-testid="checkbox-delivery-photos"
                />
                <div className="flex-1">
                  <Label htmlFor="deliveryPhotos" className="flex items-center gap-2 cursor-pointer">
                    <Camera className="w-4 h-4" />
                    <span className="font-medium">Delivery Photos Required *</span>
                  </Label>
                  <p className="text-sm text-gray-600 mt-1 ml-6">
                    Take photos showing the gift card being handed to the customer or left at their door (with customer permission)
                  </p>
                  <div className="mt-3 ml-6">
                    <p className="text-xs text-amber-800 font-medium">
                      📸 Required photos:
                    </p>
                    <ul className="text-xs text-gray-600 mt-1 space-y-1 ml-4">
                      <li>• Photo of customer receiving gift card OR gift card at doorstep</li>
                      <li>• Photo of delivery location/address number</li>
                      <li>• Any additional proof of delivery</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Signature (Optional) */}
            <div>
              <Label htmlFor="customerSignature">Customer Signature/Name (Optional)</Label>
              <Input
                id="customerSignature"
                placeholder="Customer's printed name or signature confirmation"
                value={customerSignature}
                onChange={(e) => setCustomerSignature(e.target.value)}
                className="mt-1"
                data-testid="input-customer-signature"
              />
              <p className="text-xs text-gray-500 mt-1">
                If customer is available, ask them to confirm receipt by providing their name
              </p>
            </div>

            {/* Delivery Notes */}
            <div>
              <Label htmlFor="deliveryNotes">Delivery Notes</Label>
              <Textarea
                id="deliveryNotes"
                placeholder="Any additional details about the delivery (e.g., 'Handed directly to customer', 'Left at front door per customer request', etc.)"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                rows={4}
                className="mt-1"
                data-testid="textarea-delivery-notes"
              />
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Security Requirements</p>
                  <p>
                    Photos are required to protect both you and the customer. This ensures accountability 
                    and provides proof of delivery in case of any disputes.
                  </p>
                </div>
              </div>
            </div>

            {/* Complete Button */}
            <Button
              onClick={handleComplete}
              disabled={!deliveryPhotosUploaded || completeMutation.isPending}
              className="w-full bg-amber-800 hover:bg-amber-900 text-white"
              size="lg"
              data-testid="button-complete-delivery"
            >
              {completeMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Gift className="w-5 h-5 mr-2" />
                  Complete Gift Card Delivery
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
