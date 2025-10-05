import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, CheckCircle, XCircle, Truck, MapPin, Camera, CreditCard, AlertTriangle, Home } from "lucide-react";

export default function FailedReturnDemo() {
  const [currentStep, setCurrentStep] = useState(1);
  const [refusedReason, setRefusedReason] = useState("expired_return_window");
  const [driverNotes, setDriverNotes] = useState("");
  const [returnToCustomer, setReturnToCustomer] = useState(false);

  // Mock order data with failed return scenario
  const order = {
    id: "RET-2025-002",
    customerName: "Michael Thompson", 
    totalPrice: 19.99, // Full amount paid by customer
    itemCost: 15.00, // Original item cost
    serviceFee: 3.99, // Service fee (NOT REFUNDED)
    taxAmount: 1.00, // Tax (NOT REFUNDED)
    retailer: "Best Buy",
    items: "1 × Bluetooth Headphones",
    pickupAddress: "456 Oak Ave, St. Louis, MO 63108",
    returnAddress: "Best Buy - Galleria Store",
    distance: 8.5 // miles from pickup to store
  };

  // Calculate additional costs for failed return
  const additionalDistance = order.distance; // Return trip to customer
  const additionalDriverPay = additionalDistance * 0.35; // Driver compensation for return trip
  const totalDriverPay = 3.00 + (order.distance * 0.35) + additionalDriverPay; // Base + original trip + return trip

  const handleStoreRefusal = () => {
    setCurrentStep(4);
  };

  const handleReturnToCustomer = () => {
    setReturnToCustomer(true);
    setCurrentStep(5);
  };

  const handleCompleteFailedReturn = () => {
    setCurrentStep(6);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-transparent">
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Failed Return Scenario Demo</h1>
          <p className="text-xl text-gray-600">What happens when a store refuses to accept a return</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[
              { num: 1, title: "Return Pickup", icon: <Truck className="w-5 h-5" /> },
              { num: 2, title: "Drive to Store", icon: <MapPin className="w-5 h-5" /> },
              { num: 3, title: "Return Refused", icon: <XCircle className="w-5 h-5" /> },
              { num: 4, title: "Document Refusal", icon: <Camera className="w-5 h-5" /> },
              { num: 5, title: "Return to Customer", icon: <Home className="w-5 h-5" /> },
              { num: 6, title: "Final Settlement", icon: <CreditCard className="w-5 h-5" /> }
            ].map((step, index) => (
              <div key={step.num} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 
                  ${currentStep >= step.num ? 
                    (step.num === 3 ? 'bg-red-600 text-white border-red-600' : 'bg-green-600 text-white border-green-600') 
                    : 'bg-white text-gray-400 border-gray-300'}`}>
                  {currentStep > step.num ? <CheckCircle className="w-6 h-6" /> : step.icon}
                </div>
                <div className="ml-2 text-sm">
                  <p className={currentStep >= step.num ? 
                    (step.num === 3 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold') 
                    : 'text-gray-400'}>{step.title}</p>
                </div>
                {index < 5 && <ArrowRight className="w-4 h-4 text-gray-400 mx-4" />}
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
                Driver Portal
              </CardTitle>
              <CardDescription>Handle failed return attempt</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Step 1: Pickup Complete</h3>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">✅ Items picked up from customer</p>
                    <p className="text-sm text-green-600 mt-1">Heading to {order.retailer} for return</p>
                  </div>
                  <Button onClick={() => setCurrentStep(2)} className="w-full">
                    Drive to Store <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Step 2: Arrived at Store</h3>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800">📍 Arrived at {order.retailer}</p>
                    <p className="text-sm text-blue-600 mt-1">Distance: {order.distance} miles</p>
                  </div>
                  <Button onClick={() => setCurrentStep(3)} className="w-full">
                    Attempt Return <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Step 3: Return Attempt</h3>
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      Store refused to accept return: Return window expired (purchased 45 days ago)
                    </AlertDescription>
                  </Alert>
                  <Button onClick={handleStoreRefusal} variant="destructive" className="w-full">
                    Document Store Refusal <Camera className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Step 4: Document Refusal</h3>
                  
                  <div className="space-y-3">
                    <Label>Reason for Refusal</Label>
                    <RadioGroup value={refusedReason} onValueChange={setRefusedReason}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="expired_return_window" id="expired" />
                        <Label htmlFor="expired">Return window expired</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no_receipt" id="receipt" />
                        <Label htmlFor="receipt">No receipt/proof of purchase</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="damaged_item" id="damaged" />
                        <Label htmlFor="damaged">Item damaged/not returnable condition</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="policy_violation" id="policy" />
                        <Label htmlFor="policy">Violates store return policy</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Driver Notes</Label>
                    <Textarea 
                      placeholder="Additional details about the refusal..."
                      value={driverNotes}
                      onChange={(e) => setDriverNotes(e.target.value)}
                    />
                  </div>

                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">📸 Photo evidence required</p>
                  </div>

                  <Button onClick={handleReturnToCustomer} className="w-full">
                    Return Items to Customer <Home className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Step 5: Returning to Customer</h3>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800">🚗 Driving back to customer</p>
                    <p className="text-sm text-blue-600 mt-1">Return trip: {additionalDistance} miles</p>
                  </div>
                  <Button onClick={handleCompleteFailedReturn} className="w-full">
                    Complete Return to Customer <CheckCircle className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Return Completed</h3>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">✅ Items returned to customer</p>
                    <p className="text-sm text-green-600 mt-1">Photo evidence uploaded</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Financial Settlement
              </CardTitle>
              <CardDescription>How failed returns are handled financially</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Summary */}
              <div className="space-y-3">
                <h4 className="font-semibold">Order Details</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Order ID:</span>
                    <span className="font-mono">{order.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span>{order.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Store:</span>
                    <span>{order.retailer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Items:</span>
                    <span>{order.items}</span>
                  </div>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-3">
                <h4 className="font-semibold">Financial Impact</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Original Total:</span>
                    <span>${order.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Item Cost:</span>
                    <span>${order.itemCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Service Fee (Retained):</span>
                    <span>${order.serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Tax (Retained):</span>
                    <span>${order.taxAmount.toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold text-green-600">
                    <span>Customer Refund:</span>
                    <span>$0.00</span>
                  </div>
                </div>
              </div>

              {/* ReturnIt Costs */}
              <div className="space-y-3">
                <h4 className="font-semibold">ReturnIt Costs</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Driver Original Trip:</span>
                    <span>${(3.00 + order.distance * 0.35).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-orange-600">
                    <span>Driver Return Trip:</span>
                    <span>${additionalDriverPay.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total Driver Pay:</span>
                    <span>${totalDriverPay.toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold">
                    <span>ReturnIt Net Revenue:</span>
                    <span className="text-green-600">${(order.serviceFee + order.taxAmount - totalDriverPay).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Key Policy */}
              <Alert className="border-blue-200 bg-blue-50">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>ReturnIt Policy:</strong> Service fees and taxes are retained when stores refuse returns. 
                  We provided the pickup and delivery attempt service as contracted.
                </AlertDescription>
              </Alert>

              {/* Status */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Return Refused</Badge>
                  <Badge variant="secondary">Items Returned to Customer</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Customer keeps original items. No refund issued due to store policy violation.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Logic Explanation */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Failed Return Business Logic</CardTitle>
            <CardDescription>How ReturnIt handles store refusals while protecting all parties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-green-600 mb-2">Service Completed</h4>
                <ul className="text-sm space-y-1">
                  <li>• ReturnIt fulfilled pickup service</li>
                  <li>• Driver attempted store delivery</li>
                  <li>• Items safely returned to customer</li>
                  <li>• Full service cycle completed</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-orange-600 mb-2">Cost Management</h4>
                <ul className="text-sm space-y-1">
                  <li>• Driver compensated for extra trip</li>
                  <li>• Service fees cover operational costs</li>
                  <li>• Documentation protects against disputes</li>
                  <li>• Photo evidence for transparency</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-blue-600 mb-2">Customer Protection</h4>
                <ul className="text-sm space-y-1">
                  <li>• Items returned safely to customer</li>
                  <li>• Clear documentation of store refusal</li>
                  <li>• Customer can pursue direct resolution</li>
                  <li>• No additional charges for failed return</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-accent border border-border rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Why Service Fees Aren't Refunded:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• ReturnIt provided the complete pickup and delivery attempt service</li>
                <li>• Store refusal is outside ReturnIt's control (store policy, timing, condition)</li>
                <li>• Driver compensation must be covered for both trips</li>
                <li>• Customer received exactly the service contracted (attempt to return)</li>
                <li>• Service fees cover operational costs regardless of store acceptance</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}