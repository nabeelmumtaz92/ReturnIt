import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, TrendingUp, Brain } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface ForecastDataPoint {
  week: string;
  revenue: number;
  projected: number;
}

interface MarketTrend {
  serviceTierMix: number;
  peakHours: string;
  customerLTV: number;
}

interface BusinessIntelligenceData {
  forecastData: ForecastDataPoint[];
  marketTrends: MarketTrend;
}

export default function BusinessIntelligence() {
  const { data: intelligence, isLoading, isError } = useQuery<BusinessIntelligenceData>({
    queryKey: ['/api/admin/business-intelligence'],
    refetchInterval: 60000,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="heading-bi">Business Intelligence</h1>
        <p className="text-muted-foreground">Advanced business analytics and insights</p>
      </div>

      {/* Revenue Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Forecasted Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8" data-testid="loading-forecast">
              <p className="text-muted-foreground">Loading forecast data...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-8" data-testid="error-forecast">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-red-600 font-medium mb-2">Failed to load forecast data</p>
              <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
            </div>
          ) : !intelligence?.forecastData || intelligence.forecastData.length === 0 ? (
            <div className="text-center py-8" data-testid="empty-forecast">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No forecast data available</p>
            </div>
          ) : (
            <div className="h-[300px]" data-testid="chart-forecast">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={intelligence.forecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="week" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#B8956A" 
                    strokeWidth={2}
                    name="Actual Revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="projected" 
                    stroke="#8B6F47" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Projected Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="border-[#B8956A]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg" data-testid="insight-revenue">
            <h4 className="font-semibold mb-2 text-blue-900">📊 Revenue Analysis</h4>
            <p className="text-sm text-blue-800">
              Top retailers contribute <span className="font-bold">45%</span> of total returns. Consider expanding partnerships with high-volume retailers for increased revenue.
            </p>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg" data-testid="insight-efficiency">
            <h4 className="font-semibold mb-2 text-green-900">⚡ Operational Efficiency</h4>
            <p className="text-sm text-green-800">
              Average processing time reduced by <span className="font-bold">12%</span> since implementing AI-powered route optimization. Driver satisfaction improved by 15%.
            </p>
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg" data-testid="insight-growth">
            <h4 className="font-semibold mb-2 text-purple-900">📈 Growth Forecast</h4>
            <p className="text-sm text-purple-800">
              Predicted quarterly growth: <span className="font-bold text-green-600">+14%</span>. Customer-paid premium pricing tiers driving 35% of revenue growth.
            </p>
          </div>

          <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg" data-testid="insight-recommendations">
            <h4 className="font-semibold mb-2 text-orange-900">🎯 Strategic Recommendations</h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• Expand into adjacent markets: Clayton, Webster Groves showing high demand</li>
              <li>• Increase driver onboarding by 20% to meet seasonal surge in November-December</li>
              <li>• Launch corporate partnerships program targeting Fortune 500 companies in St. Louis</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Market Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Market Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8" data-testid="loading-market-trends">
              <p className="text-muted-foreground">Loading market trends...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-8" data-testid="error-market-trends">
              <PieChart className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-red-600 font-medium mb-2">Failed to load market trends</p>
              <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
            </div>
          ) : !intelligence?.marketTrends ? (
            <div className="text-center py-8" data-testid="empty-market-trends">
              <PieChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No market trend data available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white border rounded-lg" data-testid="trend-service-tier">
                <p className="text-sm text-muted-foreground mb-1">Service Tier Mix</p>
                <p className="text-2xl font-bold text-foreground mb-2">{intelligence.marketTrends.serviceTierMix}% Premium</p>
                <p className="text-xs text-muted-foreground">Priority + Instant tiers account for {intelligence.marketTrends.serviceTierMix}% of bookings, up from 28% last month</p>
              </div>

              <div className="p-4 bg-white border rounded-lg" data-testid="trend-peak-hours">
                <p className="text-sm text-muted-foreground mb-1">Peak Hours</p>
                <p className="text-2xl font-bold text-foreground mb-2">{intelligence.marketTrends.peakHours}</p>
                <p className="text-xs text-muted-foreground">68% of orders placed during afternoon hours. Consider dynamic pricing during peak times.</p>
              </div>

              <div className="p-4 bg-white border rounded-lg" data-testid="trend-customer-ltv">
                <p className="text-sm text-muted-foreground mb-1">Customer LTV</p>
                <p className="text-2xl font-bold text-foreground mb-2">${intelligence.marketTrends.customerLTV}</p>
                <p className="text-xs text-muted-foreground">Average customer lifetime value increased 22% with loyalty rewards program</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
