import { useState, useEffect, useRef, type MouseEvent, type TouchEvent } from 'react';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeToAcceptProps {
  onAccept: () => void;
  onTimeout?: () => void;
  timeoutSeconds?: number;
  disabled?: boolean;
  orderId: string;
}

export function SwipeToAccept({ 
  onAccept, 
  onTimeout,
  timeoutSeconds = 60,
  disabled = false,
  orderId 
}: SwipeToAcceptProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeoutSeconds);
  const [isExpired, setIsExpired] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);

  const SWIPE_THRESHOLD = 0.85; // 85% swipe to accept

  // Countdown timer
  useEffect(() => {
    if (disabled || isExpired) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          if (onTimeout) onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [disabled, isExpired, onTimeout]);

  const getMaxSwipeDistance = () => {
    if (!containerRef.current) return 0;
    const containerWidth = containerRef.current.offsetWidth;
    const sliderWidth = 80; // Width of the slider button
    return containerWidth - sliderWidth - 8; // 8px padding
  };

  const handleStart = (clientX: number) => {
    if (disabled || isExpired) return;
    setIsDragging(true);
    startXRef.current = clientX;
    currentXRef.current = position;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || disabled || isExpired) return;

    const maxDistance = getMaxSwipeDistance();
    const diff = clientX - startXRef.current;
    const newPosition = Math.max(0, Math.min(maxDistance, currentXRef.current + diff));
    
    setPosition(newPosition);

    // Check if swiped far enough
    if (newPosition >= maxDistance * SWIPE_THRESHOLD) {
      handleAccept();
    }
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const maxDistance = getMaxSwipeDistance();
    
    // If not swiped far enough, reset
    if (position < maxDistance * SWIPE_THRESHOLD) {
      setPosition(0);
    }
  };

  const handleAccept = () => {
    setIsDragging(false);
    onAccept();
  };

  // Mouse events
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: globalThis.MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) handleEnd();
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  const progressPercentage = (position / getMaxSwipeDistance()) * 100;

  return (
    <div className="space-y-2">
      {/* Timer Display */}
      <div className="flex items-center justify-between text-sm">
        <span className={cn(
          "font-medium",
          timeLeft <= 10 ? "text-red-600 animate-pulse" : "text-[#8B6F47]"
        )}>
          {isExpired ? "Offer Expired" : `${timeLeft}s remaining`}
        </span>
        <span className="text-[#A0805A]">
          Swipe to accept →
        </span>
      </div>

      {/* Swipe Container */}
      <div
        ref={containerRef}
        className={cn(
          "relative h-16 rounded-full overflow-hidden select-none touch-none",
          "bg-gradient-to-r from-[#B8956A]/20 to-[#8B6F47]/20",
          "border-2 border-[#D4C4A8]",
          isExpired && "opacity-50 cursor-not-allowed",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        data-testid={`swipe-container-${orderId}`}
      >
        {/* Progress Background */}
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-green-500 transition-all duration-100"
          style={{ width: `${progressPercentage}%` }}
        />

        {/* Swipe Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className={cn(
            "font-semibold text-base transition-opacity duration-200",
            progressPercentage > 30 ? "text-white" : "text-[#8B6F47]"
          )}>
            {isExpired ? "Offer Expired" : "Swipe to Accept Job"}
          </span>
        </div>

        {/* Slider Button */}
        <div
          className={cn(
            "absolute top-1 left-1 h-14 w-20 rounded-full",
            "bg-white shadow-lg flex items-center justify-center",
            "cursor-grab active:cursor-grabbing",
            "transition-shadow duration-200",
            isDragging && "shadow-xl",
            (disabled || isExpired) && "cursor-not-allowed"
          )}
          style={{
            transform: `translateX(${position}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          data-testid={`swipe-button-${orderId}`}
        >
          {progressPercentage > 80 ? (
            <CheckCircle className="h-8 w-8 text-green-600" />
          ) : (
            <ChevronRight className="h-8 w-8 text-[#B8956A]" />
          )}
        </div>
      </div>

      {/* Helper Text */}
      {!isExpired && (
        <p className="text-xs text-center text-[#A0805A]">
          Drag the slider all the way to the right to accept this delivery
        </p>
      )}
    </div>
  );
}
