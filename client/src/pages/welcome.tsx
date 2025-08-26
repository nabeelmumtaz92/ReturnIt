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
import { LogoIcon } from "@/components/LogoIcon";
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
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" 
      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${deliveryDriverImage})`
      }}>
      
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
                    <Link href="/profile">
                      <Button variant="ghost" size="sm" data-testid="button-profile">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Button>
                    </Link>
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
            <svg width="400" height="120" viewBox="0 0 400 120" className="filter drop-shadow-lg">
              {/* "ReturnIt" text - exact match to your image */}
              <text x="20" y="80" fontFamily="Arial, Helvetica, sans-serif" fontSize="48" fontWeight="700" fill="#FFFFFF">
                ReturnIt
              </text>
              
              {/* 3D Box Icon - exact match to your image */}
              <g transform="translate(300, 20)">
                {/* Back top edge */}
                <path d="M10 30 L50 15 L90 30" 
                      fill="none" 
                      stroke="#FFFFFF" 
                      strokeWidth="4" 
                      strokeLinecap="round"
                      strokeLinejoin="round"/>
                
                {/* Front top edge */}
                <path d="M10 50 L50 35 L90 50" 
                      fill="none" 
                      stroke="#FFFFFF" 
                      strokeWidth="4" 
                      strokeLinecap="round"
                      strokeLinejoin="round"/>
                
                {/* Left face */}
                <path d="M10 30 L10 50 L50 65 L50 45 Z" 
                      fill="none" 
                      stroke="#FFFFFF" 
                      strokeWidth="4" 
                      strokeLinejoin="round"/>
                
                {/* Right face */}
                <path d="M50 45 L50 65 L90 50 L90 30 Z" 
                      fill="none" 
                      stroke="#FFFFFF" 
                      strokeWidth="4" 
                      strokeLinejoin="round"/>
                
                {/* Top face */}
                <path d="M10 30 L50 15 L90 30 L50 45 Z" 
                      fill="none" 
                      stroke="#FFFFFF" 
                      strokeWidth="4" 
                      strokeLinejoin="round"/>
                
                {/* Front face */}
                <path d="M10 50 L50 35 L50 65 L10 80 Z" 
                      fill="none" 
                      stroke="#FFFFFF" 
                      strokeWidth="4" 
                      strokeLinejoin="round"/>
                
                {/* Vertical connecting lines */}
                <path d="M10 30 L10 50" 
                      stroke="#FFFFFF" 
                      strokeWidth="4" 
                      strokeLinecap="round"/>
                <path d="M50 15 L50 35" 
                      stroke="#FFFFFF" 
                      strokeWidth="4" 
                      strokeLinecap="round"/>
                <path d="M90 30 L90 50" 
                      stroke="#FFFFFF" 
                      strokeWidth="4" 
                      strokeLinecap="round"/>
                
                {/* Small circular dot on front face */}
                <circle cx="35" cy="55" r="3" fill="#FFFFFF"/>
              </g>
            </svg>
          </div>
        </div>

        {/* Service Area and Description - Centered */}
        <div className="text-center space-y-3">
          <p className="text-xl sm:text-2xl text-white/90 font-medium">
            Hassle-free returns with professional pickup service
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 inline-block">
            <p className="text-lg text-white font-semibold">
              📍 St. Louis only right now
            </p>
            <p className="text-sm text-white/80 mt-1">
              Coming to your city soon!
            </p>
          </div>
        </div>

        {/* Buttons - Vertical Stack on Mobile */}
        <div className="flex flex-col gap-4 w-full max-w-md">
          <Link href="/book-pickup" className="w-full">
            <Button 
              size="lg" 
              className="w-full bg-primary hover:bg-primary/90 text-white py-4 text-lg"
              data-testid="button-book-pickup"
            >
              <Package className="h-5 w-5 mr-2" />
              Book Pickup
            </Button>
          </Link>
          
          {/* Show Sign In and Sign Up buttons only if login is allowed */}
          {envConfig?.allowPublicLogin && (
            <div className="flex gap-2 justify-center w-full">
              <Link href="/login">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-white/70 bg-white/10 text-white hover:bg-white/20 px-4 py-1.5 text-sm backdrop-blur-sm"
                  data-testid="button-sign-in"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/login?tab=register">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-white/70 bg-white/10 text-white hover:bg-white/20 px-4 py-1.5 text-sm backdrop-blur-sm"
                  data-testid="button-sign-up"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
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
              <p className="text-white text-sm">
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
            <h3 className="text-lg font-semibold text-white">
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