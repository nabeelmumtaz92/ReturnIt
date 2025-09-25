import { useQuery } from "@tanstack/react-query";
import { MapPin, Mail, Phone, Clock, Instagram, Facebook, Twitter, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Footer from "@/components/Footer";

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
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-amber-800 hover:text-amber-900"
              >
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
              <Link href="/">
                <div 
                  className="text-amber-900 font-bold text-2xl cursor-pointer hover:opacity-80 transition-opacity"
                >
                  Return It
                </div>
              </Link>
              <h1 className="text-2xl font-bold text-amber-900">About Us</h1>
            </div>
          </div>
        </div>
      </header>
      
      <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="mb-8 flex justify-center lg:justify-start">
                <div 
                  className="text-amber-900 font-bold text-5xl logo-enhanced"
                  data-testid="text-logo"
                >
                  Return It
                </div>
              </div>
              <Badge className="mb-6 bg-amber-100 text-amber-800 border-amber-200" data-testid="badge-company">
                {businessInfo?.companyName || "Return It"}
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-amber-900 mb-6 leading-tight" data-testid="heading-tagline">
                {businessInfo?.tagline || "Making Returns Effortless"}
              </h1>
              <p className="text-xl text-amber-700 leading-relaxed mb-8" data-testid="text-description">
                {businessInfo?.description || "At Return It, we believe returning an item should be as easy as ordering it. Our professional pickup service connects you with local drivers who handle every step of the return process."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/book-pickup">
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold" data-testid="button-book-pickup">
                    Book Your First Pickup
                  </Button>
                </Link>
                <Link href="/driver-portal">
                  <Button variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-50 px-8 py-3 rounded-lg font-semibold" data-testid="button-become-driver">
                    Become a Driver
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4" data-testid="stat-st-louis">
                    <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-amber-900">St. Louis Based</h3>
                      <p className="text-amber-700">Serving the Greater Metro Area</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4" data-testid="stat-drivers">
                    <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                      <Badge className="h-6 w-6 text-white bg-transparent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-amber-900">Professional Drivers</h3>
                      <p className="text-amber-700">Background checked & insured</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4" data-testid="stat-earnings">
                    <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold">$</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-amber-900">$18-25 per Hour</h3>
                      <p className="text-amber-700">Competitive driver earnings</p>
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
            <h2 className="text-4xl font-bold text-amber-900 mb-4" data-testid="heading-mission">
              Our Mission
            </h2>
            <p className="text-xl text-amber-700 max-w-3xl mx-auto leading-relaxed" data-testid="text-mission">
              {businessInfo?.missionStatement || "Founded with the mission to save you time and effort, Return It partners with local drivers to ensure every return is handled quickly, safely, and securely."}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-white border-amber-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-amber-900 mb-3">Save Time</h3>
                <p className="text-amber-700">No more waiting in lines or driving to return locations. We handle everything for you.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-amber-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-amber-900 mb-3">Local Service</h3>
                <p className="text-amber-700">Supporting the St. Louis community with local drivers and personalized service.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-amber-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Badge className="h-8 w-8 text-amber-600 bg-transparent border-0" />
                </div>
                <h3 className="text-xl font-semibold text-amber-900 mb-3">Secure Returns</h3>
                <p className="text-amber-700">Professional, insured drivers ensure your returns are handled safely and securely.</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-amber-900 mb-4">Why Choose Return It?</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-3" data-testid="feature-hassle-free">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span className="text-amber-800">No more long lines at stores</span>
                  </div>
                  <div className="flex items-center gap-3" data-testid="feature-no-labels">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span className="text-amber-800">No more printing labels</span>
                  </div>
                  <div className="flex items-center gap-3" data-testid="feature-doorstep">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span className="text-amber-800">Pickup from your doorstep</span>
                  </div>
                  <div className="flex items-center gap-3" data-testid="feature-secure">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span className="text-amber-800">Safe & secure handling</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <img 
                  src="https://images.pexels.com/photos/6195124/pexels-photo-6195124.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2&fit=crop&crop=center&q=80"
                  alt="Professional package handling"
                  className="rounded-2xl shadow-lg max-w-md w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-white/80 border-amber-200">
            <CardHeader>
              <CardTitle className="text-2xl text-amber-900" data-testid="heading-story">
                Our Story
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-amber-700 leading-relaxed" data-testid="text-founding-story">
                {businessInfo?.foundingStory || "Founded in 2024 in St. Louis, Missouri, Return It was created to solve the growing frustration with online returns. Our founders experienced firsthand the time-consuming process of returning items and envisioned a better way."}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 px-6 bg-white/70">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-amber-900 mb-8 text-center" data-testid="heading-contact">
            Get In Touch
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center bg-white border-amber-200" data-testid="card-location">
              <CardContent className="pt-6">
                <MapPin className="w-8 h-8 mx-auto mb-3 text-amber-600" />
                <h3 className="font-semibold text-amber-900 mb-2">Headquarters</h3>
                <p className="text-amber-700" data-testid="text-headquarters">
                  {businessInfo?.headquarters || "St. Louis, MO"}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center bg-white border-amber-200" data-testid="card-email">
              <CardContent className="pt-6">
                <Mail className="w-8 h-8 mx-auto mb-3 text-amber-600" />
                <h3 className="font-semibold text-amber-900 mb-2">Email</h3>
                <p className="text-amber-700" data-testid="text-email">
                  {businessInfo?.supportEmail || "support@returnly.com"}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center bg-white border-amber-200" data-testid="card-phone">
              <CardContent className="pt-6">
                <Phone className="w-8 h-8 mx-auto mb-3 text-amber-600" />
                <h3 className="font-semibold text-amber-900 mb-2">Phone</h3>
                <p className="text-amber-700" data-testid="text-phone">
                  {businessInfo?.supportPhone || "(555) 123-4567"}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center bg-white border-amber-200" data-testid="card-hours">
              <CardContent className="pt-6">
                <Clock className="w-8 h-8 mx-auto mb-3 text-amber-600" />
                <h3 className="font-semibold text-amber-900 mb-2">Hours</h3>
                <p className="text-amber-700" data-testid="text-hours">
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
          <h2 className="text-3xl font-bold text-amber-900 mb-8" data-testid="heading-social">
            Follow Us
          </h2>
          <div className="flex justify-center gap-8">
            <a 
              href={`https://instagram.com/${businessInfo?.instagramHandle?.replace('@', '') || 'ReturnlyApp'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 text-amber-700 hover:text-amber-900 transition-colors"
              data-testid="link-instagram"
            >
              <Instagram className="w-8 h-8" />
              <span>{businessInfo?.instagramHandle || "@ReturnItApp"}</span>
            </a>
            <a 
              href={`https://${businessInfo?.facebookUrl || 'facebook.com/ReturnIt'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 text-amber-700 hover:text-amber-900 transition-colors"
              data-testid="link-facebook"
            >
              <Facebook className="w-8 h-8" />
              <span>Facebook</span>
            </a>
            <a 
              href={`https://twitter.com/${businessInfo?.twitterHandle?.replace('@', '') || 'ReturnIt'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 text-amber-700 hover:text-amber-900 transition-colors"
              data-testid="link-twitter"
            >
              <Twitter className="w-8 h-8" />
              <span>{businessInfo?.twitterHandle || "@ReturnIt"}</span>
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