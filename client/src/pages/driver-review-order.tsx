import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Star,
  Package,
  User,
  MapPin,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { StarRating, InteractiveStarRating } from '@/components/StarRating';
import { useAuth } from '@/hooks/useAuth-simple';
import { useLocation } from 'wouter';

interface DriverReviewFormData {
  orderId: string;
  customerRating: number;
  packageConditionRating: number;
  deliveryExperience: number;
  notes: string;
  issuesEncountered: string[];
  wouldAcceptAgain: boolean | null;
}

export default function DriverReviewOrder() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [orderId] = useState(new URLSearchParams(window.location.search).get('order') || '');
  const [formData, setFormData] = useState<DriverReviewFormData>({
    orderId,
    customerRating: 0,
    packageConditionRating: 0,
    deliveryExperience: 0,
    notes: '',
    issuesEncountered: [],
    wouldAcceptAgain: null,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not authenticated or not a driver (wait for auth to load first)
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.isDriver)) {
      setLocation('/login');
    }
  }, [authLoading, isAuthenticated, user, setLocation]);

  const { data: orderData, isLoading: orderLoading, error: orderError } = useQuery<any>({
    queryKey: [`/api/orders/${orderId}`],
    enabled: !!orderId && !!isAuthenticated && !!user?.isDriver,
  });

  // Show error if order fetch fails
  useEffect(() => {
    if (orderError) {
      toast({
        title: "Error Loading Order",
        description: "Could not load order details. Please try again.",
        variant: "destructive",
      });
    }
  }, [orderError, toast]);

  const submitReview = useMutation({
    mutationFn: async (data: DriverReviewFormData) => {
      if (!user?.id) {
        throw new Error("Driver ID not found");
      }
      if (!orderData?.userId) {
        throw new Error("Customer ID not found");
      }
      
      return await apiRequest('POST', '/api/driver-reviews', {
        orderId: data.orderId,
        driverId: user.id,
        customerId: orderData.userId,
        overallRating: data.deliveryExperience,
        customerRating: data.customerRating || undefined,
        packageConditionRating: data.packageConditionRating || undefined,
        reviewText: data.notes || undefined,
        hadIssues: data.issuesEncountered.length > 0,
        issueDescription: data.issuesEncountered.length > 0 ? data.issuesEncountered.join(', ') : undefined,
        wouldAcceptAgain: data.wouldAcceptAgain ?? undefined,
      });
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback! This helps us improve our service.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/driver/orders'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.deliveryExperience === 0) {
      toast({
        title: "Rating Required",
        description: "Please rate your delivery experience before submitting.",
        variant: "destructive",
      });
      return;
    }

    submitReview.mutate(formData);
  };

  const toggleIssue = (issue: string) => {
    setFormData(prev => ({
      ...prev,
      issuesEncountered: prev.issuesEncountered.includes(issue)
        ? prev.issuesEncountered.filter(i => i !== issue)
        : [...prev.issuesEncountered, issue]
    }));
  };

  if (!orderId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Invalid order ID. Please check your link and try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (orderLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="text-center py-8">
            <div className="animate-pulse">Loading order details...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Star className="h-6 w-6 text-primary" />
            Rate Your Delivery Experience
          </CardTitle>
          <p className="text-muted-foreground">
            Order #{orderId} • Your feedback helps improve our platform
          </p>
        </CardHeader>
      </Card>

      {/* Order Details Summary */}
      {orderData && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Pickup</p>
                  <p className="font-medium">{orderData.pickupAddress || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Dropoff</p>
                  <p className="font-medium">{orderData.dropoffAddress || 'N/A'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Delivery Experience Rating */}
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">How was your overall delivery experience?</h3>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, deliveryExperience: star }))}
                    className="p-2 hover:scale-110 transition-transform"
                    data-testid={`star-delivery-${star}`}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= formData.deliveryExperience 
                          ? 'fill-[#f99806] text-[#f99806]' 
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {formData.deliveryExperience > 0 && (
                <div className="flex justify-center">
                  <StarRating 
                    rating={formData.deliveryExperience} 
                    maxRating={5}
                    showDecimal={false}
                    size="md"
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Customer Interaction Rating */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">How would you rate the customer interaction?</Label>
              </div>
              <InteractiveStarRating
                rating={formData.customerRating}
                onRatingChange={(rating) => setFormData(prev => ({ ...prev, customerRating: rating }))}
                label=""
                size="lg"
              />
            </div>

            <Separator />

            {/* Package Condition Rating */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">Package Condition at Pickup</Label>
              </div>
              <InteractiveStarRating
                rating={formData.packageConditionRating}
                onRatingChange={(rating) => setFormData(prev => ({ ...prev, packageConditionRating: rating }))}
                label=""
                size="lg"
              />
              {formData.packageConditionRating > 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  {formData.packageConditionRating === 5 && "Excellent condition"}
                  {formData.packageConditionRating === 4 && "Good condition"}
                  {formData.packageConditionRating === 3 && "Fair condition"}
                  {formData.packageConditionRating === 2 && "Poor condition"}
                  {formData.packageConditionRating === 1 && "Very poor condition"}
                </p>
              )}
            </div>

            <Separator />

            {/* Would Accept Again */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Would you accept a delivery from this customer again?</Label>
              <div className="flex gap-4 justify-center">
                <Button
                  type="button"
                  variant={formData.wouldAcceptAgain === true ? 'default' : 'outline'}
                  onClick={() => setFormData(prev => ({ ...prev, wouldAcceptAgain: true }))}
                  className="flex items-center gap-2"
                  data-testid="button-accept-again-yes"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={formData.wouldAcceptAgain === false ? 'default' : 'outline'}
                  onClick={() => setFormData(prev => ({ ...prev, wouldAcceptAgain: false }))}
                  className="flex items-center gap-2"
                  data-testid="button-accept-again-no"
                >
                  <ThumbsDown className="h-4 w-4" />
                  No
                </Button>
              </div>
            </div>

            <Separator />

            {/* Issues Encountered */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Any issues encountered? (Optional)</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Customer not available',
                  'Wrong address',
                  'Package too heavy',
                  'Access difficulties',
                  'Weather delays',
                  'Traffic issues',
                ].map((issue) => (
                  <Button
                    key={issue}
                    type="button"
                    variant={formData.issuesEncountered.includes(issue) ? 'default' : 'outline'}
                    onClick={() => toggleIssue(issue)}
                    className="text-sm"
                    size="sm"
                    data-testid={`button-issue-${issue.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {issue}
                  </Button>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Share any additional feedback about the delivery..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
                data-testid="textarea-notes"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={formData.deliveryExperience === 0 || submitReview.isPending}
                className="min-w-[200px]"
                data-testid="button-submit-review"
              >
                {submitReview.isPending ? (
                  "Submitting..."
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Review
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Thank You Message */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6 text-center">
          <div className="space-y-2">
            <Package className="h-8 w-8 mx-auto text-primary" />
            <p className="font-medium">Your feedback matters</p>
            <p className="text-sm text-muted-foreground">
              Every review helps us improve the ReturnIt experience for drivers and customers alike.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
