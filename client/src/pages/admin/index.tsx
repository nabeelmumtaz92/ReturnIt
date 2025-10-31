import { Route, Switch } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminOverview from "./overview";
import AdminOrders from "./orders";
import AdminDrivers from "./drivers";
import DriverApplications from "./driver-applications";
import Customers from "./customers";
import DriverLocations from "./driver-locations";
import Payouts from "./payouts";
import TaxReports from "./tax-reports";
import PaymentTracking from "./payment-tracking";
import Transactions from "./transactions";
import FinancialOperations from "./financial-operations";
import Analytics from "./analytics";
import BusinessIntelligence from "./business-intelligence";
import SystemMetrics from "./system-metrics";
import Support from "./support";
import Feedback from "./feedback";
import Chat from "./chat";
import Notifications from "./notifications";
import Employees from "./employees";
import Operations from "./operations";
import Settings from "./settings";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminRoutes() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={AdminOverview} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/drivers" component={AdminDrivers} />
        <Route path="/admin/driver-applications" component={DriverApplications} />
        <Route path="/admin/customers" component={Customers} />
        <Route path="/admin/driver-locations" component={DriverLocations} />
        <Route path="/admin/payouts" component={Payouts} />
        <Route path="/admin/tax-reports" component={TaxReports} />
        <Route path="/admin/payment-tracking" component={PaymentTracking} />
        <Route path="/admin/transactions" component={Transactions} />
        <Route path="/admin/financial-operations" component={FinancialOperations} />
        <Route path="/admin/analytics" component={Analytics} />
        <Route path="/admin/business-intelligence" component={BusinessIntelligence} />
        <Route path="/admin/system-metrics" component={SystemMetrics} />
        <Route path="/admin/support" component={Support} />
        <Route path="/admin/feedback" component={Feedback} />
        <Route path="/admin/chat" component={Chat} />
        <Route path="/admin/notifications" component={Notifications} />
        <Route path="/admin/employees" component={Employees} />
        <Route path="/admin/operations" component={Operations} />
        <Route path="/admin/settings" component={Settings} />
        
        {/* Fallback for unknown routes */}
        <Route>
          {() => (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-foreground">Page Not Found</h1>
              <Card>
                <CardContent className="p-8">
                  <p className="text-muted-foreground text-center">
                    The admin page you're looking for doesn't exist.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </Route>
      </Switch>
    </AdminLayout>
  );
}
