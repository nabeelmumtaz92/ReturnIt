import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backUrl?: string;
  className?: string;
}

export function Header({ title, subtitle, showBack = false, backUrl = "/", className = "" }: HeaderProps) {
  return (
    <header className={`bg-white/80 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showBack && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-amber-800 hover:text-amber-900"
              >
                <Link href={backUrl}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
            )}
            
            <Link href="/">
              <div className="cursor-pointer hover:opacity-80 transition-opacity">
                <svg 
                  width="32" 
                  height="32" 
                  viewBox="0 0 100 100" 
                  aria-label="Return It"
                >
                  <text 
                    x="50" 
                    y="75" 
                    fontSize="80" 
                    fontWeight="700" 
                    fill="#8B4513"
                    fontFamily="Inter, system-ui, sans-serif"
                    textAnchor="middle"
                    letterSpacing="-2px"
                  >
                    R
                  </text>
                </svg>
              </div>
            </Link>
            
            <div>
              <h1 className="text-lg font-semibold text-amber-900">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-amber-700 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
