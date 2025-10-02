import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Shield
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function RetailerAPIKeys() {
  const [, params] = useRoute("/retailer/companies/:companyId/api-keys");
  const companyId = params?.companyId;
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyData, setNewKeyData] = useState<any>(null);
  const [environment, setEnvironment] = useState("test");
  const [permissions, setPermissions] = useState<string[]>(["read"]);

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ["/api/retailer/api-keys", companyId],
    enabled: !!companyId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/retailer/api-keys", data);
    },
    onSuccess: (data) => {
      setNewKeyData(data);
      queryClient.invalidateQueries({ queryKey: ["/api/retailer/api-keys", companyId] });
      toast({
        title: "API Key Created",
        description: "Your new API key has been generated. Make sure to copy it now!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create API key",
        variant: "destructive",
      });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (keyId: number) => {
      return await apiRequest("POST", `/api/retailer/api-keys/${keyId}/revoke`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/retailer/api-keys", companyId] });
      toast({
        title: "API Key Revoked",
        description: "The API key has been revoked and can no longer be used.",
      });
    },
  });

  const handleCreateKey = () => {
    createMutation.mutate({
      companyId: parseInt(companyId!),
      environment,
      permissions,
    });
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  };

  const togglePermission = (permission: string) => {
    setPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading API keys...</p>
        </div>
      </div>
    );
  }

  const keys = apiKeys?.apiKeys || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            API Keys
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your API keys for programmatic access to ReturnIt
          </p>
        </div>

        <Alert className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <Shield className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Security Notice:</strong> API keys provide full access to your account. Never share them publicly or commit them to version control.
            Use test keys for development and live keys for production only.
          </AlertDescription>
        </Alert>

        {newKeyData && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="space-y-3">
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  Your new API key has been created! Copy it now - it won't be shown again.
                </p>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded border">
                  <code className="flex-1 text-sm font-mono break-all">
                    {newKeyData.key}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyKey(newKeyData.key)}
                    data-testid="button-copy-new-key"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setNewKeyData(null)}
                data-testid="button-dismiss-new-key"
              >
                I've saved my key
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {keys.length} API {keys.length === 1 ? 'key' : 'keys'}
          </div>
          <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-api-key">
            <Plus className="mr-2 h-4 w-4" />
            Create API Key
          </Button>
        </div>

        <div className="grid gap-4">
          {keys.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Key className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                  No API keys yet. Create one to start integrating with ReturnIt.
                </p>
                <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-first-key">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First API Key
                </Button>
              </CardContent>
            </Card>
          ) : (
            keys.map((key: any) => (
              <Card key={key.id} data-testid={`card-api-key-${key.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          {key.keyPrefix}••••••••
                        </CardTitle>
                        <Badge variant={key.environment === 'live' ? 'default' : 'secondary'}>
                          {key.environment}
                        </Badge>
                        <Badge variant={key.isActive ? 'default' : 'destructive'}>
                          {key.isActive ? 'Active' : 'Revoked'}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Created {new Date(key.createdAt).toLocaleDateString()}
                        </span>
                        {key.lastUsedAt && (
                          <span className="flex items-center gap-1">
                            Last used {new Date(key.lastUsedAt).toLocaleDateString()}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    {key.isActive && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
                            revokeMutation.mutate(key.id);
                          }
                        }}
                        data-testid={`button-revoke-${key.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Revoke
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Permissions</p>
                      <div className="flex gap-1">
                        {(key.permissions || []).map((perm: string) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Rate Limit</p>
                      <p className="font-semibold">{key.rateLimit || 1000} requests/hour</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Current Usage</p>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{key.currentUsage || 0} / {key.rateLimit || 1000}</p>
                        {key.currentUsage > 0 && (
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-orange-600 h-2 rounded-full"
                              style={{ width: `${Math.min(100, ((key.currentUsage || 0) / (key.rateLimit || 1000)) * 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent data-testid="dialog-create-api-key">
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key for programmatic access to ReturnIt
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="environment">Environment</Label>
                <Select value={environment} onValueChange={setEnvironment}>
                  <SelectTrigger id="environment" data-testid="select-environment">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Test (ret_test_...)</SelectItem>
                    <SelectItem value="live">Live (ret_live_...)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {environment === 'test'
                    ? 'Use test keys for development and testing'
                    : 'Use live keys for production only'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="space-y-2">
                  {['read', 'write', 'delete'].map((perm) => (
                    <div key={perm} className="flex items-center space-x-2">
                      <Checkbox
                        id={perm}
                        checked={permissions.includes(perm)}
                        onCheckedChange={() => togglePermission(perm)}
                        data-testid={`checkbox-permission-${perm}`}
                      />
                      <label
                        htmlFor={perm}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {perm.charAt(0).toUpperCase() + perm.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
                {permissions.length === 0 && (
                  <p className="text-xs text-red-600">At least one permission is required</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateKey}
                disabled={permissions.length === 0 || createMutation.isPending}
                data-testid="button-confirm-create-key"
              >
                {createMutation.isPending ? 'Creating...' : 'Create API Key'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
