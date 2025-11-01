import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface PerformanceCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  testId?: string;
}

export default function PerformanceCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBgColor = "bg-blue-100",
  trend,
  testId,
}: PerformanceCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`${iconBgColor} p-3 rounded-full`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold" data-testid={testId || `metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
                {value}
              </p>
              {trend && (
                <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
