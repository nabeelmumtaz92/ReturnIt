import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth-simple";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, Copy, ExternalLink } from "lucide-react";
import { Order } from "@shared/schema";
import LiveOrderTracking from "@/components/LiveOrderTracking";

// Import delivery images
import deliveryCarImg from "@assets/Delivery Driver- Box in Car_1754856749497.jpeg";
import deliveryHandoffImg from "@assets/Delivery Driver- Handoff_1754856749519.jpeg";
import deliveryOutsideImg from "@assets/Delivery Driver- outside_1754856749521.jpeg";
import deliveryReceivingImg from "@assets/Delivery Driver Receiving Box_1754856749524.jpeg";

interface OrderStatusProps {
  orderId: string;
}

export default function OrderStatus({ orderId }: OrderStatusProps) {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [trackingCopied, setTrackingCopied] = useState(false);
  
  const copyTrackingNumber = async (trackingNumber: string) => {
    try {
      await navigator.clipboard.writeText(trackingNumber);
      setTrackingCopied(true);
      toast({
        title: "Copied!",
        description: "Tracking number copied to clipboard",
      });
      setTimeout(() => setTrackingCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please manually copy the tracking number",
        variant: "destructive",
      });
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to view order status",
        variant: "destructive",
      });
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, setLocation, toast]);

  const { data: order, isLoading: orderLoading, error } = useQuery<Order>({
    queryKey: ['/api/customers/orders', orderId],
    enabled: isAuthenticated && !!orderId,
  });

  // Add state for location permission if needed for customer tracking
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'picked_up': return 'bg-amber-100 text-amber-800';
      case 'dropped_off': return 'bg-green-100 text-green-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created': return <Clock className="h-4 w-4" />;
      case 'assigned': return <Truck className="h-4 w-4" />;
      case 'picked_up': return <Package className="h-4 w-4" />;
      case 'dropped_off': return <CheckCircle className="h-4 w-4" />;
      case 'refunded': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'created': return 'Your pickup request has been received and is waiting to be assigned to a driver.';
      case 'assigned': return 'A driver has been assigned to your pickup. They will arrive soon.';
      case 'picked_up': return 'Your item has been picked up and is on its way to the retailer.';
      case 'dropped_off': return 'Your item has been successfully returned to the retailer.';
      case 'refunded': return 'Your return has been processed and refunded.';
      default: return 'Status unknown.';
    }
  };

  if (isLoading || orderLoading) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#231b0f] flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold text-foreground mx-auto mb-4 animate-pulse">
            Return It
          </div>
          <p className="text-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#231b0f] flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Order Not Found</CardTitle>
            <CardDescription>
              The order you're looking for doesn't exist or you don't have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/')} className="w-full">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Random delivery image selection for this page
  const statusPageImages = [deliveryCarImg, deliveryHandoffImg, deliveryOutsideImg, deliveryReceivingImg];
  const selectedImage = statusPageImages[Math.floor(Math.random() * statusPageImages.length)];

  return (
    <div className="min-h-screen relative">
      {/* Background Hero Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${selectedImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-white/75"></div>
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/')}
              className="text-foreground hover:text-foreground"
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Link href="/">
              <div className="text-xl font-bold text-foreground cursor-pointer hover:text-muted-foreground transition-colors">
                Return It
              </div>
            </Link>
            <span className="text-xl font-bold text-foreground">Order Status</span>
          </div>
          <div className="text-foreground text-sm">
            Welcome, {user?.firstName || user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email?.split('@')[0] || 'User'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-foreground">
              <span>Order #{order?.id || orderId}</span>
              <Badge className={getStatusColor(order?.status || 'created')}>
                {getStatusIcon(order?.status || 'created')}
                <span className="ml-2 capitalize">{order?.status?.replace('_', ' ') || 'Created'}</span>
              </Badge>
            </CardTitle>
            <CardDescription>
              Created on {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Tracking Number Display */}
            {order?.trackingNumber && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-1 flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Track Your Return
                    </h3>
                    <p className="text-blue-700 text-sm mb-3">Use this tracking number to monitor your return status</p>
                    <div className="bg-white p-3 rounded border font-mono text-lg font-bold text-blue-900 border-blue-300">
                      {order.trackingNumber}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyTrackingNumber(order.trackingNumber!)}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      data-testid="button-copy-tracking"
                    >
                      {trackingCopied ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setLocation(`/track?tracking=${order.trackingNumber}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      data-testid="button-track-order"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Track
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Status Description */}
            <div className="bg-accent p-4 rounded-lg border border-border">
              <p className="text-foreground">
                {getStatusDescription(order?.status || 'created')}
              </p>
            </div>

            {/* Order Details */}
            <div className="grid gap-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground">Pickup Address</h4>
                  <p className="text-muted-foreground">
                    {order?.pickupStreetAddress ? 
                      `${order.pickupStreetAddress}, ${order.pickupCity}, ${order.pickupState} ${order.pickupZipCode}` :
                      'Address not available'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground">Return Details</h4>
                  <p className="text-muted-foreground">
                    <strong>Retailer:</strong> {order?.retailer || 'N/A'}
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Items:</strong> {order?.itemCategory || 'N/A'}
                  </p>
                  {order?.itemDescription && (
                    <p className="text-muted-foreground">
                      <strong>Description:</strong> {order.itemDescription}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground">Service Cost</h4>
                  <p className="text-muted-foreground font-bold">${order?.totalPrice?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <Button
                onClick={() => setLocation('/book-pickup')}
                className="w-full bg-primary hover:bg-primary/90 text-white"
                data-testid="button-book-another"
              >
                Book Another Pickup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}