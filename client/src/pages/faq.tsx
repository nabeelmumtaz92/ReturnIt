import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLocation, Link } from "wouter";
import Footer from "@/components/Footer";
import { 
  Search, 
  ArrowLeft, 
  ChevronDown,
  Package, 
  CreditCard, 
  Truck, 
  User, 
  Shield,
  Clock,
  MapPin,
  Phone,
  Mail,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  MessageCircle
} from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  isPopular: boolean;
}

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [, setLocation] = useLocation();

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const categories = [
    { id: "general", name: "General Questions", icon: HelpCircle, color: "bg-blue-500" },
    { id: "booking", name: "Booking & Scheduling", icon: Package, color: "bg-green-500" },
    { id: "pricing", name: "Pricing & Payment", icon: CreditCard, color: "bg-purple-500" },
    { id: "drivers", name: "For Drivers", icon: Truck, color: "bg-orange-500" },
    { id: "policies", name: "Policies & Safety", icon: Shield, color: "bg-red-500" },
    { id: "technical", name: "Technical Support", icon: User, color: "bg-gray-500" }
  ];

  const faqItems: FAQItem[] = [
    // General Questions
    {
      id: "what-is-returnly",
      question: "What is ReturnIt and how does it work?",
      answer: "ReturnIt is a convenient return pickup service based in St. Louis, MO. We connect you with local drivers who will pick up your returns from any retailer and handle the return process for you. Simply book a pickup through our website or app, package your items, and our driver will collect them from your doorstep. We take care of dropping them off at the appropriate return location, saving you time and hassle.",
      category: "general",
      tags: ["overview", "how-it-works", "service"],
      isPopular: true
    },
    {
      id: "service-areas",
      question: "What areas do you serve?",
      answer: "ReturnIt currently operates in the Greater St. Louis Metropolitan Area, including St. Louis City, St. Louis County, and surrounding suburbs such as Clayton, University City, Kirkwood, Webster Groves, Chesterfield, Florissant, and Hazelwood. We're expanding our coverage regularly, so check our website for the most current service area map.",
      category: "general",
      tags: ["service-area", "st-louis", "coverage", "locations"],
      isPopular: true
    },
    {
      id: "supported-retailers",
      question: "Which retailers do you accept returns for?",
      answer: "We handle returns for virtually all major retailers including Amazon, Target, Walmart, Best Buy, Home Depot, Macy's, Nordstrom, and hundreds of others. Whether it's online purchases or in-store items, if the retailer accepts returns, we can handle it. We also work with local St. Louis businesses and specialty stores.",
      category: "general",
      tags: ["retailers", "stores", "amazon", "target", "walmart"],
      isPopular: true
    },
    {
      id: "delivery-time",
      question: "How quickly can I schedule a pickup?",
      answer: "We offer same-day pickup for orders placed before 2 PM, subject to driver availability. Next-day pickup is guaranteed for all orders. You can also schedule pickups up to 7 days in advance. During peak seasons (holidays, back-to-school), we recommend booking 24-48 hours ahead.",
      category: "general",
      tags: ["timing", "same-day", "scheduling", "availability"],
      isPopular: true
    },

    // Booking & Scheduling
    {
      id: "how-to-book",
      question: "How do I book a return pickup?",
      answer: "Booking is easy! Visit our website at returnit.online, create an account, and click 'Book Pickup'. Fill in your pickup address, select items to return, choose your preferred time slot, and complete payment. You can also use our mobile app for iOS and Android. You'll receive confirmation via email and SMS with driver details.",
      category: "booking",
      tags: ["booking", "how-to", "website", "mobile-app"],
      isPopular: true
    },
    {
      id: "pickup-windows",
      question: "What pickup time windows are available?",
      answer: "We offer flexible pickup windows: Morning (8 AM - 12 PM), Afternoon (12 PM - 5 PM), and Evening (5 PM - 8 PM). Weekend slots are available Saturday 9 AM - 6 PM and Sunday 10 AM - 4 PM. You can also request specific 1-hour windows for an additional $3 fee.",
      category: "booking",
      tags: ["time-windows", "schedule", "hours", "weekend"],
      isPopular: false
    },
    {
      id: "change-cancel",
      question: "Can I change or cancel my pickup?",
      answer: "Yes! You can modify or cancel your pickup up to 2 hours before the scheduled time through your account dashboard or by calling us. Cancellations made more than 4 hours in advance receive a full refund. Changes to pickup details (time, location, items) can be made easily online.",
      category: "booking",
      tags: ["cancel", "modify", "change", "refund"],
      isPopular: false
    },
    {
      id: "multiple-packages",
      question: "Can I return multiple packages in one pickup?",
      answer: "Absolutely! You can return packages for different retailers in a single pickup. Our pricing includes up to 5 packages in the base fee. Each additional package is $2. This is one of the most cost-effective ways to handle multiple returns at once.",
      category: "booking",
      tags: ["multiple", "packages", "bulk", "cost-effective"],
      isPopular: true
    },

    // Pricing & Payment
    {
      id: "pricing-structure",
      question: "How much does ReturnIt cost?",
      answer: "Our transparent pricing starts at $8.99 for local pickups (up to 5 packages). Distance fees apply: +$1 per mile beyond 5 miles from driver location. Size upcharges: Large items (over 50 lbs) +$5, Oversized items +$10. Rush delivery (same-day) +$4.99. No hidden fees, and you see the total cost before booking.",
      category: "pricing",
      tags: ["pricing", "cost", "fees", "transparent"],
      isPopular: true
    },
    {
      id: "payment-methods",
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express, Discover), debit cards, Apple Pay, Google Pay, and PayPal. Payment is processed securely when you book, and you'll receive a receipt via email. For business customers, we offer invoicing options.",
      category: "pricing",
      tags: ["payment", "credit-cards", "apple-pay", "paypal", "secure"],
      isPopular: false
    },
    {
      id: "refund-policy",
      question: "What is your refund policy?",
      answer: "We offer full refunds for cancellations made 4+ hours before pickup. If we can't complete your pickup due to our error, you receive a full refund plus a $5 credit. Service issues are addressed with partial refunds or credits based on the situation. Refunds process within 3-5 business days.",
      category: "pricing",
      tags: ["refund", "cancellation", "policy", "credits"],
      isPopular: false
    },
    {
      id: "business-pricing",
      question: "Do you offer business or bulk pricing?",
      answer: "Yes! Businesses with 10+ returns per month qualify for volume discounts starting at 15% off. We offer dedicated account management, priority scheduling, and custom invoicing. Contact our business team at business@returnly.com for a custom quote.",
      category: "pricing",
      tags: ["business", "bulk", "volume", "enterprise", "discount"],
      isPopular: false
    },

    // For Drivers
    {
      id: "become-driver",
      question: "How do I become a ReturnIt driver?",
      answer: "Apply through our driver portal at returnit.online/driver-onboarding. Requirements: 21+ years old, valid driver's license, reliable vehicle, smartphone, pass background check. The process takes 3-5 business days. Drivers earn 70% of delivery fees plus tips and bonuses.",
      category: "drivers",
      tags: ["driver", "apply", "requirements", "earnings"],
      isPopular: true
    },
    {
      id: "driver-earnings",
      question: "How much do drivers earn?",
      answer: "Drivers keep 70% of the delivery fee plus 100% of tips. Average earnings: $15-25/hour during peak times, $10-18/hour off-peak. Bonuses available for peak seasons, large packages, and excellent ratings. Instant pay available for 50¢ fee, or free weekly deposits.",
      category: "drivers",
      tags: ["earnings", "pay", "tips", "bonuses", "instant-pay"],
      isPopular: true
    },
    {
      id: "driver-schedule",
      question: "Can drivers choose their own schedule?",
      answer: "Yes! Drivers have complete flexibility to work when they want. You can log in anytime during our service hours and accept jobs that fit your schedule. No minimum hours required, no shifts to commit to. Perfect for part-time or full-time work.",
      category: "drivers",
      tags: ["schedule", "flexibility", "part-time", "full-time"],
      isPopular: false
    },
    {
      id: "driver-app",
      question: "What features does the driver app have?",
      answer: "Our driver app includes GPS navigation, real-time job notifications, camera for package verification, earnings tracking, instant pay options, customer communication, route optimization, and 24/7 support chat. Available on iOS and Android.",
      category: "drivers",
      tags: ["app", "features", "gps", "navigation", "earnings"],
      isPopular: false
    },

    // Policies & Safety
    {
      id: "safety-measures",
      question: "What safety measures do you have in place?",
      answer: "All drivers undergo comprehensive background checks, vehicle inspections, and safety training. We provide contactless pickup options, photo verification of all packages, real-time GPS tracking, and 24/7 customer support. All drivers are rated by customers for quality assurance.",
      category: "policies",
      tags: ["safety", "background-check", "contactless", "tracking"],
      isPopular: true
    },
    {
      id: "lost-damaged",
      question: "What if my package gets lost or damaged?",
      answer: "We carry comprehensive insurance covering up to $500 per package (upgradeable to $1000). All packages are photographed at pickup and delivery. If an issue occurs, we investigate immediately and provide compensation within 5 business days. Our claim resolution team handles all cases personally.",
      category: "policies",
      tags: ["insurance", "lost", "damaged", "claims", "protection"],
      isPopular: true
    },
    {
      id: "privacy-policy",
      question: "How do you protect my personal information?",
      answer: "We're committed to privacy protection. Your data is encrypted, never sold to third parties, and only used for service delivery. Drivers only see necessary pickup/delivery information. You can request data deletion anytime. We comply with all privacy regulations and use secure payment processing.",
      category: "policies",
      tags: ["privacy", "data-protection", "security", "encryption"],
      isPopular: false
    },

    // Technical Support
    {
      id: "app-issues",
      question: "I'm having trouble with the mobile app. What should I do?",
      answer: "First, try restarting the app and ensuring you have the latest version from the App Store or Google Play. Clear the app cache if issues persist. For login problems, use the 'Forgot Password' feature. If problems continue, contact support with your device model and app version.",
      category: "technical",
      tags: ["app", "mobile", "troubleshooting", "login", "updates"],
      isPopular: false
    },
    {
      id: "account-access",
      question: "I can't access my account. How do I reset my password?",
      answer: "Use the 'Forgot Password' link on the login page. Enter your email address and check for a reset link (including spam folder). If you don't receive it within 10 minutes, contact support. For security, password resets expire after 24 hours.",
      category: "technical",
      tags: ["account", "password", "reset", "login", "security"],
      isPopular: false
    },
    {
      id: "notification-issues",
      question: "Why am I not receiving pickup notifications?",
      answer: "Check that notifications are enabled in your phone settings for the ReturnIt app. Ensure our emails aren't going to spam. You can update notification preferences in your account settings. We send confirmations via email, SMS, and push notifications.",
      category: "technical",
      tags: ["notifications", "alerts", "settings", "email", "sms"],
      isPopular: false
    }
  ];

  // Filter FAQs based on search and category
  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === null || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const popularFAQs = faqItems.filter(item => item.isPopular);

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/5025639/pexels-photo-5025639.jpeg?auto=compress&cs=tinysrgb&w=5120&h=3413&dpr=3&fit=crop&crop=center&q=100)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div className="absolute inset-0 bg-white/85"></div>
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Link href="/">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mr-4 text-amber-800 hover:text-amber-900"
                  data-testid="button-back-home"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-amber-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-amber-700 max-w-3xl mx-auto">
              Find answers to common questions about ReturnIt's return pickup service. Can't find what you're looking for? Contact our support team.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-amber-500" />
              <Input
                placeholder="Search frequently asked questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-3 text-lg border-amber-200 focus:border-amber-400"
                data-testid="input-faq-search"
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-amber-600 mt-2">
                {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} found for "{searchQuery}"
              </p>
            )}
          </div>

          {/* Categories */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-amber-900 mb-6">Browse by Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.id;
                const count = faqItems.filter(item => item.category === category.id).length;
                return (
                  <Card 
                    key={category.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      isSelected ? 'ring-2 ring-amber-400 bg-amber-50' : 'hover:bg-amber-50'
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
                          <h3 className="font-semibold text-amber-900 mb-1">{category.name}</h3>
                          <p className="text-sm text-amber-600">{count} questions</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Popular FAQs */}
          {!searchQuery && !selectedCategory && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-amber-900 mb-6">Most Popular Questions</h2>
              <div className="space-y-4">
                {popularFAQs.map((faq) => (
                  <Card key={faq.id} className="bg-white">
                    <Collapsible 
                      open={openItems.has(faq.id)} 
                      onOpenChange={() => toggleItem(faq.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-amber-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-3">
                              <Badge className="bg-amber-100 text-amber-800 mt-1">Popular</Badge>
                              <div className="flex-1">
                                <CardTitle className="text-amber-900 text-left">{faq.question}</CardTitle>
                              </div>
                            </div>
                            <ChevronDown 
                              className={`h-5 w-5 text-amber-600 transition-transform ${
                                openItems.has(faq.id) ? 'rotate-180' : ''
                              }`} 
                            />
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                          <div className="flex flex-wrap gap-2 mt-4">
                            {faq.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All FAQs / Search Results */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-amber-900 mb-6">
              {searchQuery ? 'Search Results' : selectedCategory ? `${categories.find(c => c.id === selectedCategory)?.name} Questions` : 'All Questions'}
            </h2>
            
            {filteredFAQs.length === 0 ? (
              <Card className="bg-white">
                <CardContent className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">No questions found</h3>
                  <p className="text-amber-600 mb-4">
                    {searchQuery ? `No questions match "${searchQuery}"` : 'No questions in this category'}
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory(null);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    data-testid="button-clear-search"
                  >
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <Card key={faq.id} className="bg-white">
                    <Collapsible 
                      open={openItems.has(faq.id)} 
                      onOpenChange={() => toggleItem(faq.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-amber-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-3">
                              {faq.isPopular && (
                                <Badge className="bg-amber-100 text-amber-800 mt-1">Popular</Badge>
                              )}
                              <div className="flex-1">
                                <CardTitle className="text-amber-900 text-left">{faq.question}</CardTitle>
                                <Badge variant="secondary" className="mt-2">
                                  {categories.find(c => c.id === faq.category)?.name}
                                </Badge>
                              </div>
                            </div>
                            <ChevronDown 
                              className={`h-5 w-5 text-amber-600 transition-transform ${
                                openItems.has(faq.id) ? 'rotate-180' : ''
                              }`} 
                            />
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                          <div className="flex flex-wrap gap-2 mt-4">
                            {faq.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Contact Support Section */}
          <Card className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Still Have Questions?</h2>
                <p className="text-amber-100">Our support team is available 24/7 to help you</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white/10 backdrop-blur border-0">
                  <CardContent className="p-4 text-center">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Live Chat</h3>
                    <p className="text-sm text-amber-100 mb-3">Get instant support</p>
                    <Button 
                      className="w-full bg-white text-amber-600 hover:bg-amber-50" 
                      onClick={() => setLocation('/help-center')}
                      data-testid="button-live-chat"
                    >
                      Start Chat
                    </Button>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur border-0">
                  <CardContent className="p-4 text-center">
                    <Phone className="h-8 w-8 mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Phone Support</h3>
                    <p className="text-sm text-amber-100 mb-3">(314) 555-0123</p>
                    <Button 
                      className="w-full bg-white text-amber-600 hover:bg-amber-50"
                      data-testid="button-call-support"
                    >
                      Call Now
                    </Button>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur border-0">
                  <CardContent className="p-4 text-center">
                    <Mail className="h-8 w-8 mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Email Support</h3>
                    <p className="text-sm text-amber-100 mb-3">support@returnly.com</p>
                    <Button 
                      className="w-full bg-white text-amber-600 hover:bg-amber-50"
                      data-testid="button-email-support"
                    >
                      Send Email
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      
      {/* Footer */}
      <Footer />
    </div>
  );
}