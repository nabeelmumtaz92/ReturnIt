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
      {/* 3D cube rotated 90 degrees right - going into the page */}
      <g transform="translate(2, 1)">
        
        {/* Front face - cream colored */}
        <path
          d="M8 8L24 8L24 18L8 18Z"
          fill="#F5F0E6"
          stroke="#A47C48"
          strokeWidth="1.5"
        />
        
        {/* Top face - cardboard brown (rotated perspective) */}
        <path
          d="M8 8L16 2L32 2L24 8Z"
          fill="#A47C48"
          stroke="#A47C48"
          strokeWidth="1.5"
        />
        
        {/* Left side face - cardboard brown (now visible from rotation) */}
        <path
          d="M8 8L16 2L16 12L8 18Z"
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