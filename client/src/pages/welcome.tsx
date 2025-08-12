import { useLocation, Link } from 'wouter';
import { Screen } from '@/components/screen';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Truck, Star, MapPin, Clock, Package, CreditCard, LogOut, User, Settings, Shield, Search, HeadphonesIcon } from 'lucide-react';
import SupportChat from '@/components/SupportChat';
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

export default function Welcome() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [showSupportChat, setShowSupportChat] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-stone-100">
      {/* Sophisticated White/Beige Hero Section */}
      <div className="relative min-h-screen bg-gradient-to-br from-white via-stone-50 to-amber-50 overflow-hidden">
        
        {/* Background with Stock Delivery Image */}
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.pexels.com/photos/13443801/pexels-photo-13443801.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Professional delivery service"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-white via-stone-50/80 to-amber-50/60"></div>
        
        {/* Hero Content */}
        <div className="relative z-20 h-full flex items-center">
          <div className="w-full px-4 sm:px-8 lg:px-16 grid grid-cols-1 gap-8 items-center h-full max-w-6xl mx-auto">
            
            {/* Left side - Main content */}
            <div className="text-amber-900 space-y-6 lg:space-y-8 text-center">
              <div className="flex justify-center mb-6 lg:mb-8">
                <Link href="/">
                  <img 
                    src="/logo-cardboard-deep.png" 
                    alt="Returnly Logo" 
                    className="h-28 sm:h-32 md:h-36 lg:h-44 xl:h-52 2xl:h-60 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </Link>
              </div>
              
              <div className="space-y-4 lg:space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold leading-tight">
                  Returns made
                  <br />
                  <span className="text-amber-700">easy</span>
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-amber-800 font-medium max-w-4xl mx-auto px-4">
                  We pick up your returns and deliver them back to the store. 
                  Zero trips, zero hassle.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isAuthenticated ? (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg"
                      className="bg-amber-800 text-white hover:bg-amber-900 font-bold text-lg px-8 py-4 h-auto"
                      onClick={() => setLocation('/book-pickup')}
                      data-testid="button-book-pickup-hero"
                    >
                      Book Pickup
                    </Button>
                    
                    {/* Track Order - Only for authenticated users */}
                    <div className="flex flex-col sm:flex-row gap-3 items-center bg-white/80 backdrop-blur-sm rounded-lg border border-amber-200 p-4">
                      <Label htmlFor="tracking" className="text-amber-800 font-medium whitespace-nowrap">
                        Track Order:
                      </Label>
                      <Input
                        id="tracking"
                        type="text"
                        placeholder="Enter order ID"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="flex-1 bg-white/90 border-amber-300 focus:border-amber-500"
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
                        className="bg-amber-700 hover:bg-amber-800 text-white px-6"
                        data-testid="button-track-order"
                      >
                        <Search className="h-4 w-4 mr-2" />
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

              {/* Updated Quick stats */}
              <div className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-12 pt-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold">15min</div>
                  <div className="text-amber-700 text-sm sm:text-base">Avg pickup time</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold">500+</div>
                  <div className="text-amber-700 text-sm sm:text-base">Partner stores</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold">12k+</div>
                  <div className="text-amber-700 text-sm sm:text-base">Hours saved</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold">98%</div>
                  <div className="text-amber-700 text-sm sm:text-base">Success rate</div>
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
        <div className="relative px-8 lg:px-16 max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Earn as a <span className="text-orange-600">Returnly</span> Driver</h3>
              <p className="text-gray-700 text-lg">
                $18-25/hour • Flexible schedule • Weekly pay
              </p>
            </div>
            <Button 
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xl px-8 py-4 h-auto"
              onClick={() => alert('Driver Portal\n\nComing soon to App Store & Google Play!\n\nEarn up to $25/hour with flexible scheduling.')}
              data-testid="button-apply-driver"
            >
              Apply Now
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Section - No borders, with background image */}
      <div className="w-full py-12 bg-gradient-to-r from-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.pexels.com/photos/586744/pexels-photo-586744.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Modern office building"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative px-8 lg:px-16">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-4">
              <img 
                src="/logo-cardboard-deep.png" 
                alt="Returnly Logo" 
                className="h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              />
              <h3 className="text-3xl font-bold text-white tracking-wider">RETURNLY</h3>
              <p className="text-gray-300 text-lg">Return Delivery Service</p>
            </div>
          </div>
          <div className="flex justify-center items-center gap-6 text-white flex-wrap">
            <button 
              onClick={() => setLocation('/login')}
              className="hover:text-orange-300 transition-colors text-lg"
            >
              Sign In
            </button>
            <span className="text-gray-500">•</span>
            <button className="hover:text-orange-300 transition-colors text-lg">
              Help Center
            </button>
            <span className="text-gray-500">•</span>
            <button 
              onClick={() => setLocation('/about')}
              className="hover:text-orange-300 transition-colors text-lg"
              data-testid="button-footer-about"
            >
              About Us
            </button>
            <span className="text-gray-500">•</span>
            <button 
              onClick={() => setLocation('/help-center')}
              className="hover:text-orange-300 transition-colors font-medium text-lg"
            >
              Help Center
            </button>
            <span className="text-gray-500">•</span>
            <button 
              onClick={() => setLocation('/mobile-app-demo')}
              className="hover:text-orange-300 transition-colors font-medium text-lg"
            >
              Mobile App
            </button>
          </div>
        </div>
      </div>

      {/* Floating Support Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setShowSupportChat(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white rounded-full w-14 h-14 shadow-lg"
          size="lg"
        >
          <HeadphonesIcon className="h-6 w-6" />
        </Button>
      </div>

      {/* Support Chat */}
      <SupportChat 
        isOpen={showSupportChat}
        onClose={() => setShowSupportChat(false)}
        context={{ type: 'customer', id: 'CUST001', name: 'Customer' }}
      />
    </div>
  );
}
