import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  MapPin, 
  Clock, 
  Package, 
  DollarSign, 
  Navigation, 
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

interface PaymentBreakdown {
  driverBasePay: number;
  driverDistancePay: number;
  driverTimePay: number;
  driverSizeBonus: number;
  driverTip: number;
  driverTotalEarning: number;
}

interface Order {
  id: string;
  status: string;
  pickupStreetAddress: string;
  pickupCity: string;
  pickupState: string;
  retailer: string;
  boxSize: string;
  numberOfBoxes: number;
  estimatedDistance?: string;
  estimatedTime?: string;
  paymentBreakdown?: PaymentBreakdown;
  scheduledPickupTime?: string;
  customerPhone?: string;
  pickupInstructions?: string;
}

interface DriverOrderCardProps {
  order: Order;
  onAccept?: (orderId: string) => void;
  onDecline?: (orderId: string) => void;
  showActions?: boolean;
}

export default function DriverOrderCard({ 
  order, 
  onAccept, 
  onDecline, 
  showActions = true 
}: DriverOrderCardProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const { toast } = useToast();

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const response = await apiRequest('PATCH', `/api/orders/${order.id}/accept`, {});
      
      if (response.ok) {
        onAccept?.(order.id);
        toast({
          title: "Order Accepted!",
          description: "Navigate to pickup location to start delivery",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    setIsDeclining(true);
    try {
      const response = await apiRequest('PATCH', `/api/orders/${order.id}/decline`, {});
      
      if (response.ok) {
        onDecline?.(order.id);
        toast({
          title: "Order Declined",
          description: "Order will be offered to other drivers",
        });
      }
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to decline order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeclining(false);
    }
  };

  const getStatusBadge = () => {
    switch (order.status) {
      case 'assigned':
        return <Badge className="bg-blue-100 text-blue-800">Assigned to You</Badge>;
      case 'created':
        return <Badge className="bg-yellow-100 text-yellow-800">Available</Badge>;
      case 'picked_up':
        return <Badge className="bg-orange-100 text-orange-800">In Transit</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge variant="secondary">{order.status}</Badge>;
    }
  };

  const earnings = order.paymentBreakdown?.driverTotalEarning || 0;

  return (
    <Card className="border-amber-200 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-amber-900 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order #{order.id.slice(-6)}
            </CardTitle>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <Badge variant="outline" className="border-amber-300">
                {order.boxSize} • {order.numberOfBoxes} box{order.numberOfBoxes > 1 ? 'es' : ''}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              ${earnings.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">You'll earn</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location Info */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Pickup</p>
              <p className="text-sm text-gray-600">
                {order.pickupStreetAddress}, {order.pickupCity}, {order.pickupState}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Navigation className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Return to</p>
              <p className="text-sm text-gray-600">{order.retailer}</p>
            </div>
          </div>
        </div>

        {/* Trip Details */}
        {(order.estimatedDistance || order.estimatedTime) && (
          <div className="grid grid-cols-2 gap-4 py-2 bg-amber-50 rounded-lg px-3">
            {order.estimatedDistance && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-600" />
                <span className="text-sm">{order.estimatedDistance}</span>
              </div>
            )}
            {order.estimatedTime && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-sm">{order.estimatedTime}</span>
              </div>
            )}
          </div>
        )}

        {/* Payment Breakdown */}
        {order.paymentBreakdown && (
          <div className="space-y-2">
            <Separator />
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Payment Breakdown
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Base pay:</span>
                <span>${order.paymentBreakdown.driverBasePay.toFixed(2)}</span>
              </div>
              {order.paymentBreakdown.driverDistancePay > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Distance pay:</span>
                  <span>${order.paymentBreakdown.driverDistancePay.toFixed(2)}</span>
                </div>
              )}
              {order.paymentBreakdown.driverTimePay > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Time pay:</span>
                  <span>${order.paymentBreakdown.driverTimePay.toFixed(2)}</span>
                </div>
              )}
              {order.paymentBreakdown.driverSizeBonus > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Size bonus:</span>
                  <span>${order.paymentBreakdown.driverSizeBonus.toFixed(2)}</span>
                </div>
              )}
              {order.paymentBreakdown.driverTip > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tip:</span>
                  <span>${order.paymentBreakdown.driverTip.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Special Instructions */}
        {order.pickupInstructions && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-900">Pickup Instructions</p>
                <p className="text-sm text-blue-800">{order.pickupInstructions}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && order.status === 'created' && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleDecline}
              disabled={isDeclining || isAccepting}
              className="border-red-300 text-red-700 hover:bg-red-50"
              data-testid={`button-decline-${order.id}`}
            >
              {isDeclining ? (
                "Declining..."
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline
                </>
              )}
            </Button>
            
            <Button
              onClick={handleAccept}
              disabled={isAccepting || isDeclining}
              className="bg-green-600 hover:bg-green-700"
              data-testid={`button-accept-${order.id}`}
            >
              {isAccepting ? (
                "Accepting..."
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept
                </>
              )}
            </Button>
          </div>
        )}

        {/* Contact Customer */}
        {order.status === 'assigned' && order.customerPhone && (
          <Button
            variant="outline"
            className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
            onClick={() => window.open(`tel:${order.customerPhone}`)}
            data-testid={`button-call-customer-${order.id}`}
          >
            <Phone className="h-4 w-4 mr-2" />
            Call Customer
          </Button>
        )}
      </CardContent>
    </Card>
  );
}