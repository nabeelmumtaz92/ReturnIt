import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { BackButton } from '@/components/BackButton';
import { Bell, Mail, Smartphone, CheckCircle, Info, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NotificationPreferences {
  enableInApp: boolean;
  enablePush: boolean;
  enableEmail: boolean;
  unsubscribedAt?: string | null;
  unsubscribeReason?: string | null;
}

export default function NotificationSettings() {
  const { toast } = useToast();

  // Fetch current preferences
  const { data: preferences, isLoading } = useQuery<NotificationPreferences>({
    queryKey: ['/api/notifications/preferences'],
  });

  // Update preferences mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      return await apiRequest('/api/notifications/preferences', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/preferences'] });
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update",
        description: error.message || "Could not save your preferences.",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (field: 'enablePush' | 'enableEmail', value: boolean) => {
    updateMutation.mutate({ [field]: value });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FAF8F4] to-white dark:from-[#231b0f] dark:to-[#1a1410] p-4">
        <div className="max-w-2xl mx-auto py-8">
          <BackButton />
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF8F4] to-white dark:from-[#231b0f] dark:to-[#1a1410] p-4">
      <div className="max-w-2xl mx-auto py-8">
        <BackButton />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#231b0f] dark:text-[#FAF8F4] mb-2">
            Notification Settings
          </h1>
          <p className="text-muted-foreground">
            Choose how you want to receive updates about your returns and exclusive offers
          </p>
        </div>

        <Card className="border-[#B8956A]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notification Channels
            </CardTitle>
            <CardDescription>
              Control how Return It sends you notifications
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* In-App Notifications */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-start gap-3 flex-1">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label className="text-base font-medium">In-App Notifications</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Alerts within the Return It app (always enabled)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Always On</span>
              </div>
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-3 flex-1">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <Label htmlFor="push-toggle" className="text-base font-medium cursor-pointer">
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get instant updates on your phone or browser
                  </p>
                </div>
              </div>
              <Switch
                id="push-toggle"
                checked={preferences?.enablePush || false}
                onCheckedChange={(value) => handleToggle('enablePush', value)}
                disabled={updateMutation.isPending}
                data-testid="switch-push-notifications"
              />
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-3 flex-1">
                <div className="bg-purple-500/10 p-2 rounded-lg">
                  <Mail className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <Label htmlFor="email-toggle" className="text-base font-medium cursor-pointer">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receive exclusive offers and updates via email
                  </p>
                  {preferences?.unsubscribedAt && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
                      Previously unsubscribed on {new Date(preferences.unsubscribedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <Switch
                id="email-toggle"
                checked={preferences?.enableEmail || false}
                onCheckedChange={(value) => handleToggle('enableEmail', value)}
                disabled={updateMutation.isPending}
                data-testid="switch-email-notifications"
              />
            </div>

            {/* Info Alert */}
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Email Quota Notice:</strong> We automatically limit promotional emails to prevent spam. 
                You'll always receive important order updates regardless of these settings.
              </AlertDescription>
            </Alert>

            {/* What You'll Receive */}
            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold text-sm text-foreground mb-3">What you'll receive:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Order status updates (pickup, delivery, completion)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Post-return exclusive brand offers and coupons</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Driver location and ETA notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Payment confirmations and receipts</span>
                </li>
              </ul>
            </div>

            {/* Privacy Notice */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Your notification preferences are stored securely. Email unsubscribe links are included 
                in all promotional emails for CAN-SPAM compliance. You can change these settings anytime.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Status Indicator */}
        {updateMutation.isPending && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Saving preferences...</span>
          </div>
        )}
      </div>
    </div>
  );
}
