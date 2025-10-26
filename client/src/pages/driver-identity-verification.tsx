import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth-simple';
import { apiRequest } from '@/lib/queryClient';
import {
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  RefreshCw,
  IdCard,
  Camera
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

export default function DriverIdentityVerification() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);

  // Fetch current verification status
  const { data: statusData, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['/api/driver/identity/status'],
    enabled: isAuthenticated && !!user?.isDriver,
    refetchInterval: (data) => {
      // Poll every 5 seconds if processing
      if (data?.status === 'processing' || data?.status === 'requires_input') {
        return 5000;
      }
      return false; // Stop polling otherwise
    },
  });

  // Create verification session mutation
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/driver/identity/create-session');
    },
    onSuccess: (data: any) => {
      setVerificationUrl(data.url);
      setIsCreatingSession(false);
      toast({
        title: 'Verification Session Created',
        description: 'Please complete the identity verification process.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/driver/identity/status'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create verification session',
        variant: 'destructive',
      });
      setIsCreatingSession(false);
    },
  });

  const handleStartVerification = async () => {
    setIsCreatingSession(true);
    createSessionMutation.mutate();
  };

  const handleRefresh = () => {
    refetchStatus();
  };

  if (!isAuthenticated || !user?.isDriver) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Driver Access Required</h2>
            <p className="text-gray-600 mb-4">
              You must be signed in as a driver to access this page.
            </p>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusData?.status || 'not_started';
  const isVerified = status === 'verified';
  const isProcessing = status === 'processing';
  const requiresInput = status === 'requires_input';

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto p-4 flex items-center justify-between">
          <Link href="/driver-portal">
            <Button variant="ghost" size="sm" className="gap-2">
              ← Back to Dashboard
            </Button>
          </Link>
          <BrandLogo size="sm" />
          <div className="w-32" />
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-4xl">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-16 w-16 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Identity Verification
          </h1>
          <p className="text-gray-600">
            Complete your identity verification to start accepting orders
          </p>
        </div>

        {statusLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 text-amber-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading verification status...</p>
            </CardContent>
          </Card>
        ) : isVerified ? (
          // Verified State
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-900 mb-2">
                Identity Verified!
              </h2>
              <p className="text-green-700 mb-6">
                Your identity has been successfully verified on{' '}
                {statusData.verifiedAt
                  ? new Date(statusData.verifiedAt).toLocaleDateString()
                  : 'recently'}
                . You can now start accepting orders.
              </p>
              <Link href="/driver-portal">
                <Button size="lg">
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Instructions Card */}
            <Card>
              <CardHeader>
                <CardTitle>What You'll Need</CardTitle>
                <CardDescription>
                  Have these ready before starting the verification process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-start gap-3">
                    <IdCard className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Valid Government ID</h3>
                      <p className="text-sm text-gray-600">
                        Driver's license, passport, or state ID card
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Camera className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Device with Camera</h3>
                      <p className="text-sm text-gray-600">
                        You'll need to take photos of your ID and a selfie
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">5-10 Minutes</h3>
                      <p className="text-sm text-gray-600">
                        The entire process typically takes just a few minutes
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Card */}
            {status !== 'not_started' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Verification Status</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={statusLoading}
                      data-testid="button-refresh-status"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isProcessing && (
                    <Alert>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <AlertDescription>
                        Your verification is being processed. This usually takes a few minutes.
                      </AlertDescription>
                    </Alert>
                  )}
                  {requiresInput && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Additional information is required. Please complete the verification
                        process.
                      </AlertDescription>
                    </Alert>
                  )}
                  {status === 'canceled' && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your verification was canceled. Please start a new verification.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Card */}
            <Card>
              <CardContent className="p-8 text-center">
                {!verificationUrl ? (
                  <>
                    <h3 className="text-xl font-semibold mb-4">
                      Ready to Verify Your Identity?
                    </h3>
                    <p className="text-gray-600 mb-6">
                      This is a secure process powered by Stripe Identity. Your personal
                      information is encrypted and protected.
                    </p>
                    <Button
                      size="lg"
                      onClick={handleStartVerification}
                      disabled={isCreatingSession || createSessionMutation.isPending}
                      className="gap-2"
                      data-testid="button-start-verification"
                    >
                      {isCreatingSession ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Shield className="h-5 w-5" />
                          Start Verification
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold mb-4">
                      Complete Your Verification
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Click the button below to open the verification window in a new tab.
                    </p>
                    <Button
                      size="lg"
                      onClick={() => window.open(verificationUrl, '_blank')}
                      className="gap-2"
                      data-testid="button-open-verification"
                    >
                      <Shield className="h-5 w-5" />
                      Open Verification
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">
                      Your Security is Our Priority
                    </h3>
                    <p className="text-sm text-blue-700">
                      We use Stripe Identity, a trusted and secure identity verification
                      service. Your personal information is encrypted and never shared with
                      unauthorized parties. This verification helps us maintain a safe
                      platform for all users.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
