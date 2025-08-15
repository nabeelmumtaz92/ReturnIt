import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation, Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth-simple";
import { ArrowLeft, User, Mail, Phone, Star, Package, DollarSign, Save, LogOut } from "lucide-react";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

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
      setLocation('/');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-primary/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-primary">My Profile</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        
        {/* Profile Overview */}
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-primary text-xl">
                    {user?.firstName} {user?.lastName}
                  </CardTitle>
                  <CardDescription className="flex flex-col gap-1">
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {user?.email}
                    </span>
                    {user?.phone && (
                      <span className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {user?.phone}
                      </span>
                    )}
                  </CardDescription>
                </div>
              </div>
              
              {/* User Role Badge */}
              <div className="flex gap-2">
                <Badge variant={user?.isDriver ? "default" : "secondary"}>
                  {user?.isDriver ? "Driver" : "Customer"}
                </Badge>
                {user?.isAdmin && (
                  <Badge variant="destructive">Admin</Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Driver Stats (if driver) */}
        {user?.isDriver && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {user?.driverRating?.toFixed(1) || "5.0"}
                    </p>
                    <p className="text-sm text-muted-foreground">Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {user?.completedDeliveries || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Deliveries</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      ${user?.totalEarnings?.toFixed(2) || "0.00"}
                    </p>
                    <p className="text-sm text-muted-foreground">Earned</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Settings */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Account Settings</CardTitle>
            <CardDescription>
              Update your profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    data-testid="input-first-name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    data-testid="input-last-name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    data-testid="input-email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    data-testid="input-phone"
                  />
                </div>
              </div>
              
              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                data-testid="button-save-profile"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {user?.isDriver ? (
            <>
              <Link href="/driver-portal">
                <Button variant="outline" className="w-full h-16 border-primary text-primary hover:bg-primary/10">
                  <Package className="h-5 w-5 mr-2" />
                  Driver Portal
                </Button>
              </Link>
              <Link href="/driver-payments">
                <Button variant="outline" className="w-full h-16 border-primary text-primary hover:bg-primary/10">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Payments
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/book-pickup">
                <Button variant="outline" className="w-full h-16 border-primary text-primary hover:bg-primary/10">
                  <Package className="h-5 w-5 mr-2" />
                  Book Pickup
                </Button>
              </Link>
              <Link href="/help-center">
                <Button variant="outline" className="w-full h-16 border-primary text-primary hover:bg-primary/10">
                  <User className="h-5 w-5 mr-2" />
                  Help Center
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}