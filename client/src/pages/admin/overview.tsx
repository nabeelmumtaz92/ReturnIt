import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, DollarSign, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function AdminOverview() {
  // Fetch dashboard stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const metrics = [
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      link: "/admin/orders"
    },
    {
      title: "Active Drivers",
      value: stats?.activeDrivers || 0,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
      link: "/admin/drivers"
    },
    {
      title: "Today's Revenue",
      value: `$${(stats?.todayRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      link: "/admin/financial-operations"
    },
    {
      title: "Completion Rate",
      value: `${(stats?.completionRate || 0).toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      link: "/admin/analytics"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Link key={metric.title} href={metric.link}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
                    <p className="text-2xl font-bold text-foreground" data-testid={`metric-${metric.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      {isLoading ? "..." : metric.value}
                    </p>
                  </div>
                  <div className={`${metric.bgColor} p-3 rounded-full`}>
                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/orders">
              <Button className="w-full bg-[#B8956A] hover:bg-[#A0805A]" data-testid="button-manage-orders">
                <Package className="h-4 w-4 mr-2" />
                Manage Orders
              </Button>
            </Link>
            <Link href="/admin/drivers">
              <Button className="w-full bg-[#B8956A] hover:bg-[#A0805A]" data-testid="button-view-drivers">
                <Users className="h-4 w-4 mr-2" />
                View Drivers
              </Button>
            </Link>
            <Link href="/admin/payouts">
              <Button className="w-full bg-[#B8956A] hover:bg-[#A0805A]" data-testid="button-driver-payouts">
                <DollarSign className="h-4 w-4 mr-2" />
                Process Payouts
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Recent system activity will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
