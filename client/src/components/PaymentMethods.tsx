import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, Wallet } from "lucide-react";
import { SiApple, SiGoogle, SiPaypal, SiStripe } from "react-icons/si";

interface PaymentMethodsProps {
  onPaymentSelect: (method: string, details?: any) => void;
  amount: number;
  currency?: string;
}

export default function PaymentMethods({ onPaymentSelect, amount, currency = "USD" }: PaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const paymentMethods = [
    {
      id: "stripe-card",
      name: "Debit/Credit Card",
      icon: CreditCard,
      description: "Visa, Mastercard, American Express",
      category: "cards"
    },
    {
      id: "apple-pay",
      name: "Apple Pay",
      icon: SiApple,
      description: "Touch ID or Face ID",
      category: "digital-wallets"
    },
    {
      id: "google-pay",
      name: "Google Pay",
      icon: SiGoogle,
      description: "One-tap checkout",
      category: "digital-wallets"
    },
    {
      id: "paypal",
      name: "PayPal",
      icon: SiPaypal,
      description: "Pay with your PayPal account",
      category: "digital-wallets"
    },
    {
      id: "stripe-wallet",
      name: "Stripe Wallet",
      icon: SiStripe,
      description: "Secure payments powered by Stripe",
      category: "digital-wallets"
    }
  ];

  const handleCardPayment = () => {
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
      return;
    }
    onPaymentSelect("stripe-card", cardDetails);
  };

  const handleDigitalWalletPayment = (methodId: string) => {
    setSelectedMethod(methodId);
    onPaymentSelect(methodId);
  };

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span>${amount.toFixed(2)} {currency}</span>
          </div>
        </CardContent>
      </Card>

      {/* Credit/Debit Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Credit & Debit Cards
          </CardTitle>
          <CardDescription>
            We accept all major credit and debit cards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="card-number">Card Number</Label>
              <Input
                id="card-number"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.number}
                onChange={(e) => setCardDetails(prev => ({...prev, number: e.target.value}))}
                data-testid="input-card-number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-name">Name on Card</Label>
              <Input
                id="card-name"
                placeholder="John Doe"
                value={cardDetails.name}
                onChange={(e) => setCardDetails(prev => ({...prev, name: e.target.value}))}
                data-testid="input-card-name"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="card-expiry">Expiry Date</Label>
              <Input
                id="card-expiry"
                placeholder="MM/YY"
                value={cardDetails.expiry}
                onChange={(e) => setCardDetails(prev => ({...prev, expiry: e.target.value}))}
                data-testid="input-card-expiry"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-cvv">CVV</Label>
              <Input
                id="card-cvv"
                placeholder="123"
                value={cardDetails.cvv}
                onChange={(e) => setCardDetails(prev => ({...prev, cvv: e.target.value}))}
                data-testid="input-card-cvv"
              />
            </div>
          </div>

          <Button 
            onClick={handleCardPayment}
            className="w-full bg-amber-800 hover:bg-amber-900"
            data-testid="button-pay-card"
          >
            Pay with Card - ${amount.toFixed(2)}
          </Button>
        </CardContent>
      </Card>

      {/* Digital Wallets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Digital Wallets
          </CardTitle>
          <CardDescription>
            Quick and secure one-tap payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {paymentMethods.filter(method => method.category === "digital-wallets").map((method) => {
            const IconComponent = method.icon;
            return (
              <Button
                key={method.id}
                variant="outline"
                className={`w-full h-14 flex items-center justify-between p-4 ${
                  selectedMethod === method.id ? 'ring-2 ring-amber-500' : ''
                }`}
                onClick={() => handleDigitalWalletPayment(method.id)}
                data-testid={`button-pay-${method.id}`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-gray-500">{method.description}</div>
                  </div>
                </div>
                <div className="font-semibold">${amount.toFixed(2)}</div>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* Security Info */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-sm font-medium">Secure Payment Processing</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            All payments are encrypted and processed securely through Stripe and PayPal
          </p>
        </CardContent>
      </Card>
    </div>
  );
}