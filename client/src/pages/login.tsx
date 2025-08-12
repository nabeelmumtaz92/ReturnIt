import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Lock, User, Phone } from "lucide-react";
import { SiGoogle, SiApple, SiFacebook } from "react-icons/si";

// Import delivery images
import deliveryCarImg from "@assets/Delivery Driver- Box in Car_1754856749497.jpeg";
import deliveryHandoffImg from "@assets/Delivery Driver- Handoff_1754856749519.jpeg";
import deliveryOutsideImg from "@assets/Delivery Driver- outside_1754856749521.jpeg";
import deliveryReceivingImg from "@assets/Delivery Driver Receiving Box_1754856749524.jpeg";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("login");

  // Check URL params for tab selection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab === 'register') {
      setActiveTab('register');
    }
  }, []);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      return await apiRequest('/api/auth/login', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; phone: string; password: string }) => {
      return await apiRequest('/api/auth/register', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Welcome to Returnly!",
        description: "Your account has been created successfully.",
      });
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.email || !registerData.phone || !registerData.password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords are the same",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate({
      email: registerData.email,
      phone: registerData.phone,
      password: registerData.password
    });
  };

  // Social authentication handlers
  const handleGoogleAuth = () => {
    window.location.href = '/api/auth/google';
  };

  const handleAppleAuth = () => {
    window.location.href = '/api/auth/apple';
  };

  const handleFacebookAuth = () => {
    window.location.href = '/api/auth/facebook';
  };

  const SocialButton = ({ provider, icon: Icon, onClick, color }: {
    provider: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    color: string;
  }) => (
    <Button
      type="button"
      variant="outline"
      className={`w-full flex items-center justify-center gap-3 h-12 border-2 border-amber-200 hover:bg-amber-50 hover:border-amber-300 transition-all duration-200 bg-white text-amber-800 font-medium`}
      onClick={onClick}
      data-testid={`button-${provider.toLowerCase()}-auth`}
    >
      <Icon className="h-5 w-5" />
      Continue with {provider}
    </Button>
  );

  // Random delivery image selection for this page
  const loginPageImages = [deliveryCarImg, deliveryHandoffImg, deliveryOutsideImg, deliveryReceivingImg];
  const selectedImage = loginPageImages[Math.floor(Math.random() * loginPageImages.length)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-stone-50 to-amber-50 flex items-center justify-center p-4 relative">
      {/* Background Hero Image */}
      <div 
        className="absolute inset-0 z-0 opacity-15"
        style={{
          backgroundImage: `url(${selectedImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/logo-cardboard-deep.png" 
            alt="Returnly Logo" 
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-amber-900">Welcome to Returnly</h1>
          <p className="text-amber-700">Returns made easy</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white border border-amber-200 shadow-sm">
            <TabsTrigger 
              value="login" 
              data-testid="tab-login"
              className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 data-[state=inactive]:text-amber-700 font-medium"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger 
              value="register" 
              data-testid="tab-register"
              className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 data-[state=inactive]:text-amber-700 font-medium"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="bg-white border-amber-200 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-amber-900">Sign In to Your Account</CardTitle>
                <CardDescription className="text-amber-700">
                  Welcome back! Enter your credentials to continue
                </CardDescription>
              </CardHeader>
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
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card className="bg-white border-amber-200 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-amber-900">Create Your Account</CardTitle>
                <CardDescription className="text-amber-700">
                  Join Returnly to start making returns easy
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-amber-800 font-medium">Email Address</Label>
                    <div className="relative">
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
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-phone" className="text-amber-800 font-medium">Phone Number</Label>
                    <div className="relative">
                      <div className="bg-gradient-to-r from-amber-50 to-stone-50 p-4 rounded-lg border border-amber-200">
                        <div className="flex items-center space-x-3">
                          <Phone className="h-5 w-5 text-amber-600" />
                          <Input
                            id="register-phone"
                            data-testid="input-register-phone"
                            type="tel"
                            value={registerData.phone}
                            onChange={(e) => setRegisterData(prev => ({...prev, phone: e.target.value}))}
                            placeholder="Enter your phone number"
                            className="border-0 bg-transparent focus:ring-0 focus:ring-offset-0 text-amber-900 placeholder:text-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-amber-800 font-medium">Password</Label>
                    <div className="relative">
                      <div className="bg-gradient-to-r from-amber-50 to-stone-50 p-4 rounded-lg border border-amber-200">
                        <div className="flex items-center space-x-3">
                          <Lock className="h-5 w-5 text-amber-600" />
                          <Input
                            id="register-password"
                            data-testid="input-register-password"
                            type="password"
                            value={registerData.password}
                            onChange={(e) => setRegisterData(prev => ({...prev, password: e.target.value}))}
                            placeholder="Create a strong password"
                            className="border-0 bg-transparent focus:ring-0 focus:ring-offset-0 text-amber-900 placeholder:text-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm" className="text-amber-800 font-medium">Confirm Password</Label>
                    <div className="relative">
                      <div className="bg-gradient-to-r from-amber-50 to-stone-50 p-4 rounded-lg border border-amber-200">
                        <div className="flex items-center space-x-3">
                          <Lock className="h-5 w-5 text-amber-600" />
                          <Input
                            id="register-confirm"
                            data-testid="input-register-confirm"
                            type="password"
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData(prev => ({...prev, confirmPassword: e.target.value}))}
                            placeholder="Confirm your password"
                            className="border-0 bg-transparent focus:ring-0 focus:ring-offset-0 text-amber-900 placeholder:text-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-amber-800 hover:bg-amber-900 h-12"
                    disabled={registerMutation.isPending}
                    data-testid="button-register-submit"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {registerMutation.isPending ? "Creating account..." : "Create Account"}
                  </Button>
                  
                  <div className="flex items-center my-8">
                    <div className="flex-1 h-px bg-amber-200"></div>
                    <span className="px-4 text-sm font-medium text-amber-700 bg-white">
                      Or sign up with
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
                    data-testid="button-back-home-register"
                  >
                    Back to Home
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Demo account info */}
        <div className="mt-6 p-6 bg-gradient-to-r from-amber-50 to-stone-50 rounded-lg border border-amber-200 shadow-sm">
          <h3 className="font-semibold text-amber-800 mb-3 text-center">Demo Account Available</h3>
          <div className="bg-white p-4 rounded-lg border border-amber-100 text-center">
            <p className="text-sm text-amber-700 mb-2">
              Email: <span className="font-bold text-amber-900">demo@returnly.com</span>
            </p>
            <p className="text-sm text-amber-700 mb-3">
              Password: <span className="font-bold text-amber-900">demo123</span>
            </p>
            <p className="text-xs text-amber-600">
              Includes sample orders and full platform access for testing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}