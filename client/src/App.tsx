import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/components/design-system";
import Welcome from "@/pages/welcome";
import Login from "@/pages/login";
import BookPickup from "@/pages/book-pickup";
import OrderStatus from "@/pages/order-status";
import DesignSystemDemo from "@/pages/design-system-demo";
import MobileAppDemo from "@/pages/mobile-app-demo";
import LogoColors from "@/pages/logo-colors";
import BackgroundColors from "@/pages/background-colors";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route path="/login" component={Login} />
      <Route path="/book-pickup" component={BookPickup} />
      <Route path="/order-status/:orderId" component={OrderStatus} />
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
