import React from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Truck, Package, User, Search, LogOut } from 'lucide-react';
import Footer from '@/components/Footer';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { useState } from 'react';
import { useAuth } from "@/hooks/useAuth-simple";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
// LogoIcon removed
import { ReturnItLogo } from "@/components/ReturnItLogo";
import ContactSupportButton from "@/components/ContactSupportButton";
import deliveryDriverImage from "@assets/image_1755273879529.png";

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

  // Check if user is on mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const urlParams = new URLSearchParams(window.location.search);
  const mobileParam = urlParams.get('mobile');

  // Debug logging for mobile issues
  React.useEffect(() => {
    console.log('Welcome page loaded');
    console.log('User agent:', navigator.userAgent);
    console.log('Is mobile:', isMobile);
    console.log('Mobile param:', mobileParam);
    console.log('Current URL:', window.location.href);
    console.log('User authenticated:', isAuthenticated);
    console.log('User data:', user);
  }, [isAuthenticated, user, isMobile, mobileParam]);

  // Fetch environment configuration
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      {/* Professional Hero Section */}
      <div className="w-full bg-white/95 border-b border-amber-100">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row items-center gap-12 max-w-7xl mx-auto">
            {/* Hero Content */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold text-amber-900 mb-6">
                ReturnIt
              </h1>
              <p className="text-2xl text-amber-700 mb-8">
                Professional pickup service for returns, exchanges, and donations
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 mb-8">
                <div className="flex items-center gap-3 text-amber-600">
                  <Package className="h-6 w-6" />
                  <span className="text-lg">Fast & Reliable</span>
                </div>
                <div className="flex items-center gap-3 text-amber-600">
                  <Truck className="h-6 w-6" />
                  <span className="text-lg">Professional Drivers</span>
                </div>
              </div>
            </div>
            {/* Hero Image Card */}
            <div className="flex-1 max-w-lg">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-200">
                <img 
                  src={deliveryDriverImage} 
                  alt="Professional delivery service" 
                  className="w-full h-80 object-cover"
                />
                <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50">
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
      
      {/* Top Navigation Bar */}
      <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-primary/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              {isAuthenticated ? (
                <>
                  {user?.isAdmin ? (
                    <Link href="/admin-dashboard">
                      <Button variant="default" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" data-testid="button-admin-dashboard">
                        <User className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <span className="text-amber-800 font-medium">
                      Welcome, {user?.firstName || user?.email?.split('@')[0] || 'User'}!
                    </span>
                  )}
                  <RoleSwitcher />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    data-testid="button-sign-out"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/login?tab=register">
                    <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Mobile Optimized */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 space-y-8">
        
        {/* ReturnIt Logo - Centered */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="text-6xl font-bold text-amber-900 filter drop-shadow-lg">
              ReturnIt
            </div>
          </div>
        </div>

        {/* Service Area and Description - Centered */}
        <div className="text-center space-y-3">
          <p className="text-xl sm:text-2xl text-amber-800 font-medium">
            Hassle-free returns with professional return delivery service
          </p>
          <div className="bg-amber-100 border border-amber-200 rounded-lg px-6 py-3 inline-block">
            <p className="text-lg text-amber-900 font-semibold">
              📍 St. Louis only right now
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Coming to your city soon!
            </p>
          </div>
        </div>

        {/* Buttons - Vertical Stack on Mobile */}
        <div className="flex flex-col gap-4 w-full max-w-md">
          <Button 
            size="lg" 
            className="w-full bg-amber-800 hover:bg-amber-900 text-white py-4 text-lg"
            data-testid="button-book-pickup"
            onClick={() => {
              if (isAuthenticated) {
                setLocation('/book-pickup');
              } else {
                setLocation('/login');
              }
            }}
          >
            <Package className="h-5 w-5 mr-2" />
            Book Pickup
          </Button>
        </div>

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

        {/* Become a Driver - Separate Tab */}
        {envConfig?.allowDriverSignup && (
          <div className="mt-8 pt-8 border-t border-primary/20">
            <div className="text-center space-y-4">
              <p className="text-amber-700 text-sm">
                Interested in earning money as a driver?
              </p>
              <Link href="/driver-onboarding">
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary/10"
                  data-testid="button-become-driver"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Become a Driver
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Order Tracking Section */}
        <div className="w-full max-w-md mt-12 pt-8 border-t border-primary/20">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-amber-900">
              Track Your Order
            </h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="flex-1"
                data-testid="input-tracking"
              />
              <Button 
                onClick={() => {
                  if (trackingNumber.trim()) {
                    setLocation(`/order-status/${trackingNumber.trim()}`);
                  }
                }}
                disabled={!trackingNumber.trim()}
                data-testid="button-track"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
      
      {/* Floating Support Chat Button */}
      <ContactSupportButton 
        context={{
          type: isAuthenticated ? (user?.isAdmin ? 'customer' : 'customer') : 'customer',
          id: user?.id ? String(user.id) : 'GUEST',
          name: user?.firstName || 'Customer'
        }}
      />
    </div>
  );
}