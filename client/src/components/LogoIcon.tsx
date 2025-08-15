interface LogoIconProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 24, className = "" }: LogoIconProps) {
  return (
    <svg
      width={size * 1.8}
      height={size}
      viewBox="0 0 44 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 3D Cardboard box exactly as drawn - forming the 'Y' */}
      <g transform="translate(2, 1)">
        
        {/* Main 3D box structure - front face */}
        <path
          d="M6 6L26 6L26 20L6 20Z"
          fill="#F5F0E6"
          stroke="#A47C48"
          strokeWidth="1.5"
        />
        
        {/* Top face of the 3D box */}
        <path
          d="M6 6L10 2L30 2L26 6Z"
          fill="#A47C48"
          stroke="#A47C48"
          strokeWidth="1.5"
        />
        
        {/* Right side face of the 3D box */}
        <path
          d="M26 6L30 2L30 16L26 20Z"
          fill="#A47C48"
          stroke="#A47C48"
          strokeWidth="1.5"
        />
        
        {/* Connection circles at all corners exactly like your drawing */}
        {/* Front face corners */}
        <circle cx="6" cy="6" r="1.5" fill="none" stroke="#A47C48" strokeWidth="1.2" />
        <circle cx="26" cy="6" r="1.5" fill="none" stroke="#A47C48" strokeWidth="1.2" />
        <circle cx="6" cy="20" r="1.5" fill="none" stroke="#A47C48" strokeWidth="1.2" />
        <circle cx="26" cy="20" r="1.5" fill="none" stroke="#A47C48" strokeWidth="1.2" />
        
        {/* Back face corners (3D depth) */}
        <circle cx="10" cy="2" r="1.5" fill="none" stroke="#A47C48" strokeWidth="1.2" />
        <circle cx="30" cy="2" r="1.5" fill="none" stroke="#A47C48" strokeWidth="1.2" />
        <circle cx="30" cy="16" r="1.5" fill="none" stroke="#A47C48" strokeWidth="1.2" />
        
        {/* Internal cross/X patterns exactly like your drawing */}
        {/* First X pattern */}
        <path
          d="M10 8L22 18"
          stroke="#A47C48"
          strokeWidth="1.2"
        />
        <path
          d="M22 8L10 18"
          stroke="#A47C48"
          strokeWidth="1.2"
        />
        
        {/* Second X pattern */}
        <path
          d="M14 10L18 14"
          stroke="#A47C48"
          strokeWidth="1"
        />
        <path
          d="M18 10L14 14"
          stroke="#A47C48"
          strokeWidth="1"
        />
        
      </g>
    </svg>
  );
}

export function ReturnlyLogo({ size = 32, className = "" }: LogoIconProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <span className="font-light text-primary text-lg">Returnl</span>
      <LogoIcon size={size} className="mx-0" />
    </div>
  );
}