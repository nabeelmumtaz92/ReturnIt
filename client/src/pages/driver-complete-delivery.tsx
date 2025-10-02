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
import { AlertTriangle, CheckCircle, CreditCard, Gift, FileText } from "lucide-react";

export default function DriverCompleteDelivery() {
  const [, params] = useRoute("/driver/complete/:orderId");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [photosUploaded, setPhotosUploaded] = useState(false);
  const [refundMethod, setRefundMethod] = useState("original_payment");
  const [refundAmount, setRefundAmount] = useState("");
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [hasPhysicalGiftCard, setHasPhysicalGiftCard] = useState(false);

  // Fetch order details
  const { data: order, isLoading } = useQuery({
    queryKey: ["/api/orders", params?.orderId],
    enabled: !!params?.orderId,
  });

  // Complete delivery mutation
  const completeMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", `/api/driver/orders/${params?.orderId}/complete`, data);
    },
    onSuccess: (data) => {
      const isGiftCard = data.giftCardDelivery?.status === 'pending';
      
      toast({
        title: "Delivery Completed Successfully",
        description: isGiftCard 
          ? `Retailer issued a gift card. You must deliver it to the customer within 1-2 business days.`
          : `Customer refund of $${data.refund?.amount?.toFixed(2) || 0} has been processed.`,
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
    if (!deliveryNotes.trim()) {
      toast({
        title: "Delivery Notes Required",
        description: "Please provide delivery notes before completing.",
        variant: "destructive",
      });
      return;
    }

    if (hasPhysicalGiftCard && !photosUploaded) {
      toast({
        title: "Photo Required",
        description: "Please upload photos of the gift card before completing.",
        variant: "destructive",
      });
      return;
    }

    const customRefundAmount = isCustomAmount ? parseFloat(refundAmount) : undefined;
    
    completeMutation.mutate({
      deliveryNotes,
      photosUploaded,
      refundMethod,
      customRefundAmount,
      refundReason: "return_delivered",
      hasPhysicalGiftCard
      // Note: giftCardDeliveryFee is determined server-side for security
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-red-600">Order Not Found</h2>
            <Button onClick={() => setLocation("/driver-dashboard")} className="mt-4">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fullRefundAmount = order.totalPrice || 0;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Complete Delivery</h1>
        <p className="text-gray-600 mt-2">Order #{order.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-500">Retailer</Label>
                <p className="font-semibold">{order.retailer}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Items</Label>
                <p>{order.numberOfItems} × {order.itemSize} {order.itemDescription}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Customer Paid</Label>
                <p className="text-lg font-bold text-green-600">${fullRefundAmount.toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Pickup Address</Label>
                <p className="text-sm">{order.pickupStreetAddress}, {order.pickupCity}, {order.pickupState}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Return Address</Label>
                <p className="text-sm">{order.returnAddress || "Store Location"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Completion Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Complete Delivery
            </CardTitle>
            <CardDescription>
              Confirm delivery and process customer refund
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Delivery Notes */}
            <div>
              <Label htmlFor="deliveryNotes">Delivery Notes *</Label>
              <Textarea
                id="deliveryNotes"
                placeholder="Delivered to retailer customer service desk. Staff member confirmed receipt."
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="min-h-[80px]"
                data-testid="textarea-delivery-notes"
              />
            </div>

            {/* Photo Confirmation */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="photosUploaded"
                checked={photosUploaded}
                onCheckedChange={setPhotosUploaded}
                data-testid="checkbox-photos-uploaded"
              />
              <Label htmlFor="photosUploaded" className="text-sm">
                Delivery photos uploaded
              </Label>
            </div>

            {/* Refund Method */}
            <div>
              <Label className="text-base font-semibold">Customer Refund Method</Label>
              <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <div>
                    <p className="font-medium">Original Payment Method</p>
                    <p className="text-sm text-gray-500">Refund to customer's card/account (5-10 business days)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Physical Gift Card Handling */}
            <div className="border-t pt-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="hasPhysicalGiftCard"
                  checked={hasPhysicalGiftCard}
                  onCheckedChange={(checked) => setHasPhysicalGiftCard(checked as boolean)}
                  data-testid="checkbox-physical-gift-card"
                />
                <div className="flex-1">
                  <Label htmlFor="hasPhysicalGiftCard" className="flex items-center gap-2 cursor-pointer">
                    <Gift className="w-4 h-4" />
                    <span className="font-medium">Retailer issued physical gift card</span>
                  </Label>
                  <p className="text-sm text-gray-500 mt-1 ml-6">
                    I will deliver the gift card back to the customer (+$3.99 delivery fee charged to customer)
                  </p>
                  {hasPhysicalGiftCard && (
                    <div className="mt-2 ml-6 p-3 bg-yellow-50 rounded border border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        <strong>Important:</strong> You must photograph the gift card and complete a second delivery to return it to the customer. 
                        Customer will be charged an additional $3.99 delivery fee.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Refund Amount */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="customAmount"
                  checked={isCustomAmount}
                  onCheckedChange={setIsCustomAmount}
                  data-testid="checkbox-custom-amount"
                />
                <Label htmlFor="customAmount" className="text-sm">
                  Custom refund amount
                </Label>
              </div>
              
              {isCustomAmount && (
                <div>
                  <Label htmlFor="refundAmount">Refund Amount</Label>
                  <Input
                    id="refundAmount"
                    type="number"
                    step="0.01"
                    max={fullRefundAmount}
                    placeholder={`Max: $${fullRefundAmount.toFixed(2)}`}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    data-testid="input-refund-amount"
                  />
                </div>
              )}
              
              {!isCustomAmount && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-green-800 font-medium">
                    Full Refund: ${fullRefundAmount.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={() => setLocation("/driver-dashboard")}
          data-testid="button-cancel"
        >
          Cancel
        </Button>
        
        <Button
          onClick={handleComplete}
          disabled={completeMutation.isPending || !deliveryNotes.trim()}
          className="min-w-[200px]"
          data-testid="button-complete-delivery"
        >
          {completeMutation.isPending ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            "Complete Delivery & Process Refund"
          )}
        </Button>
      </div>

      {/* Warning Notice */}
      <Card className="mt-6 border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800">Important</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Completing this delivery will automatically process the customer refund and cannot be undone. 
                Ensure all information is correct before proceeding.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}