import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Headphones, MessageCircle, Clock, CheckCircle, AlertTriangle,
  User, Phone, Mail, Search, Filter, Calendar, BarChart3,
  Package, Truck, DollarSign, Users, Star, TrendingUp, Bell
} from 'lucide-react';
import { useAuth } from "@/hooks/useAuth-simple";
import { useToast } from "@/hooks/use-toast";
import { ReturnItLogo } from '@/components/LogoIcon';
import { RoleBasedLayout } from '@/components/RoleBasedLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SupportTicket {
  id: string;
  customer: string;
  email: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved';
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  category: string;
}

interface EmployeeDashboardProps {
  role?: string;
}

export default function EmployeeDashboard({ role = 'support' }: EmployeeDashboardProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for support tickets
  useEffect(() => {
    setTickets([
      {
        id: 'TICK001',
        customer: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        subject: 'Order tracking not updating',
        priority: 'high',
        status: 'open',
        assignedTo: 'You',
        createdAt: '2024-01-15 10:30 AM',
        updatedAt: '2024-01-15 10:30 AM',
        category: 'Technical Issue'
      },
      {
        id: 'TICK002',
        customer: 'Mike Rodriguez',
        email: 'mike.r@email.com',
        subject: 'Pickup was missed yesterday',
        priority: 'medium',
        status: 'in-progress',
        assignedTo: 'You',
        createdAt: '2024-01-15 09:15 AM',
        updatedAt: '2024-01-15 11:20 AM',
        category: 'Service Issue'
      },
      {
        id: 'TICK003',
        customer: 'Jennifer Lee',
        email: 'jen.lee@email.com',
        subject: 'Refund request for cancelled order',
        priority: 'low',
        status: 'resolved',
        assignedTo: 'You',
        createdAt: '2024-01-14 02:45 PM',
        updatedAt: '2024-01-15 08:30 AM',
        category: 'Billing'
      },
      {
        id: 'TICK004',
        customer: 'Robert Chen',
        email: 'rob.chen@email.com',
        subject: 'Driver was rude during pickup',
        priority: 'high',
        status: 'in-progress',
        assignedTo: 'You',
        createdAt: '2024-01-15 08:20 AM',
        updatedAt: '2024-01-15 10:15 AM',
        category: 'Service Quality'
      }
    ]);
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesSearch = ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Customer Support Specialist Dashboard
  if (role === 'support') {
    return (
      <RoleBasedLayout 
        userRole="support" 
        userName={user?.firstName || 'Support Specialist'}
        pageTitle="Customer Support Dashboard"
      >
        <div className="space-y-6">

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-600 text-sm font-medium">Open Tickets</p>
                    <p className="text-2xl font-bold text-amber-900">
                      {tickets.filter(t => t.status === 'open').length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-xs text-amber-700 mt-2">Requires immediate attention</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-600 text-sm font-medium">In Progress</p>
                    <p className="text-2xl font-bold text-amber-900">
                      {tickets.filter(t => t.status === 'in-progress').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <p className="text-xs text-amber-700 mt-2">Currently working on</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-600 text-sm font-medium">Resolved Today</p>
                    <p className="text-2xl font-bold text-amber-900">
                      {tickets.filter(t => t.status === 'resolved').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-xs text-amber-700 mt-2">Great job!</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-600 text-sm font-medium">Avg Response</p>
                    <p className="text-2xl font-bold text-amber-900">12min</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-xs text-amber-700 mt-2">Below 15min target</p>
              </CardContent>
            </Card>
          </div>

          {/* Support Tickets Management */}
          <Card className="bg-white border-amber-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-amber-900 flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Support Tickets
                </CardTitle>
                <Button className="bg-amber-600 hover:bg-amber-700">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 h-4 w-4" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-amber-300 focus:border-amber-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterStatus === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('all')}
                    className={filterStatus === 'all' ? 'bg-amber-600' : 'border-amber-300'}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterStatus === 'open' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('open')}
                    className={filterStatus === 'open' ? 'bg-amber-600' : 'border-amber-300'}
                  >
                    Open
                  </Button>
                  <Button
                    variant={filterStatus === 'in-progress' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('in-progress')}
                    className={filterStatus === 'in-progress' ? 'bg-amber-600' : 'border-amber-300'}
                  >
                    In Progress
                  </Button>
                  <Button
                    variant={filterStatus === 'resolved' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('resolved')}
                    className={filterStatus === 'resolved' ? 'bg-amber-600' : 'border-amber-300'}
                  >
                    Resolved
                  </Button>
                </div>
              </div>

              {/* Tickets Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-amber-200">
                      <TableHead className="font-semibold text-amber-900">Ticket ID</TableHead>
                      <TableHead className="font-semibold text-amber-900">Customer</TableHead>
                      <TableHead className="font-semibold text-amber-900">Subject</TableHead>
                      <TableHead className="font-semibold text-amber-900">Priority</TableHead>
                      <TableHead className="font-semibold text-amber-900">Status</TableHead>
                      <TableHead className="font-semibold text-amber-900">Category</TableHead>
                      <TableHead className="font-semibold text-amber-900">Created</TableHead>
                      <TableHead className="font-semibold text-amber-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id} className="hover:bg-amber-50/50 border-amber-100">
                        <TableCell className="font-medium">{ticket.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{ticket.customer}</div>
                            <div className="text-sm text-amber-600">{ticket.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{ticket.subject}</TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{ticket.category}</TableCell>
                        <TableCell className="text-sm">{ticket.createdAt}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline" className="h-7 border-amber-300">
                              View
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 border-green-300 text-green-700">
                              Reply
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredTickets.length === 0 && (
                <div className="text-center py-8 text-amber-600">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-amber-400" />
                  <p className="text-lg font-medium">No tickets found</p>
                  <p className="text-sm">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </RoleBasedLayout>
    );
  }

  // Default employee dashboard (can be extended for other roles)
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className="container mx-auto p-6">
        <Card className="bg-white border-amber-200">
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-amber-600" />
            <h2 className="text-xl font-semibold text-amber-900 mb-2">Employee Dashboard</h2>
            <p className="text-amber-700">Dashboard configuration for role: {role}</p>
            <Button 
              className="mt-4 bg-amber-600 hover:bg-amber-700"
              onClick={() => setLocation('/employee-guide')}
            >
              View Employee Guide
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}