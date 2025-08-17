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

  // Tiered value-based pricing structure
  const calculateTieredPricing = () => {
    const basePrice = 3.99;
    const distanceFee = distance[0] * 0.50;
    const sizeUpcharge = itemSize === "L" ? 2.00 : itemSize === "XL" ? 4.00 : 0;
    
    // Tiered value components based on item value
    let valueComponent = 0;
    let driverValueBonus = 0;
    let tier = "Standard";
    
    const value = itemValue[0];
    
    if (value >= 10000) {
      // Tier 5: $10,000+ - Premium handling
      valueComponent = 25.00;
      driverValueBonus = 8.00;
      tier = "Ultra Premium ($10K+)";
    } else if (value >= 5000) {
      // Tier 4: $5,000-$9,999 - High-value handling
      valueComponent = 15.00;
      driverValueBonus = 5.00;
      tier = "Premium ($5K-$10K)";
    } else if (value >= 1000) {
      // Tier 3: $1,000-$4,999 - Enhanced care
      valueComponent = 8.00;
      driverValueBonus = 3.00;
      tier = "Enhanced ($1K-$5K)";
    } else if (value >= 500) {
      // Tier 2: $500-$999 - Moderate value
      valueComponent = 4.00;
      driverValueBonus = 1.50;
      tier = "Value ($500-$1K)";
    } else if (value >= 100) {
      // Tier 1: $100-$499 - Basic premium
      valueComponent = 2.00;
      driverValueBonus = 1.00;
      tier = "Basic+ ($100-$500)";
    }
    // Under $100: No value surcharge (standard pricing)
    
    const serviceFee = (basePrice + distanceFee + sizeUpcharge + valueComponent) * 0.15;
    const total = basePrice + distanceFee + sizeUpcharge + valueComponent + serviceFee;
    
    // Driver earnings with tiered value bonus
    const driverBasePay = 3.00;
    const driverDistancePay = distance[0] * 0.35;
    const driverSizeBonus = itemSize === "L" ? 1.00 : itemSize === "XL" ? 2.00 : 0;
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
      driverValueBonus,
      companyRevenue,
      itemValue: itemValue[0],
      tier
    };
  };

  const currentPricing = calculateCurrentPricing();
  const tieredPricing = calculateTieredPricing();
  const selectedPricing = pricingModel === "current" ? currentPricing : tieredPricing;

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
                  <TabsTrigger value="value-based">Tiered Pricing</TabsTrigger>
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

          {/* Tiered Pricing */}
          <Card className={pricingModel === "value-based" ? "ring-2 ring-green-500" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Tiered Value Pricing Model
              </CardTitle>
              <CardDescription>
                {tieredPricing.tier} - Fixed tiers based on item value
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tier Badge */}
              <div className="text-center">
                <Badge 
                  variant={tieredPricing.tier.includes("Ultra") ? "destructive" : 
                          tieredPricing.tier.includes("Premium") ? "default" : 
                          tieredPricing.tier.includes("Enhanced") ? "secondary" : 
                          "outline"}
                  className="text-lg px-3 py-1"
                >
                  {tieredPricing.tier}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Base Price:</span>
                  <span>${tieredPricing.breakdown.basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Distance Fee ({distance[0]} mi):</span>
                  <span>${tieredPricing.breakdown.distanceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Size Upcharge ({itemSize}):</span>
                  <span>${tieredPricing.breakdown.sizeUpcharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Value Tier Fee:</span>
                  <span>${tieredPricing.breakdown.valueComponent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service Fee (15%):</span>
                  <span>${tieredPricing.breakdown.serviceFee.toFixed(2)}</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold">
                  <span>Customer Total:</span>
                  <span>${tieredPricing.customerTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Driver Earnings:</span>
                  <span>${tieredPricing.driverEarnings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-green-500">
                  <span>Driver Value Bonus:</span>
                  <span>+${tieredPricing.driverValueBonus.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-blue-600">
                  <span>Company Revenue:</span>
                  <span>${tieredPricing.companyRevenue.toFixed(2)}</span>
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
                  ${Math.abs(tieredPricing.customerTotal - currentPricing.customerTotal).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">
                  {tieredPricing.customerTotal > currentPricing.customerTotal ? "Higher" : "Lower"} with tiered pricing
                </div>
              </div>

              {/* Driver Impact */}
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  +${(tieredPricing.driverEarnings - currentPricing.driverEarnings).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">
                  Additional driver earnings
                </div>
              </div>

              {/* Company Impact */}
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  +${(tieredPricing.companyRevenue - currentPricing.companyRevenue).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">
                  Additional company revenue
                </div>
              </div>
            </div>

            {/* Pricing Tiers */}
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold">Pricing Tier Breakdown:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                <div className="p-3 border rounded-lg bg-gray-50">
                  <div className="font-medium text-gray-600">Standard (Under $100)</div>
                  <p className="text-xs">No surcharge - competitive base pricing</p>
                </div>
                <div className="p-3 border rounded-lg bg-green-50">
                  <div className="font-medium text-green-600">Basic+ ($100-$499)</div>
                  <p className="text-xs">+$2.00 service, +$1.00 driver bonus</p>
                </div>
                <div className="p-3 border rounded-lg bg-blue-50">
                  <div className="font-medium text-blue-600">Value ($500-$999)</div>
                  <p className="text-xs">+$4.00 service, +$1.50 driver bonus</p>
                </div>
                <div className="p-3 border rounded-lg bg-purple-50">
                  <div className="font-medium text-purple-600">Enhanced ($1K-$5K)</div>
                  <p className="text-xs">+$8.00 service, +$3.00 driver bonus</p>
                </div>
                <div className="p-3 border rounded-lg bg-orange-50">
                  <div className="font-medium text-orange-600">Premium ($5K-$10K)</div>
                  <p className="text-xs">+$15.00 service, +$5.00 driver bonus</p>
                </div>
                <div className="p-3 border rounded-lg bg-red-50">
                  <div className="font-medium text-red-600">Ultra Premium ($10K+)</div>
                  <p className="text-xs">+$25.00 service, +$8.00 driver bonus</p>
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
                <h4 className="font-semibold text-blue-600 mb-2">Tiered Implementation</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Clear pricing tiers provide predictable costs and incentivize careful handling
                </p>
                <Badge variant="outline">Recommended</Badge>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-green-600 mb-2">Enhanced Insurance</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Higher tiers include automatic coverage up to item value
                </p>
                <Badge variant="secondary">Added Value</Badge>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2">Implementation Benefits</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Predictable pricing tiers vs. percentage calculations</li>
                <li>• Driver incentives scale with handling responsibility</li>
                <li>• Maintains competitiveness for everyday items</li>
                <li>• Higher margins on premium items fund service improvements</li>
                <li>• Clear value proposition for expensive item returns</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}