import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Package, DollarSign, Clock } from "lucide-react";

export default function AnalyticsDashboard() {
  // Fetch real analytics data
  const { data: ordersData } = useQuery({ 
    queryKey: ['/api/orders'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });
  
  const { data: usersData } = useQuery({ 
    queryKey: ['/api/users'],
    refetchInterval: 60000 // Refresh every minute
  });

  // Calculate metrics from real data
  const orders = Array.isArray(ordersData) ? ordersData : [];
  const users = Array.isArray(usersData) ? usersData : [];
  
  const totalOrders = orders.length || 0;
  const completedOrders = orders.filter((o: any) => o.status === 'completed').length || 0;
  const pendingOrders = orders.filter((o: any) => o.status === 'pending').length || 0;
  const totalDrivers = users.filter((u: any) => u.isDriver).length || 0;
  const totalCustomers = users.filter((u: any) => !u.isDriver).length || 0;
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (parseFloat(o.price) || 0), 0);
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return amount > 0 ? `$${amount.toFixed(2)}` : 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {totalOrders > 0 ? totalOrders.toLocaleString() : 'N/A'}
            </div>
            <p className="text-xs text-amber-600 mt-1">
              {completedOrders > 0 ? `${completedOrders} completed` : 'No completed orders yet'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-amber-600 mt-1">
              {orders.length > 0 ? 'From all orders' : 'No revenue data'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {totalOrders > 0 ? `${completionRate}%` : 'N/A'}
            </div>
            <p className="text-xs text-amber-600 mt-1">
              {totalOrders > 0 ? `${completedOrders} of ${totalOrders} orders` : 'No orders to track'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Drivers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {totalDrivers > 0 ? totalDrivers.toLocaleString() : 'N/A'}
            </div>
            <p className="text-xs text-amber-600 mt-1">
              {totalDrivers > 0 ? 'Registered drivers' : 'No drivers registered'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {totalCustomers > 0 ? totalCustomers.toLocaleString() : 'N/A'}
            </div>
            <p className="text-xs text-amber-600 mt-1">
              {totalCustomers > 0 ? 'Registered customers' : 'No customers registered'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {pendingOrders > 0 ? pendingOrders.toLocaleString() : 'N/A'}
            </div>
            <p className="text-xs text-amber-600 mt-1">
              {pendingOrders > 0 ? 'Awaiting completion' : 'No pending orders'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Message */}
      <Card className="bg-amber-50/50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <BarChart3 className="h-5 w-5 text-amber-700 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">Real-Time Analytics</h3>
              <p className="text-sm text-amber-700">
                All metrics are calculated from live data and update automatically. 
                {totalOrders === 0 && " Create your first order to see analytics in action."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}