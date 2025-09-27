import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  AlertTriangle, 
  Download, 
  Trash2, 
  Shield, 
  FileText,
  ExternalLink 
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth-simple';

// Account deletion validation schema
const accountDeletionSchema = z.object({
  confirmationText: z.string().refine(
    (val) => val === "DELETE MY ACCOUNT",
    "Please type 'DELETE MY ACCOUNT' exactly as shown"
  ),
  reason: z.string().optional(),
});

type AccountDeletionForm = z.infer<typeof accountDeletionSchema>;

export default function AccountSettings() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const form = useForm<AccountDeletionForm>({
    resolver: zodResolver(accountDeletionSchema),
    defaultValues: {
      confirmationText: '' as any,
      reason: '',
    },
  });

  // Data export mutation
  const exportData = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/account/export', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to export data');
      }
      
      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `returnit-data-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Data Export Complete",
        description: "Your data has been downloaded to your device.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export your data.",
        variant: "destructive",
      });
    },
  });

  // Account deletion mutation
  const deleteAccount = useMutation({
    mutationFn: async (data: AccountDeletionForm) => {
      const response = await apiRequest('POST', '/api/account/delete', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      // Redirect to home page
      setTimeout(() => setLocation('/'), 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete your account.",
        variant: "destructive",
      });
    },
  });

  const onSubmitDeletion = (data: AccountDeletionForm) => {
    deleteAccount.mutate(data);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <Card className="border-amber-200">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-amber-900 mb-4">Authentication Required</h2>
            <p className="text-amber-700 mb-6">Please log in to access account settings.</p>
            <Link href="/login">
              <Button className="bg-amber-700 hover:bg-amber-800">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="text-2xl font-bold text-amber-900">ReturnIt</div>
            </Link>
            <div className="text-sm text-amber-700">
              {user.firstName} {user.lastName} • {user.email}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-amber-900 mb-8">Account Settings</h1>

        <div className="grid gap-8">
          {/* Data & Privacy Section */}
          <Card className="border-amber-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-amber-50/50 border-b border-amber-200">
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <Shield className="h-5 w-5" />
                Data & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Data Export */}
              <div>
                <h3 className="text-lg font-semibold text-amber-900 mb-2">Export Your Data</h3>
                <p className="text-amber-700 mb-4">
                  Download a copy of all your personal data, orders, and account information.
                </p>
                <Button 
                  onClick={() => exportData.mutate()}
                  disabled={exportData.isPending}
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                  data-testid="button-export-data"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {exportData.isPending ? 'Preparing Export...' : 'Export My Data'}
                </Button>
              </div>

              <Separator className="bg-amber-200" />

              {/* Privacy Links */}
              <div>
                <h3 className="text-lg font-semibold text-amber-900 mb-2">Privacy Information</h3>
                <div className="space-y-2">
                  <Link href="/privacy-policy" className="flex items-center gap-2 text-amber-700 hover:text-amber-900">
                    <FileText className="h-4 w-4" />
                    Privacy Policy
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                  <Link href="/terms-of-service" className="flex items-center gap-2 text-amber-700 hover:text-amber-900">
                    <FileText className="h-4 w-4" />
                    Terms of Service
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Deletion Section */}
          <Card className="border-red-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-red-50/50 border-b border-red-200">
              <CardTitle className="flex items-center gap-2 text-red-900">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {!showDeleteConfirmation ? (
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Delete Account</h3>
                  <p className="text-red-700 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button 
                    onClick={() => setShowDeleteConfirmation(true)}
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700"
                    data-testid="button-show-delete-confirmation"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete My Account
                  </Button>
                </div>
              ) : (
                <form onSubmit={form.handleSubmit(onSubmitDeletion as any)} className="space-y-6">
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>This action is permanent and cannot be undone.</strong>
                      <br />
                      All your data including orders, payment history, and account information will be permanently deleted.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label htmlFor="confirmationText" className="text-red-800 font-medium">
                      Type "DELETE MY ACCOUNT" to confirm *
                    </Label>
                    <Input
                      id="confirmationText"
                      {...form.register('confirmationText')}
                      className="mt-1 border-red-300 focus:border-red-500"
                      placeholder="DELETE MY ACCOUNT"
                      data-testid="input-delete-confirmation"
                    />
                    {form.formState.errors.confirmationText && (
                      <p className="text-red-600 text-sm mt-1">{form.formState.errors.confirmationText.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="reason" className="text-red-800 font-medium">
                      Reason for deletion (optional)
                    </Label>
                    <Input
                      id="reason"
                      {...form.register('reason')}
                      className="mt-1 border-red-300 focus:border-red-500"
                      placeholder="Help us improve by telling us why you're leaving"
                      data-testid="input-delete-reason"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      onClick={() => setShowDeleteConfirmation(false)}
                      variant="outline"
                      className="border-gray-300"
                      data-testid="button-cancel-delete"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={deleteAccount.isPending}
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700"
                      data-testid="button-confirm-delete"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deleteAccount.isPending ? 'Deleting Account...' : 'Permanently Delete Account'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}