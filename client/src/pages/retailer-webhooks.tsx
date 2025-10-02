import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Webhook, 
  Plus, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  XCircle, 
  Activity,
  Send,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { RetailerWebhook } from "@shared/schema";

const webhookFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Must be a valid HTTPS URL").refine(
    (url) => url.startsWith("https://"),
    "Webhook URL must use HTTPS for security"
  ),
  description: z.string().optional(),
  subscribedEvents: z.array(z.string()).min(1, "Select at least one event"),
});

type WebhookFormData = z.infer<typeof webhookFormSchema>;

const AVAILABLE_EVENTS = [
  { id: "return.created", label: "Return Created", description: "When a new return is created" },
  { id: "return.updated", label: "Return Updated", description: "When return status changes" },
  { id: "return.assigned", label: "Return Assigned", description: "When a driver is assigned" },
  { id: "return.picked_up", label: "Return Picked Up", description: "When package is picked up" },
  { id: "return.delivered", label: "Return Delivered", description: "When return is delivered" },
  { id: "return.completed", label: "Return Completed", description: "When return is completed" },
  { id: "return.cancelled", label: "Return Cancelled", description: "When return is cancelled" },
];

export default function RetailerWebhooks() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteWebhookId, setDeleteWebhookId] = useState<number | null>(null);
  const [testingWebhookId, setTestingWebhookId] = useState<number | null>(null);
  const [selectedWebhookSecret, setSelectedWebhookSecret] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState<{ [key: number]: boolean }>({});

  // Hardcoded company ID (in production, get from auth context)
  const companyId = 1;

  const { data: webhooksData, isLoading } = useQuery<{ webhooks: RetailerWebhook[] }>({
    queryKey: ["/api/retailer/companies", companyId, "webhooks"],
  });

  const webhooks = webhooksData?.webhooks || [];

  const form = useForm<WebhookFormData>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      name: "",
      url: "",
      description: "",
      subscribedEvents: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: WebhookFormData) => {
      const response = await apiRequest(
        `/api/retailer/companies/${companyId}/webhooks`,
        { 
          method: "POST",
          body: JSON.stringify(data)
        }
      );
      return response as { webhook: RetailerWebhook & { secret: string } };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/retailer/companies", companyId, "webhooks"] });
      setSelectedWebhookSecret(data.webhook.secret);
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Webhook created",
        description: "Your webhook endpoint has been configured successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create webhook",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (webhookId: number) => {
      return await apiRequest(`/api/retailer/companies/${companyId}/webhooks/${webhookId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/retailer/companies", companyId, "webhooks"] });
      setDeleteWebhookId(null);
      toast({
        title: "Webhook deleted",
        description: "The webhook has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete webhook",
        variant: "destructive",
      });
    },
  });

  const testMutation = useMutation({
    mutationFn: async (webhookId: number) => {
      const response = await apiRequest(
        `/api/retailer/companies/${companyId}/webhooks/${webhookId}/test`,
        { method: "POST" }
      );
      return response as { success: boolean; message: string; status?: number };
    },
    onSuccess: (data) => {
      setTestingWebhookId(null);
      toast({
        title: data.success ? "Test successful" : "Test failed",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      setTestingWebhookId(null);
      toast({
        title: "Test failed",
        description: error.message || "Failed to send test webhook",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const toggleSecret = (webhookId: number) => {
    setShowSecret(prev => ({ ...prev, [webhookId]: !prev[webhookId] }));
  };

  const onSubmit = (data: WebhookFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Webhook className="h-8 w-8 text-primary" />
            Webhooks
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure webhook endpoints to receive real-time notifications about return events
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-webhook">
              <Plus className="h-4 w-4 mr-2" />
              Create Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Webhook Endpoint</DialogTitle>
              <DialogDescription>
                Add a new webhook to receive real-time notifications about return events
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Production Webhook" 
                          {...field} 
                          data-testid="input-webhook-name"
                        />
                      </FormControl>
                      <FormDescription>
                        A friendly name to identify this webhook
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endpoint URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://api.yourcompany.com/webhooks/returnit" 
                          {...field}
                          data-testid="input-webhook-url"
                        />
                      </FormControl>
                      <FormDescription>
                        Must be a valid HTTPS URL that can receive POST requests
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Webhook for production return notifications..." 
                          {...field}
                          data-testid="input-webhook-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subscribedEvents"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Subscribe to Events</FormLabel>
                        <FormDescription>
                          Select which events should trigger this webhook
                        </FormDescription>
                      </div>
                      <div className="space-y-3">
                        {AVAILABLE_EVENTS.map((event) => (
                          <FormField
                            key={event.id}
                            control={form.control}
                            name="subscribedEvents"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(event.id)}
                                    onCheckedChange={(checked) => {
                                      const newValue = checked
                                        ? [...(field.value || []), event.id]
                                        : (field.value || []).filter((value) => value !== event.id);
                                      field.onChange(newValue);
                                    }}
                                    data-testid={`checkbox-event-${event.id}`}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="font-medium cursor-pointer">
                                    {event.label}
                                  </FormLabel>
                                  <FormDescription className="text-sm">
                                    {event.description}
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    data-testid="button-cancel-webhook"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                    data-testid="button-submit-webhook"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Webhook"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Secret Display Dialog */}
      <Dialog open={!!selectedWebhookSecret} onOpenChange={() => setSelectedWebhookSecret(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Webhook Secret</DialogTitle>
            <DialogDescription>
              Save this secret securely. You won't be able to see it again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg font-mono text-sm break-all">
              {selectedWebhookSecret}
            </div>
            <Button
              onClick={() => selectedWebhookSecret && copyToClipboard(selectedWebhookSecret, "Secret")}
              className="w-full"
              data-testid="button-copy-secret"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Secret
            </Button>
            <p className="text-sm text-muted-foreground">
              Use this secret to verify webhook signatures using HMAC SHA-256
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Webhooks List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Loading webhooks...</p>
            </CardContent>
          </Card>
        ) : webhooks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Webhook className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No webhooks configured</h3>
              <p className="text-muted-foreground mb-4">
                Create your first webhook to start receiving real-time notifications
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-webhook">
                <Plus className="h-4 w-4 mr-2" />
                Create Webhook
              </Button>
            </CardContent>
          </Card>
        ) : (
          webhooks.map((webhook) => (
            <Card key={webhook.id} data-testid={`card-webhook-${webhook.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {webhook.name}
                      {webhook.isActive ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {webhook.description || "No description"}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTestingWebhookId(webhook.id);
                        testMutation.mutate(webhook.id);
                      }}
                      disabled={testingWebhookId === webhook.id}
                      data-testid={`button-test-webhook-${webhook.id}`}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {testingWebhookId === webhook.id ? "Testing..." : "Test"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteWebhookId(webhook.id)}
                      data-testid={`button-delete-webhook-${webhook.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Endpoint URL</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                      {webhook.url}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(webhook.url, "URL")}
                      data-testid={`button-copy-url-${webhook.id}`}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Signing Secret</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                      {showSecret[webhook.id] ? webhook.secret : "whsec_••••••••••••••••••••••••"}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSecret(webhook.id)}
                      data-testid={`button-toggle-secret-${webhook.id}`}
                    >
                      {showSecret[webhook.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(webhook.secret, "Secret")}
                      data-testid={`button-copy-secret-${webhook.id}`}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Subscribed Events
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(webhook.subscribedEvents as string[]).map((event: string) => (
                      <Badge key={event} variant="outline" data-testid={`badge-event-${webhook.id}-${event}`}>
                        <Activity className="h-3 w-3 mr-1" />
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Max Retries:</span>
                    <span className="ml-2 font-medium">{webhook.maxRetries}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Timeout:</span>
                    <span className="ml-2 font-medium">{webhook.timeoutSeconds}s</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Success Count:</span>
                    <span className="ml-2 font-medium text-green-600">{(webhook as any).successCount || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Failure Count:</span>
                    <span className="ml-2 font-medium text-red-600">{(webhook as any).failureCount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteWebhookId} onOpenChange={() => setDeleteWebhookId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Webhook?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the webhook endpoint. You'll stop receiving events at this URL.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteWebhookId && deleteMutation.mutate(deleteWebhookId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete Webhook
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
