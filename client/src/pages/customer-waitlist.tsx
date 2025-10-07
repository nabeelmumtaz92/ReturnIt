import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Mail, MapPin, Clock, CheckCircle, Users } from 'lucide-react';
import { Link } from 'wouter';

// Form validation schema
const customerWaitlistSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  streetAddress: z.string().min(5, 'Please enter your full address'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Valid zip code required'),
  marketingOptIn: z.boolean().default(true),
  referralCode: z.string().optional(),
});

type CustomerWaitlistForm = z.infer<typeof customerWaitlistSchema>;

export default function CustomerWaitlist() {
  const [zipCodeData, setZipCodeData] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<CustomerWaitlistForm>({
    resolver: zodResolver(customerWaitlistSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      marketingOptIn: true,
      referralCode: '',
    },
  });

  // ZIP code lookup query
  const { data: zipLookup, refetch: lookupZipCode } = useQuery({
    queryKey: ['zip-code', form.watch('zipCode')],
    queryFn: async () => {
      const zipCode = form.getValues('zipCode');
      if (zipCode && zipCode.length >= 5) {
        const response = await fetch(`/api/zip-codes/${zipCode}`);
        return response.json();
      }
      return null;
    },
    enabled: false,
  });

  // Customer waitlist signup mutation
  const submitWaitlist = useMutation({
    mutationFn: async (data: CustomerWaitlistForm) => {
      const response = await apiRequest('POST', '/api/customer-waitlist', data);
      return response.json();
    },
    onSuccess: (data) => {
      setSubmitted(true);
      toast({
        title: "Welcome to the Waitlist!",
        description: "You'll be notified when Return It launches in your area.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Signup Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const zipCode = e.target.value;
    form.setValue('zipCode', zipCode);
    
    if (zipCode.length === 5) {
      lookupZipCode().then((result) => {
        if (result.data) {
          setZipCodeData(result.data);
        }
      });
    }
  };

  const onSubmit = (data: CustomerWaitlistForm) => {
    submitWaitlist.mutate(data);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-transparent to-accent">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-border sticky top-0 z-10">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="text-2xl font-bold text-foreground cursor-pointer hover:opacity-90 transition-all duration-300 hover:scale-105">
                  Return It
                </div>
              </Link>
              <div>
                <Link href="/driver-signup" className="text-muted-foreground hover:text-foreground font-medium">
                  Become a Driver
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Success Content */}
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <Card className="border-green-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="mb-6">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-green-900 mb-2">
                  You're on the List!
                </h1>
                <p className="text-green-700 text-lg">
                  Thank you for joining the Return It waitlist
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {zipCodeData && (
                  <Alert className="border-green-200 bg-green-50">
                    <Clock className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Projected Launch:</strong> We expect to launch in your area ({zipCodeData.zipCode}) within{' '}
                      <span className="font-semibold">{zipCodeData.estimatedWaitDays} days</span>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-green-700">
                    <Mail className="h-4 w-4" />
                    <span>Email notifications enabled</span>
                  </div>
                  <div className="flex items-center space-x-2 text-green-700">
                    <MapPin className="h-4 w-4" />
                    <span>Address verified</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#f8f7f5] dark:bg-[#231b0f] border border-border rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-foreground mb-2">What happens next?</h3>
                <ul className="text-sm text-foreground space-y-1 text-left">
                  <li>• You'll receive an email confirmation shortly</li>
                  <li>• We'll notify you as we approach your launch date</li>
                  <li>• Priority access when Return It goes live in your area</li>
                  <li>• Early adopter benefits and exclusive offers</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button variant="outline" className="border-border text-muted-foreground">
                    Return to Home
                  </Button>
                </Link>
                <Link href="/driver-signup">
                  <Button className="bg-primary hover:bg-primary/90">
                    Interested in Driving?
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-transparent to-accent">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="text-2xl font-bold text-foreground cursor-pointer hover:opacity-90 transition-all duration-300 hover:scale-105">
                Return It
              </div>
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/driver-signup" className="text-muted-foreground hover:text-foreground font-medium">
                Become a Driver
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Join the Return It Waitlist
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Be the first to experience hassle-free returns when we launch in your area. 
            Get priority access and exclusive early adopter benefits.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="text-center">
              <div className="bg-white/60 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Priority Access</h3>
              <p className="text-sm text-muted-foreground">First to know when we launch</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/60 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Local Launch</h3>
              <p className="text-sm text-muted-foreground">Customized timeline for your area</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/60 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Exclusive Benefits</h3>
              <p className="text-sm text-muted-foreground">Early adopter perks and discounts</p>
            </div>
          </div>
        </div>

        {/* Waitlist Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-border bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-[#f8f7f5] dark:bg-[#231b0f]/50 border-b border-border">
              <CardTitle className="text-center text-foreground">
                Reserve Your Spot
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName" className="text-foreground font-medium">First Name *</Label>
                    <Input
                      id="firstName"
                      {...form.register('firstName')}
                      className="mt-1 border-border focus:border-border"
                      data-testid="input-first-name"
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-red-600 text-sm mt-1">{form.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-foreground font-medium">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...form.register('lastName')}
                      className="mt-1 border-border focus:border-border"
                      data-testid="input-last-name"
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-red-600 text-sm mt-1">{form.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email" className="text-foreground font-medium">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="off"
                      {...form.register('email')}
                      className="mt-1 border-border focus:border-border"
                      data-testid="input-email"
                    />
                    {form.formState.errors.email && (
                      <p className="text-red-600 text-sm mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-foreground font-medium">Phone Number *</Label>
                    <Input
                      id="phone"
                      {...form.register('phone')}
                      className="mt-1 border-border focus:border-border"
                      placeholder="(555) 123-4567"
                      data-testid="input-phone"
                    />
                    {form.formState.errors.phone && (
                      <p className="text-red-600 text-sm mt-1">{form.formState.errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="streetAddress" className="text-foreground font-medium">Street Address *</Label>
                  <Input
                    id="streetAddress"
                    {...form.register('streetAddress')}
                    className="mt-1 border-border focus:border-border"
                    placeholder="123 Main Street, Apt 4B"
                    data-testid="input-address"
                  />
                  {form.formState.errors.streetAddress && (
                    <p className="text-red-600 text-sm mt-1">{form.formState.errors.streetAddress.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-foreground font-medium">City *</Label>
                    <Input
                      id="city"
                      {...form.register('city')}
                      className="mt-1 border-border focus:border-border"
                      data-testid="input-city"
                    />
                    {form.formState.errors.city && (
                      <p className="text-red-600 text-sm mt-1">{form.formState.errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-foreground font-medium">State *</Label>
                    <Input
                      id="state"
                      {...form.register('state')}
                      className="mt-1 border-border focus:border-border"
                      placeholder="MO"
                      data-testid="input-state"
                    />
                    {form.formState.errors.state && (
                      <p className="text-red-600 text-sm mt-1">{form.formState.errors.state.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="zipCode" className="text-foreground font-medium">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      {...form.register('zipCode')}
                      onChange={handleZipCodeChange}
                      className="mt-1 border-border focus:border-border"
                      placeholder="63101"
                      data-testid="input-zip-code"
                    />
                    {form.formState.errors.zipCode && (
                      <p className="text-red-600 text-sm mt-1">{form.formState.errors.zipCode.message}</p>
                    )}
                  </div>
                </div>

                {/* ZIP Code Analysis */}
                {zipCodeData && (
                  <Alert className="border-border bg-[#f8f7f5] dark:bg-[#231b0f]">
                    <MapPin className="h-4 w-4 text-primary" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <div>
                          <strong>Your Area: {zipCodeData.zipCode}</strong>
                          <br />
                          <span className="text-sm">
                            Projected Launch: {zipCodeData.estimatedWaitDays} days | 
                            Priority: {zipCodeData.priority}/3 | 
                            Demand: {zipCodeData.marketDemand}
                          </span>
                        </div>
                        <Badge variant="outline" className="bg-accent text-foreground border-border">
                          {zipCodeData.status === 'hiring' ? 'Coming Soon' : 
                           zipCodeData.status === 'waitlist' ? 'Waitlist Open' : 'Planning Phase'}
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label htmlFor="referralCode" className="text-foreground font-medium">Referral Code (Optional)</Label>
                  <Input
                    id="referralCode"
                    {...form.register('referralCode')}
                    className="mt-1 border-border focus:border-border"
                    placeholder="Enter referral code if you have one"
                    data-testid="input-referral-code"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="marketingOptIn"
                    checked={form.watch('marketingOptIn')}
                    onCheckedChange={(checked) => form.setValue('marketingOptIn', checked as boolean)}
                    data-testid="checkbox-marketing"
                  />
                  <Label htmlFor="marketingOptIn" className="text-sm text-foreground">
                    I'd like to receive updates about Return It and early access offers
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white py-3"
                  disabled={submitWaitlist.isPending}
                  data-testid="button-join-waitlist"
                >
                  {submitWaitlist.isPending ? 'Joining Waitlist...' : 'Join the Waitlist'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}