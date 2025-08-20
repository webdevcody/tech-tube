interface PageTitleProps {
  title: string;
  description?: string;
  className?: string;
  center?: boolean;
}

export function PageTitle({
  title,
  description,
  className = "",
  center = false,
}: PageTitleProps) {
  return (
    <header className={`${center ? "text-center" : "text-left"} ${className}`}>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="mt-2 text-muted-foreground">{description}</p>
      )}
    </header>
  );
}
