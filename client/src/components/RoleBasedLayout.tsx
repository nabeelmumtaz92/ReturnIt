import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Headphones, MessageCircle, Users, Settings, BarChart3,
  User, Shield, Truck, Package, Bell, Clock, Star
} from 'lucide-react';

interface RoleBasedLayoutProps {
  children: React.ReactNode;
  userRole: string;
  userName?: string;
  pageTitle?: string;
}

export function RoleBasedLayout({ children, userRole, userName, pageTitle }: RoleBasedLayoutProps) {
  const [, setLocation] = useLocation();

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'support':
        return {
          title: 'Customer Support Dashboard',
          navigation: [
            { label: 'Support Tickets', icon: <MessageCircle className="h-4 w-4" />, path: '/support-dashboard' },
            { label: 'Customer Communications', icon: <Headphones className="h-4 w-4" />, path: '/customer-communications' },
            { label: 'Knowledge Base', icon: <Settings className="h-4 w-4" />, path: '/knowledge-base' },
            { label: 'My Performance', icon: <BarChart3 className="h-4 w-4" />, path: '/my-performance' }
          ],
          permissions: ['view_tickets', 'respond_customers', 'view_orders', 'access_knowledge_base']
        };
      case 'operations':
        return {
          title: 'Operations Dashboard',
          navigation: [
            { label: 'Live Orders', icon: <Package className="h-4 w-4" />, path: '/operations-orders' },
            { label: 'Driver Management', icon: <Truck className="h-4 w-4" />, path: '/operations-drivers' },
            { label: 'Route Planning', icon: <Settings className="h-4 w-4" />, path: '/route-planning' },
            { label: 'Performance Metrics', icon: <BarChart3 className="h-4 w-4" />, path: '/operations-metrics' }
          ],
          permissions: ['manage_orders', 'assign_drivers', 'view_analytics', 'manage_routes']
        };
      case 'manager':
        return {
          title: 'Management Dashboard',
          navigation: [
            { label: 'Team Overview', icon: <Users className="h-4 w-4" />, path: '/team-overview' },
            { label: 'Performance Reports', icon: <BarChart3 className="h-4 w-4" />, path: '/management-reports' },
            { label: 'Employee Management', icon: <User className="h-4 w-4" />, path: '/employee-management' },
            { label: 'System Settings', icon: <Settings className="h-4 w-4" />, path: '/management-settings' }
          ],
          permissions: ['manage_team', 'view_all_reports', 'manage_employees', 'system_configuration']
        };
      default:
        return {
          title: 'Employee Dashboard',
          navigation: [
            { label: 'My Tasks', icon: <Clock className="h-4 w-4" />, path: '/my-tasks' },
            { label: 'Employee Guide', icon: <Settings className="h-4 w-4" />, path: '/employee-guide' }
          ],
          permissions: ['basic_access']
        };
    }
  };

  const config = getRoleConfig(userRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-amber-50 to-amber-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-amber-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              
              <div>
                <h1 className="text-xl font-bold text-amber-900">{pageTitle || config.title}</h1>
                <p className="text-sm text-amber-700">Welcome back, {userName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-amber-100 text-amber-800 px-3 py-1">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Role
              </Badge>
              <Button
                variant="outline"
                onClick={() => setLocation('/employee-guide')}
                className="border-amber-300"
              >
                Help Guide
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="bg-white border-amber-200 sticky top-6">
              <CardHeader>
                <CardTitle className="text-amber-900 text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  {config.navigation.map((item, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start hover:bg-amber-50"
                      onClick={() => setLocation(item.path)}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>

            {/* Role Permissions */}
            <Card className="bg-white border-amber-200 mt-4">
              <CardHeader>
                <CardTitle className="text-amber-900 text-sm flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Your Permissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {config.permissions.map((permission, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-amber-300">
                      {permission.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}