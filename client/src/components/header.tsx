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
                  fill="none"
                >
                  <path 
                    d="M20 10 L20 90 L35 90 L35 55 L50 55 L65 90 L82 90 L65 53 C72 50 78 42 78 30 C78 16 68 10 55 10 L20 10 Z M35 24 L53 24 C60 24 63 27 63 32 C63 37 60 41 53 41 L35 41 L35 24 Z" 
                    fill="#8B4513"
                  />
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
