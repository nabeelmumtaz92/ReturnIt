import { Link } from "wouter";

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  linkToHome?: boolean;
  className?: string;
}

export function BrandLogo({ size = 'md', linkToHome = true, className = "" }: BrandLogoProps) {
  const sizes = {
    sm: {
      r: 'text-2xl',
      text: 'text-sm',
      gap: 'gap-1.5'
    },
    md: {
      r: 'text-3xl',
      text: 'text-lg',
      gap: 'gap-2'
    },
    lg: {
      r: 'text-4xl',
      text: 'text-xl',
      gap: 'gap-2.5'
    }
  };
  
  const LogoContent = () => (
    <div className={`flex items-center ${sizes[size].gap} ${className}`}>
      <span className={`${sizes[size].r} font-bold text-[#8B4513]`}>R</span>
      <span className={`${sizes[size].text} font-semibold text-amber-900`}>Return It</span>
    </div>
  );
  
  if (linkToHome) {
    return (
      <Link href="/">
        <div className="cursor-pointer hover:opacity-80 transition-opacity" data-testid="brand-logo">
          <LogoContent />
        </div>
      </Link>
    );
  }
  
  return <LogoContent />;
}
