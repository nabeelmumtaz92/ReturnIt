import { useAuth } from "@/hooks/useAuth-simple";
import { Screen } from '@/components/screen';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Target, DollarSign, Clock, Award, Star, Zap, BarChart3 } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import Footer from '@/components/Footer';

export default function DriverPerformance() {
  const { user, isAuthenticated } = useAuth();

  const { data: performanceData } = useQuery({
    queryKey: ['/api/driver/performance'],
    enabled: isAuthenticated && user?.isDriver,
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['/api/driver/leaderboard'],
    enabled: isAuthenticated && user?.isDriver,
  });

  const { data: earningsData } = useQuery({
    queryKey: ['/api/driver/earnings'],
    enabled: isAuthenticated && user?.isDriver,
  });

  if (!isAuthenticated || !user?.isDriver) {
    return (
      <Screen className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-4">Driver Performance Dashboard</h1>
          <p className="text-muted-foreground mb-4">This section is for verified drivers only</p>
          <Button className="bg-primary hover:bg-primary/90">Sign In as Driver</Button>
        </div>
      </Screen>
    );
  }

  const currentStats = {
    weeklyEarnings: 485.50,
    weeklyDeliveries: 32,
    avgRating: 4.9,
    onTimeRate: 96,
    customerSatisfaction: 98,
    efficiency: 92,
    weeklyGoal: 600,
    monthlyRank: 7,
    totalDrivers: 45
  };

  return (
    <Screen>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <TrendingUp className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-blue-900 mb-2">Performance Dashboard</h1>
            <p className="text-blue-700 text-lg">Track your progress and optimize your earnings</p>
          </div>

          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-700 text-sm font-medium">Weekly Earnings</p>
                    <p className="text-3xl font-bold text-green-900">${currentStats.weeklyEarnings}</p>
                    <p className="text-green-600 text-sm">+12% from last week</p>
                  </div>
                  <DollarSign className="h-12 w-12 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-700 text-sm font-medium">Deliveries</p>
                    <p className="text-3xl font-bold text-blue-900">{currentStats.weeklyDeliveries}</p>
                    <p className="text-blue-600 text-sm">This week</p>
                  </div>
                  <Target className="h-12 w-12 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-700 text-sm font-medium">Rating</p>
                    <p className="text-3xl font-bold text-yellow-900">{currentStats.avgRating}</p>
                    <p className="text-yellow-600 text-sm">Average rating</p>
                  </div>
                  <Star className="h-12 w-12 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-700 text-sm font-medium">On-Time Rate</p>
                    <p className="text-3xl font-bold text-purple-900">{currentStats.onTimeRate}%</p>
                    <p className="text-purple-600 text-sm">This month</p>
                  </div>
                  <Clock className="h-12 w-12 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-muted-foreground">Customer Satisfaction</span>
                          <span className="text-sm text-primary">{currentStats.customerSatisfaction}%</span>
                        </div>
                        <Progress value={currentStats.customerSatisfaction} className="h-3" />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-muted-foreground">Route Efficiency</span>
                          <span className="text-sm text-primary">{currentStats.efficiency}%</span>
                        </div>
                        <Progress value={currentStats.efficiency} className="h-3" />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-muted-foreground">On-Time Delivery</span>
                          <span className="text-sm text-primary">{currentStats.onTimeRate}%</span>
                        </div>
                        <Progress value={currentStats.onTimeRate} className="h-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-indigo-200">
                  <CardHeader>
                    <CardTitle className="text-indigo-900">Recent Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
                        <Award className="h-8 w-8 text-indigo-600" />
                        <div>
                          <p className="font-semibold text-indigo-900">Top Performer</p>
                          <p className="text-sm text-indigo-700">Ranked #7 this month</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <Zap className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-900">Speed Demon</p>
                          <p className="text-sm text-green-700">15% faster than average</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <Star className="h-8 w-8 text-yellow-600" />
                        <div>
                          <p className="font-semibold text-yellow-900">Customer Favorite</p>
                          <p className="text-sm text-yellow-700">4.9/5 average rating</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6 border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Weekly Performance Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                      const earnings = [65, 78, 82, 71, 89, 95, 105][index];
                      const deliveries = [4, 5, 6, 5, 7, 8, 9][index];
                      return (
                        <div key={day} className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs font-medium text-gray-600 mb-2">{day}</p>
                          <p className="text-lg font-bold text-gray-900">${earnings}</p>
                          <p className="text-xs text-gray-600">{deliveries} orders</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="goals" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-900">Weekly Goals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-green-700">Earnings Goal</span>
                          <span className="text-sm text-green-600">${currentStats.weeklyEarnings}/${currentStats.weeklyGoal}</span>
                        </div>
                        <Progress value={(currentStats.weeklyEarnings / currentStats.weeklyGoal) * 100} className="h-3" />
                        <p className="text-sm text-green-600 mt-1">
                          ${currentStats.weeklyGoal - currentStats.weeklyEarnings} to reach goal
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-green-700">Delivery Goal</span>
                          <span className="text-sm text-green-600">{currentStats.weeklyDeliveries}/40</span>
                        </div>
                        <Progress value={(currentStats.weeklyDeliveries / 40) * 100} className="h-3" />
                        <p className="text-sm text-green-600 mt-1">8 more deliveries to reach goal</p>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-green-700">Rating Goal</span>
                          <span className="text-sm text-green-600">{currentStats.avgRating}/5.0</span>
                        </div>
                        <Progress value={(currentStats.avgRating / 5) * 100} className="h-3" />
                        <p className="text-sm text-green-600 mt-1">Excellent! Keep it up!</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-900">Performance Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Boost Your Earnings</h4>
                        <p className="text-sm text-blue-700">
                          Work 2 more hours this weekend to hit your weekly goal of $600
                        </p>
                      </div>

                      <div className="p-3 bg-[#f8f7f5] dark:bg-[#231b0f] rounded-lg">
                        <h4 className="font-semibold text-foreground mb-2">Improve Efficiency</h4>
                        <p className="text-sm text-muted-foreground">
                          Use route optimization to reduce travel time by 15 minutes per delivery
                        </p>
                      </div>

                      <div className="p-3 bg-purple-50 rounded-lg">
                        <h4 className="font-semibold text-purple-900 mb-2">Peak Hours</h4>
                        <p className="text-sm text-purple-700">
                          Your best earning hours are 5-8 PM. Focus more deliveries during this time.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="leaderboard" className="mt-6">
              <Card className="border-yellow-200">
                <CardHeader>
                  <CardTitle className="text-yellow-900 flex items-center">
                    <Trophy className="h-6 w-6 mr-2" />
                    Monthly Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { rank: 1, name: "Mike Chen", earnings: 2850, badge: "🥇" },
                      { rank: 2, name: "Sarah Wilson", earnings: 2720, badge: "🥈" },
                      { rank: 3, name: "David Rodriguez", earnings: 2680, badge: "🥉" },
                      { rank: 4, name: "Lisa Thompson", earnings: 2590, badge: "" },
                      { rank: 5, name: "James Parker", earnings: 2510, badge: "" },
                      { rank: 6, name: "Maria Garcia", earnings: 2485, badge: "" },
                      { rank: 7, name: "You", earnings: 2450, badge: "", isCurrentUser: true },
                      { rank: 8, name: "Robert Kim", earnings: 2420, badge: "" },
                    ].map((driver) => (
                      <div
                        key={driver.rank}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          driver.isCurrentUser 
                            ? 'bg-accent border-2 border-border' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{driver.badge || `#${driver.rank}`}</span>
                          <div>
                            <p className={`font-semibold ${driver.isCurrentUser ? 'text-foreground' : 'text-gray-900'}`}>
                              {driver.name}
                            </p>
                            <p className="text-sm text-gray-600">${driver.earnings} this month</p>
                          </div>
                        </div>
                        {driver.isCurrentUser && (
                          <Badge className="bg-accent text-foreground">You</Badge>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                      You're performing better than {Math.round(((currentStats.totalDrivers - currentStats.monthlyRank) / currentStats.totalDrivers) * 100)}% of drivers!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-indigo-200">
                  <CardHeader>
                    <CardTitle className="text-indigo-900">Earnings Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-indigo-50 rounded-lg">
                        <h4 className="font-semibold text-indigo-900 mb-2">Peak Earning Days</h4>
                        <p className="text-sm text-indigo-700">
                          Saturdays and Sundays generate 40% more revenue per hour
                        </p>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2">Best Routes</h4>
                        <p className="text-sm text-green-700">
                          Central West End and Clayton areas have highest tip rates (avg $8.50)
                        </p>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-semibold text-purple-900 mb-2">Time Optimization</h4>
                        <p className="text-sm text-purple-700">
                          You can save 25 minutes daily by optimizing route order
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-orange-900">Customer Feedback Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-orange-700">Communication</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-orange-200 rounded-full h-2 mr-3">
                            <div className="bg-orange-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                          </div>
                          <span className="text-sm text-orange-600">96%</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-orange-700">Timeliness</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-orange-200 rounded-full h-2 mr-3">
                            <div className="bg-orange-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                          </div>
                          <span className="text-sm text-orange-600">94%</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-orange-700">Package Care</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-orange-200 rounded-full h-2 mr-3">
                            <div className="bg-orange-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                          </div>
                          <span className="text-sm text-orange-600">98%</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-orange-700">Professionalism</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-orange-200 rounded-full h-2 mr-3">
                            <div className="bg-orange-600 h-2 rounded-full" style={{ width: '99%' }}></div>
                          </div>
                          <span className="text-sm text-orange-600">99%</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700">
                        <strong>Top compliment:</strong> "Always handles packages with care and provides excellent updates"
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </Screen>
  );
}

const Trophy = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);