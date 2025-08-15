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
      {/* Cardboard box outline inspired by your sketch */}
      <path
        d="M4 8L12 4L20 8V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      
      {/* Box fold lines */}
      <path
        d="M4 8L12 12L20 8"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12 4V12"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      
      {/* Tape/connection points inspired by circles in your sketch */}
      <circle
        cx="8"
        cy="10"
        r="1"
        fill="currentColor"
        opacity="0.6"
      />
      <circle
        cx="16"
        cy="10"
        r="1"
        fill="currentColor"
        opacity="0.6"
      />
      <circle
        cx="12"
        cy="16"
        r="1"
        fill="currentColor"
        opacity="0.6"
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