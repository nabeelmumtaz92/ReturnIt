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
      fill="none"
    >
      <path 
        d="M20 10 L20 90 L35 90 L35 55 L50 55 L65 90 L82 90 L65 53 C72 50 78 42 78 30 C78 16 68 10 55 10 L20 10 Z M35 24 L53 24 C60 24 63 27 63 32 C63 37 60 41 53 41 L35 41 L35 24 Z" 
        fill="#8B4513"
      />
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
      fill="none"
    >
      <path 
        d="M20 10 L20 90 L35 90 L35 55 L50 55 L65 90 L82 90 L65 53 C72 50 78 42 78 30 C78 16 68 10 55 10 L20 10 Z M35 24 L53 24 C60 24 63 27 63 32 C63 37 60 41 53 41 L35 41 L35 24 Z" 
        fill="#8B4513"
      />
    </svg>
  );
}