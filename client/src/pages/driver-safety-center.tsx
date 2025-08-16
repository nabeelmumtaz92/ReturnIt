import { useAuth } from "@/hooks/useAuth-simple";
import { Screen } from '@/components/screen';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, Phone, MapPin, Clock, CheckCircle, Users, Heart } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Footer from '@/components/Footer';
import { useState } from 'react';

export default function DriverSafetyCenter() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [panicActive, setPanicActive] = useState(false);

  const { data: safetyStatus } = useQuery({
    queryKey: ['/api/safety/status'],
    enabled: isAuthenticated && user?.isDriver,
  });

  const { data: safetyHistory } = useQuery({
    queryKey: ['/api/safety/history'],
    enabled: isAuthenticated && user?.isDriver,
  });

  const panicButtonMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/safety/panic', 'POST', {
        location: getCurrentLocation(),
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      setPanicActive(true);
      queryClient.invalidateQueries({ queryKey: ['/api/safety/status'] });
      toast({
        title: "Emergency Alert Sent",
        description: "Help is on the way. Stay safe and follow emergency protocols.",
      });
    },
  });

  const checkInMutation = useMutation({
    mutationFn: async (type: 'check_in' | 'check_out') => {
      return await apiRequest('/api/safety/checkin', 'POST', {
        eventType: type,
        location: getCurrentLocation(),
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/safety/status'] });
      toast({
        title: variables === 'check_in' ? "Checked In" : "Checked Out",
        description: variables === 'check_in' ? "Your shift has started safely" : "Your shift has ended safely",
      });
    },
  });

  const getCurrentLocation = () => {
    // In real implementation, get actual GPS coordinates
    return {
      latitude: 38.6270,
      longitude: -90.1994,
      accuracy: 10
    };
  };

  if (!isAuthenticated || !user?.isDriver) {
    return (
      <Screen className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-16 w-16 text-amber-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-amber-900 mb-4">Driver Safety Center</h1>
          <p className="text-amber-700 mb-4">This section is for verified drivers only</p>
          <Button className="bg-amber-800 hover:bg-amber-900">Sign In as Driver</Button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-blue-900 mb-2">Driver Safety Center</h1>
            <p className="text-blue-700 text-lg">Your safety is our top priority</p>
          </div>

          {/* Emergency Panic Button */}
          <Card className="mb-8 border-red-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-red-900 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 mr-3" />
                Emergency Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  size="lg"
                  variant={panicActive ? "destructive" : "outline"}
                  className={`h-20 text-lg font-bold ${panicActive ? 'bg-red-600 hover:bg-red-700' : 'border-red-500 text-red-700 hover:bg-red-50'}`}
                  onClick={() => panicButtonMutation.mutate()}
                  disabled={panicActive || panicButtonMutation.isPending}
                  data-testid="panic-button"
                >
                  <AlertTriangle className="h-6 w-6 mr-2" />
                  {panicActive ? 'HELP DISPATCHED' : 'EMERGENCY PANIC'}
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="h-20 text-lg font-bold border-green-500 text-green-700 hover:bg-green-50"
                  onClick={() => checkInMutation.mutate('check_in')}
                  disabled={checkInMutation.isPending}
                >
                  <CheckCircle className="h-6 w-6 mr-2" />
                  CHECK IN
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="h-20 text-lg font-bold border-orange-500 text-orange-700 hover:bg-orange-50"
                  onClick={() => checkInMutation.mutate('check_out')}
                  disabled={checkInMutation.isPending}
                >
                  <Clock className="h-6 w-6 mr-2" />
                  CHECK OUT
                </Button>
              </div>
              
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Emergency Protocol</AlertTitle>
                <AlertDescription>
                  In case of emergency, press the panic button. This will immediately alert our dispatch team, 
                  local authorities, and your emergency contacts with your current location.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Tabs defaultValue="status" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="status">Safety Status</TabsTrigger>
              <TabsTrigger value="contacts">Emergency Contacts</TabsTrigger>
              <TabsTrigger value="locations">Safe Locations</TabsTrigger>
              <TabsTrigger value="history">Safety History</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-green-900 flex items-center">
                      <CheckCircle className="h-6 w-6 mr-2" />
                      Current Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 mb-4">
                        ON DUTY - SAFE
                      </Badge>
                      <p className="text-sm text-green-700">
                        Last check-in: Today at 2:45 PM
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-blue-900 flex items-center">
                      <MapPin className="h-6 w-6 mr-2" />
                      Location Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 mb-4">
                        GPS ACTIVE
                      </Badge>
                      <p className="text-sm text-blue-700">
                        Location sharing enabled
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader>
                    <CardTitle className="text-purple-900 flex items-center">
                      <Phone className="h-6 w-6 mr-2" />
                      Support Access
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 mb-4">
                        24/7 AVAILABLE
                      </Badge>
                      <p className="text-sm text-purple-700">
                        Emergency hotline ready
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6 border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-900">Safety Tips for Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <p className="text-amber-800">Always verify customer identity before package handoff</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <p className="text-amber-800">Park in well-lit, visible areas when possible</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <p className="text-amber-800">Trust your instincts - if something feels wrong, contact dispatch</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <p className="text-amber-800">Keep vehicle doors locked when not actively loading/unloading</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contacts" className="mt-6">
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-900 flex items-center">
                    <Users className="h-6 w-6 mr-2" />
                    Emergency Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-red-900">Returnly Emergency Dispatch</h3>
                        <p className="text-sm text-red-700">24/7 emergency response team</p>
                        <p className="text-lg font-bold text-red-900">(636) 254-4821</p>
                      </div>
                      <Phone className="h-8 w-8 text-red-600" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-blue-900">Local Police Department</h3>
                        <p className="text-sm text-blue-700">St. Louis Metro Police</p>
                        <p className="text-lg font-bold text-blue-900">911</p>
                      </div>
                      <Phone className="h-8 w-8 text-blue-600" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-green-900">Primary Emergency Contact</h3>
                        <p className="text-sm text-green-700">Sarah Johnson (Spouse)</p>
                        <p className="text-lg font-bold text-green-900">(636) 254-4821</p>
                      </div>
                      <Phone className="h-8 w-8 text-green-600" />
                    </div>
                  </div>

                  <Button className="w-full mt-6 bg-amber-700 hover:bg-amber-800">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Emergency Contacts
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="locations" className="mt-6">
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-900 flex items-center">
                    <MapPin className="h-6 w-6 mr-2" />
                    Recommended Safe Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-green-900">Police Stations</h3>
                      <ul className="mt-2 space-y-1 text-sm text-green-700">
                        <li>• Central Precinct - 1915 Olive St</li>
                        <li>• South Patrol Division - 200 S Tucker Blvd</li>
                        <li>• North Patrol Division - 1800 Union Blvd</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-900">24/7 Safe Zones</h3>
                      <ul className="mt-2 space-y-1 text-sm text-blue-700">
                        <li>• Schnucks Markets (all locations)</li>
                        <li>• QuikTrip Gas Stations</li>
                        <li>• Walmart Supercenters</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h3 className="font-semibold text-purple-900">Well-Lit Public Areas</h3>
                      <ul className="mt-2 space-y-1 text-sm text-purple-700">
                        <li>• Shopping Center Parking Lots</li>
                        <li>• Hospital Emergency Entrances</li>
                        <li>• Fire Stations</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-900 flex items-center">
                    <Clock className="h-6 w-6 mr-2" />
                    Safety Event History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {safetyHistory?.slice(0, 10).map((event: any, index: number) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-amber-100 last:border-0">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            event.eventType === 'panic_button' ? 'bg-red-100' :
                            event.eventType === 'check_in' ? 'bg-green-100' :
                            event.eventType === 'check_out' ? 'bg-blue-100' :
                            'bg-gray-100'
                          }`}>
                            {event.eventType === 'panic_button' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                            {event.eventType === 'check_in' && <CheckCircle className="h-4 w-4 text-green-600" />}
                            {event.eventType === 'check_out' && <Clock className="h-4 w-4 text-blue-600" />}
                          </div>
                          <div>
                            <div className="font-medium text-amber-900 capitalize">
                              {event.eventType.replace('_', ' ')}
                            </div>
                            <div className="text-sm text-amber-600">
                              {new Date(event.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className={
                          event.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-200' :
                          event.status === 'active' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }>
                          {event.status}
                        </Badge>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-amber-600">
                        <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No safety events recorded - keep up the great work!</p>
                      </div>
                    )}
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