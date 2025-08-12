import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth-simple";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Truck, 
  Upload, 
  FileCheck, 
  Shield, 
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Phone,
  MapPin,
  Calendar
} from "lucide-react";

interface DriverApplication {
  id: number;
  status: 'pending' | 'approved' | 'rejected';
  personalInfo: {
    fullName: string;
    dateOfBirth: string;
    phone: string;
    address: string;
    emergencyContact: string;
  };
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    insurance: boolean;
  };
  documents: {
    driversLicense: boolean;
    vehicleRegistration: boolean;
    insurance: boolean;
    profilePhoto: boolean;
  };
  backgroundCheck: {
    status: 'pending' | 'completed' | 'failed';
    reportId?: string;
  };
  bankingInfo: {
    stripeConnectId?: string;
    status: 'pending' | 'connected';
  };
}

export default function DriverOnboarding() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    phone: '',
    address: '',
    emergencyContact: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    licensePlate: '',
    hasInsurance: false,
    agreeToTerms: false,
    agreeToBackground: false
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to apply as a driver",
        variant: "destructive",
      });
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, setLocation, toast]);

  // Fetch existing application
  const { data: application, isLoading: applicationLoading } = useQuery({
    queryKey: ['/api/driver/application'],
    enabled: isAuthenticated,
  });

  // Submit application mutation
  const submitApplicationMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('/api/driver/application', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/driver/application'] });
      toast({
        title: "Application Submitted!",
        description: "Your driver application has been submitted for review.",
      });
      setCurrentStep(5); // Move to final step
    },
    onError: (error: Error) => {
      toast({
        title: "Application Failed",
        description: error.message || "Please check your information and try again",
        variant: "destructive",
      });
    }
  });

  // Document upload mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ documentType, file }: { documentType: string; file: File }) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', documentType);
      
      return await apiRequest('/api/driver/documents', 'POST', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/driver/application'] });
      toast({
        title: "Document Uploaded",
        description: "Your document has been uploaded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (documentType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadDocumentMutation.mutate({ documentType, file });
    }
  };

  const handleStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === 4) {
      // Validate final step
      if (!formData.agreeToTerms || !formData.agreeToBackground) {
        toast({
          title: "Agreement Required",
          description: "Please agree to the terms and background check to continue",
          variant: "destructive",
        });
        return;
      }
      
      submitApplicationMutation.mutate(formData);
    }
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'current';
    return 'upcoming';
  };

  const getStepIcon = (step: number, status: string) => {
    if (status === 'completed') return <CheckCircle className="h-5 w-5" />;
    
    switch (step) {
      case 1: return <User className="h-5 w-5" />;
      case 2: return <Truck className="h-5 w-5" />;
      case 3: return <Upload className="h-5 w-5" />;
      case 4: return <FileCheck className="h-5 w-5" />;
      case 5: return <Shield className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getApplicationStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>;
    }
  };

  if (isLoading || applicationLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-stone-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Truck className="h-16 w-16 mx-auto mb-4 text-amber-800 animate-pulse" />
          <p className="text-amber-800">Loading driver application...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // Show existing application status
  if (application && application.status !== 'new') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-stone-50 to-amber-50">
        <header className="bg-white/90 backdrop-blur-sm border-b border-stone-200">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/')}
                className="text-amber-800 hover:text-amber-900"
                data-testid="button-back-home"
              >
                ← Back
              </Button>
              <Truck className="h-8 w-8 text-amber-800" />
              <h1 className="text-xl font-bold text-amber-900">Driver Application</h1>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-amber-900 text-2xl">Application Status</CardTitle>
              <CardDescription>
                Thank you for applying to become a Returnly driver
              </CardDescription>
              <div className="flex justify-center mt-4">
                {getApplicationStatusBadge(application.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                {application.status === 'approved' ? (
                  <>
                    <CheckCircle className="h-16 w-16 mx-auto text-green-600" />
                    <h3 className="text-xl font-semibold text-green-700">Congratulations!</h3>
                    <p className="text-stone-600">
                      Your application has been approved. You can now start accepting delivery jobs.
                    </p>
                    <Button
                      onClick={() => setLocation('/driver-portal')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      data-testid="button-driver-portal"
                    >
                      Go to Driver Portal
                    </Button>
                  </>
                ) : application.status === 'rejected' ? (
                  <>
                    <AlertTriangle className="h-16 w-16 mx-auto text-red-600" />
                    <h3 className="text-xl font-semibold text-red-700">Application Not Approved</h3>
                    <p className="text-stone-600">
                      Unfortunately, we cannot approve your application at this time. 
                      Please contact support for more information.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setLocation('/contact')}
                      data-testid="button-contact-support"
                    >
                      Contact Support
                    </Button>
                  </>
                ) : (
                  <>
                    <Clock className="h-16 w-16 mx-auto text-yellow-600" />
                    <h3 className="text-xl font-semibold text-yellow-700">Under Review</h3>
                    <p className="text-stone-600">
                      Your application is currently under review. We'll notify you via email 
                      once the review is complete. This typically takes 1-3 business days.
                    </p>
                    
                    {/* Application Progress */}
                    <div className="bg-stone-50 p-4 rounded-lg text-left">
                      <h4 className="font-semibold mb-3">Review Progress:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Document Review</span>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Background Check</span>
                          {application.backgroundCheck?.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Final Approval</span>
                          <Clock className="h-4 w-4 text-yellow-600" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-stone-50 to-amber-50">
      <header className="bg-white/90 backdrop-blur-sm border-b border-stone-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/')}
              className="text-amber-800 hover:text-amber-900"
              data-testid="button-back-home"
            >
              ← Back
            </Button>
            <Truck className="h-8 w-8 text-amber-800" />
            <h1 className="text-xl font-bold text-amber-900">Become a Driver</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4, 5].map((step) => {
              const status = getStepStatus(step);
              return (
                <div key={step} className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                    ${status === 'completed' ? 'bg-green-600 text-white' :
                      status === 'current' ? 'bg-amber-600 text-white' : 
                      'bg-stone-300 text-stone-600'}
                  `}>
                    {getStepIcon(step, status)}
                  </div>
                  <div className="mt-2 text-xs text-center max-w-20">
                    {step === 1 && 'Personal Info'}
                    {step === 2 && 'Vehicle Info'}
                    {step === 3 && 'Documents'}
                    {step === 4 && 'Agreement'}
                    {step === 5 && 'Complete'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-amber-900">
              {currentStep === 1 && 'Personal Information'}
              {currentStep === 2 && 'Vehicle Information'}
              {currentStep === 3 && 'Document Upload'}
              {currentStep === 4 && 'Terms & Agreement'}
              {currentStep === 5 && 'Application Complete'}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Tell us about yourself'}
              {currentStep === 2 && 'Provide your vehicle details'}
              {currentStep === 3 && 'Upload required documents'}
              {currentStep === 4 && 'Review and agree to terms'}
              {currentStep === 5 && 'Thank you for applying!'}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleStepSubmit}>
            <CardContent className="space-y-6">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-amber-900">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="John Doe"
                      required
                      data-testid="input-full-name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-amber-900">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      required
                      data-testid="input-date-birth"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-amber-900">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      required
                      data-testid="input-phone"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-amber-900">Address *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Main St, City, State 12345"
                      required
                      data-testid="textarea-address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact" className="text-amber-900">Emergency Contact *</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      placeholder="Jane Doe - (555) 987-6543"
                      required
                      data-testid="input-emergency-contact"
                    />
                  </div>
                </>
              )}

              {/* Step 2: Vehicle Information */}
              {currentStep === 2 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleMake" className="text-amber-900">Vehicle Make *</Label>
                      <Input
                        id="vehicleMake"
                        value={formData.vehicleMake}
                        onChange={(e) => handleInputChange('vehicleMake', e.target.value)}
                        placeholder="Toyota"
                        required
                        data-testid="input-vehicle-make"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="vehicleModel" className="text-amber-900">Vehicle Model *</Label>
                      <Input
                        id="vehicleModel"
                        value={formData.vehicleModel}
                        onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                        placeholder="Camry"
                        required
                        data-testid="input-vehicle-model"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleYear" className="text-amber-900">Year *</Label>
                      <Input
                        id="vehicleYear"
                        type="number"
                        min="2010"
                        max="2025"
                        value={formData.vehicleYear}
                        onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
                        placeholder="2020"
                        required
                        data-testid="input-vehicle-year"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="licensePlate" className="text-amber-900">License Plate *</Label>
                      <Input
                        id="licensePlate"
                        value={formData.licensePlate}
                        onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                        placeholder="ABC-1234"
                        required
                        data-testid="input-license-plate"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasInsurance"
                      checked={formData.hasInsurance}
                      onCheckedChange={(checked) => handleInputChange('hasInsurance', checked as boolean)}
                      data-testid="checkbox-insurance"
                    />
                    <Label htmlFor="hasInsurance" className="text-amber-900">
                      I have valid vehicle insurance
                    </Label>
                  </div>
                </>
              )}

              {/* Step 3: Document Upload */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-amber-900">Driver's License *</Label>
                      <div className="border-2 border-dashed border-stone-300 rounded-lg p-4 text-center">
                        <Upload className="h-8 w-8 mx-auto text-stone-400 mb-2" />
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload('drivers_license', e)}
                          className="hidden"
                          id="drivers-license-upload"
                        />
                        <label
                          htmlFor="drivers-license-upload"
                          className="cursor-pointer text-amber-700 hover:text-amber-800"
                        >
                          Upload Driver's License
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-amber-900">Vehicle Registration *</Label>
                      <div className="border-2 border-dashed border-stone-300 rounded-lg p-4 text-center">
                        <Upload className="h-8 w-8 mx-auto text-stone-400 mb-2" />
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload('vehicle_registration', e)}
                          className="hidden"
                          id="vehicle-registration-upload"
                        />
                        <label
                          htmlFor="vehicle-registration-upload"
                          className="cursor-pointer text-amber-700 hover:text-amber-800"
                        >
                          Upload Registration
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-amber-900">Insurance Card *</Label>
                      <div className="border-2 border-dashed border-stone-300 rounded-lg p-4 text-center">
                        <Upload className="h-8 w-8 mx-auto text-stone-400 mb-2" />
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload('insurance_card', e)}
                          className="hidden"
                          id="insurance-card-upload"
                        />
                        <label
                          htmlFor="insurance-card-upload"
                          className="cursor-pointer text-amber-700 hover:text-amber-800"
                        >
                          Upload Insurance Card
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-amber-900">Profile Photo *</Label>
                      <div className="border-2 border-dashed border-stone-300 rounded-lg p-4 text-center">
                        <Upload className="h-8 w-8 mx-auto text-stone-400 mb-2" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload('profile_photo', e)}
                          className="hidden"
                          id="profile-photo-upload"
                        />
                        <label
                          htmlFor="profile-photo-upload"
                          className="cursor-pointer text-amber-700 hover:text-amber-800"
                        >
                          Upload Profile Photo
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Terms & Agreement */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-stone-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-amber-900 mb-4">Independent Contractor Agreement</h3>
                    <p className="text-sm text-stone-700 mb-4">
                      By applying to become a Returnly driver, you acknowledge that:
                    </p>
                    <ul className="text-sm text-stone-700 space-y-2 list-disc list-inside">
                      <li>You will work as an independent contractor, not an employee</li>
                      <li>You are responsible for your own vehicle maintenance and expenses</li>
                      <li>You must maintain valid insurance and vehicle registration</li>
                      <li>You agree to follow all traffic laws and safety protocols</li>
                      <li>You will provide professional and courteous service to all customers</li>
                      <li>You understand that Returnly may deactivate your account for policy violations</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                        data-testid="checkbox-terms"
                      />
                      <Label htmlFor="agreeToTerms" className="text-amber-900">
                        I agree to the Terms of Service and Independent Contractor Agreement
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="agreeToBackground"
                        checked={formData.agreeToBackground}
                        onCheckedChange={(checked) => handleInputChange('agreeToBackground', checked as boolean)}
                        data-testid="checkbox-background"
                      />
                      <Label htmlFor="agreeToBackground" className="text-amber-900">
                        I consent to a background check and authorize Returnly to verify my information
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Complete */}
              {currentStep === 5 && (
                <div className="text-center space-y-4">
                  <CheckCircle className="h-16 w-16 mx-auto text-green-600" />
                  <h3 className="text-xl font-semibold text-green-700">Application Submitted!</h3>
                  <p className="text-stone-600">
                    Thank you for applying to become a Returnly driver. We'll review your application 
                    and run a background check. You'll receive an email within 1-3 business days with 
                    the results.
                  </p>
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-amber-900 mb-2">What's Next?</h4>
                    <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside text-left">
                      <li>We'll review your documents and information</li>
                      <li>A background check will be conducted</li>
                      <li>You'll receive approval notification via email</li>
                      <li>Set up your Stripe Connect account for payments</li>
                      <li>Start accepting delivery jobs!</li>
                    </ol>
                  </div>
                  <Button
                    onClick={() => setLocation('/')}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    data-testid="button-return-home"
                  >
                    Return to Home
                  </Button>
                </div>
              )}

              {/* Navigation Buttons */}
              {currentStep < 5 && (
                <div className="flex justify-between pt-6 border-t">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      data-testid="button-previous-step"
                    >
                      Previous
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white ml-auto"
                    disabled={submitApplicationMutation.isPending}
                    data-testid="button-next-step"
                  >
                    {currentStep === 4 ? 'Submit Application' : 'Next Step'}
                  </Button>
                </div>
              )}
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}