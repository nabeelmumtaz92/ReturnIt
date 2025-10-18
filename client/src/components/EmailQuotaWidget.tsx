import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Mail, PauseCircle, PlayCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface QuotaStatus {
  canSendEmail: boolean;
  emailsSentToday: number;
  emailsSentMonth: number;
  quotaDaily: number;
  quotaMonthly: number;
  remainingToday: number;
  remainingMonth: number;
  isPaused: boolean;
  pauseReason?: string;
}

export function EmailQuotaWidget() {
  const { toast } = useToast();
  const [pauseReason, setPauseReason] = useState("");
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);

  // Fetch quota status
  const { data: quotaStatus, isLoading, error } = useQuery<QuotaStatus>({
    queryKey: ['/api/admin/email-quota/status'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Pause mutation
  const pauseMutation = useMutation({
    mutationFn: async (reason: string) => {
      return await apiRequest('/api/admin/email-quota/pause', {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-quota/status'] });
      toast({
        title: "Email sending paused",
        description: "Email notifications have been paused successfully.",
      });
      setPauseDialogOpen(false);
      setPauseReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to pause",
        description: error.message || "Could not pause email sending.",
        variant: "destructive",
      });
    },
  });

  // Unpause mutation
  const unpauseMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/admin/email-quota/unpause', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-quota/status'] });
      toast({
        title: "Email sending resumed",
        description: "Email notifications have been resumed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to unpause",
        description: error.message || "Could not unpause email sending.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Quota Monitor
          </CardTitle>
          <CardDescription>Loading quota status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !quotaStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Quota Monitor
          </CardTitle>
          <CardDescription>Error loading quota status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>Failed to load quota data</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const dailyUsagePercent = (quotaStatus.emailsSentToday / quotaStatus.quotaDaily) * 100;
  const monthlyUsagePercent = (quotaStatus.emailsSentMonth / quotaStatus.quotaMonthly) * 100;
  
  // Determine status color
  const getStatusColor = (percent: number) => {
    if (percent >= 95) return "text-destructive";
    if (percent >= 80) return "text-yellow-600";
    return "text-green-600";
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 95) return "bg-destructive";
    if (percent >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Quota Monitor
            </CardTitle>
            <CardDescription>
              Auto-cutoff system (stops at 95% to prevent costs)
            </CardDescription>
          </div>
          
          {quotaStatus.isPaused ? (
            <Badge variant="destructive" className="flex items-center gap-1">
              <PauseCircle className="h-3 w-3" />
              Paused
            </Badge>
          ) : quotaStatus.canSendEmail ? (
            <Badge variant="default" className="bg-green-500 flex items-center gap-1">
              <PlayCircle className="h-3 w-3" />
              Active
            </Badge>
          ) : (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Quota Reached
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Daily Quota */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Daily Quota</span>
            <span className={getStatusColor(dailyUsagePercent)}>
              {quotaStatus.emailsSentToday} / {quotaStatus.quotaDaily} ({dailyUsagePercent.toFixed(1)}%)
            </span>
          </div>
          <Progress 
            value={dailyUsagePercent} 
            className="h-2"
            style={{
              // @ts-ignore - Custom color override
              '--progress-foreground': getProgressColor(dailyUsagePercent),
            }}
          />
          <p className="text-xs text-muted-foreground">
            {quotaStatus.remainingToday} emails remaining today
          </p>
        </div>

        {/* Monthly Quota */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Monthly Quota</span>
            <span className={getStatusColor(monthlyUsagePercent)}>
              {quotaStatus.emailsSentMonth} / {quotaStatus.quotaMonthly} ({monthlyUsagePercent.toFixed(1)}%)
            </span>
          </div>
          <Progress 
            value={monthlyUsagePercent} 
            className="h-2"
            style={{
              // @ts-ignore - Custom color override
              '--progress-foreground': getProgressColor(monthlyUsagePercent),
            }}
          />
          <p className="text-xs text-muted-foreground">
            {quotaStatus.remainingMonth} emails remaining this month
          </p>
        </div>

        {/* Pause reason if applicable */}
        {quotaStatus.isPaused && quotaStatus.pauseReason && (
          <div className="rounded-lg bg-destructive/10 p-3">
            <p className="text-sm text-destructive font-medium">Pause Reason:</p>
            <p className="text-sm text-muted-foreground mt-1">{quotaStatus.pauseReason}</p>
          </div>
        )}

        {/* Warning when approaching limit */}
        {!quotaStatus.isPaused && (dailyUsagePercent >= 80 || monthlyUsagePercent >= 80) && (
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-600 font-medium">
                Approaching quota limit - emails will auto-pause at 95%
              </p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2 pt-2">
          {quotaStatus.isPaused ? (
            <Button
              size="sm"
              variant="default"
              onClick={() => unpauseMutation.mutate()}
              disabled={unpauseMutation.isPending}
              className="flex-1"
              data-testid="button-unpause-emails"
            >
              {unpauseMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <PlayCircle className="h-4 w-4 mr-2" />
              )}
              Resume Sending
            </Button>
          ) : (
            <Dialog open={pauseDialogOpen} onOpenChange={setPauseDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  data-testid="button-pause-emails"
                >
                  <PauseCircle className="h-4 w-4 mr-2" />
                  Pause Sending
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Pause Email Sending</DialogTitle>
                  <DialogDescription>
                    This will temporarily stop all email notifications. In-app and push notifications will continue working.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Textarea
                    placeholder="Reason for pausing (optional)"
                    value={pauseReason}
                    onChange={(e) => setPauseReason(e.target.value)}
                    data-testid="input-pause-reason"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPauseDialogOpen(false);
                        setPauseReason("");
                      }}
                      data-testid="button-cancel-pause"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => pauseMutation.mutate(pauseReason)}
                      disabled={pauseMutation.isPending}
                      data-testid="button-confirm-pause"
                    >
                      {pauseMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Pause Emails
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/email-quota/status'] })}
            data-testid="button-refresh-quota"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
