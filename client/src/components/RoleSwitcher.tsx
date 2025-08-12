import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth-simple";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Truck, 
  Shield, 
  ChevronDown, 
  Package,
  BarChart3,
  CreditCard,
  UserPlus
} from "lucide-react";

export function RoleSwitcher() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [currentRole, setCurrentRole] = useState<'customer' | 'driver' | 'admin'>('customer');

  // Only show role switcher for the master administrator
  const MASTER_ADMIN_EMAIL = 'nabeelmumtaz92@gmail.com';
  
  if (!user || user.email !== MASTER_ADMIN_EMAIL || (!user.isAdmin && !user.isDriver)) {
    return null; // Only show for master admin with multiple roles
  }

  const roles = [
    {
      id: 'customer' as const,
      name: 'Customer',
      icon: User,
      color: 'bg-blue-100 text-blue-800',
      description: 'Book pickups and track orders',
      routes: [
        { name: 'Book Pickup', path: '/book-pickup', icon: Package },
        { name: 'Order Status', path: '/order-status/DEMO01', icon: BarChart3 },
      ]
    },
    ...(user.isDriver ? [{
      id: 'driver' as const,
      name: 'Driver',
      icon: Truck,
      color: 'bg-green-100 text-green-800',
      description: 'Manage deliveries and earnings',
      routes: [
        { name: 'Driver Portal', path: '/driver-portal', icon: Truck },
        { name: 'Driver Payments', path: '/driver-payments', icon: CreditCard },
        { name: 'Driver Onboarding', path: '/driver-onboarding', icon: UserPlus },
      ]
    }] : []),
    ...(user.isAdmin ? [{
      id: 'admin' as const,
      name: 'Admin',
      icon: Shield,
      color: 'bg-amber-100 text-amber-800',
      description: 'Manage operations and drivers',
      routes: [
        { name: 'Admin Dashboard', path: '/admin-dashboard', icon: BarChart3 },
      ]
    }] : []),
  ];

  const currentRoleData = roles.find(role => role.id === currentRole);

  const handleRoleSwitch = (roleId: 'customer' | 'driver' | 'admin', routePath?: string) => {
    setCurrentRole(roleId);
    if (routePath) {
      setLocation(routePath);
    } else {
      // Default routes for each role
      const defaultRoutes = {
        customer: '/',
        driver: '/driver-portal',
        admin: '/admin-dashboard'
      };
      setLocation(defaultRoutes[roleId]);
    }
  };

  if (roles.length <= 1) {
    return null; // Don't show switcher if user only has one role
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Current Role Badge */}
      <Badge className={`${currentRoleData?.color} border-0 px-3 py-1`}>
        {currentRoleData && <currentRoleData.icon className="h-3 w-3 mr-1" />}
        {currentRoleData?.name}
      </Badge>

      {/* Role Switcher Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-amber-700 border-amber-300 hover:bg-amber-50"
          >
            Switch Role
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-amber-700 mb-2">
              Available Roles for {user.firstName} {user.lastName}
            </p>
          </div>
          
          {roles.map((role, index) => (
            <div key={role.id}>
              {index > 0 && <DropdownMenuSeparator />}
              
              {/* Role Header */}
              <div className="px-3 py-2">
                <div className="flex items-center space-x-2 mb-2">
                  <role.icon className="h-4 w-4 text-amber-700" />
                  <span className="font-medium text-amber-900">{role.name}</span>
                  {role.id === currentRole && (
                    <Badge variant="secondary" className="text-xs">Current</Badge>
                  )}
                </div>
                <p className="text-xs text-amber-600 mb-2">{role.description}</p>
              </div>

              {/* Role Routes */}
              {role.routes.map((route) => (
                <DropdownMenuItem
                  key={route.path}
                  onClick={() => handleRoleSwitch(role.id, route.path)}
                  className="pl-6 hover:bg-amber-50 cursor-pointer"
                >
                  <route.icon className="h-3 w-3 mr-2 text-amber-600" />
                  <span className="text-sm">{route.name}</span>
                </DropdownMenuItem>
              ))}
            </div>
          ))}
          
          <DropdownMenuSeparator />
          <div className="px-3 py-2">
            <p className="text-xs text-amber-600">
              Quickly switch between your roles to test different features
            </p>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}