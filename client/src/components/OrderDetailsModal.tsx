import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  User, 
  MapPin, 
  DollarSign, 
  CreditCard, 
  Truck, 
  Clock, 
  Image as ImageIcon,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

interface OrderDetailsModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsModal = ({ orderId, isOpen, onClose }: OrderDetailsModalProps) => {
  const { data: orderDetails, isLoading } = useQuery({
    queryKey: ['/api/admin/order', orderId, 'details'],
    enabled: !!orderId && isOpen,
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['/api/admin/orders', orderId, 'audit-logs'],
    enabled: !!orderId && isOpen,
  });

  if (!orderId || !isOpen) return null;

  const order = orderDetails?.order;
  const customer = orderDetails?.customer;
  const driver = orderDetails?.driver;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      created: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-indigo-100 text-indigo-800',
      assigned: 'bg-purple-100 text-purple-800',
      picked_up: 'bg-yellow-100 text-yellow-800',
      in_transit: 'bg-amber-100 text-amber-800',
      delivered: 'bg-green-100 text-green-800',
      completed: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatTimestamp = (date: string | Date | null) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'MMM d, yyyy h:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, any> = {
      order_created: Package,
      status_changed: AlertCircle,
      driver_assigned: Truck,
      photo_uploaded: ImageIcon,
      payment_processed: CreditCard,
      refund_issued: DollarSign,
      notes_added: FileText,
    };
    const Icon = icons[action] || AlertCircle;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]" data-testid="dialog-order-details">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-amber-600" />
              <div>
                <div className="text-xl font-bold">Order Details</div>
                {order && (
                  <div className="text-sm text-gray-500 font-normal">
                    {order.trackingNumber || order.id}
                  </div>
                )}
              </div>
            </div>
            {order && (
              <Badge className={getStatusColor(order.status)} data-testid="badge-order-status">
                {order.status?.replace('_', ' ').toUpperCase()}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12" data-testid="loader-order-details">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
          ) : !order ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Order not found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Customer Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Name</div>
                    <div className="font-medium" data-testid="text-customer-name">
                      {customer?.firstName} {customer?.lastName}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium" data-testid="text-customer-email">{customer?.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-medium" data-testid="text-customer-phone">{customer?.phone || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Created</div>
                    <div className="font-medium">{formatTimestamp(order.createdAt)}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Pickup Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Pickup Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Address</div>
                    <div className="font-medium" data-testid="text-pickup-address">
                      {order.pickupStreetAddress}<br />
                      {order.pickupCity}, {order.pickupState} {order.pickupZipCode}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Location Type</div>
                      <div className="font-medium">{order.pickupLocation || 'inside'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Scheduled Time</div>
                      <div className="font-medium">{formatTimestamp(order.scheduledPickupTime)}</div>
                    </div>
                  </div>
                  {order.pickupInstructions && (
                    <div>
                      <div className="text-sm text-gray-500">Instructions</div>
                      <div className="font-medium text-sm">{order.pickupInstructions}</div>
                    </div>
                  )}
                  {order.actualPickupTime && (
                    <div>
                      <div className="text-sm text-gray-500">Actual Pickup Time</div>
                      <div className="font-medium">{formatTimestamp(order.actualPickupTime)}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Return Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Return Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Retailer</div>
                      <div className="font-medium" data-testid="text-retailer">{order.retailer}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Item Category</div>
                      <div className="font-medium">{order.itemCategory || 'N/A'}</div>
                    </div>
                  </div>
                  {order.returnAddress && (
                    <div>
                      <div className="text-sm text-gray-500">Return Address</div>
                      <div className="font-medium">{order.returnAddress}</div>
                    </div>
                  )}
                  {order.itemDescription && (
                    <div>
                      <div className="text-sm text-gray-500">Item Description</div>
                      <div className="font-medium text-sm">{order.itemDescription}</div>
                    </div>
                  )}
                  {order.itemValue && (
                    <div>
                      <div className="text-sm text-gray-500">Item Value</div>
                      <div className="font-medium">${order.itemValue?.toFixed(2)}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pricing Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Price</span>
                    <span className="font-medium" data-testid="text-base-price">${order.basePrice?.toFixed(2) || '0.00'}</span>
                  </div>
                  {order.additionalFees > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Additional Fees</span>
                      <span className="font-medium">${order.additionalFees?.toFixed(2)}</span>
                    </div>
                  )}
                  {order.serviceFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Fee</span>
                      <span className="font-medium">${order.serviceFee?.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span data-testid="text-total-price">${order.totalPrice?.toFixed(2) || '0.00'}</span>
                  </div>
                  {order.driverTotalEarning && (
                    <div className="flex justify-between text-sm text-gray-600 pt-2 border-t">
                      <span>Driver Earnings</span>
                      <span className="font-medium">${order.driverTotalEarning?.toFixed(2)}</span>
                    </div>
                  )}
                  {order.companyRevenue && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Company Revenue</span>
                      <span className="font-medium">${order.companyRevenue?.toFixed(2)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Payment Method</div>
                      <div className="font-medium">{order.paymentMethod || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Payment Status</div>
                      <Badge
                        variant={order.paymentStatus === 'succeeded' ? 'default' : 'secondary'}
                        data-testid="badge-payment-status"
                      >
                        {order.paymentStatus || 'pending'}
                      </Badge>
                    </div>
                  </div>
                  {order.stripePaymentIntentId && (
                    <div>
                      <div className="text-sm text-gray-500">Stripe Payment ID</div>
                      <div className="font-mono text-xs">{order.stripePaymentIntentId}</div>
                    </div>
                  )}
                  {order.refundStatus && (
                    <div>
                      <div className="text-sm text-gray-500">Refund Status</div>
                      <Badge variant="secondary">{order.refundStatus}</Badge>
                    </div>
                  )}
                  {order.refundAmount && (
                    <div>
                      <div className="text-sm text-gray-500">Refund Amount</div>
                      <div className="font-medium">${order.refundAmount?.toFixed(2)}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Driver Information */}
              {driver && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Driver Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Name</div>
                      <div className="font-medium" data-testid="text-driver-name">
                        {driver.firstName} {driver.lastName}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="font-medium">{driver.phone}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Assigned Time</div>
                      <div className="font-medium">{formatTimestamp(order.driverAssignedAt)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Accepted Time</div>
                      <div className="font-medium">{formatTimestamp(order.driverAcceptedAt)}</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Photos */}
              {(order.pickupPhotos?.length > 0 || order.deliveryPhotos?.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Photos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {order.pickupPhotos?.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-500 mb-2">Pickup Photos</div>
                        <div className="grid grid-cols-3 gap-2">
                          {order.pickupPhotos.map((photo: string, index: number) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`Pickup ${index + 1}`}
                              className="rounded-lg object-cover w-full h-32"
                              data-testid={`img-pickup-photo-${index}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {order.deliveryPhotos?.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-500 mb-2">Delivery Photos</div>
                        <div className="grid grid-cols-3 gap-2">
                          {order.deliveryPhotos.map((photo: string, index: number) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`Delivery ${index + 1}`}
                              className="rounded-lg object-cover w-full h-32"
                              data-testid={`img-delivery-photo-${index}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Audit Trail / Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Audit Trail
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {auditLogs.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No audit logs available
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {auditLogs.map((log: any, index: number) => (
                        <div
                          key={log.id || index}
                          className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                          data-testid={`audit-log-${index}`}
                        >
                          <div className="flex-shrink-0 mt-1">
                            {getActionIcon(log.action)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">
                                {log.action.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(log.timestamp)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              Performed by: <span className="font-medium">{log.performedByName}</span>
                              <span className="text-gray-400"> ({log.performedByRole})</span>
                            </div>
                            {(log.oldValue || log.newValue) && (
                              <div className="text-xs text-gray-500 mt-1">
                                {log.oldValue && <span>From: {JSON.stringify(log.oldValue)} </span>}
                                {log.newValue && <span>To: {JSON.stringify(log.newValue)}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              {(order.customerNotes || order.driverNotes || order.adminNotes) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {order.customerNotes && (
                      <div>
                        <div className="text-sm text-gray-500">Customer Notes</div>
                        <div className="text-sm mt-1">{order.customerNotes}</div>
                      </div>
                    )}
                    {order.driverNotes && (
                      <div>
                        <div className="text-sm text-gray-500">Driver Notes</div>
                        <div className="text-sm mt-1">{order.driverNotes}</div>
                      </div>
                    )}
                    {order.adminNotes && (
                      <div>
                        <div className="text-sm text-gray-500">Admin Notes</div>
                        <div className="text-sm mt-1">{order.adminNotes}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} data-testid="button-close">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
