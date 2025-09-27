import React from 'react';
import returnItLogo from '@assets/ChatGPT Image Sep 27, 2025, 03_15_52 PM_1759004176575.png';

interface ReturnItLogoProps {
  size?: number;
  className?: string;
}

export function ReturnItLogo({ size = 32, className = "" }: ReturnItLogoProps) {
  return (
    <img 
      src={returnItLogo}
      alt="Return It"
      className={`object-contain ${className}`}
      style={{ 
        height: `${size}px`,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
      }}
    />
  );
}

export function ReturnItIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      className={className}
      aria-hidden="true"
    >
      {/* Modern ReturnIt Logo - Circular arrow with package */}
      <defs>
        <mask id="packageMask">
          <rect x="12" y="12" width="8" height="8" fill="white"/>
          <path 
            d="M16 12 L16 20 M12 16 L20 16" 
            stroke="black" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
        </mask>
      </defs>
      
      {/* Circular return arrow */}
      <path 
        d="M16 4 A 10 10 0 1 1 6 14 L 8 12 A 8 8 0 1 0 16 6 L 14 8 L 18 8 L 18 4 Z" 
        fill="currentColor"
        stroke="none"
      />
      
      {/* Package box with tape lines cut out */}
      <rect 
        x="12" 
        y="12" 
        width="8" 
        height="8" 
        rx="1"
        fill="currentColor"
        opacity="0.9"
        mask="url(#packageMask)"
      />
      
      {/* Small return indicator dot */}
      <circle 
        cx="24" 
        cy="8" 
        r="2" 
        fill="currentColor"
        opacity="0.8"
      />
    </svg>
  );
}