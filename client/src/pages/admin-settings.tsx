import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth-simple';
import { Link } from 'wouter';
import { 
  ArrowLeft, 
  Settings, 
  Clock,
  Zap,
  Bell,
  Package,
  Save,
  RotateCcw
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SystemSetting {
  id: number;
  key: string;
  value: string;
  dataType: string;
  category: string;
  label: string;
  description: string | null;
  minValue: string | null;
  maxValue: string | null;
  isActive: boolean;
  lastModifiedBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSettings() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  const { data: settings, isLoading } = useQuery<SystemSetting[]>({
    queryKey: ['/api/admin/settings'],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const updateSettingMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      apiRequest('PATCH', `/api/admin/settings/${key}`, { value }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      // Remove from edited values after successful save
      setEditedValues(prev => {
        const newValues = { ...prev };
        delete newValues[variables.key];
        return newValues;
      });
      toast({
        title: "Setting Updated",
        description: "The setting has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update setting",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF8F4] to-[#E8E3D6] flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Admin access required</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF8F4] to-[#E8E3D6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8956A] mx-auto mb-4"></div>
          <p className="text-[#8B6F47]">Loading settings...</p>
        </div>
      </div>
    );
  }

  const groupedSettings = settings?.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, SystemSetting[]>) || {};

  const categories = Object.keys(groupedSettings).sort();

  // Empty state if no settings exist
  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF8F4] to-[#E8E3D6] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/admin-dashboard">
                <Button variant="ghost" size="sm" className="text-[#8B6F47]" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-[#8B6F47]">System Settings</h1>
                <p className="text-sm text-[#A0805A]">Configure operational parameters</p>
              </div>
            </div>
          </div>

          <Card className="bg-white border-[#D4C4A8]">
            <CardHeader>
              <CardTitle>No Settings Found</CardTitle>
              <CardDescription>
                System settings have not been initialized yet. Please contact your system administrator.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Settings will appear here once they have been configured in the database.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'driver': return <Zap className="h-5 w-5" />;
      case 'order': return <Package className="h-5 w-5" />;
      case 'notification': return <Bell className="h-5 w-5" />;
      case 'system': return <Settings className="h-5 w-5" />;
      case 'admin': return <Clock className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  const handleValueChange = (key: string, value: string) => {
    setEditedValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (setting: SystemSetting) => {
    const value = editedValues[setting.key] || setting.value;
    updateSettingMutation.mutate({ key: setting.key, value });
  };

  const handleReset = (key: string) => {
    setEditedValues(prev => {
      const newValues = { ...prev };
      delete newValues[key];
      return newValues;
    });
  };

  const getCurrentValue = (setting: SystemSetting) => {
    return editedValues[setting.key] !== undefined ? editedValues[setting.key] : setting.value;
  };

  const hasChanges = (key: string) => {
    return editedValues[key] !== undefined;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F4] to-[#E8E3D6] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin-dashboard">
              <Button variant="ghost" size="sm" className="text-[#8B6F47]" data-testid="button-back">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[#8B6F47]">System Settings</h1>
              <p className="text-sm text-[#A0805A]">Configure operational parameters</p>
            </div>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue={categories[0]} className="space-y-6">
          <TabsList className="bg-white/50 border border-[#D4C4A8]">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="data-[state=active]:bg-[#B8956A] data-[state=active]:text-white capitalize"
                data-testid={`tab-${category}`}
              >
                {getCategoryIcon(category)}
                <span className="ml-2">{category}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <Card className="bg-white border-[#D4C4A8]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    {getCategoryIcon(category)}
                    {category} Settings
                  </CardTitle>
                  <CardDescription>
                    Configure {category}-related operational parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {groupedSettings[category]?.map((setting) => (
                    <div key={setting.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-[#8B6F47]">{setting.label}</h3>
                            {hasChanges(setting.key) && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                Modified
                              </Badge>
                            )}
                          </div>
                          {setting.description && (
                            <p className="text-sm text-gray-600 mb-2">{setting.description}</p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <code className="bg-gray-100 px-2 py-1 rounded">{setting.key}</code>
                            {setting.minValue && setting.maxValue && (
                              <span>Range: {setting.minValue} - {setting.maxValue}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Input
                          type={setting.dataType === 'number' ? 'number' : 'text'}
                          value={getCurrentValue(setting)}
                          onChange={(e) => handleValueChange(setting.key, e.target.value)}
                          min={setting.minValue || undefined}
                          max={setting.maxValue || undefined}
                          className="max-w-xs"
                          data-testid={`input-${setting.key}`}
                        />
                        
                        {hasChanges(setting.key) && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSave(setting)}
                              disabled={updateSettingMutation.isPending}
                              className="bg-[#B8956A] hover:bg-[#A0805A] text-white"
                              data-testid={`button-save-${setting.key}`}
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReset(setting.key)}
                              disabled={updateSettingMutation.isPending}
                              data-testid={`button-reset-${setting.key}`}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Reset
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
