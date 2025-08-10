import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
}

export function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <div className="text-center p-6">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" 
           style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
        <Inbox className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      {subtitle && (
        <p className="text-muted-foreground text-center">{subtitle}</p>
      )}
    </div>
  );
}
