import { useLocation } from 'wouter';
import { Screen } from '@/components/screen';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Star, MapPin, Clock, Package, CreditCard, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
      url: "/attached_assets/Delivery Driver- Box in Car_1754856749497.jpeg",
      alt: "Delivery driver with box in car"
    },
    {
      url: "/attached_assets/Delivery Driver- Handoff_1754856749519.jpeg", 
      alt: "Delivery driver handing off package"
    },
    {
      url: "/attached_assets/Delivery Driver- outside_1754856749521.jpeg",
      alt: "Delivery driver outside"
    },
    {
      url: "/attached_assets/Delivery Driver Receiving Box_1754856749524.jpeg",
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
      {/* DoorDash-style Hero Section with Real Stock Photo */}
      <div className="relative h-screen overflow-hidden">
        
        {/* Background Image Carousel */}
        <div className="absolute inset-0">
          <img 
            src={deliveryImages[currentImageIndex].url}
            alt={deliveryImages[currentImageIndex].alt}
            className="w-full h-full object-cover transition-opacity duration-1000"
            onError={(e) => {
              // Fallback to first image if current fails to load
              if (currentImageIndex !== 0) {
                setCurrentImageIndex(0);
              }
            }}
          />
          {/* Warm beige overlay to match cardboard theme */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-200 via-yellow-100 to-orange-100"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-20 h-full flex items-center">
          <div className="w-full px-4 sm:px-8 lg:px-16 grid grid-cols-1 gap-8 items-center h-full max-w-6xl mx-auto">
            
            {/* Left side - Main content */}
            <div className="text-amber-900 space-y-6 lg:space-y-8 text-center">
              <div className="flex justify-center mb-6 lg:mb-8">
                <img 
                  src="/logo-cardboard-deep.png" 
                  alt="Returnly Logo" 
                  className="h-28 sm:h-32 md:h-36 lg:h-44 xl:h-52 2xl:h-60 w-auto"
                />
              </div>
              
              <div className="space-y-4 lg:space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold leading-tight">
                  Returns made
                  <br />
                  <span className="text-amber-700">effortless</span>
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-amber-800 font-medium max-w-4xl mx-auto px-4">
                  We pick up your returns and deliver them back to the store. 
                  Zero trips, zero hassle.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-amber-800 text-white hover:bg-amber-900 font-bold text-lg px-8 py-4 h-auto"
                  onClick={() => setLocation(isAuthenticated ? '/book-pickup' : '/login')}
                  data-testid="button-start-return-hero"
                >
                  {isAuthenticated ? 'Book Pickup' : 'Start Return'}
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-amber-800 text-amber-800 hover:bg-amber-800 hover:text-white font-bold text-lg px-8 py-4 h-auto"
                  onClick={() => setLocation('/login')}
                  data-testid="button-sign-in-hero"
                >
                  Sign In
                </Button>
              </div>

              {/* Quick stats */}
              <div className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-12 pt-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold">2hr</div>
                  <div className="text-amber-700 text-sm sm:text-base">Average pickup</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold">500+</div>
                  <div className="text-amber-700 text-sm sm:text-base">Partner stores</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold">$3.99</div>
                  <div className="text-amber-700 text-sm sm:text-base">Starting price</div>
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

      {/* Section 1: Welcome Message - No borders, with background image */}
      <div className="w-full py-12 bg-gradient-to-r from-gray-50 to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.pexels.com/photos/6994108/pexels-photo-6994108.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Packages on porch"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative px-4 sm:px-8 lg:px-16 text-center">
          <div className="flex flex-col items-center justify-center mb-8 lg:mb-12">
            <img 
              src="/logo-cardboard-deep.png" 
              alt="Returnly Logo" 
              className="h-20 sm:h-24 md:h-28 lg:h-36 xl:h-40 w-auto mb-6 lg:mb-8"
            />
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-2">Welcome to Returnly</div>
              <div className="text-lg sm:text-xl lg:text-2xl text-gray-600">Return Delivery Service</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Section 2: Promotional Banner - No borders, with background image */}
      <div className="w-full py-12 bg-gradient-to-r from-orange-500 to-red-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img 
            src="https://images.pexels.com/photos/6667682/pexels-photo-6667682.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Delivery man giving packages"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative px-8 lg:px-16 text-center">
          <div className="text-3xl font-bold mb-4">🎉 Limited Time: 50% OFF First Return</div>
          <div className="bg-white/20 inline-block px-6 py-3 rounded-lg font-bold text-xl">
            Use code: RETURN50
          </div>
        </div>
      </div>
      
      {/* Section 3: Main CTA - No borders, with background image */}
      <div className="w-full py-16 bg-gradient-to-r from-white to-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img 
            src="https://images.pexels.com/photos/4440774/pexels-photo-4440774.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Person handing over boxes"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative px-8 lg:px-16 max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">
            Book Your Return Pickup
          </h2>
          <div className="flex justify-center items-center gap-8 mb-8 flex-wrap text-gray-700">
            <span className="flex items-center gap-2 text-lg">
              <CreditCard className="w-5 h-5 text-orange-600" />
              From $3.99
            </span>
            <span className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-orange-600" />
              Pick up in 2 hours
            </span>
            <span className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5 text-orange-600" />
              500+ retail partners
            </span>
          </div>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xl px-10 py-4 h-auto"
              onClick={() => setLocation(isAuthenticated ? '/book-pickup' : '/login')}
              data-testid="button-start-return"
            >
              {isAuthenticated ? 'Book Pickup' : 'Start Return'} 📦
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
              <span className="text-xl font-medium text-gray-800">We handle the return for you</span>
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
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Earn as a Returnly Driver</h3>
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
            <button className="hover:text-orange-300 transition-colors text-lg">
              About Us
            </button>
            <span className="text-gray-500">•</span>
            <button 
              onClick={() => setLocation('/design-system-demo')}
              className="hover:text-orange-300 transition-colors font-medium text-lg"
            >
              Design System
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
    </div>
  );
}
