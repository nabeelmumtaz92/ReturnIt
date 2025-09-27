import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  Car,
  Star,
  MapPinned
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import deliveryDriverSignupImg from "@assets/Delivery Driver Receiving Box_1754856749524.jpeg";

// Form validation schema
const driverSignupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  address: z.string().min(5, 'Please enter your full address'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Valid zip code required'),
  vehicleType: z.string().min(1, 'Vehicle type is required'),
  vehicleMake: z.string().min(1, 'Vehicle make is required'),
  vehicleModel: z.string().min(1, 'Vehicle model is required'),
  vehicleYear: z.string().min(4, 'Vehicle year is required').max(4, 'Vehicle year must be 4 digits'),
  vehicleColor: z.string().min(1, 'Vehicle color is required'),
  licensePlate: z.string().min(1, 'License plate is required'),
  backgroundCheckConsent: z.boolean().refine(val => val === true, {
    message: "You must consent to background check to proceed"
  }),
  experience: z.string().optional(),
  referralCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type DriverSignupData = z.infer<typeof driverSignupSchema>;

interface ZipCodeInfo {
  zipCode: string;
  driverCount: number;
  targetDriverCount: number;
  projectedHireDate: string;
  status: 'hiring' | 'waitlist' | 'full';
  priority: number;
}

interface ApplicationStatus {
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  step: string;
  message: string;
  projectedDate?: string;
  nextAction?: string;
}

export default function DriverSignup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [zipCodeInfo, setZipCodeInfo] = useState<ZipCodeInfo | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);

  const form = useForm<DriverSignupData>({
    resolver: zodResolver(driverSignupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      vehicleType: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      vehicleColor: '',
      licensePlate: '',
      backgroundCheckConsent: false,
      experience: '',
      referralCode: '',
    },
  });

  // Remove driver count information per user request
  useEffect(() => {
    setZipCodeInfo(null);
  }, []);

  // Driver signup mutation
  const signupMutation = useMutation({
    mutationFn: async (data: DriverSignupData) => {
      const response = await apiRequest("POST", "/api/auth/driver-signup", {
        ...data,
        isDriver: true,
        applicationStatus: 'pending_review',
        onboardingStep: 'documents_pending',
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setApplicationSubmitted(true);
      setApplicationStatus({
        status: data.user.applicationStatus || 'pending',
        step: data.user.onboardingStep || 'documents_pending',
        message: 'Application submitted successfully! Please check your email for next steps.',
        projectedDate: zipCodeInfo?.projectedHireDate,
        nextAction: 'Upload required documents within 48 hours',
      });
      
      toast({
        title: "Application Submitted!",
        description: "We'll review your application and contact you within 24-48 hours.",
      });
    },
    onError: (error: any) => {
      let userFriendlyMessage = "Something went wrong. Please try again.";
      
      // Handle specific error cases with user-friendly messages
      if (error?.message) {
        if (error.message.includes("email already exists") || error.message.includes("already have a driver application")) {
          userFriendlyMessage = "You already have an account. Please sign in instead.";
        } else if (error.message.includes("validation") || error.message.includes("Invalid")) {
          userFriendlyMessage = "Please check your information and try again.";
        } else if (error.message.includes("password")) {
          userFriendlyMessage = "Please check your password requirements.";
        }
      }
      
      toast({
        title: "Application Error",
        description: userFriendlyMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: DriverSignupData) => {
    signupMutation.mutate(data);
  };

  const getZipCodeStatusBadge = () => {
    if (!zipCodeInfo) return null;

    const statusConfig = {
      hiring: { color: 'bg-green-100 text-green-800 border-green-200', text: 'Actively Hiring' },
      waitlist: { color: 'bg-amber-100 text-amber-800 border-amber-200', text: 'Waitlist Open' },
      full: { color: 'bg-gray-100 text-gray-800 border-gray-200', text: 'Currently Full' },
    };

    const config = statusConfig[zipCodeInfo.status];
    return (
      <Badge variant="outline" className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const getProjectedTimeline = () => {
    if (!zipCodeInfo) return null;

    const projectedDate = new Date(zipCodeInfo.projectedHireDate);
    const now = new Date();
    const daysUntil = Math.ceil((projectedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (zipCodeInfo.status === 'hiring') {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-900">Great News!</span>
          </div>
          <p className="text-green-800 text-sm">
            We're actively hiring drivers in your area. Expected onboarding completion: <strong>{daysUntil} days</strong>
          </p>
        </div>
      );
    } else if (zipCodeInfo.status === 'waitlist') {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="h-5 w-5 text-amber-600" />
            <span className="font-semibold text-amber-900">Projected Hire Date</span>
          </div>
          <p className="text-amber-800 text-sm">
            We expect to have openings in your area within <strong>{daysUntil} days</strong>. Join our waitlist to be notified first!
          </p>
        </div>
      );
    } else {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-5 w-5 text-gray-600" />
            <span className="font-semibold text-gray-900">Area Currently Full</span>
          </div>
          <p className="text-gray-800 text-sm">
            We'll notify you when positions become available. Estimated wait time: <strong>{daysUntil} days</strong>
          </p>
        </div>
      );
    }
  };

  if (applicationSubmitted && applicationStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-amber-900 mb-2">Application Submitted!</h1>
            <p className="text-amber-700">Thank you for your interest in becoming a Return It driver</p>
          </div>

          <Card className="border-amber-200 shadow-lg">
            <CardHeader className="bg-amber-50 border-b border-amber-200">
              <CardTitle className="text-amber-900">Application Status</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Current Status:</span>
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                    Under Review
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">Application ID:</span>
                  <span className="text-gray-600">#DR{Date.now().toString().slice(-6)}</span>
                </div>

                {applicationStatus.projectedDate && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Projected Start Date:</span>
                    <span className="text-green-600 font-medium">
                      {new Date(applicationStatus.projectedDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Check your email for document upload instructions</li>
                    <li>• Complete background check authorization</li>
                    <li>• Upload driver's license and vehicle documents</li>
                    <li>• Schedule virtual onboarding session</li>
                  </ul>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={() => setLocation('/driver-onboarding')}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    data-testid="button-continue-onboarding"
                  >
                    Continue Onboarding Process
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-amber-700 text-sm">
              Questions? Contact our driver support team at{' '}
              <a href="mailto:drivers@returnit.app" className="text-amber-600 hover:underline">
                drivers@returnit.app
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Hero Section */}
      <div className="relative bg-amber-600 text-white py-16">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${deliveryDriverSignupImg})` }}
        />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Join the Return It Driver Team</h1>
          <p className="text-xl text-amber-100 mb-6">
            Earn competitive pay helping customers with returns and exchanges
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              $15-25/hour + tips
            </div>
            <div className="flex items-center">
              <Car className="h-5 w-5 mr-2" />
              Use your own vehicle
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Flexible schedule
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Application Form */}
          <div className="lg:col-span-2">
            <Card className="border-amber-200 shadow-lg">
              <CardHeader className="bg-amber-50 border-b border-amber-200">
                <CardTitle className="text-amber-900">Driver Application</CardTitle>
                <p className="text-amber-700 text-sm">
                  Complete your application to start earning with Return It
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-amber-900 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Personal Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          {...form.register('firstName')}
                          className="border-amber-200 focus:border-amber-400"
                          data-testid="input-first-name"
                        />
                        {form.formState.errors.firstName && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          {...form.register('lastName')}
                          className="border-amber-200 focus:border-amber-400"
                          data-testid="input-last-name"
                        />
                        {form.formState.errors.lastName && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          autoComplete="off"
                          {...form.register('email')}
                          className="border-amber-200 focus:border-amber-400"
                          data-testid="input-email"
                        />
                        {form.formState.errors.email && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          {...form.register('phone')}
                          className="border-amber-200 focus:border-amber-400"
                          data-testid="input-phone"
                        />
                        {form.formState.errors.phone && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          autoComplete="new-password"
                          {...form.register('password')}
                          className="border-amber-200 focus:border-amber-400"
                          data-testid="input-password"
                        />
                        {form.formState.errors.password && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.password.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          autoComplete="new-password"
                          {...form.register('confirmPassword')}
                          className="border-amber-200 focus:border-amber-400"
                          data-testid="input-confirm-password"
                        />
                        {form.formState.errors.confirmPassword && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        {...form.register('dateOfBirth')}
                        className="border-amber-200 focus:border-amber-400"
                        data-testid="input-date-of-birth"
                      />
                      {form.formState.errors.dateOfBirth && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.dateOfBirth.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-amber-900 flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Address Information
                    </h3>
                    
                    <div>
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        {...form.register('address')}
                        className="border-amber-200 focus:border-amber-400"
                        data-testid="input-address"
                      />
                      {form.formState.errors.address && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.address.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          {...form.register('city')}
                          className="border-amber-200 focus:border-amber-400"
                          data-testid="input-city"
                        />
                        {form.formState.errors.city && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.city.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          {...form.register('state')}
                          className="border-amber-200 focus:border-amber-400"
                          data-testid="input-state"
                        />
                        {form.formState.errors.state && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.state.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          {...form.register('zipCode')}
                          className="border-amber-200 focus:border-amber-400"
                          data-testid="input-zip-code"
                        />
                        {form.formState.errors.zipCode && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.zipCode.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-amber-900 flex items-center">
                      <Car className="h-5 w-5 mr-2" />
                      Vehicle Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="vehicleMake">Vehicle Make</Label>
                        <Input
                          id="vehicleMake"
                          {...form.register('vehicleMake')}
                          placeholder="e.g., Toyota, Honda, Ford"
                          className="border-amber-200 focus:border-amber-400"
                          data-testid="input-vehicle-make"
                        />
                        {form.formState.errors.vehicleMake && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.vehicleMake.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="vehicleModel">Vehicle Model</Label>
                        <Input
                          id="vehicleModel"
                          {...form.register('vehicleModel')}
                          placeholder="e.g., Camry, Civic, F-150"
                          className="border-amber-200 focus:border-amber-400"
                          data-testid="input-vehicle-model"
                        />
                        {form.formState.errors.vehicleModel && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.vehicleModel.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="vehicleYear">Vehicle Year</Label>
                        <Input
                          id="vehicleYear"
                          {...form.register('vehicleYear')}
                          placeholder="2020"
                          className="border-amber-200 focus:border-amber-400"
                          data-testid="input-vehicle-year"
                        />
                        {form.formState.errors.vehicleYear && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.vehicleYear.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="vehicleColor">Vehicle Color</Label>
                        <Input
                          id="vehicleColor"
                          {...form.register('vehicleColor')}
                          placeholder="e.g., Red, Blue, Silver"
                          className="border-amber-200 focus:border-amber-400"
                          data-testid="input-vehicle-color"
                        />
                        {form.formState.errors.vehicleColor && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.vehicleColor.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="vehicleType">Vehicle Type</Label>
                        <select
                          id="vehicleType"
                          {...form.register('vehicleType')}
                          className="w-full p-2 border border-amber-200 rounded-md focus:border-amber-400 focus:outline-none"
                          data-testid="select-vehicle-type"
                        >
                          <option value="">Select vehicle type</option>
                          <option value="sedan">Sedan</option>
                          <option value="suv">SUV</option>
                          <option value="hatchback">Hatchback</option>
                          <option value="truck">Pickup Truck</option>
                          <option value="van">Van</option>
                          <option value="other">Other</option>
                        </select>
                        {form.formState.errors.vehicleType && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.vehicleType.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="licensePlate">License Plate Number</Label>
                      <Input
                        id="licensePlate"
                        {...form.register('licensePlate')}
                        placeholder="e.g., ABC-1234"
                        className="border-amber-200 focus:border-amber-400"
                        data-testid="input-license-plate"
                      />
                      {form.formState.errors.licensePlate && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.licensePlate.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-amber-900">Additional Information</h3>
                    
                    <div>
                      <Label htmlFor="experience">Previous Delivery Experience (Optional)</Label>
                      <Textarea
                        id="experience"
                        {...form.register('experience')}
                        placeholder="Tell us about any previous delivery or driving experience..."
                        className="border-amber-200 focus:border-amber-400"
                        data-testid="textarea-experience"
                      />
                    </div>

                    <div>
                      <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                      <Input
                        id="referralCode"
                        {...form.register('referralCode')}
                        placeholder="Enter referral code if you have one"
                        className="border-amber-200 focus:border-amber-400"
                        data-testid="input-referral-code"
                      />
                    </div>
                  </div>

                  {/* Background Check Consent */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-amber-900 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Background Check Authorization
                    </h3>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Required Background Check</h4>
                      <p className="text-blue-800 text-sm mb-3">
                        For the safety of our customers and to comply with regulations, all drivers must pass a background check. 
                        This includes verification of your driving record, criminal history, and identity verification.
                      </p>
                      <p className="text-blue-800 text-sm">
                        The background check will be automatically initiated after you submit your application and typically takes 24-48 hours to complete.
                      </p>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="backgroundCheckConsent"
                        {...form.register('backgroundCheckConsent')}
                        className="mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500 border-amber-300 rounded"
                        data-testid="checkbox-background-check-consent"
                      />
                      <label htmlFor="backgroundCheckConsent" className="text-sm text-gray-700 leading-5">
                        I authorize Return It to conduct a background check, including but not limited to criminal history, 
                        driving records, and identity verification. I understand this information will be used solely for 
                        employment screening purposes and will be handled in accordance with applicable laws.
                      </label>
                    </div>
                    {form.formState.errors.backgroundCheckConsent && (
                      <p className="text-red-500 text-sm mt-1">
                        {form.formState.errors.backgroundCheckConsent.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={signupMutation.isPending}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3"
                    data-testid="button-submit-application"
                  >
                    {signupMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting Application & Starting Background Check...
                      </div>
                    ) : (
                      'Submit Application & Start Background Check'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with ZIP Code Info and Benefits */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-6">
              {/* ZIP Code Information */}
              {zipCodeInfo && (
                <Card className="border-amber-200 shadow-lg">
                  <CardHeader className="bg-amber-50 border-b border-amber-200">
                    <CardTitle className="text-amber-900 text-lg flex items-center">
                      <MapPinned className="h-5 w-5 mr-2" />
                      Your Area: {zipCodeInfo.zipCode}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Status:</span>
                        {getZipCodeStatusBadge()}
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span>Current Drivers:</span>
                        <span className="font-medium">{zipCodeInfo.driverCount}/{zipCodeInfo.targetDriverCount}</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((zipCodeInfo.driverCount / zipCodeInfo.targetDriverCount) * 100, 100)}%` }}
                        />
                      </div>
                      
                      {getProjectedTimeline()}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Driver Benefits */}
              <Card className="border-amber-200 shadow-lg">
                <CardHeader className="bg-amber-50 border-b border-amber-200">
                  <CardTitle className="text-amber-900 text-lg">Driver Benefits</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                      <span>Competitive hourly rates</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-amber-500 mr-2" />
                      <span>Performance bonuses</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-blue-600 mr-2" />
                      <span>Flexible scheduling</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Instant daily payouts</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Have an Account */}
              <Card className="border-amber-200 shadow-lg">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-600 mb-3">Already have an account?</p>
                  <Link href="/login?tab=login">
                    <Button variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50">
                      Sign In
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}