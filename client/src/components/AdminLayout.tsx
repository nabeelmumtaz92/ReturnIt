import { useState, ReactNode, useEffect, useCallback, useRef } from 'react';
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
  changeSection?: (section: string) => void;
  currentSection?: string;
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
        label: "Driver Applications", 
        href: "/admin-dashboard?section=driver-applications",
        icon: UserCheck,
        description: "Manual driver approval and review"
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

export function AdminLayout({ children, pageTitle, changeSection, currentSection: activeSectionProp, tabs = [] }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320); // Default 320px (w-80 equivalent)
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);
  const [location, setLocation] = useLocation();
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  // Load sidebar width from localStorage on mount
  useEffect(() => {
    const savedWidth = localStorage.getItem('adminSidebarWidth');
    if (savedWidth) {
      const width = parseInt(savedWidth, 10);
      if (width >= 200 && width <= 500) {
        setSidebarWidth(width);
      }
    }
  }, []);

  // Save sidebar width to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('adminSidebarWidth', sidebarWidth.toString());
  }, [sidebarWidth]);

  // Mouse event handlers for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartWidth.current = sidebarWidth;
  }, [sidebarWidth]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartX.current;
    const newWidth = Math.max(200, Math.min(500, dragStartWidth.current + deltaX));
    setSidebarWidth(newWidth);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Track navigation history for admin panel
  useEffect(() => {
    const currentPath = location + window.location.search;
    
    // Only track admin dashboard pages and don't track duplicates
    if (currentPath.includes('/admin-dashboard') && 
        navigationHistory[navigationHistory.length - 1] !== currentPath) {
      setNavigationHistory(prev => {
        const newHistory = [...prev, currentPath];
        // Keep only last 10 pages in history
        if (newHistory.length > 10) {
          return newHistory.slice(-10);
        }
        return newHistory;
      });
    }
  }, [location, navigationHistory]);

  // Global mouse event listeners for drag functionality
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  // Check if we're on a section page
  const currentParams = new URLSearchParams(window.location.search);
  const currentSection = currentParams.get('section');
  const showBackButton = location.includes('/admin-dashboard') && currentSection;
  const { logout } = useAuth();

  // Function to handle going back to previous admin panel page
  const handleAdminBack = () => {
    if (navigationHistory.length >= 2) {
      // Get the previous page (second to last in history)
      const previousPage = navigationHistory[navigationHistory.length - 2];
      
      // Remove the current page and the page we're going back to from history
      setNavigationHistory(prev => prev.slice(0, -2));
      
      // Navigate to the previous page
      setLocation(previousPage);
    }
  };

  const hasBackHistory = navigationHistory.length >= 2;

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
      <div className="bg-white border-b border-amber-200 shadow-sm py-2 px-6 flex justify-between lg:justify-end items-center relative z-50">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden text-amber-600 hover:text-amber-900 hover:bg-amber-50"
        >
          <Menu className="h-4 w-4" />
          <span className="ml-2 text-sm">Menu</span>
        </Button>
        
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

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed left-0 top-12 z-40 h-[calc(100vh-3rem)] bg-white shadow-xl border-r border-amber-200 transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:block`}
        style={{ 
          width: sidebarOpen || window.innerWidth >= 1024 ? `${sidebarWidth}px` : '64px'
        }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-amber-200">
          <div className={cn("flex items-center gap-3", !sidebarOpen && "justify-center")}>
            
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-amber-600 hover:text-amber-900 hover:bg-amber-50"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            {/* Separator line */}
            {sidebarOpen && hasBackHistory && (
              <div className="h-4 w-px bg-amber-300 mx-1"></div>
            )}
            {/* Back button */}
            {sidebarOpen && hasBackHistory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAdminBack}
                className="text-amber-600 hover:text-amber-900 hover:bg-amber-50"
                title="Go back to previous admin page"
                data-testid="button-admin-back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
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
                {section.items.map((item) => {
                  // Extract section from href (e.g., "?section=orders" -> "orders")
                  const getSectionFromHref = (href: string) => {
                    if (href === '/admin-dashboard') return 'overview';
                    const match = href.match(/section=([^&]+)/);
                    return match ? match[1] : 'overview';
                  };
                  
                  const sectionName = getSectionFromHref(item.href);
                  const isActive = activeSectionProp === sectionName;
                  
                  return (
                    <div
                      key={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer group",
                        isActive
                          ? "bg-amber-100 text-amber-900 border border-amber-200"
                          : "text-amber-700 hover:bg-amber-50 hover:text-amber-900"
                      )}
                      title={!sidebarOpen ? item.label : undefined}
                      onClick={() => changeSection && changeSection(sectionName)}
                    >
                      <item.icon className={cn("h-4 w-4 flex-shrink-0", 
                        isActive ? "text-amber-700" : "text-amber-600"
                      )} />
                      {sidebarOpen && (
                        <>
                          <div className="flex-1">
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs text-amber-600 mt-0.5">
                              {item.description}
                            </div>
                          </div>
                          {isActive && (
                            <ChevronRight className="h-4 w-4 text-amber-600" />
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
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

        {/* Resize Handle */}
        {sidebarOpen && (
          <div
            className={cn(
              "absolute right-0 top-0 bottom-0 w-1 bg-transparent hover:bg-amber-300 cursor-col-resize transition-colors duration-200 group",
              isDragging && "bg-amber-400"
            )}
            onMouseDown={handleMouseDown}
            data-testid="sidebar-resize-handle"
          >
            {/* Visual indicator */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-12 bg-amber-200 group-hover:bg-amber-400 transition-colors duration-200 rounded-l" />
          </div>
        )}
      </div>

      {/* Page Header */}
      <div 
        className="bg-white border-b border-amber-200 shadow-sm transition-all duration-300 pt-12 lg:ml-16"
        style={{
          marginLeft: sidebarOpen && window.innerWidth >= 1024 ? `${sidebarWidth}px` : undefined
        }}
      >
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
      <div 
        className="transition-all duration-300 lg:ml-16"
        style={{
          marginLeft: sidebarOpen && window.innerWidth >= 1024 ? `${sidebarWidth}px` : undefined
        }}
      >
        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}