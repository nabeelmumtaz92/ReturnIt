import { useState, useRef } from "react";
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
import { AlertTriangle, CheckCircle, CreditCard, Gift, FileText, Camera, Upload, X } from "lucide-react";

export default function DriverCompleteDelivery() {
  const [, params] = useRoute("/driver/complete/:orderId");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [photos, setPhotos] = useState<Array<{url: string, file?: File}>>([]);
  const [refundMethod, setRefundMethod] = useState("original_payment");
  const [refundAmount, setRefundAmount] = useState("");
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [hasPhysicalGiftCard, setHasPhysicalGiftCard] = useState(false);
  const [giftCardAmount, setGiftCardAmount] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    if (hasPhysicalGiftCard) {
      if (photos.length === 0) {
        toast({
          title: "Photo Required",
          description: "Please upload photos of the gift card before completing.",
          variant: "destructive",
        });
        return;
      }
      
      const cardAmount = parseFloat(giftCardAmount);
      if (!giftCardAmount || isNaN(cardAmount) || cardAmount <= 0) {
        toast({
          title: "Gift Card Amount Required",
          description: "Please enter the gift card amount shown on the card.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // TODO: Upload photos to server if needed
    // For now, we just track that photos were taken

    const customRefundAmount = isCustomAmount ? parseFloat(refundAmount) : undefined;
    
    completeMutation.mutate({
      deliveryNotes,
      photosUploaded: photos.length > 0,
      refundMethod,
      customRefundAmount,
      refundReason: "return_delivered",
      hasPhysicalGiftCard,
      giftCardAmount: hasPhysicalGiftCard ? parseFloat(giftCardAmount) : undefined
      // Note: giftCardDeliveryFee is determined server-side for security
    });
  };

  // Camera functions
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      setStream(mediaStream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to take photos.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const photoUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPhotos(prev => [...prev, { url: photoUrl }]);
        stopCamera();
        toast({
          title: "Photo Captured",
          description: `Photo ${photos.length + 1} added successfully.`,
        });
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setPhotos(prev => [...prev, { url: event.target!.result as string, file }]);
          }
        };
        reader.readAsDataURL(file);
      });
      toast({
        title: "Photos Added",
        description: `${files.length} photo(s) uploaded successfully.`,
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
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

            {/* Package Verification Photos */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Package Verification Photos</Label>
              <p className="text-xs text-muted-foreground">Take or upload photos of the package for verification</p>
              
              {/* Photo Preview Grid */}
              {photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={photo.url} 
                        alt={`Package photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-border"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Camera View */}
              {showCamera && (
                <div className="relative">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline
                    className="w-full rounded-lg border border-border"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="flex gap-2 mt-2">
                    <Button 
                      onClick={capturePhoto}
                      className="flex-1"
                      type="button"
                      data-testid="button-capture-photo"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Photo
                    </Button>
                    <Button 
                      onClick={stopCamera}
                      variant="outline"
                      type="button"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Camera/Upload Buttons */}
              {!showCamera && (
                <div className="flex gap-2">
                  <Button 
                    onClick={startCamera}
                    variant="outline"
                    className="flex-1"
                    type="button"
                    data-testid="button-open-camera"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="flex-1"
                    type="button"
                    data-testid="button-upload-photo"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photos
                  </Button>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {photos.length} photo(s) added {photos.length > 0 && '✓'}
              </p>
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
                  onCheckedChange={(checked) => {
                    setHasPhysicalGiftCard(checked as boolean);
                    if (!checked) setGiftCardAmount(""); // Clear amount when unchecked
                  }}
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
                    <div className="mt-3 ml-6 space-y-3">
                      {/* Gift Card Amount Input */}
                      <div>
                        <Label htmlFor="giftCardAmount" className="text-sm font-medium">
                          Gift Card Amount *
                        </Label>
                        <Input
                          id="giftCardAmount"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Enter amount shown on card (e.g., 45.00)"
                          value={giftCardAmount}
                          onChange={(e) => setGiftCardAmount(e.target.value)}
                          className="mt-1"
                          data-testid="input-gift-card-amount"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter the exact dollar amount shown on the retailer's gift card
                        </p>
                      </div>
                      
                      {/* Warning Banner */}
                      <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                          <strong>Required:</strong> Take photos of the gift card (front & back) and complete a second delivery to the customer. 
                          Customer will be charged $3.99 delivery fee.
                        </p>
                      </div>
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