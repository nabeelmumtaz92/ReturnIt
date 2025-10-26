import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth-simple';
import { Link, useLocation } from 'wouter';
import {
  FileText,
  Download,
  AlertCircle,
  Loader2,
  Calendar,
  DollarSign,
  Receipt,
  Info,
  ArrowLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BrandLogo } from '@/components/BrandLogo';

export default function DriverTaxDocuments() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Fetch driver's 1099 forms
  const { data: forms, isLoading } = useQuery({
    queryKey: ['/api/driver/tax/1099/my-forms'],
    enabled: isAuthenticated && !!user?.isDriver,
  });

  const handleDownload = async (taxYear: number) => {
    try {
      const response = await fetch(`/api/tax/1099/download/${user!.id}/${taxYear}`);
      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }
      
      const data = await response.json();
      window.open(data.pdfUrl, '_blank');
      
      toast({
        title: 'Success',
        description: 'Opening your 1099 form',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to download 1099',
        variant: 'destructive',
      });
    }
  };

  if (!isAuthenticated || !user?.isDriver) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Driver Access Required</h2>
            <p className="text-gray-600 mb-4">
              You must be signed in as a driver to access tax documents.
            </p>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto p-4 flex items-center justify-between">
          <Link href="/driver-portal">
            <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <BrandLogo size="sm" />
          <div className="w-32" />
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-amber-600" />
            <h1 className="text-3xl font-bold text-gray-900">Tax Documents</h1>
          </div>
          <p className="text-gray-600">
            View and download your 1099-NEC forms for tax filing
          </p>
        </div>

        {/* Info Card */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">About Your 1099-NEC</h3>
                <p className="text-sm text-blue-700 mb-2">
                  Form 1099-NEC reports nonemployee compensation you earned during the calendar year. 
                  You'll need this form when filing your tax return.
                </p>
                <ul className="text-sm text-blue-700 space-y-1 ml-4">
                  <li>• Forms are available by January 31 each year</li>
                  <li>• You'll receive a 1099 if you earned $600 or more</li>
                  <li>• These forms are also filed with the IRS</li>
                  <li>• Keep copies for your records</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forms List */}
        <Card>
          <CardHeader>
            <CardTitle>Available Tax Forms</CardTitle>
            <CardDescription>
              Download your 1099-NEC forms for previous tax years
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 text-amber-600 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading tax documents...</p>
              </div>
            ) : !forms || forms.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No tax forms available yet. Forms are generated annually for drivers who earned
                  $600 or more. They are typically available by January 31.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {forms.map((form: any) => (
                  <div
                    key={form.taxYear}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    data-testid={`form-${form.taxYear}`}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="bg-amber-100 p-3 rounded-lg">
                        <Receipt className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          Tax Year {form.taxYear}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Form 1099-NEC</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>${form.totalEarnings.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Receipt className="h-4 w-4" />
                            <span>{form.payoutCount} payouts</span>
                          </div>
                        </div>
                        {form.available && (
                          <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                            Available
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDownload(form.taxYear)}
                      className="gap-2"
                      data-testid={`button-download-${form.taxYear}`}
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">When will I receive my 1099?</h4>
                <p>
                  Forms are generated in January and made available by January 31 for the previous
                  tax year. You'll receive an email notification when your form is ready.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">What if I earned less than $600?</h4>
                <p>
                  The IRS only requires 1099-NEC forms for contractors earning $600 or more. If you
                  earned less, you won't receive a 1099, but you're still responsible for reporting
                  all income on your tax return.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Questions about your form?</h4>
                <p>
                  Contact our support team at{' '}
                  <a href="mailto:support@returnit.online" className="text-amber-600 hover:underline">
                    support@returnit.online
                  </a>{' '}
                  or consult with a tax professional.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
