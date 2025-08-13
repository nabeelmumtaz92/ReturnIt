import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageCircle,
  Plus,
  Search,
  Filter,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  Send,
  Paperclip,
  Phone,
  Mail,
  Calendar,
  Tag,
  Eye
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarContent, AvatarFallback } from '@/components/ui/avatar';

interface SupportTicket {
  id: number;
  userId: number | null;
  orderId: string | null;
  category: string;
  priority: string;
  status: string;
  subject: string;
  description: string;
  assignedAgent: number | null;
  tags: string[];
  customerName: string | null;
  customerEmail: string | null;
  resolution: string | null;
  customerSatisfaction: number | null;
  timeToResolution: number | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  messages: TicketMessage[];
}

interface TicketMessage {
  id: number;
  senderId: number;
  senderName: string;
  message: string;
  messageType: string;
  isInternal: boolean;
  createdAt: string;
}

interface NewTicketForm {
  userId: number | null;
  orderId: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
  tags: string[];
}

export default function CustomerServiceTickets() {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  const [newTicketForm, setNewTicketForm] = useState<NewTicketForm>({
    userId: null,
    orderId: '',
    category: 'general',
    priority: 'medium',
    subject: '',
    description: '',
    tags: [],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery<SupportTicket[]>({
    queryKey: ['/api/support/tickets'],
  });

  const { data: agents } = useQuery({
    queryKey: ['/api/support/agents'],
  });

  const filteredTickets = useMemo(() => {
    if (!tickets) return [];
    
    return tickets.filter(ticket => {
      const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || ticket.category === filterCategory;
      const matchesSearch = searchQuery === '' || 
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [tickets, filterStatus, filterCategory, searchQuery]);

  const createTicket = useMutation({
    mutationFn: async (ticketData: NewTicketForm) => {
      return await apiRequest('POST', '/api/support/tickets', ticketData);
    },
    onSuccess: () => {
      toast({
        title: "Ticket Created",
        description: "Support ticket has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets'] });
      setShowNewTicket(false);
      setNewTicketForm({
        userId: null,
        orderId: '',
        category: 'general',
        priority: 'medium',
        subject: '',
        description: '',
        tags: [],
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

  const sendReply = useMutation({
    mutationFn: async ({ ticketId, message, isInternal }: { ticketId: number; message: string; isInternal: boolean }) => {
      return await apiRequest('POST', `/api/support/tickets/${ticketId}/messages`, {
        message,
        isInternal,
      });
    },
    onSuccess: () => {
      toast({
        title: "Reply Sent",
        description: "Your message has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets'] });
      setReplyMessage('');
    },
  });

  const updateTicketStatus = useMutation({
    mutationFn: async ({ ticketId, status, assignedAgent }: { ticketId: number; status?: string; assignedAgent?: number }) => {
      return await apiRequest('PUT', `/api/support/tickets/${ticketId}`, {
        ...(status && { status }),
        ...(assignedAgent !== undefined && { assignedAgent }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets'] });
    },
  });

  const getStatusColor = (status: string) => {
    const colors = {
      'open': 'bg-blue-500 text-white',
      'in_progress': 'bg-yellow-500 text-white',
      'waiting': 'bg-orange-500 text-white',
      'resolved': 'bg-green-500 text-white',
      'closed': 'bg-gray-500 text-white',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'urgent': 'bg-red-500 text-white',
      'high': 'bg-orange-500 text-white',
      'medium': 'bg-yellow-500 text-white',
      'low': 'bg-green-500 text-white',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'technical': <AlertTriangle className="h-4 w-4" />,
      'payment': <Star className="h-4 w-4" />,
      'delivery': <CheckCircle className="h-4 w-4" />,
      'general': <MessageCircle className="h-4 w-4" />,
    };
    return icons[category as keyof typeof icons] || <MessageCircle className="h-4 w-4" />;
  };

  const getTicketStats = () => {
    if (!tickets) return { total: 0, open: 0, inProgress: 0, resolved: 0, avgResolutionTime: 0 };
    
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in_progress').length;
    const resolved = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
    const avgResolutionTime = Math.round(
      tickets
        .filter(t => t.timeToResolution)
        .reduce((acc, t) => acc + (t.timeToResolution || 0), 0) / 
      tickets.filter(t => t.timeToResolution).length || 0
    );
    
    return { total, open, inProgress, resolved, avgResolutionTime };
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Loading customer service dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = getTicketStats();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customer Service Tickets</h1>
          <p className="text-gray-600 mt-1">Manage support requests and customer communications</p>
        </div>
        <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" data-testid="button-create-ticket">
              <Plus className="h-4 w-4" />
              Create Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ticket-category">Category</Label>
                  <Select 
                    value={newTicketForm.category}
                    onValueChange={(value) => setNewTicketForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger data-testid="select-ticket-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="payment">Payment Issue</SelectItem>
                      <SelectItem value="delivery">Delivery Issue</SelectItem>
                      <SelectItem value="general">General Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticket-priority">Priority</Label>
                  <Select 
                    value={newTicketForm.priority}
                    onValueChange={(value) => setNewTicketForm(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger data-testid="select-ticket-priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ticket-order-id">Related Order ID (Optional)</Label>
                <Input
                  id="ticket-order-id"
                  value={newTicketForm.orderId}
                  onChange={(e) => setNewTicketForm(prev => ({ ...prev, orderId: e.target.value }))}
                  placeholder="e.g., ORD-123456"
                  data-testid="input-ticket-order-id"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ticket-subject">Subject</Label>
                <Input
                  id="ticket-subject"
                  value={newTicketForm.subject}
                  onChange={(e) => setNewTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of the issue"
                  data-testid="input-ticket-subject"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ticket-description">Description</Label>
                <Textarea
                  id="ticket-description"
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the issue or request"
                  rows={4}
                  data-testid="textarea-ticket-description"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewTicket(false)}
                  data-testid="button-cancel-create-ticket"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => createTicket.mutate(newTicketForm)}
                  disabled={!newTicketForm.subject || !newTicketForm.description || createTicket.isPending}
                  data-testid="button-confirm-create-ticket"
                >
                  {createTicket.isPending ? "Creating..." : "Create Ticket"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{stats.open}</p>
            <p className="text-sm text-gray-600">Open</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{stats.inProgress}</p>
            <p className="text-sm text-gray-600">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{stats.resolved}</p>
            <p className="text-sm text-gray-600">Resolved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{stats.avgResolutionTime}h</p>
            <p className="text-sm text-gray-600">Avg Resolution</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tickets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tickets" data-testid="tab-tickets">All Tickets</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          <TabsTrigger value="knowledge" data-testid="tab-knowledge">Knowledge Base</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Support Tickets</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search tickets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-tickets"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32" data-testid="select-filter-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="waiting">Waiting</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-32" data-testid="select-filter-category">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">#{ticket.id}</p>
                            <p className="text-sm text-gray-600 max-w-xs truncate">{ticket.subject}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{ticket.customerName || 'Unknown'}</p>
                            <p className="text-sm text-gray-600">{ticket.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(ticket.category)}
                            <span className="capitalize">{ticket.category}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ticket.assignedAgent ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {ticket.assignedAgent.toString().slice(-2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">Agent {ticket.assignedAgent}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <time className="text-sm text-gray-600">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </time>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedTicket(ticket)}
                              data-testid={`button-view-ticket-${ticket.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Select 
                              value={ticket.status}
                              onValueChange={(status) => updateTicketStatus.mutate({ ticketId: ticket.id, status })}
                            >
                              <SelectTrigger className="w-24" data-testid={`select-status-${ticket.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="waiting">Waiting</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
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

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['technical', 'payment', 'delivery', 'general'].map(category => {
                    const count = tickets?.filter(t => t.category === category).length || 0;
                    const percentage = tickets?.length ? (count / tickets.length) * 100 : 0;
                    return (
                      <div key={category} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category)}
                          <span className="capitalize">{category}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{count}</span>
                          <span className="text-sm text-gray-600 ml-2">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">First Response:</span>
                    <span className="font-medium">2.5h avg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Resolution Time:</span>
                    <span className="font-medium">{stats.avgResolutionTime}h avg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">4.2/5.0</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="knowledge">
          <Card>
            <CardContent className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="font-medium mb-2">Knowledge Base Management</p>
              <p className="text-sm text-gray-600 mb-4">
                Create and manage FAQ articles, troubleshooting guides, and customer resources.
              </p>
              <Button data-testid="button-manage-knowledge-base">
                <Plus className="h-4 w-4 mr-2" />
                Add Knowledge Article
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Ticket #{selectedTicket.id}: {selectedTicket.subject}</span>
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(selectedTicket.priority)}>
                    {selectedTicket.priority}
                  </Badge>
                  <Badge className={getStatusColor(selectedTicket.status)}>
                    {selectedTicket.status.replace('_', ' ')}
                  </Badge>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Ticket Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Customer:</span>
                  <span className="ml-2 font-medium">{selectedTicket.customerName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium">{selectedTicket.customerEmail}</span>
                </div>
                <div>
                  <span className="text-gray-600">Order ID:</span>
                  <span className="ml-2 font-medium">{selectedTicket.orderId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-2 font-medium">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Original Message */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Original Request</h3>
                <p className="text-sm text-gray-700">{selectedTicket.description}</p>
              </div>

              {/* Messages Thread */}
              <div className="space-y-4">
                <h3 className="font-semibold">Conversation History</h3>
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {selectedTicket.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.isInternal 
                          ? 'bg-yellow-50 border-l-4 border-yellow-400' 
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{message.senderName}</span>
                          {message.isInternal && (
                            <Badge variant="outline" className="text-xs">Internal</Badge>
                          )}
                        </div>
                        <time className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleString()}
                        </time>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Form */}
              <div className="border-t pt-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="internal-note"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="internal-note" className="text-sm">Internal note (not visible to customer)</Label>
                  </div>
                  <Textarea
                    placeholder={isInternalNote ? "Add internal note..." : "Type your reply to the customer..."}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={3}
                    data-testid="textarea-ticket-reply"
                  />
                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Paperclip className="h-4 w-4 mr-1" />
                        Attach
                      </Button>
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    </div>
                    <Button
                      onClick={() => sendReply.mutate({ 
                        ticketId: selectedTicket.id, 
                        message: replyMessage, 
                        isInternal: isInternalNote 
                      })}
                      disabled={!replyMessage.trim() || sendReply.isPending}
                      data-testid="button-send-reply"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {sendReply.isPending ? "Sending..." : "Send Reply"}
                    </Button>
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