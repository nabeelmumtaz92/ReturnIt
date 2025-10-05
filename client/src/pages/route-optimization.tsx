import { useAuth } from "@/hooks/useAuth-simple";
import { Screen } from '@/components/screen';
import { CurrentRoute, RouteOptimization } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigation, MapPin, Clock, Fuel, TrendingUp, Route, Zap, Settings } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { handleError } from "@/lib/errorHandler";
import Footer from '@/components/Footer';
import { useState } from 'react';

export default function RouteOptimization() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [optimizing, setOptimizing] = useState(false);

  // Enhanced type guards for route data
  const isValidCurrentRoute = (data: any): data is CurrentRoute => {
    return data && 
           typeof data === 'object' &&
           typeof data.id === 'string' &&
           typeof data.estimatedTime === 'number' &&
           typeof data.estimatedDistance === 'number' &&
           Array.isArray(data.stops);
  };

  const hasValidRouteStops = (route: CurrentRoute | undefined): boolean => {
    return route?.stops?.length > 0 || false;
  };

  const { data: currentRoute } = useQuery<CurrentRoute>({
    queryKey: ['/api/routes/current'],
    enabled: isAuthenticated && user?.isDriver,
  });

  const { data: routeHistory } = useQuery<CurrentRoute[]>({
    queryKey: ['/api/routes/history'],
    enabled: isAuthenticated && user?.isDriver,
  });

  const optimizeRouteMutation = useMutation<RouteOptimization, Error, number[]>({
    mutationFn: async (orderIds: number[]) => {
      return await apiRequest('/api/routes/optimize', 'POST', {
        orderIds,
        driverId: user?.id,
        preferences: {
          prioritizeTime: true,
          avoidTolls: false,
          fuelEfficiency: true
        }
      });
    },
    onSuccess: () => {
      setOptimizing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/routes/current'] });
      toast({
        title: "Route Optimized!",
        description: "Your delivery route has been optimized for efficiency.",
      });
    },
    onError: (error) => {
      setOptimizing(false);
      const userMessage = handleError(error, {
        context: "Route Optimization",
        userMessage: "Error"
      });
      toast({
        title: userMessage,
        description: "Please try again.",
        variant: "destructive",
      });
    }
  });

  if (!isAuthenticated || !user?.isDriver) {
    return (
      <Screen>
        <div className="text-center">
          <Navigation className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-4">Route Optimization</h1>
          <p className="text-muted-foreground mb-4">This section is for verified drivers only</p>
          <Button className="bg-primary hover:bg-primary/90">Sign In as Driver</Button>
        </div>
      </Screen>
    );
  }


  return (
    <Screen>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <Navigation className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-green-900 mb-2">Smart Route Optimization</h1>
            <p className="text-green-700 text-lg">Maximize efficiency and minimize drive time</p>
          </div>

          {/* Route Optimization Score */}
          <Card className="mb-8 border-green-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-green-900 flex items-center justify-center">
                <Route className="h-8 w-8 mr-3" />
                Today's Route Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-100 rounded-lg">
                  <Clock className="h-8 w-8 text-green-700 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-900">{currentRoute?.estimatedTime || 0}h</div>
                  <div className="text-sm text-green-700">Total Time</div>
                </div>
                
                <div className="text-center p-4 bg-blue-100 rounded-lg">
                  <MapPin className="h-8 w-8 text-blue-700 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900">{currentRoute?.estimatedDistance || 0} mi</div>
                  <div className="text-sm text-blue-700">Total Distance</div>
                </div>
                
                <div className="text-center p-4 bg-orange-100 rounded-lg">
                  <Fuel className="h-8 w-8 text-orange-700 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-900">${currentRoute?.fuelCost || 0}</div>
                  <div className="text-sm text-orange-700">Fuel Cost</div>
                </div>
                
                <div className="text-center p-4 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-purple-700 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-900">{currentRoute?.optimizationScore || 0}%</div>
                  <div className="text-sm text-purple-700">Efficiency</div>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Button
                  size="lg"
                  className="bg-green-700 hover:bg-green-800 text-lg px-8"
                  onClick={() => {
                    if (!isValidCurrentRoute(currentRoute) || !hasValidRouteStops(currentRoute)) {
                      toast({
                        title: "No Route Data",
                        description: "Cannot optimize route without valid stop data.",
                        variant: "destructive",
                      });
                      return;
                    }

                    setOptimizing(true);
                    // Convert IDs to numbers for the backend API (handles both string and number IDs)
                    const orderIds = currentRoute.stops.map(stop => 
                      typeof stop.id === 'string' ? parseInt(stop.id, 10) : stop.id
                    ).filter(id => !isNaN(id));

                    if (orderIds.length === 0) {
                      toast({
                        title: "Invalid Route Data",
                        description: "No valid order IDs found for route optimization.",
                        variant: "destructive",
                      });
                      setOptimizing(false);
                      return;
                    }

                    optimizeRouteMutation.mutate(orderIds);
                  }}
                  disabled={optimizing || optimizeRouteMutation.isPending}
                >
                  <Zap className="h-5 w-5 mr-2" />
                  {optimizing ? 'Optimizing...' : 'Re-Optimize Route'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="current">Current Route</TabsTrigger>
              <TabsTrigger value="settings">Preferences</TabsTrigger>
              <TabsTrigger value="history">Route History</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="mt-6">
              <Card className="border-green-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-green-900">Today's Delivery Route</CardTitle>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {currentRoute?.stops?.length || 0} stops
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentRoute?.stops?.map((stop, index: number) => (
                      <div key={stop.id} className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-green-100">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-green-900 truncate">{stop.address}</p>
                          <p className="text-sm text-green-700">Order {stop.order}</p>
                        </div>
                        
                        <div className="flex-shrink-0 text-right">
                          <p className="font-medium text-green-900">{stop.estimatedTime}</p>
                          <Badge variant="outline" className="text-xs">
                            {stop.status}
                          </Badge>
                        </div>
                        
                        <div className="flex-shrink-0">
                          <MapPin className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Route Insights</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• This route saves 45 minutes compared to sequential delivery</li>
                      <li>• Avoids 2 high-traffic areas during rush hour</li>
                      <li>• Optimized for fuel efficiency (15% savings)</li>
                      <li>• All deliveries within promised time windows</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-900 flex items-center">
                    <Settings className="h-6 w-6 mr-2" />
                    Route Optimization Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-green-900">Priority Settings</h4>
                        
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <p className="font-medium text-green-900">Minimize Travel Time</p>
                            <p className="text-sm text-green-700">Prioritize shortest routes</p>
                          </div>
                          <input type="checkbox" defaultChecked className="h-4 w-4 text-green-600" />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <p className="font-medium text-green-900">Fuel Efficiency</p>
                            <p className="text-sm text-green-700">Optimize for lowest fuel consumption</p>
                          </div>
                          <input type="checkbox" defaultChecked className="h-4 w-4 text-green-600" />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <p className="font-medium text-green-900">Avoid Tolls</p>
                            <p className="text-sm text-green-700">Skip toll roads when possible</p>
                          </div>
                          <input type="checkbox" className="h-4 w-4 text-green-600" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-green-900">Traffic Settings</h4>
                        
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div>
                            <p className="font-medium text-blue-900">Real-time Traffic</p>
                            <p className="text-sm text-blue-700">Adjust routes based on current traffic</p>
                          </div>
                          <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div>
                            <p className="font-medium text-blue-900">Avoid Rush Hours</p>
                            <p className="text-sm text-blue-700">Plan around peak traffic times</p>
                          </div>
                          <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div>
                            <p className="font-medium text-blue-900">Construction Alerts</p>
                            <p className="text-sm text-blue-700">Avoid construction zones</p>
                          </div>
                          <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button className="bg-green-700 hover:bg-green-800">
                        Save Preferences
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-900">Recent Route Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { date: "Today", stops: 8, time: "4.2h", distance: "32.5 mi", efficiency: 92 },
                      { date: "Yesterday", stops: 6, time: "3.1h", distance: "28.2 mi", efficiency: 89 },
                      { date: "Jan 11", stops: 10, time: "5.5h", distance: "41.3 mi", efficiency: 85 },
                      { date: "Jan 10", stops: 7, time: "3.8h", distance: "31.7 mi", efficiency: 91 },
                      { date: "Jan 9", stops: 9, time: "4.9h", distance: "38.1 mi", efficiency: 88 },
                    ].map((route, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-100">
                        <div className="flex items-center space-x-4">
                          <div className="text-sm font-medium text-green-900 w-20">{route.date}</div>
                          <div className="text-sm text-green-700">{route.stops} stops</div>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-green-700">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{route.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{route.distance}</span>
                          </div>
                          <Badge 
                            variant="outline"
                            className={`${
                              route.efficiency >= 90 
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : route.efficiency >= 85
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                : 'bg-red-100 text-red-800 border-red-200'
                            }`}
                          >
                            {route.efficiency}% efficiency
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Weekly Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-green-700">Average Efficiency</p>
                        <p className="text-xl font-bold text-green-900">89%</p>
                      </div>
                      <div>
                        <p className="text-green-700">Time Saved</p>
                        <p className="text-xl font-bold text-green-900">2.3 hours</p>
                      </div>
                      <div>
                        <p className="text-green-700">Fuel Saved</p>
                        <p className="text-xl font-bold text-green-900">$18.50</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </Screen>
  );
}