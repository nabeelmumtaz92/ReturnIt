import React from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Truck, Package, User, Search, LogOut, Settings, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

      {/* Sign In/Sign Up buttons in top right */}
      <div className="w-full bg-white/95 border-b border-amber-100">
        <div className="container mx-auto px-4 pt-3 pb-2">
          <div className="flex justify-end">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 border-amber-300 hover:bg-amber-50" data-testid="button-user-menu">
                    <div className="flex flex-col items-start">
                      <span className="text-xs sm:text-sm font-medium text-amber-900">
                        {user?.firstName} {user?.lastName}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-amber-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-semibold text-amber-900">
                    {user?.firstName} {user?.lastName}
                  </div>
                  {user?.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin-dashboard">
                        <div className="flex items-center w-full cursor-pointer" data-testid="menu-admin-dashboard">
                          <User className="h-4 w-4 mr-2" />
                          <span>Admin Dashboard</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user?.isDriver && (
                    <DropdownMenuItem asChild>
                      <Link href="/driver-portal">
                        <div className="flex items-center w-full cursor-pointer" data-testid="menu-driver-portal">
                          <Truck className="h-4 w-4 mr-2" />
                          <span>Driver Portal</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user && !user.isDriver && !user.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/customer-dashboard">
                        <div className="flex items-center w-full cursor-pointer" data-testid="menu-customer-dashboard">
                          <User className="h-4 w-4 mr-2" />
                          <span>My Dashboard</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/account-settings">
                      <div className="flex items-center w-full cursor-pointer" data-testid="menu-settings">
                        <Settings className="h-4 w-4 mr-2" />
                        <span>Settings</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer" data-testid="menu-sign-out">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Headers Left, Image Right, Button Below */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-8 lg:py-12 space-y-6">
        
        {/* Hero Section: Headers Left, Truck Image Right */}
        <div className="w-full max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
            
            {/* Left Side - All Headers */}
            <div className="flex-1 space-y-4 text-center lg:text-left">
              {/* Return It Logo */}
              <div className="flex justify-center lg:justify-start">
                <svg 
                  width="80" 
                  height="80" 
                  viewBox="0 0 100 100" 
                  className="filter drop-shadow-lg"
                  aria-label="Return It"
                >
                  <text 
                    x="50" 
                    y="75" 
                    fontSize="80" 
                    fontWeight="700" 
                    fill="#8B4513"
                    fontFamily="Inter, system-ui, sans-serif"
                    textAnchor="middle"
                    letterSpacing="-2px"
                  >
                    R
                  </text>
                </svg>
              </div>
              
              {/* Slogan */}
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-black font-medium italic text-amber-700">
                Return It. Give back, uplift others.
              </p>
              
              {/* Tagline */}
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-black font-semibold">
                The Leader in Returns Delivery and Reverse Logistics.
              </p>
              
              {/* St. Louis Notice */}
              <div className="bg-amber-100 border border-amber-200 rounded-lg px-4 sm:px-6 py-2 sm:py-3 inline-block">
                <p className="text-sm sm:text-base lg:text-lg text-black font-semibold">
                  📍 St. Louis only right now
                </p>
                <p className="text-xs sm:text-sm text-black mt-1">
                  Coming to your city soon!
                </p>
              </div>
            </div>

            {/* Right Side - Truck Image */}
            <div className="flex-shrink-0 w-full lg:w-auto max-w-md lg:max-w-lg">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-200">
                <img 
                  src={deliveryHandoffImg} 
                  alt="Professional delivery service homepage hero" 
                  className="w-full h-48 sm:h-56 md:h-64 object-cover img-crisp"
                />
                <div className="p-6 bg-amber-50">
                  <h3 className="text-xl font-semibold text-amber-900 mb-2">
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

        {/* Book Return Button - Centered Below */}
        <div className="w-full flex justify-center mt-6">
          <Button 
            size="lg" 
            className="w-full sm:w-auto px-8 py-6 bg-amber-800 hover:bg-amber-900 text-white text-base font-semibold shadow-lg hover:shadow-xl transition-all"
            data-testid="button-book-return"
            onClick={() => setLocation('/book-return')}
          >
            <Package className="h-5 w-5 mr-2" />
            Book Return
          </Button>
        </div>

        {/* Driver Benefits Section with Become a Driver Button */}
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
                <div className="pt-4">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto px-8 py-6 bg-amber-600 hover:bg-amber-700 text-white text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                    data-testid="button-become-driver"
                    onClick={() => setLocation('/driver-signup')}
                  >
                    <Truck className="h-5 w-5 mr-2" />
                    Become a Driver
                  </Button>
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
