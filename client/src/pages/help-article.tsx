import { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown, 
  Clock, 
  User, 
  Calendar,
  Share,
  Bookmark,
  CheckCircle,
  Star,
  MessageCircle,
  Phone,
  Mail
} from "lucide-react";

export default function HelpArticle() {
  const [match] = useRoute('/help-article/:articleId');
  const articleId = match?.articleId || '';
  
  const [hasVoted, setHasVoted] = useState(false);
  const [voteType, setVoteType] = useState<'up' | 'down' | null>(null);
  const [bookmarked, setBookmarked] = useState(false);

  // Article content database - in a real app this would come from an API
  const articleContent: Record<string, any> = {
    'how-to-book-return': {
      title: "How to Book a Return Pickup",
      category: "Getting Started",
      readTime: "3 min",
      lastUpdated: "2024-01-15",
      author: "Returnly Support Team",
      popularity: 98,
      content: `
# How to Book a Return Pickup

Booking a return pickup with Returnly is quick and easy! Follow this step-by-step guide to schedule your first pickup.

## Prerequisites
- A Returnly account (sign up at returnly.com)
- Items ready for return with original packaging when possible
- Return receipt or order information from the retailer

## Step 1: Start Your Booking
1. **Log into your account** at returnly.com or open the mobile app
2. **Click "Book Pickup"** on the main dashboard
3. **Select your pickup address** from saved addresses or add a new one

## Step 2: Package Information
- **Retailer**: Select where you're returning items (Amazon, Target, Best Buy, etc.)
- **Item Category**: Choose the type of items (Electronics, Clothing, etc.)
- **Box Size**: Select Small, Medium, Large, or Extra Large
- **Number of Boxes**: Enter how many packages you have
- **Description**: Add any special notes about your items

## Step 3: Schedule Pickup
- **Date**: Choose your preferred pickup date (same-day available in most areas)
- **Time Window**: Select a 2-hour window that works for you
- **Special Instructions**: Add gate codes, building access, or location details

## Step 4: Review and Pay
- Review your pickup details and pricing breakdown
- **Pricing includes**: Base fee ($3.99) + distance + size upcharge if applicable
- Add payment method (cards, Apple Pay, Google Pay accepted)
- **Tip**: You can add a tip for your driver (optional but appreciated!)

## Step 5: Confirmation
- You'll receive an email and SMS confirmation immediately
- Track your pickup status in real-time through the app
- Get notified when your driver is assigned and on the way

## What Happens Next?
1. **Driver Assignment**: A verified driver will accept your pickup
2. **Pickup**: Driver arrives during your chosen time window
3. **Transport**: Your items are safely transported to the return location
4. **Confirmation**: You'll receive confirmation when items are delivered

## Pricing Breakdown
- **Base Fee**: $3.99 (covers up to 5 miles)
- **Distance**: $0.50 per additional mile
- **Size Upcharges**: Large +$2, Extra Large +$4
- **Multiple Boxes**: $1.50 per additional box
- **Rush Fee**: +$3 for same-day pickup
- **Service Fee**: 15% of subtotal

## Tips for Success
- **Package items securely** - use original boxes when possible
- **Be available** during your selected time window
- **Provide accurate descriptions** to help with pricing
- **Include return labels** if provided by the retailer
- **Take photos** of items for your records

## Need Help?
If you run into any issues during booking:
- **Live Chat**: Available 8 AM - 8 PM CST
- **Phone**: (314) 555-0123
- **Email**: support@returnly.com

## Related Articles
- [Understanding Returnly Pricing](/help-article/pricing-guide)
- [Track Your Return Order](/help-article/tracking-order)
- [Service Areas & Availability](/help-article/service-areas)
      `,
      relatedArticles: ['pricing-guide', 'tracking-order', 'service-areas'],
      tags: ['booking', 'pickup', 'getting-started', 'tutorial', 'first-time']
    },
    'pricing-guide': {
      title: "Understanding Returnly Pricing",
      category: "Pricing & Payment",
      readTime: "4 min",
      lastUpdated: "2024-01-10",
      author: "Returnly Support Team",
      popularity: 94,
      content: `
# Understanding Returnly Pricing

Our transparent pricing model is designed to be fair and predictable. Here's exactly how we calculate your pickup costs.

## Base Pricing Structure

### Base Service Fee: $3.99
Every pickup starts with a $3.99 base fee that covers:
- Driver assignment and coordination
- Up to 5 miles of travel
- Basic handling and transport
- Insurance coverage up to $100

### Distance Charges: $0.50 per mile
Beyond the included 5 miles, we charge $0.50 per additional mile based on:
- **Distance calculated**: Pickup location to return destination
- **Round-trip pricing**: Driver's return journey is included
- **Efficient routing**: We optimize routes to minimize costs

## Size-Based Pricing

### Small Packages (S) - No upcharge
- Fits in a shoebox or smaller
- Weight up to 5 lbs
- Examples: Books, small electronics, jewelry

### Medium Packages (M) - No upcharge
- Standard shipping box size
- Weight up to 15 lbs
- Examples: Clothing, shoes, small home goods

### Large Packages (L) - +$2.00 upcharge
- Large shipping box or multiple small items
- Weight up to 35 lbs
- Examples: Small appliances, multiple clothing items

### Extra Large (XL) - +$4.00 upcharge
- Very large or heavy items
- Weight up to 50 lbs
- Examples: Large electronics, furniture pieces

## Additional Fees

### Multiple Boxes: +$1.50 per additional box
- First box included in base price
- Each additional box adds $1.50
- Maximum 4 boxes per pickup

### Rush Service: +$3.00
- Same-day pickup requests
- Based on driver availability
- Available in most service areas

### Service Fee: 15% of subtotal
- Applied to subtotal before tip
- Covers platform operations
- Payment processing costs

## Example Pricing Calculations

### Example 1: Simple Return
- Base fee: $3.99
- Distance: 3 miles (included)
- Size: Medium (no upcharge)
- Service fee: 15% × $3.99 = $0.60
- **Total: $4.59**

### Example 2: Multiple Items
- Base fee: $3.99
- Distance: 8 miles ($1.50 extra)
- Size: Large (+$2.00)
- Additional boxes: 2 extra (+$3.00)
- Subtotal: $10.49
- Service fee: 15% × $10.49 = $1.57
- **Total: $12.06**

### Example 3: Rush Delivery
- Base fee: $3.99
- Distance: 12 miles ($3.50 extra)
- Size: Extra Large (+$4.00)
- Rush service: +$3.00
- Subtotal: $14.49
- Service fee: 15% × $14.49 = $2.17
- **Total: $16.66**

## Ways to Save Money

### Bundle Returns
- Combine multiple returns into one pickup
- Save on multiple base fees
- Use larger box sizes efficiently

### Plan Ahead
- Avoid rush fees by booking 24+ hours in advance
- Choose flexible time windows for better rates

### Optimize Packaging
- Use appropriately sized boxes
- Consolidate when possible
- Don't overpack to avoid size upcharges

### Promotional Codes
- New customer discount: 20% off first pickup
- Referral bonus: $5 off when friends sign up
- Seasonal promotions available

## Payment Methods
We accept all major payment methods:
- **Credit/Debit Cards**: Visa, MasterCard, American Express
- **Digital Wallets**: Apple Pay, Google Pay, PayPal
- **Business Accounts**: Net-30 terms available for high-volume customers

## Refund Policy
- **Full refund** if pickup is cancelled 2+ hours in advance
- **50% refund** if cancelled within 2 hours
- **No refund** for completed pickups
- Issues with service quality may qualify for partial refunds

## Questions About Pricing?
Our support team can help clarify any charges:
- **Live Chat**: Instant pricing estimates
- **Phone**: (314) 555-0123
- **Email**: billing@returnly.com
      `,
      relatedArticles: ['how-to-book-return', 'promo-codes', 'payment-methods'],
      tags: ['pricing', 'fees', 'cost', 'payment', 'billing', 'transparent']
    }
    // Add more articles as needed
  };

  const article = articleContent[articleId];

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-amber-900 mb-2">Article Not Found</h2>
            <p className="text-amber-700 mb-4">The help article you're looking for doesn't exist.</p>
            <Link href="/help-center">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Help Center
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleVote = (type: 'up' | 'down') => {
    setVoteType(type);
    setHasVoted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/help-center">
            <Button variant="outline" className="mb-4" data-testid="button-back-help-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Help Center
            </Button>
          </Link>
        </div>

        {/* Article Header */}
        <Card className="mb-8 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Badge variant="outline" className="mb-3">
                  {article.category}
                </Badge>
                <h1 className="text-3xl font-bold text-amber-900 mb-3 leading-tight">
                  {article.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{article.readTime} read</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Updated {new Date(article.lastUpdated).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{article.popularity}% helpful</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBookmarked(!bookmarked)}
                  className={bookmarked ? 'bg-amber-50 border-amber-300 text-amber-700' : ''}
                  data-testid="button-bookmark-article"
                >
                  <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="outline" size="sm" data-testid="button-share-article">
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Article Content */}
        <Card className="mb-8 bg-white shadow-sm">
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: article.content
                    .split('\n')
                    .map((line: string) => {
                      if (line.startsWith('# ')) {
                        return `<h1 class="text-2xl font-bold text-amber-900 mt-8 mb-4">${line.substring(2)}</h1>`;
                      } else if (line.startsWith('## ')) {
                        return `<h2 class="text-xl font-semibold text-amber-800 mt-6 mb-3">${line.substring(3)}</h2>`;
                      } else if (line.startsWith('### ')) {
                        return `<h3 class="text-lg font-medium text-amber-700 mt-4 mb-2">${line.substring(4)}</h3>`;
                      } else if (line.startsWith('- ')) {
                        return `<li class="text-gray-700 ml-4">${line.substring(2)}</li>`;
                      } else if (line.trim() === '') {
                        return '<br />';
                      } else {
                        return `<p class="text-gray-700 mb-3 leading-relaxed">${line}</p>`;
                      }
                    })
                    .join('')
                }} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Article Feedback */}
        <Card className="mb-8 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-amber-900 mb-4">Was this article helpful?</h3>
              
              {!hasVoted ? (
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={() => handleVote('up')}
                    variant="outline"
                    className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300"
                    data-testid="button-vote-helpful"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Yes, helpful
                  </Button>
                  <Button
                    onClick={() => handleVote('down')}
                    variant="outline"
                    className="flex items-center gap-2 hover:bg-red-50 hover:border-red-300"
                    data-testid="button-vote-not-helpful"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    Not helpful
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-700">Thank you for your feedback!</span>
                  </div>
                  {voteType === 'down' && (
                    <p className="text-sm text-gray-600 mb-4">
                      Help us improve this article by contacting our support team with specific feedback.
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Related Articles */}
        {article.relatedArticles && article.relatedArticles.length > 0 && (
          <Card className="mb-8 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-amber-900">Related Articles</CardTitle>
              <CardDescription>Other articles that might help you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {article.relatedArticles.map((relatedId: string) => {
                  const related = articleContent[relatedId];
                  if (!related) return null;
                  
                  return (
                    <Link key={relatedId} href={`/help-article/${relatedId}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardContent className="p-4">
                          <Badge variant="secondary" className="mb-2 text-xs">
                            {related.category}
                          </Badge>
                          <h4 className="font-semibold text-amber-900 mb-2">{related.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{related.readTime}</span>
                            <span>•</span>
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>{related.popularity}% helpful</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Support */}
        <Card className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Still need help?</h3>
              <p className="text-amber-100 mb-4">Our support team is ready to assist you 24/7</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="bg-white text-amber-600 hover:bg-amber-50" data-testid="button-article-live-chat">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Live Chat
                </Button>
                <Button className="bg-white text-amber-600 hover:bg-amber-50" data-testid="button-article-call">
                  <Phone className="h-4 w-4 mr-2" />
                  Call (314) 555-0123
                </Button>
                <Button className="bg-white text-amber-600 hover:bg-amber-50" data-testid="button-article-email">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}