import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Upload, FileText, User, Car, Shield, CheckCircle, AlertCircle, Clock, Camera } from 'lucide-react';
import { Link, useLocation } from 'wouter';

// Form validation schemas
const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  address: z.string().min(5, 'Please enter your full address'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Valid zip code required'),
});

const vehicleInfoSchema = z.object({
  vehicleMake: z.string().min(2, 'Vehicle make is required'),
  vehicleModel: z.string().min(2, 'Vehicle model is required'),
  vehicleYear: z.string().min(4, 'Vehicle year is required'),
  vehicleColor: z.string().min(2, 'Vehicle color is required'),
  licensePlate: z.string().min(2, 'License plate is required'),
  vehicleType: z.string().min(1, 'Vehicle type is required'),
});

const DocumentUploadCard = ({ 
  title, 
  description, 
  documentType, 
  uploaded, 
  verified, 
  onUpload,
  required = true
}: {
  title: string;
  description: string;
  documentType: string;
  uploaded: boolean;
  verified: boolean;
  onUpload: (file: File, type: string) => void;
  required?: boolean;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file, documentType);
    }
  };

  const getStatusIcon = () => {
    if (verified) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (uploaded) return <Clock className="h-5 w-5 text-amber-600" />;
    return <AlertCircle className="h-5 w-5 text-gray-400" />;
  };

  const getStatusText = () => {
    if (verified) return "Verified";
    if (uploaded) return "Pending Review";
    return required ? "Required" : "Optional";
  };

  const getStatusColor = () => {
    if (verified) return "bg-green-100 text-green-800 border-green-200";
    if (uploaded) return "bg-amber-100 text-amber-800 border-amber-200";
    return required ? "bg-red-50 text-red-800 border-red-200" : "bg-gray-50 text-gray-600 border-gray-200";
  };

  return (
    <Card className="border-amber-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {documentType === 'selfie' ? <Camera className="h-5 w-5 text-amber-600" /> : <FileText className="h-5 w-5 text-amber-600" />}
            <h3 className="font-medium text-amber-900">{title}</h3>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <Badge variant="outline" className={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={verified}
          className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploaded ? 'Replace Document' : 'Upload Document'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default function DriverOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Form states
  const personalForm = useForm({
    resolver: zodResolver(personalInfoSchema),
  });

  const vehicleForm = useForm({
    resolver: zodResolver(vehicleInfoSchema),
  });

  // Query for existing application
  const { data: application, isLoading } = useQuery({
    queryKey: ['/api/driver-applications/current'],
    retry: false,
  });

  // Mutations
  const savePersonalInfo = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/driver-applications', data);
      return response.json();
    },
    onSuccess: (data) => {
      setApplicationId(data.id);
      setCurrentStep(2);
      toast({
        title: "Personal Information Saved",
        description: "Let's continue with your vehicle information.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/driver-applications/current'] });
    },
  });

  const saveVehicleInfo = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PATCH', `/api/driver-applications/${applicationId}`, data);
      return response.json();
    },
    onSuccess: () => {
      setCurrentStep(3);
      toast({
        title: "Vehicle Information Saved",
        description: "Now let's upload your required documents.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/driver-applications/current'] });
    },
  });

  const uploadDocument = useMutation({
    mutationFn: async ({ file, documentType }: { file: File; documentType: string }) => {
      // Get upload URL
      const uploadResponse = await apiRequest('POST', '/api/objects/upload');
      const { uploadURL } = await uploadResponse.json();
      
      // Upload file to object storage
      await fetch(uploadURL, {
        method: 'PUT',
        body: file,
      });

      // Save document record
      const documentData = {
        applicationId: applicationId || application?.id,
        documentType,
        fileName: file.name,
        filePath: uploadURL.split('?')[0], // Remove query params
        fileSize: file.size.toString(),
        mimeType: file.type,
      };
      
      const response = await apiRequest('POST', '/api/driver-documents', documentData);
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Document Uploaded",
        description: `${variables.documentType} uploaded successfully and is pending review.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/driver-applications/current'] });
    },
  });

  const submitApplication = useMutation({
    mutationFn: async (termsAccepted: boolean) => {
      const response = await apiRequest('PATCH', `/api/driver-applications/${applicationId || application?.id}/submit`, {
        termsAccepted,
        termsAcceptedAt: new Date().toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "Your driver application is now under review. We'll contact you within 2-3 business days.",
      });
      setLocation('/driver-onboarding/success');
    },
  });

  const handlePersonalSubmit = (data: any) => {
    savePersonalInfo.mutate(data);
  };

  const handleVehicleSubmit = (data: any) => {
    saveVehicleInfo.mutate(data);
  };

  const handleDocumentUpload = (file: File, documentType: string) => {
    uploadDocument.mutate({ file, documentType });
  };

  const handleFinalSubmit = () => {
    submitApplication.mutate(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-stone-50 to-amber-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Calculate progress
  const getProgress = () => {
    if (currentStep === 1) return 20;
    if (currentStep === 2) return 40;
    if (currentStep === 3) return 60;
    if (currentStep === 4) return 80;
    return 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-stone-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-amber-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <img 
                src="/logo-cardboard-deep.png" 
                alt="Returnly Logo" 
                className="h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-amber-900">Driver Application</h1>
              <p className="text-amber-700">Join the Returnly driver network</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-amber-800 font-medium">Application Progress</span>
            <span className="text-sm text-amber-600">{getProgress()}% Complete</span>
          </div>
          <Progress value={getProgress()} className="h-2 bg-amber-100" />
          <div className="flex justify-between mt-2 text-xs text-amber-600">
            <span>Personal Info</span>
            <span>Vehicle Info</span>
            <span>Documents</span>
            <span>Terms</span>
            <span>Review</span>
          </div>
        </div>

        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <Card className="border-amber-200">
            <CardHeader className="bg-amber-50/50 border-b border-amber-200">
              <CardTitle className="flex items-center space-x-2 text-amber-900">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={personalForm.handleSubmit(handlePersonalSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName" className="text-amber-800 font-medium">First Name *</Label>
                    <Input
                      id="firstName"
                      {...personalForm.register('firstName')}
                      className="mt-1 border-amber-300 focus:border-amber-500"
                      data-testid="input-first-name"
                    />
                    {personalForm.formState.errors.firstName && (
                      <p className="text-red-600 text-sm mt-1">{personalForm.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-amber-800 font-medium">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...personalForm.register('lastName')}
                      className="mt-1 border-amber-300 focus:border-amber-500"
                      data-testid="input-last-name"
                    />
                    {personalForm.formState.errors.lastName && (
                      <p className="text-red-600 text-sm mt-1">{personalForm.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email" className="text-amber-800 font-medium">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...personalForm.register('email')}
                      className="mt-1 border-amber-300 focus:border-amber-500"
                      data-testid="input-email"
                    />
                    {personalForm.formState.errors.email && (
                      <p className="text-red-600 text-sm mt-1">{personalForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-amber-800 font-medium">Phone Number *</Label>
                    <Input
                      id="phone"
                      {...personalForm.register('phone')}
                      className="mt-1 border-amber-300 focus:border-amber-500"
                      placeholder="(555) 123-4567"
                      data-testid="input-phone"
                    />
                    {personalForm.formState.errors.phone && (
                      <p className="text-red-600 text-sm mt-1">{personalForm.formState.errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="dateOfBirth" className="text-amber-800 font-medium">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...personalForm.register('dateOfBirth')}
                    className="mt-1 border-amber-300 focus:border-amber-500"
                    data-testid="input-date-of-birth"
                  />
                  {personalForm.formState.errors.dateOfBirth && (
                    <p className="text-red-600 text-sm mt-1">{personalForm.formState.errors.dateOfBirth.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address" className="text-amber-800 font-medium">Street Address *</Label>
                  <Input
                    id="address"
                    {...personalForm.register('address')}
                    className="mt-1 border-amber-300 focus:border-amber-500"
                    placeholder="123 Main Street, Apt 4B"
                    data-testid="input-address"
                  />
                  {personalForm.formState.errors.address && (
                    <p className="text-red-600 text-sm mt-1">{personalForm.formState.errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-amber-800 font-medium">City *</Label>
                    <Input
                      id="city"
                      {...personalForm.register('city')}
                      className="mt-1 border-amber-300 focus:border-amber-500"
                      data-testid="input-city"
                    />
                    {personalForm.formState.errors.city && (
                      <p className="text-red-600 text-sm mt-1">{personalForm.formState.errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-amber-800 font-medium">State *</Label>
                    <Input
                      id="state"
                      {...personalForm.register('state')}
                      className="mt-1 border-amber-300 focus:border-amber-500"
                      placeholder="MO"
                      data-testid="input-state"
                    />
                    {personalForm.formState.errors.state && (
                      <p className="text-red-600 text-sm mt-1">{personalForm.formState.errors.state.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="zipCode" className="text-amber-800 font-medium">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      {...personalForm.register('zipCode')}
                      className="mt-1 border-amber-300 focus:border-amber-500"
                      placeholder="63101"
                      data-testid="input-zip-code"
                    />
                    {personalForm.formState.errors.zipCode && (
                      <p className="text-red-600 text-sm mt-1">{personalForm.formState.errors.zipCode.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-amber-700 hover:bg-amber-800 text-white px-8"
                    disabled={savePersonalInfo.isPending}
                    data-testid="button-continue-personal"
                  >
                    {savePersonalInfo.isPending ? 'Saving...' : 'Continue to Vehicle Info'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Vehicle Information */}
        {currentStep === 2 && (
          <Card className="border-amber-200">
            <CardHeader className="bg-amber-50/50 border-b border-amber-200">
              <CardTitle className="flex items-center space-x-2 text-amber-900">
                <Car className="h-5 w-5" />
                <span>Vehicle Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={vehicleForm.handleSubmit(handleVehicleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="vehicleMake" className="text-amber-800 font-medium">Vehicle Make *</Label>
                    <Input
                      id="vehicleMake"
                      {...vehicleForm.register('vehicleMake')}
                      className="mt-1 border-amber-300 focus:border-amber-500"
                      placeholder="Toyota, Honda, Ford, etc."
                      data-testid="input-vehicle-make"
                    />
                    {vehicleForm.formState.errors.vehicleMake && (
                      <p className="text-red-600 text-sm mt-1">{vehicleForm.formState.errors.vehicleMake.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="vehicleModel" className="text-amber-800 font-medium">Vehicle Model *</Label>
                    <Input
                      id="vehicleModel"
                      {...vehicleForm.register('vehicleModel')}
                      className="mt-1 border-amber-300 focus:border-amber-500"
                      placeholder="Camry, Civic, F-150, etc."
                      data-testid="input-vehicle-model"
                    />
                    {vehicleForm.formState.errors.vehicleModel && (
                      <p className="text-red-600 text-sm mt-1">{vehicleForm.formState.errors.vehicleModel.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="vehicleYear" className="text-amber-800 font-medium">Vehicle Year *</Label>
                    <Input
                      id="vehicleYear"
                      {...vehicleForm.register('vehicleYear')}
                      className="mt-1 border-amber-300 focus:border-amber-500"
                      placeholder="2020"
                      data-testid="input-vehicle-year"
                    />
                    {vehicleForm.formState.errors.vehicleYear && (
                      <p className="text-red-600 text-sm mt-1">{vehicleForm.formState.errors.vehicleYear.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="vehicleColor" className="text-amber-800 font-medium">Vehicle Color *</Label>
                    <Input
                      id="vehicleColor"
                      {...vehicleForm.register('vehicleColor')}
                      className="mt-1 border-amber-300 focus:border-amber-500"
                      placeholder="White, Black, Silver, etc."
                      data-testid="input-vehicle-color"
                    />
                    {vehicleForm.formState.errors.vehicleColor && (
                      <p className="text-red-600 text-sm mt-1">{vehicleForm.formState.errors.vehicleColor.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="licensePlate" className="text-amber-800 font-medium">License Plate *</Label>
                    <Input
                      id="licensePlate"
                      {...vehicleForm.register('licensePlate')}
                      className="mt-1 border-amber-300 focus:border-amber-500"
                      placeholder="ABC-1234"
                      data-testid="input-license-plate"
                    />
                    {vehicleForm.formState.errors.licensePlate && (
                      <p className="text-red-600 text-sm mt-1">{vehicleForm.formState.errors.licensePlate.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="vehicleType" className="text-amber-800 font-medium">Vehicle Type *</Label>
                    <Select {...vehicleForm.register('vehicleType')} required>
                      <SelectTrigger className="border-amber-300 focus:border-amber-500" data-testid="select-vehicle-type">
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="truck">Truck</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="hatchback">Hatchback</SelectItem>
                        <SelectItem value="sedan">Sedan</SelectItem>
                      </SelectContent>
                    </Select>
                    {vehicleForm.formState.errors.vehicleType && (
                      <p className="text-red-600 text-sm mt-1">{vehicleForm.formState.errors.vehicleType.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="border-amber-300 text-amber-700"
                    data-testid="button-back-to-personal"
                  >
                    Back to Personal Info
                  </Button>
                  <Button
                    type="submit"
                    className="bg-amber-700 hover:bg-amber-800 text-white px-8"
                    disabled={saveVehicleInfo.isPending}
                    data-testid="button-continue-vehicle"
                  >
                    {saveVehicleInfo.isPending ? 'Saving...' : 'Continue to Documents'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Document Upload */}
        {currentStep === 3 && (
          <Card className="border-amber-200">
            <CardHeader className="bg-amber-50/50 border-b border-amber-200">
              <CardTitle className="flex items-center space-x-2 text-amber-900">
                <FileText className="h-5 w-5" />
                <span>Required Documents</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DocumentUploadCard
                  title="Driver's License"
                  description="Upload a clear photo of your valid driver's license (front and back)"
                  documentType="license"
                  uploaded={application?.driversLicenseUploaded || false}
                  verified={application?.driversLicenseVerified || false}
                  onUpload={handleDocumentUpload}
                />
                
                <DocumentUploadCard
                  title="Vehicle Registration"
                  description="Upload your current vehicle registration document"
                  documentType="registration"
                  uploaded={application?.vehicleRegistrationUploaded || false}
                  verified={application?.vehicleRegistrationVerified || false}
                  onUpload={handleDocumentUpload}
                />
                
                <DocumentUploadCard
                  title="Insurance Card"
                  description="Upload proof of current auto insurance coverage"
                  documentType="insurance"
                  uploaded={application?.insuranceUploaded || false}
                  verified={application?.insuranceVerified || false}
                  onUpload={handleDocumentUpload}
                />
                
                <DocumentUploadCard
                  title="Profile Photo"
                  description="Take a clear selfie for identity verification"
                  documentType="selfie"
                  uploaded={application?.selfieUploaded || false}
                  verified={application?.selfieVerified || false}
                  onUpload={handleDocumentUpload}
                />
              </div>

              <Alert className="mt-6 border-amber-200 bg-amber-50">
                <Shield className="h-4 w-4" />
                <AlertDescription className="text-amber-800">
                  All documents will be securely stored and reviewed by our verification team. 
                  A background check will be initiated once all documents are uploaded.
                </AlertDescription>
              </Alert>

              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="border-amber-300 text-amber-700"
                  data-testid="button-back-to-vehicle"
                >
                  Back to Vehicle Info
                </Button>
                <Button
                  onClick={() => setCurrentStep(4)}
                  className="bg-amber-700 hover:bg-amber-800 text-white px-8"
                  data-testid="button-continue-documents"
                >
                  Continue to Terms
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Terms and Conditions */}
        {currentStep === 4 && (
          <Card className="border-amber-200">
            <CardHeader className="bg-amber-50/50 border-b border-amber-200">
              <CardTitle className="flex items-center space-x-2 text-amber-900">
                <Shield className="h-5 w-5" />
                <span>Terms of Service</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="max-h-96 overflow-y-auto border border-amber-200 rounded-lg p-4 bg-white">
                <h3 className="font-semibold text-amber-900 mb-4">Returnly Driver Terms of Service</h3>
                
                <div className="space-y-4 text-sm text-gray-700">
                  <section>
                    <h4 className="font-medium text-amber-800 mb-2">1. Driver Requirements</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Must be at least 21 years old</li>
                      <li>Valid driver's license with clean driving record</li>
                      <li>Current auto insurance coverage</li>
                      <li>Vehicle registration in driver's name</li>
                      <li>Smartphone with GPS capability</li>
                      <li>Pass background check</li>
                    </ul>
                  </section>

                  <section>
                    <h4 className="font-medium text-amber-800 mb-2">2. Vehicle Requirements</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>2010 or newer model year</li>
                      <li>4-door vehicle in good condition</li>
                      <li>Valid registration and insurance</li>
                      <li>Clean interior and exterior</li>
                      <li>Functioning GPS and smartphone mount</li>
                    </ul>
                  </section>

                  <section>
                    <h4 className="font-medium text-amber-800 mb-2">3. Driver Responsibilities</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Provide professional, courteous service</li>
                      <li>Handle packages with care</li>
                      <li>Follow pickup and delivery instructions</li>
                      <li>Communicate proactively with customers</li>
                      <li>Maintain vehicle in good condition</li>
                      <li>Report any issues immediately</li>
                    </ul>
                  </section>

                  <section>
                    <h4 className="font-medium text-amber-800 mb-2">4. Payment Terms</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Earn 70% of delivery fees</li>
                      <li>Base pay: $3.00 per delivery minimum</li>
                      <li>Distance pay: $0.35 per mile</li>
                      <li>Time-based compensation: $8.00 per hour</li>
                      <li>Size bonuses for large packages</li>
                      <li>100% of customer tips</li>
                      <li>Weekly payment via direct deposit</li>
                      <li>Instant pay available (small fee applies)</li>
                    </ul>
                  </section>

                  <section>
                    <h4 className="font-medium text-amber-800 mb-2">5. Background Check Policy</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Comprehensive criminal background check required</li>
                      <li>Motor vehicle record review</li>
                      <li>Identity verification</li>
                      <li>Ongoing monitoring may occur</li>
                      <li>Any criminal activity may result in deactivation</li>
                    </ul>
                  </section>

                  <section>
                    <h4 className="font-medium text-amber-800 mb-2">6. Independent Contractor Status</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Drivers are independent contractors</li>
                      <li>Set your own schedule and work hours</li>
                      <li>Responsible for own vehicle expenses</li>
                      <li>Tax documents (1099) provided annually</li>
                      <li>No employment benefits provided</li>
                    </ul>
                  </section>

                  <section>
                    <h4 className="font-medium text-amber-800 mb-2">7. Termination</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Either party may terminate at any time</li>
                      <li>Violation of terms may result in immediate deactivation</li>
                      <li>Final payments processed within 7 business days</li>
                    </ul>
                  </section>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-start space-x-3">
                  <Checkbox id="terms-agreement" className="mt-1" data-testid="checkbox-terms" />
                  <Label htmlFor="terms-agreement" className="text-sm text-amber-800 leading-relaxed">
                    I have read, understood, and agree to the Returnly Driver Terms of Service. 
                    I understand that I am applying to be an independent contractor and that my 
                    application will be subject to a background check and document verification.
                  </Label>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(3)}
                  className="border-amber-300 text-amber-700"
                  data-testid="button-back-to-documents"
                >
                  Back to Documents
                </Button>
                <Button
                  onClick={handleFinalSubmit}
                  className="bg-amber-700 hover:bg-amber-800 text-white px-8"
                  disabled={submitApplication.isPending}
                  data-testid="button-submit-application"
                >
                  {submitApplication.isPending ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}