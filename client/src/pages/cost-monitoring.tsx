import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, AlertTriangle, Activity, Zap, Database, Brain } from 'lucide-react';

interface CostSummary {
  totalCost: number;
  requestCount: number;
  breakdown: Record<string, { cost: number; requests: number }>;
  dailySummary: Array<{
    date: string;
    service: string;
    totalRequests: number;
    totalTokens: number;
    totalCostUsd: number;
    avgCostPerRequest: number;
  }>;
}

interface CostProjections {
  currentMonth: number;
  dailyAverage: number;
  projectedMonth: number;
  replitBase: number;
  totalProjected: number;
}

export default function CostMonitoring() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const { data: todayCosts, isLoading: loadingToday } = useQuery<CostSummary>({
    queryKey: ['/api/costs/today'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: monthlyCosts, isLoading: loadingMonthly } = useQuery<CostSummary>({
    queryKey: ['/api/costs/monthly'],
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: projections, isLoading: loadingProjections } = useQuery<CostProjections>({
    queryKey: ['/api/costs/projections'],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'openai': return <Brain className="h-4 w-4" />;
      case 'replit': return <Zap className="h-4 w-4" />;
      case 'stripe': return <DollarSign className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getServiceColor = (service: string) => {
    switch (service) {
      case 'openai': return 'bg-blue-500';
      case 'replit': return 'bg-orange-500';
      case 'stripe': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loadingToday || loadingMonthly || loadingProjections) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cost Monitoring</h1>
          <p className="text-gray-600 mt-2">Track and monitor all platform costs including OpenAI, Replit, and other services</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cost Monitoring</h1>
        <p className="text-gray-600 mt-2">Track and monitor all platform costs including OpenAI, Replit, and other services</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Costs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(todayCosts?.totalCost || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {todayCosts?.requestCount || 0} API calls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyCosts?.totalCost || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {monthlyCosts?.requestCount || 0} total requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Projection</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(projections?.totalProjected || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Est. API + Replit costs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(projections?.dailyAverage || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Based on current usage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="breakdown" className="space-y-6">
        <TabsList>
          <TabsTrigger value="breakdown">Service Breakdown</TabsTrigger>
          <TabsTrigger value="trends">Daily Trends</TabsTrigger>
          <TabsTrigger value="projections">Cost Projections</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Service Breakdown</CardTitle>
                <CardDescription>Cost distribution by service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {todayCosts?.breakdown && Object.entries(todayCosts.breakdown).map(([service, data]) => (
                  <div key={service} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${getServiceColor(service)}`}>
                        {getServiceIcon(service)}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{service}</p>
                        <p className="text-sm text-gray-500">{data.requests} requests</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(data.cost)}</p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(data.cost / data.requests)} avg
                      </p>
                    </div>
                  </div>
                ))}
                
                {(!todayCosts?.breakdown || Object.keys(todayCosts.breakdown).length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No API usage recorded today</p>
                    <p className="text-sm">Costs will appear here once you use AI features</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monthly Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Service Breakdown</CardTitle>
                <CardDescription>Cost distribution this month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {monthlyCosts?.breakdown && Object.entries(monthlyCosts.breakdown).map(([service, data]) => (
                  <div key={service} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${getServiceColor(service)}`}>
                        {getServiceIcon(service)}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{service}</p>
                        <p className="text-sm text-gray-500">{data.requests} requests</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(data.cost)}</p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(data.cost / data.requests)} avg
                      </p>
                    </div>
                  </div>
                ))}
                
                {(!monthlyCosts?.breakdown || Object.keys(monthlyCosts.breakdown).length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No API usage recorded this month</p>
                    <p className="text-sm">Start using AI features to see cost tracking</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Cost Trends</CardTitle>
              <CardDescription>Daily spending over time</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyCosts?.dailySummary && monthlyCosts.dailySummary.length > 0 ? (
                <div className="space-y-4">
                  {monthlyCosts.dailySummary.slice(0, 14).map((day, index) => (
                    <div key={`${day.date}-${day.service}`} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{formatDate(day.date)}</Badge>
                        <div className="flex items-center space-x-2">
                          {getServiceIcon(day.service)}
                          <span className="capitalize">{day.service}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(day.totalCostUsd)}</p>
                        <p className="text-sm text-gray-500">{day.totalRequests} requests</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Historical Data</h3>
                  <p>Cost trends will appear here once you have some API usage history</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projections" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Cost Projection</CardTitle>
                <CardDescription>Estimated costs for current month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">API Costs (Current)</span>
                    <span className="font-bold">{formatCurrency(projections?.currentMonth || 0)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">API Costs (Projected)</span>
                    <span className="font-bold">{formatCurrency(projections?.projectedMonth || 0)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Replit Core Plan</span>
                    <span className="font-bold">{formatCurrency(projections?.replitBase || 20)}</span>
                  </div>
                  
                  <hr />
                  
                  <div className="flex justify-between text-lg">
                    <span className="font-medium">Total Projected</span>
                    <span className="font-bold text-orange-600">{formatCurrency(projections?.totalProjected || 0)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Monthly Budget Progress</span>
                    <span>{Math.round(((projections?.currentMonth || 0) / (projections?.projectedMonth || 1)) * 100)}%</span>
                  </div>
                  <Progress 
                    value={Math.min(((projections?.currentMonth || 0) / (projections?.projectedMonth || 1)) * 100, 100)} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Optimization Tips</CardTitle>
                <CardDescription>Ways to reduce platform costs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-start space-x-2">
                      <Brain className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">OpenAI Optimization</p>
                        <p className="text-sm text-blue-700">Using GPT-3.5-turbo (cheapest model) instead of GPT-4</p>
                        <p className="text-xs text-blue-600 mt-1">Saves ~90% on AI costs</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-start space-x-2">
                      <Zap className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Token Optimization</p>
                        <p className="text-sm text-green-700">Reduced max tokens to 500 per request</p>
                        <p className="text-xs text-green-600 mt-1">Limits response length for cost control</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-900">Usage Monitoring</p>
                        <p className="text-sm text-amber-700">Real-time cost tracking and alerting</p>
                        <p className="text-xs text-amber-600 mt-1">Prevents unexpected cost spikes</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    <strong>Daily Budget:</strong> Based on current usage, we're spending about {formatCurrency(projections?.dailyAverage || 0)} per day on API costs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}