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
  
  // All variants now show just the 'R' in dark brown
  return (
    <svg 
      className={`${sizeClass} ${className}`}
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
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