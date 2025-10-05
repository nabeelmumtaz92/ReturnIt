import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Camera, CheckCircle, Gift, ArrowLeft, Upload, X, Image as ImageIcon } from "lucide-react";
import { Link } from "wouter";

export default function DriverCompleteGiftCardDelivery() {
  const [, params] = useRoute("/driver/complete-gift-card/:orderId");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [customerSignature, setCustomerSignature] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

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

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    
    // Limit to 5 photos total
    const currentPhotosCount = photoFiles.length;
    const remainingSlots = 5 - currentPhotosCount;
    
    if (fileArray.length > remainingSlots) {
      toast({
        title: "Photo Limit Reached",
        description: `You can upload up to 5 photos total. You have ${remainingSlots} slots remaining.`,
        variant: "destructive",
      });
      return;
    }

    // Validate file sizes (max 10MB each)
    const oversizedFiles = fileArray.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File Too Large",
        description: "Each photo must be under 10MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview URLs for images
    const newPreviewUrls: string[] = [];
    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviewUrls.push(reader.result as string);
        if (newPreviewUrls.length === fileArray.length) {
          setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
        }
      };
      reader.readAsDataURL(file);
    });

    setPhotoFiles(prev => [...prev, ...fileArray]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleComplete = async () => {
    // Validate delivery photos - require at least 2 photos
    if (photoFiles.length < 2) {
      toast({
        title: "More Photos Required",
        description: "Please upload at least 2 delivery proof photos (customer receiving gift card + address/location).",
        variant: "destructive",
      });
      return;
    }

    // Convert photos to base64 data URLs for storage
    const photoDataUrls: string[] = [];
    
    for (const file of photoFiles) {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      photoDataUrls.push(dataUrl);
    }

    completeMutation.mutate({
      deliveryNotes,
      deliveryPhotos: photoDataUrls,
      customerSignature: customerSignature || null
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-transparent to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-transparent to-white flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-b from-transparent to-white">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/driver-dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Gift className="w-8 h-8" />
            Complete Gift Card Delivery
          </h1>
          <p className="text-gray-600 mt-2">
            Deliver the ${((order as any).giftCardAmount || 0).toFixed(2)} gift card to the customer
          </p>
        </div>

        {/* Order Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-foreground">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-semibold">#{(order as any).id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gift Card Amount</p>
              <p className="font-semibold text-lg text-green-600">
                ${((order as any).giftCardAmount || 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Customer Address</p>
              <p className="font-semibold">{(order as any).pickupAddress || (order as any).pickupStreetAddress || 'Not available'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Customer Phone</p>
              <p className="font-semibold">{(order as any).customerPhone || 'Not provided'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Completion Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Delivery Confirmation</CardTitle>
            <CardDescription>
              Complete the security requirements to finish the delivery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Photo Upload Section */}
            <div className="border-2 border-dashed border-border rounded-lg p-6 bg-accent">
              <div className="flex items-start gap-3 mb-4">
                <Camera className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <Label className="text-base font-semibold text-foreground">
                    Delivery Photos Required * (Minimum 2)
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Take photos showing proof of delivery
                  </p>
                  <div className="mt-2">
                    <p className="text-xs text-foreground font-medium mb-1">
                      📸 Required photos:
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1 ml-4">
                      <li>• Customer receiving gift card OR gift card at doorstep</li>
                      <li>• Delivery location/address number</li>
                      <li>• Any additional proof of delivery (optional)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Photo Upload Button */}
              <div className="mt-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  onChange={handlePhotoSelect}
                  className="hidden"
                  data-testid="input-photo-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-border hover:bg-accent"
                  disabled={photoFiles.length >= 5}
                  data-testid="button-upload-photo"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {photoFiles.length === 0 ? "Upload Delivery Photos" : `Add More Photos (${photoFiles.length}/5)`}
                </Button>
              </div>

              {/* Photo Previews */}
              {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Delivery proof ${index + 1}`}
                        className="w-full h-32 object-cover rounded border border-border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePhoto(index)}
                        data-testid={`button-remove-photo-${index}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                        Photo {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Photo Count Status */}
              {photoFiles.length > 0 && (
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      {photoFiles.length} photo{photoFiles.length !== 1 ? 's' : ''} uploaded
                    </span>
                  </div>
                  {photoFiles.length < 2 && (
                    <span className="text-xs text-muted-foreground">
                      Upload at least {2 - photoFiles.length} more
                    </span>
                  )}
                </div>
              )}
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
              disabled={photoFiles.length < 2 || completeMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
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
                  {photoFiles.length < 2 && ` (${photoFiles.length}/2 photos)`}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
