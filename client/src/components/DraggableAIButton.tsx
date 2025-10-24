import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';

interface DraggableAIButtonProps {
  onClick: () => void;
}

export function DraggableAIButton({ onClick }: DraggableAIButtonProps) {
  const [position, setPosition] = useState({ x: window.innerWidth - 120, y: window.innerHeight - 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);
  const shouldIgnoreNextClick = useRef(false);
  const resetTimeoutId = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        
        // Calculate total distance moved
        const totalDistance = Math.sqrt(
          Math.pow(e.clientX - initialPosition.x, 2) + 
          Math.pow(e.clientY - initialPosition.y, 2)
        );
        
        // If moved more than 5 pixels, mark that we should ignore the next click
        if (totalDistance > 5) {
          shouldIgnoreNextClick.current = true;
        }
        
        setPosition(prev => ({
          x: Math.max(0, Math.min(window.innerWidth - 60, prev.x + deltaX)),
          y: Math.max(0, Math.min(window.innerHeight - 60, prev.y + deltaY))
        }));
        
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Reset the ignore flag after a short delay to allow the click event to fire and be ignored
      if (resetTimeoutId.current !== null) {
        clearTimeout(resetTimeoutId.current);
      }
      resetTimeoutId.current = window.setTimeout(() => {
        shouldIgnoreNextClick.current = false;
        resetTimeoutId.current = null;
      }, 50);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, initialPosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent text selection during drag
    e.preventDefault();
    
    // Clear any pending reset timeout from a previous drag
    if (resetTimeoutId.current !== null) {
      clearTimeout(resetTimeoutId.current);
      resetTimeoutId.current = null;
    }
    
    setIsDragging(true);
    shouldIgnoreNextClick.current = false;
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPosition({ x: e.clientX, y: e.clientY });
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger onClick if we shouldn't ignore this click
    if (!shouldIgnoreNextClick.current) {
      onClick();
    } else {
      // This was a drag-release, ignore it
      shouldIgnoreNextClick.current = false;
    }
  };

  return (
    <div
      ref={buttonRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: 50,
        touchAction: 'none',
      }}
      onMouseDown={handleMouseDown}
      data-testid="draggable-ai-button"
    >
      <Button
        onClick={handleClick}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-xl transition-all duration-300 hover:scale-110"
        data-testid="button-unified-ai-toggle"
      >
        <Bot className="w-6 h-6" />
      </Button>
    </div>
  );
}
