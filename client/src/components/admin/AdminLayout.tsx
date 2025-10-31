import { useAuth } from "@/hooks/useAuth-simple";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, Bell } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminNav } from "./AdminNav";
import NotificationBell from "@/components/NotificationBell";
import { useAdminWebSocket } from "@/hooks/useAdminWebSocket";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import ContactSupportButton from "@/components/ContactSupportButton";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout, isLoading } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();

  // Master admin emails
  const masterAdmins = [
    "nabeelmumtaz92@gmail.com",
    "durremumtaz@gmail.com",
    "nabeelmumtaz4.2@gmail.com",
    "admin@returnit.com",
    "testadmin@returnit.test",
    "demo@returnit.demo"
  ];

  // Real-time admin notifications via WebSocket (disabled for now)
  // useAdminWebSocket({
  //   onMessage: (message) => {
  //     if (message.type === 'admin_notification') {
  //       const { title, description, variant } = message.data;
  //       toast({
  //         title: title || "Update",
  //         description: description || "New system event",
  //         variant: variant || "default",
  //       });
  //     }
  //   },
  //   onConnect: () => {
  //     console.log('✅ Admin WebSocket connected');
  //   },
  //   onDisconnect: () => {
  //     console.log('🔌 Admin WebSocket disconnected');
  //   }
  // });

  // Show loading while auth check is in progress
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F4]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#B8956A] mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // SECURITY: Redirect non-admins immediately
  if (!user || !user.isAdmin || !masterAdmins.includes(user.email)) {
    console.error('🚫 [SECURITY] Unauthorized admin dashboard access attempt:', {
      userEmail: user?.email || 'none',
      isAdmin: user?.isAdmin || false,
      timestamp: new Date().toISOString()
    });
    
    if (typeof window !== 'undefined') {
      window.location.replace('/');
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f5] via-[#fdfcf9] to-[#f8f7f5] dark:from-[#231b0f] dark:via-[#2c2215] dark:to-[#231b0f]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-white/95 via-white/98 to-white/95 backdrop-blur-md border-b border-[#B8956A]/20 shadow-sm">
        <div className="flex items-center justify-between p-4 gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link href="/">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#B8956A] to-[#8B6F47] bg-clip-text text-transparent hover:from-[#A0805A] hover:to-[#7a5f3d] transition-all cursor-pointer whitespace-nowrap">
                Return It
              </h1>
            </Link>
            <span className="text-[#B8956A]/40 hidden sm:inline">|</span>
            <Link href="/admin">
              <h2 className="text-base sm:text-xl font-semibold text-foreground hover:text-[#B8956A] transition-colors cursor-pointer truncate">
                Admin Dashboard
              </h2>
            </Link>
            <Badge className="bg-gradient-to-r from-[#B8956A] to-[#A0805A] text-white border-0 shadow-sm hidden md:inline-flex">
              Master Admin
            </Badge>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <RoleSwitcher />
            <NotificationBell />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={logout}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all"
              data-testid="button-signout-admin"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
            <Link href="/">
              <Button variant="default" size="sm" className="bg-gradient-to-r from-[#B8956A] to-[#A0805A] hover:from-[#A0805A] hover:to-[#8B6F47] text-white shadow-sm">
                <span className="hidden sm:inline">Back to Site</span>
                <span className="sm:hidden">Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar Navigation */}
        <AdminNav />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Contact Support Button */}
      <ContactSupportButton />
    </div>
  );
}
