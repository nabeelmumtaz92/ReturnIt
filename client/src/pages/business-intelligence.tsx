import { useState } from 'react';
import { useBusinessIntelligenceData } from '@/hooks/useBusinessIntelligenceData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'wouter';
import { AdminLayout } from '@/components/AdminLayout';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Package, 
  Calendar, MapPin, Target, BarChart3, PieChart, LineChart,
  Download, RefreshCw, AlertTriangle, CheckCircle 
} from 'lucide-react';

export default function BusinessIntelligence() {
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  // Use the custom hook to get all business intelligence data
  const {
    kpiData,
    kpiLoading,
    demandData,
    demandLoading,
    pricingOptimization,
    pricingLoading,
    marketExpansion,
    marketLoading,
    hasValidKpiData,
    isLoading
  } = useBusinessIntelligenceData(timeRange);

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <AdminLayout pageTitle="Business Intelligence">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-amber-900 mb-2">Loading Business Intelligence...</h2>
            <p className="text-amber-700">Fetching analytics data from database</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Enhanced error handling for invalid data
  if (!hasValidKpiData) {
    console.warn('Invalid KPI data received:', kpiData);
    return (
      <AdminLayout pageTitle="Business Intelligence">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-amber-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-amber-900 mb-2">Data Error</h2>
            <p className="text-amber-700">Unable to load business intelligence data. Please refresh the page.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  return (
    <AdminLayout
      pageTitle="Business Intelligence"
      tabs={[
        { label: "Overview", href: "/business-intelligence", current: true },
        { label: "Market Analysis", href: "/business-intelligence#market", current: false },
        { label: "Forecasting", href: "/business-intelligence#forecast", current: false }
      ]}
    >
      <div className="max-w-7xl mx-auto">
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
                  <p className="text-2xl font-bold text-gray-900">${kpiData?.revenue.current.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">+{kpiData?.revenue.growth}%</span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{kpiData?.orders.current.toLocaleString()}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">+{kpiData?.orders.growth}%</span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Drivers</p>
                  <p className="text-2xl font-bold text-gray-900">{kpiData?.drivers.current}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">+{kpiData?.drivers.growth}%</span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">${kpiData?.avgOrderValue.current}</p>
                </div>
                <Target className="h-8 w-8 text-amber-600" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">+{kpiData?.avgOrderValue.growth}%</span>
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
                    {demandData && demandData.map((day, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900 w-8">{day.day}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Actual: {day.orders}</span>
                            <span className="text-sm text-blue-600">Predicted: {day.predictedOrders}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            High confidence
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
                    <strong>Base Service Price:</strong> $3.99
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Based on competitor analysis and demand patterns
                  </p>
                </div>

                <div className="space-y-4">
                  {pricingOptimization && pricingOptimization.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{item.service}</h4>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">${item.recommendedPrice}</p>
                          <Badge variant={item.profitability === 'high' ? 'default' : item.profitability === 'medium' ? 'secondary' : 'destructive'} className="text-xs">
                            {item.profitability} profitability
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.reasoning}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Current: ${item.currentPrice} → Recommended: ${item.recommendedPrice}</span>
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
                  {marketExpansion && marketExpansion.map((area, index) => (
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
                        <p className="font-medium text-gray-900">ReturnIt (Us)</p>
                        <p className="text-sm text-gray-600">Premium service</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">$3.99</p>
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
                      <span className="text-sm font-medium">ReturnIt</span>
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
    </AdminLayout>
  );
}