import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, TrendingUp, Brain } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function BusinessIntelligence() {
  const forecastData = [
    { week: 'Week 1', revenue: 1500, projected: 1600 },
    { week: 'Week 2', revenue: 1800, projected: 1900 },
    { week: 'Week 3', revenue: 2200, projected: 2300 },
    { week: 'Week 4', revenue: 2600, projected: 2700 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Business Intelligence</h1>
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
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
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
          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
            <h4 className="font-semibold mb-2 text-blue-900">📊 Revenue Analysis</h4>
            <p className="text-sm text-blue-800">
              Top retailers contribute <span className="font-bold">45%</span> of total returns. Consider expanding partnerships with high-volume retailers for increased revenue.
            </p>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg">
            <h4 className="font-semibold mb-2 text-green-900">⚡ Operational Efficiency</h4>
            <p className="text-sm text-green-800">
              Average processing time reduced by <span className="font-bold">12%</span> since implementing AI-powered route optimization. Driver satisfaction improved by 15%.
            </p>
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
            <h4 className="font-semibold mb-2 text-purple-900">📈 Growth Forecast</h4>
            <p className="text-sm text-purple-800">
              Predicted quarterly growth: <span className="font-bold text-green-600">+14%</span>. Customer-paid premium pricing tiers driving 35% of revenue growth.
            </p>
          </div>

          <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Service Tier Mix</p>
              <p className="text-2xl font-bold text-foreground mb-2">35% Premium</p>
              <p className="text-xs text-muted-foreground">Priority + Instant tiers account for 35% of bookings, up from 28% last month</p>
            </div>

            <div className="p-4 bg-white border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Peak Hours</p>
              <p className="text-2xl font-bold text-foreground mb-2">2-6 PM</p>
              <p className="text-xs text-muted-foreground">68% of orders placed during afternoon hours. Consider dynamic pricing during peak times.</p>
            </div>

            <div className="p-4 bg-white border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Customer LTV</p>
              <p className="text-2xl font-bold text-foreground mb-2">$324</p>
              <p className="text-xs text-muted-foreground">Average customer lifetime value increased 22% with loyalty rewards program</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
