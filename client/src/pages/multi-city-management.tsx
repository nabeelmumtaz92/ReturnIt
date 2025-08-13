import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin,
  Plus,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Target,
  Building2,
  Truck,
  Calendar,
  BarChart3,
  Settings,
  AlertCircle,
  CheckCircle,
  Globe,
  Activity
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface City {
  id: number;
  name: string;
  state: string;
  region: string;
  isActive: boolean;
  launchDate: string | null;
  marketManager: number | null;
  population: number | null;
  marketPotential: string;
  stats: {
    totalOrders: number;
    activeDrivers: number;
    monthlyRevenue: number;
    growthRate: number;
    customerSatisfaction: number;
  };
  serviceArea: {
    radius: number;
    zones: string[];
  };
  pricing: {
    basePrice: number;
    distanceFee: number;
    serviceFee: number;
  };
}

interface NewCityForm {
  name: string;
  state: string;
  region: string;
  population: number;
  marketPotential: string;
  launchDate: string;
  marketManager: number | null;
}

export default function MultiCityManagement() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [showAddCity, setShowAddCity] = useState(false);
  const [newCityForm, setNewCityForm] = useState<NewCityForm>({
    name: '',
    state: '',
    region: '',
    population: 0,
    marketPotential: 'medium',
    launchDate: '',
    marketManager: null,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cities, isLoading } = useQuery<City[]>({
    queryKey: ['/api/cities'],
  });

  const { data: managers } = useQuery({
    queryKey: ['/api/employees/managers'],
  });

  const addCity = useMutation({
    mutationFn: async (cityData: NewCityForm) => {
      return await apiRequest('POST', '/api/cities', cityData);
    },
    onSuccess: () => {
      toast({
        title: "City Added",
        description: "New market has been successfully added to the system.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cities'] });
      setShowAddCity(false);
      setNewCityForm({
        name: '',
        state: '',
        region: '',
        population: 0,
        marketPotential: 'medium',
        launchDate: '',
        marketManager: null,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCityStatus = useMutation({
    mutationFn: async ({ cityId, isActive }: { cityId: number; isActive: boolean }) => {
      return await apiRequest('PUT', `/api/cities/${cityId}`, { isActive });
    },
    onSuccess: () => {
      toast({
        title: "City Updated",
        description: "City status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cities'] });
    },
  });

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white';
  };

  const getMarketPotentialColor = (potential: string) => {
    const colors = {
      'high': 'bg-green-500 text-white',
      'medium': 'bg-yellow-500 text-white',
      'low': 'bg-gray-500 text-white',
    };
    return colors[potential as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const getRegionStats = () => {
    if (!cities) return {};
    
    return cities.reduce((acc, city) => {
      if (!acc[city.region]) {
        acc[city.region] = {
          cities: 0,
          totalRevenue: 0,
          totalOrders: 0,
          activeDrivers: 0,
        };
      }
      acc[city.region].cities++;
      acc[city.region].totalRevenue += city.stats.monthlyRevenue;
      acc[city.region].totalOrders += city.stats.totalOrders;
      acc[city.region].activeDrivers += city.stats.activeDrivers;
      return acc;
    }, {} as Record<string, any>);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Loading city management dashboard...</p>
        </div>
      </div>
    );
  }

  const regionStats = getRegionStats();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Multi-City Expansion Management</h1>
          <p className="text-gray-600 mt-1">Manage markets, track performance, and plan expansion</p>
        </div>
        <Dialog open={showAddCity} onOpenChange={setShowAddCity}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" data-testid="button-add-city">
              <Plus className="h-4 w-4" />
              Add New City
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New City Market</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city-name">City Name</Label>
                  <Input
                    id="city-name"
                    value={newCityForm.name}
                    onChange={(e) => setNewCityForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Chicago"
                    data-testid="input-city-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city-state">State</Label>
                  <Input
                    id="city-state"
                    value={newCityForm.state}
                    onChange={(e) => setNewCityForm(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="e.g., Illinois"
                    data-testid="input-city-state"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city-region">Region</Label>
                  <Select 
                    value={newCityForm.region}
                    onValueChange={(value) => setNewCityForm(prev => ({ ...prev, region: value }))}
                  >
                    <SelectTrigger data-testid="select-region">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="midwest">Midwest</SelectItem>
                      <SelectItem value="northeast">Northeast</SelectItem>
                      <SelectItem value="south">South</SelectItem>
                      <SelectItem value="west">West</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="market-potential">Market Potential</Label>
                  <Select 
                    value={newCityForm.marketPotential}
                    onValueChange={(value) => setNewCityForm(prev => ({ ...prev, marketPotential: value }))}
                  >
                    <SelectTrigger data-testid="select-market-potential">
                      <SelectValue placeholder="Select potential" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="population">Population</Label>
                  <Input
                    id="population"
                    type="number"
                    value={newCityForm.population || ''}
                    onChange={(e) => setNewCityForm(prev => ({ ...prev, population: parseInt(e.target.value) || 0 }))}
                    placeholder="e.g., 2700000"
                    data-testid="input-population"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="launch-date">Target Launch Date</Label>
                  <Input
                    id="launch-date"
                    type="date"
                    value={newCityForm.launchDate}
                    onChange={(e) => setNewCityForm(prev => ({ ...prev, launchDate: e.target.value }))}
                    data-testid="input-launch-date"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddCity(false)}
                  data-testid="button-cancel-add-city"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => addCity.mutate(newCityForm)}
                  disabled={!newCityForm.name || !newCityForm.state || addCity.isPending}
                  data-testid="button-confirm-add-city"
                >
                  {addCity.isPending ? "Adding..." : "Add City"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Regional Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(regionStats).map(([region, stats]) => (
          <Card key={region}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold capitalize">{region}</h3>
                  <Globe className="h-5 w-5 text-blue-500" />
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cities:</span>
                    <span className="font-medium">{stats.cities}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-medium">${stats.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Orders:</span>
                    <span className="font-medium">{stats.totalOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Drivers:</span>
                    <span className="font-medium">{stats.activeDrivers}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="cities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cities" data-testid="tab-cities">All Cities</TabsTrigger>
          <TabsTrigger value="performance" data-testid="tab-performance">Performance</TabsTrigger>
          <TabsTrigger value="expansion" data-testid="tab-expansion">Expansion Planning</TabsTrigger>
          <TabsTrigger value="partnerships" data-testid="tab-partnerships">Local Partnerships</TabsTrigger>
        </TabsList>

        <TabsContent value="cities">
          <Card>
            <CardHeader>
              <CardTitle>City Management Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>City</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Market Potential</TableHead>
                      <TableHead>Monthly Revenue</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Drivers</TableHead>
                      <TableHead>Growth Rate</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cities?.map((city) => (
                      <TableRow key={city.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{city.name}</p>
                            <p className="text-sm text-gray-600">{city.state} • {city.region}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(city.isActive)}>
                            {city.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getMarketPotentialColor(city.marketPotential)}>
                            {city.marketPotential}
                          </Badge>
                        </TableCell>
                        <TableCell>${city.stats.monthlyRevenue.toLocaleString()}</TableCell>
                        <TableCell>{city.stats.totalOrders}</TableCell>
                        <TableCell>{city.stats.activeDrivers}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TrendingUp className={`h-4 w-4 ${city.stats.growthRate > 0 ? 'text-green-500' : 'text-red-500'}`} />
                            {city.stats.growthRate > 0 ? '+' : ''}{city.stats.growthRate}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedCity(city)}
                              data-testid={`button-view-city-${city.id}`}
                            >
                              View
                            </Button>
                            <Button 
                              size="sm" 
                              variant={city.isActive ? "destructive" : "default"}
                              onClick={() => updateCityStatus.mutate({ cityId: city.id, isActive: !city.isActive })}
                              data-testid={`button-toggle-city-${city.id}`}
                            >
                              {city.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Cities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cities?.sort((a, b) => b.stats.monthlyRevenue - a.stats.monthlyRevenue).slice(0, 5).map((city, index) => (
                    <div key={city.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' : 
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-orange-500 text-white' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{city.name}</p>
                          <p className="text-sm text-gray-600">{city.state}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${city.stats.monthlyRevenue.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{city.stats.totalOrders} orders</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cities?.filter(city => city.marketPotential === 'high' && city.stats.growthRate < 20).map((city) => (
                    <div key={city.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{city.name}, {city.state}</p>
                          <p className="text-sm text-gray-600">High market potential</p>
                        </div>
                        <Badge variant="outline">Opportunity</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current growth:</span>
                          <span>{city.stats.growthRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Active drivers:</span>
                          <span>{city.stats.activeDrivers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Customer satisfaction:</span>
                          <span>{city.stats.customerSatisfaction}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expansion">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Expansion Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cities?.filter(city => city.launchDate && new Date(city.launchDate) > new Date()).map((city) => (
                    <div key={city.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-medium">{city.name}</p>
                        <Badge variant="secondary">Planned</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Launch: {new Date(city.launchDate!).toLocaleDateString()}</p>
                      <Progress value={75} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">75% ready</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Research</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900">Target Markets</p>
                    <ul className="list-disc list-inside text-blue-700 mt-2 space-y-1">
                      <li>Denver, CO - High population density</li>
                      <li>Austin, TX - Strong retail presence</li>
                      <li>Nashville, TN - Growing logistics market</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900">Success Factors</p>
                    <ul className="list-disc list-inside text-green-700 mt-2 space-y-1">
                      <li>Major retailer partnerships</li>
                      <li>University populations</li>
                      <li>High e-commerce adoption</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">Market Manager</span>
                    <span className="font-medium">$65K/year</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">Marketing Budget</span>
                    <span className="font-medium">$25K</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">Driver Recruitment</span>
                    <span className="font-medium">$15K</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">Operations Setup</span>
                    <span className="font-medium">$10K</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 font-semibold">
                    <span>Total per City</span>
                    <span>$115K</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="partnerships">
          <Card>
            <CardHeader>
              <CardTitle>Local Partnership Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="font-medium mb-2">Partnership Dashboard</p>
                <p className="text-sm text-gray-600 mb-4">
                  Manage retailer partnerships, local logistics providers, and strategic alliances by city.
                </p>
                <Button data-testid="button-manage-partnerships">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Partnership
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* City Detail Modal */}
      {selectedCity && (
        <Dialog open={!!selectedCity} onOpenChange={() => setSelectedCity(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedCity.name}, {selectedCity.state}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">${selectedCity.stats.monthlyRevenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                </div>
                <div className="text-center">
                  <Package className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">{selectedCity.stats.totalOrders}</p>
                  <p className="text-sm text-gray-600">Total Orders</p>
                </div>
                <div className="text-center">
                  <Truck className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold">{selectedCity.stats.activeDrivers}</p>
                  <p className="text-sm text-gray-600">Active Drivers</p>
                </div>
                <div className="text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <p className="text-2xl font-bold">{selectedCity.stats.customerSatisfaction}%</p>
                  <p className="text-sm text-gray-600">Satisfaction</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Service Area</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Radius:</span>
                      <span>{selectedCity.serviceArea.radius} miles</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Zones:</span>
                      <span>{selectedCity.serviceArea.zones.length}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Pricing Structure</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Price:</span>
                      <span>${selectedCity.pricing.basePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Distance Fee:</span>
                      <span>${selectedCity.pricing.distanceFee}/mile</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Fee:</span>
                      <span>{selectedCity.pricing.serviceFee}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}