import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, Link } from "wouter";
import { ArrowLeft, CreditCard, Shield, Clock, Copy, CheckCircle } from "lucide-react";
import Footer from "@/components/Footer";

// Import delivery images
import deliveryCarImg from "@assets/Delivery Driver- Box in Car_1754856749497.jpeg";
import deliveryHandoffImg from "@assets/Delivery Driver- Handoff_1754856749519.jpeg";
import deliveryOutsideImg from "@assets/Delivery Driver- outside_1754856749521.jpeg";
import deliveryReceivingImg from "@assets/Delivery Driver Receiving Box_1754856749524.jpeg";

// Load Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  orderId: string;
  amount: number;
}

const CheckoutForm = ({ orderId, amount }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [trackingCopied, setTrackingCopied] = useState(false);
  
  // Get tracking number from URL parameters
  const searchParams = new URLSearchParams(window.location.search);
  const trackingNumber = searchParams.get('trackingNumber') || '';
  
  const copyTrackingNumber = async () => {
    if (trackingNumber) {
      try {
        await navigator.clipboard.writeText(trackingNumber);
        setTrackingCopied(true);
        toast({
          title: "Copied!",
          description: "Tracking number copied to clipboard",
        });
        setTimeout(() => setTrackingCopied(false), 2000);
      } catch (error) {
        toast({
          title: "Copy failed",
          description: "Please manually copy the tracking number",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-status/${orderId}`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: trackingNumber ? `Your pickup has been booked! Track with ${trackingNumber}` : "Your pickup has been booked successfully!",
        duration: 6000,
      });
      setLocation(`/order-status/${orderId}`);
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tracking Number Display */}
      {trackingNumber && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-900 mb-1">📦 Your Tracking Number</h3>
              <p className="text-green-700 text-sm mb-2">Save this number to track your return!</p>
              <div className="bg-white p-3 rounded border font-mono text-lg font-bold text-green-900 border-green-300">
                {trackingNumber}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyTrackingNumber}
              className="border-green-300 text-green-700 hover:bg-green-100"
              data-testid="button-copy-tracking"
            >
              {trackingCopied ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      )}
      
      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
        <h3 className="font-medium text-amber-900 mb-2">Order Summary</h3>
        <div className="flex justify-between items-center">
          <span className="text-amber-700">On Demand Returns Fee</span>
          <span className="font-bold text-amber-900">${amount.toFixed(2)}</span>
        </div>
      </div>
      
      <PaymentElement />
      
      <Button 
        type="submit" 
        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
        disabled={!stripe || isProcessing}
        data-testid="button-submit-payment"
      >
        {isProcessing ? (
          <div className="flex items-center">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            Processing...
          </div>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
};

interface CheckoutProps {
  orderId: string;
  amount: number;
}

export default function Checkout() {
  const searchParams = new URLSearchParams(window.location.search);
  const amount = parseFloat(searchParams.get('amount') || '0');
  const orderId = searchParams.get('orderId') || '';
  const trackingNumber = searchParams.get('trackingNumber') || '';
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();

  // Random delivery image selection for this page
  const checkoutPageImages = [deliveryCarImg, deliveryHandoffImg, deliveryOutsideImg, deliveryReceivingImg];
  const selectedImage = checkoutPageImages[Math.floor(Math.random() * checkoutPageImages.length)];

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    const createPaymentIntent = async () => {
      try {
        const response = await apiRequest("/api/create-payment-intent", 'POST', { 
          amount: amount,
          orderId: orderId 
        });
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        toast({
          title: "Payment Setup Failed",
          description: "Unable to initialize payment. Please try again.",
          variant: "destructive",
        });
      }
    };

    createPaymentIntent();
  }, [amount, orderId, toast]);

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-200 via-yellow-100 to-orange-100 flex items-center justify-center relative">
        {/* Background Hero Image */}
        <div 
          className="absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage: `url(${selectedImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        <div className="relative z-10">
          <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-amber-800">Setting up payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-200 via-yellow-100 to-orange-100 relative">
      {/* Background Hero Image */}
      <div 
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: `url(${selectedImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/book-pickup')}
              className="text-amber-800 hover:text-amber-900"
              data-testid="button-back-booking"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Link href="/">
              <div className="text-xl font-bold text-amber-900 cursor-pointer hover:opacity-80 transition-opacity">
                Return It
              </div>
            </Link>
            <span className="text-xl font-bold text-amber-900">Secure Payment</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-lg relative z-10">
        <Card className="bg-white/95 backdrop-blur-sm border-amber-300 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-amber-900 flex items-center justify-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Complete Your Booking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm orderId={orderId} amount={amount} />
            </Elements>
          </CardContent>
        </Card>
        
        {/* Security Features */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
            <CardContent className="p-4 text-center">
              <Shield className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <h3 className="font-semibold text-amber-900 text-sm">Secure Payment</h3>
              <p className="text-xs text-amber-700">SSL encrypted</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <h3 className="font-semibold text-amber-900 text-sm">Quick Pickup</h3>
              <p className="text-xs text-amber-700">Same-day available</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
            <CardContent className="p-4 text-center">
              <CreditCard className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <h3 className="font-semibold text-amber-900 text-sm">Multiple Payment</h3>
              <p className="text-xs text-amber-700">Cards, Apple Pay, Google Pay</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}