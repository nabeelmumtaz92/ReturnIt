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
      {/* Cardboard box based on your sketch - positioned center-right perspective */}
      <path
        d="M6 7L12 3L18 7L18 17L12 21L6 17Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      
      {/* Top face fold lines - like your sketch shows */}
      <path
        d="M6 7L12 11L18 7"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      
      {/* Center vertical fold */}
      <path
        d="M12 3L12 11"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      
      {/* Side face visible fold */}
      <path
        d="M12 11L12 21"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      
      {/* Connection points/tape circles from your drawing */}
      <circle
        cx="9"
        cy="9"
        r="1"
        fill="currentColor"
        opacity="0.7"
      />
      <circle
        cx="15"
        cy="9"
        r="1"
        fill="currentColor"
        opacity="0.7"
      />
      <circle
        cx="9"
        cy="15"
        r="1"
        fill="currentColor"
        opacity="0.7"
      />
      <circle
        cx="15"
        cy="15"
        r="1"
        fill="currentColor"
        opacity="0.7"
      />
      
      {/* Cross fold lines inside box like your sketch */}
      <path
        d="M9 9L15 15"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.5"
      />
      <path
        d="M15 9L9 15"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.5"
      />
    </svg>
  );
}

export function ReturnlyLogo({ size = 32, className = "" }: LogoIconProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoIcon size={size} className="text-primary" />
      <span className="font-bold text-primary text-lg">Returnly</span>
    </div>
  );
}