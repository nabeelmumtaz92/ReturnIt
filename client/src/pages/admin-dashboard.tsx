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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  MessageSquare,
  Menu,
  ExternalLink,
  Mail,
  Terminal
} from 'lucide-react';
import { useAuth } from "@/hooks/useAuth-simple";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminSupportModal from "@/components/AdminSupportModal";
import NotificationBell from "@/components/NotificationBell";
import ContactSupportButton from "@/components/ContactSupportButton";
import { AdminLayout } from "@/components/AdminLayout";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { ReturnItLogo } from '@/components/LogoIcon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CompletedOrdersAnalytics from "@/components/CompletedOrdersAnalytics";
import { AdminContent } from "@/components/AdminContent";
import AIAssistant from "@/components/AIAssistant";
import DeveloperConsole from "@/components/DeveloperConsole";
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

interface AdminDashboardProps {
  section?: string;
}

export default function AdminDashboard({ section }: AdminDashboardProps = {}) {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  
  // Get current section from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const currentSection = urlParams.get('section') || section || 'overview';
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
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showDeveloperConsole, setShowDeveloperConsole] = useState(false);
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
  
  // Messaging system state
  const [showMessagingSystem, setShowMessagingSystem] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailRecipients, setEmailRecipients] = useState<string[]>([]);
  const [showComposeEmail, setShowComposeEmail] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(true); // Simulate unread messages
  const [unreadCount, setUnreadCount] = useState(3);
  
  // Fetch employees from API
  // Disable API calls that require authentication for now
  const employees: any[] = [];
  const employeesLoading = false;

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
        phone: '(636) 254-4821',
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
        phone: '(636) 254-4821',
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
        phone: '(636) 254-4821',
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

  // Function to render section-based content
  const renderSectionContent = () => {
    switch (currentSection) {
      case 'orders':
        return renderOrdersSection();
      case 'drivers':
        return renderDriversSection();
      case 'payments':
        return renderPaymentsSection();
      case 'analytics':
        return renderAnalyticsSection();
      case 'enhanced-analytics':
        return renderEnhancedAnalyticsSection();
      case 'routes':
        return renderRoutesSection();
      case 'quality':
        return renderQualitySection();
      case 'incentives':
        return renderIncentivesSection();
      case 'reporting':
        return renderReportingSection();
      case 'tickets':
        return renderTicketsSection();
      case 'chat':
        return renderChatSection();
      case 'ratings':
        return renderRatingsSection();
      case 'notifications':
        return renderNotificationsSection();
      case 'employees':
        return renderEmployeesSection();
      case 'overview':
      default:
        return renderOverviewSection();
    }
  };

  // Section render functions
  const renderOverviewSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium">Today's Orders</p>
                <p className="text-2xl font-bold text-amber-900">47</p>
              </div>
              <Package className="h-8 w-8 text-amber-600" />
            </div>
            <p className="text-xs text-amber-700 mt-2">+12% from yesterday</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium">Active Drivers</p>
                <p className="text-2xl font-bold text-amber-900">28</p>
              </div>
              <Users className="h-8 w-8 text-amber-600" />
            </div>
            <p className="text-xs text-amber-700 mt-2">3 on break</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium">Revenue Today</p>
                <p className="text-2xl font-bold text-amber-900">$1,847</p>
              </div>
              <DollarSign className="h-8 w-8 text-amber-600" />
            </div>
            <p className="text-xs text-amber-700 mt-2">+8% from yesterday</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium">Avg Rating</p>
                <p className="text-2xl font-bold text-amber-900">4.9</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-600" />
            </div>
            <p className="text-xs text-amber-700 mt-2">98% satisfaction</p>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-white border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col space-y-2"
              onClick={() => window.location.href = '/admin-dashboard?section=orders'}
            >
              <Package className="h-6 w-6 text-amber-600" />
              <span>Manage Orders</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col space-y-2"
              onClick={() => window.location.href = '/admin-dashboard?section=drivers'}
            >
              <Users className="h-6 w-6 text-amber-600" />
              <span>View Drivers</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col space-y-2"
              onClick={() => window.location.href = '/admin-dashboard?section=analytics'}
            >
              <BarChart3 className="h-6 w-6 text-amber-600" />
              <span>Analytics</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col space-y-2"
              onClick={() => window.location.href = '/admin-dashboard?section=chat'}
            >
              <MessageCircle className="h-6 w-6 text-amber-600" />
              <span>Support Chat</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderOrdersSection = () => (
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
              Refresh
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderDriversSection = () => (
    <Card className="bg-white border-amber-200">
      <CardHeader>
        <CardTitle className="text-amber-900">Driver Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Input
              placeholder="Search drivers..."
              value={driverSearchTerm}
              onChange={(e) => setDriverSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={driverStatusFilter} onValueChange={setDriverStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4">
            {drivers.map((driver) => (
              <div key={driver.id} className="p-4 border border-amber-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-amber-900">{driver.name}</h3>
                    <p className="text-sm text-amber-700">{driver.email}</p>
                    <p className="text-xs text-amber-600">{driver.phone}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getDriverStatusIcon(driver.status)}
                    <span className="text-sm font-medium">{driver.status}</span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-amber-600">Orders</p>
                    <p className="font-semibold">{driver.completedOrders}</p>
                  </div>
                  <div>
                    <p className="text-amber-600">Rating</p>
                    <p className="font-semibold">{driver.rating}★</p>
                  </div>
                  <div>
                    <p className="text-amber-600">Earnings</p>
                    <p className="font-semibold">${driver.earnings}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderPaymentsSection = () => (
    <Card className="bg-white border-amber-200">
      <CardHeader>
        <CardTitle className="text-amber-900">Payment Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <p className="text-sm font-medium text-green-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-700">$12,847</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <p className="text-sm font-medium text-blue-600">Driver Payouts</p>
                <p className="text-2xl font-bold text-blue-700">$8,993</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4 text-center">
                <p className="text-sm font-medium text-amber-600">Pending Payouts</p>
                <p className="text-2xl font-bold text-amber-700">$1,254</p>
              </CardContent>
            </Card>
          </div>
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-amber-400" />
            <p className="text-lg font-medium text-amber-900">Payment management system ready</p>
            <p className="text-sm text-amber-700">Track revenue, payouts, and financial metrics</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAnalyticsSection = () => (
    <div className="space-y-6">
      <AnalyticsDashboard />
    </div>
  );

  const renderEnhancedAnalyticsSection = () => (
    <Card className="bg-white border-amber-200">
      <CardHeader>
        <CardTitle className="text-amber-900">Enhanced Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <CompletedOrdersAnalytics completedOrders={getFilteredCompletedOrders() as any} />
      </CardContent>
    </Card>
  );

  // Placeholder sections for other navigation items
  const renderRoutesSection = () => (
    <Card className="bg-white border-amber-200">
      <CardHeader>
        <CardTitle className="text-amber-900">Route Optimization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Truck className="h-12 w-12 mx-auto mb-4 text-amber-400" />
          <p className="text-lg font-medium text-amber-900">Route optimization tools</p>
          <p className="text-sm text-amber-700">Optimize delivery routes for efficiency</p>
        </div>
      </CardContent>
    </Card>
  );

  const renderQualitySection = () => (
    <Card className="bg-white border-amber-200">
      <CardHeader>
        <CardTitle className="text-amber-900">Quality Assurance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Shield className="h-12 w-12 mx-auto mb-4 text-amber-400" />
          <p className="text-lg font-medium text-amber-900">Quality monitoring system</p>
          <p className="text-sm text-amber-700">Monitor service quality and performance</p>
        </div>
      </CardContent>
    </Card>
  );

  const renderIncentivesSection = () => (
    <Card className="bg-white border-amber-200">
      <CardHeader>
        <CardTitle className="text-amber-900">Driver Incentives</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-amber-400" />
          <p className="text-lg font-medium text-amber-900">Incentive management</p>
          <p className="text-sm text-amber-700">Manage driver bonuses and rewards</p>
        </div>
      </CardContent>
    </Card>
  );

  const renderReportingSection = () => (
    <Card className="bg-white border-amber-200">
      <CardHeader>
        <CardTitle className="text-amber-900">Advanced Reporting</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={exportToExcel}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Full Analytics Report
          </Button>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-amber-400" />
            <p className="text-lg font-medium text-amber-900">Financial reports and exports</p>
            <p className="text-sm text-amber-700">Generate detailed business reports</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTicketsSection = () => (
    <Card className="bg-white border-amber-200">
      <CardHeader>
        <CardTitle className="text-amber-900">Customer Service</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-amber-400" />
          <p className="text-lg font-medium text-amber-900">Support ticket management</p>
          <p className="text-sm text-amber-700">Handle customer service requests</p>
        </div>
      </CardContent>
    </Card>
  );

  const renderChatSection = () => (
    <Card className="bg-white border-amber-200">
      <CardHeader>
        <CardTitle className="text-amber-900">Chat Center</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-amber-400" />
          <p className="text-lg font-medium text-amber-900">Live customer support</p>
          <p className="text-sm text-amber-700">Real-time chat with customers</p>
        </div>
      </CardContent>
    </Card>
  );

  const renderRatingsSection = () => (
    <Card className="bg-white border-amber-200">
      <CardHeader>
        <CardTitle className="text-amber-900">Customer Ratings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-amber-400" />
          <p className="text-lg font-medium text-amber-900">Customer feedback system</p>
          <p className="text-sm text-amber-700">Monitor ratings and reviews</p>
        </div>
      </CardContent>
    </Card>
  );

  const renderNotificationsSection = () => (
    <Card className="bg-white border-amber-200">
      <CardHeader>
        <CardTitle className="text-amber-900">Notification Center</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Bell className="h-12 w-12 mx-auto mb-4 text-amber-400" />
          <p className="text-lg font-medium text-amber-900">System notifications</p>
          <p className="text-sm text-amber-700">Manage alerts and notifications</p>
        </div>
      </CardContent>
    </Card>
  );

  const renderEmployeesSection = () => (
    <Card className="bg-white border-amber-200">
      <CardHeader>
        <CardTitle className="text-amber-900">Employee Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <UserCheck className="h-12 w-12 mx-auto mb-4 text-amber-400" />
          <p className="text-lg font-medium text-amber-900">Staff and permissions</p>
          <p className="text-sm text-amber-700">Manage employee access and roles</p>
        </div>
      </CardContent>
    </Card>
  );

  const dashboardTabs = [
    {
      label: "Overview",
      href: "/admin-dashboard",
      current: true
    },
    {
      label: "Payment Tracking", 
      href: "/admin-payment-tracking",
      current: false
    },
    {
      label: "Analytics",
      href: "/enhanced-analytics-dashboard", 
      current: false
    }
  ];

  // If a section is provided, use AdminContent to render it
  if (section) {
    return (
      <AdminLayout pageTitle="Admin Dashboard" tabs={dashboardTabs}>
        <div className="relative z-10">
          <AdminContent section={section} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      pageTitle="Admin Dashboard"
      tabs={dashboardTabs}
    >
      

      <div className="relative z-10">
        {/* Main Content */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
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
            
            {/* AI Development Tools */}
            {user?.isAdmin && (
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={() => setShowAIAssistant(!showAIAssistant)}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
                  data-testid="button-ai-assistant"
                >
                  <Bot className="w-4 h-4 mr-2" />
                  AI Assistant
                </Button>
                
                <Button
                  onClick={() => setShowDeveloperConsole(!showDeveloperConsole)}
                  className="bg-slate-700 hover:bg-slate-800 text-white flex-1"
                  data-testid="button-developer-console"
                >
                  <Terminal className="w-4 h-4 mr-2" />
                  Dev Console
                </Button>
              </div>
            )}
          </div>

          {/* Section-Based Content */}
          <div className="space-y-4 sm:space-y-6">
            {/* Section Header */}
            <div className="bg-white/90 backdrop-blur-sm border border-amber-200 rounded-lg p-4">
              <h1 className="text-2xl font-bold text-amber-900 capitalize">
                {currentSection === 'overview' ? 'Dashboard Overview' : currentSection.replace('-', ' ')}
              </h1>
              <p className="text-amber-700 text-sm mt-1">
                {currentSection === 'overview' && 'Complete system overview and quick actions'}
                {currentSection === 'orders' && 'Manage live orders and delivery tracking'}
                {currentSection === 'drivers' && 'Monitor driver performance and status'}
                {currentSection === 'payments' && 'Track payments, payouts, and financial metrics'}
                {currentSection === 'analytics' && 'Advanced business intelligence and insights'}
                {currentSection === 'enhanced-analytics' && 'Real-time performance metrics and analytics'}
                {currentSection === 'routes' && 'Optimize delivery routes for efficiency'}
                {currentSection === 'quality' && 'Monitor service quality and performance standards'}
                {currentSection === 'incentives' && 'Manage driver bonuses and reward programs'}
                {currentSection === 'reporting' && 'Generate detailed financial and operational reports'}
                {currentSection === 'tickets' && 'Handle customer service requests and support tickets'}
                {currentSection === 'chat' && 'Live customer support and communication'}
                {currentSection === 'ratings' && 'Monitor customer feedback and service ratings'}
                {currentSection === 'notifications' && 'System alerts and notification management'}
                {currentSection === 'employees' && 'Staff management and access control'}
              </p>
            </div>

            {/* Render Section Content */}
            {renderSectionContent()}
          </div>
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

        {/* AI Assistant - Available for admin users */}
        {user?.isAdmin && (
          <AIAssistant 
            isMinimized={!showAIAssistant}
            onClose={() => setShowAIAssistant(!showAIAssistant)}
          />
        )}

        {/* Developer Console - Available for admin users */}
        {user?.isAdmin && (
          <DeveloperConsole 
            isMinimized={!showDeveloperConsole}
            onClose={() => setShowDeveloperConsole(!showDeveloperConsole)}
          />
        )}
      </div>
    </AdminLayout>
  );
}
