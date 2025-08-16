import React from 'react';

interface ReturnItLogoProps {
  size?: number;
  className?: string;
}

export function ReturnItLogo({ size = 32, className = "" }: ReturnItLogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 180 60" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 3D Cube/Box Icon */}
      <g transform="translate(130, 8)">
        {/* Front face */}
        <path
          d="M8 16 L32 16 L32 40 L8 40 Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Top face */}
        <path
          d="M8 16 L16 8 L40 8 L32 16 Z"
          fill="currentColor"
          opacity="0.8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Right face */}
        <path
          d="M32 16 L40 8 L40 32 L32 40 Z"
          fill="currentColor"
          opacity="0.6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Connection dots */}
        <circle cx="12" cy="20" r="1.5" fill="currentColor" />
        <circle cx="20" cy="12" r="1.5" fill="currentColor" />
      </g>

      {/* Text "returnit" */}
      <text
        x="0"
        y="38"
        fill="currentColor"
        fontSize="28"
        fontWeight="600"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        returnit
      </text>
    </svg>
  );
}

export function ReturnItIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 3D Cube/Box Icon */}
      <g transform="translate(4, 4)">
        {/* Front face */}
        <path
          d="M4 12 L28 12 L28 36 L4 36 Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Top face */}
        <path
          d="M4 12 L12 4 L36 4 L28 12 Z"
          fill="currentColor"
          opacity="0.8"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Right face */}
        <path
          d="M28 12 L36 4 L36 28 L28 36 Z"
          fill="currentColor"
          opacity="0.6"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Connection dots */}
        <circle cx="10" cy="18" r="2" fill="currentColor" />
        <circle cx="18" cy="10" r="2" fill="currentColor" />
      </g>
    </svg>
  );
}