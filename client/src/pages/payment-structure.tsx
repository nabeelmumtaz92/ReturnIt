import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { calculatePayment, getPaymentExplanation, validatePaymentBreakdown, type RouteInfo, type PaymentBreakdown } from "@shared/paymentCalculator";
import { Calculator, DollarSign, MapPin, Clock, Package, User, Building } from "lucide-react";

export default function PaymentStructurePage() {
  const [routeInfo, setRouteInfo] = useState<RouteInfo>({
    distance: 5.2,
    estimatedTime: 25
  });
  const [boxSize, setBoxSize] = useState<string>('M');
  const [numberOfBoxes, setNumberOfBoxes] = useState<number>(1);
  const [isRush, setIsRush] = useState<boolean>(false);
  const [tip, setTip] = useState<number>(0);
  const [breakdown, setBreakdown] = useState<PaymentBreakdown | null>(null);

  const handleCalculate = () => {
    const result = calculatePayment(routeInfo, boxSize, numberOfBoxes, isRush, tip);
    setBreakdown(result);
  };

  const validation = breakdown ? validatePaymentBreakdown(breakdown) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-amber-900 flex items-center justify-center gap-2">
            <Calculator className="h-8 w-8" />
            Returnly Payment Structure
          </h1>
          <p className="text-amber-700">Fair compensation system for drivers and sustainable business model</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Controls */}
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Order Details
              </CardTitle>
              <CardDescription>Configure the delivery parameters to see payment breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="distance">Distance (miles)</Label>
                  <Input
                    id="distance"
                    type="number"
                    step="0.1"
                    value={routeInfo.distance}
                    onChange={(e) => setRouteInfo(prev => ({ ...prev, distance: parseFloat(e.target.value) || 0 }))}
                    className="border-amber-200"
                  />
                </div>
                <div>
                  <Label htmlFor="time">Est. Time (minutes)</Label>
                  <Input
                    id="time"
                    type="number"
                    value={routeInfo.estimatedTime}
                    onChange={(e) => setRouteInfo(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 0 }))}
                    className="border-amber-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="boxSize">Box Size</Label>
                  <Select value={boxSize} onValueChange={setBoxSize}>
                    <SelectTrigger className="border-amber-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="S">Small (No upcharge)</SelectItem>
                      <SelectItem value="M">Medium (No upcharge)</SelectItem>
                      <SelectItem value="L">Large (+$2)</SelectItem>
                      <SelectItem value="XL">Extra Large (+$4)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="boxes">Number of Boxes</Label>
                  <Input
                    id="boxes"
                    type="number"
                    min="1"
                    value={numberOfBoxes}
                    onChange={(e) => setNumberOfBoxes(parseInt(e.target.value) || 1)}
                    className="border-amber-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tip">Customer Tip ($)</Label>
                  <Input
                    id="tip"
                    type="number"
                    step="0.50"
                    min="0"
                    value={tip}
                    onChange={(e) => setTip(parseFloat(e.target.value) || 0)}
                    className="border-amber-200"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => setIsRush(!isRush)}
                    variant={isRush ? "default" : "outline"}
                    className="w-full"
                  >
                    {isRush ? "Rush Delivery (+$3)" : "Standard Delivery"}
                  </Button>
                </div>
              </div>

              <Button onClick={handleCalculate} className="w-full bg-amber-600 hover:bg-amber-700">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Payment Breakdown
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {breakdown && (
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-900 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment Breakdown
                </CardTitle>
                <CardDescription>
                  {validation?.isValid ? (
                    <Badge className="bg-green-100 text-green-800">✓ Balanced</Badge>
                  ) : (
                    <Badge variant="destructive">⚠ {validation?.explanation}</Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Payment */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-amber-900 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer Pays: ${breakdown.totalPrice.toFixed(2)}
                  </h3>
                  <div className="text-sm space-y-1 pl-6">
                    <div className="flex justify-between">
                      <span>Base service:</span>
                      <span>${breakdown.basePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Distance ({routeInfo.distance} mi × $0.50):</span>
                      <span>${breakdown.distanceFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time ({routeInfo.estimatedTime} min × $12/hr):</span>
                      <span>${breakdown.timeFee.toFixed(2)}</span>
                    </div>
                    {breakdown.sizeUpcharge > 0 && (
                      <div className="flex justify-between">
                        <span>Size upcharge ({boxSize}):</span>
                        <span>${breakdown.sizeUpcharge.toFixed(2)}</span>
                      </div>
                    )}
                    {breakdown.multiBoxFee > 0 && (
                      <div className="flex justify-between">
                        <span>Additional boxes:</span>
                        <span>${breakdown.multiBoxFee.toFixed(2)}</span>
                      </div>
                    )}
                    {breakdown.rushFee > 0 && (
                      <div className="flex justify-between">
                        <span>Rush delivery:</span>
                        <span>${breakdown.rushFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Service fee (15%):</span>
                      <span>${breakdown.serviceFee.toFixed(2)}</span>
                    </div>
                    {breakdown.tip > 0 && (
                      <div className="flex justify-between">
                        <span>Tip:</span>
                        <span>${breakdown.tip.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Driver Earnings */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-amber-900 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Driver Earns: ${breakdown.driverTotalEarning.toFixed(2)}
                  </h3>
                  <div className="text-sm space-y-1 pl-6">
                    <div className="flex justify-between">
                      <span>Base pay:</span>
                      <span>${breakdown.driverBasePay.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Distance pay ({routeInfo.distance} mi × $0.35):</span>
                      <span>${breakdown.driverDistancePay.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time pay ({routeInfo.estimatedTime} min × $8/hr):</span>
                      <span>${breakdown.driverTimePay.toFixed(2)}</span>
                    </div>
                    {breakdown.driverSizeBonus > 0 && (
                      <div className="flex justify-between">
                        <span>Size bonus ({boxSize}):</span>
                        <span>${breakdown.driverSizeBonus.toFixed(2)}</span>
                      </div>
                    )}
                    {breakdown.driverTip > 0 && (
                      <div className="flex justify-between">
                        <span>Tip (100%):</span>
                        <span>${breakdown.driverTip.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Company Revenue */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-amber-900 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Company Gets: ${breakdown.companyTotalRevenue.toFixed(2)}
                  </h3>
                  <div className="text-sm space-y-1 pl-6">
                    <div className="flex justify-between">
                      <span>Service fee (15%):</span>
                      <span>${breakdown.companyServiceFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base fee share:</span>
                      <span>${breakdown.companyBaseFeeShare.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Distance fee share:</span>
                      <span>${breakdown.companyDistanceFeeShare.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time fee share:</span>
                      <span>${breakdown.companyTimeFeeShare.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Payment Philosophy */}
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900">Payment Philosophy</CardTitle>
            <CardDescription>How we ensure fair compensation for everyone</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-amber-800">Driver Benefits</h4>
                <ul className="text-sm space-y-1">
                  <li>• Guaranteed $3 minimum per delivery</li>
                  <li>• $0.35/mile for gas & wear</li>
                  <li>• $8/hour time compensation</li>
                  <li>• 100% of customer tips</li>
                  <li>• Size bonuses for larger items</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-amber-800">Customer Value</h4>
                <ul className="text-sm space-y-1">
                  <li>• Distance-based fair pricing</li>
                  <li>• No hidden fees</li>
                  <li>• 15% service fee for platform</li>
                  <li>• Optional rush delivery</li>
                  <li>• Transparent breakdown</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-amber-800">Business Model</h4>
                <ul className="text-sm space-y-1">
                  <li>• 15% service fee from total</li>
                  <li>• $0.99 from each base fee</li>
                  <li>• $0.15/mile distance margin</li>
                  <li>• $4/hour time margin</li>
                  <li>• Sustainable & scalable</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}