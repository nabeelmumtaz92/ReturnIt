import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Screen } from '@/components/screen';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  DollarSign, 
  Star, 
  Package, 
  CheckCircle, 
  XCircle, 
  User, 
  Truck,
  Target,
  Route,
  CreditCard,
  Award,
  TrendingUp,
  Calendar,
  Settings,
  LogOut,
  Bell,
  Camera,
  MessageCircle,
  RefreshCw,
  Play,
  Square,
  HeadphonesIcon,
  ArrowLeft,
  Map,
  BarChart3,
  Activity
} from 'lucide-react';
import { useAuth } from "@/hooks/useAuth-simple";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MobileLogin } from '@/components/MobileLogin';
import { LogoIcon, ReturnlyLogo } from '@/components/LogoIcon';
import { useToast } from "@/hooks/use-toast";

interface EnvironmentConfig {
  allowPublicRegistration: boolean;
  allowPublicLogin: boolean;
  allowGoogleAuth: boolean;
  allowDriverSignup: boolean;
  enableDemoMode: boolean;
  environment: string;
}
import SupportChat from "@/components/SupportChat";
import NotificationBell from "@/components/NotificationBell";
import DriverNavigation from "@/components/DriverNavigation";
import LocationPermissionPrompt from "@/components/LocationPermissionPrompt";
import { type Location } from "@/lib/locationServices";

interface DriverJob {
  id: string;
  customer: string;
  customerPhone: string;
  status: 'available' | 'accepted' | 'en_route' | 'arrived' | 'picked_up' | 'completed';
  amount: number;
  distance: string;
  estimatedTime: string;
  pickupAddress: string;
  dropoffLocation: string;
  pickupLocation?: Location;
  dropoffLocationCoords?: Location;
  specialInstructions?: string;
  priority: 'low' | 'medium' | 'high';
}

interface DriverStats {
  todayEarnings: number;
  weeklyEarnings: number;
  completedJobs: number;
  rating: number;
  totalDistance: string;
  onlineTime: string;
}

export default function ReturnlyDriverApp() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const queryClient = useQueryClient();

  // Fetch environment configuration
  const { data: envConfig } = useQuery<EnvironmentConfig>({
    queryKey: ['/api/config/environment'],
  });
  const { toast } = useToast();

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <MobileLogin onLogin={() => {}} isDriver={true} />;
  }
  const [isOnline, setIsOnline] = useState(false);
  const [currentJob, setCurrentJob] = useState<DriverJob | null>(null);
  const [availableJobs, setAvailableJobs] = useState<DriverJob[]>([]);
  const [completedJobs, setCompletedJobs] = useState<DriverJob[]>([]);
  const [driverStats, setDriverStats] = useState<DriverStats>({
    todayEarnings: 0,
    weeklyEarnings: 0,
    completedJobs: 0,
    rating: 0,
    totalDistance: '0 mi',
    onlineTime: '0h 0m'
  });
  const [showSupportChat, setShowSupportChat] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [driverLocation, setDriverLocation] = useState<Location | null>(null);
  const [showEarningsDropdown, setShowEarningsDropdown] = useState(false);
  const [currentView, setCurrentView] = useState<'jobs' | 'profile' | 'maps' | 'earnings' | 'stats' | 'messages'>('jobs');

  // Mock data for demonstration
  useEffect(() => {
    setAvailableJobs([
      {
        id: 'JOB001',
        customer: 'Sarah Johnson',
        customerPhone: '(314) 555-0123',
        status: 'available',
        amount: 8.99,
        distance: '2.3 mi',
        estimatedTime: '12 min',
        pickupAddress: '123 Main St, St. Louis, MO 63101',
        dropoffLocation: 'Target - Chesterfield Valley',
        pickupLocation: { lat: 38.6324, lng: -90.2040 },
        dropoffLocationCoords: { lat: 38.6631, lng: -90.5215 },
        specialInstructions: 'Ring doorbell twice, customer will meet at door',
        priority: 'high'
      },
      {
        id: 'JOB002',
        customer: 'Mike Rodriguez',
        customerPhone: '(314) 555-0124',
        status: 'available',
        amount: 12.50,
        distance: '4.1 mi',
        estimatedTime: '18 min',
        pickupAddress: '456 Oak Ave, St. Louis, MO 63108',
        dropoffLocation: 'Best Buy - Kirkwood Commons',
        pickupLocation: { lat: 38.6191, lng: -90.2446 },
        dropoffLocationCoords: { lat: 38.5767, lng: -90.4067 },
        priority: 'medium'
      }
    ]);

    setCompletedJobs([
      {
        id: 'JOB003',
        customer: 'Jennifer Lee',
        customerPhone: '(314) 555-0125',
        status: 'completed',
        amount: 6.75,
        distance: '1.8 mi',
        estimatedTime: '8 min',
        pickupAddress: '789 Pine Rd, St. Louis, MO 63110',
        dropoffLocation: 'Macy\'s - West County Center',
        priority: 'low'
      }
    ]);

    setDriverStats({
      todayEarnings: 127.50,
      weeklyEarnings: 856.75,
      completedJobs: 34,
      rating: 4.9,
      totalDistance: '145.8 mi',
      onlineTime: '6h 23m'
    });
  }, []);

  if (!isAuthenticated) {
    return (
      <Screen>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-blue-900">Driver Login Required</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-blue-700 mb-4">Please sign in to access the ReturnlyDriver app.</p>
              <Button 
                onClick={() => setLocation('/login')}
                className="bg-blue-700 hover:bg-blue-800 text-white"
              >
                Driver Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </Screen>
    );
  }

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    toast({
      title: isOnline ? "You're now offline" : "You're now online",
      description: isOnline ? "You won't receive new job offers" : "You'll start receiving job offers",
    });
  };

  const acceptJob = (job: DriverJob) => {
    const updatedJob = { ...job, status: 'accepted' as const };
    setCurrentJob(updatedJob);
    setAvailableJobs(prev => prev.filter(j => j.id !== job.id));
    
    // Request location permission for navigation
    if (!driverLocation) {
      setShowLocationPrompt(true);
    }
    
    toast({
      title: "Job Accepted!",
      description: `Driving to pickup at ${job.pickupAddress}`,
    });
  };

  const updateJobStatus = (status: DriverJob['status']) => {
    if (currentJob) {
      setCurrentJob({ ...currentJob, status });
      
      if (status === 'completed') {
        setCompletedJobs(prev => [...prev, currentJob]);
        setCurrentJob(null);
        setDriverStats(prev => ({
          ...prev,
          todayEarnings: prev.todayEarnings + currentJob.amount,
          completedJobs: prev.completedJobs + 1
        }));
        toast({
          title: "Job Completed!",
          description: `You earned $${currentJob.amount}`,
        });
      }
    }
  };

  const handleLocationPermissionGranted = (location: Location) => {
    setDriverLocation(location);
    toast({
      title: "Location enabled",
      description: "Navigation features are now available",
    });
  };

  const handleLocationPermissionDenied = () => {
    toast({
      title: "Location access denied",
      description: "Some navigation features will be limited",
      variant: "destructive",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      available: 'bg-green-100 text-green-800 border-green-300',
      accepted: 'bg-blue-100 text-blue-800 border-blue-300',
      en_route: 'bg-purple-100 text-purple-800 border-purple-300',
      arrived: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      picked_up: 'bg-orange-100 text-orange-800 border-orange-300',
      completed: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return variants[status as keyof typeof variants] || variants.available;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-red-600'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  return (
    <Screen>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
        
        {/* Header */}
        <div className="bg-[#F5F0E6] shadow-sm border-b border-[#A47C48]/30">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <LogoIcon size={32} className="text-[#A47C48]" />
                <div>
                  <h1 className="text-lg font-bold text-[#A47C48]">ReturnlyDriver</h1>
                  <p className="text-xs text-[#7B5E3B]">Drive. Return. Earn.</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <NotificationBell />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSupportChat(true)}
                >
                  <HeadphonesIcon className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4 pb-20">
          {/* View Content */}
          {currentView === 'profile' ? (
            <Card className="bg-[#F5F0E6]/90 backdrop-blur-sm border-[#A47C48]/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#A47C48]">Driver Profile</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setCurrentView('jobs')}
                    className="text-[#A47C48]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-600 text-xs font-medium">Today</p>
                  <p className="text-2xl font-bold text-blue-900">${driverStats.todayEarnings.toFixed(2)}</p>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-green-600 text-xs font-medium">This Week</p>
                  <p className="text-xl font-bold text-green-900">${driverStats.weeklyEarnings.toFixed(2)}</p>
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-purple-600 text-xs font-medium">Jobs Done</p>
                    <p className="text-lg font-bold text-purple-900">{driverStats.completedJobs}</p>
                  </div>
                  
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <p className="text-yellow-600 text-xs font-medium">Rating</p>
                    <div className="flex items-center justify-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                      <p className="text-lg font-bold text-yellow-900">{driverStats.rating}</p>
                    </div>
                  </div>
                </div>
                
                {isOnline && (
                  <Button 
                    variant="outline"
                    onClick={toggleOnlineStatus}
                    className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 mt-4"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Go Offline
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Current Job - Priority Display */}
          {currentJob && (
            <Card className="mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Current Job - {currentJob.id}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{currentJob.customer}</p>
                      <p className="text-blue-100 text-sm">{currentJob.customerPhone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${currentJob.amount}</p>
                      <Badge className={getStatusBadge(currentJob.status)}>
                        {currentJob.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="bg-white/10 p-3 rounded-lg">
                      <p className="text-blue-200 text-xs">PICKUP</p>
                      <p className="font-medium">{currentJob.pickupAddress}</p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg">
                      <p className="text-blue-200 text-xs">DROPOFF</p>
                      <p className="font-medium">{currentJob.dropoffLocation}</p>
                    </div>
                  </div>

                  {currentJob.specialInstructions && (
                    <div className="bg-white/10 p-3 rounded-lg">
                      <p className="text-blue-200 text-xs">SPECIAL INSTRUCTIONS</p>
                      <p className="text-sm">{currentJob.specialInstructions}</p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    {currentJob.status === 'accepted' && (
                      <>
                        <Button 
                          className="flex-1 bg-white text-blue-600 hover:bg-blue-50"
                          onClick={() => updateJobStatus('en_route')}
                        >
                          <Navigation className="h-4 w-4 mr-2" />
                          Start Navigation
                        </Button>
                        <Button 
                          variant="outline" 
                          className="border-white text-white hover:bg-white/10"
                          onClick={() => window.open(`tel:${currentJob.customerPhone}`)}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    {currentJob.status === 'en_route' && (
                      <Button 
                        className="flex-1 bg-yellow-500 text-white hover:bg-yellow-600"
                        onClick={() => updateJobStatus('arrived')}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        I've Arrived
                      </Button>
                    )}
                    
                    {currentJob.status === 'arrived' && (
                      <Button 
                        className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
                        onClick={() => updateJobStatus('picked_up')}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Package Picked Up
                      </Button>
                    )}
                    
                    {currentJob.status === 'picked_up' && (
                      <Button 
                        className="flex-1 bg-green-500 text-white hover:bg-green-600"
                        onClick={() => updateJobStatus('completed')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Job Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content Tabs - Mobile Vertical Layout */}
          <Tabs defaultValue="jobs" className="space-y-4">
            <TabsList className="bg-white border-blue-200 flex flex-col w-full gap-1">
              <TabsTrigger value="jobs" className="w-full data-[state=active]:bg-blue-100">
                <Package className="h-4 w-4 mr-2" />
                Jobs
              </TabsTrigger>
              <TabsTrigger value="earnings" className="w-full data-[state=active]:bg-blue-100">
                <DollarSign className="h-4 w-4 mr-2" />
                Earnings
              </TabsTrigger>
              <TabsTrigger value="profile" className="w-full data-[state=active]:bg-blue-100">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
            </TabsList>

            {/* Available Jobs Tab */}
            <TabsContent value="jobs">
              {!isOnline ? (
                <Button 
                  onClick={toggleOnlineStatus}
                  size="lg"
                  className="w-full bg-[#A47C48] hover:bg-[#8B5A2B] text-white"
                  data-testid="button-online-toggle"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Go Online
                </Button>
              ) : availableJobs.length === 0 ? (
                <Card className="bg-white/90 backdrop-blur-sm border-blue-200">
                  <CardContent className="p-8 text-center">
                    <RefreshCw className="h-16 w-16 mx-auto text-blue-300 mb-4" />
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Looking for Jobs...</h3>
                    <p className="text-blue-600">New job requests will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {availableJobs.map((job) => (
                    <Card key={job.id} className="bg-white/90 backdrop-blur-sm border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-blue-900">{job.customer}</p>
                            <p className="text-sm text-blue-600">{job.distance} • {job.estimatedTime}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-blue-900">${job.amount}</p>
                            <Badge className={`text-xs ${getPriorityColor(job.priority)}`}>
                              {job.priority.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-blue-700 mb-4">
                          <p><MapPin className="h-3 w-3 inline mr-1" />{job.pickupAddress}</p>
                          <p><Target className="h-3 w-3 inline mr-1" />{job.dropoffLocation}</p>
                        </div>

                        {job.specialInstructions && (
                          <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded mb-3">
                            📝 {job.specialInstructions}
                          </p>
                        )}

                        <div className="flex space-x-2">
                          <Button 
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => acceptJob(job)}
                            disabled={!!currentJob}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                            onClick={() => toast({ title: "Job Declined", description: "Job has been declined" })}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Earnings Tab */}
            <TabsContent value="earnings">
              <div className="space-y-4">
                <Card className="bg-white/90 backdrop-blur-sm border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-900">Earnings Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-blue-600 text-sm font-medium">Today's Earnings</p>
                        <p className="text-3xl font-bold text-blue-900">${driverStats.todayEarnings.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-green-600 text-sm font-medium">This Week's Earnings</p>
                        <p className="text-2xl font-bold text-green-900">${driverStats.weeklyEarnings.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Completed Jobs</span>
                        <span className="font-semibold text-blue-900">{driverStats.completedJobs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Total Distance</span>
                        <span className="font-semibold text-blue-900">{driverStats.totalDistance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Online Time</span>
                        <span className="font-semibold text-blue-900">{driverStats.onlineTime}</span>
                      </div>
                    </div>

                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Instant Payout
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-sm border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-900">Recent Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {completedJobs.map((job) => (
                        <div key={job.id} className="flex justify-between items-center p-3 border border-blue-200 rounded-lg">
                          <div>
                            <p className="font-medium text-blue-900">{job.customer}</p>
                            <p className="text-sm text-blue-600">{job.distance} • Completed</p>
                          </div>
                          <p className="font-semibold text-green-600">+${job.amount}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Driver Profile Tab */}
            <TabsContent value="profile">
              <Card className="bg-white/90 backdrop-blur-sm border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">Driver Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">John Smith</h3>
                      <p className="text-blue-600">Driver since January 2024</p>
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="font-semibold">{driverStats.rating}</span>
                        <span className="text-sm text-blue-600 ml-1">({driverStats.completedJobs} jobs)</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-blue-800 font-medium">Email</Label>
                      <p className="text-blue-900">john.smith@email.com</p>
                    </div>
                    <div>
                      <Label className="text-blue-800 font-medium">Phone</Label>
                      <p className="text-blue-900">(314) 555-0123</p>
                    </div>
                    <div>
                      <Label className="text-blue-800 font-medium">Vehicle</Label>
                      <p className="text-blue-900">2021 Honda CR-V</p>
                    </div>
                    <div>
                      <Label className="text-blue-800 font-medium">Status</Label>
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button variant="outline" className="flex-1 border-blue-300 text-blue-700">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                    <Button variant="outline" className="flex-1 border-blue-300 text-blue-700">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          ) : currentView === 'maps' ? (
            <Card className="bg-[#F5F0E6]/90 backdrop-blur-sm border-[#A47C48]/30">
              <CardHeader>
                <CardTitle className="text-[#A47C48] flex items-center">
                  <Map className="h-5 w-5 mr-2" />
                  Navigation & Maps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <MapPin className="h-12 w-12 mx-auto mb-2" />
                    <p>Map view will appear here</p>
                    <p className="text-sm">GPS navigation for current job</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button className="bg-[#A47C48] hover:bg-[#8B5A2B] text-white">
                    <Navigation className="h-4 w-4 mr-2" />
                    Start Navigation
                  </Button>
                  <Button variant="outline" className="border-[#A47C48] text-[#A47C48]">
                    <MapPin className="h-4 w-4 mr-2" />
                    My Location
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : currentView === 'earnings' ? (
            <Card className="bg-[#F5F0E6]/90 backdrop-blur-sm border-[#A47C48]/30">
              <CardHeader>
                <CardTitle className="text-[#A47C48] flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Earnings Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-green-600 text-sm font-medium">Today</p>
                    <p className="text-2xl font-bold text-green-900">${driverStats.todayEarnings.toFixed(2)}</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-600 text-sm font-medium">This Week</p>
                    <p className="text-2xl font-bold text-blue-900">${driverStats.weeklyEarnings.toFixed(2)}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-[#7B5E3B]">Jobs Completed Today</span>
                    <span className="font-semibold text-[#A47C48]">5</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-[#7B5E3B]">Average per Job</span>
                    <span className="font-semibold text-[#A47C48]">${(driverStats.todayEarnings / 5).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-[#7B5E3B]">Hours Online</span>
                    <span className="font-semibold text-[#A47C48]">{driverStats.onlineTime}</span>
                  </div>
                </div>
                <Button className="w-full bg-[#A47C48] hover:bg-[#8B5A2B] text-white">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Detailed Report
                </Button>
              </CardContent>
            </Card>
          ) : currentView === 'stats' ? (
            <Card className="bg-[#F5F0E6]/90 backdrop-blur-sm border-[#A47C48]/30">
              <CardHeader>
                <CardTitle className="text-[#A47C48] flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Driver Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Activity className="h-6 w-6 mx-auto text-purple-600 mb-1" />
                    <p className="text-purple-600 text-sm font-medium">Jobs Done</p>
                    <p className="text-xl font-bold text-purple-900">{driverStats.completedJobs}</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Star className="h-6 w-6 mx-auto text-yellow-600 mb-1" />
                    <p className="text-yellow-600 text-sm font-medium">Rating</p>
                    <p className="text-xl font-bold text-yellow-900">{driverStats.rating} ⭐</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[#7B5E3B] text-sm">Acceptance Rate</span>
                      <span className="font-semibold text-[#A47C48]">94%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#A47C48] h-2 rounded-full" style={{width: '94%'}}></div>
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[#7B5E3B] text-sm">On-Time Rate</span>
                      <span className="font-semibold text-[#A47C48]">98%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '98%'}}></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-[#7B5E3B]">Total Distance</span>
                    <span className="font-semibold text-[#A47C48]">{driverStats.totalDistance}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : currentView === 'messages' ? (
            <Card className="bg-[#F5F0E6]/90 backdrop-blur-sm border-[#A47C48]/30">
              <CardHeader>
                <CardTitle className="text-[#A47C48] flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Messages & Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-blue-900">New Job Available</span>
                      <span className="text-xs text-blue-600">2 min ago</span>
                    </div>
                    <p className="text-sm text-blue-700">Pickup at 123 Main St - $8.99</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-green-900">Job Completed</span>
                      <span className="text-xs text-green-600">1 hour ago</span>
                    </div>
                    <p className="text-sm text-green-700">You earned $6.29 for job #JOB003</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-yellow-900">Weekly Summary</span>
                      <span className="text-xs text-yellow-600">3 hours ago</span>
                    </div>
                    <p className="text-sm text-yellow-700">You've earned $856.75 this week!</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="border-[#A47C48] text-[#A47C48]">
                    <Bell className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button className="bg-[#A47C48] hover:bg-[#8B5A2B] text-white">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Support Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Support Chat */}
        <SupportChat 
          isOpen={showSupportChat}
          onClose={() => setShowSupportChat(false)}
          context={{ type: 'driver', id: 'DRV001', name: 'John Smith' }}
        />

        {/* Location Permission Prompt */}
        <LocationPermissionPrompt
          userType="driver"
          isOpen={showLocationPrompt}
          onClose={() => setShowLocationPrompt(false)}
          onPermissionGranted={handleLocationPermissionGranted}
          onPermissionDenied={handleLocationPermissionDenied}
        />

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#F5F0E6] border-t border-[#A47C48]/30 px-4 py-2">
          <div className="flex justify-around items-center max-w-md mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('maps')}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${currentView === 'maps' ? 'text-[#A47C48]' : 'text-[#7B5E3B]'}`}
              data-testid="button-maps"
            >
              <Map className="h-5 w-5" />
              <span className="text-xs">Maps</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('earnings')}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${currentView === 'earnings' ? 'text-[#A47C48]' : 'text-[#7B5E3B]'}`}
              data-testid="button-earnings"
            >
              <DollarSign className="h-5 w-5" />
              <span className="text-xs">Earnings</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('stats')}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${currentView === 'stats' ? 'text-[#A47C48]' : 'text-[#7B5E3B]'}`}
              data-testid="button-stats"
            >
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs">Stats</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('messages')}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${currentView === 'messages' ? 'text-[#A47C48]' : 'text-[#7B5E3B]'}`}
              data-testid="button-messages"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs">Messages</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('profile')}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${currentView === 'profile' ? 'text-[#A47C48]' : 'text-[#7B5E3B]'}`}
              data-testid="button-profile"
            >
              <User className="h-5 w-5" />
              <span className="text-xs">Profile</span>
            </Button>
          </div>
        </div>
      </div>
    </Screen>
  );
}