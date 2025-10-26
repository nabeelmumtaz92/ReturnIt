import React from 'react';

interface ReturnItLogoProps {
  size?: number;
  className?: string;
}

export function ReturnItLogo({ size = 40, className = "" }: ReturnItLogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
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
  );
}

export function ReturnItIcon({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
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
  );
}