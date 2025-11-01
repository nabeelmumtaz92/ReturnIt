import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "driver" | "order" | "payment" | "verification";
}

export default function StatusBadge({ status, variant = "default" }: StatusBadgeProps) {
  const getStatusConfig = () => {
    const normalizedStatus = status.toLowerCase();
    
    // Driver status badges
    if (variant === "driver") {
      const driverStatusMap: Record<string, { className: string }> = {
        active: { className: 'bg-green-100 text-green-700' },
        inactive: { className: 'bg-gray-100 text-gray-700' },
        suspended: { className: 'bg-orange-100 text-orange-700' },
        deactivated: { className: 'bg-red-100 text-red-700' },
        pending: { className: 'bg-yellow-100 text-yellow-700' },
      };
      return driverStatusMap[normalizedStatus] || { className: 'bg-gray-100 text-gray-700' };
    }
    
    // Verification status badges
    if (variant === "verification") {
      const verificationStatusMap: Record<string, { className: string }> = {
        verified: { className: 'bg-green-100 text-green-700' },
        pending: { className: 'bg-yellow-100 text-yellow-700' },
        failed: { className: 'bg-red-100 text-red-700' },
        'not started': { className: 'bg-gray-100 text-gray-700' },
      };
      return verificationStatusMap[normalizedStatus] || { className: 'bg-gray-100 text-gray-700' };
    }
    
    // Order status badges
    if (variant === "order") {
      const orderStatusMap: Record<string, { className: string }> = {
        pending: { className: 'bg-yellow-100 text-yellow-700' },
        assigned: { className: 'bg-blue-100 text-blue-700' },
        'in progress': { className: 'bg-purple-100 text-purple-700' },
        completed: { className: 'bg-green-100 text-green-700' },
        cancelled: { className: 'bg-red-100 text-red-700' },
      };
      return orderStatusMap[normalizedStatus] || { className: 'bg-gray-100 text-gray-700' };
    }
    
    // Payment status badges
    if (variant === "payment") {
      const paymentStatusMap: Record<string, { className: string }> = {
        completed: { className: 'bg-green-100 text-green-700' },
        pending: { className: 'bg-yellow-100 text-yellow-700' },
        failed: { className: 'bg-red-100 text-red-700' },
        refunded: { className: 'bg-orange-100 text-orange-700' },
      };
      return paymentStatusMap[normalizedStatus] || { className: 'bg-gray-100 text-gray-700' };
    }
    
    // Default status badges
    const defaultStatusMap: Record<string, { className: string }> = {
      active: { className: 'bg-green-100 text-green-700' },
      inactive: { className: 'bg-gray-100 text-gray-700' },
      pending: { className: 'bg-yellow-100 text-yellow-700' },
      completed: { className: 'bg-green-100 text-green-700' },
      failed: { className: 'bg-red-100 text-red-700' },
      cancelled: { className: 'bg-red-100 text-red-700' },
    };
    return defaultStatusMap[normalizedStatus] || { className: 'bg-gray-100 text-gray-700' };
  };

  const config = getStatusConfig();
  
  return (
    <Badge className={config.className} data-testid={`badge-${status.toLowerCase()}`}>
      {status.toUpperCase()}
    </Badge>
  );
}
