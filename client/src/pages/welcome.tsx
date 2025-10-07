import React from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Truck, Package, User, Search, LogOut, Settings, Home, ChevronRight } from 'lucide-react';
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
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#231b0f] flex flex-col">
      
      {/* Sticky Header with Backdrop Blur - Stitch Pattern */}
      <header className="bg-[#f8f7f5]/80 dark:bg-[#231b0f]/80 backdrop-blur-sm sticky top-0 z-20 border-b border-primary/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-foreground">ReturnIt</h1>
            <nav className="flex items-center space-x-2 sm:space-x-4">
              {!isAuthenticated ? (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-sm font-semibold" data-testid="button-sign-in">
                      Login
                    </Button>
                  </Link>
                  <Link href="/login?tab=register">
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-semibold px-4 py-2 rounded-full" data-testid="button-sign-up">
                      Book Pickup
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  {user?.isAdmin && (
                    <Link href="/admin-dashboard">
                      <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90" data-testid="button-admin-dashboard">
                        <User className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Admin</span>
                      </Button>
                    </Link>
                  )}
                  {user?.isDriver && (
                    <Link href="/driver-portal">
                      <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90" data-testid="button-driver-portal">
                        <Truck className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Portal</span>
                      </Button>
                    </Link>
                  )}
                  {user && !user.isDriver && !user.isAdmin && (
                    <Link href="/customer-dashboard">
                      <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700" data-testid="button-customer-dashboard">
                        <User className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Dashboard</span>
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    data-testid="button-sign-out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section with Image Overlay - Stitch Visual Pattern */}
      <main className="flex-grow">
        <div className="p-4 space-y-4">
          <div className="relative rounded-xl overflow-hidden shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_30px_-15px_rgba(249,152,6,0.2)]">
            <img 
              alt="Professional reverse logistics delivery service" 
              className="absolute inset-0 w-full h-full object-cover" 
              src={deliveryHandoffImg}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20"></div>
            <div className="relative p-6 sm:p-8 pt-32 sm:pt-48 flex flex-col items-start justify-end text-white min-h-[300px] sm:min-h-[400px]">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
                The Category Leader in Reverse Logistics
              </h2>
              <p className="mt-3 max-w-2xl text-base sm:text-lg font-normal leading-relaxed">
                ReturnIt is the first platform purpose-built for reverse logistics — offering on-demand returns, exchanges, refunds, and donations as seamless as delivery itself. We're not just an app; we are the infrastructure powering the return economy.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button 
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-full text-base shadow-lg"
                  data-testid="button-book-pickup-hero"
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
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-8 rounded-full text-base"
                  data-testid="button-track-order-hero"
                  onClick={() => setLocation('/track')}
                >
                  <Search className="h-5 w-5 mr-2" />
                  Track Order
                </Button>
              </div>
            </div>
          </div>

          {/* Service Location Notice - Card Pattern */}
          <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 dark:bg-primary/30 p-2 rounded-full">
                  <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-foreground">📍 St. Louis only right now</p>
                  <p className="text-sm text-muted-foreground">Coming to your city soon!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Value Propositions - Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Fast & Reliable</h3>
                  <p className="text-sm text-muted-foreground">On-demand pickups and same-day service for your convenience</p>
                </div>
              </div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Professional Drivers</h3>
                  <p className="text-sm text-muted-foreground">Verified, trained drivers ensuring secure package handling</p>
                </div>
              </div>
            </div>
          </div>

          {/* Become a Driver Section - Stitch Card Pattern */}
          {envConfig?.allowDriverSignup && (
            <div className="mt-8">
              <div className="bg-gradient-to-br from-primary via-orange-500 to-transparent0 rounded-xl p-6 sm:p-8 text-white shadow-lg">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                      <Truck className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                      Drive with ReturnIt
                    </h3>
                    <p className="text-white/95 text-base sm:text-lg leading-relaxed mb-4">
                      Join St. Louis's premier reverse logistics network. Earn competitive pay helping customers with returns, exchanges, and donations. Flexible schedules, instant payouts, and full support.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Earn $15-25/hour</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Flexible schedule</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Instant payouts</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Link href="/driver-signup">
                      <Button 
                        size="lg"
                        className="bg-white text-primary hover:bg-white/90 font-bold px-8 rounded-full shadow-lg"
                        data-testid="button-become-driver-main"
                      >
                        Apply to Drive
                        <ChevronRight className="h-5 w-5 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Track Section - Card Pattern */}
          <div className="mt-8">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4 text-center sm:text-left">Track Your Order</h3>
              <div className="flex flex-col sm:flex-row gap-3">
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
                  className="bg-primary hover:bg-primary/90 rounded-lg"
                  data-testid="button-track"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Track
                </Button>
              </div>
            </div>
          </div>

          {/* Environment Notice */}
          {envConfig && !envConfig.allowPublicLogin && (
            <div className="text-center p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm font-medium">
                Access Restricted
              </p>
              <p className="text-destructive/80 text-xs mt-1">
                This platform is for authorized personnel only.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation - Stitch Mobile Pattern */}
      <footer className="bg-[#f8f7f5]/80 dark:bg-[#231b0f]/80 border-t border-primary/20 sticky bottom-0 backdrop-blur-sm md:hidden">
        <nav className="container mx-auto px-4 py-3 flex justify-around">
          <Link href="/" className="flex flex-col items-center gap-1 text-primary" data-testid="nav-home">
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link href="/track" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors" data-testid="nav-track">
            <Package className="h-5 w-5" />
            <span className="text-xs font-medium">Track</span>
          </Link>
          <Link href={isAuthenticated ? "/customer-dashboard" : "/login"} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors" data-testid="nav-account">
            <User className="h-5 w-5" />
            <span className="text-xs font-medium">Account</span>
          </Link>
        </nav>
      </footer>

      {/* Desktop Footer */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
