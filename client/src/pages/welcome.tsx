import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Truck, Package, User, Search, LogOut } from 'lucide-react';
import Footer from '@/components/Footer';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { useState } from 'react';
import { useAuth } from "@/hooks/useAuth-simple";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LogoIcon } from "@/components/LogoIcon";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-primary/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <LogoIcon size={32} className="text-primary" />
              <span className="text-xl font-bold text-primary">Returnly</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <RoleSwitcher />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Mobile Optimized */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 space-y-8">
        
        {/* Returnly Title - Centered */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-primary mb-4">
            Returnly
          </h1>
        </div>

        {/* Hassle Free - Centered */}
        <div className="text-center">
          <p className="text-xl sm:text-2xl text-primary/80 font-medium">
            Hassle-free returns with professional pickup service
          </p>
        </div>

        {/* Buttons - Side by Side */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link href="/book-pickup" className="flex-1">
            <Button 
              size="lg" 
              className="w-full bg-primary hover:bg-primary/90 text-white py-4 text-lg"
              data-testid="button-book-pickup"
            >
              <Package className="h-5 w-5 mr-2" />
              Book Pickup
            </Button>
          </Link>
          
          <Link href="/login" className="flex-1">
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full border-primary text-primary hover:bg-primary/10 py-4 text-lg"
              data-testid="button-sign-in"
            >
              <User className="h-5 w-5 mr-2" />
              Sign In
            </Button>
          </Link>
        </div>

        {/* Become a Driver - Separate Tab */}
        <div className="mt-8 pt-8 border-t border-primary/20">
          <div className="text-center space-y-4">
            <p className="text-primary/70 text-sm">
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

        {/* Order Tracking Section */}
        <div className="w-full max-w-md mt-12 pt-8 border-t border-primary/20">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-primary">
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
    </div>
  );
}