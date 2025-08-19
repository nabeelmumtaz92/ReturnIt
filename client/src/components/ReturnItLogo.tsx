import React from 'react';

interface ReturnItLogoProps {
  size?: number;
  className?: string;
}

export function ReturnItLogo({ size = 32, className = "" }: ReturnItLogoProps) {
  return (
    <img 
      src="/returnit-logo.png" 
      alt="ReturnIt Logo" 
      className={className}
      style={{ height: `${size}px`, width: 'auto' }}
    />
  );
}

export function ReturnItIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <img 
      src="/returnit-logo.png" 
      alt="ReturnIt Icon" 
      className={className}
      style={{ height: `${size}px`, width: 'auto' }}
    />
  );
}