import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'wouter';
import { AdminNavigation } from '@/components/AdminNavigation';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Package, 
  Calendar, MapPin, Target, BarChart3, PieChart, LineChart,
  Download, RefreshCw, AlertTriangle, CheckCircle 
} from 'lucide-react';

export default function BusinessIntelligence() {
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  const kpiData = {
    revenue: {
      current: 28750,
      previous: 24100,
      growth: 19.3,
      trend: 'up'
    },
    orders: {
      current: 1247,
      previous: 1089,
      growth: 14.5,
      trend: 'up'
    },
    drivers: {
      current: 23,
      previous: 19,
      growth: 21.1,
      trend: 'up'
    },
    avgOrderValue: {
      current: 23.06,
      previous: 22.13,
      growth: 4.2,
      trend: 'up'
    }
  };

  const demandData = [
    { day: 'Mon', orders: 45, predicted: 52, confidence: 0.85 },
    { day: 'Tue', orders: 38, predicted: 41, confidence: 0.92 },
    { day: 'Wed', orders: 52, predicted: 48, confidence: 0.78 },
    { day: 'Thu', orders: 41, predicted: 45, confidence: 0.91 },
    { day: 'Fri', orders: 67, predicted: 71, confidence: 0.87 },
    { day: 'Sat', orders: 89, predicted: 85, confidence: 0.94 },
    { day: 'Sun', orders: 76, predicted: 78, confidence: 0.89 }
  ];

  const pricingOptimization = {
    basePrice: 8.99,
    recommendations: [
      {
        scenario: 'Peak Hours (5-7 PM)',
        suggestedPrice: 11.99,
        expectedIncrease: '+15% revenue',
        confidence: 0.87,
        reason: 'High demand, low driver availability'
      },
      {
        scenario: 'Weekend Rush',
        suggestedPrice: 10.49,
        expectedIncrease: '+8% revenue',
        confidence: 0.92,
        reason: 'Increased order volume, maintain competitiveness'
      },
      {
        scenario: 'Off-Peak (10 AM - 2 PM)',
        suggestedPrice: 7.99,
        expectedIncrease: '+22% orders',
        confidence: 0.79,
        reason: 'Drive volume during slow periods'
      }
    ]
  };

  const marketExpansion = [
    {
      area: 'Clayton, MO',
      score: 8.7,
      population: 15685,
      avgIncome: 89000,
      competition: 'Low',
      estimatedOrders: '45-60/week',
      investment: '$12,000',
      breakeven: '4 months'
    },
    {
      area: 'Chesterfield, MO',
      score: 8.2,
      population: 47484,
      avgIncome: 95000,
      competition: 'Medium',
      estimatedOrders: '80-110/week',
      investment: '$18,000',
      breakeven: '5 months'
    },
    {
      area: 'Kirkwood, MO',
      score: 7.8,
      population: 27540,
      avgIncome: 75000,
      competition: 'Medium',
      estimatedOrders: '35-50/week',
      investment: '$10,000',
      breakeven: '6 months'
    }
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8">
      <AdminNavigation />
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-900">Business Intelligence</h1>
            <p className="text-amber-700">Strategic insights and performance analytics</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-amber-300 text-amber-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/admin-dashboard">
              <Button variant="outline" className="border-amber-300 text-amber-700">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${kpiData.revenue.current.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">+{kpiData.revenue.growth}%</span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{kpiData.orders.current.toLocaleString()}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">+{kpiData.orders.growth}%</span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Drivers</p>
                  <p className="text-2xl font-bold text-gray-900">{kpiData.drivers.current}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">+{kpiData.drivers.growth}%</span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">${kpiData.avgOrderValue.current}</p>
                </div>
                <Target className="h-8 w-8 text-amber-600" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">+{kpiData.avgOrderValue.growth}%</span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="forecasting" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="forecasting">Demand Forecasting</TabsTrigger>
            <TabsTrigger value="pricing">Pricing Optimization</TabsTrigger>
            <TabsTrigger value="expansion">Market Expansion</TabsTrigger>
            <TabsTrigger value="competitive">Competitive Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="forecasting" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <LineChart className="h-5 w-5" />
                    Weekly Demand Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {demandData.map((day, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900 w-8">{day.day}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Actual: {day.orders}</span>
                            <span className="text-sm text-blue-600">Predicted: {day.predicted}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={day.confidence > 0.9 ? 'default' : day.confidence > 0.8 ? 'secondary' : 'destructive'}>
                            {Math.round(day.confidence * 100)}% confidence
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <Calendar className="h-5 w-5" />
                    Seasonal Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Holiday Season Forecast</h4>
                      <p className="text-sm text-blue-700">Expected 45% increase in return requests during December</p>
                      <div className="mt-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="text-xs text-amber-700">Recommend hiring 8-12 temporary drivers</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Back-to-School Period</h4>
                      <p className="text-sm text-green-700">Consistent 25% uptick expected in August-September</p>
                      <div className="mt-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-green-700">Current driver capacity sufficient</span>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-2">Spring Cleaning</h4>
                      <p className="text-sm text-orange-700">Moderate 15% increase predicted for March-April</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Target className="h-4 w-4 text-orange-500" />
                        <span className="text-xs text-orange-700">Opportunity for targeted marketing campaigns</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <DollarSign className="h-5 w-5" />
                  Dynamic Pricing Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Current Base Price:</strong> ${pricingOptimization.basePrice}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Based on competitor analysis and demand patterns
                  </p>
                </div>

                <div className="space-y-4">
                  {pricingOptimization.recommendations.map((rec, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{rec.scenario}</h4>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">${rec.suggestedPrice}</p>
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(rec.confidence * 100)}% confidence
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{rec.reason}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600">{rec.expectedIncrease}</span>
                        <Button size="sm" variant="outline" className="border-green-300 text-green-700">
                          Apply Pricing
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expansion" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <MapPin className="h-5 w-5" />
                  Market Expansion Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketExpansion.map((area, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-gray-900">{area.area}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="default" className="bg-green-600">
                              Score: {area.score}/10
                            </Badge>
                            <Badge variant={area.competition === 'Low' ? 'secondary' : 'destructive'}>
                              {area.competition} Competition
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Investment: {area.investment}</p>
                          <p className="text-sm text-gray-600">Break-even: {area.breakeven}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Population</p>
                          <p className="font-medium">{area.population.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Avg Income</p>
                          <p className="font-medium">${area.avgIncome.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Est. Orders/Week</p>
                          <p className="font-medium">{area.estimatedOrders}</p>
                        </div>
                        <div className="flex items-center">
                          <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                            Launch Analysis
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="competitive" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <BarChart3 className="h-5 w-5" />
                    Competitive Pricing Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Returnly (Us)</p>
                        <p className="text-sm text-gray-600">Premium service</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">$8.99</p>
                        <Badge variant="default">Market Leader</Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">QuickReturn</p>
                        <p className="text-sm text-gray-600">Budget option</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">$6.99</p>
                        <Badge variant="destructive">Lower Quality</Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">ReturnEasy</p>
                        <p className="text-sm text-gray-600">Similar service</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-orange-600">$9.49</p>
                        <Badge variant="secondary">Main Competitor</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <PieChart className="h-5 w-5" />
                    Market Share Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Returnly</span>
                      <span className="text-sm font-bold text-green-600">34%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '34%' }}></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">ReturnEasy</span>
                      <span className="text-sm font-bold text-orange-600">28%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: '28%' }}></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">QuickReturn</span>
                      <span className="text-sm font-bold text-red-600">22%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: '22%' }}></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Others</span>
                      <span className="text-sm font-bold text-gray-600">16%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-600 h-2 rounded-full" style={{ width: '16%' }}></div>
                    </div>
                  </div>

                  <div className="mt-6 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">Competitive Advantage</p>
                    <p className="text-xs text-green-700 mt-1">
                      Leading market share with premium service quality and customer satisfaction
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}