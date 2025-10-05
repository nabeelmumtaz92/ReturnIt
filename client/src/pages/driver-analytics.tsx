import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  DollarSign, 
  Star, 
  Clock,
  Target,
  Award,
  BarChart3,
  Calendar,
  MapPin,
  Users,
  AlertCircle,
  CheckCircle,
  Trophy,
  Zap
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface DriverStats {
  id: number;
  totalEarnings: number;
  completedDeliveries: number;
  avgRating: number;
  onlineHours: number;
  completionRate: number;
  avgPickupTime: number;
  avgDeliveryTime: number;
  weeklyEarnings: { date: string; earnings: number }[];
  dailyStats: { date: string; orders: number; hours: number; earnings: number }[];
  performanceMetrics: {
    efficiency: number;
    reliability: number;
    customerSatisfaction: number;
  };
  achievements: {
    id: string;
    title: string;
    description: string;
    earnedAt: string;
    icon: string;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DriverAnalytics() {
  const [timeRange, setTimeRange] = useState('week');
  
  const { data: stats, isLoading } = useQuery<DriverStats>({
    queryKey: ['/api/driver/analytics', timeRange],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Loading your analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No analytics data available yet. Start delivering to see your stats!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Driver Performance Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your performance, earnings, and achievements</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={timeRange === 'week' ? 'default' : 'outline'}
            onClick={() => setTimeRange('week')}
            size="sm"
            data-testid="button-week-view"
          >
            This Week
          </Button>
          <Button 
            variant={timeRange === 'month' ? 'default' : 'outline'}
            onClick={() => setTimeRange('month')}
            size="sm"
            data-testid="button-month-view"
          >
            This Month
          </Button>
          <Button 
            variant={timeRange === 'year' ? 'default' : 'outline'}
            onClick={() => setTimeRange('year')}
            size="sm"
            data-testid="button-year-view"
          >
            This Year
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-3xl font-bold text-green-600">
                  ${stats.totalEarnings.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Orders</p>
                <p className="text-3xl font-bold">{stats.completedDeliveries}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold">{stats.avgRating.toFixed(1)}</p>
                  <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Online Hours</p>
                <p className="text-3xl font-bold">{Math.round(stats.onlineHours)}h</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Efficiency Score</span>
                <span>{stats.performanceMetrics.efficiency}%</span>
              </div>
              <Progress value={stats.performanceMetrics.efficiency} className="h-3" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Reliability Score</span>
                <span>{stats.performanceMetrics.reliability}%</span>
              </div>
              <Progress value={stats.performanceMetrics.reliability} className="h-3" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Customer Satisfaction</span>
                <span>{stats.performanceMetrics.customerSatisfaction}%</span>
              </div>
              <Progress value={stats.performanceMetrics.customerSatisfaction} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="earnings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="earnings" data-testid="tab-earnings">Earnings</TabsTrigger>
          <TabsTrigger value="performance" data-testid="tab-performance">Performance</TabsTrigger>
          <TabsTrigger value="achievements" data-testid="tab-achievements">Achievements</TabsTrigger>
          <TabsTrigger value="insights" data-testid="tab-insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.weeklyEarnings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
                    <Line 
                      type="monotone" 
                      dataKey="earnings" 
                      stroke="#22c55e" 
                      strokeWidth={3}
                      dot={{ fill: '#22c55e' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stats.completionRate}%</span>
                      <Badge variant="secondary">Excellent</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Pickup Time</span>
                    <span className="font-medium">{stats.avgPickupTime} min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Delivery Time</span>
                    <span className="font-medium">{stats.avgDeliveryTime} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6" />
                Your Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="border rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-transparent"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Zap className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-800">Great Job!</p>
                        <p className="text-sm text-green-700">
                          Your completion rate is 15% above average. Keep up the excellent work!
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800">Opportunity</p>
                        <p className="text-sm text-blue-700">
                          Peak hours are 5-7 PM. Working more during this time could increase earnings by 20%.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">1</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Reach 100 deliveries</p>
                      <p className="text-sm text-gray-600">Progress: {stats.completedDeliveries}/100</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-yellow-600">2</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Maintain 4.8+ rating</p>
                      <p className="text-sm text-gray-600">Current: {stats.avgRating}/5.0</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-green-600">3</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Earn $1,000 this month</p>
                      <p className="text-sm text-gray-600">Progress: ${stats.totalEarnings}/$1,000</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}