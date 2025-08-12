import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  X, 
  Package, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Truck,
  MessageCircle
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'order' | 'payment' | 'alert' | 'message' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  urgent: boolean;
}

interface NotificationBellProps {
  userType: 'admin' | 'driver' | 'customer';
}

export default function NotificationBell({ userType }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (userType === 'admin') {
      return [
        {
          id: '1',
          type: 'alert',
          title: 'Driver Issue',
          message: 'Driver #D001 reported customer not available',
          timestamp: new Date(Date.now() - 300000),
          read: false,
          urgent: true
        },
        {
          id: '2',
          type: 'order',
          title: 'New Pickup Request',
          message: '5 new pickup requests from Premium customers',
          timestamp: new Date(Date.now() - 600000),
          read: false,
          urgent: false
        },
        {
          id: '3',
          type: 'payment',
          title: 'Payout Complete',
          message: 'Weekly payouts to 12 drivers processed successfully',
          timestamp: new Date(Date.now() - 900000),
          read: true,
          urgent: false
        },
        {
          id: '4',
          type: 'system',
          title: 'System Update',
          message: 'Platform maintenance scheduled for tonight 2-4 AM',
          timestamp: new Date(Date.now() - 1200000),
          read: true,
          urgent: false
        }
      ];
    } else if (userType === 'driver') {
      return [
        {
          id: '1',
          type: 'order',
          title: 'New Pickup Available',
          message: 'Premium pickup in Clayton - $25 payout',
          timestamp: new Date(Date.now() - 180000),
          read: false,
          urgent: true
        },
        {
          id: '2',
          type: 'payment',
          title: 'Payment Received',
          message: 'Instant payout of $87.50 has been transferred',
          timestamp: new Date(Date.now() - 480000),
          read: false,
          urgent: false
        },
        {
          id: '3',
          type: 'message',
          title: 'Customer Message',
          message: 'Customer updated delivery instructions',
          timestamp: new Date(Date.now() - 720000),
          read: true,
          urgent: false
        }
      ];
    } else {
      return [
        {
          id: '1',
          type: 'order',
          title: 'Pickup Confirmed',
          message: 'Your driver is on the way. ETA: 15 minutes',
          timestamp: new Date(Date.now() - 120000),
          read: false,
          urgent: false
        },
        {
          id: '2',
          type: 'order',
          title: 'Return Processed',
          message: 'Your return has been delivered to the retailer',
          timestamp: new Date(Date.now() - 3600000),
          read: true,
          urgent: false
        }
      ];
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => !n.read && n.urgent).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'message': return <MessageCircle className="h-4 w-4" />;
      case 'system': return <CheckCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string, urgent: boolean) => {
    if (urgent) return 'text-red-600';
    switch (type) {
      case 'order': return 'text-blue-600';
      case 'payment': return 'text-green-600';
      case 'alert': return 'text-orange-600';
      case 'message': return 'text-purple-600';
      case 'system': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge className={`absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs ${
            urgentCount > 0 ? 'bg-red-500' : 'bg-amber-600'
          }`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50">
          <Card className="w-96 shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      Mark All Read
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  {urgentCount > 0 && (
                    <span className="text-red-600 font-medium">
                      {' '}• {urgentCount} urgent
                    </span>
                  )}
                </p>
              )}
            </CardHeader>

            <CardContent className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No notifications
                </p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        notification.read
                          ? 'bg-gray-50 border-gray-200'
                          : notification.urgent
                          ? 'bg-red-50 border-red-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={getNotificationColor(notification.type, notification.urgent)}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className={`text-sm font-medium ${
                                notification.read ? 'text-gray-700' : 'text-gray-900'
                              }`}>
                                {notification.title}
                              </h4>
                              {notification.urgent && !notification.read && (
                                <Badge className="bg-red-100 text-red-800 text-xs">
                                  Urgent
                                </Badge>
                              )}
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                            <p className={`text-sm mt-1 ${
                              notification.read ? 'text-gray-500' : 'text-gray-600'
                            }`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {notification.timestamp.toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}