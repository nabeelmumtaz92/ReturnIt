import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/components/design-system";
import { useAuth } from "@/hooks/useAuth-simple";
import { Suspense, lazy, useEffect } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Core pages (loaded immediately)
import Welcome from "@/pages/welcome";
import Login from "@/pages/login";
import BookPickup from "@/pages/book-pickup";
import OrderStatus from "@/pages/order-status";
import Checkout from "@/pages/checkout";
import DriverPortal from "@/pages/driver-portal";
import NotFound from "@/pages/not-found";

// Lazy-loaded components for better performance
const TrackingPage = lazy(() => import("@/pages/tracking"));
const AdminDashboard = lazy(() => import("@/pages/admin-dashboard"));
const CustomerDashboard = lazy(() => import("@/pages/customer-dashboard"));
const DriverPayments = lazy(() => import("@/pages/driver-payments"));
const PaymentStructure = lazy(() => import("@/pages/payment-structure"));
const DriverSignup = lazy(() => import("@/pages/driver-signup"));
const DriverOnboarding = lazy(() => import("@/pages/driver-onboarding"));
const CustomerWaitlist = lazy(() => import("@/pages/customer-waitlist"));
const AccountSettings = lazy(() => import("@/pages/account-settings"));
const About = lazy(() => import("@/pages/about"));
const Contact = lazy(() => import("@/pages/contact"));

// Admin and heavy components (lazy-loaded)
const MobileAppDemo = lazy(() => import("@/pages/mobile-app-demo"));
const MobileSimulator = lazy(() => import("@/pages/mobile-simulator"));
const MobileDriver = lazy(() => import("@/pages/mobile-driver"));
const LogoColors = lazy(() => import("@/pages/logo-colors"));
const BackgroundColors = lazy(() => import("@/pages/background-colors"));
const AdminPaymentTracking = lazy(() => import("@/pages/admin-payment-tracking"));
const DriverTutorial = lazy(() => import("@/pages/driver-tutorial"));
const DriverDocuments = lazy(() => import("@/pages/driver-documents"));
const HelpCenter = lazy(() => import("@/pages/help-center"));
const HelpArticle = lazy(() => import("@/pages/help-article"));
const FAQ = lazy(() => import("@/pages/faq"));
const CustomerMobileApp = lazy(() => import("@/pages/customer-mobile-app"));
const ReturnItDriverApp = lazy(() => import("@/pages/mobile-driver"));
const RealTimeTracking = lazy(() => import("@/pages/real-time-tracking"));

// Retailer Portal (lazy-loaded)
const RetailerDashboard = lazy(() => import("@/pages/retailer-dashboard"));
const RetailerRegister = lazy(() => import("@/pages/retailer-register"));
const RetailerAPIKeys = lazy(() => import("@/pages/retailer-api-keys"));
const RetailerWebhooks = lazy(() => import("@/pages/retailer-webhooks"));
const DriverAnalytics = lazy(() => import("@/pages/driver-analytics"));
const CustomerRating = lazy(() => import("@/pages/customer-rating"));
const AdvancedReporting = lazy(() => import("@/pages/advanced-reporting"));
const MultiCityManagement = lazy(() => import("@/pages/multi-city-management"));
const EnhancedAnalyticsDashboard = lazy(() => import("@/pages/enhanced-analytics-dashboard"));
const CustomerServiceTickets = lazy(() => import("@/pages/customer-service-tickets"));
const BulkOrderImport = lazy(() => import("@/pages/bulk-order-import"));
const LoyaltyDashboard = lazy(() => import("@/pages/loyalty-dashboard"));
const DriverSafetyCenter = lazy(() => import("@/pages/driver-safety-center"));
const DriverPerformance = lazy(() => import("@/pages/driver-performance"));
const RouteOptimization = lazy(() => import("@/pages/route-optimization"));
const ChatCenter = lazy(() => import("@/pages/chat-center"));
const DriverJob = lazy(() => import("@/pages/driver-job"));
const DriverCompleteDelivery = lazy(() => import("@/pages/driver-complete-delivery"));
const DriverCompleteGiftCardDelivery = lazy(() => import("@/pages/driver-complete-gift-card-delivery"));
const RealTimeTrackingAdvanced = lazy(() => import("@/pages/real-time-tracking-advanced"));
const BusinessIntelligence = lazy(() => import("@/pages/business-intelligence"));
const NotificationCenter = lazy(() => import("@/pages/notification-center"));
const QualityAssurance = lazy(() => import("@/pages/quality-assurance"));
const DriverIncentives = lazy(() => import("@/pages/driver-incentives"));
const Profile = lazy(() => import("@/pages/profile"));
const FeatureDocumentGenerator = lazy(() => import("@/pages/feature-document-generator"));
const EmployeeGuide = lazy(() => import("@/pages/employee-guide"));
const EmployeeDashboard = lazy(() => import("@/pages/employee-dashboard"));
const EmployeeDocuments = lazy(() => import("@/pages/employee-documents"));
const DriverFeedbackSystem = lazy(() => import("@/pages/driver-feedback-system"));
const PrintableTemplates = lazy(() => import("@/pages/printable-templates"));
const CancellationAlerts = lazy(() => import("@/pages/cancellation-alerts"));
const RefundDemo = lazy(() => import("@/pages/refund-demo"));
const PricingDemo = lazy(() => import("@/pages/pricing-demo"));
const PricingAnalysis = lazy(() => import("@/pages/pricing-analysis"));
const FailedReturnDemo = lazy(() => import("@/pages/failed-return-demo"));
const ComprehensivePricingExamples = lazy(() => import("@/pages/comprehensive-pricing-examples"));
const ComprehensiveGuidebook = lazy(() => import("@/pages/comprehensive-guidebook"));
const TermsOfService = lazy(() => import("@/pages/terms-of-service"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const CostMonitoring = lazy(() => import("@/pages/cost-monitoring"));
const MonitoringDashboard = lazy(() => import("@/pages/monitoring-dashboard"));

// Loading component for Suspense
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="relative">
        <div className="text-3xl font-bold text-amber-900 mx-auto animate-pulse">
          Return It
        </div>
      </div>
      <div className="space-y-2">
        <div className="w-32 h-2 bg-amber-200 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-amber-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
        <p className="text-amber-800 text-sm font-medium">Loading page...</p>
      </div>
    </div>
  </div>
);

// Smart route handler component that manages redirects properly
function SmartRouteHandler() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    try {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const masterAdmins = ["nabeelmumtaz92@gmail.com", "durremumtaz@gmail.com", "nabeelmumtaz4.2@gmail.com"];
      
      // Smart routing based on user role and device
      if (user && isAuthenticated) {
        if (user.isAdmin && masterAdmins.includes(user.email)) {
          // Admins go to dashboard
          setLocation('/admin-dashboard');
          return;
        } else if (user.isDriver) {
          // Drivers go to driver portal on desktop, stay on mobile driver app if on mobile
          if (!isMobile) {
            setLocation('/driver-portal');
            return;
          }
        }
      }
    } catch (error) {
      console.error('Smart routing error:', error);
    }
  }, [user, isAuthenticated, setLocation]);

  // Determine what to render based on current state
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (user && isAuthenticated) {
    if (user.isDriver && isMobile) {
      // Mobile drivers get the driver mobile app
      return <MobileDriver />;
    } else if (!user.isDriver && !user.isAdmin && isMobile) {
      // Mobile customers get the customer mobile app
      return <CustomerMobileApp />;
    }
  }

  // Default to welcome page for all users (desktop and mobile)
  return <Welcome />;
}

function Router() {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  // Only show loading if actually loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="text-3xl font-bold text-amber-900 mx-auto animate-pulse">
              Return It
            </div>
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
    <Suspense fallback={<PageLoader />}>
      <Switch>
      <Route path="/">
        {() => <SmartRouteHandler />}
      </Route>
      <Route path="/login" component={Login} />
      <Route path="/book-pickup" component={BookPickup} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/track" component={TrackingPage} />
      <Route path="/order-status/:orderId">
        {(params) => <OrderStatus orderId={params.orderId} />}
      </Route>
      <Route path="/driver-portal" component={DriverPortal} />
      <Route path="/driver-portal/job/:id" component={DriverJob} />
      <Route path="/driver/complete/:orderId" component={DriverCompleteDelivery} />
      <Route path="/driver/complete-gift-card/:orderId" component={DriverCompleteGiftCardDelivery} />
      <Route path="/driver-payments" component={DriverPayments} />
      <Route path="/driver-signup" component={DriverSignup} />
      <Route path="/driver-onboarding" component={DriverOnboarding} />
      <Route path="/customer-waitlist" component={CustomerWaitlist} />
      <Route path="/account-settings" component={AccountSettings} />
      <Route path="/driver-tutorial" component={DriverTutorial} />
      <Route path="/driver-documents" component={DriverDocuments} />
      <Route path="/help-center" component={HelpCenter} />
      <Route path="/help-article/:articleId">
        {(params) => <HelpArticle />}
      </Route>
      <Route path="/faq" component={FAQ} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/admin-dashboard*">
        {() => {
          // Show loading while auth is being checked
          if (isLoading) {
            return <PageLoader />;
          }
          
          const masterAdmins = ["nabeelmumtaz92@gmail.com", "durremumtaz@gmail.com", "nabeelmumtaz4.2@gmail.com"];
          
          // Check if user is authenticated and is admin
          if (!user || !isAuthenticated) {
            // Not logged in - redirect to login
            if (typeof window !== 'undefined') {
              window.location.replace('/login');
            }
            return null;
          }
          
          // Check if user has admin privileges
          if (user.isAdmin && masterAdmins.includes(user.email)) {
            return <AdminDashboard />;
          }
          
          // User is logged in but not an admin
          return <NotFound />;
        }}
      </Route>
      <Route path="/customer-dashboard">
        {() => {
          // Customer dashboard is available to all authenticated users who are not drivers or admins
          return user && isAuthenticated && !user.isDriver && !user.isAdmin ? <CustomerDashboard /> : <NotFound />;
        }}
      </Route>

      {/* Retailer Portal Routes */}
      <Route path="/retailer/dashboard">
        {() => {
          // Retailer dashboard is available to all authenticated users
          if (!user || !isAuthenticated) {
            if (typeof window !== 'undefined') {
              window.location.replace('/login');
            }
            return null;
          }
          return <RetailerDashboard />;
        }}
      </Route>
      <Route path="/retailer/register">
        {() => {
          // Retailer registration is available to all authenticated users
          if (!user || !isAuthenticated) {
            if (typeof window !== 'undefined') {
              window.location.replace('/login');
            }
            return null;
          }
          return <RetailerRegister />;
        }}
      </Route>
      <Route path="/retailer/companies/:companyId/api-keys">
        {() => {
          if (!user || !isAuthenticated) {
            if (typeof window !== 'undefined') {
              window.location.replace('/login');
            }
            return null;
          }
          return <RetailerAPIKeys />;
        }}
      </Route>
      <Route path="/retailer/companies/:companyId/webhooks">
        {() => {
          if (!user || !isAuthenticated) {
            if (typeof window !== 'undefined') {
              window.location.replace('/login');
            }
            return null;
          }
          return <RetailerWebhooks />;
        }}
      </Route>

      <Route path="/payment-structure" component={PaymentStructure} />
      <Route path="/admin-payment-tracking">
        {() => {
          // Admin access required
          if (!user?.isAdmin) {
            return <NotFound />;
          }
          return <AdminPaymentTracking />;
        }}
      </Route>
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />

      {/* Smart App Routing */}
      <Route path="/customer-app">
        {() => <CustomerMobileApp />}
      </Route>
      <Route path="/driver-app">
        {() => {
          // Drivers only
          if (!user?.isDriver && !user?.isAdmin) {
            if (typeof window !== 'undefined') {
              window.location.replace('/login');
              return null;
            }
          }
          return <MobileDriver />;
        }}
      </Route>
      <Route path="/admin-app">
        {() => {
          // Admins only
          const masterAdmins = ["nabeelmumtaz92@gmail.com", "durremumtaz@gmail.com", "nabeelmumtaz4.2@gmail.com"];
          if (!user?.isAdmin || !masterAdmins.includes(user?.email)) {
            if (typeof window !== 'undefined') {
              window.location.replace('/login');
              return null;
            }
          }
          if (typeof window !== 'undefined') {
            window.location.replace('/admin-dashboard');
            return null;
          }
        }}
      </Route>
      
      {/* Legacy mobile routes for backward compatibility */}
      <Route path="/mobile-app-demo" component={MobileAppDemo} />
      <Route path="/mobile-simulator" component={MobileSimulator} />
      <Route path="/mobile-driver" component={MobileDriver} />
      <Route path="/customer-mobile-app" component={CustomerMobileApp} />
      <Route path="/driver-mobile-app" component={ReturnItDriverApp} />
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
      <Route path="/cost-monitoring">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <CostMonitoring /> : <NotFound />}
      </Route>
      <Route path="/monitoring-dashboard">
        {() => user?.isAdmin && user?.email === "nabeelmumtaz92@gmail.com" ? <MonitoringDashboard /> : <NotFound />}
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
      {/* Demo Routes - Master Admin Access Only */}
      <Route path="/refund-demo">
        {() => {
          const masterAdmins = ["nabeelmumtaz92@gmail.com", "durremumtaz@gmail.com"];
          return user?.isAdmin && masterAdmins.includes(user?.email) ? <RefundDemo /> : <NotFound />;
        }}
      </Route>
      <Route path="/pricing-demo">
        {() => {
          const masterAdmins = ["nabeelmumtaz92@gmail.com", "durremumtaz@gmail.com"];
          return user?.isAdmin && masterAdmins.includes(user?.email) ? <PricingDemo /> : <NotFound />;
        }}
      </Route>
      <Route path="/pricing-analysis">
        {() => {
          const masterAdmins = ["nabeelmumtaz92@gmail.com", "durremumtaz@gmail.com"];
          return user?.isAdmin && masterAdmins.includes(user?.email) ? <PricingAnalysis /> : <NotFound />;
        }}
      </Route>
      <Route path="/failed-return-demo">
        {() => {
          const masterAdmins = ["nabeelmumtaz92@gmail.com", "durremumtaz@gmail.com"];
          return user?.isAdmin && masterAdmins.includes(user?.email) ? <FailedReturnDemo /> : <NotFound />;
        }}
      </Route>

      {/* Internal Only Routes - Master Admin Access Only */}
      <Route path="/internal/pricing-examples">
        {() => {
          const masterAdmins = ["nabeelmumtaz92@gmail.com", "durremumtaz@gmail.com"];
          return user?.isAdmin && masterAdmins.includes(user?.email) ? <ComprehensivePricingExamples /> : <NotFound />;
        }}
      </Route>
      <Route path="/internal/guidebooks">
        {() => {
          const masterAdmins = ["nabeelmumtaz92@gmail.com", "durremumtaz@gmail.com"];
          return user?.isAdmin && masterAdmins.includes(user?.email) ? <ComprehensiveGuidebook /> : <NotFound />;
        }}
      </Route>

      {/* Mobile App Fallback Route */}
      <Route path="/mobile">
        {() => {
          // Detect if user is on mobile and redirect to appropriate experience
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          if (isMobile) {
            return <BookPickup />;
          }
          return <Welcome />;
        }}
      </Route>
      
      {/* Catch-all route - always keep this last */}
      <Route>
        {(params) => {
          console.log('404 route accessed:', params, window.location);
          // For mobile devices, redirect to booking instead of showing 404
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          if (isMobile && window.location.pathname !== '/') {
            window.location.replace('/');
            return null;
          }
          return <NotFound />;
        }}
      </Route>
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Additional error reporting can go here
        console.error('App-level error caught:', error, errorInfo);
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ToastProvider>
            <ErrorBoundary>
              <Toaster />
              <Router />
            </ErrorBoundary>
          </ToastProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
