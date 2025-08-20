import { ReactNode } from "react";
import { Button } from "~/components/ui/button";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4 rounded-xl bg-muted/30 border border-dashed border-border/60">
      <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        {description}
      </p>
      {actionLabel && (
        <Button 
          className="mt-6"
          size="lg"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}