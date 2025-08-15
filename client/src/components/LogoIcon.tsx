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
      {/* Clean 3D diamond/cube shape as drawn - no cross lines */}
      <g transform="translate(2, 1)">
        
        {/* Front face - cream colored */}
        <path
          d="M6 6L26 6L26 20L6 20Z"
          fill="#F5F0E6"
          stroke="#A47C48"
          strokeWidth="1.5"
        />
        
        {/* Top face - cardboard brown */}
        <path
          d="M6 6L10 2L30 2L26 6Z"
          fill="#A47C48"
          stroke="#A47C48"
          strokeWidth="1.5"
        />
        
        {/* Right side face - cardboard brown */}
        <path
          d="M26 6L30 2L30 16L26 20Z"
          fill="#A47C48"
          stroke="#A47C48"
          strokeWidth="1.5"
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