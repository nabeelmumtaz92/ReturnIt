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
  const color = variant === 'white' ? '#FFFFFF' : '#1A3B5C';
  
  return (
    <svg width={size * 3.3} height={size} viewBox="0 0 400 120" className={className}>
      {/* "ReturnIt" text - exact match to image */}
      <text x="20" y="80" fontFamily="Arial, Helvetica, sans-serif" fontSize="48" fontWeight="700" fill={color}>
        ReturnIt
      </text>
      
      {/* 3D Box Icon - exact match to image */}
      <g transform="translate(300, 20)">
        {/* Back top edge */}
        <path d="M10 30 L50 15 L90 30" 
              fill="none" 
              stroke={color} 
              strokeWidth="4" 
              strokeLinecap="round"
              strokeLinejoin="round"/>
        
        {/* Front top edge */}
        <path d="M10 50 L50 35 L90 50" 
              fill="none" 
              stroke={color} 
              strokeWidth="4" 
              strokeLinecap="round"
              strokeLinejoin="round"/>
        
        {/* Left face */}
        <path d="M10 30 L10 50 L50 65 L50 45 Z" 
              fill="none" 
              stroke={color} 
              strokeWidth="4" 
              strokeLinejoin="round"/>
        
        {/* Right face */}
        <path d="M50 45 L50 65 L90 50 L90 30 Z" 
              fill="none" 
              stroke={color} 
              strokeWidth="4" 
              strokeLinejoin="round"/>
        
        {/* Top face */}
        <path d="M10 30 L50 15 L90 30 L50 45 Z" 
              fill="none" 
              stroke={color} 
              strokeWidth="4" 
              strokeLinejoin="round"/>
        
        {/* Front face */}
        <path d="M10 50 L50 35 L50 65 L10 80 Z" 
              fill="none" 
              stroke={color} 
              strokeWidth="4" 
              strokeLinejoin="round"/>
        
        {/* Vertical connecting lines */}
        <path d="M10 30 L10 50" 
              stroke={color} 
              strokeWidth="4" 
              strokeLinecap="round"/>
        <path d="M50 15 L50 35" 
              stroke={color} 
              strokeWidth="4" 
              strokeLinecap="round"/>
        <path d="M90 30 L90 50" 
              stroke={color} 
              strokeWidth="4" 
              strokeLinecap="round"/>
        
        {/* Small circular dot on front face */}
        <circle cx="35" cy="55" r="3" fill={color}/>
      </g>
    </svg>
  );
}