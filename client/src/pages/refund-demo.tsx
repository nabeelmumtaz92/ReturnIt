import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, CreditCard, Gift, DollarSign, Truck, MapPin, Camera } from "lucide-react";

export default function RefundDemo() {
  const [currentStep, setCurrentStep] = useState(1);
  const [refundMethod, setRefundMethod] = useState("original_payment");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [refundProcessed, setRefundProcessed] = useState(false);

  // Mock order data with pricing breakdown
  const order = {
    id: "RET-2025-001",
    customerName: "Sarah Johnson",
    totalPrice: 24.99, // Full amount paid by customer
    itemCost: 18.50, // Refundable amount (what customer gets back)
    serviceFee: 4.99, // Not refunded (ReturnIt keeps this)
    taxAmount: 1.50, // Not refunded (paid to government)
    retailer: "Target",
    items: "2 × M Clothing Items",
    pickupAddress: "123 Main St, St. Louis, MO 63101",
    returnAddress: "Target Store - West County Center"
  };

  const handleCompleteDelivery = () => {
    setCurrentStep(4);
    setTimeout(() => {
      setRefundProcessed(true);
      setCurrentStep(5);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">ReturnIt Refund System Demo</h1>
          <p className="text-xl text-gray-600">See how customers automatically get their money back when returns are completed</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[
              { num: 1, title: "Return Pickup", icon: <Truck className="w-5 h-5" /> },
              { num: 2, title: "Driver Delivery", icon: <MapPin className="w-5 h-5" /> },
              { num: 3, title: "Complete Return", icon: <Camera className="w-5 h-5" /> },
              { num: 4, title: "Process Refund", icon: <CreditCard className="w-5 h-5" /> },
              { num: 5, title: "Money Returned", icon: <CheckCircle className="w-5 h-5" /> }
            ].map((step, index) => (
              <div key={step.num} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 
                  ${currentStep >= step.num ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-400 border-gray-300'}`}>
                  {currentStep > step.num ? <CheckCircle className="w-6 h-6" /> : step.icon}
                </div>
                <div className="ml-2 text-sm">
                  <p className={currentStep >= step.num ? 'text-green-600 font-semibold' : 'text-gray-400'}>{step.title}</p>
                </div>
                {index < 4 && <ArrowRight className="w-4 h-4 text-gray-400 mx-4" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Driver Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Driver Interface
              </CardTitle>
              <CardDescription>How drivers complete returns and trigger refunds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Order #{order.id}</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Customer:</strong> {order.customerName}</p>
                  <p><strong>Items:</strong> {order.items}</p>
                  <p><strong>Total Paid:</strong> <span className="font-bold">${order.totalPrice}</span></p>
                  <div className="ml-4 text-xs text-gray-600 space-y-1">
                    <p>• Item Cost: ${order.itemCost} <span className="text-green-600">(refundable)</span></p>
                    <p>• Service Fee: ${order.serviceFee} <span className="text-orange-600">(non-refundable)</span></p>
                    <p>• Tax: ${order.taxAmount} <span className="text-orange-600">(non-refundable)</span></p>
                  </div>
                  <p><strong>Retailer:</strong> {order.retailer}</p>
                </div>
              </div>

              {/* Step 1-2: Pickup and Transit */}
              {currentStep <= 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={currentStep >= 1 ? "default" : "secondary"}>
                      {currentStep >= 1 ? "Completed" : "In Progress"}
                    </Badge>
                    <span className="text-sm">Items picked up from customer</span>
                  </div>
                  
                  {currentStep >= 2 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="default">In Transit</Badge>
                      <span className="text-sm">En route to {order.retailer}</span>
                    </div>
                  )}
                  
                  <Button 
                    onClick={() => setCurrentStep(Math.min(currentStep + 1, 3))}
                    className="w-full"
                    disabled={currentStep >= 3}
                  >
                    {currentStep === 1 ? "Complete Pickup" : "Arrive at Store"}
                  </Button>
                </div>
              )}

              {/* Step 3: Complete Delivery */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Complete Delivery to {order.retailer}</h4>
                  
                  <div>
                    <Label htmlFor="notes">Delivery Notes *</Label>
                    <Textarea
                      id="notes"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="Delivered to customer service desk. Staff member confirmed receipt."
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <Label className="font-semibold">Customer Refund Method</Label>
                    <RadioGroup value={refundMethod} onValueChange={setRefundMethod} className="mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="original_payment" id="original" />
                        <Label htmlFor="original" className="flex items-center gap-2 cursor-pointer">
                          <CreditCard className="w-4 h-4" />
                          <div>
                            <p className="font-medium">Original Payment (Credit Card)</p>
                            <p className="text-sm text-gray-500">Refund to customer's card (5-10 business days)</p>
                          </div>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="store_credit" id="credit" />
                        <Label htmlFor="credit" className="flex items-center gap-2 cursor-pointer">
                          <Gift className="w-4 h-4" />
                          <div>
                            <p className="font-medium">Store Credit</p>
                            <p className="text-sm text-gray-500">Instant credit to customer account</p>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
                          <DollarSign className="w-4 h-4" />
                          <div>
                            <p className="font-medium">Cash Refund</p>
                            <p className="text-sm text-gray-500">Driver provides cash (admin approval required)</p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button 
                    onClick={handleCompleteDelivery}
                    className="w-full"
                    disabled={!deliveryNotes.trim()}
                  >
                    Complete Delivery & Process Refund
                  </Button>
                </div>
              )}

              {/* Step 4-5: Processing and Completed */}
              {currentStep >= 4 && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">Delivery Completed</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Customer refund of ${order.itemCost} has been {refundProcessed ? 'processed' : 'initiated'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Service fee and tax are retained by ReturnIt
                    </p>
                  </div>
                  
                  {refundProcessed && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Refund Details</h4>
                      <div className="text-sm text-blue-700 space-y-1">
                        <p><strong>Method:</strong> {
                          refundMethod === 'original_payment' ? 'Original Credit Card' :
                          refundMethod === 'store_credit' ? 'Store Credit (Instant)' :
                          'Cash (Pending Admin Approval)'
                        }</p>
                        <p><strong>Amount:</strong> ${order.itemCost}</p>
                        <p><strong>Status:</strong> {
                          refundMethod === 'store_credit' ? 'Completed - Available Now' :
                          refundMethod === 'original_payment' ? 'Processing - 5-10 business days' :
                          'Pending Admin Approval'
                        }</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Customer Experience
              </CardTitle>
              <CardDescription>What customers see during the refund process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Your Return Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Order #{order.id}</span>
                    <Badge variant={currentStep >= 5 ? "default" : "secondary"}>
                      {currentStep === 1 ? "Picked Up" : 
                       currentStep === 2 ? "In Transit" :
                       currentStep === 3 ? "Delivering to Store" :
                       currentStep === 4 ? "Processing Refund" :
                       "Refund Complete"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Real-time Notifications */}
              <div className="space-y-3">
                <h4 className="font-semibold">Notifications</h4>
                
                {currentStep >= 1 && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
                    <p className="text-sm">✓ Your items have been picked up and are on the way to {order.retailer}</p>
                  </div>
                )}
                
                {currentStep >= 3 && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                    <p className="text-sm">📦 Your items have been delivered to {order.retailer}</p>
                  </div>
                )}
                
                {currentStep >= 4 && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-3">
                    <p className="text-sm">
                      💰 Your refund of ${order.itemCost} has been processed! 
                      {refundMethod === 'store_credit' ? ' Store credit is available now.' :
                       refundMethod === 'original_payment' ? ' Money will appear in your account within 5-10 business days.' :
                       ' Cash refund is pending admin approval.'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Service fee (${order.serviceFee}) and tax (${order.taxAmount}) are non-refundable.
                    </p>
                  </div>
                )}
              </div>

              {/* Account Balance (if store credit) */}
              {refundProcessed && refundMethod === 'store_credit' && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800">Store Credit Balance</h4>
                  <p className="text-2xl font-bold text-green-600">${order.itemCost}</p>
                  <p className="text-sm text-green-700">Available for your next ReturnIt service</p>
                  <p className="text-xs text-gray-600 mt-2">
                    Service fee and tax from original order are non-refundable
                  </p>
                </div>
              )}

              {/* Original Payment Refund Info */}
              {refundProcessed && refundMethod === 'original_payment' && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800">Refund to Original Payment</h4>
                  <p className="text-sm text-blue-700 mb-2">
                    ${order.itemCost} will be refunded to your credit card ending in •••• 4567
                  </p>
                  <p className="text-xs text-blue-600">
                    Refunds typically take 5-10 business days to appear on your statement
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Service fee (${order.serviceFee}) and tax (${order.taxAmount}) are non-refundable
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* How It Works Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How the Refund System Works</CardTitle>
            <CardDescription>Automatic money-back process for customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Original Payment Method</h3>
                <p className="text-sm text-gray-600">Money returns to customer's credit card or bank account via Stripe. Takes 5-10 business days.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Store Credit</h3>
                <p className="text-sm text-gray-600">Instant credit added to customer's ReturnIt account. Available immediately for future services.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Cash Refund</h3>
                <p className="text-sm text-gray-600">Driver can provide cash on delivery. Requires admin approval and tracking for accountability.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Controls */}
        <div className="mt-8 text-center">
          <Button 
            onClick={() => {
              setCurrentStep(1);
              setRefundProcessed(false);
              setDeliveryNotes("");
            }}
            variant="outline"
            className="mr-4"
          >
            Reset Demo
          </Button>
          
          <Button 
            onClick={() => setCurrentStep(Math.min(currentStep + 1, 5))}
            disabled={currentStep >= 5}
          >
            Next Step
          </Button>
        </div>
      </div>
    </div>
  );
}