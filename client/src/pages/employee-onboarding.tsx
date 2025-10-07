import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ChevronRight, ChevronLeft, CheckCircle, Circle, User, Building2, 
  BookOpen, Shield, Settings, FileText, Trophy, Users, Headphones,
  Truck, BarChart3, Target, Clock, Mail, Phone, MapPin, Calendar,
  Camera, Upload, Download, Star, Award, Zap, Gift, Heart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  required: boolean;
}

interface EmployeeData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  
  // Demographic Information (EEO Compliance)
  gender?: string;
  ethnicityRace?: string;
  isVeteran?: boolean;
  hasDisability?: boolean;
  
  // Professional Information
  position: string;
  department: string;
  startDate: string;
  employeeId: string;
  supervisor: string;
  workLocation: string;
  
  // System Access
  password: string;
  confirmPassword: string;
  profilePhoto: string;
  
  // Training & Preferences
  trainingPreferences: string[];
  communicationPreferences: string[];
  workSchedulePreference: string;
  
  // Agreements & Compliance
  handbookAcknowledged: boolean;
  privacyPolicyAgreed: boolean;
  codeOfConductAgreed: boolean;
  safetyTrainingCompleted: boolean;
  
  // Skills & Experience
  previousExperience: string;
  skills: string[];
  certifications: string[];
  languages: string[];
  
  // Goals & Expectations
  careerGoals: string;
  learningObjectives: string[];
  firstMonthGoals: string;
}

export default function EmployeeOnboarding() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [employeeData, setEmployeeData] = useState<EmployeeData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    dateOfBirth: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    gender: '',
    ethnicityRace: '',
    isVeteran: false,
    hasDisability: false,
    position: '',
    department: '',
    startDate: new Date().toISOString().split('T')[0],
    employeeId: '',
    supervisor: '',
    workLocation: '',
    password: '',
    confirmPassword: '',
    profilePhoto: '',
    trainingPreferences: [],
    communicationPreferences: [],
    workSchedulePreference: '',
    handbookAcknowledged: false,
    privacyPolicyAgreed: false,
    codeOfConductAgreed: false,
    safetyTrainingCompleted: false,
    previousExperience: '',
    skills: [],
    certifications: [],
    languages: [],
    careerGoals: '',
    learningObjectives: [],
    firstMonthGoals: ''
  });

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Return It',
      description: 'Get started with your employee journey',
      icon: <Heart className="h-5 w-5" />,
      completed: false,
      required: true
    },
    {
      id: 'personal-info',
      title: 'Personal Information',
      description: 'Basic personal and contact details',
      icon: <User className="h-5 w-5" />,
      completed: false,
      required: true
    },
    {
      id: 'professional-info',
      title: 'Professional Details',
      description: 'Position, department, and work information',
      icon: <Building2 className="h-5 w-5" />,
      completed: false,
      required: true
    },
    {
      id: 'system-setup',
      title: 'System Access Setup',
      description: 'Create your account and security settings',
      icon: <Shield className="h-5 w-5" />,
      completed: false,
      required: true
    },
    {
      id: 'training-preferences',
      title: 'Training & Preferences',
      description: 'Choose your learning path and preferences',
      icon: <BookOpen className="h-5 w-5" />,
      completed: false,
      required: true
    },
    {
      id: 'compliance',
      title: 'Compliance & Agreements',
      description: 'Review and agree to company policies',
      icon: <FileText className="h-5 w-5" />,
      completed: false,
      required: true
    },
    {
      id: 'skills-experience',
      title: 'Skills & Experience',
      description: 'Share your background and expertise',
      icon: <Trophy className="h-5 w-5" />,
      completed: false,
      required: false
    },
    {
      id: 'goals-expectations',
      title: 'Goals & Expectations',
      description: 'Set your career objectives and learning goals',
      icon: <Target className="h-5 w-5" />,
      completed: false,
      required: false
    },
    {
      id: 'completion',
      title: 'Welcome Aboard!',
      description: 'Complete your onboarding and get started',
      icon: <Award className="h-5 w-5" />,
      completed: false,
      required: true
    }
  ];

  const [onboardingSteps, setOnboardingSteps] = useState(steps);

  // Calculate progress
  const completedSteps = onboardingSteps.filter(step => step.completed).length;
  const totalSteps = onboardingSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  // Navigation functions
  const goToNextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      markStepCompleted(currentStep);
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const markStepCompleted = (stepIndex: number) => {
    setOnboardingSteps(prev => 
      prev.map((step, index) => 
        index === stepIndex ? { ...step, completed: true } : step
      )
    );
  };

  // Validation functions
  const validateCurrentStep = (): boolean => {
    const step = onboardingSteps[currentStep];
    
    switch (step.id) {
      case 'personal-info':
        return !!(employeeData.firstName && employeeData.lastName && 
                 employeeData.email && employeeData.phone);
      case 'professional-info':
        return !!(employeeData.position && employeeData.department && 
                 employeeData.startDate);
      case 'system-setup':
        return !!(employeeData.password && employeeData.confirmPassword && 
                 employeeData.password === employeeData.confirmPassword);
      case 'compliance':
        return !!(employeeData.handbookAcknowledged && 
                 employeeData.privacyPolicyAgreed && 
                 employeeData.codeOfConductAgreed);
      default:
        return true;
    }
  };

  // Complete onboarding
  const completeOnboarding = async () => {
    try {
      toast({
        title: "Processing Onboarding",
        description: "Setting up your employee account...",
      });

      // Simulate API call to complete onboarding
      await new Promise(resolve => setTimeout(resolve, 2000));

      markStepCompleted(currentStep);
      
      toast({
        title: "Welcome to Return It!",
        description: "Your onboarding is complete. You can now access the employee dashboard.",
      });

      // Redirect to employee dashboard after completion
      setTimeout(() => {
        window.location.href = '/employee-dashboard';
      }, 2000);

    } catch (error) {
      toast({
        title: "Onboarding Error",
        description: "There was an issue completing your onboarding. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Render step content
  const renderStepContent = () => {
    const step = onboardingSteps[currentStep];

    switch (step.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6 py-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-foreground mb-2">Welcome to Return It!</h2>
              <p className="text-lg text-muted-foreground mb-6">
                We're excited to have you join our team. This onboarding wizard will help you get set up and ready to make an impact.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-[#f8f7f5] dark:bg-[#231b0f] rounded-lg border border-border">
                <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Join Our Team</h3>
                <p className="text-sm text-muted-foreground">Connect with amazing colleagues and be part of something special</p>
              </div>
              <div className="text-center p-6 bg-[#f8f7f5] dark:bg-[#231b0f] rounded-lg border border-border">
                <Zap className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Make an Impact</h3>
                <p className="text-sm text-muted-foreground">Your skills and ideas will help transform how people handle returns</p>
              </div>
              <div className="text-center p-6 bg-[#f8f7f5] dark:bg-[#231b0f] rounded-lg border border-border">
                <Gift className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Grow & Learn</h3>
                <p className="text-sm text-muted-foreground">Access continuous learning opportunities and career development</p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-transparent to-transparent rounded-lg border border-border">
              <h4 className="font-semibold text-foreground mb-3">What to Expect:</h4>
              <ul className="text-left text-foreground space-y-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Complete your personal and professional information</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Set up your system access and security preferences</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Choose your training path and communication preferences</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Review important company policies and agreements</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'personal-info':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Personal Information</h3>
              <p className="text-muted-foreground mb-6">Please provide your basic personal and contact information.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-foreground font-medium">First Name*</Label>
                <Input
                  id="firstName"
                  data-testid="input-first-name"
                  value={employeeData.firstName}
                  onChange={(e) => setEmployeeData(prev => ({...prev, firstName: e.target.value}))}
                  className="border-border focus:border-border"
                  placeholder="Enter your first name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-foreground font-medium">Last Name*</Label>
                <Input
                  id="lastName"
                  data-testid="input-last-name"
                  value={employeeData.lastName}
                  onChange={(e) => setEmployeeData(prev => ({...prev, lastName: e.target.value}))}
                  className="border-border focus:border-border"
                  placeholder="Enter your last name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">Email Address*</Label>
                <Input
                  id="email"
                  data-testid="input-email"
                  type="email"
                  value={employeeData.email}
                  onChange={(e) => setEmployeeData(prev => ({...prev, email: e.target.value}))}
                  className="border-border focus:border-border"
                  placeholder="Enter your email address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground font-medium">Phone Number*</Label>
                <Input
                  id="phone"
                  data-testid="input-phone"
                  value={employeeData.phone}
                  onChange={(e) => setEmployeeData(prev => ({...prev, phone: e.target.value}))}
                  className="border-border focus:border-border"
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-foreground font-medium">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  data-testid="input-date-of-birth"
                  type="date"
                  value={employeeData.dateOfBirth}
                  onChange={(e) => setEmployeeData(prev => ({...prev, dateOfBirth: e.target.value}))}
                  className="border-border focus:border-border"
                />
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-lg font-semibold text-foreground mb-4">Address Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address" className="text-foreground font-medium">Street Address</Label>
                  <Input
                    id="address"
                    data-testid="input-address"
                    value={employeeData.address}
                    onChange={(e) => setEmployeeData(prev => ({...prev, address: e.target.value}))}
                    className="border-border focus:border-border"
                    placeholder="123 Main Street"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-foreground font-medium">City</Label>
                  <Input
                    id="city"
                    data-testid="input-city"
                    value={employeeData.city}
                    onChange={(e) => setEmployeeData(prev => ({...prev, city: e.target.value}))}
                    className="border-border focus:border-border"
                    placeholder="St. Louis"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-foreground font-medium">State</Label>
                  <Select onValueChange={(value) => setEmployeeData(prev => ({...prev, state: value}))}>
                    <SelectTrigger data-testid="select-state" className="border-border focus:border-border">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MO">Missouri</SelectItem>
                      <SelectItem value="IL">Illinois</SelectItem>
                      <SelectItem value="KS">Kansas</SelectItem>
                      <SelectItem value="IA">Iowa</SelectItem>
                      <SelectItem value="AR">Arkansas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-foreground font-medium">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    data-testid="input-zip"
                    value={employeeData.zipCode}
                    onChange={(e) => setEmployeeData(prev => ({...prev, zipCode: e.target.value}))}
                    className="border-border focus:border-border"
                    placeholder="63101"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-lg font-semibold text-foreground mb-4">Emergency Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName" className="text-foreground font-medium">Emergency Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    data-testid="input-emergency-name"
                    value={employeeData.emergencyContactName}
                    onChange={(e) => setEmployeeData(prev => ({...prev, emergencyContactName: e.target.value}))}
                    className="border-border focus:border-border"
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone" className="text-foreground font-medium">Emergency Contact Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    data-testid="input-emergency-phone"
                    value={employeeData.emergencyContactPhone}
                    onChange={(e) => setEmployeeData(prev => ({...prev, emergencyContactPhone: e.target.value}))}
                    className="border-border focus:border-border"
                    placeholder="(555) 987-6543"
                  />
                </div>
              </div>
            </div>

            {/* Demographic Information (EEO Compliance) */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-foreground mb-2">Equal Employment Opportunity Information</h4>
              <p className="text-primary text-sm mb-4">
                The following questions are asked for statistical purposes only and are used to comply with federal reporting requirements. 
                Your responses are voluntary and will not affect your employment or advancement opportunities.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-foreground font-medium">Gender (Optional)</Label>
                  <Select onValueChange={(value) => setEmployeeData(prev => ({...prev, gender: value}))}>
                    <SelectTrigger data-testid="select-gender" className="border-border focus:border-border">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-answer">Prefer not to answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ethnicityRace" className="text-foreground font-medium">Race/Ethnicity (Optional)</Label>
                  <Select onValueChange={(value) => setEmployeeData(prev => ({...prev, ethnicityRace: value}))}>
                    <SelectTrigger data-testid="select-ethnicity" className="border-border focus:border-border">
                      <SelectValue placeholder="Select race/ethnicity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hispanic-latino">Hispanic or Latino</SelectItem>
                      <SelectItem value="white">White (Not Hispanic or Latino)</SelectItem>
                      <SelectItem value="black-african-american">Black or African American</SelectItem>
                      <SelectItem value="asian">Asian</SelectItem>
                      <SelectItem value="american-indian-alaska-native">American Indian or Alaska Native</SelectItem>
                      <SelectItem value="native-hawaiian-pacific-islander">Native Hawaiian or Other Pacific Islander</SelectItem>
                      <SelectItem value="two-or-more-races">Two or More Races</SelectItem>
                      <SelectItem value="prefer-not-to-answer">Prefer not to answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isVeteran" className="text-foreground font-medium">Veteran Status (Optional)</Label>
                  <Select onValueChange={(value) => setEmployeeData(prev => ({...prev, isVeteran: value === 'yes'}))}>
                    <SelectTrigger data-testid="select-veteran" className="border-border focus:border-border">
                      <SelectValue placeholder="Select veteran status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes, I am a veteran</SelectItem>
                      <SelectItem value="no">No, I am not a veteran</SelectItem>
                      <SelectItem value="prefer-not-to-answer">Prefer not to answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hasDisability" className="text-foreground font-medium">Disability Status (Optional)</Label>
                  <Select onValueChange={(value) => setEmployeeData(prev => ({...prev, hasDisability: value === 'yes'}))}>
                    <SelectTrigger data-testid="select-disability" className="border-border focus:border-border">
                      <SelectValue placeholder="Select disability status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes, I have a disability</SelectItem>
                      <SelectItem value="no">No, I do not have a disability</SelectItem>
                      <SelectItem value="prefer-not-to-answer">Prefer not to answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 p-4 bg-[#f8f7f5] dark:bg-[#231b0f] rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">
                  <strong>Privacy Notice:</strong> This information is kept confidential and separate from your employment records. 
                  It is used solely for compliance with Equal Employment Opportunity reporting requirements and to track our efforts 
                  to provide equal employment opportunities to all individuals.
                </p>
              </div>
            </div>
          </div>
        );

      case 'professional-info':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Professional Information</h3>
              <p className="text-muted-foreground mb-6">Tell us about your role and position within Return It.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="position" className="text-foreground font-medium">Position/Job Title*</Label>
                <Select onValueChange={(value) => setEmployeeData(prev => ({...prev, position: value}))}>
                  <SelectTrigger data-testid="select-position" className="border-border focus:border-border">
                    <SelectValue placeholder="Select your position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer-support">Customer Support Specialist</SelectItem>
                    <SelectItem value="operations-coordinator">Operations Coordinator</SelectItem>
                    <SelectItem value="driver-manager">Driver Manager</SelectItem>
                    <SelectItem value="business-analyst">Business Analyst</SelectItem>
                    <SelectItem value="marketing-coordinator">Marketing Coordinator</SelectItem>
                    <SelectItem value="hr-specialist">HR Specialist</SelectItem>
                    <SelectItem value="it-specialist">IT Specialist</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department" className="text-foreground font-medium">Department*</Label>
                <Select onValueChange={(value) => setEmployeeData(prev => ({...prev, department: value}))}>
                  <SelectTrigger data-testid="select-department" className="border-border focus:border-border">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer-support">Customer Support</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="human-resources">Human Resources</SelectItem>
                    <SelectItem value="information-technology">Information Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-foreground font-medium">Start Date*</Label>
                <Input
                  id="startDate"
                  data-testid="input-start-date"
                  type="date"
                  value={employeeData.startDate}
                  onChange={(e) => setEmployeeData(prev => ({...prev, startDate: e.target.value}))}
                  className="border-border focus:border-border"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="employeeId" className="text-foreground font-medium">Employee ID</Label>
                <Input
                  id="employeeId"
                  data-testid="input-employee-id"
                  value={employeeData.employeeId}
                  onChange={(e) => setEmployeeData(prev => ({...prev, employeeId: e.target.value}))}
                  className="border-border focus:border-border"
                  placeholder="Auto-generated or provided by HR"
                  disabled
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supervisor" className="text-foreground font-medium">Direct Supervisor</Label>
                <Select onValueChange={(value) => setEmployeeData(prev => ({...prev, supervisor: value}))}>
                  <SelectTrigger data-testid="select-supervisor" className="border-border focus:border-border">
                    <SelectValue placeholder="Select your supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nabeel-mumtaz">Nabeel Mumtaz (CEO)</SelectItem>
                    <SelectItem value="durre-mumtaz">Durre Mumtaz (COO)</SelectItem>
                    <SelectItem value="operations-manager">Operations Manager</SelectItem>
                    <SelectItem value="support-manager">Customer Support Manager</SelectItem>
                    <SelectItem value="hr-manager">HR Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workLocation" className="text-foreground font-medium">Work Location</Label>
                <Select onValueChange={(value) => setEmployeeData(prev => ({...prev, workLocation: value}))}>
                  <SelectTrigger data-testid="select-work-location" className="border-border focus:border-border">
                    <SelectValue placeholder="Select work location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="st-louis-hq">St. Louis Headquarters</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid (Office + Remote)</SelectItem>
                    <SelectItem value="field">Field Work</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-8 p-6 bg-[#f8f7f5] dark:bg-[#231b0f] rounded-lg border border-border">
              <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Department Overview
              </h4>
              {employeeData.department && (
                <div className="text-foreground">
                  {employeeData.department === 'customer-support' && (
                    <p>As part of Customer Support, you'll help our customers with inquiries, resolve issues, and ensure excellent service delivery. You'll work with our ticketing system and collaborate closely with operations teams.</p>
                  )}
                  {employeeData.department === 'operations' && (
                    <p>The Operations team manages driver coordination, route optimization, and service delivery. You'll work with real-time tracking systems and help optimize our pickup and delivery processes.</p>
                  )}
                  {employeeData.department === 'marketing' && (
                    <p>Marketing focuses on growing our customer base, brand awareness, and customer retention. You'll work on campaigns, content creation, and customer engagement strategies.</p>
                  )}
                  {employeeData.department === 'human-resources' && (
                    <p>HR manages employee relations, recruitment, training, and company culture. You'll help ensure our team has everything they need to succeed and grow with the company.</p>
                  )}
                  {employeeData.department === 'information-technology' && (
                    <p>IT maintains our platform infrastructure, develops new features, and ensures system security and performance. You'll work with modern web technologies and cloud systems.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'system-setup':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">System Access Setup</h3>
              <p className="text-muted-foreground mb-6">Create your account credentials and set up your profile.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">Password*</Label>
                <Input
                  id="password"
                  data-testid="input-password"
                  type="password"
                  autoComplete="new-password"
                  value={employeeData.password}
                  onChange={(e) => setEmployeeData(prev => ({...prev, password: e.target.value}))}
                  className="border-border focus:border-border"
                  placeholder="Create a strong password"
                />
                <div className="text-sm text-primary">
                  Password must be at least 8 characters with uppercase, lowercase, and numbers
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground font-medium">Confirm Password*</Label>
                <Input
                  id="confirmPassword"
                  data-testid="input-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={employeeData.confirmPassword}
                  onChange={(e) => setEmployeeData(prev => ({...prev, confirmPassword: e.target.value}))}
                  className="border-border focus:border-border"
                  placeholder="Confirm your password"
                />
                {employeeData.password && employeeData.confirmPassword && employeeData.password !== employeeData.confirmPassword && (
                  <div className="text-sm text-red-600">Passwords do not match</div>
                )}
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-lg font-semibold text-foreground mb-4">Profile Photo</h4>
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="h-24 w-24 rounded-full bg-accent border-2 border-border flex items-center justify-center">
                    {employeeData.profilePhoto ? (
                      <img src={employeeData.profilePhoto} alt="Profile" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-primary" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-border text-muted-foreground hover:bg-[#f8f7f5] dark:bg-[#231b0f]"
                    onClick={() => {
                      toast({
                        title: "Photo Upload",
                        description: "Photo upload feature will be available soon. For now, a default avatar will be used.",
                      });
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                  <p className="text-sm text-primary mt-2">
                    Recommended: 200x200px, JPG or PNG format, max 2MB
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security & Access Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium text-blue-800 mb-2">Your Access Level:</h5>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Employee Dashboard</li>
                    <li>• Department-specific tools</li>
                    <li>• Training materials</li>
                    <li>• Time tracking system</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-blue-800 mb-2">Security Features:</h5>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Secure password requirements</li>
                    <li>• Session timeout protection</li>
                    <li>• Audit trail logging</li>
                    <li>• Data encryption</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'training-preferences':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Training & Preferences</h3>
              <p className="text-muted-foreground mb-6">Customize your learning experience and communication preferences.</p>
            </div>

            <div className="space-y-8">
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4">Training Preferences</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'video-tutorials', label: 'Video Tutorials', icon: '🎥' },
                    { id: 'written-guides', label: 'Written Guides', icon: '📚' },
                    { id: 'interactive-demos', label: 'Interactive Demos', icon: '🖱️' },
                    { id: 'one-on-one-training', label: 'One-on-One Training', icon: '👥' },
                    { id: 'group-workshops', label: 'Group Workshops', icon: '👨‍🏫' },
                    { id: 'self-paced-learning', label: 'Self-Paced Learning', icon: '⏰' }
                  ].map((preference) => (
                    <div key={preference.id} className="flex items-center space-x-3 p-3 bg-[#f8f7f5] dark:bg-[#231b0f] rounded-lg border border-border">
                      <Checkbox
                        id={preference.id}
                        data-testid={`checkbox-${preference.id}`}
                        checked={employeeData.trainingPreferences.includes(preference.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEmployeeData(prev => ({
                              ...prev,
                              trainingPreferences: [...prev.trainingPreferences, preference.id]
                            }));
                          } else {
                            setEmployeeData(prev => ({
                              ...prev,
                              trainingPreferences: prev.trainingPreferences.filter(p => p !== preference.id)
                            }));
                          }
                        }}
                      />
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{preference.icon}</span>
                        <Label htmlFor={preference.id} className="text-foreground">{preference.label}</Label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4">Communication Preferences</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'email-updates', label: 'Email Updates', icon: <Mail className="h-4 w-4" /> },
                    { id: 'sms-notifications', label: 'SMS Notifications', icon: <Phone className="h-4 w-4" /> },
                    { id: 'desktop-notifications', label: 'Desktop Notifications', icon: <Settings className="h-4 w-4" /> },
                    { id: 'weekly-digest', label: 'Weekly Digest', icon: <Calendar className="h-4 w-4" /> }
                  ].map((preference) => (
                    <div key={preference.id} className="flex items-center space-x-3 p-3 bg-[#f8f7f5] dark:bg-[#231b0f] rounded-lg border border-border">
                      <Checkbox
                        id={preference.id}
                        data-testid={`checkbox-${preference.id}`}
                        checked={employeeData.communicationPreferences.includes(preference.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEmployeeData(prev => ({
                              ...prev,
                              communicationPreferences: [...prev.communicationPreferences, preference.id]
                            }));
                          } else {
                            setEmployeeData(prev => ({
                              ...prev,
                              communicationPreferences: prev.communicationPreferences.filter(p => p !== preference.id)
                            }));
                          }
                        }}
                      />
                      <div className="flex items-center space-x-2">
                        {preference.icon}
                        <Label htmlFor={preference.id} className="text-foreground">{preference.label}</Label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4">Work Schedule Preference</h4>
                <Select onValueChange={(value) => setEmployeeData(prev => ({...prev, workSchedulePreference: value}))}>
                  <SelectTrigger data-testid="select-schedule" className="border-border focus:border-border">
                    <SelectValue placeholder="Select your preferred work schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Hours (9 AM - 5 PM)</SelectItem>
                    <SelectItem value="early">Early Hours (7 AM - 3 PM)</SelectItem>
                    <SelectItem value="late">Late Hours (11 AM - 7 PM)</SelectItem>
                    <SelectItem value="flexible">Flexible Schedule</SelectItem>
                    <SelectItem value="shift-work">Shift Work</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'compliance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Compliance & Agreements</h3>
              <p className="text-muted-foreground mb-6">Please review and acknowledge the following company policies and agreements.</p>
            </div>

            <div className="space-y-6">
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-foreground flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Employee Handbook
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    The employee handbook contains important information about company policies, procedures, benefits, and expectations. Please review the complete handbook.
                  </p>
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-border text-muted-foreground hover:bg-[#f8f7f5] dark:bg-[#231b0f]"
                      onClick={() => {
                        // Open handbook in new tab
                        window.open('/employee-guide', '_blank');
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      View Employee Handbook
                    </Button>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="handbook-acknowledged"
                        data-testid="checkbox-handbook"
                        checked={employeeData.handbookAcknowledged}
                        onCheckedChange={(checked) => 
                          setEmployeeData(prev => ({...prev, handbookAcknowledged: !!checked}))
                        }
                      />
                      <Label htmlFor="handbook-acknowledged" className="text-foreground font-medium">
                        I have read and understood the employee handbook*
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-foreground flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Privacy Policy & Data Protection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Our privacy policy outlines how we collect, use, and protect personal information. As an employee, you'll have access to customer data and must follow our data protection guidelines.
                  </p>
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-border text-muted-foreground hover:bg-[#f8f7f5] dark:bg-[#231b0f]"
                      onClick={() => {
                        window.open('/privacy-policy', '_blank');
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Privacy Policy
                    </Button>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="privacy-agreed"
                        data-testid="checkbox-privacy"
                        checked={employeeData.privacyPolicyAgreed}
                        onCheckedChange={(checked) => 
                          setEmployeeData(prev => ({...prev, privacyPolicyAgreed: !!checked}))
                        }
                      />
                      <Label htmlFor="privacy-agreed" className="text-foreground font-medium">
                        I agree to the privacy policy and data protection guidelines*
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-foreground flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Code of Conduct
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Our code of conduct establishes the ethical standards and behavioral expectations for all Return It employees. This includes guidelines for professional conduct, customer interactions, and workplace behavior.
                  </p>
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-border text-muted-foreground hover:bg-[#f8f7f5] dark:bg-[#231b0f]"
                      onClick={() => {
                        toast({
                          title: "Code of Conduct",
                          description: "Opening code of conduct document...",
                        });
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Code of Conduct
                    </Button>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="conduct-agreed"
                        data-testid="checkbox-conduct"
                        checked={employeeData.codeOfConductAgreed}
                        onCheckedChange={(checked) => 
                          setEmployeeData(prev => ({...prev, codeOfConductAgreed: !!checked}))
                        }
                      />
                      <Label htmlFor="conduct-agreed" className="text-foreground font-medium">
                        I agree to follow the code of conduct*
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-green-900 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Safety Training (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-700 mb-4">
                    Complete our workplace safety training module to ensure you understand emergency procedures, workplace safety guidelines, and health protocols.
                  </p>
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-100"
                      onClick={() => {
                        setEmployeeData(prev => ({...prev, safetyTrainingCompleted: true}));
                        toast({
                          title: "Safety Training Completed",
                          description: "Great job! You've completed the workplace safety training.",
                        });
                      }}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Complete Safety Training
                    </Button>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="safety-completed"
                        data-testid="checkbox-safety"
                        checked={employeeData.safetyTrainingCompleted}
                        onCheckedChange={(checked) => 
                          setEmployeeData(prev => ({...prev, safetyTrainingCompleted: !!checked}))
                        }
                      />
                      <Label htmlFor="safety-completed" className="text-green-800 font-medium">
                        Safety training completed
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 p-4 bg-[#f8f7f5] dark:bg-[#231b0f] rounded-lg border border-border">
              <p className="text-sm text-foreground">
                <strong>Note:</strong> All required agreements must be acknowledged before completing your onboarding. You can always access these documents later through the employee portal.
              </p>
            </div>
          </div>
        );

      case 'skills-experience':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Skills & Experience</h3>
              <p className="text-muted-foreground mb-6">Tell us about your background, skills, and experience to help us better support your role.</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="previousExperience" className="text-foreground font-medium">Previous Experience</Label>
                <Textarea
                  id="previousExperience"
                  data-testid="textarea-experience"
                  value={employeeData.previousExperience}
                  onChange={(e) => setEmployeeData(prev => ({...prev, previousExperience: e.target.value}))}
                  className="border-border focus:border-border mt-2"
                  rows={4}
                  placeholder="Tell us about your relevant work experience, previous roles, and any experience in customer service, logistics, or related fields..."
                />
              </div>

              <div>
                <Label className="text-foreground font-medium">Technical Skills</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {[
                    'Microsoft Office', 'Google Workspace', 'Customer Service Software',
                    'Data Analysis', 'Social Media Management', 'Project Management',
                    'Logistics Software', 'CRM Systems', 'Communication Tools',
                    'Time Management', 'Problem Solving', 'Team Collaboration'
                  ].map((skill) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={`skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                        data-testid={`checkbox-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                        checked={employeeData.skills.includes(skill)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEmployeeData(prev => ({
                              ...prev,
                              skills: [...prev.skills, skill]
                            }));
                          } else {
                            setEmployeeData(prev => ({
                              ...prev,
                              skills: prev.skills.filter(s => s !== skill)
                            }));
                          }
                        }}
                      />
                      <Label 
                        htmlFor={`skill-${skill.toLowerCase().replace(/\s+/g, '-')}`} 
                        className="text-sm text-foreground"
                      >
                        {skill}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="certifications" className="text-foreground font-medium">Certifications & Qualifications</Label>
                <Textarea
                  id="certifications"
                  data-testid="textarea-certifications"
                  value={employeeData.certifications.join(', ')}
                  onChange={(e) => setEmployeeData(prev => ({...prev, certifications: e.target.value.split(', ').filter(c => c.trim())}))}
                  className="border-border focus:border-border mt-2"
                  rows={3}
                  placeholder="List any relevant certifications, licenses, or qualifications (separate with commas)..."
                />
              </div>

              <div>
                <Label className="text-foreground font-medium">Languages</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  {[
                    'English', 'Spanish', 'French', 'German', 'Mandarin', 'Arabic', 'Portuguese', 'Other'
                  ].map((language) => (
                    <div key={language} className="flex items-center space-x-2">
                      <Checkbox
                        id={`language-${language.toLowerCase()}`}
                        data-testid={`checkbox-language-${language.toLowerCase()}`}
                        checked={employeeData.languages.includes(language)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEmployeeData(prev => ({
                              ...prev,
                              languages: [...prev.languages, language]
                            }));
                          } else {
                            setEmployeeData(prev => ({
                              ...prev,
                              languages: prev.languages.filter(l => l !== language)
                            }));
                          }
                        }}
                      />
                      <Label 
                        htmlFor={`language-${language.toLowerCase()}`} 
                        className="text-sm text-foreground"
                      >
                        {language}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <h4 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Skill Development Opportunities
              </h4>
              <p className="text-purple-800 mb-3">
                Based on your skills and role, we'll recommend personalized training programs to help you grow:
              </p>
              <ul className="space-y-2 text-sm text-purple-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <span>Advanced customer service techniques</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <span>Professional development workshops</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <span>Leadership and communication training</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <span>Industry certifications and continuing education</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'goals-expectations':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Goals & Expectations</h3>
              <p className="text-muted-foreground mb-6">Help us understand your career aspirations and what you hope to achieve at Return It.</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="careerGoals" className="text-foreground font-medium">Career Goals & Aspirations</Label>
                <Textarea
                  id="careerGoals"
                  data-testid="textarea-career-goals"
                  value={employeeData.careerGoals}
                  onChange={(e) => setEmployeeData(prev => ({...prev, careerGoals: e.target.value}))}
                  className="border-border focus:border-border mt-2"
                  rows={4}
                  placeholder="What are your long-term career goals? How do you see yourself growing at Return It? What skills would you like to develop?"
                />
              </div>

              <div>
                <Label className="text-foreground font-medium">Learning Objectives (Select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {[
                    'Master customer service excellence',
                    'Develop leadership skills',
                    'Learn advanced analytics',
                    'Improve communication abilities',
                    'Understand business operations',
                    'Gain project management experience',
                    'Develop technical expertise',
                    'Build team collaboration skills'
                  ].map((objective) => (
                    <div key={objective} className="flex items-center space-x-2 p-2 bg-[#f8f7f5] dark:bg-[#231b0f] rounded border border-border">
                      <Checkbox
                        id={`objective-${objective.toLowerCase().replace(/\s+/g, '-')}`}
                        data-testid={`checkbox-objective-${objective.toLowerCase().replace(/\s+/g, '-')}`}
                        checked={employeeData.learningObjectives.includes(objective)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEmployeeData(prev => ({
                              ...prev,
                              learningObjectives: [...prev.learningObjectives, objective]
                            }));
                          } else {
                            setEmployeeData(prev => ({
                              ...prev,
                              learningObjectives: prev.learningObjectives.filter(o => o !== objective)
                            }));
                          }
                        }}
                      />
                      <Label 
                        htmlFor={`objective-${objective.toLowerCase().replace(/\s+/g, '-')}`} 
                        className="text-sm text-foreground"
                      >
                        {objective}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="firstMonthGoals" className="text-foreground font-medium">First Month Goals</Label>
                <Textarea
                  id="firstMonthGoals"
                  data-testid="textarea-first-month-goals"
                  value={employeeData.firstMonthGoals}
                  onChange={(e) => setEmployeeData(prev => ({...prev, firstMonthGoals: e.target.value}))}
                  className="border-border focus:border-border mt-2"
                  rows={3}
                  placeholder="What would you like to accomplish in your first month? What specific goals or milestones would make you feel successful?"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-blue-900 flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    30-60-90 Day Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <h5 className="font-medium text-blue-800">First 30 Days:</h5>
                      <p className="text-blue-700">Complete training, learn systems, build relationships</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-blue-800">Days 31-60:</h5>
                      <p className="text-blue-700">Take on responsibilities, contribute to projects</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-blue-800">Days 61-90:</h5>
                      <p className="text-blue-700">Full productivity, identify improvement opportunities</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-green-900 flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Success Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-700">Complete all required training modules</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-700">Meet performance expectations</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-700">Build positive team relationships</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-700">Contribute to team objectives</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'completion':
        return (
          <div className="text-center space-y-8 py-8">
            <div className="mb-8">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Congratulations!</h2>
              <p className="text-lg text-muted-foreground mb-6">
                You've successfully completed your onboarding. Welcome to the Return It family!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="text-center p-6">
                  <Users className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-green-900 mb-2">You're Part of the Team</h3>
                  <p className="text-sm text-green-700">Your account is active and you have access to all necessary systems</p>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="text-center p-6">
                  <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-blue-900 mb-2">Training Ready</h3>
                  <p className="text-sm text-blue-700">Your personalized training plan is ready based on your preferences</p>
                </CardContent>
              </Card>
              
              <Card className="border-border bg-[#f8f7f5] dark:bg-[#231b0f]">
                <CardContent className="text-center p-6">
                  <Star className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Ready to Excel</h3>
                  <p className="text-sm text-muted-foreground">You have all the tools and resources needed to succeed</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Next Steps:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="h-6 w-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-medium text-foreground">Access Your Dashboard</h4>
                    <p className="text-sm text-muted-foreground">Log in to your employee dashboard to see your personalized workspace</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-6 w-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-medium text-foreground">Meet Your Team</h4>
                    <p className="text-sm text-muted-foreground">Connect with your colleagues and supervisor for introductions</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-6 w-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-medium text-foreground">Start Training</h4>
                    <p className="text-sm text-muted-foreground">Begin your role-specific training modules at your own pace</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-6 w-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <h4 className="font-medium text-foreground">Get Support</h4>
                    <p className="text-sm text-muted-foreground">Reach out to HR or your supervisor with any questions</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-transparent to-transparent rounded-lg border border-border">
              <h4 className="font-semibold text-foreground mb-3">Important Resources</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:bg-[#f8f7f5] dark:bg-[#231b0f]">
                  <FileText className="h-4 w-4 mr-1" />
                  Employee Guide
                </Button>
                <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:bg-[#f8f7f5] dark:bg-[#231b0f]">
                  <Users className="h-4 w-4 mr-1" />
                  Team Directory
                </Button>
                <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:bg-[#f8f7f5] dark:bg-[#231b0f]">
                  <Headphones className="h-4 w-4 mr-1" />
                  Support Center
                </Button>
                <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:bg-[#f8f7f5] dark:bg-[#231b0f]">
                  <Settings className="h-4 w-4 mr-1" />
                  Account Settings
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Step content not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#231b0f]">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-border p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">R</div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Employee Onboarding</h1>
                <p className="text-muted-foreground">Complete your setup and join the team</p>
              </div>
            </div>
            <Badge className="bg-accent text-foreground px-3 py-1">
              Step {currentStep + 1} of {totalSteps}
            </Badge>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-primary">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-accent" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Step Navigation */}
          <div className="lg:col-span-1">
            <Card className="bg-white border-border sticky top-6">
              <CardHeader>
                <CardTitle className="text-foreground">Onboarding Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {onboardingSteps.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => goToStep(index)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        index === currentStep
                          ? 'bg-accent border-2 border-border'
                          : step.completed
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-gray-50 border border-gray-200 hover:bg-[#f8f7f5] dark:bg-[#231b0f]'
                      }`}
                      data-testid={`step-${step.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`flex-shrink-0 ${
                          step.completed
                            ? 'text-green-600'
                            : index === currentStep
                            ? 'text-amber-600'
                            : 'text-gray-400'
                        }`}>
                          {step.completed ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            step.icon
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm ${
                            index === currentStep
                              ? 'text-foreground'
                              : step.completed
                              ? 'text-green-900'
                              : 'text-gray-700'
                          }`}>
                            {step.title}
                          </div>
                          <div className={`text-xs ${
                            index === currentStep
                              ? 'text-amber-700'
                              : step.completed
                              ? 'text-green-700'
                              : 'text-gray-500'
                          }`}>
                            {step.description}
                          </div>
                        </div>
                        {step.required && (
                          <span className="text-xs text-red-500">*</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="bg-white border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center space-x-2">
                  {onboardingSteps[currentStep].icon}
                  <span>{onboardingSteps[currentStep].title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderStepContent()}
              </CardContent>
              
              {/* Navigation Buttons */}
              <div className="flex justify-between items-center p-6 pt-0">
                <Button
                  variant="outline"
                  onClick={goToPreviousStep}
                  disabled={currentStep === 0}
                  className="border-border text-muted-foreground hover:bg-[#f8f7f5] dark:bg-[#231b0f]"
                  data-testid="button-previous"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-2">
                  {currentStep === onboardingSteps.length - 1 ? (
                    <Button
                      onClick={completeOnboarding}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      data-testid="button-complete"
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Complete Onboarding
                    </Button>
                  ) : (
                    <Button
                      onClick={goToNextStep}
                      disabled={!validateCurrentStep()}
                      className="bg-primary hover:bg-primary/90 text-white"
                      data-testid="button-next"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}