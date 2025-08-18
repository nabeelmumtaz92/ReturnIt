import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Calculator, TrendingUp, DollarSign, Truck, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export default function PricingDemo() {
  const [items, setItems] = useState([{ value: 500, description: "iPhone 12" }]); // Individual items with their values
  const [storeName, setStoreName] = useState("Target"); // Single store for all items in order
  const [distance, setDistance] = useState([5]);
  const [itemSize, setItemSize] = useState("M");
  const [pricingModel, setPricingModel] = useState("current");

  // Calculate total order value from all items
  const totalOrderValue = items.reduce((sum, item) => sum + item.value, 0);

  // Helper functions for item management
  const addItem = () => {
    setItems([...items, { value: 100, description: "Item" }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItemValue = (index: number, value: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], value };
    setItems(newItems);
  };

  const updateItemDescription = (index: number, description: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], description };
    setItems(newItems);
  };

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
      totalOrderValue,
      items
    };
  };

  // Advanced tiered pricing structure based on total order value
  const calculateTieredPricing = () => {
    const basePrice = 3.99;
    const distanceFee = distance[0] * 0.50;
    const sizeUpcharge = itemSize === "L" ? 2.00 : itemSize === "XL" ? 4.00 : 0;
    
    // Calculate subtotal before value tier
    const subtotal = basePrice + distanceFee + sizeUpcharge;
    
    // Tiered value components based on total order value (not individual item)
    let valueComponent = 0;
    let driverValueBonus = 0;
    let serviceFeeRate = 0.15; // Base service fee rate
    let tier = "Standard";
    
    // totalOrderValue is already calculated from items array
    
    if (totalOrderValue >= 25000) {
      // Tier 12: $25,000+ - Elite Luxury (Art, Collectibles, Ultra-luxury items)
      valueComponent = 150.00;
      driverValueBonus = 45.00;
      serviceFeeRate = 0.35; // 35% service fee for elite handling
      tier = "Elite Luxury ($25K+)";
    } else if (totalOrderValue >= 15000) {
      // Tier 11: $15,000-$24,999 - Ultra Premium Plus (High-end luxury)
      valueComponent = 100.00;
      driverValueBonus = 30.00;
      serviceFeeRate = 0.30; // 30% service fee
      tier = "Ultra Premium+ ($15K-$25K)";
    } else if (totalOrderValue >= 10000) {
      // Tier 10: $10,000-$14,999 - Ultra Premium (Luxury items, Jewelry)
      valueComponent = 75.00;
      driverValueBonus = 22.00;
      serviceFeeRate = 0.28; // 28% service fee
      tier = "Ultra Premium ($10K-$15K)";
    } else if (totalOrderValue >= 7500) {
      // Tier 9: $7,500-$9,999 - Premium Plus (High-end electronics)
      valueComponent = 50.00;
      driverValueBonus = 16.00;
      serviceFeeRate = 0.25; // 25% service fee
      tier = "Premium+ ($7.5K-$10K)";
    } else if (totalOrderValue >= 5000) {
      // Tier 8: $5,000-$7,499 - Premium (Luxury electronics, Designer items)
      valueComponent = 35.00;
      driverValueBonus = 12.00;
      serviceFeeRate = 0.23; // 23% service fee
      tier = "Premium ($5K-$7.5K)";
    } else if (totalOrderValue >= 3000) {
      // Tier 7: $3,000-$4,999 - Enhanced Plus (Multiple high-value items)
      valueComponent = 25.00;
      driverValueBonus = 8.00;
      serviceFeeRate = 0.21; // 21% service fee
      tier = "Enhanced+ ($3K-$5K)";
    } else if (totalOrderValue >= 2000) {
      // Tier 6: $2,000-$2,999 - Enhanced (High-end devices)
      valueComponent = 18.00;
      driverValueBonus = 6.00;
      serviceFeeRate = 0.19; // 19% service fee
      tier = "Enhanced ($2K-$3K)";
    } else if (totalOrderValue >= 1000) {
      // Tier 5: $1,000-$1,999 - Value Plus (Phones, Laptops)
      valueComponent = 12.00;
      driverValueBonus = 4.00;
      serviceFeeRate = 0.18; // 18% service fee
      tier = "Value+ ($1K-$2K)";
    } else if (totalOrderValue >= 500) {
      // Tier 4: $500-$999 - Value (Tablets, Mid-range electronics)
      valueComponent = 8.00;
      driverValueBonus = 2.50;
      serviceFeeRate = 0.17; // 17% service fee
      tier = "Value ($500-$1K)";
    } else if (totalOrderValue >= 250) {
      // Tier 3: $250-$499 - Basic Plus (Multiple items, small appliances)
      valueComponent = 5.00;
      driverValueBonus = 1.50;
      serviceFeeRate = 0.16; // 16% service fee
      tier = "Basic+ ($250-$500)";
    } else if (totalOrderValue >= 100) {
      // Tier 2: $100-$249 - Express (Quality clothing, accessories)
      valueComponent = 2.50;
      driverValueBonus = 1.00;
      serviceFeeRate = 0.155; // 15.5% service fee
      tier = "Express ($100-$250)";
    } else if (totalOrderValue >= 50) {
      // Tier 1: $50-$99 - Basic (Standard clothing)
      valueComponent = 1.00;
      driverValueBonus = 0.50;
      serviceFeeRate = 0.15; // 15% service fee (base rate)
      tier = "Basic ($50-$100)";
    }
    // Under $50: Standard pricing with base 15% service fee
    
    const serviceFee = (subtotal + valueComponent) * serviceFeeRate;
    const total = subtotal + valueComponent + serviceFee;
    
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
        serviceFee,
        serviceFeeRate
      },
      driverEarnings: driverTotal,
      driverValueBonus,
      companyRevenue,
      totalOrderValue,
      items,
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
            {/* Single Store + Multiple Items Management */}
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-blue-50">
                <h4 className="font-semibold mb-3">Return Store</h4>
                <Input
                  placeholder="Store name (e.g., Target, Best Buy, Amazon)"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="mb-2"
                />
                <p className="text-sm text-blue-700">All items in this order will be returned to this store</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Items to Return (Total: ${totalOrderValue.toLocaleString()})</h4>
                  <Button 
                    onClick={addItem}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <Input
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) => updateItemDescription(index, e.target.value)}
                          className="mb-2"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">$</span>
                          <Input
                            type="number"
                            value={item.value}
                            onChange={(e) => updateItemValue(index, parseInt(e.target.value) || 0)}
                            className="flex-1"
                            min="0"
                            step="10"
                          />
                        </div>
                      </div>
                      {items.length > 1 && (
                        <Button
                          onClick={() => removeItem(index)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

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
                <div className="flex justify-between text-sm font-medium text-blue-600">
                  <span>Base Service Fee:</span>
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
                <div className="flex justify-between text-sm font-medium text-blue-600">
                  <span>Base Service Fee:</span>
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
                  <span>Service Fee ({(tieredPricing.breakdown.serviceFeeRate * 100).toFixed(1)}%):</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 text-sm">
                <div className="p-2 border rounded bg-gray-50">
                  <div className="font-medium text-gray-600 text-xs">Standard (Under $50)</div>
                  <p className="text-xs">$3.99 base + 15% service fee</p>
                </div>
                <div className="p-2 border rounded bg-slate-50">
                  <div className="font-medium text-slate-600 text-xs">Basic ($50-$100)</div>
                  <p className="text-xs">$3.99 base +$1, +$0.50 driver, 15%</p>
                </div>
                <div className="p-2 border rounded bg-emerald-50">
                  <div className="font-medium text-emerald-600 text-xs">Express ($100-$250)</div>
                  <p className="text-xs">$3.99 base +$2.50, +$1 driver, 15.5%</p>
                </div>
                <div className="p-2 border rounded bg-green-50">
                  <div className="font-medium text-green-600 text-xs">Basic+ ($250-$500)</div>
                  <p className="text-xs">$3.99 base +$5, +$1.50 driver, 16%</p>
                </div>
                <div className="p-2 border rounded bg-blue-50">
                  <div className="font-medium text-blue-600 text-xs">Value ($500-$1K)</div>
                  <p className="text-xs">$3.99 base +$8, +$2.50 driver, 17%</p>
                </div>
                <div className="p-2 border rounded bg-indigo-50">
                  <div className="font-medium text-indigo-600 text-xs">Value+ ($1K-$2K)</div>
                  <p className="text-xs">$3.99 base +$12, +$4 driver, 18%</p>
                </div>
                <div className="p-2 border rounded bg-purple-50">
                  <div className="font-medium text-purple-600 text-xs">Enhanced ($2K-$3K)</div>
                  <p className="text-xs">$3.99 base +$18, +$6 driver, 19%</p>
                </div>
                <div className="p-2 border rounded bg-violet-50">
                  <div className="font-medium text-violet-600 text-xs">Enhanced+ ($3K-$5K)</div>
                  <p className="text-xs">$3.99 base +$25, +$8 driver, 21%</p>
                </div>
                <div className="p-2 border rounded bg-pink-50">
                  <div className="font-medium text-pink-600 text-xs">Premium ($5K-$7.5K)</div>
                  <p className="text-xs">$3.99 base +$35, +$12 driver, 23%</p>
                </div>
                <div className="p-2 border rounded bg-orange-50">
                  <div className="font-medium text-orange-600 text-xs">Premium+ ($7.5K-$10K)</div>
                  <p className="text-xs">$3.99 base +$50, +$16 driver, 25%</p>
                </div>
                <div className="p-2 border rounded bg-red-50">
                  <div className="font-medium text-red-600 text-xs">Ultra Premium ($10K-$15K)</div>
                  <p className="text-xs">$3.99 base +$75, +$22 driver, 28%</p>
                </div>
                <div className="p-2 border rounded bg-rose-50">
                  <div className="font-medium text-rose-600 text-xs">Ultra Premium+ ($15K-$25K)</div>
                  <p className="text-xs">$3.99 base +$100, +$30 driver, 30%</p>
                </div>
                <div className="p-2 border rounded bg-amber-50">
                  <div className="font-medium text-amber-600 text-xs">Elite Luxury ($25K+)</div>
                  <p className="text-xs">$3.99 base +$150, +$45 driver, 35%</p>
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
              <h4 className="font-semibold text-amber-800 mb-2">Pricing Structure</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• <strong>$3.99 base fee</strong> applies to every order regardless of value</li>
                <li>• Value tier fees add to base fee based on total order value</li>
                <li>• Distance fees ($0.50/mile) and size upcharges apply</li>
                <li>• Service fees scale from 15% to 35% based on order value</li>
                <li>• Driver bonuses increase significantly for valuable shipments</li>
                <li>• All items in one order go to the same store for efficiency</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}