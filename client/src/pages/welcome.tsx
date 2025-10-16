import React from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Truck, Package, User, Search, LogOut, Settings } from 'lucide-react';
import Footer from '@/components/Footer';
import { useState } from 'react';
import { useAuth } from "@/hooks/useAuth-simple";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import deliveryHandoffImg from "@assets/generated_images/Professional_delivery_homepage_hero_4017d9ae.png";

interface EnvironmentConfig {
  allowPublicRegistration: boolean;
  allowPublicLogin: boolean;
  allowGoogleAuth: boolean;
  allowDriverSignup: boolean;
  enableDemoMode: boolean;
  environment: string;
}

export default function Welcome() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [trackingNumber, setTrackingNumber] = useState('');

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const { data: envConfig } = useQuery<EnvironmentConfig>({
    queryKey: ['/api/config/environment'],
  });

  const handleLogout = () => {
    logout();
    toast({
      title: "Goodbye!",
      description: "You have been signed out successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-amber-50">

      {/* Professional Hero Section */}
      <div className="w-full bg-white/95 border-b border-amber-100 relative">
        {/* Sign In/Sign Up buttons in top right */}
        <div className="absolute top-2 sm:top-3 md:top-2 right-2 sm:right-4 z-10">
          {!isAuthenticated && (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm" data-testid="button-sign-in">
                  Sign In
                </Button>
              </Link>
              <Link href="/login?tab=register">
                <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90" data-testid="button-sign-up">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <Settings className="h-4 w-4 text-amber-600" />
                <span className="text-xs sm:text-sm font-medium text-amber-900">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              {user?.isAdmin && (
                <Link href="/admin-dashboard">
                  <Button variant="default" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" data-testid="button-admin-dashboard">
                    <User className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Admin Dashboard</span>
                    <span className="sm:hidden">Admin</span>
                  </Button>
                </Link>
              )}
              {user?.isDriver && (
                <Link href="/driver-portal">
                  <Button variant="default" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" data-testid="button-driver-portal">
                    <Truck className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Driver Portal</span>
                    <span className="sm:hidden">Portal</span>
                  </Button>
                </Link>
              )}
              {user && !user.isDriver && !user.isAdmin && (
                <Link href="/customer-dashboard">
                  <Button variant="default" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" data-testid="button-customer-dashboard">
                    <User className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">My Dashboard</span>
                    <span className="sm:hidden">Dashboard</span>
                  </Button>
                </Link>
              )}
              <Link href="/account-settings">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                  data-testid="button-account-settings"
                >
                  <Settings className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                data-testid="button-sign-out"
              >
                <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Out</span>
              </Button>
            </div>
          )}
        </div>
        <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
          <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-12 max-w-7xl mx-auto">
            {/* Hero Content */}
            <div className="flex-1 text-center lg:text-left pt-8 sm:pt-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-900 mb-2 sm:mb-3">
                Return It
              </h1>
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-amber-800 mb-4 sm:mb-6">
                The Leader in Reverse Logistics, Delivery, and Returns.
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-amber-700 mb-4 sm:mb-6 leading-relaxed">
                Return It is the first platform purpose-built for reverse logistics — offering on-demand returns, exchanges, refunds, and donations as seamless as delivery itself. We're not just an app; we are the infrastructure powering the return economy.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3 text-amber-600">
                  <Package className="h-4 w-4 sm:h-6 sm:w-6" />
                  <span className="text-sm sm:text-base md:text-lg">Fast & Reliable</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-amber-600">
                  <Truck className="h-4 w-4 sm:h-6 sm:w-6" />
                  <span className="text-sm sm:text-base md:text-lg">Professional Drivers</span>
                </div>
              </div>
            </div>
            {/* Hero Image Card */}
            <div className="flex-1 max-w-lg">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-200">
                <img 
                  src={deliveryHandoffImg} 
                  alt="Professional delivery service homepage hero" 
                  className="w-full h-40 sm:h-56 md:h-64 object-cover img-crisp"
                />
                <div className="p-6 bg-amber-50">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">
                    Professional Service
                  </h3>
                  <p className="text-amber-700">
                    Trusted by customers for reliable pickup and delivery
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      

      {/* Main Content - Mobile Optimized */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
        
        {/* Return It Logo - Centered */}
        <div className="text-center">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black filter drop-shadow-lg">
              Return It
            </div>
          </div>
        </div>

        {/* Service Area and Description - Centered */}
        <div className="text-center space-y-3">
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-black font-medium px-2">
            The Leader in Reverse Logistics, Delivery, and Returns
          </p>
          <div className="bg-amber-100 border border-amber-200 rounded-lg px-4 sm:px-6 py-2 sm:py-3 inline-block">
            <p className="text-sm sm:text-base lg:text-lg text-black font-semibold">
              📍 St. Louis only right now
            </p>
            <p className="text-xs sm:text-sm text-black mt-1">
              Coming to your city soon!
            </p>
          </div>
        </div>

        {/* Buttons - Evenly Spaced and Centered */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-4xl px-4">
          <Button 
            size="lg" 
            className="w-full sm:w-auto px-8 py-6 bg-amber-800 hover:bg-amber-900 text-white text-base font-semibold shadow-lg hover:shadow-xl transition-all"
            data-testid="button-book-pickup"
            onClick={() => setLocation('/book-pickup')}
          >
            <Package className="h-5 w-5 mr-2" />
            Book Pickup
          </Button>
          
          <Button 
            size="lg" 
            className="w-full sm:w-auto px-8 py-6 bg-amber-700 hover:bg-amber-800 text-white text-base font-semibold shadow-lg hover:shadow-xl transition-all"
            data-testid="button-track-order"
            onClick={() => setLocation('/tracking')}
          >
            <Search className="h-5 w-5 mr-2" />
            Track Order
          </Button>
          
          {envConfig?.allowDriverSignup && (
            <Button 
              size="lg" 
              className="w-full sm:w-auto px-8 py-6 bg-amber-600 hover:bg-amber-700 text-white text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              data-testid="button-become-driver"
              onClick={() => setLocation('/driver-signup')}
            >
              <Truck className="h-5 w-5 mr-2" />
              Become a Driver
            </Button>
          )}
        </div>

        {/* Driver Benefits Section - Info Only */}
        {envConfig?.allowDriverSignup && (
          <div className="w-full max-w-3xl mt-8 sm:mt-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-amber-200 shadow-lg">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-amber-100 rounded-full p-3">
                    <Truck className="h-8 w-8 text-amber-700" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-amber-900">
                  Drive with Return It
                </h3>
                <p className="text-amber-800 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                  Join St. Louis's premier reverse logistics network. Earn competitive pay helping customers with returns, exchanges, and donations.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-sm">
                  <div className="flex items-center justify-center gap-2 text-amber-700">
                    <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                    <span className="font-medium">Earn $15-25/hour</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-amber-700">
                    <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                    <span className="font-medium">Flexible schedule</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-amber-700">
                    <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                    <span className="font-medium">Instant payouts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Environment Notice for Restricted Access */}
        {envConfig && !envConfig.allowPublicLogin && (
          <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg max-w-md">
            <p className="text-red-800 text-sm font-medium">
              Access Restricted
            </p>
            <p className="text-red-700 text-xs mt-1">
              This platform is for authorized personnel only.
            </p>
          </div>
        )}


      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
