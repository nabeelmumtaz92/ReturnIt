interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'full' | 'icon' | 'text';
}

const sizeMap = {
  sm: 'h-8 w-auto',
  md: 'h-12 w-auto', 
  lg: 'h-16 w-auto',
  xl: 'h-20 w-auto',
  '2xl': 'h-24 w-auto'
};

export function Logo({ className = '', size = 'md', variant = 'full' }: LogoProps) {
  const sizeClass = sizeMap[size];
  
  if (variant === 'icon') {
    return (
      <svg 
        className={`${sizeClass} ${className}`}
        viewBox="0 0 120 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Box Icon */}
        <rect 
          x="20" 
          y="30" 
          width="80" 
          height="60" 
          rx="8" 
          fill="#D2B48C" 
          stroke="#8B4513" 
          strokeWidth="3"
        />
        
        {/* Tape Lines */}
        <rect x="20" y="55" width="80" height="8" fill="#CD853F" />
        <rect x="55" y="30" width="8" height="60" fill="#CD853F" />
        
        {/* Return Arrow */}
        <path 
          d="M40 15 L35 20 L40 25 M35 20 L65 20" 
          stroke="#B8860B" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Delivery Truck Icon */}
        <rect x="75" y="105" width="25" height="12" rx="3" fill="#8B4513" />
        <circle cx="80" cy="115" r="3" fill="#2F2F2F" />
        <circle cx="95" cy="115" r="3" fill="#2F2F2F" />
      </svg>
    );
  }

  if (variant === 'text') {
    return (
      <svg 
        className={`${sizeClass} ${className}`}
        viewBox="0 0 200 50" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <text 
          x="10" 
          y="35" 
          fontSize="28" 
          fontWeight="bold" 
          fill="#8B4513"
          fontFamily="Inter, system-ui, sans-serif"
        >
          Returnly
        </text>
      </svg>
    );
  }

  // Full logo with icon and text
  return (
    <svg 
      className={`${sizeClass} ${className} logo-enhanced`}
      viewBox="0 0 280 80" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Card */}
      <rect 
        x="5" 
        y="10" 
        width="270" 
        height="60" 
        rx="12" 
        fill="url(#cardboardGradient)" 
        stroke="#A0522D" 
        strokeWidth="2"
      />
      
      {/* Box Icon */}
      <rect 
        x="25" 
        y="25" 
        width="30" 
        height="30" 
        rx="4" 
        fill="#DEB887" 
        stroke="#8B4513" 
        strokeWidth="2"
      />
      
      {/* Tape Lines */}
      <rect x="25" y="37" width="30" height="4" fill="#CD853F" />
      <rect x="37" y="25" width="4" height="30" fill="#CD853F" />
      
      {/* Return Arrow */}
      <path 
        d="M65 30 L70 35 L65 40 M70 35 L85 35" 
        stroke="#B8860B" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Brand Text */}
      <text 
        x="95" 
        y="48" 
        fontSize="24" 
        fontWeight="800" 
        fill="#8B4513"
        fontFamily="Inter, system-ui, sans-serif"
        letterSpacing="-0.5px"
      >
        Returnly
      </text>
      
      {/* Tagline */}
      <text 
        x="95" 
        y="60" 
        fontSize="10" 
        fontWeight="500" 
        fill="#A0522D"
        fontFamily="Inter, system-ui, sans-serif"
        letterSpacing="0.5px"
        opacity="0.8"
      >
        Returns Made Easy
      </text>
      
      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="cardboardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5E6D3" />
          <stop offset="50%" stopColor="#E6D3C1" />
          <stop offset="100%" stopColor="#D2B48C" />
        </linearGradient>
      </defs>
    </svg>
  );
}