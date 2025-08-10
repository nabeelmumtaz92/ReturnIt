import { ReactNode } from 'react';

interface ScreenProps {
  children: ReactNode;
}

export function Screen({ children }: ScreenProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6 md:py-8">
        {children}
      </div>
    </div>
  );
}
