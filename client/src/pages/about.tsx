import { useQuery } from "@tanstack/react-query";
import { MapPin, Mail, Phone, Clock, Instagram, Facebook, Twitter, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Footer from "@/components/Footer";
import professionalDriverImg from "@assets/generated_images/Professional_delivery_driver_portrait_765dd57e.png";

interface BusinessInfo {
  id: number;
  companyName: string;
  tagline: string;
  description: string;
  headquarters: string;
  supportEmail: string;
  supportPhone: string;
  businessHours: string;
  instagramHandle: string;
  facebookUrl: string;
  twitterHandle: string;
  missionStatement: string;
  foundingStory: string;
  updatedAt: string;
}

export default function About() {
  const { data: businessInfo, isLoading } = useQuery<BusinessInfo>({
    queryKey: ["/api/business-info"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-foreground hover:text-foreground"
              >
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
              <Link href="/">
                <div 
                  className="text-foreground font-bold text-2xl cursor-pointer"
                >
                  Return It
                </div>
              </Link>
              <h1 className="text-2xl font-bold text-foreground">About Us</h1>
            </div>
          </div>
        </div>
      </header>
      
      <div className="bg-[#f8f7f5] dark:bg-[#231b0f]">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="mb-8 flex justify-center lg:justify-start">
                <div 
                  className="text-foreground font-bold text-5xl logo-enhanced"
                  data-testid="text-logo"
                >
                  Return It
                </div>
              </div>
              <Badge className="mb-6 bg-accent text-foreground border-border" data-testid="badge-company">
                {businessInfo?.companyName || "Return It"}
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight" data-testid="heading-tagline">
                {businessInfo?.tagline || "Making Returns Effortless"}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8" data-testid="text-description">
                {businessInfo?.description || "At Return It, we believe returning an item should be as easy as ordering it. Our On Demand Returns connects you with local drivers who handle every step of the return process."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/book-return">
                  <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-semibold" data-testid="button-book-return">
                    Book Your First Return
                  </Button>
                </Link>
                <Link href="/driver-portal">
                  <Button variant="outline" className="border-border text-primary hover:bg-[#f8f7f5] dark:bg-[#231b0f] px-8 py-3 rounded-lg font-semibold" data-testid="button-become-driver">
                    Become a Driver
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-accent to-accent rounded-3xl p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4" data-testid="stat-st-louis">
                    <div className="w-12 h-12 bg-[#f8f7f5] dark:bg-[#231b0f]0 rounded-xl flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">St. Louis Based</h3>
                      <p className="text-muted-foreground">Serving the Greater Metro Area</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4" data-testid="stat-drivers">
                    <div className="w-12 h-12 bg-[#f8f7f5] dark:bg-[#231b0f]0 rounded-xl flex items-center justify-center">
                      <Badge className="h-6 w-6 text-white bg-transparent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Professional Drivers</h3>
                      <p className="text-muted-foreground">Background checked & insured</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4" data-testid="stat-earnings">
                    <div className="w-12 h-12 bg-[#f8f7f5] dark:bg-[#231b0f]0 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold">$</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">$18-25 per Hour</h3>
                      <p className="text-muted-foreground">Competitive driver earnings</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 bg-white/90">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4" data-testid="heading-mission">
              Our Mission
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed" data-testid="text-mission">
              {businessInfo?.missionStatement || "Founded with the mission to save you time and effort, Return It partners with local drivers to ensure every return is handled quickly, safely, and securely."}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-white border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Save Time</h3>
                <p className="text-muted-foreground">No more waiting in lines or driving to return locations. We handle everything for you.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Local Service</h3>
                <p className="text-muted-foreground">Supporting the St. Louis community with local drivers and personalized service.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Badge className="h-8 w-8 text-primary bg-transparent border-0" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Secure Returns</h3>
                <p className="text-muted-foreground">Professional, insured drivers ensure your returns are handled safely and securely.</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Market Statistics Section */}
          <div className="bg-gradient-to-br from-transparent to-transparent rounded-3xl p-8 md:p-12 mb-16 border border-border">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-foreground mb-4">The Returns Revolution</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">The returns industry is massive and growing. Here's why On Demand Returns is the future:</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">$743B</div>
                <p className="text-muted-foreground font-medium">U.S. returns in 2023</p>
                <p className="text-sm text-primary">≈14.5% of total retail sales</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">70%</div>
                <p className="text-muted-foreground font-medium">Would use pickup service</p>
                <p className="text-sm text-primary">To avoid lines and driving</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">16.5%</div>
                <p className="text-muted-foreground font-medium">Online return rate</p>
                <p className="text-sm text-primary">vs. 8-10% in-store</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">30-45</div>
                <p className="text-muted-foreground font-medium">Minutes per return trip</p>
                <p className="text-sm text-primary">Time you save with Return It</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-border">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground mb-2">79%</div>
                <p className="text-muted-foreground font-medium">Avoid stores with difficult returns</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground mb-2">60%</div>
                <p className="text-muted-foreground font-medium">Say returns policy affects where they shop</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-accent to-accent rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Why Choose Return It?</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-3" data-testid="feature-hassle-free">
                    <div className="w-2 h-2 bg-[#f8f7f5] dark:bg-[#231b0f]0 rounded-full" />
                    <span className="text-foreground">No more long lines at stores</span>
                  </div>
                  <div className="flex items-center gap-3" data-testid="feature-no-labels">
                    <div className="w-2 h-2 bg-[#f8f7f5] dark:bg-[#231b0f]0 rounded-full" />
                    <span className="text-foreground">No more printing labels</span>
                  </div>
                  <div className="flex items-center gap-3" data-testid="feature-doorstep">
                    <div className="w-2 h-2 bg-[#f8f7f5] dark:bg-[#231b0f]0 rounded-full" />
                    <span className="text-foreground">Pickup from your doorstep</span>
                  </div>
                  <div className="flex items-center gap-3" data-testid="feature-secure">
                    <div className="w-2 h-2 bg-[#f8f7f5] dark:bg-[#231b0f]0 rounded-full" />
                    <span className="text-foreground">Safe & secure handling</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <img 
                  src={professionalDriverImg}
                  alt="Professional delivery driver with package"
                  className="rounded-2xl shadow-lg max-w-md w-full object-cover h-80"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-white/80 border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground" data-testid="heading-story">
                Our Story
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-founding-story">
                {businessInfo?.foundingStory || "Founded in 2024 in St. Louis, Missouri, Return It was created to solve the growing frustration with returns. Our founders experienced firsthand the time-consuming process of returning items—the long lines at stores, the inconvenient hours, the hassle of packaging and transportation. They envisioned a better way: a service that brings the return process directly to your doorstep. By connecting customers with local, professional drivers, Return It transforms what was once a dreaded chore into a seamless, stress-free experience. Our mission is simple: save you time, eliminate the hassle, and make every return as easy as the original purchase."}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 px-6 bg-white/70">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center" data-testid="heading-contact">
            Get In Touch
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center bg-white border-border" data-testid="card-location">
              <CardContent className="pt-6">
                <MapPin className="w-8 h-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold text-foreground mb-2">Headquarters</h3>
                <p className="text-muted-foreground" data-testid="text-headquarters">
                  {businessInfo?.headquarters || "St. Louis, MO"}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center bg-white border-border" data-testid="card-email">
              <CardContent className="pt-6">
                <Mail className="w-8 h-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold text-foreground mb-2">Email</h3>
                <p className="text-muted-foreground" data-testid="text-email">
                  {businessInfo?.supportEmail || "support@returnit.online"}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center bg-white border-border" data-testid="card-phone">
              <CardContent className="pt-6">
                <Phone className="w-8 h-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold text-foreground mb-2">Phone</h3>
                <p className="text-muted-foreground" data-testid="text-phone">
                  {businessInfo?.supportPhone || "(555) 123-4567"}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center bg-white border-border" data-testid="card-hours">
              <CardContent className="pt-6">
                <Clock className="w-8 h-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold text-foreground mb-2">Hours</h3>
                <p className="text-muted-foreground" data-testid="text-hours">
                  {businessInfo?.businessHours || "Mon–Sat, 8 AM – 8 PM CST"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8" data-testid="heading-social">
            Follow Us
          </h2>
          <div className="flex justify-center gap-8">
            <a 
              href={`https://instagram.com/${businessInfo?.instagramHandle?.replace('@', '') || 'ReturnlyApp'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-instagram"
            >
              <Instagram className="w-8 h-8" />
              <span>{businessInfo?.instagramHandle || "@ReturnItApp"}</span>
            </a>
            <a 
              href={`https://${businessInfo?.facebookUrl || 'facebook.com/Return It'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-facebook"
            >
              <Facebook className="w-8 h-8" />
              <span>Facebook</span>
            </a>
            <a 
              href={`https://twitter.com/${businessInfo?.twitterHandle?.replace('@', '') || 'Return It'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-twitter"
            >
              <Twitter className="w-8 h-8" />
              <span>{businessInfo?.twitterHandle || "@Return It"}</span>
            </a>
          </div>
        </div>
      </section>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}