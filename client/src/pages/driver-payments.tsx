import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Gift, 
  Zap, 
  Calendar,
  Receipt,
  Star,
  CheckCircle,
  ArrowLeft,
  Menu,
  Home,
  Package,
  CreditCard,
  Settings,
  Users
} from "lucide-react";
import { Link } from "wouter";

export default function DriverPayments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/driver/orders"],
  });

  const { data: payouts, isLoading: payoutsLoading } = useQuery({
    queryKey: ["/api/driver/payouts"],
  });

  const { data: incentives, isLoading: incentivesLoading } = useQuery({
    queryKey: ["/api/driver/incentives"],
  });

  const instantPayoutMutation = useMutation({
    mutationFn: (data: { orderIds: string[]; feeAmount: number }) =>
      apiRequest("POST", "/api/driver/payout/instant", data),
    onSuccess: () => {
      toast({
        title: "Instant Payout Processed",
        description: "Your earnings have been transferred to your bank account.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/payouts"] });
      setSelectedOrders([]);
    },
    onError: () => {
      toast({
        title: "Payout Failed",
        description: "Unable to process instant payout. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Calculate earnings from completed orders
  const completedOrders = orders?.filter((order: any) => 
    order.status === 'completed' && order.paymentStatus === 'completed'
  ) || [];

  const pendingEarnings = completedOrders
    .filter((order: any) => order.driverPayoutStatus === 'pending')
    .reduce((sum: number, order: any) => sum + (order.driverEarning || 0), 0);

  const totalEarnings = completedOrders
    .reduce((sum: number, order: any) => sum + (order.driverEarning || 0), 0);

  const handleInstantPayout = () => {
    if (selectedOrders.length === 0) {
      toast({
        title: "No Orders Selected",
        description: "Please select orders to process instant payout.",
        variant: "destructive",
      });
      return;
    }

    instantPayoutMutation.mutate({
      orderIds: selectedOrders,
      feeAmount: 1.00 // $1 instant pay fee
    });
  };

  if (ordersLoading || payoutsLoading || incentivesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b border-amber-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/driver-portal">
                <Button variant="ghost" size="sm" className="text-amber-700 hover:bg-amber-50" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Portal
                </Button>
              </Link>
              <div className="h-6 w-px bg-amber-200"></div>
              <h1 className="text-xl font-bold text-amber-900" data-testid="heading-payments">
                Payments & Earnings
              </h1>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSidebar(!showSidebar)}
              className="text-amber-700 hover:bg-amber-50"
              data-testid="button-menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar Navigation */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowSidebar(false)}>
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-amber-900 mb-6">Driver Navigation</h2>
            <div className="space-y-3">
              <Link href="/driver-portal">
                <Button variant="ghost" className="w-full justify-start text-amber-700 hover:bg-amber-50" data-testid="nav-portal">
                  <Home className="h-4 w-4 mr-3" />
                  Driver Portal
                </Button>
              </Link>
              <Link href="/driver-payments">
                <Button variant="ghost" className="w-full justify-start text-amber-700 hover:bg-amber-50 bg-amber-50" data-testid="nav-payments">
                  <CreditCard className="h-4 w-4 mr-3" />
                  Payments & Earnings
                </Button>
              </Link>
              <Link href="/order-status">
                <Button variant="ghost" className="w-full justify-start text-amber-700 hover:bg-amber-50" data-testid="nav-orders">
                  <Package className="h-4 w-4 mr-3" />
                  My Orders
                </Button>
              </Link>
              <Link href="/admin-dashboard">
                <Button variant="ghost" className="w-full justify-start text-amber-700 hover:bg-amber-50" data-testid="nav-admin">
                  <Users className="h-4 w-4 mr-3" />
                  Admin Dashboard
                </Button>
              </Link>
              <Link href="/welcome">
                <Button variant="ghost" className="w-full justify-start text-amber-700 hover:bg-amber-50" data-testid="nav-home">
                  <Home className="h-4 w-4 mr-3" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-6xl p-6">
        <div className="mb-8">
          <p className="text-amber-700" data-testid="text-subtitle">
            Manage your earnings, payouts, and incentives
          </p>
        </div>

        {/* Earnings Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-amber-200" data-testid="card-pending-earnings">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-sm text-amber-600">Pending Earnings</p>
                  <p className="text-2xl font-bold text-amber-900" data-testid="amount-pending">
                    ${pendingEarnings.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-amber-200" data-testid="card-total-earnings">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-amber-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-amber-900" data-testid="amount-total">
                    ${totalEarnings.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-amber-200" data-testid="card-completed-orders">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-amber-600">Completed Orders</p>
                  <p className="text-2xl font-bold text-amber-900" data-testid="count-completed">
                    {completedOrders.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-amber-200" data-testid="card-bonuses">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Gift className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-amber-600">Total Bonuses</p>
                  <p className="text-2xl font-bold text-amber-900" data-testid="amount-bonuses">
                    ${completedOrders.reduce((sum: number, order: any) => 
                      sum + (order.sizeBonusAmount || 0) + (order.peakSeasonBonus || 0) + (order.multiStopBonus || 0), 0
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="instant-pay" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-amber-100 p-1 h-12 rounded-lg border border-amber-200">
            <TabsTrigger 
              value="instant-pay" 
              className="text-amber-800 data-[state=active]:bg-white data-[state=active]:text-amber-900 data-[state=active]:shadow-sm font-medium transition-all"
              data-testid="tab-instant-pay"
            >
              Instant Pay
            </TabsTrigger>
            <TabsTrigger 
              value="earnings" 
              className="text-amber-800 data-[state=active]:bg-white data-[state=active]:text-amber-900 data-[state=active]:shadow-sm font-medium transition-all"
              data-testid="tab-earnings"
            >
              Earnings
            </TabsTrigger>
            <TabsTrigger 
              value="incentives" 
              className="text-amber-800 data-[state=active]:bg-white data-[state=active]:text-amber-900 data-[state=active]:shadow-sm font-medium transition-all"
              data-testid="tab-incentives"
            >
              Incentives
            </TabsTrigger>
            <TabsTrigger 
              value="tax-info" 
              className="text-amber-800 data-[state=active]:bg-white data-[state=active]:text-amber-900 data-[state=active]:shadow-sm font-medium transition-all"
              data-testid="tab-tax"
            >
              Tax Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="instant-pay">
            <Card className="bg-white border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" data-testid="heading-instant-pay">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Instant Pay - Get Paid Now
                </CardTitle>
                <CardDescription data-testid="description-instant-pay">
                  Transfer your earnings instantly for a $1.00 fee. Standard weekly payouts are free.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="font-semibold text-amber-900 mb-2" data-testid="heading-available-earnings">
                      Available for Instant Payout: ${pendingEarnings.toFixed(2)}
                    </h3>
                    <p className="text-sm text-amber-700 mb-3">
                      Select completed orders to cash out instantly:
                    </p>
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {completedOrders
                        .filter((order: any) => order.driverPayoutStatus === 'pending')
                        .map((order: any) => (
                          <div 
                            key={order.id} 
                            className="flex items-center justify-between bg-white p-3 rounded border"
                            data-testid={`order-item-${order.id}`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedOrders.includes(order.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedOrders([...selectedOrders, order.id]);
                                  } else {
                                    setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                                  }
                                }}
                                className="rounded"
                                data-testid={`checkbox-order-${order.id}`}
                              />
                              <div>
                                <p className="font-medium text-amber-900">{order.retailer}</p>
                                <p className="text-sm text-amber-600">{order.pickupAddress}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600" data-testid={`earning-${order.id}`}>
                                ${order.driverEarning?.toFixed(2)}
                              </p>
                              {(order.sizeBonusAmount > 0 || order.peakSeasonBonus > 0) && (
                                <p className="text-xs text-purple-600">+ bonuses</p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {selectedOrders.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-green-900">Selected Earnings:</span>
                        <span className="font-bold text-green-900" data-testid="amount-selected">
                          ${completedOrders
                            .filter((order: any) => selectedOrders.includes(order.id))
                            .reduce((sum: number, order: any) => sum + (order.driverEarning || 0), 0)
                            .toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-green-700">Instant Pay Fee:</span>
                        <span className="text-green-700">-$1.00</span>
                      </div>
                      <hr className="border-green-200 my-2" />
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-green-900">Net Amount:</span>
                        <span className="font-bold text-green-900" data-testid="amount-net">
                          ${(completedOrders
                            .filter((order: any) => selectedOrders.includes(order.id))
                            .reduce((sum: number, order: any) => sum + (order.driverEarning || 0), 0) - 1.00)
                            .toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleInstantPayout}
                    disabled={selectedOrders.length === 0 || instantPayoutMutation.isPending}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                    data-testid="button-instant-payout"
                  >
                    {instantPayoutMutation.isPending ? (
                      "Processing..."
                    ) : (
                      `Cash Out ${selectedOrders.length} Order${selectedOrders.length !== 1 ? 's' : ''} Now`
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <Card className="bg-white border-amber-200">
              <CardHeader>
                <CardTitle data-testid="heading-earnings-history">Earnings History</CardTitle>
                <CardDescription>Your completed deliveries and earnings breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedOrders.map((order: any) => (
                    <div 
                      key={order.id} 
                      className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200"
                      data-testid={`earnings-item-${order.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-medium text-amber-900">{order.retailer}</p>
                          <p className="text-sm text-amber-600">{order.pickupAddress}</p>
                          <p className="text-xs text-amber-500">
                            Completed: {new Date(order.actualDeliveryTime || order.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600" data-testid={`total-earning-${order.id}`}>
                          ${order.driverEarning?.toFixed(2)}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {order.sizeBonusAmount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              Size +${order.sizeBonusAmount.toFixed(2)}
                            </Badge>
                          )}
                          {order.peakSeasonBonus > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              Peak +${order.peakSeasonBonus.toFixed(2)}
                            </Badge>
                          )}
                        </div>
                        <Badge 
                          variant={order.driverPayoutStatus === 'instant_paid' ? 'default' : 'secondary'}
                          className="text-xs mt-1"
                          data-testid={`status-${order.id}`}
                        >
                          {order.driverPayoutStatus === 'instant_paid' ? 'Instant Paid' : 
                           order.driverPayoutStatus === 'weekly_paid' ? 'Weekly Paid' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incentives">
            <Card className="bg-white border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" data-testid="heading-incentives">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Driver Incentives & Bonuses
                </CardTitle>
                <CardDescription>Earn extra with size bonuses, peak season multipliers, and more</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-amber-900" data-testid="heading-active-incentives">Active Incentives</h3>
                    
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg" data-testid="incentive-size-bonus">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="w-4 h-4 text-green-600" />
                        <h4 className="font-medium text-green-900">Large Package Bonus</h4>
                      </div>
                      <p className="text-sm text-green-700 mb-2">+$5.00 for large packages</p>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>

                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg" data-testid="incentive-peak-season">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <h4 className="font-medium text-purple-900">Peak Season Bonus</h4>
                      </div>
                      <p className="text-sm text-purple-700 mb-2">+$2.00 during Nov-Jan peak returns</p>
                      <Badge className="bg-purple-100 text-purple-800">
                        {(new Date().getMonth() >= 10 || new Date().getMonth() <= 0) ? 'Active' : 'Seasonal'}
                      </Badge>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg" data-testid="incentive-multi-stop">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <h4 className="font-medium text-blue-900">Multi-Stop Bonus</h4>
                      </div>
                      <p className="text-sm text-blue-700 mb-2">Extra earnings for multiple pickups</p>
                      <Badge className="bg-blue-100 text-blue-800">Coming Soon</Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-amber-900" data-testid="heading-earned-bonuses">Your Earned Bonuses</h3>
                    
                    {incentives && incentives.length > 0 ? (
                      incentives.map((incentive: any) => (
                        <div 
                          key={incentive.id} 
                          className="p-3 bg-amber-50 border border-amber-200 rounded-lg"
                          data-testid={`earned-incentive-${incentive.id}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-amber-900">{incentive.description}</p>
                              <p className="text-sm text-amber-600">{incentive.incentiveType}</p>
                            </div>
                            <p className="font-semibold text-green-600">+${incentive.amount.toFixed(2)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-6 bg-amber-50 border border-amber-200 rounded-lg" data-testid="no-bonuses">
                        <Gift className="w-8 h-8 mx-auto text-amber-400 mb-2" />
                        <p className="text-amber-600">No bonuses earned yet</p>
                        <p className="text-sm text-amber-500">Complete deliveries to start earning bonuses!</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tax-info">
            <Card className="bg-white border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" data-testid="heading-tax-info">
                  <Receipt className="w-5 h-5 text-blue-500" />
                  Tax Information & 1099 Forms
                </CardTitle>
                <CardDescription>Year-end tax documents and earnings summaries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg" data-testid="tax-summary-2024">
                    <h3 className="font-semibold text-blue-900 mb-3">2024 Tax Year Summary</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-blue-600">Total Earnings</p>
                        <p className="text-xl font-bold text-blue-900" data-testid="tax-total-earnings">
                          ${totalEarnings.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-600">Completed Deliveries</p>
                        <p className="text-xl font-bold text-blue-900" data-testid="tax-total-deliveries">
                          {completedOrders.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg" data-testid="tax-1099-info">
                    <h3 className="font-semibold text-yellow-900 mb-2">1099 Form Information</h3>
                    <p className="text-sm text-yellow-800 mb-3">
                      Stripe will automatically generate and send your 1099 tax form by January 31st if you earned $600 or more in 2024.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-yellow-700">Threshold for 1099:</span>
                        <span className="font-medium">$600.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-700">Your 2024 earnings:</span>
                        <span className={`font-medium ${totalEarnings >= 600 ? 'text-green-600' : 'text-yellow-600'}`}>
                          ${totalEarnings.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-700">1099 Status:</span>
                        <Badge variant={totalEarnings >= 600 ? "default" : "secondary"}>
                          {totalEarnings >= 600 ? "Required" : "Not Required"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg" data-testid="tax-tips">
                    <h3 className="font-semibold text-gray-900 mb-2">Tax Tips for Drivers</h3>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Keep records of vehicle expenses (gas, maintenance, insurance)</li>
                      <li>• Track business miles driven for deliveries</li>
                      <li>• Save receipts for phone bills and other business expenses</li>
                      <li>• Consider quarterly estimated tax payments if earnings are substantial</li>
                      <li>• Consult a tax professional for personalized advice</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}