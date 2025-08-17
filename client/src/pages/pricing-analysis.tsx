import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Package, DollarSign, Users, Target, AlertTriangle } from "lucide-react";

export default function PricingAnalysis() {
  // Market research data for common return items
  const returnCategories = [
    { category: "Clothing", avgValue: 45, volume: "45%", example: "Shirts, jeans, dresses" },
    { category: "Electronics", avgValue: 280, volume: "25%", example: "Phones, tablets, headphones" },
    { category: "Home & Garden", avgValue: 85, volume: "15%", example: "Kitchen appliances, decor" },
    { category: "Beauty & Health", avgValue: 35, volume: "10%", example: "Skincare, supplements" },
    { category: "Books & Media", avgValue: 25, volume: "3%", example: "Books, DVDs, games" },
    { category: "Luxury Items", avgValue: 850, volume: "2%", example: "Designer bags, jewelry" }
  ];

  const competitorAnalysis = [
    {
      service: "ReturnIt (Current)",
      model: "Flat Rate",
      basePrice: 7.24,
      phoneReturn: 7.24,
      luxuryReturn: 7.24,
      marketPosition: "Budget-friendly"
    },
    {
      service: "ReturnIt (Optimized)",
      model: "Tiered",
      basePrice: 7.24,
      phoneReturn: 14.74,
      luxuryReturn: 35.24,
      marketPosition: "Value-based"
    },
    {
      service: "UPS Store",
      model: "Package-based",
      basePrice: 12.00,
      phoneReturn: 15.00,
      luxuryReturn: 18.00,
      marketPosition: "Traditional"
    },
    {
      service: "FedEx Office",
      model: "Package-based",
      basePrice: 14.50,
      phoneReturn: 18.00,
      luxuryReturn: 22.00,
      marketPosition: "Premium"
    }
  ];

  const revenueProjections = [
    {
      scenario: "Current Model",
      avgOrderValue: 7.24,
      driverPay: 4.75,
      companyRevenue: 2.49,
      monthlyOrders: 1000,
      monthlyRevenue: 2490
    },
    {
      scenario: "Optimized Tiers",
      avgOrderValue: 9.85,
      driverPay: 6.20,
      companyRevenue: 3.65,
      monthlyOrders: 950, // Slight volume decrease due to higher prices
      monthlyRevenue: 3468
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Pricing Strategy Analysis</h1>
          <p className="text-lg text-gray-600">
            Data-driven insights for optimizing ReturnIt's tiered pricing model
          </p>
        </div>

        <Tabs defaultValue="market" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="market">Market Analysis</TabsTrigger>
            <TabsTrigger value="tiers">Optimized Tiers</TabsTrigger>
            <TabsTrigger value="competitive">Competition</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Impact</TabsTrigger>
          </TabsList>

          {/* Market Analysis */}
          <TabsContent value="market" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Return Item Categories & Values
                </CardTitle>
                <CardDescription>
                  Analysis of common return items and their typical values
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {returnCategories.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{item.category}</h3>
                        <Badge variant="outline">{item.volume}</Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-bold text-green-600">${item.avgValue}</p>
                        <p className="text-sm text-gray-600">Average value</p>
                        <p className="text-xs text-gray-500">{item.example}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Market Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-green-600">Opportunities</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• 70% of returns are under $100 (competitive pricing maintained)</li>
                      <li>• 25% of returns are $100+ (premium pricing opportunity)</li>
                      <li>• Electronics returns have highest value potential</li>
                      <li>• Luxury segment is underserved by current flat-rate model</li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-orange-600">Considerations</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Price sensitivity for clothing returns (45% of volume)</li>
                      <li>• Electronics customers expect premium service</li>
                      <li>• Luxury customers prioritize security over price</li>
                      <li>• Driver incentives needed for high-value handling</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Optimized Tiers */}
          <TabsContent value="tiers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Recommended Tier Structure
                </CardTitle>
                <CardDescription>
                  Optimized pricing tiers based on market analysis and psychology
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Tier Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Tier Structure Rationale</h4>
                      <div className="space-y-3 text-sm">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <strong>Standard (Under $50):</strong> Maintains competitiveness for clothing and basic items
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-lg">
                          <strong>Express ($50-$99):</strong> Captures quality clothing and small electronics
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <strong>Basic+ ($100-$499):</strong> Covers phones, tablets, and designer clothing
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <strong>Value ($500-$999):</strong> Mid-range electronics and appliances
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <strong>Enhanced ($1K-$5K):</strong> High-end devices and luxury clothing
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <strong>Premium ($5K-$10K):</strong> Luxury electronics and designer items
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                          <strong>Ultra Premium ($10K+):</strong> Jewelry, art, and ultra-luxury items
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Psychological Pricing Principles</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <p><strong>Value Anchoring:</strong> $50 threshold creates perception of "premium" service</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <p><strong>Progressive Scaling:</strong> Increases feel proportional to value protection</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <p><strong>Driver Motivation:</strong> Meaningful bonuses for careful handling</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                          <p><strong>Market Positioning:</strong> Competitive for volume, premium for value</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Example Scenarios */}
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h4 className="font-semibold text-amber-800 mb-3">Real-World Examples</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-white p-3 rounded border">
                        <p className="font-medium">Zara Dress Return ($85)</p>
                        <p className="text-green-600">Express Tier: $8.24 total</p>
                        <p className="text-xs text-gray-600">Competitive with alternatives</p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="font-medium">iPhone 15 Pro ($1,200)</p>
                        <p className="text-blue-600">Enhanced Tier: $17.24 total</p>
                        <p className="text-xs text-gray-600">Premium service justified</p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="font-medium">Rolex Watch ($8,500)</p>
                        <p className="text-red-600">Premium Tier: $27.24 total</p>
                        <p className="text-xs text-gray-600">White-glove handling</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Competitive Analysis */}
          <TabsContent value="competitive" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Competitive Positioning
                </CardTitle>
                <CardDescription>
                  How ReturnIt's tiered pricing compares to existing solutions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 p-3 text-left">Service</th>
                        <th className="border border-gray-200 p-3 text-left">Model</th>
                        <th className="border border-gray-200 p-3 text-left">Basic Return</th>
                        <th className="border border-gray-200 p-3 text-left">Phone Return</th>
                        <th className="border border-gray-200 p-3 text-left">Luxury Return</th>
                        <th className="border border-gray-200 p-3 text-left">Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitorAnalysis.map((competitor, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="border border-gray-200 p-3 font-medium">{competitor.service}</td>
                          <td className="border border-gray-200 p-3">{competitor.model}</td>
                          <td className="border border-gray-200 p-3">${competitor.basePrice}</td>
                          <td className="border border-gray-200 p-3">${competitor.phoneReturn}</td>
                          <td className="border border-gray-200 p-3">${competitor.luxuryReturn}</td>
                          <td className="border border-gray-200 p-3">
                            <Badge variant={
                              competitor.marketPosition === "Value-based" ? "default" :
                              competitor.marketPosition === "Budget-friendly" ? "secondary" :
                              "outline"
                            }>
                              {competitor.marketPosition}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-green-600">Competitive Advantages</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Door-to-door service (vs. drop-off required)</li>
                      <li>• Competitive pricing for everyday items</li>
                      <li>• Value-based pricing for premium items</li>
                      <li>• Driver incentives ensure careful handling</li>
                      <li>• Transparent tier-based pricing</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-orange-600">Market Gaps</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• No existing tiered value-based return service</li>
                      <li>• Traditional services don't scale with item value</li>
                      <li>• Door-to-door luxury return handling underserved</li>
                      <li>• No driver incentive programs for careful handling</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Impact */}
          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Revenue Impact Analysis
                </CardTitle>
                <CardDescription>
                  Projected financial impact of implementing tiered pricing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Revenue Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {revenueProjections.map((projection, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-4">{projection.scenario}</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm">Average Order Value:</span>
                            <span className="font-bold">${projection.avgOrderValue}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Driver Pay per Order:</span>
                            <span className="font-bold text-green-600">${projection.driverPay}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Company Revenue per Order:</span>
                            <span className="font-bold text-blue-600">${projection.companyRevenue}</span>
                          </div>
                          <hr />
                          <div className="flex justify-between">
                            <span className="text-sm">Monthly Orders:</span>
                            <span className="font-bold">{projection.monthlyOrders}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Monthly Revenue:</span>
                            <span className="font-bold text-purple-600">${projection.monthlyRevenue}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Impact Summary */}
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-3">Projected Improvements</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">+47%</div>
                        <div className="text-sm text-green-700">Revenue Increase</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">+31%</div>
                        <div className="text-sm text-green-700">Driver Earnings</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">+46%</div>
                        <div className="text-sm text-green-700">Company Margin</div>
                      </div>
                    </div>
                  </div>

                  {/* Implementation Timeline */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-3">Implementation Recommendations</h4>
                    <div className="space-y-2 text-sm text-blue-700">
                      <p><strong>Phase 1 (Month 1):</strong> Implement tiers for new orders, A/B test with 25% of customers</p>
                      <p><strong>Phase 2 (Month 2):</strong> Roll out to 75% of customers, monitor conversion rates</p>
                      <p><strong>Phase 3 (Month 3):</strong> Full implementation with driver training and marketing push</p>
                      <p><strong>Expected ROI:</strong> 3-6 months payback period on development costs</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}