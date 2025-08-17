import { useState, ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, Users, Truck, DollarSign, FileText, BarChart3, 
  Settings, MessageSquare, Star, Package, UserCheck, 
  Activity, Clock, Shield, Globe, Heart, Headphones,
  ChevronRight, Menu, X, Building2, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ReturnItLogo } from '@/components/LogoIcon';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
  pageTitle: string;
  tabs?: Array<{
    label: string;
    href: string;
    current?: boolean;
  }>;
}

const navigationSections = [
  {
    title: "Business Operations Center",
    items: [
      {
        label: "Order Management",
        href: "/admin-orders",
        icon: Package,
        description: "Track and manage all orders"
      },
      {
        label: "Driver Management", 
        href: "/admin-drivers",
        icon: Truck,
        description: "Driver onboarding and oversight"
      },
      {
        label: "Real-time Tracking",
        href: "/admin-tracking",
        icon: Activity,
        description: "Live order and driver tracking"
      },
      {
        label: "Quality Assurance",
        href: "/quality-assurance",
        icon: Shield,
        description: "Photo verification and disputes"
      }
    ]
  },
  {
    title: "Dashboard",
    items: [
      {
        label: "Overview",
        href: "/admin-dashboard",
        icon: Home,
        description: "Main dashboard and overview"
      }
    ]
  },
  {
    title: "Analytics & Reports",
    items: [
      {
        label: "Business Intelligence",
        href: "/business-intelligence", 
        icon: BarChart3,
        description: "Strategic insights and KPIs"
      },
      {
        label: "Enhanced Analytics",
        href: "/enhanced-analytics-dashboard",
        icon: Activity,
        description: "Advanced performance metrics"
      },
      {
        label: "Driver Performance",
        href: "/driver-performance",
        icon: Users,
        description: "Driver analytics and leaderboards"
      },
      {
        label: "Advanced Reporting",
        href: "/advanced-reporting",
        icon: FileText,
        description: "Custom reports and exports"
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
        label: "Accounting & Tax",
        href: "/admin-accounting",
        icon: FileText,
        description: "Tax reports and 1099 generation"
      }
    ]
  },
  {
    title: "Customer & Support",
    items: [
      {
        label: "Support Tickets",
        href: "/customer-service-tickets",
        icon: MessageSquare,
        description: "Customer service management"
      },
      {
        label: "Chat Center",
        href: "/chat-center",
        icon: Headphones,
        description: "Live customer support"
      },
      {
        label: "Customer Ratings",
        href: "/customer-rating",
        icon: Heart,
        description: "Feedback and satisfaction"
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
        href: "/employee-management",
        icon: UserCheck,
        description: "Staff and permissions"
      },
      {
        label: "Multi-City Operations",
        href: "/multi-city-management",
        icon: Globe,
        description: "Expansion and market management"
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
  },
  {
    title: "System",
    items: [
      {
        label: "Feature Documents",
        href: "/feature-documents",
        icon: FileText,
        description: "Documentation generator"
      },
      {
        label: "System Settings",
        href: "/admin-settings",
        icon: Settings,
        description: "Platform configuration"
      },
      {
        label: "Business Profile",
        href: "/business-profile",
        icon: Building2,
        description: "Company information"
      }
    ]
  }
];

export function AdminLayout({ children, pageTitle, tabs = [] }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location] = useLocation();

  const getCurrentSection = () => {
    for (const section of navigationSections) {
      for (const item of section.items) {
        if (location === item.href) {
          return section.title;
        }
      }
    }
    return "Dashboard";
  };

  const isActiveLink = (href: string) => {
    return location === href;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Top Header Bar - Right Side Only */}
      <div className="bg-white shadow-sm border-b border-gray-200 py-3 relative z-50">
        <div className="flex justify-end items-center space-x-3 px-6" style={{ marginLeft: '320px' }}>
          {/* Admin Tools Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-amber-300 text-amber-700">
                <Menu className="h-4 w-4 mr-2" />
                Admin Tools
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                System Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users className="h-4 w-4 mr-2" />
                User Management  
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Reports
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notification Bell */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* Sign Out */}
          <Button variant="outline" size="sm">
            Sign Out
          </Button>

          {/* Back to Site */}
          <Link href="/">
            <Button variant="default" size="sm" className="bg-amber-600 hover:bg-amber-700">
              Back to Site
            </Button>
          </Link>
        </div>
      </div>
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-40 h-full bg-white shadow-xl border-r border-amber-200 transition-all duration-300",
        sidebarOpen ? "w-80" : "w-16"
      )}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-amber-200">
          <div className={cn("flex items-center gap-3", !sidebarOpen && "justify-center")}>
            <ReturnItLogo className="h-8 w-8 text-amber-600" />
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-bold text-amber-900">ReturnIt</h1>
                <p className="text-xs text-amber-600">Admin Panel</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-amber-600 hover:text-amber-900 hover:bg-amber-50"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {navigationSections.map((section) => (
            <div key={section.title}>
              {sidebarOpen && (
                <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer group",
                        isActiveLink(item.href)
                          ? "bg-amber-100 text-amber-900 border border-amber-200"
                          : "text-amber-700 hover:bg-amber-50 hover:text-amber-900"
                      )}
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      <item.icon className={cn("h-4 w-4 flex-shrink-0", 
                        isActiveLink(item.href) ? "text-amber-700" : "text-amber-600"
                      )} />
                      {sidebarOpen && (
                        <>
                          <div className="flex-1">
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs text-amber-600 mt-0.5">
                              {item.description}
                            </div>
                          </div>
                          {isActiveLink(item.href) && (
                            <ChevronRight className="h-4 w-4 text-amber-600" />
                          )}
                        </>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Current Section Indicator */}
        {sidebarOpen && (
          <div className="p-4 border-t border-amber-200 bg-amber-50">
            <div className="text-xs text-amber-700 font-medium">Current Section</div>
            <div className="text-sm font-semibold text-amber-900">{getCurrentSection()}</div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300 pt-16",
        sidebarOpen ? "ml-80" : "ml-16"
      )}>
        {/* Page Header */}
        <div className="bg-white border-b border-amber-200 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-amber-900">{pageTitle}</h1>
                <div className="text-sm text-amber-600 mt-1">
                  {getCurrentSection()} • {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
            
            {/* Page Tabs */}
            {tabs.length > 0 && (
              <div className="mt-4 border-b border-amber-200">
                <div className="flex space-x-8">
                  {tabs.map((tab) => (
                    <Link key={tab.href} href={tab.href}>
                      <div
                        className={cn(
                          "py-2 px-1 border-b-2 font-medium text-sm cursor-pointer transition-colors",
                          tab.current || location === tab.href
                            ? "border-amber-500 text-amber-600"
                            : "border-transparent text-amber-500 hover:text-amber-700 hover:border-amber-300"
                        )}
                      >
                        {tab.label}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}