import { useLocation } from 'wouter';
import { Screen } from '@/components/screen';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Star, MapPin, Clock, Package, CreditCard } from 'lucide-react';

export default function Welcome() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen">
      {/* DoorDash-style Hero Section */}
      <div className="relative h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 overflow-hidden">
        
        {/* Hero Content */}
        <div className="relative z-20 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center h-full">
            
            {/* Left side - Main content */}
            <div className="text-white space-y-8">
              <div className="flex items-center gap-3 mb-6">
                <img 
                  src="/attached_assets/file_00000000802861f4ad89299ee34ee0eb_1754855656601.png" 
                  alt="Returnly Logo" 
                  className="h-16 w-auto"
                />
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Returns made
                  <br />
                  <span className="text-yellow-200">effortless</span>
                </h1>
                <p className="text-xl lg:text-2xl text-orange-100 font-medium">
                  We pick up your returns and deliver them back to the store. 
                  Zero trips, zero hassle.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-orange-50 font-bold text-lg px-8 py-4 h-auto"
                  onClick={() => setLocation('/book-pickup')}
                  data-testid="button-book-pickup-hero"
                >
                  Book Return Pickup
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-orange-600 font-bold text-lg px-8 py-4 h-auto"
                  onClick={() => setLocation('/login')}
                  data-testid="button-sign-in-hero"
                >
                  Sign In
                </Button>
              </div>

              {/* Quick stats */}
              <div className="flex flex-wrap gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">2hr</div>
                  <div className="text-orange-200 text-sm">Average pickup</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-orange-200 text-sm">Partner stores</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">$7.99</div>
                  <div className="text-orange-200 text-sm">Starting price</div>
                </div>
              </div>
            </div>

            {/* Right side - Realistic delivery scene */}
            <div className="hidden lg:block relative h-full">
              <div className="absolute inset-0 flex items-center justify-center">
                
                {/* Main delivery scene */}
                <div className="relative w-full h-96">
                  
                  {/* Customer - person handing package */}
                  <div className="absolute left-20 bottom-20">
                    <div className="relative">
                      {/* Head */}
                      <div className="w-16 h-16 bg-pink-300 rounded-full mb-2"></div>
                      {/* Body */}
                      <div className="w-20 h-32 bg-blue-600 rounded-lg relative">
                        {/* Arms reaching out */}
                        <div className="absolute -right-8 top-8 w-12 h-4 bg-blue-700 rounded-full transform rotate-45"></div>
                        <div className="absolute -left-2 top-8 w-12 h-4 bg-blue-700 rounded-full transform -rotate-45"></div>
                      </div>
                      {/* Legs */}
                      <div className="flex gap-2 mt-1">
                        <div className="w-8 h-20 bg-blue-800 rounded-lg"></div>
                        <div className="w-8 h-20 bg-blue-800 rounded-lg"></div>
                      </div>
                    </div>
                  </div>

                  {/* Package being exchanged */}
                  <div className="absolute left-40 bottom-32 z-10">
                    <div className="w-12 h-8 bg-amber-700 rounded-sm shadow-lg transform rotate-12 border-2 border-amber-800">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-1 bg-amber-900"></div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery driver - Returnly uniform */}
                  <div className="absolute right-20 bottom-20">
                    <div className="relative">
                      {/* Head */}
                      <div className="w-16 h-16 bg-pink-200 rounded-full mb-2"></div>
                      {/* Body - Returnly orange uniform */}
                      <div className="w-20 h-32 bg-orange-600 rounded-lg relative">
                        {/* Returnly logo on chest */}
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white">R</div>
                        {/* Arms reaching to receive */}
                        <div className="absolute -left-6 top-8 w-12 h-4 bg-orange-700 rounded-full transform -rotate-45"></div>
                        <div className="absolute -right-2 top-8 w-12 h-4 bg-orange-700 rounded-full transform rotate-45"></div>
                      </div>
                      {/* Legs */}
                      <div className="flex gap-2 mt-1">
                        <div className="w-8 h-20 bg-orange-800 rounded-lg"></div>
                        <div className="w-8 h-20 bg-orange-800 rounded-lg"></div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery truck in background */}
                  <div className="absolute right-4 bottom-4">
                    <div className="w-32 h-16 bg-white rounded-lg border-4 border-gray-300 relative shadow-xl">
                      {/* Cab */}
                      <div className="absolute left-0 top-0 w-12 h-full bg-gray-200 rounded-l-lg"></div>
                      {/* Wheels */}
                      <div className="absolute bottom-0 left-3 w-4 h-4 bg-black rounded-full"></div>
                      <div className="absolute bottom-0 right-3 w-4 h-4 bg-black rounded-full"></div>
                      {/* Returnly branding */}
                      <div className="absolute top-2 right-2 text-orange-600 font-bold text-sm">RETURNLY</div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute inset-0 z-10">
          {/* Floating packages */}
          <div className="absolute top-20 right-10 w-8 h-6 bg-amber-600 rounded-sm opacity-20 transform rotate-12 animate-pulse"></div>
          <div className="absolute top-40 left-10 w-6 h-4 bg-amber-500 rounded-sm opacity-20 transform -rotate-12 animate-pulse delay-75"></div>
          <div className="absolute bottom-40 left-20 w-10 h-8 bg-amber-700 rounded-sm opacity-20 transform rotate-6 animate-pulse delay-150"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header with Real Logo */}
        <Card className="bg-white/90 backdrop-blur-sm border shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/attached_assets/file_00000000802861f4ad89299ee34ee0eb_1754855656601.png" 
                alt="Returnly Logo" 
                className="h-12 w-auto"
              />
            </div>
            <p className="text-lg text-muted-foreground">
              Return Delivery Service - Your returns delivered. Zero hassle.
            </p>
          </CardContent>
        </Card>
      
      {/* Promotional Banner */}
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white mb-4">
        <CardContent className="p-6 text-center">
          <div className="text-xl font-bold mb-2">🎉 Limited Time: 50% OFF First Return</div>
          <div className="bg-white/20 inline-block px-3 py-1 rounded-lg font-semibold">
            Use code: RETURN50
          </div>
        </CardContent>
      </Card>
      
      {/* Main CTA */}
      <Card className="brand-card mb-6">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Book Your Return Pickup
          </h2>
          <p className="text-muted-foreground mb-4 flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <CreditCard className="w-4 h-4" />
              From $7.99
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Pick up in 2 hours
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              500+ retail partners
            </span>
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button 
              className="brand-button-contained text-lg px-6 py-3" 
              onClick={() => setLocation('/book-pickup')}
              data-testid="button-book-pickup"
            >
              Start Return 📦
            </Button>
            <Button 
              variant="outline" 
              className="brand-button-outlined px-6 py-3"
              onClick={() => setLocation('/order-status/DEMO01')}
              data-testid="button-track-order"
            >
              Track Order
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer Reviews */}
      <Card className="brand-card mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4 text-center flex items-center justify-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            What Our Customers Say
          </h2>
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-sm italic mb-2">
                "Saved me 2 hours at the mall! Driver was super friendly."
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                — Sarah M., San Francisco
              </p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-sm italic mb-2">
                "Perfect for busy parents. Returned 3 packages while kids napped."
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                — Mike D., Austin
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="brand-card mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4 text-center">
            📋 How Returnly Works
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-lg">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <span className="font-medium">Book pickup online or in app</span>
            </div>
            <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-lg">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <span className="font-medium">Hand package to our driver</span>
            </div>
            <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-lg">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <span className="font-medium">We handle the return for you</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Retail Partners */}
      <Card className="brand-card mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4 text-center">
            🏪 Trusted Retail Partners
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {['Target', 'Best Buy', "Macy's", 'REI', 'Nike', '+495 more'].map((retailer) => (
              <div 
                key={retailer}
                className="bg-white border border-gray-200 rounded-lg p-3 text-center font-semibold text-sm"
              >
                {retailer}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Deals */}
      <Card className="brand-card mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4 text-center">
            💰 Current Deals
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg border-2 border-green-500 text-center">
              <h3 className="font-bold text-lg mb-2">Bundle Returns</h3>
              <p className="text-sm text-muted-foreground mb-2">Return 3+ items, save 25%</p>
              <div className="bg-green-500 text-white px-3 py-1 rounded font-bold text-sm">
                BUNDLE25
              </div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg border-2 border-green-500 text-center">
              <h3 className="font-bold text-lg mb-2">Student Discount</h3>
              <p className="text-sm text-muted-foreground mb-2">15% off with .edu email</p>
              <div className="bg-green-500 text-white px-3 py-1 rounded font-bold text-sm">
                STUDENT15
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Driver Section */}
      <Card className="brand-card mb-6">
        <CardContent className="p-6 flex items-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
               style={{ backgroundColor: 'rgba(255, 140, 66, 0.2)' }}>
            <Truck className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">Earn as a Returnly Driver</h3>
            <p className="text-muted-foreground text-sm mb-1">
              $18-25/hour • Flexible schedule • Weekly pay
            </p>
          </div>
          <Button 
            className="brand-button-contained"
            onClick={() => alert('Driver Portal\n\nComing soon to App Store & Google Play!\n\nEarn up to $25/hour with flexible scheduling.')}
            data-testid="button-apply-driver"
          >
            Apply Now
          </Button>
        </CardContent>
      </Card>

        {/* Footer */}
        <Card className="bg-white/60 backdrop-blur-sm border shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-center items-center gap-6 text-sm text-muted-foreground flex-wrap">
              <button 
                onClick={() => setLocation('/login')}
                className="hover:text-primary transition-colors"
              >
                Sign In
              </button>
              <span>•</span>
              <button className="hover:text-primary transition-colors">
                Help Center
              </button>
              <span>•</span>
              <button className="hover:text-primary transition-colors">
                About Us
              </button>
              <span>•</span>
              <button 
                onClick={() => setLocation('/design-system-demo')}
                className="hover:text-primary transition-colors font-medium"
              >
                Design System
              </button>
              <span>•</span>
              <button 
                onClick={() => setLocation('/mobile-app-demo')}
                className="hover:text-primary transition-colors font-medium"
              >
                Mobile App
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
