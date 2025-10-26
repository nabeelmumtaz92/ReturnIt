import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth-simple';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Bell, 
  BellOff, 
  Trash2, 
  CheckCircle, 
  Circle,
  Package,
  Truck,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Filter,
  ChevronDown,
  Mail,
  MessageSquare
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BrandLogo } from '@/components/BrandLogo';
import { Link } from 'wouter';

interface Notification {
  id: number;
  userId: number;
  type: 'order_update' | 'driver_assigned' | 'pickup_complete' | 'refund_processed' | 'general';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  orderId?: number;
}

export default function CustomerNotifications() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Fetch notifications
  const { data: notifications = [], isLoading, refetch } = useQuery<Notification[]>({
    queryKey: ['/api/customers/notifications'],
    enabled: isAuthenticated,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return apiRequest('PATCH', `/api/customers/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers/notifications'] });
    },
  });

  // Mark as unread mutation
  const markAsUnreadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return apiRequest('PATCH', `/api/customers/notifications/${notificationId}/unread`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers/notifications'] });
    },
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return apiRequest('DELETE', `/api/customers/notifications/${notificationId}`);
    },
    onSuccess: () => {
      toast({
        title: "Notification Deleted",
        description: "The notification has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/customers/notifications'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/customers/notifications/mark-all-read');
    },
    onSuccess: () => {
      toast({
        title: "All Marked as Read",
        description: "All notifications have been marked as read.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/customers/notifications'] });
    },
  });

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  // Get icon for notification type
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order_update':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'driver_assigned':
        return <Truck className="h-5 w-5 text-green-600" />;
      case 'pickup_complete':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'refund_processed':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <div className="container mx-auto p-6 max-w-4xl">
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Please Sign In</h2>
              <p className="text-gray-600 mb-4">You need to sign in to view your notifications</p>
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto p-4 flex items-center justify-between">
          <Link href="/customer-dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              ← Back to Dashboard
            </Button>
          </Link>
          <BrandLogo size="sm" />
          <div className="w-32" /> {/* Spacer for alignment */}
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-4xl">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Bell className="h-8 w-8 text-amber-600" />
                Notifications
              </h1>
              <p className="text-gray-600 mt-1">
                {unreadCount > 0 ? (
                  <span className="font-semibold text-amber-600">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </span>
                ) : (
                  'All caught up!'
                )}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="gap-2"
                data-testid="button-refresh-notifications"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>

              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  className="gap-2"
                  data-testid="button-mark-all-read"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark All Read
                </Button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              data-testid="filter-all"
            >
              All ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
              data-testid="filter-unread"
            >
              Unread ({unreadCount})
            </Button>
            <Button
              variant={filter === 'read' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('read')}
              data-testid="filter-read"
            >
              Read ({notifications.length - unreadCount})
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse flex gap-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BellOff className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filter === 'unread' ? 'No Unread Notifications' : 'No Notifications'}
              </h3>
              <p className="text-gray-600">
                {filter === 'unread' 
                  ? "You're all caught up! Check back later for updates."
                  : "You don't have any notifications yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`transition-all hover:shadow-md ${
                  notification.isRead ? 'bg-white' : 'bg-amber-50 border-amber-200'
                }`}
                data-testid={`notification-${notification.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          {notification.title}
                          {!notification.isRead && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                              New
                            </Badge>
                          )}
                        </h3>
                        <span className="text-sm text-gray-500 flex-shrink-0 ml-2">
                          {formatTimestamp(notification.createdAt)}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-2">
                        {notification.message}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {notification.orderId && (
                          <Link href={`/tracking?trackingNumber=${notification.orderId}`}>
                            <Button variant="link" size="sm" className="h-auto p-0 text-amber-600">
                              View Order →
                            </Button>
                          </Link>
                        )}

                        <div className="flex-1" />

                        {notification.isRead ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsUnreadMutation.mutate(notification.id)}
                            className="gap-2"
                            data-testid={`button-mark-unread-${notification.id}`}
                          >
                            <Circle className="h-3 w-3" />
                            Mark Unread
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                            className="gap-2"
                            data-testid={`button-mark-read-${notification.id}`}
                          >
                            <CheckCircle className="h-3 w-3" />
                            Mark Read
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(notification.id)}
                          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-delete-${notification.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
