import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth-simple";
import { Mail, ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { login } = useAuth();
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");

  // Get email from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    } else {
      // If no email, redirect to login
      setLocation('/login');
    }
  }, [setLocation]);

  // Verify email mutation
  const verifyEmailMutation = useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      return await apiRequest("POST", "/api/auth/verify-email", { email, code });
    },
    onSuccess: async (data) => {
      const user = data.user;
      login(user);
      
      toast({
        title: "Email Verified!",
        description: "Your account is now active. Welcome to Return It!",
      });
      
      // Redirect based on user role
      if (user.isAdmin) {
        setLocation('/admin-dashboard');
      } else if (user.isDriver) {
        setLocation('/driver-portal');
      } else {
        setLocation('/');
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      const errorMessage = error instanceof Error ? error.message : "Verification failed";
      toast({
        title: "Verification Failed",
        description: errorMessage.includes('Invalid') 
          ? "Invalid verification code. Please try again." 
          : "Verification failed. Please try again.",
        variant: "destructive"
      });
    },
  });

  // Resend verification code mutation
  const resendCodeMutation = useMutation({
    mutationFn: async (email: string) => {
      return await apiRequest("POST", "/api/auth/resend-verification", { email });
    },
    onSuccess: () => {
      toast({
        title: "Code Sent!",
        description: "A new verification code has been sent to your email.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Resend",
        description: "Please try again later.",
        variant: "destructive"
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !verificationCode) {
      toast({
        title: "Missing Information",
        description: "Please enter your verification code.",
        variant: "destructive"
      });
      return;
    }
    verifyEmailMutation.mutate({ email, code: verificationCode });
  };

  const handleResendCode = () => {
    if (!email) return;
    resendCodeMutation.mutate(email);
  };

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#231b0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <BrandLogo size="lg" linkToHome={true} />
        </div>
        
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => setLocation('/login')}
            className="text-sm"
            data-testid="button-back-to-login"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
        </div>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Verify Your Email</h1>
          <p className="text-muted-foreground">
            We've sent a 6-digit code to <strong>{email}</strong>
          </p>
        </div>

        {/* Verification Form */}
        <Card className="bg-card border-border shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_30px_-15px_rgba(249,152,6,0.2)]">
          <CardHeader className="text-center pb-2 md:pb-6">
            <CardTitle className="text-lg md:text-xl">
              Enter Verification Code
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              The code will expire in 1 hour
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="verification-code" className="text-foreground font-medium">
                  Verification Code
                </Label>
                <div className="bg-accent p-4 rounded-lg border border-border">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <Input
                      id="verification-code"
                      data-testid="input-verification-code"
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="000000"
                      maxLength={6}
                      className="border-0 bg-transparent focus:ring-0 focus:ring-offset-0 text-foreground placeholder:text-muted-foreground text-center text-2xl font-mono tracking-widest"
                      autoComplete="off"
                      autoFocus
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full h-12 bg-[#B8956A] hover:bg-[#A0805A] text-white"
                disabled={verifyEmailMutation.isPending || !verificationCode}
                data-testid="button-verify-email"
              >
                {verifyEmailMutation.isPending ? "Verifying..." : "Verify Email"}
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCodeMutation.isPending}
                  className="text-primary hover:underline font-medium"
                  data-testid="button-resend-code"
                >
                  {resendCodeMutation.isPending ? "Sending..." : "Resend Code"}
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
