import { useLocation, Link } from 'wouter';
import { Screen } from '@/components/screen';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Truck, Star, MapPin, Clock, Package, CreditCard, LogOut, User, Settings, Shield, Search, CheckCircle, DollarSign, Zap, Phone, ArrowRight } from 'lucide-react';
import ContactSupportButton from '@/components/ContactSupportButton';
import Footer from '@/components/Footer';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth-simple";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Import delivery images
import deliveryCarImg from "@assets/Delivery Driver- Box in Car_1754856749497.jpeg";
import deliveryHandoffImg from "@assets/Delivery Driver- Handoff_1754856749519.jpeg";
import deliveryOutsideImg from "@assets/Delivery Driver- outside_1754856749521.jpeg";
import deliveryReceivingImg from "@assets/Delivery Driver Receiving Box_1754856749524.jpeg";
import heroDriverImg from "@assets/image_1755100609852.png";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [trackingNumber, setTrackingNumber] = useState('');

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/auth/logout', 'POST', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Goodbye!",
        description: "You have been signed out successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Image carousel data
  const deliveryImages = [
    {
      url: "https://images.pexels.com/photos/13443801/pexels-photo-13443801.jpeg?auto=compress&cs=tinysrgb&w=1600",
      alt: "Woman receiving package from courier"
    },
    {
      url: deliveryCarImg,
      alt: "Delivery driver with box in car"
    },
    {
      url: deliveryHandoffImg, 
      alt: "Delivery driver handing off package"
    },
    {
      url: deliveryOutsideImg,
      alt: "Delivery driver outside"
    },
    {
      url: deliveryReceivingImg,
      alt: "Delivery driver receiving box"
    }
  ];

  // Auto-rotate images every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % deliveryImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [deliveryImages.length]);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Driver Background */}
      <div className="relative min-h-screen overflow-hidden">
        
        {/* Background with Enhanced Stock Delivery Image */}
        <div 
          className="absolute inset-0 bg-img-enhanced"
          style={{
            backgroundImage: `url(${heroDriverImg})`,
            backgroundSize: 'cover',
            backgroundPosition: '95% center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/10 to-transparent"></div>
        <div className="absolute inset-0 bg-pattern-enhanced"></div>
        
        {/* Floating Top Navigation - Role Switcher */}
        {isAuthenticated && (
          <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 safe-area-inset-top">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-2 sm:p-2 shadow-xl border border-amber-200">
              <RoleSwitcher />
            </div>
          </div>
        )}

        {/* Hero Content */}
        <div className="relative z-20 h-full flex items-center">
          <div className="w-full px-4 sm:px-8 lg:px-16 grid grid-cols-1 gap-8 items-center h-full max-w-6xl mx-auto lg:mr-auto lg:ml-0">
            
            {/* Left side - Main content */}
            <div className="text-amber-900 space-y-6 lg:space-y-8 text-center lg:text-left lg:max-w-2xl">
              <div className="flex justify-center lg:justify-start mb-6 lg:mb-8">
                <Link href="/">
                  <div className="group cursor-pointer relative">
                    <div className="relative">
                      <img 
                        src="/logo-cardboard-deep.png" 
                        alt="Returnly Logo" 
                        className="h-28 sm:h-32 md:h-36 lg:h-44 xl:h-52 2xl:h-60 w-auto transition-all duration-300 group-hover:scale-105 logo-enhanced group-hover:drop-shadow-xl"
                      />
                    </div>
                  </div>
                </Link>
              </div>
              
              <div className="space-y-6 lg:space-y-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold leading-tight text-crisp tracking-tight">
                  Returns made
                  <br />
                  <span className="text-amber-700 bg-gradient-to-r from-amber-700 to-amber-600 bg-clip-text text-transparent">easy</span>
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-amber-800 font-semibold max-w-4xl mx-auto px-4 text-crisp leading-relaxed">
                  We pick up your returns and deliver them back to the store. 
                  <br className="hidden sm:block" />
                  <span className="font-bold text-amber-700">Zero trips, zero hassle.</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                {isAuthenticated ? (
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-amber-800 to-amber-700 text-white hover:from-amber-900 hover:to-amber-800 font-bold text-xl px-12 py-6 h-auto shadow-crisp-lg hover:shadow-crisp-xl transition-all duration-300 hover:-translate-y-1"
                      onClick={() => setLocation('/book-pickup')}
                      data-testid="button-book-pickup-hero"
                    >
                      Book Pickup
                    </Button>
                    
                    {/* Track Order - Only for authenticated users */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center glass-card rounded-xl border border-amber-200/30 p-6 backdrop-blur-md">
                      <Label htmlFor="tracking" className="text-amber-800 font-semibold whitespace-nowrap text-lg">
                        Track Order:
                      </Label>
                      <Input
                        id="tracking"
                        type="text"
                        placeholder="Enter order ID"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="flex-1 bg-white/95 border-amber-300 focus:border-amber-500 h-14 text-lg shadow-crisp"
                        data-testid="input-tracking"
                      />
                      <Button
                        onClick={() => {
                          if (trackingNumber.trim()) {
                            setLocation(`/order-status/${trackingNumber.trim()}`);
                          } else {
                            toast({
                              title: "Enter order ID",
                              description: "Please enter your order ID to track",
                              variant: "destructive",
                            });
                          }
                        }}
                        className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-800 hover:to-amber-700 text-white px-8 py-4 h-14 text-lg font-semibold shadow-crisp-lg"
                        data-testid="button-track-order"
                      >
                        <Search className="h-5 w-5 mr-2" />
                        Track
                      </Button>
                    </div>
                    {user?.isDriver && (
                      <Button 
                        size="lg"
                        variant="outline"
                        className="border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white font-bold text-lg px-8 py-4 h-auto"
                        onClick={() => setLocation('/driver-portal')}
                        data-testid="button-driver-portal-hero"
                      >
                        <Truck className="h-5 w-5 mr-2" />
                        Driver Portal
                      </Button>
                    )}
                    {user && (user as any).isAdmin && (
                      <Button 
                        size="lg"
                        variant="outline"
                        className="border-red-800 text-red-800 hover:bg-red-800 hover:text-white font-bold text-lg px-8 py-4 h-auto"
                        onClick={() => setLocation('/admin-dashboard')}
                        data-testid="button-admin-dashboard-hero"
                      >
                        <Shield className="h-5 w-5 mr-2" />
                        Admin Dashboard
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <Button 
                      size="lg"
                      className="bg-amber-800 text-white hover:bg-amber-900 font-bold text-lg px-8 py-4 h-auto"
                      onClick={() => setLocation('/login')}
                      data-testid="button-sign-in-hero"
                    >
                      Sign In
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline"
                      className="border-amber-800 text-amber-800 hover:bg-amber-800 hover:text-white font-bold text-lg px-8 py-4 h-auto"
                      onClick={() => setLocation('/login?tab=register')}
                      data-testid="button-sign-up-hero"
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>

              {/* Enhanced Quick stats */}
              <div className="flex flex-wrap justify-center gap-8 sm:gap-12 lg:gap-16 pt-8">
                <div className="text-center group">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-crisp text-amber-900 group-hover:scale-110 transition-transform duration-300">15min</div>
                  <div className="text-amber-700 text-base sm:text-lg font-semibold">Avg pickup time</div>
                </div>
                <div className="text-center group">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-crisp text-amber-900 group-hover:scale-110 transition-transform duration-300">500+</div>
                  <div className="text-amber-700 text-base sm:text-lg font-semibold">Partner stores</div>
                </div>
                <div className="text-center group">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-crisp text-amber-900 group-hover:scale-110 transition-transform duration-300">12k+</div>
                  <div className="text-amber-700 text-base sm:text-lg font-semibold">Hours saved</div>
                </div>
                <div className="text-center group">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-crisp text-amber-900 group-hover:scale-110 transition-transform duration-300">98%</div>
                  <div className="text-amber-700 text-base sm:text-lg font-semibold">Success rate</div>
                </div>
              </div>
            </div>

            {/* Right side - Let the real photo show through */}
            <div className="hidden lg:block relative h-full">
              {/* Empty space to showcase the real photo behind */}
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Sophisticated Welcome Section */}
      <div className="w-full py-16 bg-gradient-to-br from-white via-stone-50 to-amber-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <img 
            src="https://images.pexels.com/photos/6994108/pexels-photo-6994108.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Packages on porch"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-stone-50/70 to-amber-50/60"></div>
        <div className="relative px-4 sm:px-8 lg:px-16 text-center">
          <div className="flex flex-col items-center justify-center mb-8 lg:mb-12">
            <Link href="/">
              <img 
                src="/logo-cardboard-deep.png" 
                alt="Returnly Logo" 
                className="h-24 sm:h-28 md:h-32 lg:h-40 xl:h-44 w-auto mb-6 lg:mb-8 cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-amber-900 mb-2 tracking-wide">Welcome to Returnly</div>
              <div className="text-xl sm:text-2xl lg:text-3xl text-amber-700 font-medium">Making Returns Effortless</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Section 2: Sophisticated Promotional Banner */}
      <div className="w-full py-12 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.pexels.com/photos/6667682/pexels-photo-6667682.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Delivery man giving packages"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-amber-50/10"></div>
        <div className="relative px-8 lg:px-16 text-center">
          <div className="text-3xl font-bold mb-4 tracking-wide">✨ Special Offer: 50% OFF First Return</div>
          <div className="bg-white text-amber-800 inline-block px-8 py-3 rounded-full font-bold text-xl shadow-lg">
            Use code: RETURN50
          </div>
        </div>
      </div>
      
      {/* Section 3: Sophisticated Main CTA */}
      <div className="w-full py-20 bg-gradient-to-br from-white via-stone-50 to-amber-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-8">
          <img 
            src="https://images.pexels.com/photos/4440774/pexels-photo-4440774.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Person handing over boxes"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-stone-50/60 to-amber-50/70"></div>
        <div className="relative px-8 lg:px-16 max-w-5xl mx-auto">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-amber-900 mb-8 text-center tracking-wide">
            Book Your Return Pickup
          </h2>
          <div className="flex justify-center items-center gap-8 mb-12 flex-wrap text-amber-800">
            <span className="flex items-center gap-3 text-xl font-medium">
              <Clock className="w-6 h-6 text-amber-700" />
              15 min avg pickup
            </span>
            <span className="flex items-center gap-3 text-xl font-medium">
              <Star className="w-6 h-6 text-amber-700" />
              98% success rate
            </span>
            <span className="flex items-center gap-3 text-xl font-medium">
              <MapPin className="w-6 h-6 text-amber-700" />
              500+ retail partners
            </span>
          </div>
          <div className="flex gap-6 justify-center flex-wrap">
            <Button 
              size="lg"
              className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-xl px-12 py-5 h-auto shadow-lg"
              onClick={() => setLocation(isAuthenticated ? '/book-pickup' : '/login')}
              data-testid="button-start-return"
            >
              {isAuthenticated ? 'Book Pickup' : 'Start Return'}
            </Button>
            <Button 
              size="lg"
              variant="outline" 
              className="border-2 border-orange-600 text-orange-600 hover:bg-orange-50 font-bold text-xl px-10 py-4 h-auto"
              onClick={() => setLocation(isAuthenticated ? '/order-status/DEMO01' : '/login')}
              data-testid="button-track-order"
            >
              Track Order
            </Button>
          </div>
        </div>
      </div>

      
      {/* Section 4: Customer Reviews - No borders, with background image */}
      <div className="w-full py-16 bg-gradient-to-r from-blue-50 to-indigo-100 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.pexels.com/photos/6869055/pexels-photo-6869055.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Woman receiving delivered items"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative px-8 lg:px-16">
          <h3 className="text-4xl font-bold text-gray-800 mb-12 text-center">
            What Our Customers Say
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg">
              <div className="flex justify-center text-yellow-500 text-2xl mb-4">
                {'★'.repeat(5)}
              </div>
              <p className="text-gray-700 italic text-lg mb-4">
                "Returnly saved me so much time! No more driving to stores to return items."
              </p>
              <p className="font-semibold text-gray-800">- Sarah M.</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg">
              <div className="flex justify-center text-yellow-500 text-2xl mb-4">
                {'★'.repeat(5)}
              </div>
              <p className="text-gray-700 italic text-lg mb-4">
                "Super convenient and the driver was professional and friendly."
              </p>
              <p className="font-semibold text-gray-800">- Mike R.</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg">
              <div className="flex justify-center text-yellow-500 text-2xl mb-4">
                {'★'.repeat(5)}
              </div>
              <p className="text-gray-700 italic text-lg mb-4">
                "Best $8 I've ever spent. Will definitely use again!"
              </p>
              <p className="font-semibold text-gray-800">- Jennifer L.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: How It Works - No borders, with background image */}
      <div className="w-full py-16 bg-gradient-to-r from-green-50 to-emerald-100 relative overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img 
            src="https://images.pexels.com/photos/4393426/pexels-photo-4393426.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Person organizing packages"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative px-8 lg:px-16 max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold text-gray-800 mb-12 text-center">
            How Returnly Works
          </h3>
          <div className="space-y-6">
            <div className="flex items-center gap-6 bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                1
              </div>
              <span className="text-xl font-medium text-gray-800">Book pickup online or in app</span>
            </div>
            <div className="flex items-center gap-6 bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                2
              </div>
              <span className="text-xl font-medium text-gray-800">Hand package to our driver</span>
            </div>
            <div className="flex items-center gap-6 bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                3
              </div>
              <span className="text-xl font-medium text-gray-800">We take the package back to the designated store</span>
            </div>
            <div className="flex items-center gap-6 bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                4
              </div>
              <span className="text-xl font-medium text-gray-800">You are given your money back through the app</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 6: Retail Partners - No borders, with background image */}
      <div className="w-full py-16 bg-gradient-to-r from-purple-50 to-pink-100 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Shopping bags and retail"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative px-8 lg:px-16">
          <h3 className="text-4xl font-bold text-gray-800 mb-12 text-center">
            Trusted Retail Partners
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {['Target', 'Best Buy', "Macy's", 'REI', 'Nike', '+495 more'].map((retailer) => (
              <div 
                key={retailer}
                className="bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center font-bold text-gray-800 shadow-md"
              >
                {retailer}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 7: Driver Section - No borders, with background image */}
      <div className="w-full py-16 bg-gradient-to-r from-yellow-50 to-amber-100 relative overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img 
            src="https://images.pexels.com/photos/4393558/pexels-photo-4393558.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Delivery driver with van"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative px-8 lg:px-16 max-w-6xl mx-auto space-y-6">
          {/* Main driver CTA */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Earn as a <span className="text-orange-600">Returnly</span> Driver</h3>
              <p className="text-gray-700 text-lg">
                $18-25/hour • Flexible schedule • Instant pay available
              </p>
            </div>
            <Link href="/driver-onboarding">
              <Button 
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xl px-8 py-4 h-auto"
                data-testid="button-apply-driver"
              >
                Apply Now
              </Button>
            </Link>
          </div>

          {/* Driver Benefits */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-yellow-400 text-yellow-900 font-bold">DRIVER BENEFITS</Badge>
                  <div className="bg-white/20 rounded-full p-1">
                    <Star className="h-4 w-4" />
                  </div>
                </div>
                <h4 className="text-xl font-bold mb-2">Delivery Driver Application</h4>
                <p className="text-green-100 mb-3">
                  Join our growing network of delivery drivers with comprehensive training,
                  competitive pay, and flexible scheduling.
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>Competitive hourly rates</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>Instant payment options</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>Safety protocols</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/10 rounded-lg p-3 mb-3">
                  <div className="text-2xl font-bold text-yellow-300">$18-25</div>
                  <div className="text-xs text-green-200">per hour</div>
                </div>
                <Link href="/driver-onboarding">
                  <Button className="bg-white text-green-700 hover:bg-green-50 font-semibold text-sm" data-testid="button-learn-more-benefits">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Payment Benefits Ad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-4 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 rounded-full p-2">
                  <Zap className="h-5 w-5" />
                </div>
                <h5 className="font-bold">Instant Payouts</h5>
              </div>
              <p className="text-blue-100 text-sm mb-2">
                Cash out earnings immediately after each delivery. No waiting for weekly checks!
              </p>
              <div className="text-xs text-blue-200">Available 24/7</div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-pink-700 rounded-lg p-4 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 rounded-full p-2">
                  <Phone className="h-5 w-5" />
                </div>
                <h5 className="font-bold">24/7 Driver Support</h5>
              </div>
              <p className="text-purple-100 text-sm mb-2">
                Dedicated support team available around the clock for assistance and safety.
              </p>
              <div className="text-xs text-purple-200">(314) 555-0199</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Component */}
      <Footer />

      {/* Contact Support Button - Only for authenticated users */}
      {isAuthenticated && (
        <ContactSupportButton 
          context={{ type: 'customer', id: 'CUST001', name: 'Customer' }}
        />
      )}
    </div>
  );
}
