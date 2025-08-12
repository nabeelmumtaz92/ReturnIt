import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ThumbsUp, ThumbsDown, Share } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface HelpArticleDetailProps {
  articleId: string;
}

const helpArticles = {
  "how-to-book": {
    id: "how-to-book",
    title: "How to Book a Return Pickup",
    category: "Getting Started",
    content: `
      <h3 class="text-xl font-bold text-amber-900 mb-4">Step-by-Step Guide:</h3>
      <ol class="list-decimal list-inside space-y-2 mb-6 text-amber-800">
        <li>Sign in to your Returnly account</li>
        <li>Click "Book Pickup" from the main page</li>
        <li>Enter your pickup address details</li>
        <li>Select the retailer you're returning to</li>
        <li>Choose your item categories (Electronics, Clothing, etc.)</li>
        <li>Select box size and quantity</li>
        <li>Add estimated weight for better logistics</li>
        <li>Review pricing and complete payment</li>
        <li>Receive confirmation and track your pickup</li>
      </ol>
      
      <h3 class="text-xl font-bold text-amber-900 mb-4">Pricing Structure:</h3>
      <ul class="list-disc list-inside space-y-2 mb-6 text-amber-800">
        <li><strong>Base service fee:</strong> $3.99</li>
        <li><strong>Large box:</strong> +$2.00</li>
        <li><strong>Extra Large box:</strong> +$4.00</li>
        <li><strong>Additional boxes:</strong> +$1.50 each</li>
      </ul>
      
      <div class="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
        <h4 class="font-bold text-amber-900 mb-2">💡 Pro Tips:</h4>
        <ul class="list-disc list-inside space-y-1 text-amber-800">
          <li>Use promo code RETURN50 for 50% off your first return</li>
          <li>Package items securely before pickup</li>
          <li>Be available during your selected pickup window</li>
        </ul>
      </div>
    `,
    tags: ["booking", "pickup", "pricing", "getting-started"],
    readTime: "3 min read",
    lastUpdated: "December 2024"
  },
  "track-order": {
    id: "track-order",
    title: "How to Track Your Return",
    category: "Order Management", 
    content: `
      <h3 class="text-xl font-bold text-amber-900 mb-4">Tracking Your Return:</h3>
      <ol class="list-decimal list-inside space-y-2 mb-6 text-amber-800">
        <li>Use the Track Order feature on the home page</li>
        <li>Enter your order ID or tracking number</li>
        <li>View real-time status updates</li>
        <li>Receive SMS/email notifications at each step</li>
      </ol>
      
      <h3 class="text-xl font-bold text-amber-900 mb-4">Order Status Meanings:</h3>
      <div class="space-y-3 mb-6">
        <div class="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
          <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
          <div>
            <strong class="text-blue-800">Created:</strong>
            <span class="text-blue-700 ml-2">Your pickup request has been received and is waiting to be assigned</span>
          </div>
        </div>
        <div class="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
          <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div>
            <strong class="text-yellow-800">Assigned:</strong>
            <span class="text-yellow-700 ml-2">A driver has been assigned and is on their way</span>
          </div>
        </div>
        <div class="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
          <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
          <div>
            <strong class="text-orange-800">Picked Up:</strong>
            <span class="text-orange-700 ml-2">Your item is on its way to the retailer</span>
          </div>
        </div>
        <div class="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
          <div class="w-3 h-3 bg-green-500 rounded-full"></div>
          <div>
            <strong class="text-green-800">Dropped Off:</strong>
            <span class="text-green-700 ml-2">Successfully delivered to retailer</span>
          </div>
        </div>
      </div>
    `,
    tags: ["tracking", "order-status", "pickup"],
    readTime: "2 min read", 
    lastUpdated: "December 2024"
  },
  "payment-methods": {
    id: "payment-methods",
    title: "Payment Methods & Billing",
    category: "Billing",
    content: `
      <h3 class="text-xl font-bold text-amber-900 mb-4">Accepted Payment Methods:</h3>
      <div class="grid md:grid-cols-2 gap-4 mb-6">
        <div class="space-y-2">
          <h4 class="font-semibold text-amber-800">Credit & Debit Cards:</h4>
          <ul class="list-disc list-inside space-y-1 text-amber-700">
            <li>Visa</li>
            <li>Mastercard</li>
            <li>American Express</li>
            <li>Discover</li>
          </ul>
        </div>
        <div class="space-y-2">
          <h4 class="font-semibold text-amber-800">Digital Payments:</h4>
          <ul class="list-disc list-inside space-y-1 text-amber-700">
            <li>Apple Pay</li>
            <li>Google Pay</li>
            <li>PayPal (coming soon)</li>
          </ul>
        </div>
      </div>
      
      <h3 class="text-xl font-bold text-amber-900 mb-4">Available Promo Codes:</h3>
      <div class="space-y-3 mb-6">
        <div class="p-4 bg-green-50 rounded-lg border border-green-200">
          <div class="font-bold text-green-800">RETURN50</div>
          <div class="text-green-700">50% off your first return - New customers only</div>
        </div>
        <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div class="font-bold text-blue-800">BUNDLE25</div>
          <div class="text-blue-700">$2.50 off orders over $5.00</div>
        </div>
        <div class="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div class="font-bold text-purple-800">FREESHIP</div>
          <div class="text-purple-700">Free pickup service on any order</div>
        </div>
      </div>
    `,
    tags: ["payment", "billing", "promo-codes", "discount"],
    readTime: "2 min read",
    lastUpdated: "December 2024"
  }
  // Add other articles as needed...
};

export default function HelpArticleDetail({ articleId }: HelpArticleDetailProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [helpful, setHelpful] = useState<boolean | null>(null);

  const article = helpArticles[articleId as keyof typeof helpArticles];

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-amber-900">Article Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700 mb-4">The help article you're looking for doesn't exist.</p>
            <Button
              onClick={() => setLocation('/help-center')}
              className="w-full bg-amber-700 hover:bg-amber-800 text-white"
            >
              Back to Help Center
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleHelpful = (isHelpful: boolean) => {
    setHelpful(isHelpful);
    toast({
      title: isHelpful ? "Thanks for your feedback!" : "We'll improve this article",
      description: isHelpful 
        ? "Glad we could help you out." 
        : "Your feedback helps us create better content.",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: `Check out this help article from Returnly: ${article.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Article link has been copied to clipboard.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/help-center')}
                className="text-amber-800 hover:text-amber-900"
                data-testid="button-back-help"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Help Center
              </Button>
              <img 
                src="/logo-cardboard-deep.png" 
                alt="Returnly Logo" 
                className="h-8 w-auto"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
              data-testid="button-share-article"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                {article.category}
              </Badge>
              <div className="flex items-center space-x-4 text-sm text-amber-600">
                <span>{article.readTime}</span>
                <span>Updated {article.lastUpdated}</span>
              </div>
            </div>
            <CardTitle className="text-2xl md:text-3xl text-amber-900 mb-2">
              {article.title}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              {article.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-amber max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
            
            {/* Helpful Section */}
            <div className="mt-8 pt-6 border-t border-amber-200">
              <div className="text-center">
                <p className="text-amber-800 mb-4">Was this article helpful?</p>
                <div className="flex justify-center space-x-4">
                  <Button
                    variant={helpful === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleHelpful(true)}
                    className={helpful === true 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : "border-green-300 text-green-700 hover:bg-green-50"
                    }
                    data-testid="button-helpful-yes"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Yes
                  </Button>
                  <Button
                    variant={helpful === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleHelpful(false)}
                    className={helpful === false 
                      ? "bg-red-600 hover:bg-red-700 text-white" 
                      : "border-red-300 text-red-700 hover:bg-red-50"
                    }
                    data-testid="button-helpful-no"
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    No
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}