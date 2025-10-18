import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocation, Link } from "wouter";
import Footer from "@/components/Footer";
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
  MessageCircle,
  ChevronRight,
  Star,
  BookOpen,
  FileText,
  Settings,
  AlertCircle,
  TrendingUp,
  Users,
  Calendar
} from "lucide-react";

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  readTime: string;
  popularity: number;
}

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const categories = [
    { id: "getting-started", name: "Getting Started", icon: HelpCircle, color: "bg-blue-500", count: 8 },
    { id: "order-management", name: "Order Management", icon: Package, color: "bg-green-500", count: 12 },
    { id: "pricing-payment", name: "Pricing & Payment", icon: CreditCard, color: "bg-purple-500", count: 6 },
    { id: "for-drivers", name: "For Drivers", icon: Truck, color: "bg-amber-600", count: 15 },
    { id: "account-settings", name: "Account & Settings", icon: User, color: "bg-red-500", count: 9 },
    { id: "policies", name: "Policies", icon: Shield, color: "bg-gray-500", count: 7 }
  ];

  // Comprehensive help articles database
  const helpArticles: HelpArticle[] = [
    // Getting Started
    {
      id: "how-to-book-return",
      title: "How to Book a Return Pickup",
      category: "Getting Started",
      readTime: "3 min",
      popularity: 98,
      content: "Complete step-by-step guide for booking your first return pickup with Returnly. Learn about package requirements, pickup scheduling, pricing breakdown, and payment options.",
      tags: ["booking", "pickup", "getting-started", "tutorial", "first-time"]
    },
    {
      id: "service-areas",
      title: "Service Areas & Availability",
      category: "Getting Started", 
      readTime: "2 min",
      popularity: 85,
      content: "Find out if Returnly services your area. Complete coverage map for St. Louis metro area including pickup and delivery zones.",
      tags: ["service-area", "coverage", "availability", "location"]
    },
    {
      id: "account-setup",
      title: "Creating Your Returnly Account",
      category: "Getting Started",
      readTime: "2 min", 
      popularity: 92,
      content: "Quick guide to setting up your Returnly account, adding payment methods, and configuring notification preferences.",
      tags: ["account", "setup", "registration", "profile"]
    },
    {
      id: "mobile-app-guide",
      title: "Using the Returnly Mobile App",
      category: "Getting Started",
      readTime: "4 min",
      popularity: 76,
      content: "Complete guide to downloading and using the Returnly mobile app for iOS and Android. Features, navigation, and pro tips.",
      tags: ["mobile-app", "ios", "android", "app-guide"]
    },

    // Order Management
    {
      id: "tracking-order",
      title: "Track Your Return Order",
      category: "Order Management",
      readTime: "2 min",
      popularity: 95,
      content: "Learn how to track your return from booking to delivery with real-time updates, status explanations, and troubleshooting tips for tracking issues.",
      tags: ["tracking", "status", "delivery", "updates", "real-time"]
    },
    {
      id: "modify-cancel-order",
      title: "Modify or Cancel Your Order",
      category: "Order Management",
      readTime: "3 min",
      popularity: 88,
      content: "How to change pickup times, addresses, or cancel your return pickup. Cancellation policies and fees explained.",
      tags: ["modify", "cancel", "reschedule", "change"]
    },
    {
      id: "delivery-issues",
      title: "Delivery Problems & Solutions",
      category: "Order Management",
      readTime: "4 min",
      popularity: 72,
      content: "What to do when packages are delayed, damaged, or lost. Step-by-step resolution process and how to file claims.",
      tags: ["problems", "issues", "delayed", "damaged", "lost"]
    },
    {
      id: "multiple-packages",
      title: "Handling Multiple Package Returns",
      category: "Order Management",
      readTime: "3 min",
      popularity: 83,
      content: "Best practices for returning multiple packages in one pickup. Consolidation tips, pricing optimization, and organization strategies.",
      tags: ["multiple-packages", "bulk", "consolidation", "optimization"]
    },

    // Pricing & Payment
    {
      id: "pricing-guide",
      title: "Understanding Returnly Pricing",
      category: "Pricing & Payment",
      readTime: "4 min",
      popularity: 94,
      content: "Comprehensive breakdown of our transparent pricing model including base fees, distance charges, size upcharges, rush fees, and money-saving tips.",
      tags: ["pricing", "fees", "cost", "payment", "billing", "transparent"]
    },
    {
      id: "payment-methods",
      title: "Accepted Payment Methods",
      category: "Pricing & Payment", 
      readTime: "2 min",
      popularity: 79,
      content: "All accepted payment options including credit cards, debit cards, Apple Pay, Google Pay, and PayPal. Security and billing information.",
      tags: ["payment", "methods", "cards", "apple-pay", "paypal"]
    },
    {
      id: "promo-codes",
      title: "Promo Codes & Discounts",
      category: "Pricing & Payment",
      readTime: "2 min",
      popularity: 91,
      content: "Current promotional codes, how to apply discounts, and ways to save money on your returns. Special offers for new and repeat customers.",
      tags: ["promo-codes", "discounts", "savings", "offers", "coupons"]
    },
    {
      id: "refunds-billing",
      title: "Refunds & Billing Questions",
      category: "Pricing & Payment",
      readTime: "3 min",
      popularity: 68,
      content: "Understanding our refund policy, how to request refunds, billing dispute resolution, and receipt information for business expenses.",
      tags: ["refunds", "billing", "disputes", "receipts", "business-expenses"]
    },

    // For Drivers
    {
      id: "driver-faq",
      title: "Driver FAQ - Frequently Asked Questions", 
      category: "For Drivers",
      readTime: "6 min",
      popularity: 89,
      content: "Comprehensive FAQ for Returnly drivers covering requirements, earnings, schedules, app usage, customer interaction, payments, and support resources.",
      tags: ["driver", "faq", "earnings", "requirements", "schedule", "comprehensive"]
    },
    {
      id: "driver-requirements",
      title: "Driver Requirements & Application",
      category: "For Drivers",
      readTime: "4 min", 
      popularity: 86,
      content: "Complete list of requirements to become a Returnly driver. Application process, background checks, vehicle standards, and approval timeline.",
      tags: ["driver", "requirements", "application", "background-check", "vehicle"]
    },
    {
      id: "driver-payments",
      title: "Driver Payment Structure & Earnings",
      category: "For Drivers",
      readTime: "5 min",
      popularity: 93,
      content: "Detailed breakdown of driver earnings including base pay, mileage, time bonuses, tips, and instant payout options. Tax information included.",
      tags: ["driver", "payments", "earnings", "payouts", "taxes", "1099"]
    },
    {
      id: "driver-app-guide",
      title: "Driver App Tutorial & Features",
      category: "For Drivers",
      readTime: "4 min",
      popularity: 81,
      content: "Complete guide to using the Returnly driver app. From going online to completing deliveries, navigation, customer communication, and earnings tracking.",
      tags: ["driver", "app", "tutorial", "features", "navigation"]
    },
    {
      id: "driver-safety",
      title: "Driver Safety & Support",
      category: "For Drivers",
      readTime: "3 min",
      popularity: 78,
      content: "Safety protocols, emergency procedures, customer interaction guidelines, and 24/7 support resources for drivers.",
      tags: ["driver", "safety", "emergency", "support", "protocols"]
    },

    // Account & Settings  
    {
      id: "account-management",
      title: "Managing Your Account Settings",
      category: "Account & Settings",
      readTime: "3 min",
      popularity: 75,
      content: "How to update personal information, change passwords, manage notification preferences, and configure account security settings.",
      tags: ["account", "settings", "profile", "security", "notifications"]
    },
    {
      id: "notification-settings",
      title: "Email & SMS Notification Settings",
      category: "Account & Settings",
      readTime: "2 min",
      popularity: 82,
      content: "Customize your notification preferences for order updates, promotional offers, and driver communications via email and SMS.",
      tags: ["notifications", "email", "sms", "preferences", "communications"]
    },
    {
      id: "privacy-security",
      title: "Privacy & Security Information",
      category: "Account & Settings", 
      readTime: "4 min",
      popularity: 71,
      content: "Information about data privacy, security measures, account protection, and how your personal information is handled and protected.",
      tags: ["privacy", "security", "data-protection", "account-safety"]
    },

    // Policies
    {
      id: "return-policies",
      title: "Return Policies & Guidelines",
      category: "Policies",
      readTime: "5 min",
      popularity: 87,
      content: "Complete guide to our return policies including accepted items, prohibited materials, size restrictions, service areas, and quality standards.",
      tags: ["policies", "guidelines", "restrictions", "terms", "prohibited-items"]
    },
    {
      id: "terms-of-service",
      title: "Terms of Service",
      category: "Policies",
      readTime: "8 min",
      popularity: 45,
      content: "Complete terms of service including user responsibilities, liability limits, dispute resolution, and legal agreements.",
      tags: ["terms", "legal", "liability", "agreements", "responsibilities"]
    },
    {
      id: "privacy-policy",
      title: "Privacy Policy",
      category: "Policies",
      readTime: "6 min", 
      popularity: 52,
      content: "Detailed privacy policy explaining data collection, usage, sharing, and your privacy rights when using Returnly services.",
      tags: ["privacy", "data-collection", "rights", "policy"]
    },

    // Support
    {
      id: "contact-support",
      title: "Contact Customer Support",
      category: "Support",
      readTime: "2 min",
      popularity: 96,
      content: "Multiple ways to reach our 24/7 support team including live chat, phone, email, and self-service options. Response times and contact information.",
      tags: ["support", "contact", "help", "customer-service", "24-7"]
    },
    {
      id: "troubleshooting",
      title: "Common Issues & Troubleshooting",
      category: "Support",
      readTime: "5 min",
      popularity: 84,
      content: "Solutions to common problems including app issues, booking problems, payment failures, and driver communication issues.",
      tags: ["troubleshooting", "problems", "solutions", "common-issues", "fixes"]
    }
  ];

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === null || 
      article.category.toLowerCase().replace(/\s+/g, '-').replace('&', '') === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Sort by popularity for better user experience
  const sortedArticles = filteredArticles.sort((a, b) => b.popularity - a.popularity);

  const popularArticles = helpArticles
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 6);

  return (
    <div className="min-h-screen relative">
      {/* Navigation Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild className="text-foreground hover:text-foreground">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
              <Link href="/">
                <div className="text-xl font-bold text-foreground cursor-pointer">
                  Return It
                </div>
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Help Center</h1>
            </div>
          </div>
        </div>
      </header>
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-img-enhanced"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/5025639/pexels-photo-5025639.jpeg?auto=compress&cs=tinysrgb&w=5120&h=3413&dpr=3&fit=crop&crop=center&q=100)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div className="absolute inset-0 bg-white/85"></div>
      <div className="relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Help Center</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to your questions about Returnly's return pickup service
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-primary" />
            <Input
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-3 text-lg border-border focus:border-border"
              data-testid="input-help-search"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              {sortedArticles.length} result{sortedArticles.length !== 1 ? 's' : ''} found for "{searchQuery}"
            </p>
          )}
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <Card 
                  key={category.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    isSelected ? 'ring-2 ring-amber-400 bg-[#f8f7f5] dark:bg-[#231b0f]' : 'hover:bg-[#f8f7f5] dark:bg-[#231b0f]'
                  }`}
                  onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                  data-testid={`category-${category.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${category.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.count} articles</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {selectedCategory && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => setSelectedCategory(null)}
                className="border-border text-muted-foreground hover:bg-[#f8f7f5] dark:bg-[#231b0f]"
                data-testid="button-clear-category"
              >
                Clear Category Filter
              </Button>
            </div>
          )}
        </div>

        {/* Popular Articles */}
        {!searchQuery && !selectedCategory && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Most Popular Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularArticles.map((article, index) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow bg-white">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary" className="bg-accent text-foreground mb-2">
                        {article.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600">#{index + 1}</span>
                      </div>
                    </div>
                    <CardTitle className="text-foreground leading-tight">{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 mb-4 line-clamp-2">{article.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{article.readTime}</span>
                      </div>
                      <Link href={`/help-article/${article.id}`}>
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-white" data-testid={`button-read-${article.id}`}>
                          Read Article
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Articles / Search Results */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {searchQuery ? 'Search Results' : selectedCategory ? `${categories.find(c => c.id === selectedCategory)?.name} Articles` : 'All Help Articles'}
          </h2>
          
          {sortedArticles.length === 0 ? (
            <Card className="bg-white">
              <CardContent className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No articles found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? `No articles match "${searchQuery}"` : 'No articles in this category'}
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                  }}
                  className="bg-primary hover:bg-primary/90 text-white"
                  data-testid="button-clear-search"
                >
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedArticles.map((article) => (
                <Card key={article.id} className="bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {article.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {article.readTime}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Star className="h-3 w-3 text-yellow-500" />
                            {article.popularity}% helpful
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">{article.title}</h3>
                        <p className="text-gray-600 mb-3">{article.content}</p>
                        <div className="flex flex-wrap gap-1">
                          {article.tags.slice(0, 4).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                              {tag}
                            </Badge>
                          ))}
                          {article.tags.length > 4 && (
                            <span className="text-xs text-gray-400">+{article.tags.length - 4} more</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link href={`/help-article/${article.id}`}>
                          <Button className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white" data-testid={`button-view-${article.id}`}>
                            <BookOpen className="h-4 w-4 mr-2" />
                            Read Article
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Contact Support Section */}
        <Card className="bg-gradient-to-r from-primary to-primary text-white">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Still Need Help?</h2>
              <p className="text-primary-foreground">Our support team is available 24/7 to assist you</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white/10 backdrop-blur border-0">
                <CardContent className="p-4 text-center">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Live Chat</h3>
                  <p className="text-sm text-primary-foreground mb-3">Instant support available</p>
                  <Button className="w-full bg-white text-muted-foreground hover:bg-[#f8f7f5] dark:bg-[#231b0f]" data-testid="button-live-chat-support">
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur border-0">
                <CardContent className="p-4 text-center">
                  <Phone className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Phone Support</h3>
                  <p className="text-sm text-primary-foreground mb-3">(636) 254-4821</p>
                  <a href="tel:6362544821">
                    <Button className="w-full bg-white text-muted-foreground hover:bg-[#f8f7f5] dark:bg-[#231b0f]" data-testid="button-call-support">
                      Call Specialist
                    </Button>
                  </a>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur border-0">
                <CardContent className="p-4 text-center">
                  <Mail className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Email Support</h3>
                  <p className="text-sm text-primary-foreground mb-3">support@returnit.online</p>
                  <a href="mailto:support@returnit.online">
                    <Button className="w-full bg-white text-muted-foreground hover:bg-[#f8f7f5] dark:bg-[#231b0f]" data-testid="button-email-support">
                      Send Email
                    </Button>
                  </a>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur border-0">
                <CardContent className="p-4 text-center">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Message Specialist</h3>
                  <p className="text-sm text-primary-foreground mb-3">Text message support</p>
                  <a href="sms:6362544821?body=Hi, I need help with Return It:">
                    <Button className="w-full bg-white text-muted-foreground hover:bg-[#f8f7f5] dark:bg-[#231b0f]" data-testid="button-sms-support">
                      Send Message
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link href="/">
            <Button variant="outline" className="border-border text-muted-foreground hover:bg-[#f8f7f5] dark:bg-[#231b0f]" data-testid="button-back-home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}