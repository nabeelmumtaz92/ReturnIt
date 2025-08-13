import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth-simple";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  MapPin, 
  Clock, 
  DollarSign, 
  Star, 
  Phone, 
  User, 
  Home,
  Plus,
  Search,
  Bell,
  Settings,
  Camera,
  MessageCircle,
  CreditCard,
  ArrowLeft,
  CheckCircle,
  Truck,
  Navigation,
  HeadphonesIcon
} from 'lucide-react';
import { Link, useLocation } from 'wouter';

type MobileView = 'home' | 'book' | 'orders' | 'order-detail' | 'profile' | 'help';

interface CustomerOrder {
  id: string;
  trackingNumber: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'completed' | 'cancelled';
  retailer: string;
  pickupAddress: string;
  dropoffLocation: string;
  amount: number;
  createdAt: string;
  estimatedDelivery?: string;
  driverName?: string;
  driverPhone?: string;
  driverRating?: number;
}

export default function CustomerMobileApp() {
  const [currentView, setCurrentView] = useState<MobileView>('home');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, setLocation]);

  const { data: orders = [], isLoading: ordersLoading } = useQuery<CustomerOrder[]>({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated
  });

  const activeOrders = orders.filter(order => 
    ['pending', 'assigned', 'picked_up'].includes(order.status)
  );

  const recentOrders = orders.filter(order => 
    ['completed', 'cancelled'].includes(order.status)
  ).slice(0, 5);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-amber-900 mb-4">Sign in required</h2>
            <p className="text-amber-700 mb-4">Please sign in to access the mobile app.</p>
            <Link href="/login">
              <Button className="w-full bg-amber-600 hover:bg-amber-700">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderHome = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-amber-900 mb-2">
          Hello, {user?.firstName || 'Customer'}!
        </h1>
        <p className="text-amber-700">Ready to return something?</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={() => setCurrentView('book')}
          className="h-20 bg-amber-600 hover:bg-amber-700 flex flex-col items-center gap-2"
          data-testid="button-book-pickup"
        >
          <Plus className="h-6 w-6" />
          <span>Book Pickup</span>
        </Button>
        <Button 
          onClick={() => setCurrentView('orders')}
          variant="outline"
          className="h-20 border-amber-300 text-amber-700 hover:bg-amber-50 flex flex-col items-center gap-2"
          data-testid="button-my-orders"
        >
          <Package className="h-6 w-6" />
          <span>My Orders</span>
        </Button>
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-amber-900 mb-3">Active Orders</h2>
          <div className="space-y-3">
            {activeOrders.map(order => (
              <Card 
                key={order.id} 
                className="cursor-pointer hover:shadow-md transition-shadow border-amber-200"
                onClick={() => {
                  setSelectedOrder(order.id);
                  setCurrentView('order-detail');
                }}
                data-testid={`order-card-${order.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-amber-900">{order.retailer}</p>
                      <p className="text-sm text-amber-600">#{order.trackingNumber}</p>
                    </div>
                    <Badge 
                      variant={order.status === 'picked_up' ? 'default' : 'secondary'}
                      className={order.status === 'picked_up' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{order.pickupAddress}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-amber-900 mb-3">Recent Orders</h2>
          <div className="space-y-3">
            {recentOrders.slice(0, 3).map(order => (
              <Card 
                key={order.id} 
                className="cursor-pointer hover:shadow-md transition-shadow border-amber-200"
                onClick={() => {
                  setSelectedOrder(order.id);
                  setCurrentView('order-detail');
                }}
                data-testid={`recent-order-${order.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-amber-900">{order.retailer}</p>
                      <p className="text-sm text-amber-600">#{order.trackingNumber}</p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={order.status === 'completed' ? 'default' : 'destructive'}
                        className={order.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {order.status}
                      </Badge>
                      <p className="text-sm text-amber-700">${order.amount.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {recentOrders.length > 3 && (
            <Button 
              variant="ghost" 
              onClick={() => setCurrentView('orders')}
              className="w-full text-amber-700 hover:bg-amber-50"
            >
              View All Orders
            </Button>
          )}
        </div>
      )}
    </div>
  );

  const [bookingStep, setBookingStep] = useState<'details' | 'items' | 'schedule' | 'payment' | 'confirmation'>('details');
  const [bookingData, setBookingData] = useState({
    retailer: '',
    pickupAddress: '',
    dropoffLocation: 'UPS Store',
    itemCount: 1,
    estimatedValue: '',
    pickupDate: '',
    pickupTime: '',
    specialInstructions: '',
    paymentMethod: 'card'
  });

  const bookPickupMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/orders", data),
    onSuccess: (newOrder) => {
      toast({
        title: "Pickup Booked Successfully!",
        description: `Your tracking number is ${newOrder.trackingNumber}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setCurrentView('orders');
      setBookingStep('details');
      setBookingData({
        retailer: '',
        pickupAddress: '',
        dropoffLocation: 'UPS Store',
        itemCount: 1,
        estimatedValue: '',
        pickupDate: '',
        pickupTime: '',
        specialInstructions: '',
        paymentMethod: 'card'
      });
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "Unable to book pickup. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBookingSubmit = () => {
    // Calculate pricing (same logic as website)
    const estimatedValue = parseFloat(bookingData.estimatedValue) || 0;
    let itemSize = 'Small';
    let itemSizeMultiplier = 1.0;

    if (estimatedValue >= 300) {
      itemSize = 'Extra Large';
      itemSizeMultiplier = 2.0;
    } else if (estimatedValue >= 100) {
      itemSize = 'Large';
      itemSizeMultiplier = 1.75;
    } else if (estimatedValue >= 25) {
      itemSize = 'Medium';
      itemSizeMultiplier = 1.25;
    }

    const baseAmount = 3.99;
    const sizeAmount = baseAmount * itemSizeMultiplier;
    const totalAmount = parseFloat(sizeAmount.toFixed(2));

    bookPickupMutation.mutate({
      ...bookingData,
      estimatedValue,
      itemSize,
      amount: totalAmount,
      driverEarning: Math.round(totalAmount * 0.7 * 100) / 100,
      serviceFee: 3.99,
      status: 'pending'
    });
  };

  const renderBookingStep = () => {
    switch (bookingStep) {
      case 'details':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-amber-800">Store/Retailer</Label>
              <Input
                value={bookingData.retailer}
                onChange={(e) => setBookingData({...bookingData, retailer: e.target.value})}
                placeholder="e.g., Amazon, Target, Best Buy"
                className="border-amber-300"
              />
            </div>
            <div>
              <Label className="text-amber-800">Pickup Address</Label>
              <Input
                value={bookingData.pickupAddress}
                onChange={(e) => setBookingData({...bookingData, pickupAddress: e.target.value})}
                placeholder="123 Main St, City, State 12345"
                className="border-amber-300"
              />
            </div>
            <div>
              <Label className="text-amber-800">Estimated Item Value</Label>
              <Input
                type="number"
                value={bookingData.estimatedValue}
                onChange={(e) => setBookingData({...bookingData, estimatedValue: e.target.value})}
                placeholder="0.00"
                className="border-amber-300"
              />
              <p className="text-xs text-amber-600 mt-1">
                Helps us determine pickup fee and insurance
              </p>
            </div>
            <Button 
              onClick={() => setBookingStep('schedule')}
              disabled={!bookingData.retailer || !bookingData.pickupAddress}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              Continue to Scheduling
            </Button>
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-amber-800">Pickup Date</Label>
              <Input
                type="date"
                value={bookingData.pickupDate}
                onChange={(e) => setBookingData({...bookingData, pickupDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                className="border-amber-300"
              />
            </div>
            <div>
              <Label className="text-amber-800">Preferred Time</Label>
              <select 
                value={bookingData.pickupTime}
                onChange={(e) => setBookingData({...bookingData, pickupTime: e.target.value})}
                className="w-full p-2 border border-amber-300 rounded-md"
              >
                <option value="">Select time</option>
                <option value="morning">Morning (9 AM - 12 PM)</option>
                <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                <option value="evening">Evening (5 PM - 8 PM)</option>
              </select>
            </div>
            <div>
              <Label className="text-amber-800">Special Instructions (Optional)</Label>
              <textarea
                value={bookingData.specialInstructions}
                onChange={(e) => setBookingData({...bookingData, specialInstructions: e.target.value})}
                placeholder="Building access, parking info, etc."
                className="w-full p-2 border border-amber-300 rounded-md h-20 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => setBookingStep('details')}
                className="flex-1 border-amber-300"
              >
                Back
              </Button>
              <Button 
                onClick={() => setBookingStep('payment')}
                disabled={!bookingData.pickupDate || !bookingData.pickupTime}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        );

      case 'payment':
        const estimatedValue = parseFloat(bookingData.estimatedValue) || 0;
        let itemSize = 'Small';
        let itemSizeMultiplier = 1.0;

        if (estimatedValue >= 300) {
          itemSize = 'Extra Large';
          itemSizeMultiplier = 2.0;
        } else if (estimatedValue >= 100) {
          itemSize = 'Large';
          itemSizeMultiplier = 1.75;
        } else if (estimatedValue >= 25) {
          itemSize = 'Medium';
          itemSizeMultiplier = 1.25;
        }

        const baseAmount = 3.99;
        const sizeAmount = baseAmount * itemSizeMultiplier;
        const totalAmount = parseFloat(sizeAmount.toFixed(2));

        return (
          <div className="space-y-4">
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <h3 className="font-semibold text-amber-900 mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-amber-700">Base Service Fee</span>
                    <span className="text-amber-900">$3.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-700">Item Size ({itemSize})</span>
                    <span className="text-amber-900">{itemSizeMultiplier}x</span>
                  </div>
                  <Separator className="bg-amber-200" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-amber-900">Total</span>
                    <span className="text-amber-900">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <Label className="text-amber-800">Payment Method</Label>
              <select 
                value={bookingData.paymentMethod}
                onChange={(e) => setBookingData({...bookingData, paymentMethod: e.target.value})}
                className="w-full p-2 border border-amber-300 rounded-md"
              >
                <option value="card">Credit/Debit Card</option>
                <option value="paypal">PayPal</option>
                <option value="apple_pay">Apple Pay</option>
                <option value="google_pay">Google Pay</option>
              </select>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => setBookingStep('schedule')}
                className="flex-1 border-amber-300"
              >
                Back
              </Button>
              <Button 
                onClick={handleBookingSubmit}
                disabled={bookPickupMutation.isPending}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                {bookPickupMutation.isPending ? 'Booking...' : `Book Pickup - $${totalAmount.toFixed(2)}`}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderBooking = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            if (bookingStep === 'details') {
              setCurrentView('home');
            } else {
              setBookingStep('details');
            }
          }}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold text-amber-900">Book Pickup</h1>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center gap-2 mb-6">
        <div className={`w-3 h-3 rounded-full ${bookingStep === 'details' ? 'bg-amber-600' : 'bg-amber-200'}`} />
        <div className="flex-1 h-px bg-amber-200" />
        <div className={`w-3 h-3 rounded-full ${bookingStep === 'schedule' ? 'bg-amber-600' : 'bg-amber-200'}`} />
        <div className="flex-1 h-px bg-amber-200" />
        <div className={`w-3 h-3 rounded-full ${bookingStep === 'payment' ? 'bg-amber-600' : 'bg-amber-200'}`} />
      </div>

      <Card className="border-amber-200">
        <CardContent className="p-6">
          {renderBookingStep()}
        </CardContent>
      </Card>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCurrentView('home')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold text-amber-900">My Orders</h1>
      </div>

      {ordersLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : orders.length === 0 ? (
        <Card className="border-amber-200">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-amber-900 mb-2">No Orders Yet</h2>
            <p className="text-amber-700 mb-4">Book your first pickup to get started!</p>
            <Button 
              onClick={() => setCurrentView('book')}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Book First Pickup
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Card 
              key={order.id} 
              className="cursor-pointer hover:shadow-md transition-shadow border-amber-200"
              onClick={() => {
                setSelectedOrder(order.id);
                setCurrentView('order-detail');
              }}
              data-testid={`order-list-${order.id}`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium text-amber-900">{order.retailer}</p>
                    <p className="text-sm text-amber-600">#{order.trackingNumber}</p>
                  </div>
                  <Badge 
                    variant={order.status === 'completed' ? 'default' : 
                             order.status === 'cancelled' ? 'destructive' : 'secondary'}
                    className={order.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {order.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-amber-700">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{order.pickupAddress}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>${order.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const selectedOrderData = orders.find(order => order.id === selectedOrder);

  const renderOrderDetail = () => {
    if (!selectedOrderData) {
      setCurrentView('orders');
      return null;
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCurrentView('orders')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-amber-900">Order Details</h1>
        </div>

        <Card className="border-amber-200">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-amber-900">{selectedOrderData.retailer}</CardTitle>
                <p className="text-amber-600">#{selectedOrderData.trackingNumber}</p>
              </div>
              <Badge 
                variant={selectedOrderData.status === 'completed' ? 'default' : 
                         selectedOrderData.status === 'cancelled' ? 'destructive' : 'secondary'}
                className={selectedOrderData.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
              >
                {selectedOrderData.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-amber-800 font-medium">Pickup Address</Label>
              <p className="text-amber-700">{selectedOrderData.pickupAddress}</p>
            </div>
            
            <div>
              <Label className="text-amber-800 font-medium">Drop-off Location</Label>
              <p className="text-amber-700">{selectedOrderData.dropoffLocation}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-800 font-medium">Amount</Label>
                <p className="text-amber-700">${selectedOrderData.amount.toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-amber-800 font-medium">Date</Label>
                <p className="text-amber-700">{new Date(selectedOrderData.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {selectedOrderData.driverName && (
              <div>
                <Label className="text-amber-800 font-medium">Driver</Label>
                <div className="flex items-center justify-between mt-1">
                  <div>
                    <p className="text-amber-700">{selectedOrderData.driverName}</p>
                    {selectedOrderData.driverRating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-amber-600">{selectedOrderData.driverRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  {selectedOrderData.driverPhone && (
                    <Button size="sm" variant="outline" className="border-amber-300">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  )}
                </div>
              </div>
            )}

            {selectedOrderData.estimatedDelivery && (
              <div>
                <Label className="text-amber-800 font-medium">Estimated Delivery</Label>
                <p className="text-amber-700">{selectedOrderData.estimatedDelivery}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          {['pending', 'assigned', 'picked_up'].includes(selectedOrderData.status) && (
            <Link href={`/order-status?tracking=${selectedOrderData.trackingNumber}`}>
              <Button className="w-full bg-amber-600 hover:bg-amber-700" data-testid="button-track-order">
                <Navigation className="h-4 w-4 mr-2" />
                Track Live
              </Button>
            </Link>
          )}
          
          <Button 
            variant="outline" 
            className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
            data-testid="button-contact-support"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCurrentView('home')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold text-amber-900">Profile</h1>
      </div>

      <Card className="border-amber-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-amber-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-amber-600">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-amber-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-amber-900">{orders.length}</p>
                <p className="text-sm text-amber-600">Total Orders</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-amber-900">
                  ${orders.reduce((sum, order) => sum + order.amount, 0).toFixed(0)}
                </p>
                <p className="text-sm text-amber-600">Total Spent</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Button variant="outline" className="w-full justify-start border-amber-300 text-amber-700">
          <CreditCard className="h-4 w-4 mr-3" />
          Payment Methods
        </Button>
        <Button variant="outline" className="w-full justify-start border-amber-300 text-amber-700">
          <Home className="h-4 w-4 mr-3" />
          Saved Addresses
        </Button>
        <Button variant="outline" className="w-full justify-start border-amber-300 text-amber-700">
          <Bell className="h-4 w-4 mr-3" />
          Notifications
        </Button>
        <Button variant="outline" className="w-full justify-start border-amber-300 text-amber-700">
          <Settings className="h-4 w-4 mr-3" />
          Settings
        </Button>
      </div>
    </div>
  );

  const renderHelp = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCurrentView('home')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold text-amber-900">Help & Support</h1>
      </div>

      <div className="space-y-4">
        <Card className="border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-amber-600" />
              <div>
                <h3 className="font-medium text-amber-900">Live Chat</h3>
                <p className="text-sm text-amber-700">Get instant help from our support team</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Phone className="h-6 w-6 text-amber-600" />
              <div>
                <h3 className="font-medium text-amber-900">Call Support</h3>
                <p className="text-sm text-amber-700">(314) 555-0199</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Link href="/help-center">
          <Card className="border-amber-200 cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Search className="h-6 w-6 text-amber-600" />
                <div>
                  <h3 className="font-medium text-amber-900">Help Center</h3>
                  <p className="text-sm text-amber-700">Browse articles and FAQs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home': return renderHome();
      case 'book': return renderBooking();
      case 'orders': return renderOrders();
      case 'order-detail': return renderOrderDetail();
      case 'profile': return renderProfile();
      case 'help': return renderHelp();
      default: return renderHome();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Mobile App Header */}
      <div className="bg-white shadow-sm border-b border-amber-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logo-cardboard-deep.png" 
                alt="Returnly" 
                className="h-8 w-auto"
              />
              <h1 className="text-lg font-bold text-amber-900">Returnly</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="p-2">
                <Bell className="h-5 w-5 text-amber-700" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <HeadphonesIcon className="h-5 w-5 text-amber-700" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 pb-20">
        {renderCurrentView()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-200 shadow-lg">
        <div className="grid grid-cols-5 h-16">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('home')}
            className={`flex flex-col items-center justify-center gap-1 rounded-none h-full ${
              currentView === 'home' ? 'bg-amber-50 text-amber-700' : 'text-amber-600'
            }`}
            data-testid="nav-home"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => setCurrentView('book')}
            className={`flex flex-col items-center justify-center gap-1 rounded-none h-full ${
              currentView === 'book' ? 'bg-amber-50 text-amber-700' : 'text-amber-600'
            }`}
            data-testid="nav-book"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs">Book</span>
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => setCurrentView('orders')}
            className={`flex flex-col items-center justify-center gap-1 rounded-none h-full ${
              currentView === 'orders' ? 'bg-amber-50 text-amber-700' : 'text-amber-600'
            }`}
            data-testid="nav-orders"
          >
            <Package className="h-5 w-5" />
            <span className="text-xs">Orders</span>
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => setCurrentView('profile')}
            className={`flex flex-col items-center justify-center gap-1 rounded-none h-full ${
              currentView === 'profile' ? 'bg-amber-50 text-amber-700' : 'text-amber-600'
            }`}
            data-testid="nav-profile"
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => setCurrentView('help')}
            className={`flex flex-col items-center justify-center gap-1 rounded-none h-full ${
              currentView === 'help' ? 'bg-amber-50 text-amber-700' : 'text-amber-600'
            }`}
            data-testid="nav-help"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs">Help</span>
          </Button>
        </div>
      </div>
    </div>
  );
}