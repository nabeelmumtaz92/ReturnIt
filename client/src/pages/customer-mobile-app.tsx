import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth-simple";
import { MobileLogin } from '@/components/MobileLogin';
import { ReturnItIcon } from '@/components/ReturnItLogo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from "@/hooks/use-toast";
import { 
  Package, MapPin, Clock, DollarSign, Star, Phone, User, Home, Plus, Search,
  Bell, Settings, Camera, MessageCircle, CreditCard, ArrowLeft, CheckCircle,
  Truck, Navigation, LogOut, Download, X, Send, ImageIcon, Tag, XCircle, Edit, Trash2
} from 'lucide-react';
import { Link } from 'wouter';

type MobileView = 'home' | 'book' | 'orders' | 'order-detail' | 'profile' | 'help' | 'track-live' | 'chat' | 'photo-view';

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
  packagePhoto?: string;
  promoCode?: string;
  discount?: number;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  expiryDate?: string;
  isDefault: boolean;
}

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export default function CustomerMobileAppEnhanced() {
  const [currentView, setCurrentView] = useState<MobileView>('home');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Modal states
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [orderToRate, setOrderToRate] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{sender: string, message: string, time: string}>>([]);
  const [newMessage, setNewMessage] = useState('');

  // Booking state with promo code
  const [bookingStep, setBookingStep] = useState<'details' | 'schedule' | 'payment' | 'confirmation'>('details');
  const [bookingData, setBookingData] = useState({
    retailer: '',
    pickupAddress: '',
    dropoffLocation: 'UPS Store',
    estimatedValue: '',
    pickupDate: '',
    pickupTime: '',
    specialInstructions: '',
    paymentMethod: 'card',
    promoCode: '',
    discount: 0
  });

  // Backend-connected data with React Query
  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/customers/payment-methods"],
    enabled: isAuthenticated,
  });

  const { data: savedAddresses = [], isLoading: addressesLoading } = useQuery<SavedAddress[]>({
    queryKey: ["/api/customers/addresses"],
    enabled: isAuthenticated,
  });

  const { data: notificationSettings = {
    orderUpdates: true,
    driverMessages: true,
    promotions: false,
    push: true,
    sms: true,
    email: true
  }, isLoading: notificationsLoading } = useQuery<any>({
    queryKey: ["/api/customers/notification-settings"],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return <MobileLogin onLogin={() => {}} isDriver={false} />;
  }

  const { data: orders = [], isLoading: ordersLoading } = useQuery<CustomerOrder[]>({
    queryKey: ["/api/customers/orders"],
    enabled: isAuthenticated,
    refetchInterval: 30000,
    retry: 3
  });

  const activeOrders = orders.filter(order => 
    ['pending', 'assigned', 'picked_up'].includes(order.status)
  );

  const selectedOrderData = orders.find(order => order.id === selectedOrder);

  // Mutations
  const bookPickupMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/orders", data),
    onSuccess: (newOrder: any) => {
      toast({
        title: "Pickup Booked Successfully!",
        description: `Your tracking number is ${newOrder.trackingNumber || newOrder.id}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers/orders"] });
      setCurrentView('orders');
      setBookingStep('details');
      setBookingData({
        retailer: '',
        pickupAddress: '',
        dropoffLocation: 'UPS Store',
        estimatedValue: '',
        pickupDate: '',
        pickupTime: '',
        specialInstructions: '',
        paymentMethod: 'card',
        promoCode: '',
        discount: 0
      });
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Unable to book pickup",
        variant: "destructive",
      });
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) => apiRequest("POST", `/api/orders/${orderId}/cancel`, {}),
    onSuccess: () => {
      toast({
        title: "Order Cancelled",
        description: "Your pickup has been cancelled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers/orders"] });
      setShowCancelDialog(false);
      setOrderToCancel(null);
    },
  });

  const rateOrderMutation = useMutation({
    mutationFn: (data: { orderId: string; rating: number; feedback: string }) => 
      apiRequest("POST", `/api/orders/${data.orderId}/rate`, { rating: data.rating, feedback: data.feedback }),
    onSuccess: () => {
      toast({
        title: "Thank you for your feedback!",
        description: "Your rating has been submitted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers/orders"] });
      setShowRatingDialog(false);
      setOrderToRate(null);
      setRating(0);
      setFeedback('');
    },
  });

  const applyPromoCodeMutation = useMutation({
    mutationFn: (code: string) => apiRequest("POST", "/api/promo/validate", { code }),
    onSuccess: (data: any) => {
      if (data.valid) {
        setBookingData({
          ...bookingData,
          promoCode: data.code,
          discount: data.discount || 0
        });
        toast({
          title: "Promo Code Applied!",
          description: `You saved $${data.discount?.toFixed(2) || '0.00'}`,
        });
      } else {
        toast({
          title: "Invalid Promo Code",
          variant: "destructive",
        });
      }
    },
  });

  // Payment Methods Mutations
  const addPaymentMethodMutation = useMutation({
    mutationFn: (method: any) => apiRequest("POST", "/api/customers/payment-methods", method),
    onSuccess: () => {
      toast({ title: "Payment Method Added" });
      queryClient.invalidateQueries({ queryKey: ["/api/customers/payment-methods"] });
      setShowPaymentMethods(false);
    },
  });

  const deletePaymentMethodMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/customers/payment-methods/${id}`, {}),
    onSuccess: () => {
      toast({ title: "Payment Method Removed" });
      queryClient.invalidateQueries({ queryKey: ["/api/customers/payment-methods"] });
    },
  });

  const setDefaultPaymentMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/customers/payment-methods/${id}/set-default`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers/payment-methods"] });
    },
  });

  // Addresses Mutations
  const addAddressMutation = useMutation({
    mutationFn: (address: any) => apiRequest("POST", "/api/customers/addresses", address),
    onSuccess: () => {
      toast({ title: "Address Added" });
      queryClient.invalidateQueries({ queryKey: ["/api/customers/addresses"] });
      setShowAddresses(false);
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/customers/addresses/${id}`, {}),
    onSuccess: () => {
      toast({ title: "Address Removed" });
      queryClient.invalidateQueries({ queryKey: ["/api/customers/addresses"] });
    },
  });

  const setDefaultAddressMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/customers/addresses/${id}/set-default`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers/addresses"] });
    },
  });

  // Notification Settings Mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: (settings: any) => apiRequest("PATCH", "/api/customers/notification-settings", settings),
    onSuccess: () => {
      toast({ title: "Notification Settings Updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/customers/notification-settings"] });
    },
  });

  const calculateTotal = () => {
    const estimatedValue = parseFloat(bookingData.estimatedValue) || 0;
    let itemSizeMultiplier = 1.0;
    if (estimatedValue >= 300) itemSizeMultiplier = 2.0;
    else if (estimatedValue >= 100) itemSizeMultiplier = 1.75;
    else if (estimatedValue >= 25) itemSizeMultiplier = 1.25;

    const baseAmount = 3.99;
    const sizeAmount = baseAmount * itemSizeMultiplier;
    const subtotal = parseFloat(sizeAmount.toFixed(2));
    const total = subtotal - bookingData.discount;
    return { subtotal, total };
  };

  const handleBookingSubmit = () => {
    const { total } = calculateTotal();
    const estimatedValue = parseFloat(bookingData.estimatedValue) || 0;
    let itemSize = 'Small';
    if (estimatedValue >= 300) itemSize = 'Extra Large';
    else if (estimatedValue >= 100) itemSize = 'Large';
    else if (estimatedValue >= 25) itemSize = 'Medium';

    bookPickupMutation.mutate({
      ...bookingData,
      estimatedValue,
      itemSize,
      amount: total,
      driverEarning: Math.round(total * 0.7 * 100) / 100,
      serviceFee: 3.99,
      status: 'pending'
    });
  };

  const downloadReceipt = (order: CustomerOrder) => {
    const receiptData = `
RETURNIT RECEIPT
================
Order #${order.trackingNumber}
Date: ${new Date(order.createdAt).toLocaleString()}

Retailer: ${order.retailer}
Pickup: ${order.pickupAddress}
Dropoff: ${order.dropoffLocation}

Amount: $${order.amount.toFixed(2)}
${order.promoCode ? `Promo: ${order.promoCode} (-$${order.discount?.toFixed(2) || '0.00'})` : ''}

Status: ${order.status}
Driver: ${order.driverName || 'TBD'}

Thank you for using ReturnIt!
================
    `.trim();

    const blob = new Blob([receiptData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${order.trackingNumber}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Receipt Downloaded",
      description: "Your receipt has been downloaded",
    });
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    setChatMessages([...chatMessages, {
      sender: 'You',
      message: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setNewMessage('');
    
    // Simulate driver response
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        sender: 'Driver',
        message: 'Got it, I\'ll be there soon!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 2000);
  };

  // Payment Methods Dialog
  const renderPaymentMethodsDialog = () => (
    <Dialog open={showPaymentMethods} onOpenChange={setShowPaymentMethods}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Methods</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <Card key={method.id} className="border-amber-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium">
                      {method.type === 'card' ? `Card ending in ${method.last4}` : 
                       method.type === 'paypal' ? 'PayPal' :
                       method.type === 'apple_pay' ? 'Apple Pay' : 'Google Pay'}
                    </p>
                    {method.expiryDate && (
                      <p className="text-sm text-muted-foreground">Expires {method.expiryDate}</p>
                    )}
                    {method.isDefault && (
                      <Badge variant="secondary" className="mt-1">Default</Badge>
                    )}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => deletePaymentMethodMutation.mutate(method.id)}
                  disabled={deletePaymentMethodMutation.isPending}
                  data-testid={`button-delete-payment-${method.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
          <Button 
            className="w-full" 
            variant="outline"
            data-testid="button-add-payment-method"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Saved Addresses Dialog
  const renderAddressesDialog = () => (
    <Dialog open={showAddresses} onOpenChange={setShowAddresses}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Saved Addresses</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {savedAddresses.map((addr) => (
            <Card key={addr.id} className="border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{addr.label}</p>
                      {addr.isDefault && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {addr.address}<br/>
                      {addr.city}, {addr.state} {addr.zipCode}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      data-testid={`button-edit-address-${addr.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteAddressMutation.mutate(addr.id)}
                      disabled={deleteAddressMutation.isPending}
                      data-testid={`button-delete-address-${addr.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button 
            className="w-full" 
            variant="outline"
            data-testid="button-add-address"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Address
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Notifications Dialog
  const renderNotificationsDialog = () => (
    <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {[
            { key: 'orderUpdates', label: 'Order Updates', desc: 'Get notified about order status changes' },
            { key: 'driverMessages', label: 'Driver Messages', desc: 'Receive messages from your driver' },
            { key: 'promotions', label: 'Promotions & Offers', desc: 'Special deals and promo codes' },
            { key: 'push', label: 'Push Notifications', desc: 'Mobile push notifications' },
            { key: 'sms', label: 'SMS Alerts', desc: 'Text message notifications' },
            { key: 'email', label: 'Email Notifications', desc: 'Email updates' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex-1">
                <p className="font-medium">{label}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
              <Button
                variant={notificationSettings[key as keyof typeof notificationSettings] ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const updated = {
                    ...notificationSettings,
                    [key]: !notificationSettings[key as keyof typeof notificationSettings]
                  };
                  updateNotificationsMutation.mutate(updated);
                }}
                disabled={updateNotificationsMutation.isPending}
                data-testid={`button-toggle-${key}`}
              >
                {notificationSettings[key as keyof typeof notificationSettings] ? 'On' : 'Off'}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  // Live Tracking View
  const renderLiveTracking = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCurrentView('order-detail')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold text-amber-900">Live Tracking</h1>
      </div>

      <Card className="border-amber-200">
        <CardContent className="p-0">
          <div className="aspect-video bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center relative">
            <MapPin className="h-16 w-16 text-amber-600" />
            <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg">
              <p className="text-sm font-medium">Driver is 5 min away</p>
              <p className="text-xs text-muted-foreground">Moving towards pickup location</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedOrderData?.driverName && (
        <Card className="border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">{selectedOrderData.driverName}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{selectedOrderData.driverRating || 4.9}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setCurrentView('chat')}
                  data-testid="button-message-driver"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm"
                  onClick={() => window.location.href = `tel:${selectedOrderData.driverPhone}`}
                  data-testid="button-call-driver"
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Chat View
  const renderChat = () => (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="flex items-center gap-3 mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCurrentView('track-live')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold text-amber-900">Chat with Driver</h1>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 border rounded-lg p-4 bg-amber-50/50">
        {chatMessages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 text-amber-400" />
            <p>No messages yet</p>
            <p className="text-sm">Send a message to your driver</p>
          </div>
        ) : (
          chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${
                msg.sender === 'You' ? 'bg-amber-600 text-white' : 'bg-white border'
              }`}>
                <p className="text-sm">{msg.message}</p>
                <p className={`text-xs mt-1 ${msg.sender === 'You' ? 'text-amber-100' : 'text-muted-foreground'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1"
          data-testid="input-chat-message"
        />
        <Button onClick={sendMessage} data-testid="button-send-message">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // Photo View
  const renderPhotoView = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCurrentView('order-detail')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold text-amber-900">Package Photo</h1>
      </div>

      <Card className="border-amber-200">
        <CardContent className="p-0">
          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            {selectedOrderData?.packagePhoto ? (
              <img 
                src={selectedOrderData.packagePhoto} 
                alt="Package" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                <p className="text-muted-foreground">No photo available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            This photo was taken by your driver as proof of pickup. All photos are encrypted and stored securely.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  // Enhanced Order Detail
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
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-amber-600">{selectedOrderData.driverRating || 4.9}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          {['assigned', 'picked_up'].includes(selectedOrderData.status) && (
            <Button
              onClick={() => setCurrentView('track-live')}
              className="bg-amber-600 hover:bg-amber-700"
              data-testid="button-track-live"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Track Live
            </Button>
          )}
          
          {selectedOrderData.packagePhoto && (
            <Button
              variant="outline"
              onClick={() => setCurrentView('photo-view')}
              className="border-amber-300"
              data-testid="button-view-photo"
            >
              <Camera className="h-4 w-4 mr-2" />
              View Photo
            </Button>
          )}

          {selectedOrderData.status === 'completed' && (
            <>
              <Button
                variant="outline"
                onClick={() => downloadReceipt(selectedOrderData)}
                className="border-amber-300"
                data-testid="button-download-receipt"
              >
                <Download className="h-4 w-4 mr-2" />
                Receipt
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setOrderToRate(selectedOrderData.id);
                  setShowRatingDialog(true);
                }}
                className="border-amber-300"
                data-testid="button-rate-driver"
              >
                <Star className="h-4 w-4 mr-2" />
                Rate Driver
              </Button>
            </>
          )}

          {['pending', 'assigned'].includes(selectedOrderData.status) && (
            <Button
              variant="outline"
              onClick={() => {
                setOrderToCancel(selectedOrderData.id);
                setShowCancelDialog(true);
              }}
              className="border-red-300 text-red-700 hover:bg-red-50 col-span-2"
              data-testid="button-cancel-order"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Order
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Booking with Promo Code
  const renderBooking = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            if (bookingStep === 'details') {
              setCurrentView('home');
            } else if (bookingStep === 'schedule') {
              setBookingStep('details');
            } else if (bookingStep === 'payment') {
              setBookingStep('schedule');
            }
          }}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold text-amber-900">Book Pickup</h1>
      </div>

      {bookingStep === 'details' && (
        <div className="space-y-4">
          <div>
            <Label>Store/Retailer</Label>
            <Input
              value={bookingData.retailer}
              onChange={(e) => setBookingData({...bookingData, retailer: e.target.value})}
              placeholder="e.g., Amazon, Target"
            />
          </div>
          <div>
            <Label>Pickup Address</Label>
            <Input
              value={bookingData.pickupAddress}
              onChange={(e) => setBookingData({...bookingData, pickupAddress: e.target.value})}
              placeholder="123 Main St"
            />
          </div>
          <div>
            <Label>Estimated Value</Label>
            <Input
              type="number"
              value={bookingData.estimatedValue}
              onChange={(e) => setBookingData({...bookingData, estimatedValue: e.target.value})}
              placeholder="0.00"
            />
          </div>
          <Button 
            onClick={() => setBookingStep('schedule')}
            disabled={!bookingData.retailer || !bookingData.pickupAddress}
            className="w-full bg-amber-600"
          >
            Continue
          </Button>
        </div>
      )}

      {bookingStep === 'schedule' && (
        <div className="space-y-4">
          <div>
            <Label>Pickup Date</Label>
            <Input
              type="date"
              value={bookingData.pickupDate}
              onChange={(e) => setBookingData({...bookingData, pickupDate: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <Label>Preferred Time</Label>
            <select 
              value={bookingData.pickupTime}
              onChange={(e) => setBookingData({...bookingData, pickupTime: e.target.value})}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select time</option>
              <option value="morning">Morning (9-12)</option>
              <option value="afternoon">Afternoon (12-5)</option>
              <option value="evening">Evening (5-8)</option>
            </select>
          </div>
          <div>
            <Label>Special Instructions</Label>
            <Textarea
              value={bookingData.specialInstructions}
              onChange={(e) => setBookingData({...bookingData, specialInstructions: e.target.value})}
              placeholder="Building access, parking info, etc."
            />
          </div>
          <Button 
            onClick={() => setBookingStep('payment')}
            disabled={!bookingData.pickupDate || !bookingData.pickupTime}
            className="w-full bg-amber-600"
          >
            Continue to Payment
          </Button>
        </div>
      )}

      {bookingStep === 'payment' && (
        <div className="space-y-4">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>${calculateTotal().subtotal.toFixed(2)}</span>
                </div>
                {bookingData.promoCode && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo: {bookingData.promoCode}</span>
                    <span>-${bookingData.discount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${calculateTotal().total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <Label>Promo Code</Label>
            <div className="flex gap-2">
              <Input
                value={bookingData.promoCode}
                onChange={(e) => setBookingData({...bookingData, promoCode: e.target.value})}
                placeholder="Enter code"
                data-testid="input-promo-code"
              />
              <Button 
                variant="outline"
                onClick={() => bookingData.promoCode && applyPromoCodeMutation.mutate(bookingData.promoCode)}
                disabled={!bookingData.promoCode}
                data-testid="button-apply-promo"
              >
                <Tag className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label>Payment Method</Label>
            <select 
              value={bookingData.paymentMethod}
              onChange={(e) => setBookingData({...bookingData, paymentMethod: e.target.value})}
              className="w-full p-2 border rounded-md"
            >
              <option value="card">Credit/Debit Card</option>
              <option value="paypal">PayPal</option>
              <option value="apple_pay">Apple Pay</option>
              <option value="google_pay">Google Pay</option>
            </select>
          </div>

          <Button 
            onClick={handleBookingSubmit}
            disabled={bookPickupMutation.isPending}
            className="w-full bg-amber-600"
            data-testid="button-book-confirm"
          >
            {bookPickupMutation.isPending ? 'Booking...' : `Book - $${calculateTotal().total.toFixed(2)}`}
          </Button>
        </div>
      )}
    </div>
  );

  // Home, Orders, Profile (keeping existing implementations)
  const renderHome = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <ReturnItIcon size={48} className="text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-amber-900 mb-2">
          Hello, {user?.firstName || 'Customer'}!
        </h1>
        <p className="text-amber-700">Ready to return something?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={() => setCurrentView('book')}
          className="h-20 bg-amber-600 hover:bg-amber-700 flex flex-col gap-2"
          data-testid="button-book-pickup"
        >
          <Plus className="h-6 w-6" />
          <span>Book Pickup</span>
        </Button>
        <Button 
          onClick={() => setCurrentView('orders')}
          variant="outline"
          className="h-20 border-amber-300 flex flex-col gap-2"
          data-testid="button-my-orders"
        >
          <Package className="h-6 w-6" />
          <span>My Orders</span>
        </Button>
      </div>

      {activeOrders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-amber-900 mb-3">Active Orders</h2>
          {activeOrders.map(order => (
            <Card 
              key={order.id} 
              className="cursor-pointer hover:shadow-md transition-shadow mb-3"
              onClick={() => {
                setSelectedOrder(order.id);
                setCurrentView('order-detail');
              }}
              data-testid={`order-card-${order.id}`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{order.retailer}</p>
                    <p className="text-sm text-muted-foreground">#{order.trackingNumber}</p>
                  </div>
                  <Badge>{order.status.replace('_', ' ')}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => setCurrentView('home')} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold text-amber-900">My Orders</h1>
      </div>
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto mb-4 text-amber-400" />
          <p className="text-muted-foreground">No orders yet</p>
        </div>
      ) : (
        orders.map(order => (
          <Card 
            key={order.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setSelectedOrder(order.id);
              setCurrentView('order-detail');
            }}
            data-testid={`order-item-${order.id}`}
          >
            <CardContent className="p-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{order.retailer}</p>
                  <p className="text-sm text-muted-foreground">#{order.trackingNumber}</p>
                </div>
                <div className="text-right">
                  <Badge>{order.status}</Badge>
                  <p className="text-sm">${order.amount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => setCurrentView('home')} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold text-amber-900">Profile</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{user?.firstName} {user?.lastName}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-2xl font-bold">{orders.length}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-2xl font-bold">
                ${orders.reduce((sum, order) => sum + order.amount, 0).toFixed(0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => setShowPaymentMethods(true)}
          data-testid="button-payment-methods"
        >
          <CreditCard className="h-4 w-4 mr-3" />
          Payment Methods
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => setShowAddresses(true)}
          data-testid="button-saved-addresses"
        >
          <Home className="h-4 w-4 mr-3" />
          Saved Addresses
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => setShowNotifications(true)}
          data-testid="button-notifications"
        >
          <Bell className="h-4 w-4 mr-3" />
          Notifications
        </Button>
        <Button 
          variant="outline"
          onClick={logout} 
          className="w-full justify-start border-red-300 text-red-700"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </Button>
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
      case 'track-live': return renderLiveTracking();
      case 'chat': return renderChat();
      case 'photo-view': return renderPhotoView();
      default: return renderHome();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-muted w-full max-w-md mx-auto">
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ReturnItIcon size={32} className="text-primary" />
            <h1 className="text-lg font-bold">Return It</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCurrentView('book')} className="p-2">
              <Plus className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setCurrentView('profile')} className="p-2">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 pb-20">
        {renderCurrentView()}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="grid grid-cols-3 h-16 max-w-md mx-auto">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('home')}
            className={`flex flex-col gap-1 rounded-none ${currentView === 'home' ? 'bg-amber-50 text-amber-700' : ''}`}
            data-testid="nav-home"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => setCurrentView('orders')}
            className={`flex flex-col gap-1 rounded-none ${currentView === 'orders' ? 'bg-amber-50 text-amber-700' : ''}`}
            data-testid="nav-orders"
          >
            <Package className="h-5 w-5" />
            <span className="text-xs">Orders</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => setCurrentView('profile')}
            className={`flex flex-col gap-1 rounded-none ${currentView === 'profile' ? 'bg-amber-50 text-amber-700' : ''}`}
            data-testid="nav-profile"
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>

      {renderPaymentMethodsDialog()}
      {renderAddressesDialog()}
      {renderNotificationsDialog()}

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this pickup? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-no">No, Keep It</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => orderToCancel && cancelOrderMutation.mutate(orderToCancel)}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-cancel-yes"
            >
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Your Driver</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1"
                  data-testid={`star-${star}`}
                >
                  <Star 
                    className={`h-8 w-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>
            <div>
              <Label>Feedback (Optional)</Label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your experience..."
                data-testid="input-feedback"
              />
            </div>
            <Button 
              onClick={() => orderToRate && rateOrderMutation.mutate({ orderId: orderToRate, rating, feedback })}
              disabled={rating === 0}
              className="w-full"
              data-testid="button-submit-rating"
            >
              Submit Rating
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
