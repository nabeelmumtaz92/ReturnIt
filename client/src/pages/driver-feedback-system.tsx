import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Star, MessageCircle, ThumbsUp, ThumbsDown, AlertTriangle,
  User, Clock, MapPin, Package, Filter, Search, TrendingUp,
  Award, Target, BarChart3, Calendar, Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CustomerFeedback {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  driverId: string;
  driverName: string;
  rating: number;
  feedback: string;
  category: string;
  date: string;
  status: 'new' | 'reviewed' | 'addressed';
  response?: string;
}

interface DriverPerformanceMetrics {
  driverId: string;
  driverName: string;
  averageRating: number;
  totalFeedback: number;
  positivePercentage: number;
  completedOrders: number;
  feedbackCategories: {
    punctuality: number;
    professionalism: number;
    communication: number;
    carefulHandling: number;
  };
}

export default function DriverFeedbackSystem() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [feedbackFilter, setFeedbackFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data - in real app this would come from API
  const [feedbackData] = useState<CustomerFeedback[]>([
    {
      id: 'fb001',
      orderId: 'ORD-2024-001',
      customerId: 'cust001',
      customerName: 'Sarah Johnson',
      driverId: 'drv001',
      driverName: 'Mike Wilson',
      rating: 5,
      feedback: 'Excellent service! Mike arrived exactly on time and handled my packages with great care. Very professional and friendly.',
      category: 'professionalism',
      date: '2024-01-15T10:30:00Z',
      status: 'reviewed'
    },
    {
      id: 'fb002',
      orderId: 'ORD-2024-002',
      customerId: 'cust002',
      customerName: 'David Chen',
      driverId: 'drv002',
      driverName: 'Lisa Rodriguez',
      rating: 4,
      feedback: 'Good service overall. Lisa was polite and efficient. Only minor issue was she arrived about 10 minutes late.',
      category: 'punctuality',
      date: '2024-01-14T14:15:00Z',
      status: 'new'
    },
    {
      id: 'fb003',
      orderId: 'ORD-2024-003',
      customerId: 'cust003',
      customerName: 'Emily Davis',
      driverId: 'drv001',
      driverName: 'Mike Wilson',
      rating: 5,
      feedback: 'Outstanding! Mike communicated clearly about his arrival time and was very careful with my fragile items.',
      category: 'communication',
      date: '2024-01-13T16:45:00Z',
      status: 'reviewed'
    },
    {
      id: 'fb004',
      orderId: 'ORD-2024-004',
      customerId: 'cust004',
      customerName: 'Robert Taylor',
      driverId: 'drv003',
      driverName: 'James Parker',
      rating: 2,
      feedback: 'Driver seemed rushed and didn\'t handle my packages carefully. One item was damaged.',
      category: 'carefulHandling',
      date: '2024-01-12T11:20:00Z',
      status: 'addressed',
      response: 'We sincerely apologize for this experience. James has received additional training on proper package handling procedures.'
    }
  ]);

  const [driverMetrics] = useState<DriverPerformanceMetrics[]>([
    {
      driverId: 'drv001',
      driverName: 'Mike Wilson',
      averageRating: 4.8,
      totalFeedback: 45,
      positivePercentage: 95,
      completedOrders: 120,
      feedbackCategories: {
        punctuality: 4.7,
        professionalism: 4.9,
        communication: 4.8,
        carefulHandling: 4.9
      }
    },
    {
      driverId: 'drv002',
      driverName: 'Lisa Rodriguez',
      averageRating: 4.5,
      totalFeedback: 32,
      positivePercentage: 88,
      completedOrders: 89,
      feedbackCategories: {
        punctuality: 4.2,
        professionalism: 4.7,
        communication: 4.6,
        carefulHandling: 4.5
      }
    },
    {
      driverId: 'drv003',
      driverName: 'James Parker',
      averageRating: 3.8,
      totalFeedback: 28,
      positivePercentage: 68,
      completedOrders: 75,
      feedbackCategories: {
        punctuality: 4.0,
        professionalism: 3.9,
        communication: 3.7,
        carefulHandling: 3.6
      }
    }
  ]);

  // Submit new feedback (customer interface)
  const submitFeedback = async (feedbackData: Partial<CustomerFeedback>) => {
    try {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! It helps us improve our service.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Render star rating
  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const starSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Customer Feedback Form
  const CustomerFeedbackForm = () => (
    <Card className="bg-white border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Rate Your Driver Experience</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-foreground font-medium">Order ID</Label>
          <Input 
            placeholder="ORD-2024-001" 
            className="border-border focus:border-border"
          />
        </div>
        
        <div>
          <Label className="text-foreground font-medium">Overall Rating</Label>
          <div className="flex items-center space-x-2 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="focus:outline-none"
                onClick={() => {}}
              >
                <Star className="h-8 w-8 text-gray-300 hover:text-yellow-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-foreground font-medium">Feedback Category</Label>
          <Select>
            <SelectTrigger className="border-border focus:border-border">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="punctuality">Punctuality</SelectItem>
              <SelectItem value="professionalism">Professionalism</SelectItem>
              <SelectItem value="communication">Communication</SelectItem>
              <SelectItem value="carefulHandling">Careful Handling</SelectItem>
              <SelectItem value="overall">Overall Service</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-foreground font-medium">Your Feedback</Label>
          <Textarea
            placeholder="Tell us about your experience with the driver..."
            className="border-border focus:border-border"
            rows={4}
          />
        </div>

        <Button className="w-full bg-primary hover:bg-primary/90 text-white">
          Submit Feedback
        </Button>
      </CardContent>
    </Card>
  );

  // Driver Performance Dashboard
  const DriverPerformanceDashboard = () => (
    <div className="space-y-6">
      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Average Rating</p>
                <p className="text-2xl font-bold text-green-900">4.6</p>
              </div>
              <Star className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Reviews</p>
                <p className="text-2xl font-bold text-blue-900">105</p>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border bg-[#f8f7f5] dark:bg-[#231b0f]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary">Positive Rate</p>
                <p className="text-2xl font-bold text-foreground">91%</p>
              </div>
              <ThumbsUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Deliveries</p>
                <p className="text-2xl font-bold text-purple-900">284</p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Driver Performance */}
      <Card className="bg-white border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Driver Performance Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {driverMetrics.map((driver, index) => (
              <div key={driver.driverId} className="flex items-center justify-between p-4 bg-[#f8f7f5] dark:bg-[#231b0f] rounded-lg border border-border">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-primary'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{driver.driverName}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{driver.completedOrders} orders</span>
                      <span>{driver.totalFeedback} reviews</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="flex items-center space-x-1">
                      {renderStars(Math.round(driver.averageRating))}
                      <span className="text-sm font-medium text-foreground">{driver.averageRating}</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-primary">Positive</p>
                    <p className="font-bold text-green-600">{driver.positivePercentage}%</p>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border text-muted-foreground hover:bg-accent"
                    onClick={() => setSelectedDriver(driver.driverId)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Admin Feedback Management
  const AdminFeedbackManagement = () => (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card className="bg-white border-border">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search feedback, driver names, or order IDs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-border focus:border-border"
                />
              </div>
            </div>
            
            <Select value={feedbackFilter} onValueChange={setFeedbackFilter}>
              <SelectTrigger className="w-40 border-border focus:border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Feedback</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="low-rating">Low Rating</SelectItem>
                <SelectItem value="high-rating">High Rating</SelectItem>
                <SelectItem value="needs-response">Needs Response</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="border-border text-muted-foreground hover:bg-[#f8f7f5] dark:bg-[#231b0f]">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <div className="space-y-4">
        {feedbackData.map((feedback) => (
          <Card key={feedback.id} className="bg-white border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {renderStars(feedback.rating, 'sm')}
                    <span className="font-medium text-foreground">{feedback.rating}/5</span>
                  </div>
                  
                  <Badge variant="outline" className={
                    feedback.status === 'new' ? 'border-blue-300 text-blue-700' :
                    feedback.status === 'reviewed' ? 'border-border text-muted-foreground' :
                    'border-green-300 text-green-700'
                  }>
                    {feedback.status}
                  </Badge>
                  
                  <Badge variant="outline" className="border-gray-300 text-gray-700">
                    {feedback.category}
                  </Badge>
                </div>
                
                <div className="text-right text-sm text-gray-600">
                  <p>{new Date(feedback.date).toLocaleDateString()}</p>
                  <p>Order: {feedback.orderId}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-900">{feedback.customerName}</span>
                  <span className="text-gray-500">about</span>
                  <span className="font-medium text-foreground">{feedback.driverName}</span>
                </div>
                
                <p className="text-gray-800">{feedback.feedback}</p>
              </div>
              
              {feedback.response && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                  <p className="text-sm font-medium text-green-900 mb-1">Admin Response:</p>
                  <p className="text-sm text-green-800">{feedback.response}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" className="border-border text-muted-foreground hover:bg-[#f8f7f5] dark:bg-[#231b0f]">
                    View Order Details
                  </Button>
                  <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                    Contact Customer
                  </Button>
                </div>
                
                {!feedback.response && (
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                    Add Response
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#231b0f]">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              
              <div>
                <h1 className="text-3xl font-bold text-foreground">Driver Feedback System</h1>
                <p className="text-muted-foreground">Monitor performance and customer satisfaction</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800 px-3 py-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                91% Positive
              </Badge>
              <Button variant="outline" className="border-border text-muted-foreground hover:bg-[#f8f7f5] dark:bg-[#231b0f]">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-border mb-6">
          <div className="flex">
            {[
              { id: 'overview', label: 'Performance Overview', icon: <BarChart3 className="h-4 w-4" /> },
              { id: 'feedback-form', label: 'Submit Feedback', icon: <MessageCircle className="h-4 w-4" /> },
              { id: 'admin-management', label: 'Manage Feedback', icon: <Award className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 p-4 text-center border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-border bg-[#f8f7f5] dark:bg-[#231b0f] text-foreground'
                    : 'border-transparent text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && <DriverPerformanceDashboard />}
          {activeTab === 'feedback-form' && <CustomerFeedbackForm />}
          {activeTab === 'admin-management' && <AdminFeedbackManagement />}
        </div>
      </div>
    </div>
  );
}