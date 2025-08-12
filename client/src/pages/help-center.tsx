import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { 
  Search, 
  ArrowLeft, 
  HelpCircle, 
  Package, 
  CreditCard, 
  Truck, 
  User, 
  Shield,
  Clock,
  MapPin,
  Phone,
  Mail,
  MessageCircle
} from "lucide-react";

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
}

const helpArticles: HelpArticle[] = [
  {
    id: "how-to-book",
    title: "How to Book a Return Pickup",
    category: "Getting Started",
    content: `
      <h3>Step-by-Step Guide:</h3>
      <ol>
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
      
      <h3>Pricing:</h3>
      <ul>
        <li>Base service fee: $3.99</li>
        <li>Large box: +$2.00</li>
        <li>Extra Large box: +$4.00</li>
        <li>Additional boxes: +$1.50 each</li>
      </ul>
    `,
    tags: ["booking", "pickup", "pricing", "getting-started"]
  },
  {
    id: "track-order",
    title: "How to Track Your Return",
    category: "Order Management",
    content: `
      <h3>Tracking Your Return:</h3>
      <ol>
        <li>Use the Track Order feature on the home page</li>
        <li>Enter your order ID or tracking number</li>
        <li>View real-time status updates</li>
      </ol>
      
      <h3>Order Statuses:</h3>
      <ul>
        <li><strong>Created:</strong> Your pickup request has been received</li>
        <li><strong>Assigned:</strong> A driver has been assigned to your pickup</li>
        <li><strong>Picked Up:</strong> Your item is on its way to the retailer</li>
        <li><strong>Dropped Off:</strong> Successfully returned to retailer</li>
        <li><strong>Refunded:</strong> Return processed and refunded</li>
      </ul>
    `,
    tags: ["tracking", "order-status", "pickup"]
  },
  {
    id: "payment-methods",
    title: "Payment Methods & Billing",
    category: "Billing",
    content: `
      <h3>Accepted Payment Methods:</h3>
      <ul>
        <li>Credit Cards (Visa, Mastercard, American Express)</li>
        <li>Debit Cards</li>
        <li>Apple Pay</li>
        <li>Google Pay</li>
        <li>PayPal (coming soon)</li>
      </ul>
      
      <h3>Promo Codes:</h3>
      <p>Enter promo codes during checkout to receive discounts:</p>
      <ul>
        <li><strong>RETURN50:</strong> 50% off your first return</li>
        <li><strong>BUNDLE25:</strong> $2.50 off orders over $5</li>
        <li><strong>FREESHIP:</strong> Free delivery on any order</li>
      </ul>
    `,
    tags: ["payment", "billing", "promo-codes", "discount"]
  },
  {
    id: "driver-program",
    title: "Become a Returnly Driver",
    category: "Driver Portal",
    content: `
      <h3>Driver Requirements:</h3>
      <ul>
        <li>Valid driver's license and insurance</li>
        <li>Reliable vehicle</li>
        <li>Smartphone for the driver app</li>
        <li>Background check (we'll help with this)</li>
      </ul>
      
      <h3>Earnings:</h3>
      <ul>
        <li>70% of service fee goes to drivers</li>
        <li>Instant pay available</li>
        <li>Weekly earnings summary</li>
        <li>Bonus opportunities for large packages</li>
        <li>Peak season bonuses</li>
      </ul>
      
      <h3>Getting Started:</h3>
      <ol>
        <li>Complete driver onboarding</li>
        <li>Upload required documents</li>
        <li>Pass background check</li>
        <li>Start accepting pickup requests</li>
      </ol>
    `,
    tags: ["driver", "earnings", "requirements", "onboarding"]
  },
  {
    id: "supported-retailers",
    title: "Supported Retailers",
    category: "Returns",
    content: `
      <h3>Partner Retailers (500+):</h3>
      <p>We work with major retailers including:</p>
      <ul>
        <li>Amazon</li>
        <li>Target</li>
        <li>Best Buy</li>
        <li>Walmart</li>
        <li>Macy's</li>
        <li>Nordstrom</li>
        <li>Home Depot</li>
        <li>And many more local and national retailers</li>
      </ul>
      
      <h3>Return Policies:</h3>
      <p>Each retailer has their own return policy. We'll help ensure your items meet the requirements before pickup.</p>
    `,
    tags: ["retailers", "partners", "returns", "policies"]
  },
  {
    id: "troubleshooting",
    title: "Common Issues & Solutions",
    category: "Support",
    content: `
      <h3>Login Issues:</h3>
      <ul>
        <li>Reset your password if you can't sign in</li>
        <li>Clear browser cache and cookies</li>
        <li>Try signing in with Google if available</li>
      </ul>
      
      <h3>Pickup Issues:</h3>
      <ul>
        <li>Ensure someone is available at pickup location</li>
        <li>Have items packaged and ready</li>
        <li>Contact driver if running late</li>
      </ul>
      
      <h3>Payment Issues:</h3>
      <ul>
        <li>Verify card information is correct</li>
        <li>Check if card has sufficient funds</li>
        <li>Try a different payment method</li>
      </ul>
    `,
    tags: ["troubleshooting", "issues", "problems", "solutions"]
  }
];

export default function HelpCenter() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(helpArticles.map(article => article.category))];

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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
                onClick={() => setLocation('/')}
                className="text-amber-800 hover:text-amber-900"
                data-testid="button-back-home"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <img 
                src="/logo-cardboard-deep.png" 
                alt="Returnly Logo" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-amber-900">Help Center</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search and Categories */}
        <div className="mb-8">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-900">
                <HelpCircle className="h-6 w-6 mr-2" />
                How can we help you?
              </CardTitle>
              <CardDescription>
                Search our knowledge base or browse by category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-amber-600" />
                <Input
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/90 border-amber-300 focus:border-amber-500"
                  data-testid="input-help-search"
                />
              </div>
              
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category 
                      ? "bg-amber-700 hover:bg-amber-800 text-white" 
                      : "border-amber-300 text-amber-700 hover:bg-amber-50"
                    }
                    data-testid={`button-category-${category.toLowerCase().replace(' ', '-')}`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Articles */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map(article => (
            <Card key={article.id} className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                    {article.category}
                  </Badge>
                </div>
                <CardTitle className="text-amber-900 text-lg">
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="text-amber-700 text-sm line-clamp-3 mb-4"
                  dangerouslySetInnerHTML={{ 
                    __html: article.content.replace(/<[^>]*>/g, ' ').substring(0, 150) + '...' 
                  }}
                />
                <div className="flex flex-wrap gap-1 mb-3">
                  {article.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation(`/help-center/${article.id}`)}
                  className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                  data-testid={`button-article-${article.id}`}
                >
                  Read Article
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-12">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-amber-900">Still Need Help?</CardTitle>
              <CardDescription>
                Our support team is here to assist you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-amber-50 rounded-lg">
                  <Phone className="h-6 w-6 text-amber-700" />
                  <div>
                    <div className="font-medium text-amber-900">Call Us</div>
                    <div className="text-sm text-amber-700">(636) 254-4821</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-amber-50 rounded-lg">
                  <Mail className="h-6 w-6 text-amber-700" />
                  <div>
                    <div className="font-medium text-amber-900">Email</div>
                    <div className="text-sm text-amber-700">support@returnly.com</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-amber-50 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-amber-700" />
                  <div>
                    <div className="font-medium text-amber-900">Live Chat</div>
                    <div className="text-sm text-amber-700">Available 8 AM - 8 PM CST</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}