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
  const [selectedImage, setSelectedImage] = useState(deliveryProfessionalImg);

  // Dynamic background positioning based on tab
  const backgroundPosition = activeTab === 'register' ? 'right center' : 'center center';

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return await response.json();
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
      console.error('Login error:', error);
      
      // Parse error response for better user guidance
      try {
        const errorData = error instanceof Error ? JSON.parse(error.message) : error;
        
        // Handle specific authentication scenarios
        if (errorData.requiresSignup) {
          toast({
            title: "Account Required",
            description: errorData.message || "Please sign up first to create an account.",
            variant: "destructive",
          });
          
          // Automatically switch to signup tab if user doesn't exist
          setTimeout(() => {
            setActiveTab("register");
            setRegisterData(prev => ({ ...prev, email: loginData.email }));
          }, 2000);
          
        } else if (errorData.wrongPassword) {
          toast({
            title: "Incorrect Password",
            description: errorData.message || "The password you entered is incorrect.",
            variant: "destructive",
          });
          
        } else {
          toast({
            title: "Login Failed",
            description: errorData.message || "Invalid credentials. Please try again.",
            variant: "destructive",
          });
        }
      } catch {
        // Fallback for unparseable errors
        toast({
          title: "Login Failed",
          description: error instanceof Error ? error.message : "Invalid credentials. Please try again.",
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
        description: "Welcome to ReturnIt! You're now ready to start using our service.",
      });
      setActiveTab("login");
      setLoginData({ email: registerData.email, password: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : "Registration failed. Please try again.";
      
      // Parse field-specific errors if available
      if (errorMessage.includes('validation')) {
        try {
          const validationError = JSON.parse(errorMessage);
          setValidationErrors(validationError.fieldErrors || {});
        } catch {
          toast({
            title: "Registration Failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Registration Failed",
          description: errorMessage,
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
      className={`w-full h-12 ${color} border-amber-200 hover:border-amber-300 text-amber-800 hover:text-amber-900`}
      onClick={onClick}
      data-testid={`button-${provider.toLowerCase()}-auth`}
    >
      <Icon className="h-5 w-5 mr-3" />
      Continue with {provider}
    </Button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Hero Image */}
      <div 
        className="absolute inset-0 z-0 bg-img-enhanced transition-all duration-500"
        style={{
          backgroundImage: `url(${selectedImage})`,
          backgroundSize: 'cover',
          backgroundPosition: activeTab === 'register' ? 'right center' : 'center center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(1.1) contrast(1.1)'
        }}
      />
      <div className={`absolute inset-0 transition-all duration-500 ${
        activeTab === 'register' 
          ? 'bg-gradient-to-r from-black/50 via-black/30 to-transparent' 
          : 'bg-gradient-to-br from-black/35 via-black/20 to-black/35'
      }`}></div>
      <div className="w-full max-w-md relative z-10 transition-all duration-500">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="mb-4 cursor-pointer hover:opacity-90 transition-all duration-300 hover:scale-105 inline-block">
              <div className="text-4xl font-bold text-white">ReturnIt</div>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome to Return It</h1>
          <p className="text-white/90">Returns made easy</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white/90 rounded-t-lg border border-b-0 border-amber-200 shadow-lg">
          <button
            className={`flex-1 py-3 px-4 text-sm font-medium text-center rounded-tl-lg transition-colors ${
              activeTab === 'login' 
                ? 'bg-amber-800 text-white' 
                : 'bg-white text-amber-800 hover:bg-amber-50'
            }`}
            onClick={() => setActiveTab('login')}
            data-testid="tab-sign-in"
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-3 px-4 text-sm font-medium text-center rounded-tr-lg transition-colors ${
              activeTab === 'register' 
                ? 'bg-amber-800 text-white' 
                : 'bg-white text-amber-800 hover:bg-amber-50'
            }`}
            onClick={() => setActiveTab('register')}
            data-testid="tab-sign-up"
          >
            Sign Up
          </button>
        </div>

        {/* Forms */}
        <Card className="bg-white border-amber-200 shadow-lg rounded-t-none border-t-0">
          <CardHeader className="text-center">
            <CardTitle className="text-amber-900">
              {activeTab === 'login' ? 'Sign In' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-amber-700">
              {activeTab === 'login' ? 'Access your Return It account' : 'Join Return It today'}
            </CardDescription>
          </CardHeader>
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-amber-800 font-medium">Email Address</Label>
                  <div className="relative">
                    <div className="bg-gradient-to-r from-amber-50 to-stone-50 p-4 rounded-lg border border-amber-200">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-amber-600" />
                        <Input
                          id="login-email"
                          data-testid="input-login-email"
                          type="email"
                          value={loginData.email}
                          onChange={(e) => setLoginData(prev => ({...prev, email: e.target.value}))}
                          placeholder="Enter your email address"
                          className="border-0 bg-transparent focus:ring-0 focus:ring-offset-0 text-amber-900 placeholder:text-amber-500"
                        />
                      </div>
                    </div>
                    {validationErrors.email && (
                      <p className="text-red-600 text-xs mt-1">{validationErrors.email}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-amber-800 font-medium">Password</Label>
                  <div className="relative">
                    <div className="bg-gradient-to-r from-amber-50 to-stone-50 p-4 rounded-lg border border-amber-200">
                      <div className="flex items-center space-x-3">
                        <Lock className="h-5 w-5 text-amber-600" />
                        <Input
                          id="login-password"
                          data-testid="input-login-password"
                          type="password"
                          value={loginData.password}
                          onChange={(e) => setLoginData(prev => ({...prev, password: e.target.value}))}
                          placeholder="Enter your password"
                          className="border-0 bg-transparent focus:ring-0 focus:ring-offset-0 text-amber-900 placeholder:text-amber-500"
                        />
                      </div>
                    </div>
                    {validationErrors.password && (
                      <p className="text-red-600 text-xs mt-1">{validationErrors.password}</p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full bg-amber-800 hover:bg-amber-900 h-12"
                  disabled={loginMutation.isPending}
                  data-testid="button-login-submit"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
                
                <div className="flex items-center my-8">
                  <div className="flex-1 h-px bg-amber-200"></div>
                  <span className="px-4 text-sm font-medium text-amber-700 bg-white">
                    Or continue with
                  </span>
                  <div className="flex-1 h-px bg-amber-200"></div>
                </div>
                
                <div className="space-y-2">
                  <SocialButton 
                    provider="Google" 
                    icon={SiGoogle} 
                    onClick={handleGoogleAuth}
                    color="bg-red-50"
                  />
                  <SocialButton 
                    provider="Apple" 
                    icon={SiApple} 
                    onClick={handleAppleAuth}
                    color="bg-gray-50"
                  />
                  <SocialButton 
                    provider="Facebook" 
                    icon={SiFacebook} 
                    onClick={handleFacebookAuth}
                    color="bg-blue-50"
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
                    <Label htmlFor="register-firstName" className="text-amber-800 font-medium">First Name</Label>
                    <div className="bg-gradient-to-r from-amber-50 to-stone-50 p-4 rounded-lg border border-amber-200">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-amber-600" />
                        <Input
                          id="register-firstName"
                          data-testid="input-register-firstName"
                          type="text"
                          value={registerData.firstName}
                          onChange={(e) => setRegisterData(prev => ({...prev, firstName: e.target.value}))}
                          placeholder="First name"
                          className="border-0 bg-transparent focus:ring-0 focus:ring-offset-0 text-amber-900 placeholder:text-amber-500"
                        />
                      </div>
                    </div>
                    {validationErrors.firstName && (
                      <p className="text-red-600 text-xs mt-1">{validationErrors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-lastName" className="text-amber-800 font-medium">Last Name</Label>
                    <div className="bg-gradient-to-r from-amber-50 to-stone-50 p-4 rounded-lg border border-amber-200">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-amber-600" />
                        <Input
                          id="register-lastName"
                          data-testid="input-register-lastName"
                          type="text"
                          value={registerData.lastName}
                          onChange={(e) => setRegisterData(prev => ({...prev, lastName: e.target.value}))}
                          placeholder="Last name"
                          className="border-0 bg-transparent focus:ring-0 focus:ring-offset-0 text-amber-900 placeholder:text-amber-500"
                        />
                      </div>
                    </div>
                    {validationErrors.lastName && (
                      <p className="text-red-600 text-xs mt-1">{validationErrors.lastName}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-amber-800 font-medium">Email Address</Label>
                  <div className="bg-gradient-to-r from-amber-50 to-stone-50 p-4 rounded-lg border border-amber-200">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-amber-600" />
                      <Input
                        id="register-email"
                        data-testid="input-register-email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData(prev => ({...prev, email: e.target.value}))}
                        placeholder="Enter your email address"
                        className="border-0 bg-transparent focus:ring-0 focus:ring-offset-0 text-amber-900 placeholder:text-amber-500"
                      />
                    </div>
                  </div>
                  {validationErrors.email && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-amber-800 font-medium">Password</Label>
                  <div className="bg-gradient-to-r from-amber-50 to-stone-50 p-4 rounded-lg border border-amber-200">
                    <div className="flex items-center space-x-3">
                      <Lock className="h-5 w-5 text-amber-600" />
                      <Input
                        id="register-password"
                        data-testid="input-register-password"
                        type={showPassword ? "text" : "password"}
                        value={registerData.password}
                        onChange={(e) => setRegisterData(prev => ({...prev, password: e.target.value}))}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        placeholder="Create a password"
                        className="border-0 bg-transparent focus:ring-0 focus:ring-offset-0 text-amber-900 placeholder:text-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-amber-600 hover:text-amber-800"
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
                  <Label htmlFor="register-confirmPassword" className="text-amber-800 font-medium">Confirm Password</Label>
                  <div className="bg-gradient-to-r from-amber-50 to-stone-50 p-4 rounded-lg border border-amber-200">
                    <div className="flex items-center space-x-3">
                      <Lock className="h-5 w-5 text-amber-600" />
                      <Input
                        id="register-confirmPassword"
                        data-testid="input-register-confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData(prev => ({...prev, confirmPassword: e.target.value}))}
                        placeholder="Confirm your password"
                        className="border-0 bg-transparent focus:ring-0 focus:ring-offset-0 text-amber-900 placeholder:text-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-amber-600 hover:text-amber-800"
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
                  className="w-full bg-amber-800 hover:bg-amber-900 h-12"
                  disabled={registerMutation.isPending}
                  data-testid="button-register-submit"
                >
                  <User className="h-4 w-4 mr-2" />
                  {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>
                
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