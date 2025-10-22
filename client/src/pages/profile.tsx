import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation, Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth-simple";
import { ArrowLeft, User, Mail, Phone, Star, Package, DollarSign, Save, LogOut, MapPin, Calendar, Heart, Shield, Building, Car } from "lucide-react";
import { vehicleData } from "@/data/vehicleData";

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
    dateOfBirth: user?.dateOfBirth || '',
    streetAddress: (user?.addresses && user.addresses[0]?.streetAddress) || '',
    city: (user?.addresses && user.addresses[0]?.city) || '',
    state: (user?.addresses && user.addresses[0]?.state) || '',
    zipCode: (user?.addresses && user.addresses[0]?.zipCode) || '',
    emergencyContactName: (user?.emergencyContacts && user.emergencyContacts[0]?.name) || '',
    emergencyContactPhone: (user?.emergencyContacts && user.emergencyContacts[0]?.phone) || '',
    emergencyContactRelation: (user?.emergencyContacts && user.emergencyContacts[0]?.relationship) || '',
    vehicleMake: user?.vehicleMake || '',
    vehicleModel: user?.vehicleModel || '',
    vehicleYear: user?.vehicleYear?.toString() || '',
    vehicleColor: user?.vehicleColor || '',
    vehicleType: user?.vehicleType || '',
    licensePlate: user?.licensePlate || '',
    preferences: {
      notifications: user?.preferences?.notifications || true,
      emailUpdates: user?.preferences?.emailUpdates || true,
      smsUpdates: user?.preferences?.smsUpdates || true,
      language: user?.preferences?.language || 'en',
      timezone: user?.preferences?.timezone || 'America/Chicago'
    }
  });

  // Initialize form data only when user first loads (prevents input deletion bug)
  const [hasInitializedFormData, setHasInitializedFormData] = React.useState(false);
  
  React.useEffect(() => {
    if (user && !hasInitializedFormData) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        streetAddress: (user.addresses && user.addresses[0]?.streetAddress) || '',
        city: (user.addresses && user.addresses[0]?.city) || '',
        state: (user.addresses && user.addresses[0]?.state) || '',
        zipCode: (user.addresses && user.addresses[0]?.zipCode) || '',
        emergencyContactName: (user.emergencyContacts && user.emergencyContacts[0]?.name) || '',
        emergencyContactPhone: (user.emergencyContacts && user.emergencyContacts[0]?.phone) || '',
        emergencyContactRelation: (user.emergencyContacts && user.emergencyContacts[0]?.relationship) || '',
        vehicleMake: user.vehicleMake || '',
        vehicleModel: user.vehicleModel || '',
        vehicleYear: user.vehicleYear?.toString() || '',
        vehicleColor: user.vehicleColor || '',
        vehicleType: user.vehicleType || '',
        licensePlate: user.licensePlate || '',
        preferences: {
          notifications: user.preferences?.notifications || true,
          emailUpdates: user.preferences?.emailUpdates || true,
          smsUpdates: user.preferences?.smsUpdates || true,
          language: user.preferences?.language || 'en',
          timezone: user.preferences?.timezone || 'America/Chicago'
        }
      });
      setHasInitializedFormData(true);
    }
  }, [user, hasInitializedFormData]);

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const response = await apiRequest("PUT", "/api/auth/profile", profileData);
      return await response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Profile Updated!",
        description: "Your profile information has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error: any) => {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/logout", {});
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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-transparent via-amber-50 to-yellow-50">
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
              <div className="grid grid-cols-1 gap-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        autoComplete="off"
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
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        data-testid="input-date-of-birth"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Address Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="streetAddress">Street Address</Label>
                      <Input
                        id="streetAddress"
                        value={formData.streetAddress}
                        onChange={(e) => setFormData(prev => ({ ...prev, streetAddress: e.target.value }))}
                        data-testid="input-street-address"
                        placeholder="123 Main Street"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          data-testid="input-city"
                          placeholder="St. Louis"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Select value={formData.state} onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}>
                          <SelectTrigger data-testid="select-state">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MO">Missouri</SelectItem>
                            <SelectItem value="IL">Illinois</SelectItem>
                            <SelectItem value="KS">Kansas</SelectItem>
                            <SelectItem value="AR">Arkansas</SelectItem>
                            <SelectItem value="IA">Iowa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          value={formData.zipCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                          data-testid="input-zip-code"
                          placeholder="63101"
                          maxLength={5}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">Contact Name</Label>
                      <Input
                        id="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                        data-testid="input-emergency-contact-name"
                        placeholder="Emergency contact full name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                      <Input
                        id="emergencyContactPhone"
                        type="tel"
                        value={formData.emergencyContactPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                        data-testid="input-emergency-contact-phone"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactRelation">Relationship</Label>
                      <Select value={formData.emergencyContactRelation} onValueChange={(value) => setFormData(prev => ({ ...prev, emergencyContactRelation: value }))}>
                        <SelectTrigger data-testid="select-emergency-contact-relation">
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="friend">Friend</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Vehicle Information (Drivers Only) */}
                {user?.isDriver && (
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      Vehicle Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="vehicleMake">Vehicle Make</Label>
                          <Select 
                            value={formData.vehicleMake} 
                            onValueChange={(value) => {
                              setFormData(prev => ({ ...prev, vehicleMake: value, vehicleModel: '' }));
                            }}
                          >
                            <SelectTrigger data-testid="select-vehicle-make">
                              <SelectValue placeholder="Select make" />
                            </SelectTrigger>
                            <SelectContent>
                              {vehicleData.makes.map((make) => (
                                <SelectItem key={make} value={make}>{make}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="vehicleModel">Vehicle Model</Label>
                          <Select 
                            value={formData.vehicleModel} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, vehicleModel: value }))}
                            disabled={!formData.vehicleMake}
                          >
                            <SelectTrigger data-testid="select-vehicle-model">
                              <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                              {formData.vehicleMake && vehicleData.modelsByMake[formData.vehicleMake]?.map((model) => (
                                <SelectItem key={model} value={model}>{model}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="vehicleYear">Vehicle Year</Label>
                          <Select 
                            value={formData.vehicleYear} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, vehicleYear: value }))}
                          >
                            <SelectTrigger data-testid="select-vehicle-year">
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent>
                              {vehicleData.years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="vehicleColor">Vehicle Color</Label>
                          <Select 
                            value={formData.vehicleColor} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, vehicleColor: value }))}
                          >
                            <SelectTrigger data-testid="select-vehicle-color">
                              <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                            <SelectContent>
                              {vehicleData.colors.map((color) => (
                                <SelectItem key={color} value={color}>{color}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="vehicleType">Vehicle Type</Label>
                          <Select 
                            value={formData.vehicleType} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, vehicleType: value }))}
                          >
                            <SelectTrigger data-testid="select-vehicle-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Sedan">Sedan</SelectItem>
                              <SelectItem value="SUV">SUV</SelectItem>
                              <SelectItem value="Truck">Truck</SelectItem>
                              <SelectItem value="Van">Van</SelectItem>
                              <SelectItem value="Hatchback">Hatchback</SelectItem>
                              <SelectItem value="Coupe">Coupe</SelectItem>
                              <SelectItem value="Wagon">Wagon</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="licensePlate">License Plate</Label>
                          <Input
                            id="licensePlate"
                            value={formData.licensePlate}
                            onChange={(e) => setFormData(prev => ({ ...prev, licensePlate: e.target.value.toUpperCase() }))}
                            data-testid="input-license-plate"
                            placeholder="ABC123"
                            maxLength={10}
                          />
                        </div>
                      </div>

                      {formData.vehicleMake && formData.vehicleModel && formData.vehicleYear && formData.vehicleColor && (
                        <div className="bg-muted/30 border border-primary/20 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground mb-2">Your vehicle will be displayed to customers as:</p>
                          <p className="text-base font-semibold text-primary">
                            {formData.vehicleColor} {formData.vehicleYear} {formData.vehicleMake} {formData.vehicleModel}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <Button 
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                data-testid="button-save-profile"
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
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
              <Link href="/book-return">
                <Button variant="outline" className="w-full h-16 border-primary text-primary hover:bg-primary/10">
                  <Package className="h-5 w-5 mr-2" />
                  Book Return
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