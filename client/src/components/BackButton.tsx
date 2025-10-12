import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  /** Optional fallback URL if there's no history */
  fallbackUrl?: string;
  /** Optional custom className */
  className?: string;
  /** Show only icon (default) or include "Back" text */
  showText?: boolean;
  /** Custom icon size */
  iconSize?: "sm" | "md" | "lg";
  /** Variant of the button */
  variant?: "ghost" | "outline" | "default";
}

export function BackButton({ 
  fallbackUrl = "/", 
  className = "", 
  showText = false,
  iconSize = "md",
  variant = "ghost" 
}: BackButtonProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to home or specified URL if no history
      setLocation(fallbackUrl);
    }
  };

  const iconSizeClass = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  }[iconSize];

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleBack}
      className={`p-2 -ml-2 hover:bg-amber-100/50 transition-colors ${className}`}
      data-testid="button-back"
    >
      <ArrowLeft className={iconSizeClass} />
      {showText && <span className="ml-2">Back</span>}
    </Button>
  );
}
