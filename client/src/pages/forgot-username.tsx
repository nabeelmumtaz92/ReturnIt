import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BrandLogo } from "@/components/BrandLogo";

export default function ForgotUsernamePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const forgotUsernameMutation = useMutation({
    mutationFn: async (email: string) => {
      return await apiRequest("POST", "/api/auth/forgot-username", { email });
    },
    onSuccess: () => {
      setEmailSent(true);
      toast({
        title: "Email Sent!",
        description: "Check your email for your username reminder.",
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to send username reminder";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    forgotUsernameMutation.mutate(email);
  };

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#231b0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/login')}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-back-to-login"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <BrandLogo size="lg" linkToHome={true} />
          </div>
          <p className="text-muted-foreground text-sm">Professional return service</p>
        </div>

        <Card className="bg-card border-border shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_30px_-15px_rgba(249,152,6,0.2)]">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Forgot Username?</CardTitle>
            <CardDescription>
              {emailSent 
                ? "Check your email for your username" 
                : "Enter your email to receive a username reminder"}
            </CardDescription>
          </CardHeader>

          {!emailSent ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      data-testid="input-forgot-username-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="pl-10 h-11"
                      required
                      autoFocus
                    />
                    <Mail className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We'll send your username to this email address if it's associated with an account.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-[#B8956A] hover:bg-[#A0805A] text-white"
                  disabled={forgotUsernameMutation.isPending}
                  data-testid="button-send-username-reminder"
                >
                  {forgotUsernameMutation.isPending ? "Sending..." : "Send Username Reminder"}
                </Button>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-6 text-center py-8">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Email Sent!</h3>
                <p className="text-sm text-muted-foreground">
                  If an account exists with <strong>{email}</strong>, you will receive a username reminder shortly.
                </p>
                <p className="text-xs text-muted-foreground mt-4">
                  Don't see the email? Check your spam folder or try again.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                  className="w-full"
                  data-testid="button-try-another-email"
                >
                  Try Another Email
                </Button>
                <Button
                  variant="default"
                  onClick={() => setLocation('/login')}
                  className="w-full bg-[#B8956A] hover:bg-[#A0805A] text-white"
                  data-testid="button-back-to-login-success"
                >
                  Back to Login
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
