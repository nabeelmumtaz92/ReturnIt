import React from 'react';

interface ReturnItLogoProps {
  size?: number;
  className?: string;
}

export function ReturnItLogo({ size = 32, className = "" }: ReturnItLogoProps) {
  return (
    <svg width={size * 3.3} height={size} viewBox="0 0 400 120" className={className}>
      {/* "returnit" text - exact match to your image */}
      <text x="20" y="80" fontFamily="Arial, Helvetica, sans-serif" fontSize="48" fontWeight="700" fill="#1A3B5C">
        returnit
      </text>
      
      {/* 3D Box Icon - exact match to your image */}
      <g transform="translate(300, 20)">
        {/* Back top edge */}
        <path d="M10 30 L50 15 L90 30" 
              fill="none" 
              stroke="#1A3B5C" 
              strokeWidth="4" 
              strokeLinecap="round"
              strokeLinejoin="round"/>
        
        {/* Front top edge */}
        <path d="M10 50 L50 35 L90 50" 
              fill="none" 
              stroke="#1A3B5C" 
              strokeWidth="4" 
              strokeLinecap="round"
              strokeLinejoin="round"/>
        
        {/* Left face */}
        <path d="M10 30 L10 50 L50 65 L50 45 Z" 
              fill="none" 
              stroke="#1A3B5C" 
              strokeWidth="4" 
              strokeLinejoin="round"/>
        
        {/* Right face */}
        <path d="M50 45 L50 65 L90 50 L90 30 Z" 
              fill="none" 
              stroke="#1A3B5C" 
              strokeWidth="4" 
              strokeLinejoin="round"/>
        
        {/* Top face */}
        <path d="M10 30 L50 15 L90 30 L50 45 Z" 
              fill="none" 
              stroke="#1A3B5C" 
              strokeWidth="4" 
              strokeLinejoin="round"/>
        
        {/* Front face */}
        <path d="M10 50 L50 35 L50 65 L10 80 Z" 
              fill="none" 
              stroke="#1A3B5C" 
              strokeWidth="4" 
              strokeLinejoin="round"/>
        
        {/* Vertical connecting lines */}
        <path d="M10 30 L10 50" 
              stroke="#1A3B5C" 
              strokeWidth="4" 
              strokeLinecap="round"/>
        <path d="M50 15 L50 35" 
              stroke="#1A3B5C" 
              strokeWidth="4" 
              strokeLinecap="round"/>
        <path d="M90 30 L90 50" 
              stroke="#1A3B5C" 
              strokeWidth="4" 
              strokeLinecap="round"/>
        
        {/* Small circular dot on front face */}
        <circle cx="35" cy="55" r="3" fill="#1A3B5C"/>
      </g>
    </svg>
  );
}

export function ReturnItIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 80" className={className}>
      {/* Just the 3D Box Icon from your exact logo */}
      <g transform="translate(5, 0) scale(0.8)">
        {/* Back top edge */}
        <path d="M10 30 L50 15 L90 30" 
              fill="none" 
              stroke="#1A3B5C" 
              strokeWidth="4" 
              strokeLinecap="round"
              strokeLinejoin="round"/>
        
        {/* Front top edge */}
        <path d="M10 50 L50 35 L90 50" 
              fill="none" 
              stroke="#1A3B5C" 
              strokeWidth="4" 
              strokeLinecap="round"
              strokeLinejoin="round"/>
        
        {/* Left face */}
        <path d="M10 30 L10 50 L50 65 L50 45 Z" 
              fill="none" 
              stroke="#1A3B5C" 
              strokeWidth="4" 
              strokeLinejoin="round"/>
        
        {/* Right face */}
        <path d="M50 45 L50 65 L90 50 L90 30 Z" 
              fill="none" 
              stroke="#1A3B5C" 
              strokeWidth="4" 
              strokeLinejoin="round"/>
        
        {/* Top face */}
        <path d="M10 30 L50 15 L90 30 L50 45 Z" 
              fill="none" 
              stroke="#1A3B5C" 
              strokeWidth="4" 
              strokeLinejoin="round"/>
        
        {/* Front face */}
        <path d="M10 50 L50 35 L50 65 L10 80 Z" 
              fill="none" 
              stroke="#1A3B5C" 
              strokeWidth="4" 
              strokeLinejoin="round"/>
        
        {/* Vertical connecting lines */}
        <path d="M10 30 L10 50" 
              stroke="#1A3B5C" 
              strokeWidth="4" 
              strokeLinecap="round"/>
        <path d="M50 15 L50 35" 
              stroke="#1A3B5C" 
              strokeWidth="4" 
              strokeLinecap="round"/>
        <path d="M90 30 L90 50" 
              stroke="#1A3B5C" 
              strokeWidth="4" 
              strokeLinecap="round"/>
        
        {/* Small circular dot on front face */}
        <circle cx="35" cy="55" r="3" fill="#1A3B5C"/>
      </g>
    </svg>
  );
}