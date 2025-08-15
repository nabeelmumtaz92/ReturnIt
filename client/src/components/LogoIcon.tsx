interface LogoIconProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 24, className = "" }: LogoIconProps) {
  return (
    <svg
      width={size * 1.2}
      height={size}
      viewBox="0 0 30 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Cardboard box exactly as drawn in your sketch - forming the 'Y' */}
      <g transform="translate(3, 1)">
        {/* Main box structure - 6-sided box with proper perspective */}
        
        {/* Back face (partially visible) */}
        <path
          d="M4 6L12 2L20 6L20 18L12 22L4 18Z"
          fill="#F5F0E6"
          stroke="#A47C48"
          strokeWidth="2"
          opacity="0.7"
        />
        
        {/* Front face overlay */}
        <path
          d="M2 8L10 4L18 8L18 20L10 24L2 20Z"
          fill="#F5F0E6"
          stroke="#A47C48"
          strokeWidth="2.5"
        />
        
        {/* Top fold - creating the 3D effect like your sketch */}
        <path
          d="M2 8L10 12L18 8"
          stroke="#A47C48"
          strokeWidth="2"
          fill="none"
        />
        
        {/* Center crease - vertical line down the middle */}
        <path
          d="M10 4L10 12"
          stroke="#A47C48"
          strokeWidth="2"
        />
        
        {/* Bottom vertical crease */}
        <path
          d="M10 12L10 24"
          stroke="#A47C48"
          strokeWidth="2"
        />
        
        {/* Connection circles exactly as in your drawing - positioned at corners */}
        {/* Top circles */}
        <circle cx="6" cy="10" r="1.2" fill="#A47C48" />
        <circle cx="14" cy="10" r="1.2" fill="#A47C48" />
        
        {/* Bottom circles - darker brown as you noted */}
        <circle cx="6" cy="18" r="1.2" fill="#8B6635" />
        <circle cx="14" cy="18" r="1.2" fill="#8B6635" />
        
        {/* Inner cross lines from your sketch */}
        <path
          d="M6 10L14 18"
          stroke="#A47C48"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <path
          d="M14 10L6 18"
          stroke="#A47C48"
          strokeWidth="1.5"
          opacity="0.6"
        />
        
        {/* Additional corner details to match your sketch */}
        <path
          d="M2 8L6 10"
          stroke="#A47C48"
          strokeWidth="1.5"
          opacity="0.8"
        />
        <path
          d="M18 8L14 10"
          stroke="#A47C48"
          strokeWidth="1.5"
          opacity="0.8"
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