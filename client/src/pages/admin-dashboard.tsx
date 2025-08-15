import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
// Removed Screen import for proper desktop responsiveness
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Clock,
  MapPin,
  User,
  Truck,
  BarChart3,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  Filter,
  Download,
  Bell,
  Calendar,
  Search,
  CreditCard,
  MessageCircle,
  Phone,
  HeadphonesIcon,
  Send,
  Bot,
  UserCheck,
  X,
  ArrowUpDown,
  ChevronDown,
  PieChart,
  Target,
  Trophy,
  Shield,
  MessageSquare
} from 'lucide-react';
import { useAuth } from "@/hooks/useAuth-simple";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminSupportModal from "@/components/AdminSupportModal";
import NotificationBell from "@/components/NotificationBell";
import ContactSupportButton from "@/components/ContactSupportButton";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { ReturnlyLogo } from '@/components/LogoIcon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CompletedOrdersAnalytics from "@/components/CompletedOrdersAnalytics";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Order {
  id: string;
  customer: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'refunded';
  driver?: string;
  amount: number;
  driverEarning: number;
  pickupAddress: string;
  destination: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  completedOrders: number;
  rating: number;
  earnings: number;
  pendingPayouts: number;
  location?: string;
  vehicleInfo?: string;
  joinDate: string;
  lastActive: string;
  supportTickets: number;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showDriverDetail, setShowDriverDetail] = useState(false);
  const [driverSearchTerm, setDriverSearchTerm] = useState('');
  const [driverStatusFilter, setDriverStatusFilter] = useState<string>('all');
  const [showSupportChat, setShowSupportChat] = useState(false);
  const [showAdminSupportModal, setShowAdminSupportModal] = useState(false);
  const [supportContext, setSupportContext] = useState<{type: 'driver' | 'customer', id: string, name: string} | null>(null);
  
  // Enhanced completed orders state
  const [completedOrdersSearch, setCompletedOrdersSearch] = useState('');
  const [completedOrdersDateRange, setCompletedOrdersDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [completedOrdersSort, setCompletedOrdersSort] = useState<'date' | 'amount' | 'driver'>('date');
  const [completedOrdersSortOrder, setCompletedOrdersSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  
  // Employee management with API integration
  const queryClient = useQueryClient();
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  
  // Fetch employees from API
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['/api/employees'],
    enabled: currentUser?.isAdmin
  });

  // Transform employee data for display
  const transformedEmployees = employees.map((emp: any) => ({
    id: emp.id,
    name: `${emp.firstName} ${emp.lastName}`.trim() || emp.email.split('@')[0],
    email: emp.email,
    role: emp.isAdmin ? 'Admin' : 'Employee',
    status: emp.isActive ? 'active' : 'pending',
    joinDate: new Date(emp.createdAt).toLocaleDateString(),
    isAdmin: emp.isAdmin
  }));

  // Grant admin access mutation
  const grantAdminMutation = useMutation({
    mutationFn: async (employeeId: number) => {
      await apiRequest('POST', `/api/employees/${employeeId}/grant-admin`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({
        title: "Success",
        description: "Admin access granted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to grant admin access",
        variant: "destructive",
      });
    }
  });

  // Revoke admin access mutation
  const revokeAdminMutation = useMutation({
    mutationFn: async (employeeId: number) => {
      await apiRequest('POST', `/api/employees/${employeeId}/revoke-admin`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({
        title: "Success", 
        description: "Admin access revoked successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to revoke admin access",
        variant: "destructive",
      });
    }
  });

  // Invite employee mutation
  const inviteEmployeeMutation = useMutation({
    mutationFn: async (email: string) => {
      await apiRequest('POST', '/api/employees/invite', { email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      setNewEmployeeEmail('');
      setShowAddEmployeeModal(false);
      toast({
        title: "Success",
        description: "Employee invitation sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    }
  });
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    setOrders([
      {
        id: 'ORD001',
        customer: 'Sarah Johnson',
        status: 'pending',
        amount: 8.99,
        driverEarning: 6.29,
        pickupAddress: '123 Main St, St. Louis, MO',
        destination: 'Target - Chesterfield',
        createdAt: '2024-01-12 10:30 AM',
        priority: 'high'
      },
      {
        id: 'ORD002',
        customer: 'Mike Rodriguez',
        status: 'assigned',
        driver: 'John Smith',
        amount: 12.50,
        driverEarning: 8.75,
        pickupAddress: '456 Oak Ave, St. Louis, MO',
        destination: 'Best Buy - Kirkwood',
        createdAt: '2024-01-12 09:15 AM',
        priority: 'medium'
      },
      {
        id: 'ORD003',
        customer: 'Jennifer Lee',
        status: 'picked_up',
        driver: 'Maria Garcia',
        amount: 6.75,
        driverEarning: 4.73,
        pickupAddress: '789 Pine Rd, St. Louis, MO',
        destination: 'Macy\'s - West County',
        createdAt: '2024-01-12 08:45 AM',
        priority: 'low'
      },
      {
        id: 'ORD004',
        customer: 'Robert Chen',
        status: 'delivered',
        driver: 'John Smith',
        amount: 9.99,
        driverEarning: 6.99,
        pickupAddress: '321 Elm St, St. Louis, MO',
        destination: 'Amazon Returns - Brentwood',
        createdAt: '2024-01-11 02:15 PM',
        priority: 'medium'
      },
      {
        id: 'ORD005',
        customer: 'Lisa Thompson',
        status: 'delivered',
        driver: 'Maria Garcia',
        amount: 7.50,
        driverEarning: 5.25,
        pickupAddress: '654 Maple Dr, St. Louis, MO',
        destination: 'Walmart - Kirkwood',
        createdAt: '2024-01-11 11:30 AM',
        priority: 'low'
      },
      {
        id: 'ORD006',
        customer: 'Mark Johnson',
        status: 'refunded',
        driver: 'David Wilson',
        amount: 15.75,
        driverEarning: 11.03,
        pickupAddress: '987 Oak St, St. Louis, MO',
        destination: 'Best Buy - West County',
        createdAt: '2024-01-10 09:45 AM',
        priority: 'high'
      }
    ]);

    setDrivers([
      {
        id: 'DRV001',
        name: 'John Smith',
        email: 'john.smith@returnly.com',
        phone: '(314) 555-0101',
        status: 'active',
        completedOrders: 245,
        rating: 4.8,
        earnings: 1847.50,
        pendingPayouts: 127.85,
        location: 'Downtown St. Louis',
        vehicleInfo: '2021 Honda CR-V',
        joinDate: '2024-01-15',
        lastActive: '2024-01-12 11:45 AM',
        supportTickets: 2
      },
      {
        id: 'DRV002',
        name: 'Maria Garcia',
        email: 'maria.garcia@returnly.com',
        phone: '(314) 555-0102',
        status: 'active',
        completedOrders: 189,
        rating: 4.9,
        earnings: 1432.75,
        pendingPayouts: 89.50,
        location: 'Clayton',
        vehicleInfo: '2020 Toyota RAV4',
        joinDate: '2024-02-03',
        lastActive: '2024-01-12 10:22 AM',
        supportTickets: 0
      },
      {
        id: 'DRV003',
        name: 'David Wilson',
        email: 'david.wilson@returnly.com',
        phone: '(314) 555-0103',
        status: 'inactive',
        completedOrders: 67,
        rating: 4.6,
        earnings: 528.25,
        pendingPayouts: 45.00,
        location: 'Chesterfield',
        vehicleInfo: '2019 Subaru Outback',
        joinDate: '2023-11-20',
        lastActive: '2024-01-11 6:30 PM',
        supportTickets: 5
      }
    ]);

    // Initialize employee data

  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-center text-amber-900">Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-amber-700 mb-4">Please sign in to access the admin dashboard.</p>
            <Button 
              onClick={() => setLocation('/login')}
              className="bg-amber-700 hover:bg-amber-800 text-white"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      assigned: 'bg-blue-100 text-blue-800 border-blue-300',
      picked_up: 'bg-purple-100 text-purple-800 border-purple-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      refunded: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return variants[priority as keyof typeof variants] || variants.medium;
  };

  const getDriverStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'inactive': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'suspended': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const handleDriverPayout = (driver: Driver) => {
    toast({
      title: "Payout Initiated",
      description: `$${driver.pendingPayouts} sent to ${driver.name}`,
    });
  };

  const handleDriverSupport = (driver: Driver) => {
    setSupportContext({ type: 'driver', id: driver.id, name: driver.name });
    setShowAdminSupportModal(true);
  };

  const handleCustomerSupport = (order: Order) => {
    setSupportContext({ type: 'customer', id: order.id, name: order.customer });
    setShowAdminSupportModal(true);
  };

  // Employee management functions
  const handleGrantAdminAccess = (employee: any) => {
    grantAdminMutation.mutate(employee.id);
  };

  const handleRevokeAdminAccess = (employee: any) => {
    revokeAdminMutation.mutate(employee.id);
  };

  const handleAddEmployee = () => {
    if (!newEmployeeEmail) return;
    inviteEmployeeMutation.mutate(newEmployeeEmail);
  };

  const filteredEmployees = transformedEmployees.filter(employee => 
    employee.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(employeeSearchTerm.toLowerCase())
  );

  // Enhanced Excel export functionality for completed orders with advanced analytics
  const exportToExcel = () => {
    const completedOrders = getFilteredCompletedOrders();
    
    // Main orders data
    const ordersData = completedOrders.map(order => ({
      'Order ID': order.id,
      'Customer Name': order.customer,
      'Driver Assigned': order.driver || 'N/A',
      'Order Status': order.status.replace('_', ' ').toUpperCase(),
      'Total Amount': order.amount,
      'Service Fee': 3.99,
      'Net Revenue': order.amount - 3.99,
      'Driver Commission (70%)': order.driver ? order.amount * 0.7 : 0,
      'Company Profit (30%)': order.driver ? order.amount * 0.3 : order.amount,
      'Pickup Address': order.pickupAddress,
      'Destination Store': order.destination,
      'Priority Level': order.priority.toUpperCase(),
      'Completed Date': order.createdAt,
      'Order Type': order.status === 'refunded' ? 'REFUNDED' : 'DELIVERED',
      'Customer Satisfaction': 'Excellent', // Mock data
      'Delivery Rating': 5.0, // Mock data
      'Estimated Distance (mi)': Math.floor(Math.random() * 15) + 3, // Mock data
      'Delivery Time (min)': Math.floor(Math.random() * 30) + 15 // Mock data
    }));

    // Financial summary data
    const totalOrders = completedOrders.length;
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.amount, 0);
    const totalServiceFees = totalOrders * 3.99;
    const totalDriverCommissions = completedOrders.reduce((sum, order) => sum + (order.amount * 0.7), 0);
    const netCompanyProfit = totalRevenue - totalDriverCommissions;
    
    const summaryData = [
      { 'Metric': 'Total Completed Orders', 'Value': totalOrders, 'Details': 'All delivered and refunded orders' },
      { 'Metric': 'Total Gross Revenue', 'Value': totalRevenue.toFixed(2), 'Details': 'Sum of all order amounts' },
      { 'Metric': 'Total Service Fees', 'Value': totalServiceFees.toFixed(2), 'Details': '$3.99 per order' },
      { 'Metric': 'Total Driver Commissions', 'Value': totalDriverCommissions.toFixed(2), 'Details': '70% commission rate' },
      { 'Metric': 'Net Company Profit', 'Value': netCompanyProfit.toFixed(2), 'Details': 'Revenue minus driver commissions' },
      { 'Metric': 'Average Order Value', 'Value': (totalRevenue / totalOrders).toFixed(2), 'Details': 'Mean order amount' },
      { 'Metric': 'Profit Margin', 'Value': `${((netCompanyProfit / totalRevenue) * 100).toFixed(1)}%`, 'Details': 'Company profit percentage' }
    ];

    // Driver performance analytics
    const driverStats = completedOrders.reduce((stats, order) => {
      if (order.driver) {
        if (!stats[order.driver]) {
          stats[order.driver] = {
            'Driver Name': order.driver,
            'Total Orders': 0,
            'Total Earnings': 0,
            'Delivered Orders': 0,
            'Refunded Orders': 0,
            'Success Rate %': 0,
            'Average Order Value': 0
          };
        }
        stats[order.driver]['Total Orders']++;
        stats[order.driver]['Total Earnings'] += order.amount * 0.7;
        if (order.status === 'delivered') {
          stats[order.driver]['Delivered Orders']++;
        } else {
          stats[order.driver]['Refunded Orders']++;
        }
      }
      return stats;
    }, {} as Record<string, any>);

    // Calculate success rates and averages
    Object.keys(driverStats).forEach(driverName => {
      const driver = driverStats[driverName];
      driver['Success Rate %'] = ((driver['Delivered Orders'] / driver['Total Orders']) * 100).toFixed(1);
      driver['Average Order Value'] = (driver['Total Earnings'] / driver['Total Orders'] * (10/7)).toFixed(2);
    });

    const driverPerformanceData = Object.values(driverStats);

    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new();
    
    // Orders sheet
    const ordersWs = XLSX.utils.json_to_sheet(ordersData);
    ordersWs['!cols'] = [
      { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 30 }, { wch: 25 }, { wch: 12 },
      { wch: 18 }, { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 15 }, { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, ordersWs, "Detailed Orders");

    // Summary sheet
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, "Financial Summary");

    // Driver performance sheet
    if (driverPerformanceData.length > 0) {
      const driverWs = XLSX.utils.json_to_sheet(driverPerformanceData);
      driverWs['!cols'] = [{ wch: 18 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(wb, driverWs, "Driver Performance");
    }

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileName = `Returnly_Business_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(data, fileName);
    
    toast({
      title: "Advanced Export Complete",
      description: `Business analytics exported with ${totalOrders} orders across ${Object.keys(driverStats).length} drivers`,
    });
  };

  // Enhanced filtering and sorting for completed orders
  const getFilteredCompletedOrders = () => {
    let completedOrders = orders.filter(order => order.status === 'delivered' || order.status === 'refunded');

    // Apply search filter
    if (completedOrdersSearch) {
      const searchLower = completedOrdersSearch.toLowerCase();
      completedOrders = completedOrders.filter(order => 
        order.id.toLowerCase().includes(searchLower) ||
        order.customer.toLowerCase().includes(searchLower) ||
        (order.driver && order.driver.toLowerCase().includes(searchLower)) ||
        order.pickupAddress.toLowerCase().includes(searchLower) ||
        order.destination.toLowerCase().includes(searchLower)
      );
    }

    // Apply date range filter (simplified for demo)
    if (completedOrdersDateRange !== 'all') {
      // In real implementation, would filter by actual dates
      // This is just for demonstration
    }

    // Apply sorting
    completedOrders.sort((a, b) => {
      let valueA, valueB;
      
      switch (completedOrdersSort) {
        case 'date':
          valueA = new Date(a.createdAt);
          valueB = new Date(b.createdAt);
          break;
        case 'amount':
          valueA = a.amount;
          valueB = b.amount;
          break;
        case 'driver':
          valueA = a.driver || '';
          valueB = b.driver || '';
          break;
        default:
          valueA = a.createdAt;
          valueB = b.createdAt;
      }

      if (completedOrdersSortOrder === 'asc') {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });

    return completedOrders;
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&w=5120&h=3413&dpr=3&fit=crop&crop=center&q=100)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div className="absolute inset-0 bg-white/90"></div>
      <div className="relative z-10">
        
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-amber-200">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <Link href="/">
                  <div className="cursor-pointer hover:opacity-80 transition-opacity">
                    <ReturnlyLogo size={32} variant="default" />
                  </div>
                </Link>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-amber-900">Admin Dashboard</h1>
                  <p className="text-sm sm:text-base text-amber-700 hidden sm:block">Business Operations Center</p>
                </div>
              </div>
              
              {/* Advanced Features Navigation */}
              <div className="hidden lg:flex items-center space-x-2">
                <Link href="/real-time-tracking-advanced">
                  <Button variant="outline" size="sm" className="border-amber-200 text-amber-700 hover:bg-amber-50">
                    <MapPin className="h-4 w-4 mr-1" />
                    Live Tracking
                  </Button>
                </Link>
                <Link href="/business-intelligence">
                  <Button variant="outline" size="sm" className="border-amber-200 text-amber-700 hover:bg-amber-50">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Analytics
                  </Button>
                </Link>
                <Link href="/notification-center">
                  <Button variant="outline" size="sm" className="border-amber-200 text-amber-700 hover:bg-amber-50">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Communications
                  </Button>
                </Link>
                <Link href="/quality-assurance">
                  <Button variant="outline" size="sm" className="border-amber-200 text-amber-700 hover:bg-amber-50">
                    <Shield className="h-4 w-4 mr-1" />
                    Quality
                  </Button>
                </Link>
                <Link href="/driver-incentives">
                  <Button variant="outline" size="sm" className="border-amber-200 text-amber-700 hover:bg-amber-50">
                    <Trophy className="h-4 w-4 mr-1" />
                    Incentives
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center justify-end space-x-1 sm:space-x-3">
                <div className="order-1 sm:order-none">
                  <RoleSwitcher />
                </div>
                <div className="order-2 sm:order-none">
                  <NotificationBell userType="admin" />
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setLocation('/')}
                  className="text-xs sm:text-sm px-2 sm:px-3 order-3 sm:order-none"
                >
                  <span className="hidden sm:inline">Back to Site</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-600 text-xs sm:text-sm font-medium">Today's Orders</p>
                    <p className="text-xl sm:text-2xl font-bold text-amber-900">47</p>
                  </div>
                  <Package className="h-6 sm:h-8 w-6 sm:w-8 text-amber-600" />
                </div>
                <p className="text-xs text-amber-700 mt-2">+12% from yesterday</p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-600 text-xs sm:text-sm font-medium">Active Drivers</p>
                    <p className="text-xl sm:text-2xl font-bold text-amber-900">28</p>
                  </div>
                  <Truck className="h-6 sm:h-8 w-6 sm:w-8 text-amber-600" />
                </div>
                <p className="text-xs text-amber-700 mt-2">3 on break</p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-600 text-xs sm:text-sm font-medium">Revenue Today</p>
                    <p className="text-xl sm:text-2xl font-bold text-amber-900">$1,247</p>
                  </div>
                  <DollarSign className="h-6 sm:h-8 w-6 sm:w-8 text-amber-600" />
                </div>
                <p className="text-xs text-amber-700 mt-2">+8% from yesterday</p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-600 text-xs sm:text-sm font-medium">Avg Pickup Time</p>
                    <p className="text-xl sm:text-2xl font-bold text-amber-900">14min</p>
                  </div>
                  <Clock className="h-6 sm:h-8 w-6 sm:w-8 text-amber-600" />
                </div>
                <p className="text-xs text-amber-700 mt-2">-2min from yesterday</p>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Quick Navigation */}
          <div className="lg:hidden mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Link href="/real-time-tracking-advanced" className="block">
                <Card className="bg-white/90 backdrop-blur-sm border-amber-200 hover:border-amber-300 transition-colors cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <MapPin className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-amber-900">Live Tracking</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/business-intelligence" className="block">
                <Card className="bg-white/90 backdrop-blur-sm border-amber-200 hover:border-amber-300 transition-colors cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <BarChart3 className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-amber-900">Analytics</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/notification-center" className="block">
                <Card className="bg-white/90 backdrop-blur-sm border-amber-200 hover:border-amber-300 transition-colors cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <MessageSquare className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-amber-900">Communications</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/quality-assurance" className="block">
                <Card className="bg-white/90 backdrop-blur-sm border-amber-200 hover:border-amber-300 transition-colors cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <Shield className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-amber-900">Quality</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/driver-incentives" className="block">
                <Card className="bg-white/90 backdrop-blur-sm border-amber-200 hover:border-amber-300 transition-colors cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <Trophy className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-amber-900">Incentives</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/advanced-reporting" className="block">
                <Card className="bg-white/90 backdrop-blur-sm border-amber-200 hover:border-amber-300 transition-colors cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <PieChart className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-amber-900">Reports</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="orders" className="space-y-4 sm:space-y-6">
            <TabsList className="bg-white border-amber-200 h-auto flex-wrap gap-1 sm:gap-0 p-1">
              <TabsTrigger value="orders" className="data-[state=active]:bg-amber-100 text-xs sm:text-sm px-2 sm:px-3 py-2">
                <Package className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Live Orders</span>
                <span className="sm:hidden">Live</span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-amber-100 text-xs sm:text-sm px-2 sm:px-3 py-2">
                <CheckCircle className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Completed</span>
                <span className="sm:hidden">Done</span>
              </TabsTrigger>
              <TabsTrigger value="drivers" className="data-[state=active]:bg-amber-100 text-xs sm:text-sm px-2 sm:px-3 py-2">
                <Truck className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Drivers</span>
                <span className="sm:hidden">Drivers</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-100 text-xs sm:text-sm px-2 sm:px-3 py-2">
                <BarChart3 className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="support" className="data-[state=active]:bg-amber-100 text-xs sm:text-sm px-2 sm:px-3 py-2">
                <MessageCircle className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Support Tickets</span>
                <span className="sm:hidden">Support</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="data-[state=active]:bg-amber-100 text-xs sm:text-sm px-2 sm:px-3 py-2">
                <Target className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Advanced Features</span>
                <span className="sm:hidden">Advanced</span>
              </TabsTrigger>
              <TabsTrigger value="employees" className="data-[state=active]:bg-amber-100 text-xs sm:text-sm px-2 sm:px-3 py-2">
                <UserCheck className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Employees</span>
                <span className="sm:hidden">Staff</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-amber-100 text-xs sm:text-sm px-2 sm:px-3 py-2">
                <Settings className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
                <span className="sm:hidden">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <CardTitle className="text-amber-900 text-lg sm:text-xl">Live Orders</CardTitle>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-24 sm:w-32 text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="assigned">Assigned</SelectItem>
                          <SelectItem value="picked_up">Picked Up</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="outline" className="px-2 sm:px-3">
                        <RefreshCw className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Refresh</span>
                        <span className="sm:hidden text-xs">Sync</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <div 
                        key={order.id} 
                        className="p-4 border border-amber-200 rounded-lg hover:bg-amber-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <div>
                              <p className="font-semibold text-amber-900 text-sm sm:text-base">{order.id}</p>
                              <p className="text-xs sm:text-sm text-amber-700">{order.customer}</p>
                            </div>
                            <Badge className={`${getPriorityBadge(order.priority)} text-xs`}>
                              {order.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right">
                            <Badge className={`${getStatusBadge(order.status)} text-xs mb-0 sm:mb-2`}>
                              {order.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <p className="text-sm font-semibold text-amber-900">${order.amount}</p>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-amber-700">
                          <p><MapPin className="h-3 w-3 inline mr-1" />{order.pickupAddress}</p>
                          <p><Package className="h-3 w-3 inline mr-1" />{order.destination}</p>
                        </div>
                        {order.driver && (
                          <p className="mt-2 text-xs text-amber-600">
                            <Truck className="h-3 w-3 inline mr-1" />
                            Assigned to: {order.driver}
                          </p>
                        )}
                        <div className="flex justify-end mt-3">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-blue-700 border-blue-300 text-xs px-2 py-1"
                            onClick={() => handleCustomerSupport(order)}
                          >
                            <HeadphonesIcon className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Support</span>
                            <span className="sm:hidden">Help</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enhanced Completed Orders Tab */}
            <TabsContent value="completed">
              <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
                <CardHeader>
                  <div className="flex flex-col space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <CardTitle className="text-amber-900 text-lg sm:text-xl">
                        Completed Orders ({getFilteredCompletedOrders().length})
                      </CardTitle>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="px-2 sm:px-3"
                          onClick={exportToExcel}
                          data-testid="button-export-excel"
                        >
                          <Download className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Export Analytics</span>
                          <span className="sm:hidden text-xs">Export</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant={showAdvancedAnalytics ? "default" : "outline"}
                          className="px-2 sm:px-3"
                          onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
                          data-testid="button-toggle-analytics"
                        >
                          <BarChart3 className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">
                            {showAdvancedAnalytics ? 'Hide Analytics' : 'Advanced Analytics'}
                          </span>
                          <span className="sm:hidden text-xs">Analytics</span>
                        </Button>
                        <Button size="sm" variant="outline" className="px-2 sm:px-3">
                          <RefreshCw className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Refresh</span>
                          <span className="sm:hidden text-xs">Sync</span>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Search and Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search orders..."
                          value={completedOrdersSearch}
                          onChange={(e) => setCompletedOrdersSearch(e.target.value)}
                          className="pl-10"
                          data-testid="input-search-completed-orders"
                        />
                      </div>
                      
                      <Select value={completedOrdersDateRange} onValueChange={setCompletedOrdersDateRange}>
                        <SelectTrigger data-testid="select-date-range">
                          <Calendar className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">This Week</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={completedOrdersSort} onValueChange={setCompletedOrdersSort}>
                        <SelectTrigger data-testid="select-sort-by">
                          <ArrowUpDown className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">Sort by Date</SelectItem>
                          <SelectItem value="amount">Sort by Amount</SelectItem>
                          <SelectItem value="driver">Sort by Driver</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={completedOrdersSortOrder} onValueChange={setCompletedOrdersSortOrder}>
                        <SelectTrigger data-testid="select-sort-order">
                          <ChevronDown className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desc">Newest First</SelectItem>
                          <SelectItem value="asc">Oldest First</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {getFilteredCompletedOrders().length === 0 ? (
                    <div className="text-center py-8 text-amber-600">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-amber-400" />
                      <p className="text-lg font-medium">No completed orders found</p>
                      <p className="text-sm">
                        {completedOrdersSearch ? 'Try adjusting your search or filters' : 'Completed deliveries and refunds will appear here'}
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-amber-50">
                            <TableHead className="font-semibold text-amber-900">Order ID</TableHead>
                            <TableHead className="font-semibold text-amber-900">Customer</TableHead>
                            <TableHead className="font-semibold text-amber-900">Driver</TableHead>
                            <TableHead className="font-semibold text-amber-900">Status</TableHead>
                            <TableHead className="font-semibold text-amber-900">Amount</TableHead>
                            <TableHead className="font-semibold text-amber-900">Revenue</TableHead>
                            <TableHead className="font-semibold text-amber-900">Date</TableHead>
                            <TableHead className="font-semibold text-amber-900">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getFilteredCompletedOrders().map((order) => (
                            <TableRow 
                              key={order.id} 
                              className="hover:bg-amber-50/50 cursor-pointer transition-colors"
                              onClick={() => setSelectedOrder(order)}
                              data-testid={`row-completed-order-${order.id}`}
                            >
                              <TableCell className="font-medium text-amber-900">{order.id}</TableCell>
                              <TableCell>{order.customer}</TableCell>
                              <TableCell>
                                {order.driver ? (
                                  <span className="flex items-center text-green-700">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    {order.driver}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">N/A</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge className={`${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'} text-xs`}>
                                  {order.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-semibold">${order.amount.toFixed(2)}</TableCell>
                              <TableCell className="font-semibold text-green-700">
                                ${(order.amount - 3.99).toFixed(2)}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">{order.createdAt}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-amber-700 border-amber-300 text-xs px-2 py-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCustomerSupport(order);
                                    }}
                                    data-testid={`button-view-details-${order.id}`}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    Details
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  
                  {/* Summary Statistics */}
                  {getFilteredCompletedOrders().length > 0 && (
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Card className="bg-green-50 border-green-200">
                        <CardContent className="p-4 text-center">
                          <p className="text-sm font-medium text-green-600">Total Revenue</p>
                          <p className="text-2xl font-bold text-green-700">
                            ${getFilteredCompletedOrders().reduce((sum, order) => sum + (order.amount - 3.99), 0).toFixed(2)}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4 text-center">
                          <p className="text-sm font-medium text-blue-600">Driver Earnings</p>
                          <p className="text-2xl font-bold text-blue-700">
                            ${getFilteredCompletedOrders().reduce((sum, order) => sum + (order.amount * 0.7), 0).toFixed(2)}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-amber-50 border-amber-200">
                        <CardContent className="p-4 text-center">
                          <p className="text-sm font-medium text-amber-600">Service Fees</p>
                          <p className="text-2xl font-bold text-amber-700">
                            ${(getFilteredCompletedOrders().length * 3.99).toFixed(2)}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Advanced Analytics Section */}
                  {showAdvancedAnalytics && (
                    <div className="mt-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                      <CompletedOrdersAnalytics completedOrders={getFilteredCompletedOrders()} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Drivers Tab */}
            <TabsContent value="drivers">
              <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <CardTitle className="text-amber-900">Driver Management</CardTitle>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 h-4 w-4" />
                        <Input
                          placeholder="Search drivers..."
                          value={driverSearchTerm}
                          onChange={(e) => setDriverSearchTerm(e.target.value)}
                          className="pl-10 border-amber-300 focus:border-amber-500 w-full sm:w-64"
                          data-testid="input-driver-search"
                        />
                      </div>
                      <Select value={driverStatusFilter} onValueChange={setDriverStatusFilter}>
                        <SelectTrigger className="border-amber-300 w-full sm:w-40" data-testid="select-driver-status">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Drivers</SelectItem>
                          <SelectItem value="active">Active Only</SelectItem>
                          <SelectItem value="inactive">Inactive Only</SelectItem>
                          <SelectItem value="suspended">Suspended Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {getFilteredDrivers().map((driver) => (
                      <Card key={driver.id} className="border-amber-200">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {getDriverStatusIcon(driver.status)}
                              <p className="font-semibold text-amber-900 text-sm sm:text-base">{driver.name}</p>
                            </div>
                            <Badge className={`text-xs ${driver.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {driver.status}
                            </Badge>
                          </div>
                          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-amber-700">
                            <p className="truncate">📧 {driver.email}</p>
                            <p>📱 {driver.phone}</p>
                            <p className="truncate">📍 {driver.location}</p>
                            <div className="flex justify-between pt-2 border-t border-amber-200 text-xs">
                              <span>Orders: {driver.completedOrders}</span>
                              <span>⭐ {driver.rating}</span>
                            </div>
                            <p className="font-semibold text-amber-900 text-xs sm:text-sm">
                              Earnings: ${driver.earnings.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 text-xs px-2 py-1"
                              onClick={() => {
                                setSelectedDriver(driver);
                                setShowDriverDetail(true);
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 text-green-700 border-green-300 text-xs px-2 py-1"
                              onClick={() => handleDriverPayout(driver)}
                              disabled={driver.pendingPayouts === 0}
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              Pay
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 text-blue-700 border-blue-300 text-xs px-2 py-1"
                              onClick={() => handleDriverSupport(driver)}
                            >
                              <HeadphonesIcon className="h-3 w-3 mr-1" />
                              Help
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
                  <CardHeader>
                    <CardTitle className="text-amber-900">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-700">Orders This Week</span>
                      <span className="font-bold text-amber-900">327</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-amber-700">Average Rating</span>
                      <span className="font-bold text-amber-900">4.8⭐</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-amber-700">Customer Retention</span>
                      <span className="font-bold text-amber-900">87%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-amber-700">Revenue Growth</span>
                      <span className="font-bold text-green-700">+23%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
                  <CardHeader>
                    <CardTitle className="text-amber-900">System Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-700">Server Status</span>
                      <span className="flex items-center text-green-700">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Healthy
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-amber-700">Payment Processing</span>
                      <span className="flex items-center text-green-700">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Online
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-amber-700">Driver Mobile App</span>
                      <span className="flex items-center text-green-700">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Connected
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            {/* Employee Management Tab */}
            <TabsContent value="employees">
              <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <CardTitle className="text-amber-900">Employee Management</CardTitle>
                    <Button 
                      onClick={() => setShowAddEmployeeModal(true)}
                      className="bg-amber-700 hover:bg-amber-800 text-white"
                      data-testid="button-add-employee"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Add Employee
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Search */}
                  <div className="mb-6">
                    <div className="relative max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search employees..."
                        value={employeeSearchTerm}
                        onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-employees"
                      />
                    </div>
                  </div>

                  {/* Employee List */}
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-amber-50">
                          <TableHead className="font-semibold text-amber-900">Name</TableHead>
                          <TableHead className="font-semibold text-amber-900">Email</TableHead>
                          <TableHead className="font-semibold text-amber-900">Role</TableHead>
                          <TableHead className="font-semibold text-amber-900">Status</TableHead>
                          <TableHead className="font-semibold text-amber-900">Join Date</TableHead>
                          <TableHead className="font-semibold text-amber-900">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEmployees.map((employee) => (
                          <TableRow 
                            key={employee.id} 
                            className="hover:bg-amber-50/50"
                            data-testid={`row-employee-${employee.id}`}
                          >
                            <TableCell className="font-medium">{employee.name}</TableCell>
                            <TableCell>{employee.email}</TableCell>
                            <TableCell>
                              <Badge 
                                className={employee.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}
                              >
                                {employee.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                              >
                                {employee.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{employee.joinDate}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {!employee.isAdmin && employee.email !== 'nabeelmumtaz92@gmail.com' ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleGrantAdminAccess(employee)}
                                    className="text-green-700 border-green-300 hover:bg-green-50"
                                    data-testid={`button-grant-admin-${employee.id}`}
                                  >
                                    <UserCheck className="h-3 w-3 mr-1" />
                                    Grant Admin
                                  </Button>
                                ) : employee.email !== 'nabeelmumtaz92@gmail.com' ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRevokeAdminAccess(employee)}
                                    className="text-red-700 border-red-300 hover:bg-red-50"
                                    data-testid={`button-revoke-admin-${employee.id}`}
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Revoke Admin
                                  </Button>
                                ) : (
                                  <Badge className="bg-purple-100 text-purple-800">
                                    Master Admin
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Add Employee Modal */}
                  {showAddEmployeeModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-amber-900">Add New Employee</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAddEmployeeModal(false)}
                            data-testid="button-close-add-employee"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="employee-email" className="text-amber-800 font-medium">
                              Employee Email
                            </Label>
                            <Input
                              id="employee-email"
                              type="email"
                              placeholder="employee@company.com"
                              value={newEmployeeEmail}
                              onChange={(e) => setNewEmployeeEmail(e.target.value)}
                              className="mt-1 border-amber-300 focus:border-amber-500"
                              data-testid="input-employee-email"
                            />
                            <p className="text-sm text-amber-600 mt-1">
                              They'll receive an invitation to join Returnly
                            </p>
                          </div>
                          <div className="flex space-x-3">
                            <Button
                              onClick={handleAddEmployee}
                              className="bg-amber-700 hover:bg-amber-800 text-white flex-1"
                              disabled={!newEmployeeEmail}
                              data-testid="button-confirm-add-employee"
                            >
                              Send Invitation
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowAddEmployeeModal(false)}
                              className="border-amber-300 text-amber-700"
                              data-testid="button-cancel-add-employee"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-900">Business Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="pickup-fee" className="text-amber-800 font-medium">Base Pickup Fee ($)</Label>
                      <Input 
                        id="pickup-fee" 
                        defaultValue="6.99" 
                        className="mt-1 border-amber-300 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="service-area" className="text-amber-800 font-medium">Service Area (miles)</Label>
                      <Input 
                        id="service-area" 
                        defaultValue="25" 
                        className="mt-1 border-amber-300 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-wait" className="text-amber-800 font-medium">Max Wait Time (hours)</Label>
                      <Input 
                        id="max-wait" 
                        defaultValue="4" 
                        className="mt-1 border-amber-300 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="driver-commission" className="text-amber-800 font-medium">Driver Commission (%)</Label>
                      <Input 
                        id="driver-commission" 
                        defaultValue="70" 
                        className="mt-1 border-amber-300 focus:border-amber-500"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button className="bg-amber-700 hover:bg-amber-800 text-white">
                      Save Settings
                    </Button>
                    <Button variant="outline" className="border-amber-300 text-amber-700">
                      Reset to Defaults
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Advanced Features Tab */}
            <TabsContent value="advanced" className="space-y-4 sm:space-y-6">
              <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-900 flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Advanced Business Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {/* Real-Time Tracking */}
                    <Link href="/real-time-tracking-advanced" className="block">
                      <Card className="border-amber-200 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer h-full">
                        <CardContent className="p-4">
                          <div className="flex items-center mb-3">
                            <MapPin className="h-6 w-6 text-amber-600 mr-3" />
                            <h3 className="font-semibold text-amber-900">Live Driver Tracking</h3>
                          </div>
                          <p className="text-sm text-amber-700 mb-3">
                            Real-time GPS monitoring, ETA calculations, and driver location visualization
                          </p>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </CardContent>
                      </Card>
                    </Link>

                    {/* Business Intelligence */}
                    <Link href="/business-intelligence" className="block">
                      <Card className="border-amber-200 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer h-full">
                        <CardContent className="p-4">
                          <div className="flex items-center mb-3">
                            <BarChart3 className="h-6 w-6 text-amber-600 mr-3" />
                            <h3 className="font-semibold text-amber-900">Business Intelligence</h3>
                          </div>
                          <p className="text-sm text-amber-700 mb-3">
                            Revenue forecasting, demand prediction, and market expansion analysis
                          </p>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </CardContent>
                      </Card>
                    </Link>

                    {/* Automated Communications */}
                    <Link href="/notification-center" className="block">
                      <Card className="border-amber-200 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer h-full">
                        <CardContent className="p-4">
                          <div className="flex items-center mb-3">
                            <MessageSquare className="h-6 w-6 text-amber-600 mr-3" />
                            <h3 className="font-semibold text-amber-900">Auto Communications</h3>
                          </div>
                          <p className="text-sm text-amber-700 mb-3">
                            SMS/email notifications, templates, and delivery settings management
                          </p>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </CardContent>
                      </Card>
                    </Link>

                    {/* Quality Assurance */}
                    <Link href="/quality-assurance" className="block">
                      <Card className="border-amber-200 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer h-full">
                        <CardContent className="p-4">
                          <div className="flex items-center mb-3">
                            <Shield className="h-6 w-6 text-amber-600 mr-3" />
                            <h3 className="font-semibold text-amber-900">Quality Assurance</h3>
                          </div>
                          <p className="text-sm text-amber-700 mb-3">
                            Photo verification, damage claims, and insurance integration
                          </p>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </CardContent>
                      </Card>
                    </Link>

                    {/* Driver Incentives */}
                    <Link href="/driver-incentives" className="block">
                      <Card className="border-amber-200 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer h-full">
                        <CardContent className="p-4">
                          <div className="flex items-center mb-3">
                            <Trophy className="h-6 w-6 text-amber-600 mr-3" />
                            <h3 className="font-semibold text-amber-900">Driver Incentives</h3>
                          </div>
                          <p className="text-sm text-amber-700 mb-3">
                            Performance bonuses, challenges, rewards, and analytics tracking
                          </p>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </CardContent>
                      </Card>
                    </Link>

                    {/* Advanced Reporting */}
                    <Link href="/advanced-reporting" className="block">
                      <Card className="border-amber-200 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer h-full">
                        <CardContent className="p-4">
                          <div className="flex items-center mb-3">
                            <PieChart className="h-6 w-6 text-amber-600 mr-3" />
                            <h3 className="font-semibold text-amber-900">Advanced Reporting</h3>
                          </div>
                          <p className="text-sm text-amber-700 mb-3">
                            Comprehensive analytics, custom reports, and data exports
                          </p>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </CardContent>
                      </Card>
                    </Link>

                  </div>
                  
                  <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-semibold text-amber-900 mb-2">Business Scaling Features</h4>
                    <p className="text-sm text-amber-700">
                      These advanced features provide enterprise-grade capabilities for scaling your delivery operations, 
                      improving customer satisfaction, and optimizing business performance.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Admin Support Modal */}
        <AdminSupportModal
          isOpen={showAdminSupportModal}
          onClose={() => setShowAdminSupportModal(false)}
          context={supportContext}
        />

        {/* Contact Support Button */}
        <ContactSupportButton 
          context={{ type: 'customer', id: 'ADMIN', name: 'Admin User' }}
        />
        </div>
      </div>
  );
}
