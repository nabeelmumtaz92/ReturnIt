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
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading } = useAuth();
  
  // Only show loading if actually loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-200 via-yellow-100 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <img 
            src="/logo-cardboard-deep.png" 
            alt="Returnly Logo" 
            className="h-16 w-auto mx-auto mb-4 animate-pulse"
          />
          <p className="text-amber-800">Loading...</p>
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
      <Route path="/driver-payments" component={DriverPayments} />
      <Route path="/driver-onboarding" component={DriverOnboarding} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/payment-structure" component={PaymentStructure} />
      <Route path="/about" component={About} />
      <Route path="/design-system-demo" component={DesignSystemDemo} />
      <Route path="/mobile-app-demo" component={MobileAppDemo} />
      <Route path="/logo-colors" component={LogoColors} />
      <Route path="/background-colors" component={BackgroundColors} />
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
