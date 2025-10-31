import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Package,
  Truck,
  Users,
  DollarSign,
  BarChart3,
  FileText,
  Clock,
  MapPin,
  Bell,
  Users2,
  Monitor,
  HeadphonesIcon,
  Star,
  MessageCircle,
  Settings,
  LayoutDashboard,
  UserCheck,
  Building2,
  PieChart,
  CreditCard,
  TrendingUp
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="h-5 w-5" /> },
    ]
  },
  {
    title: "Operations",
    items: [
      { label: "Orders", href: "/admin/orders", icon: <Package className="h-5 w-5" /> },
      { label: "Drivers", href: "/admin/drivers", icon: <Truck className="h-5 w-5" /> },
      { label: "Driver Applications", href: "/admin/driver-applications", icon: <UserCheck className="h-5 w-5" /> },
      { label: "Customers", href: "/admin/customers", icon: <Users className="h-5 w-5" /> },
      { label: "Driver Locations", href: "/admin/driver-locations", icon: <MapPin className="h-5 w-5" /> },
    ]
  },
  {
    title: "Financial",
    items: [
      { label: "Driver Payouts", href: "/admin/payouts", icon: <DollarSign className="h-5 w-5" /> },
      { label: "Tax Reports", href: "/admin/tax-reports", icon: <FileText className="h-5 w-5" /> },
      { label: "Payment Tracking", href: "/admin/payment-tracking", icon: <Clock className="h-5 w-5" /> },
      { label: "Transactions", href: "/admin/transactions", icon: <CreditCard className="h-5 w-5" /> },
      { label: "Financial Ops", href: "/admin/financial-operations", icon: <TrendingUp className="h-5 w-5" /> },
    ]
  },
  {
    title: "Analytics",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: <BarChart3 className="h-5 w-5" /> },
      { label: "Business Intelligence", href: "/admin/business-intelligence", icon: <PieChart className="h-5 w-5" /> },
      { label: "System Metrics", href: "/admin/system-metrics", icon: <Monitor className="h-5 w-5" /> },
    ]
  },
  {
    title: "Support",
    items: [
      { label: "Support Center", href: "/admin/support", icon: <HeadphonesIcon className="h-5 w-5" /> },
      { label: "Customer Feedback", href: "/admin/feedback", icon: <Star className="h-5 w-5" /> },
      { label: "Live Chat", href: "/admin/chat", icon: <MessageCircle className="h-5 w-5" /> },
    ]
  },
  {
    title: "Management",
    items: [
      { label: "Notifications", href: "/admin/notifications", icon: <Bell className="h-5 w-5" /> },
      { label: "Employees", href: "/admin/employees", icon: <Users2 className="h-5 w-5" /> },
      { label: "Operations", href: "/admin/operations", icon: <Building2 className="h-5 w-5" /> },
      { label: "Settings", href: "/admin/settings", icon: <Settings className="h-5 w-5" /> },
    ]
  }
];

export function AdminNav() {
  const [location] = useLocation();

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 border-r border-[#B8956A]/20 bg-white/50 backdrop-blur-sm">
      <ScrollArea className="w-full">
        <div className="p-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                {section.title}
              </h3>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location === item.href || 
                    (item.href !== "/admin" && location.startsWith(item.href));
                  
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                          isActive
                            ? "bg-[#B8956A]/10 text-[#B8956A] border border-[#B8956A]/20"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                        data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto text-xs bg-red-500 text-white rounded-full px-2 py-0.5">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </nav>
              {idx < navSections.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
