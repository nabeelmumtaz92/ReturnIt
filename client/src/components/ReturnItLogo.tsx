import React from 'react';

interface ReturnItLogoProps {
  size?: number;
  className?: string;
}

export function ReturnItLogo({ size = 32, className = "" }: ReturnItLogoProps) {
  return (
    <svg width={size * 2.5} height={size} viewBox="0 0 200 80" className={className}>
      {/* "returnit" text */}
      <text x="10" y="55" fontFamily="Arial, sans-serif" fontSize="32" fontWeight="600" fill="#1e3a5f">
        returnit
      </text>
      
      {/* 3D Box Icon */}
      <g transform="translate(155, 15)">
        {/* Box outline */}
        <path d="M5 25 L25 15 L45 25 L45 45 L25 55 L5 45 Z" 
              fill="none" 
              stroke="#1e3a5f" 
              strokeWidth="3" 
              strokeLinejoin="round"/>
        
        {/* Top face */}
        <path d="M5 25 L25 15 L45 25 L25 35 Z" 
              fill="none" 
              stroke="#1e3a5f" 
              strokeWidth="3" 
              strokeLinejoin="round"/>
        
        {/* Left face */}
        <path d="M5 25 L5 45 L25 55 L25 35 Z" 
              fill="none" 
              stroke="#1e3a5f" 
              strokeWidth="3" 
              strokeLinejoin="round"/>
        
        {/* Right face */}
        <path d="M25 35 L25 55 L45 45 L45 25 Z" 
              fill="none" 
              stroke="#1e3a5f" 
              strokeWidth="3" 
              strokeLinejoin="round"/>
        
        {/* Small dot on front face */}
        <circle cx="15" cy="40" r="2" fill="#1e3a5f"/>
      </g>
    </svg>
  );
}

export function ReturnItIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" className={className}>
      {/* Just the 3D Box Icon */}
      <g transform="translate(5, 5)">
        {/* Box outline */}
        <path d="M5 25 L25 15 L45 25 L45 45 L25 55 L5 45 Z" 
              fill="none" 
              stroke="#1e3a5f" 
              strokeWidth="3" 
              strokeLinejoin="round"
              transform="scale(0.8)"/>
        
        {/* Top face */}
        <path d="M5 25 L25 15 L45 25 L25 35 Z" 
              fill="none" 
              stroke="#1e3a5f" 
              strokeWidth="3" 
              strokeLinejoin="round"
              transform="scale(0.8)"/>
        
        {/* Left face */}
        <path d="M5 25 L5 45 L25 55 L25 35 Z" 
              fill="none" 
              stroke="#1e3a5f" 
              strokeWidth="3" 
              strokeLinejoin="round"
              transform="scale(0.8)"/>
        
        {/* Right face */}
        <path d="M25 35 L25 55 L45 45 L45 25 Z" 
              fill="none" 
              stroke="#1e3a5f" 
              strokeWidth="3" 
              strokeLinejoin="round"
              transform="scale(0.8)"/>
        
        {/* Small dot on front face */}
        <circle cx="12" cy="32" r="1.5" fill="#1e3a5f" transform="scale(0.8)"/>
      </g>
    </svg>
  );
}