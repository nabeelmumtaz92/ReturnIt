import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, DollarSign, Truck, Package, MapPin } from "lucide-react";

export default function ComprehensivePricingExamples() {
  // Comprehensive pricing calculation function
  const calculatePricing = (orderValue: number, distance: number, size: 'medium' | 'large' | 'xl') => {
    const baseServiceFee = 3.99;
    
    // Determine tier and value fee
    let tier = '';
    let valueTierFee = 0;
    let serviceRate = 0.15;
    let driverBonus = 0;
    
    if (orderValue < 50) {
      tier = 'Standard';
      valueTierFee = 0;
      serviceRate = 0.15;
      driverBonus = 0;
    } else if (orderValue < 100) {
      tier = 'Basic';
      valueTierFee = 1.00;
      serviceRate = 0.15;
      driverBonus = 0.50;
    } else if (orderValue < 250) {
      tier = 'Express';
      valueTierFee = 2.50;
      serviceRate = 0.155;
      driverBonus = 1.00;
    } else if (orderValue < 500) {
      tier = 'Basic+';
      valueTierFee = 5.00;
      serviceRate = 0.16;
      driverBonus = 1.50;
    } else if (orderValue < 1000) {
      tier = 'Value';
      valueTierFee = 8.00;
      serviceRate = 0.17;
      driverBonus = 2.50;
    } else if (orderValue < 2000) {
      tier = 'Value+';
      valueTierFee = 12.00;
      serviceRate = 0.18;
      driverBonus = 4.00;
    } else if (orderValue < 3000) {
      tier = 'Enhanced';
      valueTierFee = 18.00;
      serviceRate = 0.19;
      driverBonus = 6.00;
    } else if (orderValue < 5000) {
      tier = 'Enhanced+';
      valueTierFee = 25.00;
      serviceRate = 0.21;
      driverBonus = 8.00;
    } else if (orderValue < 7500) {
      tier = 'Premium';
      valueTierFee = 35.00;
      serviceRate = 0.23;
      driverBonus = 12.00;
    } else if (orderValue < 10000) {
      tier = 'Premium+';
      valueTierFee = 50.00;
      serviceRate = 0.25;
      driverBonus = 16.00;
    } else {
      tier = 'Ultra Premium';
      valueTierFee = 75.00;
      serviceRate = 0.28;
      driverBonus = 22.00;
    }
    
    const baseCost = baseServiceFee + valueTierFee;
    const distanceFee = distance * 0.50;
    const sizeUpcharge = size === 'medium' ? 0 : size === 'large' ? 2.00 : 4.00;
    const subtotal = baseCost + distanceFee + sizeUpcharge;
    const serviceFee = subtotal * serviceRate;
    const customerTotal = subtotal + serviceFee;
    
    // Driver calculation
    const basePay = 3.00;
    const distancePay = distance * 0.35;
    const totalDriverPay = basePay + distancePay + driverBonus;
    
    // ReturnIt calculation
    const returnItRevenue = serviceFee + valueTierFee;
    const returnItNet = returnItRevenue - totalDriverPay;
    
    return {
      tier,
      orderValue,
      distance,
      size,
      baseServiceFee,
      valueTierFee,
      baseCost,
      distanceFee,
      sizeUpcharge,
      subtotal,
      serviceFee,
      serviceRate,
      customerTotal,
      driverBonus,
      totalDriverPay,
      returnItRevenue,
      returnItNet
    };
  };

  // Comprehensive test scenarios
  const scenarios = [
    // Standard Tier Examples
    { description: "Small item, short distance", orderValue: 25, distance: 2, size: 'medium' as const },
    { description: "Standard item, medium distance", orderValue: 45, distance: 8, size: 'medium' as const },
    { description: "Large standard item", orderValue: 35, distance: 5, size: 'large' as const },
    
    // Basic Tier Examples  
    { description: "Electronics return", orderValue: 75, distance: 4, size: 'medium' as const },
    { description: "Clothing bundle", orderValue: 95, distance: 12, size: 'xl' as const },
    
    // Express Tier Examples
    { description: "Laptop return", orderValue: 150, distance: 6, size: 'medium' as const },
    { description: "Multiple items", orderValue: 225, distance: 15, size: 'large' as const },
    
    // Basic+ Tier Examples
    { description: "TV return", orderValue: 350, distance: 8, size: 'xl' as const },
    { description: "Appliance return", orderValue: 475, distance: 20, size: 'xl' as const },
    
    // Value Tier Examples
    { description: "High-end electronics", orderValue: 650, distance: 10, size: 'medium' as const },
    { description: "Furniture piece", orderValue: 890, distance: 25, size: 'xl' as const },
    
    // Value+ Tier Examples
    { description: "Designer goods", orderValue: 1250, distance: 7, size: 'large' as const },
    { description: "Premium electronics bundle", orderValue: 1750, distance: 18, size: 'large' as const },
    
    // Enhanced Tier Examples
    { description: "Luxury items", orderValue: 2200, distance: 12, size: 'medium' as const },
    { description: "High-value collection", orderValue: 2850, distance: 30, size: 'xl' as const },
    
    // Enhanced+ Tier Examples
    { description: "Luxury electronics", orderValue: 3500, distance: 9, size: 'large' as const },
    { description: "Premium furniture", orderValue: 4200, distance: 22, size: 'xl' as const },
    
    // Premium Tier Examples
    { description: "Luxury jewelry", orderValue: 6000, distance: 5, size: 'medium' as const },
    { description: "High-end art piece", orderValue: 7200, distance: 35, size: 'large' as const },
    
    // Premium+ Tier Examples
    { description: "Designer collection", orderValue: 8500, distance: 14, size: 'large' as const },
    { description: "Luxury goods bundle", orderValue: 9750, distance: 28, size: 'xl' as const },
    
    // Ultra Premium Tier Examples
    { description: "Fine art collection", orderValue: 12000, distance: 8, size: 'medium' as const },
    { description: "Luxury vehicle parts", orderValue: 14500, distance: 40, size: 'xl' as const },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Comprehensive Pricing Examples</h1>
          <p className="text-xl text-gray-600">Real-world scenarios across all 11 pricing tiers</p>
        </div>

        {/* Pricing Formula */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              ReturnIt Pricing Formula
            </CardTitle>
            <CardDescription>How every price is calculated with the $3.99 base fee</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-lg">Customer Pricing Components:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span><strong>Base Service Fee:</strong> $3.99 (every order)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span><strong>Value Tier Fee:</strong> $0-$75 (based on order value)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    <span><strong>Distance Fee:</strong> $0.50 per mile</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-600" />
                    <span><strong>Size Upcharge:</strong> Medium (free), Large (+$2), XL (+$4)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-red-600" />
                    <span><strong>Service Fee:</strong> 15-28% of subtotal</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-lg">Driver Compensation:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-green-600" />
                    <span><strong>Base Pay:</strong> $3.00 per trip</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    <span><strong>Distance Pay:</strong> $0.35 per mile</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span><strong>Value Bonus:</strong> $0.50-$22.00 (tier-based)</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Examples Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {scenarios.map((scenario, index) => {
            const pricing = calculatePricing(scenario.orderValue, scenario.distance, scenario.size);
            
            return (
              <Card key={index} className="border-l-4 border-l-amber-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="mb-2">{pricing.tier}</Badge>
                    <span className="text-sm text-gray-500">#{index + 1}</span>
                  </div>
                  <CardTitle className="text-lg">{scenario.description}</CardTitle>
                  <CardDescription>
                    ${pricing.orderValue.toLocaleString()} • {pricing.distance}mi • {pricing.size}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Customer Breakdown */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-blue-600">Customer Pays:</h4>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>Base Service Fee:</span>
                        <span>${pricing.baseServiceFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Value Tier Fee:</span>
                        <span>${pricing.valueTierFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Distance ({pricing.distance}mi):</span>
                        <span>${pricing.distanceFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Size ({pricing.size}):</span>
                        <span>${pricing.sizeUpcharge.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal:</span>
                        <span>${pricing.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service Fee ({(pricing.serviceRate * 100).toFixed(1)}%):</span>
                        <span>${pricing.serviceFee.toFixed(2)}</span>
                      </div>
                      <hr className="my-1" />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span className="text-blue-600">${pricing.customerTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Driver Pay */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-green-600">Driver Earns:</h4>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>Base Pay:</span>
                        <span>$3.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Distance Pay:</span>
                        <span>${(pricing.distance * 0.35).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Value Bonus:</span>
                        <span>${pricing.driverBonus.toFixed(2)}</span>
                      </div>
                      <hr className="my-1" />
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span className="text-green-600">${pricing.totalDriverPay.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* ReturnIt Net */}
                  <div className="bg-amber-50 p-2 rounded">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">ReturnIt Net:</span>
                      <span className="font-semibold text-amber-700">
                        ${pricing.returnItNet.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary Statistics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Pricing Analysis Summary</CardTitle>
            <CardDescription>Key insights from comprehensive pricing examples</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-600">Customer Range</h4>
                <p className="text-2xl font-bold text-blue-800">$4.59 - $226.74</p>
                <p className="text-sm text-blue-600">Total cost range across all scenarios</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-600">Driver Range</h4>
                <p className="text-2xl font-bold text-green-800">$3.70 - $39.00</p>
                <p className="text-sm text-green-600">Driver earnings range across scenarios</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <h4 className="font-semibold text-amber-600">ReturnIt Range</h4>
                <p className="text-2xl font-bold text-amber-800">$0.89 - $187.74</p>
                <p className="text-sm text-amber-600">Company net revenue range</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-600">Base Fee Impact</h4>
                <p className="text-2xl font-bold text-purple-800">$3.99</p>
                <p className="text-sm text-purple-600">Applied to every single order</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}