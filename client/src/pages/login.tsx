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
    username: '',
    password: ''
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
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
    mutationFn: async (data: { username: string; email: string; password: string }) => {
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
    if (!loginData.username || !loginData.password) {
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
    if (!registerData.username || !registerData.email || !registerData.password) {
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
      username: registerData.username,
      email: registerData.email,
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
      className={`w-full flex items-center justify-center gap-3 h-12 border-2 hover:${color} transition-colors`}
      onClick={onClick}
      data-testid={`button-${provider.toLowerCase()}-auth`}
    >
      <Icon className="h-5 w-5" />
      Continue with {provider}
    </Button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-200 via-yellow-100 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/logo-cardboard-deep.png" 
            alt="Returnly Logo" 
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-amber-900">Welcome to Returnly</h1>
          <p className="text-amber-700">Return delivery made effortless</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" data-testid="tab-login">Sign In</TabsTrigger>
            <TabsTrigger value="register" data-testid="tab-register">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <Input
                      id="login-username"
                      data-testid="input-login-username"
                      value={loginData.username}
                      onChange={(e) => setLoginData(prev => ({...prev, username: e.target.value}))}
                      placeholder="Enter your username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      data-testid="input-login-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({...prev, password: e.target.value}))}
                      placeholder="Enter your password"
                    />
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
                    {loginMutation.isPending ? "Signing in..." : "Sign In with Email"}
                  </Button>
                  
                  <div className="relative">
                    <Separator />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-white px-2 text-xs text-gray-500">OR CONTINUE WITH</span>
                    </div>
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
            <Card>
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                  Create your account to start using Returnly
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username</Label>
                    <Input
                      id="register-username"
                      data-testid="input-register-username"
                      value={registerData.username}
                      onChange={(e) => setRegisterData(prev => ({...prev, username: e.target.value}))}
                      placeholder="Choose a username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      data-testid="input-register-email"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData(prev => ({...prev, email: e.target.value}))}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      data-testid="input-register-password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({...prev, password: e.target.value}))}
                      placeholder="Create a password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm">Confirm Password</Label>
                    <Input
                      id="register-confirm"
                      data-testid="input-register-confirm"
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({...prev, confirmPassword: e.target.value}))}
                      placeholder="Confirm your password"
                    />
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
                    {registerMutation.isPending ? "Creating account..." : "Create Account with Email"}
                  </Button>
                  
                  <div className="relative">
                    <Separator />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-white px-2 text-xs text-gray-500">OR SIGN UP WITH</span>
                    </div>
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
        <div className="mt-6 p-4 bg-amber-100 rounded-lg border border-amber-200">
          <h3 className="font-semibold text-amber-800 mb-2">Demo Account</h3>
          <p className="text-sm text-amber-700 mb-2">
            Try the demo account: <strong>demo</strong> / <strong>demo123</strong>
          </p>
          <p className="text-xs text-amber-600">
            The demo account has sample orders for testing.
          </p>
        </div>
      </div>
    </div>
  );
}