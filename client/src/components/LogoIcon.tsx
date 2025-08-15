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
      {/* Cardboard box replacing the Y in Returnly - clean 3D design */}
      <g transform="translate(2, 1)">
        
        {/* Front face - cream colored interior */}
        <path
          d="M4 6L28 6L28 18L4 18Z"
          fill="#F5F0E6"
          stroke="#A47C48"
          strokeWidth="1.5"
        />
        
        {/* Top face - cardboard brown */}
        <path
          d="M4 6L8 2L32 2L28 6Z"
          fill="#A47C48"
          stroke="#A47C48"
          strokeWidth="1.5"
        />
        
        {/* Right side face - cardboard brown */}
        <path
          d="M28 6L32 2L32 14L28 18Z"
          fill="#A47C48"
          stroke="#A47C48"
          strokeWidth="1.5"
        />
        
        {/* Center fold line - Y stem */}
        <path
          d="M16 6L16 18"
          stroke="#A47C48"
          strokeWidth="1.2"
        />
        
        {/* Y branches - 45 degree fold lines */}
        <path
          d="M16 10L8 6"
          stroke="#A47C48"
          strokeWidth="1.2"
        />
        <path
          d="M16 10L24 6"
          stroke="#A47C48"
          strokeWidth="1.2"
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