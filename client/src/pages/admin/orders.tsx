import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, CheckCircle, XCircle, RefreshCw, Eye, MapPin, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Order {
  id: string;
  orderNumber: string;
  trackingNumber: string;
  status: string;
  paymentStatus: string;
  userId: number;
  retailer: string;
  pickupCity: string;
  pickupState: string;
  totalPrice: number;
  serviceTier: string;
  driverId: number | null;
  createdAt: string;
  scheduledPickupTime: string | null;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  customerPaid: number;
  driverEarning: number;
  returnitFee: number;
}

export default function AdminOrders() {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch all orders
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Filter orders based on status
  const filteredOrders = orders?.filter(order => 
    statusFilter === "all" || order.status === statusFilter
  ) || [];

  // Calculate stats
  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter(o => 
    ['created', 'confirmed', 'assigned', 'pickup_scheduled'].includes(o.status)
  ).length || 0;
  const completedOrders = orders?.filter(o => 
    o.status === 'completed' || o.status === 'delivered'
  ).length || 0;
  const refundedOrders = orders?.filter(o => 
    o.paymentStatus === 'refunded' || o.status === 'refunded'
  ).length || 0;
  const totalRevenue = orders?.reduce((sum, o) => sum + (o.customerPaid || 0), 0) || 0;

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async (data: { orderIds: string[]; status: string }) => {
      return await apiRequest('/api/admin/orders/bulk-update', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      setSelectedOrders(new Set());
      toast({
        title: "Success",
        description: "Orders updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update orders",
        variant: "destructive",
      });
    },
  });

  // Refund mutation
  const refundMutation = useMutation({
    mutationFn: async (data: { orderId: string; amount: number; reason: string }) => {
      return await apiRequest(`/api/admin/orders/${data.orderId}/refund`, {
        method: 'POST',
        body: JSON.stringify({ amount: data.amount, reason: data.reason }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      setRefundDialogOpen(false);
      setRefundAmount("");
      setRefundReason("");
      setSelectedOrder(null);
      toast({
        title: "Refund Processed",
        description: "Refund has been initiated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Refund Failed",
        description: "Failed to process refund. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; className: string }> = {
      created: { variant: 'secondary', className: 'bg-gray-100 text-gray-700' },
      confirmed: { variant: 'secondary', className: 'bg-blue-100 text-blue-700' },
      assigned: { variant: 'secondary', className: 'bg-purple-100 text-purple-700' },
      pickup_scheduled: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-700' },
      picked_up: { variant: 'secondary', className: 'bg-orange-100 text-orange-700' },
      in_transit: { variant: 'secondary', className: 'bg-indigo-100 text-indigo-700' },
      delivered: { variant: 'default', className: 'bg-green-100 text-green-700' },
      completed: { variant: 'default', className: 'bg-green-100 text-green-700' },
      cancelled: { variant: 'destructive', className: 'bg-red-100 text-red-700' },
      refunded: { variant: 'destructive', className: 'bg-red-100 text-red-700' },
      return_refused: { variant: 'destructive', className: 'bg-red-100 text-red-700' },
    };
    const config = statusMap[status] || { variant: 'secondary', className: '' };
    return <Badge variant={config.variant} className={config.className}>
      {status.replace(/_/g, ' ').toUpperCase()}
    </Badge>;
  };

  // Get payment status badge
  const getPaymentBadge = (status: string) => {
    const statusMap: Record<string, { className: string }> = {
      pending: { className: 'bg-yellow-100 text-yellow-700' },
      completed: { className: 'bg-green-100 text-green-700' },
      failed: { className: 'bg-red-100 text-red-700' },
      refunded: { className: 'bg-orange-100 text-orange-700' },
      refund_processing: { className: 'bg-blue-100 text-blue-700' },
      refund_failed: { className: 'bg-red-100 text-red-700' },
    };
    const config = statusMap[status] || { className: '' };
    return <Badge className={config.className}>
      {status.replace(/_/g, ' ').toUpperCase()}
    </Badge>;
  };

  // Handle bulk action
  const handleBulkUpdate = () => {
    if (selectedOrders.size === 0 || !bulkStatus) {
      toast({
        title: "No Selection",
        description: "Please select orders and a status",
        variant: "destructive",
      });
      return;
    }
    bulkUpdateMutation.mutate({
      orderIds: Array.from(selectedOrders),
      status: bulkStatus,
    });
  };

  // Handle refund
  const handleRefund = () => {
    if (!selectedOrder || !refundAmount) {
      toast({
        title: "Missing Information",
        description: "Please enter refund amount",
        variant: "destructive",
      });
      return;
    }
    refundMutation.mutate({
      orderId: selectedOrder.id,
      amount: parseFloat(refundAmount),
      reason: refundReason,
    });
  };

  // Toggle order selection
  const toggleOrderSelection = (orderId: string) => {
    const newSelection = new Set(selectedOrders);
    if (newSelection.has(orderId)) {
      newSelection.delete(orderId);
    } else {
      newSelection.add(orderId);
    }
    setSelectedOrders(newSelection);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Orders Management</h1>
        <p className="text-muted-foreground">Manage all orders, payments, and refunds</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-total-orders">
                  {isLoading ? "..." : totalOrders}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-3 rounded-full">
                <RefreshCw className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-pending-orders">
                  {isLoading ? "..." : pendingOrders}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-completed-orders">
                  {isLoading ? "..." : completedOrders}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-3 rounded-full">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Refunded</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-refunded-orders">
                  {isLoading ? "..." : refundedOrders}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-3 rounded-full">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-total-revenue">
                  {isLoading ? "..." : formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.size > 0 && (
        <Card className="border-[#B8956A]">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <p className="font-medium">{selectedOrders.size} order(s) selected</p>
              <Select value={bulkStatus} onValueChange={setBulkStatus}>
                <SelectTrigger className="w-[200px]" data-testid="select-bulk-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="picked_up">Picked Up</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleBulkUpdate}
                disabled={bulkUpdateMutation.isPending}
                data-testid="button-bulk-update"
              >
                {bulkUpdateMutation.isPending ? "Updating..." : "Update Status"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedOrders(new Set())}
                data-testid="button-clear-selection"
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Orders
            </CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="picked_up">Picked Up</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                <p className="text-muted-foreground">Loading orders...</p>
              </div>
            </div>
          ) : !filteredOrders || filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Package className="h-12 w-12 mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-center">
                No orders found
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
                          } else {
                            setSelectedOrders(new Set());
                          }
                        }}
                        data-testid="checkbox-select-all"
                      />
                    </TableHead>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Retailer</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} data-testid={`order-row-${order.id}`}>
                      <TableCell>
                        <Checkbox
                          checked={selectedOrders.has(order.id)}
                          onCheckedChange={() => toggleOrderSelection(order.id)}
                          data-testid={`checkbox-order-${order.id}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-mono text-sm">{order.orderNumber || order.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.trackingNumber}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">ID: {order.userId}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{order.retailer}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">
                            {order.pickupCity}, {order.pickupState}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{getPaymentBadge(order.paymentStatus)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.totalPrice || order.customerPaid || 0)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedOrder(order)}
                            data-testid={`button-view-${order.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {(order.paymentStatus === 'completed' || order.paymentStatus === 'pending') && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => {
                                setSelectedOrder(order);
                                setRefundAmount((order.totalPrice || order.customerPaid || 0).toString());
                                setRefundDialogOpen(true);
                              }}
                              data-testid={`button-refund-${order.id}`}
                            >
                              Refund
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder && !refundDialogOpen} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[#B8956A]" />
              Order Details
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold mb-3">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Order Number</p>
                      <p className="font-mono font-medium">{selectedOrder.orderNumber || selectedOrder.id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tracking Number</p>
                      <p className="font-mono font-medium">{selectedOrder.trackingNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                    <div>
                      <p className="text-muted-foreground">Service Tier</p>
                      <p className="font-medium capitalize">{selectedOrder.serviceTier}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold mb-3">Payment Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Payment Status</p>
                      {getPaymentBadge(selectedOrder.paymentStatus)}
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Price</p>
                      <p className="font-medium">{formatCurrency(selectedOrder.totalPrice || selectedOrder.customerPaid || 0)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Driver Earning</p>
                      <p className="font-medium">{formatCurrency(selectedOrder.driverEarning || 0)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Platform Fee</p>
                      <p className="font-medium">{formatCurrency(selectedOrder.returnitFee || 0)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stripe Info */}
              {selectedOrder.stripePaymentIntentId && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold mb-3">Stripe Payment Details</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Payment Intent ID</p>
                      <p className="font-mono text-xs">{selectedOrder.stripePaymentIntentId}</p>
                    </div>
                    {selectedOrder.stripeChargeId && (
                      <div>
                        <p className="text-muted-foreground">Charge ID</p>
                        <p className="font-mono text-xs">{selectedOrder.stripeChargeId}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Location Info */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-3">Pickup & Return Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Pickup Location</p>
                    <p className="font-medium">{selectedOrder.pickupCity}, {selectedOrder.pickupState}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Return To</p>
                    <p className="font-medium">{selectedOrder.retailer}</p>
                  </div>
                  {selectedOrder.scheduledPickupTime && (
                    <div>
                      <p className="text-muted-foreground">Scheduled Pickup</p>
                      <p className="font-medium">{formatDate(selectedOrder.scheduledPickupTime)}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => setSelectedOrder(null)}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-close-details"
                >
                  Close
                </Button>
                {(selectedOrder.paymentStatus === 'completed' || selectedOrder.paymentStatus === 'pending') && (
                  <Button
                    onClick={() => {
                      setRefundAmount((selectedOrder.totalPrice || selectedOrder.customerPaid || 0).toString());
                      setRefundDialogOpen(true);
                    }}
                    variant="destructive"
                    className="flex-1"
                    data-testid="button-refund-from-details"
                  >
                    Process Refund
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Issue a refund for order {selectedOrder?.orderNumber || selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="refund-amount">Refund Amount</Label>
              <Input
                id="refund-amount"
                type="number"
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="0.00"
                data-testid="input-refund-amount"
              />
              <p className="text-xs text-muted-foreground">
                Original amount: {formatCurrency(selectedOrder?.totalPrice || selectedOrder?.customerPaid || 0)}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="refund-reason">Reason (Optional)</Label>
              <Textarea
                id="refund-reason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter refund reason..."
                rows={3}
                data-testid="textarea-refund-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setRefundDialogOpen(false);
                setRefundAmount("");
                setRefundReason("");
              }}
              data-testid="button-cancel-refund"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRefund}
              disabled={refundMutation.isPending || !refundAmount}
              variant="destructive"
              data-testid="button-confirm-refund"
            >
              {refundMutation.isPending ? "Processing..." : "Process Refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
