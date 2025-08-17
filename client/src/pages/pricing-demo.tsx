import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calculator, TrendingUp, DollarSign, Truck } from "lucide-react";
import { useState } from "react";

export default function PricingDemo() {
  const [itemValue, setItemValue] = useState([100]);
  const [distance, setDistance] = useState([5]);
  const [itemSize, setItemSize] = useState("M");
  const [pricingModel, setPricingModel] = useState("current");

  // Current flat-rate pricing structure
  const calculateCurrentPricing = () => {
    const basePrice = 3.99;
    const distanceFee = distance[0] * 0.50;
    const sizeUpcharge = itemSize === "L" ? 2.00 : itemSize === "XL" ? 4.00 : 0;
    const serviceFee = (basePrice + distanceFee + sizeUpcharge) * 0.15;
    const total = basePrice + distanceFee + sizeUpcharge + serviceFee;
    
    // Driver earnings (70% split)
    const driverBasePay = 3.00;
    const driverDistancePay = distance[0] * 0.35;
    const driverSizeBonus = itemSize === "L" ? 1.00 : itemSize === "XL" ? 2.00 : 0;
    const driverTotal = driverBasePay + driverDistancePay + driverSizeBonus;
    
    // Company revenue (30% + service fee)
    const companyRevenue = total - driverTotal;
    
    return {
      customerTotal: total,
      breakdown: {
        basePrice,
        distanceFee,
        sizeUpcharge,
        serviceFee
      },
      driverEarnings: driverTotal,
      companyRevenue,
      itemValue: itemValue[0]
    };
  };

  // Value-based pricing structure
  const calculateValueBasedPricing = () => {
    const basePrice = 3.99;
    const distanceFee = distance[0] * 0.50;
    const sizeUpcharge = itemSize === "L" ? 2.00 : itemSize === "XL" ? 4.00 : 0;
    
    // Value-based component (0.5% of item value, capped at $15)
    const valueComponent = Math.min(itemValue[0] * 0.005, 15);
    
    const serviceFee = (basePrice + distanceFee + sizeUpcharge + valueComponent) * 0.15;
    const total = basePrice + distanceFee + sizeUpcharge + valueComponent + serviceFee;
    
    // Driver earnings with value bonus
    const driverBasePay = 3.00;
    const driverDistancePay = distance[0] * 0.35;
    const driverSizeBonus = itemSize === "L" ? 1.00 : itemSize === "XL" ? 2.00 : 0;
    const driverValueBonus = Math.min(itemValue[0] * 0.002, 5); // 0.2% of value, capped at $5
    const driverTotal = driverBasePay + driverDistancePay + driverSizeBonus + driverValueBonus;
    
    // Company revenue
    const companyRevenue = total - driverTotal;
    
    return {
      customerTotal: total,
      breakdown: {
        basePrice,
        distanceFee,
        sizeUpcharge,
        valueComponent,
        serviceFee
      },
      driverEarnings: driverTotal,
      companyRevenue,
      itemValue: itemValue[0]
    };
  };

  const currentPricing = calculateCurrentPricing();
  const valuePricing = calculateValueBasedPricing();
  const selectedPricing = pricingModel === "current" ? currentPricing : valuePricing;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">ReturnIt Pricing Analysis</h1>
          <p className="text-lg text-gray-600">
            Compare current flat-rate pricing vs. value-based pricing models
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Pricing Calculator
            </CardTitle>
            <CardDescription>Adjust parameters to see how pricing changes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Item Value */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Item Value: ${itemValue[0]}</label>
                <Slider
                  value={itemValue}
                  onValueChange={setItemValue}
                  max={1000}
                  min={10}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>$10</span>
                  <span>$1000</span>
                </div>
              </div>

              {/* Distance */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Distance: {distance[0]} miles</label>
                <Slider
                  value={distance}
                  onValueChange={setDistance}
                  max={20}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 mile</span>
                  <span>20 miles</span>
                </div>
              </div>

              {/* Item Size */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Item Size</label>
                <Select value={itemSize} onValueChange={setItemSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S">Small (S)</SelectItem>
                    <SelectItem value="M">Medium (M)</SelectItem>
                    <SelectItem value="L">Large (L) +$2</SelectItem>
                    <SelectItem value="XL">Extra Large (XL) +$4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pricing Model Toggle */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Pricing Model:</label>
              <Tabs value={pricingModel} onValueChange={setPricingModel} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="current">Current (Flat Rate)</TabsTrigger>
                  <TabsTrigger value="value-based">Value-Based</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Pricing */}
          <Card className={pricingModel === "current" ? "ring-2 ring-blue-500" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Current Pricing Model
              </CardTitle>
              <CardDescription>
                Flat-rate based on distance, size, and service complexity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Base Price:</span>
                  <span>${currentPricing.breakdown.basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Distance Fee ({distance[0]} mi):</span>
                  <span>${currentPricing.breakdown.distanceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Size Upcharge ({itemSize}):</span>
                  <span>${currentPricing.breakdown.sizeUpcharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service Fee (15%):</span>
                  <span>${currentPricing.breakdown.serviceFee.toFixed(2)}</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold">
                  <span>Customer Total:</span>
                  <span>${currentPricing.customerTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Driver Earnings:</span>
                  <span>${currentPricing.driverEarnings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-blue-600">
                  <span>Company Revenue:</span>
                  <span>${currentPricing.companyRevenue.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Value-Based Pricing */}
          <Card className={pricingModel === "value-based" ? "ring-2 ring-green-500" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Value-Based Pricing Model
              </CardTitle>
              <CardDescription>
                Pricing scales with item value + base service costs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Base Price:</span>
                  <span>${valuePricing.breakdown.basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Distance Fee ({distance[0]} mi):</span>
                  <span>${valuePricing.breakdown.distanceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Size Upcharge ({itemSize}):</span>
                  <span>${valuePricing.breakdown.sizeUpcharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Value Component (0.5%):</span>
                  <span>${valuePricing.breakdown.valueComponent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service Fee (15%):</span>
                  <span>${valuePricing.breakdown.serviceFee.toFixed(2)}</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold">
                  <span>Customer Total:</span>
                  <span>${valuePricing.customerTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Driver Earnings:</span>
                  <span>${valuePricing.driverEarnings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-blue-600">
                  <span>Company Revenue:</span>
                  <span>${valuePricing.companyRevenue.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Model Analysis</CardTitle>
            <CardDescription>How the models compare for different scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Price Difference */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  ${Math.abs(valuePricing.customerTotal - currentPricing.customerTotal).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">
                  {valuePricing.customerTotal > currentPricing.customerTotal ? "Higher" : "Lower"} with value-based
                </div>
              </div>

              {/* Driver Impact */}
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  +${(valuePricing.driverEarnings - currentPricing.driverEarnings).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">
                  Additional driver earnings
                </div>
              </div>

              {/* Company Impact */}
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  +${(valuePricing.companyRevenue - currentPricing.companyRevenue).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">
                  Additional company revenue
                </div>
              </div>
            </div>

            {/* Scenarios */}
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold">Pricing Scenarios:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 border rounded-lg">
                  <div className="font-medium text-green-600">Low-Value Items ($10-50)</div>
                  <p>Current model may be more competitive for basic returns</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="font-medium text-blue-600">Mid-Value Items ($50-200)</div>
                  <p>Value-based pricing provides modest premium while staying competitive</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="font-medium text-purple-600">High-Value Items ($200+)</div>
                  <p>Value-based pricing significantly increases revenue and driver pay</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Implementation Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-blue-600 mb-2">Hybrid Model</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Use value-based pricing only for items over $100 to maintain competitiveness
                </p>
                <Badge variant="outline">Recommended</Badge>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-green-600 mb-2">Premium Service Tier</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Offer value-based pricing as a premium option with additional insurance
                </p>
                <Badge variant="secondary">Alternative</Badge>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2">Market Considerations</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Customer willingness to pay more for expensive items</li>
                <li>• Competitive positioning vs. flat-rate services</li>
                <li>• Driver incentives for handling valuable items</li>
                <li>• Insurance and liability coverage scaling</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}