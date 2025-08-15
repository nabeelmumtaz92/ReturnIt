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
        
        {/* Back face (partially visible) - wider box with thinner lines */}
        <path
          d="M5 6L20 2L35 6L35 18L20 22L5 18Z"
          fill="#F5F0E6"
          stroke="#A47C48"
          strokeWidth="1.2"
          opacity="0.7"
        />
        
        {/* Front face overlay - wider proportions with thinner lines */}
        <path
          d="M2 8L18 4L34 8L34 20L18 24L2 20Z"
          fill="#F5F0E6"
          stroke="#A47C48"
          strokeWidth="1.5"
        />
        
        {/* Top fold - creating the 3D effect across wider box */}
        <path
          d="M2 8L18 12L34 8"
          stroke="#A47C48"
          strokeWidth="1.2"
          fill="none"
        />
        
        {/* Center crease - vertical line down the middle */}
        <path
          d="M18 4L18 12"
          stroke="#A47C48"
          strokeWidth="1.2"
        />
        
        {/* Bottom vertical crease */}
        <path
          d="M18 12L18 24"
          stroke="#A47C48"
          strokeWidth="1.2"
        />
        
        {/* Inner cross lines spanning the wider box - thinner */}
        <path
          d="M8 10L28 18"
          stroke="#A47C48"
          strokeWidth="0.8"
          opacity="0.5"
        />
        <path
          d="M28 10L8 18"
          stroke="#A47C48"
          strokeWidth="0.8"
          opacity="0.5"
        />
        
        {/* Additional corner details for wider box - thinner */}
        <path
          d="M2 8L8 10"
          stroke="#A47C48"
          strokeWidth="0.8"
          opacity="0.6"
        />
        <path
          d="M34 8L28 10"
          stroke="#A47C48"
          strokeWidth="0.8"
          opacity="0.6"
        />
        
        {/* Side fold lines for realistic box appearance - thinner */}
        <path
          d="M2 8L2 20"
          stroke="#A47C48"
          strokeWidth="0.8"
          opacity="0.4"
        />
        <path
          d="M34 8L34 20"
          stroke="#A47C48"
          strokeWidth="0.8"
          opacity="0.4"
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