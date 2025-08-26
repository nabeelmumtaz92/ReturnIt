import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";

interface Notification {
  id: number;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  time: string;
  type: string;
}

export default function NotificationBell() {
  // Query for notifications to check for unread ones
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Count unread notifications - only show red dot for important ones
  const unreadCount = notifications.filter(notification => 
    !notification.read && 
    (notification.priority === 'high' || notification.priority === 'medium')
  ).length;

  return (
    <Button variant="ghost" size="sm" className="relative">
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
      )}
      <span className="sr-only">
        {unreadCount > 0 ? `${unreadCount} unread notifications` : 'No unread notifications'}
      </span>
    </Button>
  );
}