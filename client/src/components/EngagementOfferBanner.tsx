import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Gift, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface PartnerOffer {
  id: number;
  brand: string;
  title: string;
  description: string;
  couponCode: string | null;
  affiliateLink: string;
  imageUrl: string | null;
  discountPercentage: number | null;
  category: string | null;
}

interface PendingOffer {
  promptId: number;
  orderId: string;
  sentAt: string;
  offer: PartnerOffer;
}

export function EngagementOfferBanner() {
  const [dismissed, setDismissed] = useState<number[]>([]);
  const trackedViewsRef = useRef<Set<number>>(new Set());

  // Fetch pending offers
  const { data: offers, isLoading } = useQuery<PendingOffer[]>({
    queryKey: ['/api/engagement/offers/pending'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Track view mutation
  const trackViewMutation = useMutation({
    mutationFn: async (promptId: number) => {
      return apiRequest('POST', '/api/engagement/track/view', { promptId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/engagement/offers/pending'] });
    },
  });

  // Track click mutation
  const trackClickMutation = useMutation({
    mutationFn: async (promptId: number) => {
      return apiRequest('POST', '/api/engagement/track/click', { promptId });
    },
  });

  const handleView = (promptId: number) => {
    trackViewMutation.mutate(promptId);
  };

  const handleClick = (promptId: number, affiliateLink: string) => {
    // Track click
    trackClickMutation.mutate(promptId);
    
    // Open affiliate link in new tab (secure)
    window.open(affiliateLink, '_blank', 'noopener,noreferrer');
  };

  const handleDismiss = (promptId: number) => {
    // Track as viewed when dismissed
    trackViewMutation.mutate(promptId);
    setDismissed([...dismissed, promptId]);
  };

  if (isLoading || !offers || offers.length === 0) {
    return null;
  }

  // Filter out dismissed offers
  const visibleOffers = offers.filter((o: PendingOffer) => !dismissed.includes(o.promptId));

  if (visibleOffers.length === 0) {
    return null;
  }

  // Show only the first offer
  const pendingOffer = visibleOffers[0];
  const { offer, promptId } = pendingOffer;

  // Auto-track view when banner is displayed (useEffect to prevent duplicate calls)
  useEffect(() => {
    // Guard: Only track if we haven't tracked this prompt before
    if (trackedViewsRef.current.has(promptId)) {
      return;
    }

    // Schedule view tracking after 1 second (user has seen it)
    const timeoutId = setTimeout(() => {
      trackedViewsRef.current.add(promptId);
      handleView(promptId);
    }, 1000);

    // Cleanup: Cancel timeout if component unmounts or promptId changes
    return () => {
      clearTimeout(timeoutId);
    };
  }, [promptId]); // Only re-run if promptId changes

  return (
    <Card 
      className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent mb-6"
      data-testid={`offer-banner-${promptId}`}
    >
      <CardHeader className="relative pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Special Offer
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDismiss(promptId)}
            className="h-8 w-8 p-0"
            data-testid="button-dismiss-offer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle className="text-xl" data-testid="text-offer-title">
          {offer.title}
        </CardTitle>
        <CardDescription data-testid="text-offer-brand">
          Exclusive offer from {offer.brand}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          {offer.imageUrl && (
            <img
              src={offer.imageUrl}
              alt={offer.title}
              className="w-24 h-24 object-cover rounded-md"
              data-testid="img-offer-image"
            />
          )}
          
          <div className="flex-1 space-y-2">
            {offer.description && (
              <p className="text-sm text-muted-foreground" data-testid="text-offer-description">
                {offer.description}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-2">
              {offer.discountPercentage && (
                <Badge variant="default" className="bg-green-600" data-testid="badge-discount">
                  {offer.discountPercentage}% OFF
                </Badge>
              )}
              
              {offer.couponCode && (
                <Badge variant="outline" className="font-mono" data-testid="badge-coupon-code">
                  CODE: {offer.couponCode}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <Button
          onClick={() => handleClick(promptId, offer.affiliateLink)}
          className="w-full"
          size="lg"
          data-testid="button-claim-offer"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Claim This Offer
        </Button>
        
        <p className="text-xs text-center text-muted-foreground">
          Thank you for using Return It! Enjoy this exclusive partner offer.
        </p>
      </CardContent>
    </Card>
  );
}
