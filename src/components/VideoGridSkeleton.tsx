interface VideoGridSkeletonProps {
  count?: number;
}

export function VideoGridSkeleton({ count = 8 }: VideoGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 animate-pulse relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-[shimmer_2s_infinite]" />
          </div>
          <div className="p-4 space-y-3">
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
            </div>
            <div className="h-3 bg-muted rounded w-4/5 animate-pulse" />
            <div className="flex justify-between">
              <div className="h-3 bg-muted rounded w-20 animate-pulse" />
              <div className="h-3 bg-muted rounded w-16 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}