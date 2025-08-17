import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/components/design-system";
import { useAuth } from "@/hooks/useAuth-simple";
import Welcome from "@/pages/welcome";
import Login from "@/pages/login";
import BookPickup from "@/pages/book-pickup";
import OrderStatus from "@/pages/order-status";
import Checkout from "@/pages/checkout";
import DriverPortal from "@/pages/driver-portal";
import DriverPayments from "@/pages/driver-payments";
import PaymentStructure from "@/pages/payment-structure";
import AdminDashboard from "@/pages/admin-dashboard";
import DriverOnboarding from "@/pages/driver-onboarding";
import About from "@/pages/about";

import MobileAppDemo from "@/pages/mobile-app-demo";
import MobileSimulator from "@/pages/mobile-simulator";
import LogoColors from "@/pages/logo-colors";
import BackgroundColors from "@/pages/background-colors";
import AdminPaymentTracking from "@/pages/admin-payment-tracking";
import DriverTutorial from "@/pages/driver-tutorial";
import DriverDocuments from "@/pages/driver-documents";
import HelpCenter from "@/pages/help-center";
import HelpArticle from "@/pages/help-article";
import FAQ from "@/pages/faq";
import CustomerMobileApp from "@/pages/customer-mobile-app";
import ReturnlyDriverApp from "@/pages/returnly-driver-app";
import NotFound from "@/pages/not-found";
import RealTimeTracking from "@/pages/real-time-tracking";
import DriverAnalytics from "@/pages/driver-analytics";
import CustomerRating from "@/pages/customer-rating";
import AdvancedReporting from "@/pages/advanced-reporting";
import MultiCityManagement from "@/pages/multi-city-management";
import EnhancedAnalyticsDashboard from "@/pages/enhanced-analytics-dashboard";
import CustomerServiceTickets from "@/pages/customer-service-tickets";
import BulkOrderImport from "@/pages/bulk-order-import";
import LoyaltyDashboard from "@/pages/loyalty-dashboard";
import DriverSafetyCenter from "@/pages/driver-safety-center";
import DriverPerformance from "@/pages/driver-performance";
import RouteOptimization from "@/pages/route-optimization";
import ChatCenter from "@/pages/chat-center";
import DriverJob from "@/pages/driver-job";
import RealTimeTrackingAdvanced from "@/pages/real-time-tracking-advanced";
import BusinessIntelligence from "@/pages/business-intelligence";
import NotificationCenter from "@/pages/notification-center";
import QualityAssurance from "@/pages/quality-assurance";
import DriverIncentives from "@/pages/driver-incentives";
import Profile from "@/pages/profile";
import FeatureDocumentGenerator from "@/pages/feature-document-generator";
import EmployeeGuide from "@/pages/employee-guide";
import EmployeeDashboard from "@/pages/employee-dashboard";
import EmployeeDocuments from "@/pages/employee-documents";
import DriverFeedbackSystem from "@/pages/driver-feedback-system";
import PrintableTemplates from "@/pages/printable-templates";
import CancellationAlerts from "@/pages/cancellation-alerts";
import RefundDemo from "@/pages/refund-demo";

function Router() {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  // Only show loading if actually loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <img 
              src="/logo-cardboard-deep.png" 
              alt="ReturnIt Logo" 
              className="h-16 w-auto mx-auto animate-pulse"
            />
          </div>
          <div className="space-y-2">
            <div className="w-32 h-2 bg-amber-200 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-amber-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <p className="text-amber-800 text-sm font-medium">Loading your experience...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/">
        {() => {
          // Check if admin user should go directly to dashboard
          const masterAdmins = ["nabeelmumtaz92@gmail.com", "durremumtaz@gmail.com"];
          if (user?.isAdmin && masterAdmins.includes(user?.email)) {
            // Use location.replace to avoid back button issues
            window.location.replace('/admin-dashboard');
            return null;
          }
          // Show welcome page for all other users (logged in or not)
          return <Welcome />;
        }}
      </Route>
      <Route path="/login" component={Login} />
      <Route path="/book-pickup" component={BookPickup} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-status/:orderId">
        {(params) => <OrderStatus orderId={params.orderId} />}
      </Route>
      <Route path="/driver-portal" component={DriverPortal} />
      <Route path="/driver-portal/job/:id" component={DriverJob} />
      <Route path="/driver-payments" component={DriverPayments} />
      <Route path="/driver-onboarding" component={DriverOnboarding} />
      <Route path="/driver-tutorial" component={DriverTutorial} />
      <Route path="/driver-documents" component={DriverDocuments} />
      <Route path="/help-center" component={HelpCenter} />
      <Route path="/help-article/:articleId">
        {(params) => <HelpArticle />}
      </Route>
      <Route path="/faq" component={FAQ} />
      <Route path="/admin-dashboard">
        {() => {
          const masterAdmins = ["nabeelmumtaz92@gmail.com", "durremumtaz@gmail.com"];
          return user?.isAdmin && masterAdmins.includes(user?.email) ? <AdminDashboard /> : <NotFound />;
        }}
      </Route>
      <Route path="/payment-structure" component={PaymentStructure} />
      <Route path="/admin-payment-tracking">
        {() => {
          // Admin only access
          if (!user?.isAdmin || user?.email !== "nabeelmumtaz92@gmail.com") {
            return <NotFound />;
          }
          return <AdminPaymentTracking />;
        }}
      </Route>
      <Route path="/about" component={About} />

      <Route path="/mobile-app-demo" component={MobileAppDemo} />
      <Route path="/mobile-simulator" component={MobileSimulator} />
      <Route path="/customer-mobile-app" component={CustomerMobileApp} />
      <Route path="/driver-mobile-app" component={ReturnlyDriverApp} />
      <Route path="/logo-colors" component={LogoColors} />
      <Route path="/background-colors" component={BackgroundColors} />
      <Route path="/real-time-tracking" component={RealTimeTracking} />
      <Route path="/driver-analytics" component={DriverAnalytics} />
      <Route path="/customer-rating" component={CustomerRating} />
      <Route path="/advanced-reporting">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <AdvancedReporting /> : <NotFound />}
      </Route>
      <Route path="/multi-city-management">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <MultiCityManagement /> : <NotFound />}
      </Route>
      <Route path="/customer-service-tickets">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <CustomerServiceTickets /> : <NotFound />}
      </Route>
      <Route path="/bulk-order-import">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <BulkOrderImport /> : <NotFound />}
      </Route>
      <Route path="/loyalty-dashboard">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <LoyaltyDashboard /> : <NotFound />}
      </Route>
      <Route path="/driver-safety-center">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <DriverSafetyCenter /> : <NotFound />}
      </Route>
      <Route path="/driver-performance">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <DriverPerformance /> : <NotFound />}
      </Route>
      <Route path="/route-optimization">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <RouteOptimization /> : <NotFound />}
      </Route>
      <Route path="/chat-center">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <ChatCenter /> : <NotFound />}
      </Route>
      <Route path="/real-time-tracking-advanced">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <RealTimeTrackingAdvanced /> : <NotFound />}
      </Route>
      <Route path="/business-intelligence">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <BusinessIntelligence /> : <NotFound />}
      </Route>
      <Route path="/notification-center">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <NotificationCenter /> : <NotFound />}
      </Route>
      <Route path="/quality-assurance">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <QualityAssurance /> : <NotFound />}
      </Route>
      <Route path="/driver-incentives">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <DriverIncentives /> : <NotFound />}
      </Route>
      <Route path="/enhanced-analytics">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <EnhancedAnalyticsDashboard /> : <NotFound />}
      </Route>
      <Route path="/profile" component={Profile} />
      <Route path="/feature-documents">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <FeatureDocumentGenerator /> : <NotFound />}
      </Route>

      {/* Admin Section Routes - Dynamic Content */}
      <Route path="/admin-orders">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <AdminDashboard section="order-management" /> : <NotFound />}
      </Route>
      <Route path="/admin-drivers">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <AdminDashboard section="driver-management" /> : <NotFound />}
      </Route>
      <Route path="/admin-tracking">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <AdminDashboard section="real-time-tracking" /> : <NotFound />}
      </Route>
      <Route path="/admin-support">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <AdminDashboard section="customer-support" /> : <NotFound />}
      </Route>
      <Route path="/admin-analytics">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <AdminDashboard section="analytics" /> : <NotFound />}
      </Route>
      <Route path="/admin-payments">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <AdminDashboard section="payment-tracking" /> : <NotFound />}
      </Route>
      <Route path="/admin-payouts">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <AdminDashboard section="payment-tracking" /> : <NotFound />}
      </Route>
      <Route path="/admin-chat">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <AdminDashboard section="customer-support" /> : <NotFound />}
      </Route>
      <Route path="/admin-support-analytics">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <AdminDashboard section="analytics" /> : <NotFound />}
      </Route>
      <Route path="/admin-reviews">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <AdminDashboard section="customer-support" /> : <NotFound />}
      </Route>
      <Route path="/admin-customers">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <AdminDashboard section="customer-management" /> : <NotFound />}
      </Route>
      <Route path="/admin-driver-applications">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <AdminDashboard section="driver-management" /> : <NotFound />}
      </Route>
      <Route path="/admin-access">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <AdminDashboard section="admin-access" /> : <NotFound />}
      </Route>
      <Route path="/admin-settings">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <AdminDashboard section="settings" /> : <NotFound />}
      </Route>
      <Route path="/business-profile">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <AdminDashboard section="business-profile" /> : <NotFound />}
      </Route>

      {/* Employee Routes */}
      <Route path="/employee-guide">
        {() => user ? <EmployeeGuide /> : <NotFound />}
      </Route>
      <Route path="/employee-dashboard">
        {() => user ? <EmployeeDashboard /> : <NotFound />}
      </Route>
      <Route path="/support-dashboard">
        {() => user ? <EmployeeDashboard role="support" /> : <NotFound />}
      </Route>
      <Route path="/employee-documents">
        {() => user ? <EmployeeDocuments /> : <NotFound />}
      </Route>
      <Route path="/driver-feedback-system">
        {() => {
          const masterAdmins = ["nabeelmumtaz92@gmail.com", "durremumtaz@gmail.com"];
          return user?.isAdmin && masterAdmins.includes(user?.email) ? <DriverFeedbackSystem /> : <NotFound />;
        }}
      </Route>
      <Route path="/printable-templates">
        {() => {
          const masterAdmins = ["nabeelmumtaz92@gmail.com", "durremumtaz@gmail.com"];
          return user?.isAdmin && masterAdmins.includes(user?.email) ? <PrintableTemplates /> : <NotFound />;
        }}
      </Route>
      <Route path="/cancellation-alerts">
        {() => {
          const masterAdmins = ["nabeelmumtaz92@gmail.com", "durremumtaz@gmail.com"];
          return user?.isAdmin && masterAdmins.includes(user?.email) ? <CancellationAlerts /> : <NotFound />;
        }}
      </Route>
      <Route path="/refund-demo" component={RefundDemo} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ToastProvider>
          <Toaster />
          <Router />
        </ToastProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
