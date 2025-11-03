import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, HelpCircle, MessageCircle, Phone } from "lucide-react";
import Footer from "@/components/Footer";

export default function Support() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-transparent via-white to-transparent">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground hover:text-foreground"
                data-testid="button-back-home"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/">
              <div className="text-xl font-bold text-foreground cursor-pointer hover:opacity-90 transition-all duration-300 hover:scale-105">
                Return It
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="bg-white/90 backdrop-blur-sm border-border">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-accent p-3 rounded-full">
                <HelpCircle className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">
              Support Center
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              We're here to help! Get answers to your questions.
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Email Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    For general inquiries and support requests:
                  </p>
                  <a 
                    href="mailto:support@returnit.online" 
                    className="text-primary font-semibold hover:underline"
                  >
                    support@returnit.online
                  </a>
                  <p className="text-xs text-muted-foreground mt-2">
                    Response time: 24-48 hours
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    Live Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Chat with our support team in real-time:
                  </p>
                  <Button 
                    onClick={() => {
                      // Tawk.to chat widget
                      if (typeof window !== 'undefined' && (window as any).Tawk_API) {
                        (window as any).Tawk_API.maximize();
                      }
                    }}
                    className="w-full"
                    data-testid="button-open-chat"
                  >
                    Start Live Chat
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Available: Mon-Fri, 9am-5pm CST
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* FAQs */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">How does Return It work?</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Simply book a return through our app, select your store location, upload photos of your items, 
                    choose a pickup time, and a verified driver will pick up your package and deliver it to the store. 
                    Track your delivery in real-time!
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">What are your pricing tiers?</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Standard ($6.99):</strong> Next available driver</li>
                      <li><strong>Priority ($9.99):</strong> Faster pickup time</li>
                      <li><strong>Instant ($12.99):</strong> Immediate pickup</li>
                    </ul>
                    All pricing includes driver tips and service fees.
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">How do I track my return?</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Once your driver accepts your order, you'll see real-time GPS tracking in the app. 
                    You'll receive notifications when the driver is on their way, picks up your package, 
                    and completes the delivery.
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">What stores do you support?</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    We support 600+ retail locations in the St. Louis area, including Target, Walmart, Best Buy, 
                    Nike, Sephora, Macy's, and many more. Search for your store in the booking form.
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Do I need to provide a receipt?</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Yes, you must upload photos of your receipt, tags, or packaging during the booking process. 
                    This ensures transparency and helps verify your return.
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">How do refunds work?</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    If you need to cancel your booking, refunds are processed based on cancellation timing:
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                      <li>Before driver accepts: Full refund</li>
                      <li>After driver en route: Partial refund (50%)</li>
                      <li>After pickup: No refund</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">How do I become a driver?</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Download the Return It Driver app, complete the registration, pass a background check 
                    (via Stripe Identity), and start accepting jobs! Drivers earn 70% of each delivery fee 
                    plus 100% of customer tips.
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Is my payment information secure?</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Yes! All payments are processed through Stripe, a PCI-compliant payment processor. 
                    We never store your credit card information on our servers. Your financial data is 
                    encrypted and secure.
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Additional Help */}
            <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-6">
              <h3 className="font-bold text-foreground mb-2">Need More Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Can't find the answer you're looking for? Our support team is ready to assist you.
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-foreground">
                  <strong>Email:</strong>{" "}
                  <a href="mailto:support@returnit.online" className="text-primary hover:underline">
                    support@returnit.online
                  </a>
                </p>
                <p className="text-foreground">
                  <strong>Address:</strong> Return It, LLC – 1214 Devonworth Drive, St. Louis, MO, 63017
                </p>
                <p className="text-foreground">
                  <strong>Website:</strong>{" "}
                  <a href="https://returnit.online" className="text-primary hover:underline">
                    https://returnit.online
                  </a>
                </p>
              </div>
            </div>

            {/* Privacy Policy Link */}
            <div className="text-center">
              <Link href="/privacy-policy">
                <Button variant="link" className="text-primary" data-testid="link-privacy-policy">
                  View Our Privacy Policy
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
