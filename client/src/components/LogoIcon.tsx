interface LogoIconProps {
  size?: number;
  className?: string;
  variant?: 'default' | 'white' | 'dark';
}

export function LogoIcon({ size = 24, className = "", variant = 'default' }: LogoIconProps) {
  // Logo completely removed - return null to not render anything
  return null;
}

export function ReturnItLogo({ size = 32, className = "", variant = 'default' }: LogoIconProps) {
  const colorClass = variant === 'white' ? 'text-white' : 'text-amber-900';
  
  return (
    <div 
      className={`${colorClass} font-bold text-center flex-1 ${className}`}
      style={{ fontSize: `${size * 0.8}px` }}
    >
      Return It
    </div>
  );
}