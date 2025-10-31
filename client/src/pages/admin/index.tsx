import { Route, Switch } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminOverview from "./overview";
import AdminOrders from "./orders";
import AdminDrivers from "./drivers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Placeholder component for sections not yet implemented
function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            This section is under development and will be available soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminRoutes() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={AdminOverview} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/drivers" component={AdminDrivers} />
        <Route path="/admin/driver-applications">
          {() => <PlaceholderPage title="Driver Applications" description="Review and approve new driver applications" />}
        </Route>
        <Route path="/admin/customers">
          {() => <PlaceholderPage title="Customer Management" description="View and manage customer accounts" />}
        </Route>
        <Route path="/admin/driver-locations">
          {() => <PlaceholderPage title="Driver Locations" description="Track driver locations in real-time" />}
        </Route>
        <Route path="/admin/payouts">
          {() => <PlaceholderPage title="Driver Payouts" description="Process driver payments and payouts" />}
        </Route>
        <Route path="/admin/tax-reports">
          {() => <PlaceholderPage title="Tax Reports" description="Generate and manage 1099 tax forms" />}
        </Route>
        <Route path="/admin/payment-tracking">
          {() => <PlaceholderPage title="Payment Tracking" description="Monitor payment processing and history" />}
        </Route>
        <Route path="/admin/transactions">
          {() => <PlaceholderPage title="Transaction Management" description="View all financial transactions" />}
        </Route>
        <Route path="/admin/financial-operations">
          {() => <PlaceholderPage title="Financial Operations" description="Comprehensive financial management" />}
        </Route>
        <Route path="/admin/analytics">
          {() => <PlaceholderPage title="Analytics" description="Business intelligence and performance metrics" />}
        </Route>
        <Route path="/admin/business-intelligence">
          {() => <PlaceholderPage title="Business Intelligence" description="Advanced analytics and insights" />}
        </Route>
        <Route path="/admin/system-metrics">
          {() => <PlaceholderPage title="System Metrics" description="Server performance and system health" />}
        </Route>
        <Route path="/admin/support">
          {() => <PlaceholderPage title="Support Center" description="Manage customer support tickets" />}
        </Route>
        <Route path="/admin/feedback">
          {() => <PlaceholderPage title="Customer Feedback" description="Review customer ratings and feedback" />}
        </Route>
        <Route path="/admin/chat">
          {() => <PlaceholderPage title="Live Chat" description="Real-time customer support chat" />}
        </Route>
        <Route path="/admin/notifications">
          {() => <PlaceholderPage title="Notifications" description="System alerts and notification management" />}
        </Route>
        <Route path="/admin/employees">
          {() => <PlaceholderPage title="Employee Management" description="Manage staff and access controls" />}
        </Route>
        <Route path="/admin/operations">
          {() => <PlaceholderPage title="Operations" description="Operational management and oversight" />}
        </Route>
        <Route path="/admin/settings">
          {() => <PlaceholderPage title="Settings" description="System configuration and preferences" />}
        </Route>
        
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
