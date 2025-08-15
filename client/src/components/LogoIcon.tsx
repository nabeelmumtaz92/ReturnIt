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
      {/* Wider cardboard box with realistic box proportions - forming the 'Y' */}
      <g transform="translate(2, 1)">
        {/* Main box structure - wider shipping box dimensions */}
        
        {/* Back face (partially visible) - wider box */}
        <path
          d="M5 6L20 2L35 6L35 18L20 22L5 18Z"
          fill="#F5F0E6"
          stroke="#A47C48"
          strokeWidth="2"
          opacity="0.7"
        />
        
        {/* Front face overlay - wider proportions */}
        <path
          d="M2 8L18 4L34 8L34 20L18 24L2 20Z"
          fill="#F5F0E6"
          stroke="#A47C48"
          strokeWidth="2.5"
        />
        
        {/* Top fold - creating the 3D effect across wider box */}
        <path
          d="M2 8L18 12L34 8"
          stroke="#A47C48"
          strokeWidth="2"
          fill="none"
        />
        
        {/* Center crease - vertical line down the middle */}
        <path
          d="M18 4L18 12"
          stroke="#A47C48"
          strokeWidth="2"
        />
        
        {/* Bottom vertical crease */}
        <path
          d="M18 12L18 24"
          stroke="#A47C48"
          strokeWidth="2"
        />
        
        {/* Connection circles positioned for wider box proportions */}
        {/* Top circles - spaced wider */}
        <circle cx="10" cy="10" r="1.3" fill="#A47C48" />
        <circle cx="26" cy="10" r="1.3" fill="#A47C48" />
        
        {/* Bottom circles - darker brown, wider spacing */}
        <circle cx="10" cy="18" r="1.3" fill="#8B6635" />
        <circle cx="26" cy="18" r="1.3" fill="#8B6635" />
        
        {/* Inner cross lines spanning the wider box */}
        <path
          d="M10 10L26 18"
          stroke="#A47C48"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <path
          d="M26 10L10 18"
          stroke="#A47C48"
          strokeWidth="1.5"
          opacity="0.6"
        />
        
        {/* Additional corner details for wider box */}
        <path
          d="M2 8L10 10"
          stroke="#A47C48"
          strokeWidth="1.5"
          opacity="0.8"
        />
        <path
          d="M34 8L26 10"
          stroke="#A47C48"
          strokeWidth="1.5"
          opacity="0.8"
        />
        
        {/* Side fold lines for realistic box appearance */}
        <path
          d="M2 8L2 20"
          stroke="#A47C48"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <path
          d="M34 8L34 20"
          stroke="#A47C48"
          strokeWidth="1.5"
          opacity="0.6"
        />
      </g>
    </svg>
  );
}

export function ReturnlyLogo({ size = 32, className = "" }: LogoIconProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <span className="font-bold text-primary text-lg">Returnl</span>
      <LogoIcon size={size} className="mx-0" />
    </div>
  );
}