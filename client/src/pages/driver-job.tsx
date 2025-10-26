import { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, Phone, ArrowLeft, Navigation, Package, Star, Loader2 } from "lucide-react";
import { calculatePaymentWithValue, getItemSizeByValue } from "@shared/paymentCalculator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// API helper function
const apiRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }
  
  return response.json();
};

interface StatusBadgeProps {
  label: string;
  active?: boolean;
}

function StatusBadge({ label, active }: StatusBadgeProps) {
  return (
    <Badge 
      variant={active ? "default" : "secondary"}
      className={active ? "bg-primary text-white" : "bg-accent text-foreground"}
    >
      {label}
    </Badge>
  );
}

export default function DriverJob() {
  const params = useParams();
  const jobId = params.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch job data from API
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['/api/driver/orders', jobId],
    queryFn: () => apiRequest(`/api/orders/${jobId}`),
    enabled: !!jobId,
  });
  
  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      return apiRequest(`/api/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/driver/orders', jobId] });
      toast({
        title: "Status Updated",
        description: "Order status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      });
    },
  });
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-transparent to-accent flex items-center justify-center">
        <div className="flex items-center gap-2 text-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading job details...</span>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-transparent to-accent flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Job Not Found</h2>
          <p className="text-red-600 mb-4">
            {error instanceof Error ? error.message : 'The requested job could not be found.'}
          </p>
          <Link href="/driver-portal">
            <Button className="bg-primary hover:bg-primary/90">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Driver Portal
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Extract job data and format for compatibility
  const formattedJob = {
    id: job.id,
    customer: { 
      name: job.customerName || 'Customer', 
      phone: job.customerPhone || job.phone || '(555) 000-0000' 
    },
    pickup: job.pickupAddress,
    retailer: job.companyInfo?.name || job.company || 'Store',
    miles: job.estimatedDistance || 5.0,
    minutes: job.estimatedTime || 15,
    itemValue: job.itemValue || job.totalPrice || 50.00,
    numberOfItems: job.numberOfItems || 1,
    rush: job.isPriority || job.rush || false,
    notes: job.notes || '',
  };

  const fareCalculation = useMemo(() => {
    const paymentRouteInfo = {
      distance: formattedJob.miles,
      estimatedTime: formattedJob.minutes / 60, // Convert minutes to hours for calculation
    };

    return calculatePaymentWithValue(
      paymentRouteInfo,
      formattedJob.itemValue,
      formattedJob.numberOfItems,
      formattedJob.rush,
      0 // tip
    );
  }, [formattedJob]);

  const detectedSize = useMemo(() => getItemSizeByValue(formattedJob.itemValue), [formattedJob.itemValue]);

  const mapsQuery = useMemo(() => {
    const origin = encodeURIComponent(formattedJob.pickup);
    const dest = encodeURIComponent(formattedJob.retailer);
    return {
      google: `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`,
      embed: `https://www.google.com/maps?q=${dest}&output=embed`
    };
  }, [formattedJob]);
  
  const handleStatusUpdate = (newStatus: string) => {
    statusMutation.mutate({ orderId: job.id, status: newStatus });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-transparent to-accent">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/driver-portal">
                <Button variant="ghost" size="sm" className="text-foreground">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground">Job #{formattedJob.id}</h1>
                <p className="text-sm text-muted-foreground">{formattedJob.retailer.split(',')[0]}</p>
              </div>
            </div>
            <StatusBadge 
              label={job.status.replace('_', ' ').toUpperCase()} 
              active 
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Earnings Summary */}
        <Card className="bg-white/90 backdrop-blur-sm border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Your Earnings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-emerald-800">
                  ${fareCalculation.driverTotalEarning.toFixed(2)}
                </div>
                <div className="text-sm text-emerald-600 font-medium">Total Earnings</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">{formattedJob.miles.toFixed(1)} mi</div>
                <div className="text-sm text-primary">Distance</div>
                <div className="text-xs text-green-600 mt-1">+${fareCalculation.driverDistancePay.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">{formattedJob.minutes} min</div>
                <div className="text-sm text-primary">Time</div>
                <div className="text-xs text-green-600 mt-1">+${fareCalculation.driverTimePay.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">Size {detectedSize}</div>
                <div className="text-sm text-primary">Category</div>
                <div className="text-xs text-green-600 mt-1">
                  +${fareCalculation.driverSizeBonus.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge label={`${formattedJob.numberOfItems} item${formattedJob.numberOfItems > 1 ? 's' : ''}`} />
              <StatusBadge label={formattedJob.rush ? 'Rush Order' : 'Standard'} />
              <StatusBadge label={`Customer pays $${fareCalculation.totalPrice.toFixed(2)}`} />
              <StatusBadge label="Base: $3.00" />
            </div>
          </CardContent>
        </Card>

        {/* Job Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Addresses & Customer */}
          <Card className="bg-white/90 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Job Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Pickup Address</h3>
                <p className="text-sm text-muted-foreground">{formattedJob.pickup}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-1">Drop-off (Retailer)</h3>
                <p className="text-sm text-muted-foreground">{formattedJob.retailer}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-1">Customer</h3>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{formattedJob.customer.name}</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-foreground border-border"
                    asChild
                  >
                    <a href={`tel:${formattedJob.customer.phone}`}>
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </a>
                  </Button>
                </div>
                <p className="text-xs text-primary">{formattedJob.customer.phone}</p>
              </div>

              {formattedJob.notes && (
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Special Instructions</h3>
                  <p className="text-sm text-muted-foreground bg-[#f8f7f5] dark:bg-[#231b0f] p-3 rounded-lg border border-border">
                    {formattedJob.notes}
                  </p>
                </div>
              )}

              <div className="pt-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    asChild
                    data-testid="button-navigate-google"
                  >
                    <a 
                      href={mapsQuery.google} 
                      target="_blank" 
                      rel="noreferrer"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Google Maps
                    </a>
                  </Button>
                  <Button 
                    className="w-full bg-gray-800 hover:bg-gray-900 text-white"
                    asChild
                    data-testid="button-navigate-apple"
                    onClick={() => {
                      const pickupEncoded = encodeURIComponent(formattedJob.pickup);
                      const storeEncoded = encodeURIComponent(formattedJob.retailer);
                      if (/(iPhone|iPad|iPod|Macintosh)/i.test(navigator.userAgent)) {
                        window.location.href = `maps://maps.apple.com/?saddr=${pickupEncoded}&daddr=${storeEncoded}`;
                      } else {
                        window.open(mapsQuery.google, '_blank');
                      }
                    }}
                  >
                    <a>
                      <Navigation className="h-4 w-4 mr-2" />
                      Apple Maps
                    </a>
                  </Button>
                </div>
                <div className="text-xs text-center text-muted-foreground">
                  Route: {formattedJob.pickup.split(',')[0]} → {formattedJob.retailer.split(',')[0]}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map Preview */}
          <Card className="bg-white/90 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Route Preview</CardTitle>
              <CardDescription>
                Embedded map for quick reference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden border border-border">
                <iframe
                  title="Route Map"
                  src={mapsQuery.embed}
                  className="w-full h-64"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <p className="text-xs text-primary mt-2">
                Tap "Open in Google Maps" above for turn-by-turn navigation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Proof of Purchase Photos - CRITICAL for driver verification */}
        {(job.customerReceiptPhotoUrl || job.customerTagsPhotoUrl || job.customerPackagingPhotoUrl) && (
          <Card className="bg-white/90 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Customer Proof of Purchase</span>
              </CardTitle>
              <CardDescription>
                Customer-provided photos for retailer verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {job.customerReceiptPhotoUrl && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground">📄 Receipt / Order Confirmation</h4>
                    <div className="relative group">
                      <img 
                        src={job.customerReceiptPhotoUrl} 
                        alt="Receipt or Order Confirmation" 
                        className="w-full h-48 object-cover rounded-lg border-2 border-border hover:border-primary transition-colors cursor-pointer"
                        onClick={() => window.open(job.customerReceiptPhotoUrl, '_blank')}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">Click to enlarge</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {job.customerTagsPhotoUrl && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground">🏷️ Original Tags Attached</h4>
                    <div className="relative group">
                      <img 
                        src={job.customerTagsPhotoUrl} 
                        alt="Original Tags" 
                        className="w-full h-48 object-cover rounded-lg border-2 border-border hover:border-primary transition-colors cursor-pointer"
                        onClick={() => window.open(job.customerTagsPhotoUrl, '_blank')}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">Click to enlarge</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {job.customerPackagingPhotoUrl && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground">📦 Original Packaging</h4>
                    <div className="relative group">
                      <img 
                        src={job.customerPackagingPhotoUrl} 
                        alt="Original Packaging" 
                        className="w-full h-48 object-cover rounded-lg border-2 border-border hover:border-primary transition-colors cursor-pointer"
                        onClick={() => window.open(job.customerPackagingPhotoUrl, '_blank')}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">Click to enlarge</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700 rounded-lg">
                <p className="text-sm text-amber-900 dark:text-amber-100">
                  <strong>Important:</strong> These photos serve as proof of purchase for the retailer. Present them if the retailer requests verification during drop-off.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Update Actions */}
        <Card className="bg-white/90 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Update Job Status</span>
            </CardTitle>
            <CardDescription>
              Track your progress through the delivery workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {job.status === 'assigned' && (
                <Button 
                  onClick={() => handleStatusUpdate('pickup_confirmed')}
                  disabled={statusMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {statusMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Package className="h-4 w-4 mr-2" />
                  )}
                  Mark as Picked Up
                </Button>
              )}
              
              {job.status === 'pickup_confirmed' && (
                <Button 
                  onClick={() => handleStatusUpdate('dropped_off')}
                  disabled={statusMutation.isPending}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {statusMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4 mr-2" />
                  )}
                  Mark as Dropped Off
                </Button>
              )}
              
              {job.status === 'dropped_off' && (
                <Button 
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={statusMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {statusMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Star className="h-4 w-4 mr-2" />
                  )}
                  Complete & Submit
                </Button>
              )}
              
              {job.status === 'completed' && (
                <div className="flex items-center space-x-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                  <Star className="h-5 w-5" />
                  <span className="font-semibold">Job completed! Earnings processing...</span>
                </div>
              )}
            </div>

            {job.status !== 'completed' && (
              <div className="mt-3 text-sm text-primary">
                <p>Current status: <span className="font-semibold capitalize">{job.status.replace('_', ' ')}</span></p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}