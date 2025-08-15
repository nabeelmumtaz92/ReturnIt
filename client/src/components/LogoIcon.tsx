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
      {/* Clean 3D cardboard box exactly like the image */}
      <g transform="translate(2, 1)">
        
        {/* Front face - outline only */}
        <path
          d="M4 8L26 8L26 18L4 18Z"
          fill="none"
          stroke="#A47C48"
          strokeWidth="2"
        />
        
        {/* Top face */}
        <path
          d="M4 8L8 4L30 4L26 8Z"
          fill="none"
          stroke="#A47C48"
          strokeWidth="2"
        />
        
        {/* Right side face */}
        <path
          d="M26 8L30 4L30 14L26 18Z"
          fill="none"
          stroke="#A47C48"
          strokeWidth="2"
        />
        
        {/* Back edges for 3D effect */}
        <path
          d="M8 4L30 4"
          stroke="#A47C48"
          strokeWidth="2"
        />
        <path
          d="M30 4L30 14"
          stroke="#A47C48"
          strokeWidth="2"
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