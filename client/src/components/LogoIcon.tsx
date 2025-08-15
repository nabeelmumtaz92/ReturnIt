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
      {/* 3D Cardboard box with Y-shaped interior opening */}
      <g transform="translate(2, 1)">
        
        {/* Left side panel of the box */}
        <path
          d="M2 8L12 4L12 20L2 20Z"
          fill="#A47C48"
          stroke="#8B6635"
          strokeWidth="1.2"
        />
        
        {/* Right side panel of the box */}
        <path
          d="M24 4L34 8L34 20L24 20Z"
          fill="#A47C48"
          stroke="#8B6635"
          strokeWidth="1.2"
        />
        
        {/* Bottom panel of the box */}
        <path
          d="M2 20L34 20L34 22L2 22Z"
          fill="#A47C48"
          stroke="#8B6635"
          strokeWidth="1.2"
        />
        
        {/* Top left flap - creating the Y opening */}
        <path
          d="M2 8L12 4L18 8L12 10Z"
          fill="#A47C48"
          stroke="#8B6635"
          strokeWidth="1.2"
        />
        
        {/* Top right flap - creating the Y opening */}
        <path
          d="M34 8L24 4L18 8L24 10Z"
          fill="#A47C48"
          stroke="#8B6635"
          strokeWidth="1.2"
        />
        
        {/* Interior Y-shaped opening - cream colored inside */}
        <path
          d="M12 10L18 8L24 10L24 20L12 20Z"
          fill="#F5F0E6"
          stroke="#8B6635"
          strokeWidth="1"
        />
        
        {/* Center fold line creating the Y stem */}
        <path
          d="M18 8L18 20"
          stroke="#8B6635"
          strokeWidth="1.2"
        />
        
        {/* Left Y branch fold line */}
        <path
          d="M18 8L12 10"
          stroke="#8B6635"
          strokeWidth="1"
        />
        
        {/* Right Y branch fold line */}
        <path
          d="M18 8L24 10"
          stroke="#8B6635"
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