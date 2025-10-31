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
      description: 'Book returns and track orders',
      routes: [
        { name: 'Book Return', path: '/book-return', icon: Package },
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
        { name: 'Admin Dashboard', path: '/admin', icon: BarChart3 },
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
        admin: '/admin'
      };
      setLocation(defaultRoutes[roleId]);
    }
  };

  if (roles.length <= 1) {
    return null; // Don't show switcher if user only has one role
  }

  return (
    <div className="flex items-center space-x-2 sm:space-x-3">
      {/* Current Role Badge - Hidden on small screens, shown on tablets+ */}
      <Badge className={`${currentRoleData?.color} border-0 px-2 sm:px-3 py-1 hidden sm:flex items-center`}>
        {currentRoleData && <currentRoleData.icon className="h-3 w-3 mr-1" />}
        <span className="text-xs sm:text-sm">{currentRoleData?.name}</span>
      </Badge>

      {/* Role Switcher Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-amber-700 border-amber-300 hover:bg-amber-50 active:bg-amber-100 px-2 sm:px-3 py-2 sm:py-2 text-xs sm:text-sm min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 touch-manipulation"
          >
            {/* Mobile: Show icon only */}
            <span className="sm:hidden flex items-center justify-center">
              {currentRoleData && <currentRoleData.icon className="h-5 w-5" />}
            </span>
            {/* Desktop: Show text */}
            <span className="hidden sm:inline flex items-center">
              Switch Role
              <ChevronDown className="h-3 w-3 ml-1" />
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-80 sm:w-96 max-h-[85vh] overflow-y-auto shadow-xl border-amber-200"
          side="bottom"
          sideOffset={8}
          avoidCollisions={true}
          collisionPadding={16}
        >
          <div className="px-3 py-2 border-b border-amber-100">
            <p className="text-xs sm:text-sm font-medium text-amber-700 mb-1">
              Available Roles
            </p>
            <p className="text-xs text-amber-600">
              {user.firstName} {user.lastName}
            </p>
          </div>
          
          {roles.map((role, index) => (
            <div key={role.id}>
              {index > 0 && <DropdownMenuSeparator />}
              
              {/* Role Header */}
              <div className="px-3 py-2">
                <div className="flex items-center space-x-2 mb-2">
                  <role.icon className="h-4 w-4 text-amber-700 flex-shrink-0" />
                  <span className="font-medium text-amber-900 text-sm sm:text-base">{role.name}</span>
                  {role.id === currentRole && (
                    <Badge variant="secondary" className="text-xs ml-auto">Current</Badge>
                  )}
                </div>
                <p className="text-xs text-amber-600 mb-2 leading-relaxed">{role.description}</p>
              </div>

              {/* Role Routes */}
              {role.routes.map((route) => (
                <DropdownMenuItem
                  key={route.path}
                  onClick={() => handleRoleSwitch(role.id, route.path)}
                  className="pl-6 pr-3 py-3 sm:py-2.5 hover:bg-amber-50 active:bg-amber-100 cursor-pointer focus:bg-amber-50 touch-manipulation min-h-[48px] sm:min-h-0"
                >
                  <route.icon className="h-5 w-5 sm:h-4 sm:w-4 mr-3 text-amber-600 flex-shrink-0" />
                  <span className="text-sm sm:text-sm text-amber-900 font-medium">{route.name}</span>
                </DropdownMenuItem>
              ))}
            </div>
          ))}
          
          <DropdownMenuSeparator />
          <div className="px-3 py-2 bg-amber-25">
            <p className="text-xs text-amber-600 leading-relaxed">
              Switch between admin, driver, and customer views to test all platform features
            </p>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}