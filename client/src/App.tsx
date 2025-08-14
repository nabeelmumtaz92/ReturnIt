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
import DesignSystemDemo from "@/pages/design-system-demo";
import MobileAppDemo from "@/pages/mobile-app-demo";
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
import CustomerServiceTickets from "@/pages/customer-service-tickets";
import BulkOrderImport from "@/pages/bulk-order-import";
import LoyaltyDashboard from "@/pages/loyalty-dashboard";
import DriverSafetyCenter from "@/pages/driver-safety-center";
import DriverPerformance from "@/pages/driver-performance";
import RouteOptimization from "@/pages/route-optimization";
import ChatCenter from "@/pages/chat-center";
import DriverJob from "@/pages/driver-job";

function Router() {
  const { user, isLoading } = useAuth();
  
  // Only show loading if actually loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <img 
              src="/logo-cardboard-deep.png" 
              alt="Returnly Logo" 
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
      <Route path="/" component={Welcome} />
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
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/payment-structure" component={PaymentStructure} />
      <Route path="/admin-payment-tracking" component={AdminPaymentTracking} />
      <Route path="/about" component={About} />
      <Route path="/design-system-demo" component={DesignSystemDemo} />
      <Route path="/mobile-app-demo" component={MobileAppDemo} />
      <Route path="/customer-mobile-app" component={CustomerMobileApp} />
      <Route path="/driver-mobile-app" component={ReturnlyDriverApp} />
      <Route path="/logo-colors" component={LogoColors} />
      <Route path="/background-colors" component={BackgroundColors} />
      <Route path="/real-time-tracking" component={RealTimeTracking} />
      <Route path="/driver-analytics" component={DriverAnalytics} />
      <Route path="/customer-rating" component={CustomerRating} />
      <Route path="/advanced-reporting" component={AdvancedReporting} />
      <Route path="/multi-city-management" component={MultiCityManagement} />
      <Route path="/customer-service-tickets" component={CustomerServiceTickets} />
      <Route path="/bulk-order-import" component={BulkOrderImport} />
      <Route path="/loyalty-dashboard" component={LoyaltyDashboard} />
      <Route path="/driver-safety-center" component={DriverSafetyCenter} />
      <Route path="/driver-performance" component={DriverPerformance} />
      <Route path="/route-optimization" component={RouteOptimization} />
      <Route path="/chat-center" component={ChatCenter} />
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
