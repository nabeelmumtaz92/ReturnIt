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
  Home,
  User,
  Smartphone,
  Monitor,
  Eye
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth-simple";

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
          href: "/admin-dashboard?section=analytics",
          icon: TrendingUp,
          description: "Advanced analytics and insights"
        },
        {
          label: "Enhanced Analytics",
          href: "/admin-dashboard?section=enhanced-analytics",
          icon: BarChart3,
          description: "Real-time performance metrics"
        },
        {
          label: "System Metrics",
          href: "/admin-dashboard?section=system-metrics",
          icon: Activity,
          description: "Server performance & visitor analytics"
        }
      ]
    },
    {
      title: "Operations",
      items: [
        {
          label: "Live Orders",
          href: "/admin-dashboard?section=orders",
          icon: Package,
          description: "Real-time order management",
          badge: "Live"
        },
        {
          label: "Driver Management", 
          href: "/admin-dashboard?section=drivers",
          icon: Users,
          description: "Driver oversight and performance"
        },
        {
          label: "Route Optimization",
          href: "/admin-dashboard?section=routes",
          icon: Truck,
          description: "Optimize delivery routes"
        },
        {
          label: "Quality Assurance",
          href: "/admin-dashboard?section=quality",
          icon: Shield,
          description: "Service quality monitoring"
        },
        {
          label: "Service Management",
          href: "/admin-dashboard?section=operations",
          icon: Settings,
          description: "Service areas & capacity planning"
        }
      ]
    },
    {
      title: "Financial",
      items: [
        {
          label: "Payment Tracking",
          href: "/admin-dashboard?section=payments",
          icon: DollarSign,
          description: "Payment and payout management"
        },
        {
          label: "Driver Incentives",
          href: "/admin-dashboard?section=incentives",
          icon: Star,
          description: "Bonus and reward programs"
        },
        {
          label: "Advanced Reporting",
          href: "/admin-dashboard?section=reporting",
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
          href: "/admin-dashboard?section=tickets",
          icon: MessageSquare,
          description: "Support ticket management"
        },
        {
          label: "Chat Center",
          href: "/admin-dashboard?section=chat",
          icon: MessageSquare,
          description: "Live customer support"
        },
        {
          label: "Customer Rating",
          href: "/admin-dashboard?section=ratings",
          icon: Star,
          description: "Customer feedback system"
        },
        {
          label: "Notification Center",
          href: "/admin-dashboard?section=notifications",
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
          href: "/admin-dashboard?section=employees",
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
        },
        {
          label: "Driver Payouts",
          href: "/admin-dashboard?section=payouts",
          icon: DollarSign,
          description: "Manage driver payments and fees"
        },
        {
          label: "Tax Reports",
          href: "/admin-dashboard?section=tax-reports",
          icon: BarChart3,
          description: "1099 forms and tax reporting"
        }
      ]
    },
    {
      title: "Mobile App Management",
      items: [
        {
          label: "Customer Mobile App",
          href: "/customer-app",
          icon: Smartphone,
          description: "Access customer mobile interface",
          badge: "Mobile"
        },
        {
          label: "Driver Mobile App",
          href: "/driver-app",
          icon: Truck,
          description: "Access driver mobile interface",
          badge: "Driver"
        },
        {
          label: "App Analytics",
          href: "/admin-dashboard?section=mobile-analytics",
          icon: Monitor,
          description: "Mobile app usage and performance"
        },
        {
          label: "Interface Preview",
          href: "/admin-dashboard?section=interface-preview",
          icon: Eye,
          description: "Preview and test mobile interfaces"
        }
      ]
    },
    {
      title: "My Account",
      items: [
        {
          label: "Customer Panel",
          href: "/",
          icon: User,
          description: "Access the customer interface"
        },
        {
          label: "Track Order",
          href: "/track",
          icon: Package,
          description: "Track packages and deliveries"
        },
        {
          label: "Book Return",
          href: "/book-return",
          icon: Truck,
          description: "Schedule new return pickup"
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
      {navigationSections.map((section, sectionIndex) => (
        <div key={section.title} className="space-y-2">
          <h3 className="font-semibold text-amber-900 text-sm uppercase tracking-wide">
            {section.title}
          </h3>
          <div className="space-y-1">
            {section.items.map((item, itemIndex) => {
              // Better active state detection for section-based URLs
              const isActive = location === item.href || 
                (item.href.includes('?section=') && 
                 window.location.search.includes(item.href.split('?section=')[1]));
              return (
                <Link key={`${section.title}-${item.label}-${itemIndex}`} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start h-auto p-3 ${
                      isActive 
                        ? "bg-amber-600 text-white hover:bg-amber-700" 
                        : "hover:bg-amber-50 text-amber-800"
                    }`}
                    onClick={() => setIsOpen(false)}
                    data-testid={`nav-${section.title.toLowerCase().replace(/\s+/g, '-')}-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
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
          {/* Add visual separator between sections except for the last one */}
          {sectionIndex < navigationSections.length - 1 && (
            <div className="border-b border-amber-100 my-4" />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed top-4 left-4 z-[100]">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            className="bg-white/90 backdrop-blur-sm border-amber-200 hover:bg-amber-50 shadow-lg z-[100]"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 bg-white border-amber-200">
          <SheetHeader className="border-b border-amber-200 pb-4 mb-6">
            <div className="flex flex-col items-center space-y-2">
              
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