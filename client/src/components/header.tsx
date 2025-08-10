interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-4xl font-extrabold text-foreground mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  );
}
