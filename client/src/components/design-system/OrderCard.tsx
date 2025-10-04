import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { Stepper } from './Chip';
import { MapPin, Calendar, Package } from 'lucide-react';

// Customer Order Card
export interface CustomerOrderCardProps {
  id: string;
  retailer: string;
  address: string; 
  status: 'created' | 'assigned' | 'picked_up' | 'dropped_off' | 'completed';
  createdAt: Date;
  price?: number;
  onAdvance?: () => void;
  onComplete?: () => void;
  className?: string;
}

const CustomerOrderCard = memo(React.forwardRef<HTMLDivElement, CustomerOrderCardProps>(
  ({ 
    id, 
    retailer, 
    address, 
    status, 
    createdAt, 
    price, 
    onAdvance, 
    onComplete, 
    className 
  }, ref) => {
    return (
      <Card ref={ref} className={cn("space-y-4", className)}>
        <CardContent className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-[22px] leading-[28px] font-bold text-[#1A1A1A]">
                {retailer}
              </h3>
              <p className="text-[13px] leading-[18px] text-[#7B5E3B] flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {address}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[13px] leading-[18px] text-[#7B5E3B]">#{id}</p>
              {price && (
                <p className="text-[16px] leading-[24px] font-semibold text-[#1A1A1A]">
                  ${price}
                </p>
              )}
            </div>
          </div>

          {/* Order Info */}
          <div className="flex items-center gap-4 text-[13px] leading-[18px] text-[#7B5E3B]">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {createdAt.toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              Return
            </span>
          </div>

          {/* Status Stepper */}
          <div>
            <p className="text-[13px] leading-[18px] font-medium text-[#1A1A1A] mb-2">
              Status
            </p>
            <Stepper currentStatus={status} />
          </div>

          {/* Actions */}
          {status !== 'completed' && (
            <div className="flex gap-2 pt-2">
              {onAdvance && status !== 'dropped_off' && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={onAdvance}
                  className="flex-1"
                >
                  Advance (Demo)
                </Button>
              )}
              {onComplete && status === 'dropped_off' && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={onComplete}
                  className="flex-1"
                >
                  Complete
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
));
CustomerOrderCard.displayName = "CustomerOrderCard";

// Driver Job Card  
export interface DriverJobCardProps {
  id: string;
  retailer: string;
  address: string;
  status: 'available' | 'accepted' | 'picked_up' | 'dropped_off';
  estimatedEarning?: number;
  distance?: string;
  onAccept?: () => void;
  onPickup?: () => void;
  onDropoff?: () => void;
  className?: string;
}

const DriverJobCard = memo(React.forwardRef<HTMLDivElement, DriverJobCardProps>(
  ({ 
    id, 
    retailer, 
    address, 
    status, 
    estimatedEarning, 
    distance, 
    onAccept, 
    onPickup, 
    onDropoff, 
    className 
  }, ref) => {
    const getStatusColor = (status: string) => {
      switch(status) {
        case 'available': return 'text-[#FF8C42]';
        case 'accepted': return 'text-[#7B5E3B]'; 
        case 'picked_up': return 'text-[#2E7D32]';
        case 'dropped_off': return 'text-[#2E7D32]';
        default: return 'text-[#7B5E3B]';
      }
    };

    return (
      <Card ref={ref} className={cn("space-y-4", className)}>
        <CardContent className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-[22px] leading-[28px] font-bold text-[#1A1A1A]">
                #{id} • {retailer}
              </h3>
              <p className="text-[13px] leading-[18px] text-[#7B5E3B] flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {address}
              </p>
            </div>
            <div className="text-right">
              {estimatedEarning && (
                <p className="text-[16px] leading-[24px] font-semibold text-[#2E7D32]">
                  +${estimatedEarning}
                </p>
              )}
              {distance && (
                <p className="text-[13px] leading-[18px] text-[#7B5E3B]">
                  {distance} away
                </p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className={cn(
              "text-[13px] leading-[18px] font-semibold capitalize",
              getStatusColor(status)
            )}>
              {status.replace('_', ' ')}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {status === 'available' && onAccept && (
              <Button 
                variant="primary" 
                onClick={onAccept}
                className="flex-1"
              >
                Accept Job
              </Button>
            )}
            {status === 'accepted' && onPickup && (
              <Button 
                variant="primary" 
                onClick={onPickup}
                className="flex-1"
              >
                Mark Picked Up
              </Button>
            )}
            {status === 'picked_up' && onDropoff && (
              <Button 
                variant="primary" 
                onClick={onDropoff}
                className="flex-1"
              >
                Mark Dropped Off
              </Button>
            )}
            {status === 'dropped_off' && (
              <Button 
                variant="secondary" 
                disabled
                className="flex-1"
              >
                Job Complete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
));
DriverJobCard.displayName = "DriverJobCard";

export { CustomerOrderCard, DriverJobCard };