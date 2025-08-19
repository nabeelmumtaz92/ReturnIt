interface LogoIconProps {
  size?: number;
  className?: string;
  variant?: 'default' | 'white' | 'dark';
}

export function LogoIcon({ size = 24, className = "", variant = 'default' }: LogoIconProps) {
  const colors = {
    default: '#6B7280',
    white: '#FFFFFF', 
    dark: '#374151'
  };
  
  const color = colors[variant];
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 3D Cube based on your logo mockups */}
      
      {/* Left face */}
      <path
        d="M2 8L12 3L12 15L2 20V8Z"
        fill={color}
        fillOpacity="0.7"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      
      {/* Right face */}
      <path
        d="M12 3L22 8V20L12 15V3Z"
        fill={color}
        fillOpacity="0.9"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      
      {/* Top face */}
      <path
        d="M2 8L12 3L22 8L12 13L2 8Z"
        fill={color}
        fillOpacity="1"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      
      {/* Center dividing line for 3D effect */}
      <line
        x1="12"
        y1="3"
        x2="12"
        y2="15"
        stroke={color}
        strokeWidth="1"
        opacity="0.8"
      />
    </svg>
  );
}

export function ReturnItLogo({ size = 32, className = "", variant = 'default' }: LogoIconProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/returnit-logo.png" 
        alt="ReturnIt Logo" 
        className="h-8 w-auto"
        style={{ height: `${size}px` }}
      />
    </div>
  );
}