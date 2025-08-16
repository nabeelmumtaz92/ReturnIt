import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  LayoutDashboard, 
  Users, 
  Package, 
  TrendingUp, 
  DollarSign, 
  UserCheck, 
  MessageSquare, 
  Settings, 
  BarChart3, 
  FileText, 
  Truck, 
  Star, 
  CreditCard, 
  Shield, 
  Activity,
  LogOut,
  Home
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth-simple";
import { ReturnItLogo } from "./LogoIcon";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export function AdminNavigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navigationSections: NavigationSection[] = [
    {
      title: "Dashboard",
      items: [
        {
          label: "Main Dashboard",
          href: "/admin-dashboard",
          icon: LayoutDashboard,
          description: "Overview of all operations"
        },
        {
          label: "Business Intelligence",
          href: "/business-intelligence",
          icon: TrendingUp,
          description: "Advanced analytics and insights"
        },
        {
          label: "Enhanced Analytics",
          href: "/enhanced-analytics",
          icon: BarChart3,
          description: "Real-time performance metrics"
        }
      ]
    },
    {
      title: "Operations",
      items: [
        {
          label: "Live Orders",
          href: "/admin-dashboard",
          icon: Package,
          description: "Real-time order management",
          badge: "Live"
        },
        {
          label: "Driver Management",
          href: "/admin-dashboard",
          icon: Users,
          description: "Driver oversight and performance"
        },
        {
          label: "Route Optimization",
          href: "/route-optimization",
          icon: Truck,
          description: "Optimize delivery routes"
        },
        {
          label: "Quality Assurance",
          href: "/quality-assurance",
          icon: Shield,
          description: "Service quality monitoring"
        }
      ]
    },
    {
      title: "Financial",
      items: [
        {
          label: "Payment Tracking",
          href: "/admin-payment-tracking",
          icon: DollarSign,
          description: "Payment and payout management"
        },
        {
          label: "Driver Incentives",
          href: "/driver-incentives",
          icon: Star,
          description: "Bonus and reward programs"
        },
        {
          label: "Advanced Reporting",
          href: "/advanced-reporting",
          icon: FileText,
          description: "Financial reports and exports"
        }
      ]
    },
    {
      title: "Customer & Support",
      items: [
        {
          label: "Customer Service",
          href: "/customer-service-tickets",
          icon: MessageSquare,
          description: "Support ticket management"
        },
        {
          label: "Chat Center",
          href: "/chat-center",
          icon: MessageSquare,
          description: "Live customer support"
        },
        {
          label: "Customer Rating",
          href: "/customer-rating",
          icon: Star,
          description: "Customer feedback system"
        },
        {
          label: "Notification Center",
          href: "/notification-center",
          icon: Activity,
          description: "System notifications"
        }
      ]
    },
    {
      title: "Management",
      items: [
        {
          label: "Employee Management",
          href: "/admin-dashboard",
          icon: UserCheck,
          description: "Staff and permissions"
        },
        {
          label: "Multi-City Management",
          href: "/multi-city-management",
          icon: Settings,
          description: "Expand to new markets"
        },
        {
          label: "Bulk Operations",
          href: "/bulk-order-import",
          icon: Package,
          description: "Import and batch processing"
        },
        {
          label: "Loyalty Programs",
          href: "/loyalty-dashboard",
          icon: Star,
          description: "Customer retention programs"
        }
      ]
    }
  ];

  const NavigationContent = () => (
    <div className="space-y-6">
      {/* User Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-amber-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
            {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-amber-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-amber-700">{user?.email}</p>
            <Badge variant="secondary" className="mt-1 bg-amber-100 text-amber-800">
              Master Admin
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <Link href="/">
          <Button 
            variant="outline" 
            className="w-full justify-start border-amber-200 hover:bg-amber-50"
            onClick={() => setIsOpen(false)}
          >
            <Home className="h-4 w-4 mr-2" />
            Main Website
          </Button>
        </Link>
        <Button 
          variant="outline" 
          className="w-full justify-start border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700"
          onClick={() => {
            logout();
            setIsOpen(false);
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Navigation Sections */}
      {navigationSections.map((section) => (
        <div key={section.title} className="space-y-2">
          <h3 className="font-semibold text-amber-900 text-sm uppercase tracking-wide">
            {section.title}
          </h3>
          <div className="space-y-1">
            {section.items.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start h-auto p-3 ${
                      isActive 
                        ? "bg-amber-600 text-white hover:bg-amber-700" 
                        : "hover:bg-amber-50 text-amber-800"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.label}</span>
                          {item.badge && (
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${
                                isActive ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className={`text-xs mt-1 ${
                          isActive ? "text-white/80" : "text-amber-600"
                        }`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed top-4 left-4 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            className="bg-white/90 backdrop-blur-sm border-amber-200 hover:bg-amber-50 shadow-lg"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 bg-white border-amber-200">
          <SheetHeader className="border-b border-amber-200 pb-4 mb-6">
            <div className="flex items-center space-x-3">
              <ReturnItLogo size={24} variant="default" />
              <SheetTitle className="text-amber-900">Admin Panel</SheetTitle>
            </div>
          </SheetHeader>
          <div className="overflow-y-auto max-h-[calc(100vh-120px)]">
            <NavigationContent />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}