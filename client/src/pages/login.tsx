import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useLocation, Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth-simple";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { registrationSchema, loginSchema, type RegistrationData, type LoginData } from "@shared/validation";
import { Mail, Lock, User, Phone, Eye, EyeOff, Shield } from "lucide-react";
import { SiGoogle, SiApple, SiFacebook } from "react-icons/si";
import { handleError } from "@/lib/errorHandler";
import { BackButton } from "@/components/BackButton";

// Import delivery images
import deliveryCarImg from "@assets/Delivery Driver- Box in Car_1754856749497.jpeg";
import deliveryHandoffImg from "@assets/Delivery Driver- Handoff_1754856749519.jpeg";
import deliveryOutsideImg from "@assets/Delivery Driver- outside_1754856749521.jpeg";
import deliveryReceivingImg from "@assets/Delivery Driver Receiving Box_1754856749524.jpeg";
import deliveryProfessionalImg from "@assets/delivery-professional.png";
import deliveryDriverSignupImg from "@assets/Delivery Driver Receiving Box_1754856749524.jpeg";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Check URL params for tab selection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab === 'register') {
      setActiveTab('register');
    }
  }, []);

  // Login form state - no pre-filled values
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: ''
  });

  // Register form state
  const [registerData, setRegisterData] = useState<RegistrationData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: ''
  });

  // Use the clearest, most professional background image
  const [selectedImage, setSelectedImage] = useState(deliveryHandoffImg);

  // Dynamic background positioning based on tab
  const backgroundPosition = activeTab === 'register' ? 'right center' : 'center center';

  // Demo login mutation
  const demoLoginMutation = useMutation({
    mutationFn: async () => {
      const data = await apiRequest("POST", "/api/auth/demo-login", {});
      return data;
    },
    onSuccess: async (data: any) => {
      console.log('Demo login response data:', data);
      const user = data.user;
      login(user);
      
      // Redirect demo user to home page (not admin since isAdmin: false)
      console.log('Redirecting demo user to home');
      setLocation('/');
      
      toast({
        title: "Welcome to the demo!",
        description: "You're now exploring Return It with demo access.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      handleError(error, {
        context: "Demo Login",
        userMessage: "Demo login failed"
      });
      
      toast({
        title: "Demo unavailable",
        description: "Please try again or sign in with your account.",
        variant: "destructive",
      });
    }
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const data = await apiRequest("POST", "/api/auth/login", credentials);
      return data;
    },
    onSuccess: async (data: any) => {
      console.log('Login response data:', data);
      const user = data.user; // Extract user from response
      login(user);
      
      // Redirect based on user role
      if (user.isAdmin) {
        console.log('Redirecting admin user to dashboard');
        setLocation('/admin-dashboard');
      } else if (user.isDriver) {
        console.log('Redirecting driver user to portal');
        setLocation('/driver-portal');
      } else {
        console.log('Redirecting regular user to home');
        setLocation('/');
      }
      
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      // Log detailed error for debugging
      handleError(error, {
        context: "User Login",
        userMessage: "Error"
      });
      
      // Parse error response for specific UX behaviors
      try {
        const errorData = error instanceof Error ? JSON.parse(error.message) : error;
        
        // Handle specific authentication scenarios with preserved UX logic
        if (errorData.requiresSignup) {
          toast({
            title: "Error",
            description: "Please try again.",
            variant: "destructive",
          });
          
          // Automatically switch to signup tab if user doesn't exist
          setTimeout(() => {
            setActiveTab("register");
            setRegisterData(prev => ({ ...prev, email: loginData.email }));
          }, 2000);
          
        } else {
          toast({
            title: "Error",
            description: "Please check your credentials and try again.",
            variant: "destructive",
          });
        }
      } catch {
        // Fallback for unparseable errors
        toast({
          title: "Error",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegistrationData) => {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      return await response.json();
    },
    onSuccess: async (data) => {
      toast({
        title: "Account Created Successfully!",
        description: "Welcome to Return It! You're now ready to start using our service.",
      });
      setActiveTab("login");
      setLoginData({ email: registerData.email, password: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      // Log detailed error for debugging
      handleError(error, {
        context: "User Registration",
        userMessage: "Error"
      });
      
      const errorMessage = error instanceof Error ? error.message : "Registration failed. Please try again.";
      
      // Parse field-specific errors if available (preserve validation logic)
      if (errorMessage.includes('validation')) {
        try {
          const validationError = JSON.parse(errorMessage);
          setValidationErrors(validationError.fieldErrors || {});
        } catch {
          toast({
            title: "Error",
            description: "Please check your information and try again.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Please check your information and try again.",
          variant: "destructive",
        });
      }
    },
  });

  // Handle form submissions
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    
    // Validate form data
    const validation = loginSchema.safeParse(loginData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((error) => {
        if (error.path[0]) {
          errors[error.path[0] as string] = error.message;
        }
      });
      setValidationErrors(errors);
      return;
    }
    
    loginMutation.mutate(loginData);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    
    // Validate form data
    const validation = registrationSchema.safeParse(registerData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((error) => {
        if (error.path[0]) {
          errors[error.path[0] as string] = error.message;
        }
      });
      setValidationErrors(errors);
      return;
    }
    
    registerMutation.mutate(registerData);
  };

  // Social authentication handlers
  const handleGoogleAuth = () => {
    // Redirect to actual Google OAuth endpoint
    window.location.href = '/api/auth/google';
  };

  const handleAppleAuth = () => {
    // Redirect to Apple OAuth endpoint when available
    window.location.href = '/api/auth/apple';
  };

  const handleFacebookAuth = () => {
    // Redirect to Facebook OAuth endpoint
    window.location.href = '/api/auth/facebook';
  };

  // Social button component
  const SocialButton = ({ provider, icon: Icon, onClick, color }: {
    provider: string;
    icon: any;
    onClick: () => void;
    color: string;
  }) => (
    <Button
      type="button"
      variant="outline"
      className={`w-full h-10 text-sm ${color}`}
      onClick={onClick}
      data-testid={`button-${provider.toLowerCase()}-auth`}
    >
      <Icon className="h-4 w-4 mr-2" />
      Continue with {provider}
    </Button>
  );

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#231b0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button - Instagram Style */}
        <div className="mb-4">
          <BackButton fallbackUrl="/" />
        </div>
        
        {/* Header - Stitch Pattern */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="text-3xl font-bold mb-2 cursor-pointer">
              Return It
            </div>
          </Link>
          <p className="text-muted-foreground">Professional return service</p>
        </div>

        {/* Tab Navigation - Stitch Pattern */}
        <div className="flex bg-card rounded-xl border border-border shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_-4px_rgba(249,152,6,0.15)] mb-6">
          <button
            className={`flex-1 py-3 px-4 text-sm font-medium text-center rounded-l-xl transition-colors ${
              activeTab === 'login' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-transparent hover:bg-accent'
            }`}
            onClick={() => setActiveTab('login')}
            data-testid="tab-sign-in"
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-3 px-4 text-sm font-medium text-center rounded-r-xl transition-colors ${
              activeTab === 'register' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-transparent hover:bg-accent'
            }`}
            onClick={() => setActiveTab('register')}
            data-testid="tab-sign-up"
          >
            Sign Up
          </button>
        </div>

        {/* Forms - Stitch Shadow */}
        <Card className="bg-card border-border shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_30px_-15px_rgba(249,152,6,0.2)]">
          <CardHeader className="text-center pb-2 md:pb-6">
            <CardTitle className="text-lg md:text-xl">
              {activeTab === 'login' ? 'Sign In' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {activeTab === 'login' ? 'Access your Return It account' : 'Join Return It today'}
            </CardDescription>
          </CardHeader>
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-xs sm:text-sm font-medium">Email Address</Label>
                  <div className="relative">
                    <Input
                      id="login-email"
                      data-testid="input-login-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({...prev, email: e.target.value}))}
                      placeholder="Enter your email address"
                      className="pl-10 h-11"
                      autoComplete="off"
                    />
                    <Mail className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                    {validationErrors.email && (
                      <p className="text-red-600 text-xs mt-1">{validationErrors.email}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-xs sm:text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      data-testid="input-login-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({...prev, password: e.target.value}))}
                      placeholder="Enter your password"
                      className="pl-10 h-11"
                      autoComplete="off"
                    />
                    <Lock className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                    {validationErrors.password && (
                      <p className="text-red-600 text-xs mt-1">{validationErrors.password}</p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-3 md:space-y-4 pt-2 md:pt-6">
                <Button 
                  type="submit" 
                  className="w-full h-11"
                  disabled={loginMutation.isPending}
                  data-testid="button-login-submit"
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
                
                {/* Demo Account Button */}
                <div className="relative">
                  <div className="flex items-center my-3">
                    <div className="flex-1 h-px bg-accent"></div>
                    <span className="px-3 text-xs font-medium text-muted-foreground bg-white">
                      Try without signing up
                    </span>
                    <div className="flex-1 h-px bg-accent"></div>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline"
                    className="w-full bg-gradient-to-r from-amber-50 to-amber-50 border-amber-200 hover:border-amber-300 text-amber-800 hover:text-amber-900 h-11 font-medium"
                    disabled={demoLoginMutation.isPending}
                    onClick={() => demoLoginMutation.mutate()}
                    data-testid="button-demo-login"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {demoLoginMutation.isPending ? "Starting demo..." : "Try Demo Account"}
                  </Button>
                  <p className="text-xs text-center text-gray-600 mt-2">
                    Explore all features except admin panel • No signup required
                  </p>
                </div>
                
                <div className="flex items-center my-4 md:my-8">
                  <div className="flex-1 h-px bg-accent"></div>
                  <span className="px-3 md:px-4 text-xs md:text-sm font-medium text-muted-foreground bg-white">
                    Or continue with
                  </span>
                  <div className="flex-1 h-px bg-accent"></div>
                </div>
                
                <div className="space-y-2">
                  <SocialButton 
                    provider="Google" 
                    icon={SiGoogle} 
                    onClick={handleGoogleAuth}
                    color="bg-red-50"
                  />
                  <SocialButton 
                    provider="Facebook" 
                    icon={SiFacebook} 
                    onClick={handleFacebookAuth}
                    color="bg-amber-50"
                  />
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setLocation('/')}
                  data-testid="button-back-home"
                >
                  Back to Home
                </Button>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-firstName" className="text-foreground font-medium">First Name</Label>
                    <div className="bg-accent p-4 rounded-lg border border-border">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-primary" />
                        <Input
                          id="register-firstName"
                          data-testid="input-register-firstName"
                          type="text"
                          value={registerData.firstName}
                          onChange={(e) => setRegisterData(prev => ({...prev, firstName: e.target.value}))}
                          placeholder="First name"
                          className="border-0 bg-transparent focus:ring-0 focus:ring-offset-0 text-foreground placeholder:text-muted-foreground"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    {validationErrors.firstName && (
                      <p className="text-red-600 text-xs mt-1">{validationErrors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-lastName" className="text-foreground font-medium">Last Name</Label>
                    <div className="bg-accent p-4 rounded-lg border border-border">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-primary" />
                        <Input
                          id="register-lastName"
                          data-testid="input-register-lastName"
                          type="text"
                          value={registerData.lastName}
                          onChange={(e) => setRegisterData(prev => ({...prev, lastName: e.target.value}))}
                          placeholder="Last name"
                          className="border-0 bg-transparent focus:ring-0 focus:ring-offset-0 text-foreground placeholder:text-muted-foreground"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    {validationErrors.lastName && (
                      <p className="text-red-600 text-xs mt-1">{validationErrors.lastName}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-foreground font-medium">Email Address</Label>
                  <div className="bg-accent p-4 rounded-lg border border-border">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <Input
                        id="register-email"
                        data-testid="input-register-email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData(prev => ({...prev, email: e.target.value}))}
                        placeholder="Enter your email address"
                        className="border-0 bg-transparent focus:ring-0 focus:ring-offset-0 text-foreground placeholder:text-muted-foreground"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  {validationErrors.email && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-foreground font-medium">Password</Label>
                  <div className="bg-accent p-4 rounded-lg border border-border">
                    <div className="flex items-center space-x-3">
                      <Lock className="h-5 w-5 text-primary" />
                      <Input
                        id="register-password"
                        data-testid="input-register-password"
                        type={showPassword ? "text" : "password"}
                        value={registerData.password}
                        onChange={(e) => setRegisterData(prev => ({...prev, password: e.target.value}))}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        placeholder="Create a password"
                        className="border-0 bg-transparent focus:ring-0 focus:ring-offset-0 text-foreground placeholder:text-muted-foreground"
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-primary hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {(passwordFocused || registerData.password) && (
                    <PasswordStrengthIndicator password={registerData.password} />
                  )}
                  {validationErrors.password && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.password}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirmPassword" className="text-foreground font-medium">Confirm Password</Label>
                  <div className="bg-accent p-4 rounded-lg border border-border">
                    <div className="flex items-center space-x-3">
                      <Lock className="h-5 w-5 text-primary" />
                      <Input
                        id="register-confirmPassword"
                        data-testid="input-register-confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData(prev => ({...prev, confirmPassword: e.target.value}))}
                        placeholder="Confirm your password"
                        className="border-0 bg-transparent focus:ring-0 focus:ring-offset-0 text-foreground placeholder:text-muted-foreground"
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-primary hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.confirmPassword}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full h-12"
                  disabled={registerMutation.isPending}
                  data-testid="button-register-submit"
                >
                  <User className="h-4 w-4 mr-2" />
                  {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>
                
                <div className="flex items-center my-8">
                  <div className="flex-1 h-px bg-accent"></div>
                  <span className="px-4 text-sm font-medium text-muted-foreground bg-white">
                    Or continue with
                  </span>
                  <div className="flex-1 h-px bg-accent"></div>
                </div>
                
                <div className="space-y-2">
                  <SocialButton 
                    provider="Google" 
                    icon={SiGoogle} 
                    onClick={handleGoogleAuth}
                    color="bg-red-50"
                  />
                  <SocialButton 
                    provider="Facebook" 
                    icon={SiFacebook} 
                    onClick={handleFacebookAuth}
                    color="bg-amber-50"
                  />
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setLocation('/')}
                  data-testid="button-back-home"
                >
                  Back to Home
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}