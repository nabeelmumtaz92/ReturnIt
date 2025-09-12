import { useState, ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Home, Users, Truck, DollarSign, FileText, BarChart3, 
  Settings, MessageSquare, Star, Package, UserCheck, 
  Activity, Clock, Shield, Globe, Heart, Headphones,
  ChevronRight, Menu, X, Building2, Bell, LogOut, RefreshCw,
  PieChart, CreditCard, Zap, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ReturnItLogo } from '@/components/ReturnItLogo';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth-simple';
import NotificationBell from '@/components/NotificationBell';

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
    title: "Dashboard & Overview",
    items: [
      {
        label: "Admin Dashboard",
        href: "/admin-dashboard",
        icon: Home,
        description: "Overview and key metrics"
      }
    ]
  },
  {
    title: "Business Operations Center",
    items: [
      {
        label: "Order Management",
        href: "/admin-dashboard?section=orders",
        icon: Package,
        description: "Track and manage all orders"
      },
      {
        label: "Driver Management", 
        href: "/admin-dashboard?section=drivers",
        icon: Truck,
        description: "Driver onboarding and oversight"
      },
      {
        label: "Customer Management",
        href: "/admin-dashboard?section=customers",
        icon: Users,
        description: "Customer accounts and support"
      },
      {
        label: "Real-time Tracking",
        href: "/admin-dashboard?section=driver-locations",
        icon: Activity,
        description: "Live order and driver tracking"
      }
    ]
  },
  {
    title: "Master Admin Panel - Analytics",
    items: [
      {
        label: "Business Intelligence",
        href: "/admin-dashboard?section=business-intelligence", 
        icon: PieChart,
        description: "Executive reporting & self-serve analytics"
      },
      {
        label: "Performance Analytics",
        href: "/admin-dashboard?section=analytics",
        icon: BarChart3,
        description: "Detailed performance metrics"
      },
      {
        label: "Support Analytics", 
        href: "/admin-dashboard?section=support-analytics",
        icon: BarChart3,
        description: "Support performance metrics & quality analysis"
      }
    ]
  },
  {
    title: "Master Admin Panel - Financial",
    items: [
      {
        label: "Financial Operations",
        href: "/admin-dashboard?section=financial-operations",
        icon: DollarSign,
        description: "One-stop hub for finance workflows"
      },
      {
        label: "Transaction Management",
        href: "/admin-dashboard?section=transaction-management",
        icon: CreditCard,
        description: "Customer charges, refunds & risk assessment"
      },
      {
        label: "Enhanced Driver Payouts",
        href: "/admin-dashboard?section=enhanced-driver-payouts", 
        icon: Zap,
        description: "Advanced payout management with instant pay"
      },
      {
        label: "Enhanced Tax Reports",
        href: "/admin-dashboard?section=enhanced-tax-reports",
        icon: FileText,
        description: "1099-NEC generation, VAT/GST & automated filing"
      },
      {
        label: "Payment Tracking",
        href: "/admin-dashboard?section=payment-tracking",
        icon: Clock,
        description: "End-to-end visibility from quote to settlement"
      }
    ]
  },
  {
    title: "Master Admin Panel - Support",
    items: [
      {
        label: "Support Center",
        href: "/admin-dashboard?section=support-center",
        icon: Headphones,
        description: "Real-time assistance hub with live chat"
      },
      {
        label: "Customer Feedback",
        href: "/admin-dashboard?section=customer-feedback",
        icon: Star,
        description: "VOC system with sentiment analysis"
      },
      {
        label: "Live Support Chat",
        href: "/admin-dashboard?section=chat",
        icon: MessageSquare,
        description: "Real-time customer support"
      }
    ]
  },
  {
    title: "Legacy Operations",
    items: [
      {
        label: "Driver Payouts (Legacy)",
        href: "/admin-dashboard?section=payouts", 
        icon: UserCheck,
        description: "Basic driver payment processing"
      },
      {
        label: "Tax Reports (Legacy)",
        href: "/admin-dashboard?section=tax-reports",
        icon: FileText,
        description: "Basic 1099 forms & tax compliance"
      },
      {
        label: "Notifications",
        href: "/admin-dashboard?section=notifications",
        icon: Bell,
        description: "System alerts and notification management"
      }
    ]
  },
  {
    title: "System Administration",
    items: [
      {
        label: "System Metrics",
        href: "/admin-dashboard?section=system-metrics",
        icon: Activity,
        description: "Real-time server performance monitoring"
      },
      {
        label: "Zone Management",
        href: "/admin-dashboard?section=zone-management",
        icon: Globe,
        description: "Regional manager territories"
      },
      {
        label: "Platform Settings",
        href: "/admin-dashboard?section=operations",
        icon: Settings,
        description: "Platform configuration"
      }
    ]
  }
];

export function AdminLayout({ children, pageTitle, tabs = [] }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location] = useLocation();
  
  // Check if we're on a section page
  const currentParams = new URLSearchParams(window.location.search);
  const currentSection = currentParams.get('section');
  const showBackButton = location.includes('/admin-dashboard') && currentSection;
  const { logout } = useAuth();

  const handleGlobalUpdate = async () => {
    // Trigger real-time updates across all dashboard components
    const updateEvent = new CustomEvent('dashboardUpdate', {
      detail: { timestamp: Date.now(), source: 'admin-tools' }
    });
    window.dispatchEvent(updateEvent);
    
    // Show visual feedback
    const updateButton = document.querySelector('[data-testid="admin-update-button"]');
    if (updateButton) {
      updateButton.classList.add('animate-spin');
      setTimeout(() => {
        updateButton.classList.remove('animate-spin');
      }, 1000);
    }
  };

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
    // Handle both direct URLs and section-based URLs
    if (href.includes('?section=')) {
      const sectionParam = href.split('?section=')[1];
      const currentParams = new URLSearchParams(window.location.search);
      const currentSection = currentParams.get('section');
      return location.includes('/admin-dashboard') && currentSection === sectionParam;
    }
    return location === href;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Admin Bar */}
      <div className="bg-white border-b border-amber-200 shadow-sm py-2 px-6 flex justify-end items-center relative z-50">
        {/* Right side controls with labels */}
        <div className="flex items-center space-x-3">
          <Link href="/admin-dashboard">
            <span className="font-semibold text-sm text-amber-700 cursor-pointer hover:text-amber-900 transition-colors">Admin Dashboard</span>
          </Link>
          <span className="text-sm text-amber-700">•</span>
          <span className="text-sm text-amber-700">Business Operations Center</span>
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
            <DropdownMenuItem onClick={handleGlobalUpdate}>
              <RefreshCw className="h-4 w-4 mr-2" data-testid="admin-update-button" />
              Update
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notification Bell */}
        <NotificationBell />

        {/* Sign Out */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={logout}
          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          data-testid="button-signout-admin"
        >
          <LogOut className="h-4 w-4 mr-2" />
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
        "fixed left-0 top-12 z-40 h-[calc(100vh-3rem)] bg-white shadow-xl border-r border-amber-200 transition-all duration-300",
        sidebarOpen ? "w-80" : "w-16"
      )}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-amber-200">
          <div className={cn("flex items-center gap-3", !sidebarOpen && "justify-center")}>
            
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
        <div className="flex-1 overflow-y-auto p-4 space-y-6 max-h-[calc(100vh-8rem)]">
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

      {/* Page Header */}
      <div className={cn(
        "bg-white border-b border-amber-200 shadow-sm transition-all duration-300 pt-12",
        sidebarOpen ? "ml-80" : "ml-16"
      )}>
        <div className="px-6 py-4">
          <div>
            <div className="flex items-center gap-3">
              {showBackButton && (
                <Link href="/admin-dashboard">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-amber-900 hover:bg-amber-50"
                    data-testid="button-back-dashboard"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Dashboard
                  </Button>
                </Link>
              )}
              <h1 className="text-2xl font-bold text-amber-900">{pageTitle}</h1>
            </div>
            <div className="text-sm text-amber-600 mt-1">
              {getCurrentSection()} • {new Date().toLocaleDateString()}
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

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        sidebarOpen ? "ml-80" : "ml-16"
      )}>
        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}