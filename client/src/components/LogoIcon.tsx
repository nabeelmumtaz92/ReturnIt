interface LogoIconProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 24, className = "" }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Cardboard box that forms the 'Y' in Returnly - based on your sketch */}
      <g transform="translate(6, 2)">
        {/* Main box outline - cardboard brown */}
        <path
          d="M1 5L6 1L11 5L11 15L6 19L1 15Z"
          stroke="#A47C48"
          strokeWidth="1.5"
          fill="#F5F0E6"
          fillOpacity="0.8"
        />
        
        {/* Top face fold lines */}
        <path
          d="M1 5L6 9L11 5"
          stroke="#A47C48"
          strokeWidth="1.5"
        />
        
        {/* Center vertical fold */}
        <path
          d="M6 1L6 9"
          stroke="#A47C48"
          strokeWidth="1.5"
        />
        
        {/* Side face visible fold */}
        <path
          d="M6 9L6 19"
          stroke="#A47C48"
          strokeWidth="1.2"
        />
        
        {/* Connection points/tape circles from your drawing with different colors */}
        <circle
          cx="3.5"
          cy="7"
          r="0.8"
          fill="#A47C48"
          opacity="0.9"
        />
        <circle
          cx="8.5"
          cy="7"
          r="0.8"
          fill="#A47C48"
          opacity="0.9"
        />
        <circle
          cx="3.5"
          cy="13"
          r="0.8"
          fill="#8B6635"
          opacity="0.9"
        />
        <circle
          cx="8.5"
          cy="13"
          r="0.8"
          fill="#8B6635"
          opacity="0.9"
        />
        
        {/* Cross fold lines inside box like your sketch */}
        <path
          d="M3.5 7L8.5 13"
          stroke="#A47C48"
          strokeWidth="1"
          opacity="0.6"
        />
        <path
          d="M8.5 7L3.5 13"
          stroke="#A47C48"
          strokeWidth="1"
          opacity="0.6"
        />
      </g>
    </svg>
  );
}

export function ReturnlyLogo({ size = 32, className = "" }: LogoIconProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <span className="font-bold text-primary text-lg">Returnl</span>
      <LogoIcon size={size} className="mx-0" />
    </div>
  );
}