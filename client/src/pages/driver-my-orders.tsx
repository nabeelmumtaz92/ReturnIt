import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Package, 
  Clock, 
  CheckCircle, 
  MapPin,
  ArrowLeft,
  Menu,
  Home,
  CreditCard,
  DollarSign,
  Navigation,
  AlertCircle,
  Calendar,
  User,
  Phone,
  Mail,
  Zap
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { AdminNavigation } from "@/components/AdminNavigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Order = {
  id: string;
  retailer: string;
  pickupAddress: string;
  dropoffAddress: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  serviceTier: string;
  totalAmount: number;
  driverEarning: number;
  estimatedPickupTime: string;
  estimatedDeliveryTime: string;
  actualPickupTime?: string;
  actualDeliveryTime?: string;
  packageSize: string;
  specialInstructions?: string;
  items: any[];
  createdAt: string;
  updatedAt: string;
};

export default function DriverMyOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const { data: myOrders = [], isLoading: loadingMyOrders } = useQuery<Order[]>({
    queryKey: ["/api/driver/orders"],
  });

  const { data: availableOrders = [], isLoading: loadingAvailable } = useQuery<Order[]>({
    queryKey: ["/api/driver/orders/available"],
  });

  const acceptOrderMutation = useMutation({
    mutationFn: (orderId: string) =>
      apiRequest("POST", `/api/driver/orders/${orderId}/accept`),
    onSuccess: () => {
      toast({
        title: "Order Accepted!",
        description: "The order has been assigned to you. Check the Active tab.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/orders/available"] });
      setShowOrderDetails(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Accept Order",
        description: error.message || "Unable to accept this order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const activeOrders = myOrders.filter(
    (order) => order.status === "assigned" || order.status === "in_progress" || order.status === "picked_up"
  );

  const completedOrders = myOrders.filter(
    (order) => order.status === "completed"
  );

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      created: { label: "Available", variant: "secondary" },
      assigned: { label: "Assigned", variant: "default" },
      in_progress: { label: "In Progress", variant: "default" },
      picked_up: { label: "Picked Up", variant: "default" },
      completed: { label: "Completed", variant: "outline" },
      cancelled: { label: "Cancelled", variant: "destructive" },
    };

    const config = statusConfig[status] || { label: status, variant: "secondary" };
    return <Badge variant={config.variant} data-testid={`badge-status-${status}`}>{config.label}</Badge>;
  };

  const getTierBadge = (tier: string) => {
    const tierConfig: Record<string, { color: string; label: string }> = {
      standard: { color: "bg-blue-100 text-blue-800", label: "Standard" },
      priority: { color: "bg-purple-100 text-purple-800", label: "Priority" },
      instant: { color: "bg-amber-100 text-amber-800", label: "Instant" },
    };

    const config = tierConfig[tier] || { color: "bg-gray-100 text-gray-800", label: tier };
    return <Badge className={config.color} data-testid={`badge-tier-${tier}`}>{config.label}</Badge>;
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleAcceptOrder = () => {
    if (selectedOrder) {
      acceptOrderMutation.mutate(selectedOrder.id);
    }
  };

  const OrderCard = ({ order, showAcceptButton = false }: { order: Order; showAcceptButton?: boolean }) => (
    <Card 
      className="bg-white border-border hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => viewOrderDetails(order)}
      data-testid={`order-card-${order.id}`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-lg text-foreground" data-testid={`order-retailer-${order.id}`}>
                {order.retailer}
              </h3>
              {getTierBadge(order.serviceTier)}
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              Order #{order.id}
            </p>
            {getStatusBadge(order.status)}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600" data-testid={`order-earning-${order.id}`}>
              ${order.driverEarning?.toFixed(2) || '0.00'}
            </p>
            <p className="text-xs text-muted-foreground">Your Earning</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Pickup</p>
              <p className="text-sm text-muted-foreground" data-testid={`order-pickup-${order.id}`}>
                {order.pickupAddress}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Drop-off</p>
              <p className="text-sm text-muted-foreground" data-testid={`order-dropoff-${order.id}`}>
                {order.dropoffAddress}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <p className="text-sm text-muted-foreground">
              Pickup by {new Date(order.estimatedPickupTime).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-purple-600" />
            <p className="text-sm text-muted-foreground">
              {order.packageSize} • {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {showAcceptButton && (
          <Button 
            className="w-full mt-4 bg-green-600 hover:bg-green-700"
            onClick={(e) => {
              e.stopPropagation();
              viewOrderDetails(order);
            }}
            data-testid={`button-view-${order.id}`}
          >
            View Details & Accept
          </Button>
        )}

        {!showAcceptButton && order.status === "assigned" && (
          <Link href={`/driver-job/${order.id}`}>
            <Button 
              className="w-full mt-4"
              onClick={(e) => e.stopPropagation()}
              data-testid={`button-start-${order.id}`}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Start Job
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );

  if (loadingMyOrders || loadingAvailable) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#231b0f]">
      <AdminNavigation />
      
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/driver-portal">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-[#f8f7f5]" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Portal
                </Button>
              </Link>
              <div className="h-6 w-px bg-accent"></div>
              <h1 className="text-xl font-bold text-foreground" data-testid="heading-my-orders">
                My Orders
              </h1>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSidebar(!showSidebar)}
              className="text-muted-foreground hover:bg-[#f8f7f5]"
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
            <h2 className="text-lg font-bold text-foreground mb-6">Driver Navigation</h2>
            <div className="space-y-3">
              <Link href="/driver-portal">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-[#f8f7f5]" data-testid="nav-portal">
                  <Home className="h-4 w-4 mr-3" />
                  Driver Portal
                </Button>
              </Link>
              <Link href="/driver-my-orders">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-[#f8f7f5] bg-[#f8f7f5]" data-testid="nav-my-orders">
                  <Package className="h-4 w-4 mr-3" />
                  My Orders
                </Button>
              </Link>
              <Link href="/driver-payments">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-[#f8f7f5]" data-testid="nav-payments">
                  <CreditCard className="h-4 w-4 mr-3" />
                  Payments & Earnings
                </Button>
              </Link>
              <Link href="/welcome">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-[#f8f7f5]" data-testid="nav-home">
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
          <p className="text-muted-foreground" data-testid="text-subtitle">
            View and manage all your delivery orders
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-border" data-testid="card-active-orders">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-sm text-primary">Active Orders</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="count-active">
                    {activeOrders.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border" data-testid="card-completed-orders">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-primary">Completed</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="count-completed">
                    {completedOrders.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border" data-testid="card-available-orders">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-primary">Available</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="count-available">
                    {availableOrders.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-accent p-1 h-12 rounded-lg border border-border">
            <TabsTrigger 
              value="active" 
              className="text-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium transition-all"
              data-testid="tab-active"
            >
              Active ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger 
              value="available" 
              className="text-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium transition-all"
              data-testid="tab-available"
            >
              Available ({availableOrders.length})
            </TabsTrigger>
            <TabsTrigger 
              value="completed" 
              className="text-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium transition-all"
              data-testid="tab-completed"
            >
              Completed ({completedOrders.length})
            </TabsTrigger>
          </TabsList>

          {/* ACTIVE ORDERS TAB */}
          <TabsContent value="active">
            <div className="space-y-4">
              {activeOrders.length === 0 ? (
                <Card className="bg-white border-border">
                  <CardContent className="py-12 text-center">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">No active orders</p>
                    <Link href="/driver-my-orders">
                      <Button data-testid="button-find-orders">
                        <Package className="w-4 h-4 mr-2" />
                        Find Available Orders
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                activeOrders.map((order) => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </TabsContent>

          {/* AVAILABLE ORDERS TAB */}
          <TabsContent value="available">
            <div className="space-y-4">
              {availableOrders.length === 0 ? (
                <Card className="bg-white border-border">
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground" data-testid="text-no-available">
                      No available orders at the moment
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Check back soon for new delivery opportunities
                    </p>
                  </CardContent>
                </Card>
              ) : (
                availableOrders.map((order) => <OrderCard key={order.id} order={order} showAcceptButton />)
              )}
            </div>
          </TabsContent>

          {/* COMPLETED ORDERS TAB */}
          <TabsContent value="completed">
            <div className="space-y-4">
              {completedOrders.length === 0 ? (
                <Card className="bg-white border-border">
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground" data-testid="text-no-completed">
                      No completed orders yet
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your completed deliveries will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                completedOrders.map((order) => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Details Modal */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-order-details">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Order Details
                </DialogTitle>
                <DialogDescription>
                  Order #{selectedOrder.id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Status & Earnings */}
                <div className="flex justify-between items-center p-4 bg-[#f8f7f5] rounded-lg">
                  <div>
                    {getStatusBadge(selectedOrder.status)}
                    <p className="text-sm text-muted-foreground mt-1">{selectedOrder.retailer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">${selectedOrder.driverEarning?.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Your Earning</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Customer Information</h3>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedOrder.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedOrder.customerEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Delivery Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-green-600 mt-1" />
                      <div>
                        <p className="font-medium text-sm">Pickup Location</p>
                        <p className="text-sm text-muted-foreground">{selectedOrder.pickupAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-blue-600 mt-1" />
                      <div>
                        <p className="font-medium text-sm">Drop-off Location</p>
                        <p className="text-sm text-muted-foreground">{selectedOrder.dropoffAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Times */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Estimated Pickup</span>
                    </div>
                    <span className="text-sm font-medium">
                      {new Date(selectedOrder.estimatedPickupTime).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Estimated Delivery</span>
                    </div>
                    <span className="text-sm font-medium">
                      {new Date(selectedOrder.estimatedDeliveryTime).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Package Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Package Size</span>
                    <span className="text-sm font-medium">{selectedOrder.packageSize}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Service Tier</span>
                    {getTierBadge(selectedOrder.serviceTier)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Items</span>
                    <span className="text-sm font-medium">{selectedOrder.items?.length || 0} item(s)</span>
                  </div>
                </div>

                {/* Special Instructions */}
                {selectedOrder.specialInstructions && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-900">Special Instructions</AlertTitle>
                    <AlertDescription className="text-amber-700">
                      {selectedOrder.specialInstructions}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <DialogFooter>
                {selectedOrder.status === "created" && (
                  <Button 
                    onClick={handleAcceptOrder}
                    disabled={acceptOrderMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700"
                    data-testid="button-accept-order"
                  >
                    {acceptOrderMutation.isPending ? "Accepting..." : "Accept Order"}
                  </Button>
                )}
                {selectedOrder.status === "assigned" && (
                  <Link href={`/driver-job/${selectedOrder.id}`} className="w-full">
                    <Button className="w-full" data-testid="button-start-job">
                      <Navigation className="w-4 h-4 mr-2" />
                      Start Job
                    </Button>
                  </Link>
                )}
                <Button variant="outline" onClick={() => setShowOrderDetails(false)} data-testid="button-close">
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
