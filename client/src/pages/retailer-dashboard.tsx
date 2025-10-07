import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Package,
  MapPin,
  FileText,
  CreditCard,
  Key,
  BarChart3,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Users,
  Settings
} from "lucide-react";

export default function RetailerDashboard() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/retailer/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const companies = dashboardData?.dashboardData || [];

  if (companies.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Welcome to Return It for Retailers</CardTitle>
            <CardDescription>
              You don't have any retailer accounts yet. Register your company to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/retailer/register">
              <Button className="w-full" data-testid="button-register-retailer">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Register Your Company
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Retailer Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your returns, locations, and analytics
          </p>
        </div>

        <Tabs defaultValue={companies[0]?.company?.id?.toString() || "0"} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1">
            {companies.map((item: any) => (
              <TabsTrigger
                key={item.company.id}
                value={item.company.id.toString()}
                data-testid={`tab-company-${item.company.id}`}
              >
                {item.company.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {companies.map((item: any) => (
            <TabsContent key={item.company.id} value={item.company.id.toString()}>
              <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card data-testid={`card-total-orders-${item.company.id}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                      <Package className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{item.stats.totalOrders}</div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {item.stats.completedOrders} completed
                      </p>
                    </CardContent>
                  </Card>

                  <Card data-testid={`card-active-orders-${item.company.id}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{item.stats.activeOrders}</div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Currently in progress
                      </p>
                    </CardContent>
                  </Card>

                  <Card data-testid={`card-month-orders-${item.company.id}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">This Month</CardTitle>
                      <BarChart3 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{item.stats.thisMonthOrders}</div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        ${item.stats.thisMonthRevenue.toFixed(2)} revenue
                      </p>
                    </CardContent>
                  </Card>

                  <Card data-testid={`card-total-revenue-${item.company.id}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${item.stats.totalRevenue.toFixed(2)}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">All time</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Subscription Status */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Subscription Status</CardTitle>
                        <CardDescription>
                          {item.subscription?.planType === 'standard'
                            ? 'Standard Plan'
                            : item.subscription?.planType || 'No active plan'}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          item.subscription?.status === 'active'
                            ? 'default'
                            : item.subscription?.status === 'trial'
                            ? 'secondary'
                            : 'destructive'
                        }
                        data-testid={`badge-subscription-status-${item.company.id}`}
                      >
                        {item.subscription?.status || 'inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Monthly Fee</p>
                        <p className="font-semibold">
                          ${item.subscription?.monthlyFee?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Transaction Fee</p>
                        <p className="font-semibold">
                          ${item.subscription?.transactionFee?.toFixed(2) || '0.00'} per order
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Current Month Orders</p>
                        <p className="font-semibold">
                          {item.subscription?.currentMonthOrders || 0} /{' '}
                          {item.subscription?.includedOrders || 0} included
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link href={`/retailer/companies/${item.company.id}/billing`}>
                        <Button variant="outline" size="sm" data-testid={`button-manage-billing-${item.company.id}`}>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Manage Billing
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Manage your company settings and data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <Link href={`/retailer/companies/${item.company.id}/orders`}>
                        <Button variant="outline" className="w-full justify-start" data-testid={`button-view-orders-${item.company.id}`}>
                          <Package className="mr-2 h-4 w-4" />
                          View Orders
                        </Button>
                      </Link>

                      <Link href={`/retailer/companies/${item.company.id}/locations`}>
                        <Button variant="outline" className="w-full justify-start" data-testid={`button-manage-locations-${item.company.id}`}>
                          <MapPin className="mr-2 h-4 w-4" />
                          Manage Locations
                        </Button>
                      </Link>

                      <Link href={`/retailer/companies/${item.company.id}/return-policy`}>
                        <Button variant="outline" className="w-full justify-start" data-testid={`button-return-policy-${item.company.id}`}>
                          <FileText className="mr-2 h-4 w-4" />
                          Return Policy
                        </Button>
                      </Link>

                      <Link href={`/retailer/companies/${item.company.id}/analytics`}>
                        <Button variant="outline" className="w-full justify-start" data-testid={`button-analytics-${item.company.id}`}>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Analytics
                        </Button>
                      </Link>

                      <Link href={`/retailer/companies/${item.company.id}/api-keys`}>
                        <Button variant="outline" className="w-full justify-start" data-testid={`button-api-keys-${item.company.id}`}>
                          <Key className="mr-2 h-4 w-4" />
                          API Keys
                        </Button>
                      </Link>

                      <Link href={`/retailer/companies/${item.company.id}/settings`}>
                        <Button variant="outline" className="w-full justify-start" data-testid={`button-settings-${item.company.id}`}>
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
