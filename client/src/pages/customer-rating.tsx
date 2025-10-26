import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Star,
  Package,
  Truck,
  MessageCircle,
  Clock,
  CheckCircle,
  Camera,
  ThumbsUp,
  ThumbsDown,
  Smartphone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { StarRating, InteractiveStarRating } from '@/components/StarRating';

interface RatingFormData {
  orderId: string;
  overallRating: number;
  serviceRating: number;
  timelinessRating: number;
  communicationRating: number;
  reviewText: string;
  wouldRecommend: boolean | null;
  appRating: number;
  appReviewText: string;
}


export default function CustomerRating() {
  const [orderId] = useState(new URLSearchParams(window.location.search).get('order') || '');
  const [formData, setFormData] = useState<RatingFormData>({
    orderId,
    overallRating: 0,
    serviceRating: 0,
    timelinessRating: 0,
    communicationRating: 0,
    reviewText: '',
    wouldRecommend: null,
    appRating: 0,
    appReviewText: '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitRating = useMutation({
    mutationFn: async (data: RatingFormData) => {
      const reviews = [];
      
      if (data.overallRating > 0) {
        reviews.push(
          apiRequest('POST', '/api/reviews', {
            orderId: data.orderId,
            overallRating: data.overallRating,
            serviceRating: data.serviceRating,
            timelinessRating: data.timelinessRating,
            communicationRating: data.communicationRating,
            reviewText: data.reviewText,
            wouldRecommend: data.wouldRecommend,
          })
        );
      }
      
      if (data.appRating > 0) {
        reviews.push(
          apiRequest('POST', '/api/app-reviews', {
            rating: data.appRating,
            comment: data.appReviewText,
          })
        );
      }
      
      return await Promise.all(reviews);
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback! It helps us improve our service.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
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
    
    if (formData.overallRating === 0 && formData.appRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide at least one rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    submitRating.mutate(formData);
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Rate Your Delivery Experience
          </CardTitle>
          <p className="text-gray-600">
            Order #{orderId} • Your feedback helps us improve
          </p>
        </CardHeader>
      </Card>

      {/* Rating Form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Overall Rating */}
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">How would you rate your overall experience?</h3>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, overallRating: star }))}
                    className="p-2 hover:scale-110 transition-transform"
                    data-testid={`star-overall-${star}`}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= formData.overallRating 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {formData.overallRating > 0 && (
                <Badge variant="secondary">
                  {formData.overallRating === 5 ? 'Excellent' : 
                   formData.overallRating === 4 ? 'Very Good' : 
                   formData.overallRating === 3 ? 'Good' : 
                   formData.overallRating === 2 ? 'Fair' : 'Poor'}
                </Badge>
              )}
            </div>

            {/* Detailed Ratings */}
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-lg font-semibold">Rate specific aspects:</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InteractiveStarRating
                  rating={formData.serviceRating}
                  onRatingChange={(rating) => setFormData(prev => ({ ...prev, serviceRating: rating }))}
                  label="Service Quality"
                />
                
                <InteractiveStarRating
                  rating={formData.timelinessRating}
                  onRatingChange={(rating) => setFormData(prev => ({ ...prev, timelinessRating: rating }))}
                  label="Timeliness"
                />
                
                <InteractiveStarRating
                  rating={formData.communicationRating}
                  onRatingChange={(rating) => setFormData(prev => ({ ...prev, communicationRating: rating }))}
                  label="Communication"
                />
              </div>
            </div>

            {/* Recommendation */}
            <div className="space-y-4 border-t pt-6">
              <Label className="text-lg font-semibold">Would you recommend Return It to others?</Label>
              <div className="flex gap-4 justify-center">
                <Button
                  type="button"
                  variant={formData.wouldRecommend === true ? 'default' : 'outline'}
                  onClick={() => setFormData(prev => ({ ...prev, wouldRecommend: true }))}
                  className="flex items-center gap-2"
                  data-testid="button-recommend-yes"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={formData.wouldRecommend === false ? 'default' : 'outline'}
                  onClick={() => setFormData(prev => ({ ...prev, wouldRecommend: false }))}
                  className="flex items-center gap-2"
                  data-testid="button-recommend-no"
                >
                  <ThumbsDown className="h-4 w-4" />
                  No
                </Button>
              </div>
            </div>

            {/* Written Review */}
            <div className="space-y-2">
              <Label htmlFor="review">Tell us more about your experience (optional)</Label>
              <Textarea
                id="review"
                placeholder="Share details about your experience, what went well, or areas for improvement..."
                value={formData.reviewText}
                onChange={(e) => setFormData(prev => ({ ...prev, reviewText: e.target.value }))}
                rows={4}
                data-testid="textarea-review"
              />
            </div>

            <Separator className="my-8" />

            {/* Return It App Review */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Rate the Return It App</h3>
                  <p className="text-sm text-muted-foreground">
                    How would you rate your overall experience with the Return It platform?
                  </p>
                </div>
              </div>

              <div className="flex justify-center py-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, appRating: star }))}
                    className="p-2 hover:scale-110 transition-transform"
                    data-testid={`star-app-${star}`}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= formData.appRating 
                          ? 'fill-[#f99806] text-[#f99806]' 
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {formData.appRating > 0 && (
                <div className="flex justify-center">
                  <StarRating 
                    rating={formData.appRating} 
                    maxRating={5}
                    showDecimal={false}
                    size="md"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="appReview">Share your thoughts about the app (optional)</Label>
                <Textarea
                  id="appReview"
                  placeholder="What did you like? What could be improved? Your feedback helps us make Return It better..."
                  value={formData.appReviewText}
                  onChange={(e) => setFormData(prev => ({ ...prev, appReviewText: e.target.value }))}
                  rows={3}
                  data-testid="textarea-app-review"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={(formData.overallRating === 0 && formData.appRating === 0) || submitRating.isPending}
                className="min-w-[200px]"
                data-testid="button-submit-review"
              >
                {submitRating.isPending ? (
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
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6 text-center">
          <div className="space-y-2">
            <MessageCircle className="h-8 w-8 mx-auto text-blue-600" />
            <p className="font-medium text-blue-900">Your feedback matters</p>
            <p className="text-sm text-blue-700">
              Every review helps us improve our service and helps other customers make informed decisions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}