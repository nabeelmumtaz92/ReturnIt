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
      <path 
        d="M20 10 L20 90 L35 90 L35 55 L50 55 L65 90 L82 90 L65 53 C72 50 78 42 78 30 C78 16 68 10 55 10 L20 10 Z M35 24 L53 24 C60 24 63 27 63 32 C63 37 60 41 53 41 L35 41 L35 24 Z" 
        fill="#8B4513"
      />
    </svg>
  );
}