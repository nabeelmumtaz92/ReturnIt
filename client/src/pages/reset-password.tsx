import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import BrandLogo from "@/components/BrandLogo";

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Extract token from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      toast({
        title: "Invalid Link",
        description: "No reset token found. Please request a new password reset link.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { token: string; newPassword: string }) => {
      return await apiRequest("POST", "/api/auth/reset-password", data);
    },
    onSuccess: () => {
      setPasswordReset(true);
      toast({
        title: "Password Reset!",
        description: "Your password has been successfully reset.",
      });
    },
    onError: (error) => {
      let errorMessage = "Failed to reset password";
      try {
        const errorData = error instanceof Error ? error.message : "";
        const jsonMatch = errorData.match(/\d+:\s*({.*})/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[1]);
          errorMessage = parsed.message || errorMessage;
        }
      } catch (e) {
        console.error('Failed to parse error:', e);
      }
      
      setValidationError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Validation
    if (!newPassword || newPassword.length < 8) {
      setValidationError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    if (!token) {
      setValidationError("Invalid reset token. Please request a new password reset link.");
      return;
    }

    resetPasswordMutation.mutate({ token, newPassword });
  };

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#231b0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <BrandLogo size="lg" linkToHome={true} />
          </div>
          <p className="text-muted-foreground text-sm">Professional return service</p>
        </div>

        <Card className="bg-card border-border shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_30px_-15px_rgba(249,152,6,0.2)]">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Reset Password</CardTitle>
            <CardDescription>
              {passwordReset 
                ? "Your password has been successfully reset" 
                : "Enter your new password below"}
            </CardDescription>
          </CardHeader>

          {!passwordReset ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {validationError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{validationError}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-sm font-medium">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      data-testid="input-new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="pl-10 pr-10 h-11"
                      required
                      autoFocus
                    />
                    <Lock className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      data-testid="toggle-show-password"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      data-testid="input-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="pl-10 pr-10 h-11"
                      required
                    />
                    <Lock className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      data-testid="toggle-show-confirm-password"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-[#B8956A] hover:bg-[#A0805A] text-white"
                  disabled={resetPasswordMutation.isPending}
                  data-testid="button-reset-password"
                >
                  {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                </Button>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-6 text-center py-8">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Password Reset Complete!</h3>
                <p className="text-sm text-muted-foreground">
                  Your password has been successfully changed. You can now log in with your new password.
                </p>
              </div>
              <Button
                variant="default"
                onClick={() => setLocation('/login')}
                className="w-full bg-[#B8956A] hover:bg-[#A0805A] text-white"
                data-testid="button-go-to-login"
              >
                Go to Login
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
