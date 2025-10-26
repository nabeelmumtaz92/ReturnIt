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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Users,
  Plus,
  Trash2,
  Building2,
  AlertCircle,
  Check
} from "lucide-react";
import { Link } from "wouter";
import { AdminNavigation } from "@/components/AdminNavigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type PaymentMethod = {
  id: number;
  type: 'bank_account' | 'card';
  last4: string;
  bankName?: string;
  brand?: string;
  accountHolderName?: string;
  instantPayEligible: boolean;
  instantPayFee: number;
  status: string;
  isDefault: boolean;
};

export default function DriverPayments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showInstantPayoutModal, setShowInstantPayoutModal] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");

  const { data: orders = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/driver/orders"],
  });

  const { data: user } = useQuery<any>({
    queryKey: ["/api/user"],
  });

  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/driver/payment-methods"],
  });

  const { data: payouts, isLoading: payoutsLoading } = useQuery({
    queryKey: ["/api/driver/payouts"],
  });

  const { data: incentives = [], isLoading: incentivesLoading } = useQuery<any[]>({
    queryKey: ["/api/driver/incentives"],
  });

  // Create bank account session
  const createBankSessionMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/driver/payment-methods/bank-account/session"),
    onSuccess: async (response) => {
      const data = await response.json();
      // TODO: Integrate Stripe Financial Connections UI with client secret
      toast({
        title: "Bank Account Setup",
        description: "Bank account integration coming soon. Please use debit card for now.",
      });
      setShowAddBankModal(false);
    },
    onError: (error: any) => {
      toast({
        title: "Bank Setup Failed",
        description: error.message || "Failed to initiate bank account setup",
        variant: "destructive",
      });
    },
  });

  // Create card setup session
  const createCardSessionMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/driver/payment-methods/card/setup"),
    onSuccess: async (response) => {
      const data = await response.json();
      // TODO: Integrate Stripe Card Element UI with client secret
      toast({
        title: "Card Setup",
        description: "Card integration coming soon.",
      });
      setShowAddCardModal(false);
    },
    onError: (error: any) => {
      toast({
        title: "Card Setup Failed",
        description: error.message || "Failed to initiate card setup",
        variant: "destructive",
      });
    },
  });

  // Remove payment method
  const removePaymentMethodMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/driver/payment-methods/${id}`),
    onSuccess: () => {
      toast({
        title: "Payment Method Removed",
        description: "Your payment method has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/payment-methods"] });
    },
    onError: (error: any) => {
      toast({
        title: "Removal Failed",
        description: error.message || "Failed to remove payment method",
        variant: "destructive",
      });
    },
  });

  // Set default payment method
  const setDefaultMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/driver/payment-methods/${id}/set-default`),
    onSuccess: () => {
      toast({
        title: "Default Payment Method Updated",
        description: "Your default payment method has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/payment-methods"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update default payment method",
        variant: "destructive",
      });
    },
  });

  // Instant payout mutation
  const instantPayoutMutation = useMutation({
    mutationFn: (data: { amount: number; paymentMethodId?: number }) =>
      apiRequest("POST", "/api/driver/instant-payout", data),
    onSuccess: async (response) => {
      const data = await response.json();
      toast({
        title: "Instant Payout Successful!",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/payouts"] });
      setShowInstantPayoutModal(false);
      setPayoutAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Payout Failed",
        description: error.message || "Unable to process instant payout. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Calculate earnings from completed orders
  const completedOrders = orders?.filter((order: any) => 
    order.status === 'completed' && order.paymentStatus === 'completed'
  ) || [];

  const totalEarnings = user?.totalEarnings || 0;

  const totalOrderEarnings = completedOrders
    .reduce((sum: number, order: any) => sum + (order.driverEarning || 0), 0);

  const defaultPaymentMethod = paymentMethods.find(pm => pm.isDefault);
  const fee = defaultPaymentMethod?.instantPayFee || 0.50;

  const handleInstantPayout = () => {
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (amount > totalEarnings) {
      toast({
        title: "Insufficient Balance",
        description: `You only have $${totalEarnings.toFixed(2)} available`,
        variant: "destructive",
      });
      return;
    }

    if (amount < 5) {
      toast({
        title: "Minimum Amount Required",
        description: "Minimum instant payout amount is $5.00",
        variant: "destructive",
      });
      return;
    }

    instantPayoutMutation.mutate({ amount });
  };

  if (ordersLoading || payoutsLoading || incentivesLoading || paymentMethodsLoading) {
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
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-[#f8f7f5] dark:bg-[#231b0f]" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Portal
                </Button>
              </Link>
              <div className="h-6 w-px bg-accent"></div>
              <h1 className="text-xl font-bold text-foreground" data-testid="heading-payments">
                Payments & Earnings
              </h1>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSidebar(!showSidebar)}
              className="text-muted-foreground hover:bg-[#f8f7f5] dark:bg-[#231b0f]"
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
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-[#f8f7f5] dark:bg-[#231b0f]" data-testid="nav-portal">
                  <Home className="h-4 w-4 mr-3" />
                  Driver Portal
                </Button>
              </Link>
              <Link href="/driver-payments">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-[#f8f7f5] dark:bg-[#231b0f] bg-[#f8f7f5] dark:bg-[#231b0f]" data-testid="nav-payments">
                  <CreditCard className="h-4 w-4 mr-3" />
                  Payments & Earnings
                </Button>
              </Link>
              <Link href="/order-status">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-[#f8f7f5] dark:bg-[#231b0f]" data-testid="nav-orders">
                  <Package className="h-4 w-4 mr-3" />
                  My Orders
                </Button>
              </Link>
              <Link href="/admin-dashboard">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-[#f8f7f5] dark:bg-[#231b0f]" data-testid="nav-admin">
                  <Users className="h-4 w-4 mr-3" />
                  Admin Dashboard
                </Button>
              </Link>
              <Link href="/welcome">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-[#f8f7f5] dark:bg-[#231b0f]" data-testid="nav-home">
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
            Manage your earnings, payouts, and payment methods
          </p>
        </div>

        {/* Earnings Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-border" data-testid="card-available-balance">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-primary">Available Balance</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="amount-available">
                    ${totalEarnings.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border" data-testid="card-total-earnings">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-primary">Total Earnings</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="amount-total">
                    ${totalOrderEarnings.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border" data-testid="card-completed-orders">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-primary">Completed Orders</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="count-completed">
                    {completedOrders.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border" data-testid="card-bonuses">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Gift className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm text-primary">Total Bonuses</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="amount-bonuses">
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
          <TabsList className="grid w-full grid-cols-5 bg-accent p-1 h-12 rounded-lg border border-border">
            <TabsTrigger 
              value="instant-pay" 
              className="text-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium transition-all"
              data-testid="tab-instant-pay"
            >
              Instant Pay
            </TabsTrigger>
            <TabsTrigger 
              value="payment-methods" 
              className="text-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium transition-all"
              data-testid="tab-payment-methods"
            >
              Payment Methods
            </TabsTrigger>
            <TabsTrigger 
              value="earnings" 
              className="text-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium transition-all"
              data-testid="tab-earnings"
            >
              Earnings
            </TabsTrigger>
            <TabsTrigger 
              value="incentives" 
              className="text-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium transition-all"
              data-testid="tab-incentives"
            >
              Incentives
            </TabsTrigger>
            <TabsTrigger 
              value="tax-info" 
              className="text-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium transition-all"
              data-testid="tab-tax"
            >
              Tax Info
            </TabsTrigger>
          </TabsList>

          {/* INSTANT PAY TAB */}
          <TabsContent value="instant-pay">
            <Card className="bg-white border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" data-testid="heading-instant-pay">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Instant Pay - Get Paid Now
                </CardTitle>
                <CardDescription data-testid="description-instant-pay">
                  Transfer your earnings instantly for a ${fee.toFixed(2)} fee. Standard weekly payouts are free.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* KYC Warning */}
                  {user?.stripeIdentityStatus !== 'verified' && (
                    <Alert className="border-amber-200 bg-amber-50">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertTitle className="text-amber-900">Identity Verification Required</AlertTitle>
                      <AlertDescription className="text-amber-700">
                        Please complete identity verification before using instant payouts.{" "}
                        <Link href="/driver-identity-verification" className="underline font-medium">
                          Verify Now
                        </Link>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* No Payment Methods Warning */}
                  {paymentMethods.length === 0 && user?.stripeIdentityStatus === 'verified' && (
                    <Alert className="border-amber-200 bg-amber-50">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertTitle className="text-amber-900">Payment Method Required</AlertTitle>
                      <AlertDescription className="text-amber-700">
                        Add a bank account or debit card to receive instant payouts.{" "}
                        <button 
                          onClick={() => setShowAddBankModal(true)}
                          className="underline font-medium"
                        >
                          Add Payment Method
                        </button>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-green-900 mb-1" data-testid="heading-available-payout">
                          Available for Instant Payout
                        </h3>
                        <p className="text-3xl font-bold text-green-600" data-testid="amount-available-payout">
                          ${totalEarnings.toFixed(2)}
                        </p>
                      </div>
                      {defaultPaymentMethod && (
                        <Badge className="bg-green-600 text-white">
                          {defaultPaymentMethod.type === 'bank_account' ? 'Bank' : 'Card'} ••{defaultPaymentMethod.last4}
                        </Badge>
                      )}
                    </div>

                    <Button 
                      onClick={() => setShowInstantPayoutModal(true)}
                      disabled={
                        totalEarnings < 5 || 
                        user?.stripeIdentityStatus !== 'verified' ||
                        paymentMethods.length === 0
                      }
                      className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold"
                      data-testid="button-cash-out"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Cash Out Now
                    </Button>

                    <p className="text-sm text-green-700 mt-3 text-center">
                      Minimum payout: $5.00 • Fee: ${fee.toFixed(2)} • Instant delivery
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">How Instant Pay Works</h4>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Cash out any amount $5 or more from your available balance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>${fee.toFixed(2)} flat fee per transaction (deducted from payout)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Funds arrive within minutes to your bank account or debit card</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Identity verification and payment method required</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PAYMENT METHODS TAB */}
          <TabsContent value="payment-methods">
            <Card className="bg-white border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" data-testid="heading-payment-methods">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Payment Methods
                </CardTitle>
                <CardDescription>
                  Manage your bank accounts and debit cards for instant payouts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethods.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">No payment methods added yet</p>
                      <div className="flex gap-3 justify-center">
                        <Button 
                          onClick={() => setShowAddBankModal(true)}
                          variant="outline"
                          data-testid="button-add-bank"
                        >
                          <Building2 className="w-4 h-4 mr-2" />
                          Add Bank Account
                        </Button>
                        <Button 
                          onClick={() => setShowAddCardModal(true)}
                          variant="outline"
                          data-testid="button-add-card"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Add Debit Card
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {paymentMethods.map((method) => (
                          <div 
                            key={method.id}
                            className="flex items-center justify-between p-4 border rounded-lg bg-[#f8f7f5] dark:bg-[#231b0f]"
                            data-testid={`payment-method-${method.id}`}
                          >
                            <div className="flex items-center gap-4">
                              {method.type === 'bank_account' ? (
                                <Building2 className="w-6 h-6 text-blue-600" />
                              ) : (
                                <CreditCard className="w-6 h-6 text-purple-600" />
                              )}
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-foreground">
                                    {method.type === 'bank_account' 
                                      ? method.bankName || 'Bank Account'
                                      : method.brand || 'Debit Card'
                                    }
                                  </p>
                                  {method.isDefault && (
                                    <Badge className="bg-green-100 text-green-800 text-xs">
                                      Default
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  ••••  {method.last4}
                                  {method.accountHolderName && ` • ${method.accountHolderName}`}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {method.status === 'active' ? 'Verified' : method.status}
                                  </Badge>
                                  {method.instantPayEligible && (
                                    <Badge variant="outline" className="text-xs text-green-600">
                                      <Zap className="w-3 h-3 mr-1" />
                                      Instant Pay
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!method.isDefault && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDefaultMutation.mutate(method.id)}
                                  disabled={setDefaultMutation.isPending}
                                  data-testid={`button-set-default-${method.id}`}
                                >
                                  Set Default
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removePaymentMethodMutation.mutate(method.id)}
                                disabled={removePaymentMethodMutation.isPending}
                                data-testid={`button-remove-${method.id}`}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex gap-3">
                          <Button 
                            onClick={() => setShowAddBankModal(true)}
                            variant="outline"
                            className="flex-1"
                            data-testid="button-add-bank-bottom"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Bank Account
                          </Button>
                          <Button 
                            onClick={() => setShowAddCardModal(true)}
                            variant="outline"
                            className="flex-1"
                            data-testid="button-add-card-bottom"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Debit Card
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  <Alert className="border-blue-200 bg-blue-50 mt-4">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-900">Security Information</AlertTitle>
                    <AlertDescription className="text-blue-700 text-sm">
                      Your payment information is encrypted and securely stored by Stripe. We never store your full bank account or card numbers.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* EARNINGS TAB */}
          <TabsContent value="earnings">
            <Card className="bg-white border-border">
              <CardHeader>
                <CardTitle data-testid="heading-earnings-history">Earnings History</CardTitle>
                <CardDescription>Your completed deliveries and earnings breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedOrders.map((order: any) => (
                    <div 
                      key={order.id} 
                      className="flex items-center justify-between p-4 bg-[#f8f7f5] dark:bg-[#231b0f] rounded-lg border border-border"
                      data-testid={`earnings-item-${order.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-medium text-foreground">{order.retailer}</p>
                          <p className="text-sm text-primary">{order.pickupAddress}</p>
                          <p className="text-xs text-primary">
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

          {/* INCENTIVES TAB */}
          <TabsContent value="incentives">
            <Card className="bg-white border-border">
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
                    <h3 className="font-semibold text-foreground" data-testid="heading-active-incentives">Active Incentives</h3>
                    
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
                    <h3 className="font-semibold text-foreground" data-testid="heading-earned-bonuses">Your Earned Bonuses</h3>
                    
                    {incentives && incentives.length > 0 ? (
                      incentives.map((incentive: any) => (
                        <div 
                          key={incentive.id} 
                          className="p-3 bg-[#f8f7f5] dark:bg-[#231b0f] border border-border rounded-lg"
                          data-testid={`earned-incentive-${incentive.id}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-foreground">{incentive.description}</p>
                              <p className="text-sm text-primary">{incentive.incentiveType}</p>
                            </div>
                            <p className="font-semibold text-green-600">+${incentive.amount.toFixed(2)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Gift className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                        <p>No bonuses earned yet</p>
                        <p className="text-sm">Complete more orders to earn bonuses!</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAX INFO TAB */}
          <TabsContent value="tax-info">
            <Card className="bg-white border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" data-testid="heading-tax-info">
                  <Receipt className="w-5 h-5 text-primary" />
                  Tax Information
                </CardTitle>
                <CardDescription>1099-NEC forms and tax documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-900">Tax Documents</AlertTitle>
                    <AlertDescription className="text-blue-700">
                      Annual 1099-NEC forms are generated in January for the previous year's earnings.
                    </AlertDescription>
                  </Alert>

                  <Link href="/driver-tax-documents">
                    <Button className="w-full" variant="outline" data-testid="button-view-tax-documents">
                      <Receipt className="w-4 h-4 mr-2" />
                      View Tax Documents
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Instant Payout Modal */}
      <Dialog open={showInstantPayoutModal} onOpenChange={setShowInstantPayoutModal}>
        <DialogContent data-testid="modal-instant-payout">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Instant Payout
            </DialogTitle>
            <DialogDescription>
              Enter the amount you want to cash out (minimum $5.00)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="payout-amount">Amount ($)</Label>
              <Input
                id="payout-amount"
                type="number"
                step="0.01"
                min="5"
                max={totalEarnings}
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                placeholder="0.00"
                data-testid="input-payout-amount"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Available balance: ${totalEarnings.toFixed(2)}
              </p>
            </div>

            {parseFloat(payoutAmount) > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-green-700">Payout Amount:</span>
                  <span className="font-medium text-green-900">${parseFloat(payoutAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-green-700">Instant Pay Fee:</span>
                  <span className="text-green-700">-${fee.toFixed(2)}</span>
                </div>
                <hr className="border-green-200 my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-green-900">You'll Receive:</span>
                  <span className="font-bold text-green-900" data-testid="amount-net-payout">
                    ${Math.max(0, parseFloat(payoutAmount) - fee).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {defaultPaymentMethod && (
              <Alert className="border-blue-200 bg-blue-50">
                <Check className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900">Payment Method</AlertTitle>
                <AlertDescription className="text-blue-700">
                  Funds will be sent to your {defaultPaymentMethod.type === 'bank_account' ? 'bank account' : 'debit card'} ending in {defaultPaymentMethod.last4}
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInstantPayoutModal(false)} data-testid="button-cancel-payout">
              Cancel
            </Button>
            <Button 
              onClick={handleInstantPayout}
              disabled={instantPayoutMutation.isPending || !payoutAmount || parseFloat(payoutAmount) < 5}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-confirm-payout"
            >
              {instantPayoutMutation.isPending ? "Processing..." : "Confirm Payout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Bank Account Modal */}
      <Dialog open={showAddBankModal} onOpenChange={setShowAddBankModal}>
        <DialogContent data-testid="modal-add-bank">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Add Bank Account
            </DialogTitle>
            <DialogDescription>
              Connect your bank account securely via Stripe Financial Connections
            </DialogDescription>
          </DialogHeader>
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700 text-sm">
              Bank account integration coming soon. Please check back later or use a debit card for instant payouts.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddBankModal(false)} data-testid="button-close-bank">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Card Modal */}
      <Dialog open={showAddCardModal} onOpenChange={setShowAddCardModal}>
        <DialogContent data-testid="modal-add-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-600" />
              Add Debit Card
            </DialogTitle>
            <DialogDescription>
              Add a debit card for instant payouts (credit cards not eligible)
            </DialogDescription>
          </DialogHeader>
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700 text-sm">
              Debit card integration coming soon. Please check back later.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCardModal(false)} data-testid="button-close-card">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
