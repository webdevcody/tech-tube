import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "~/components/Hero";
import { Footer } from "~/components/Footer";
import { getTrendingVideosFn } from "~/fn/videos";
import { VideoCard } from "~/components/VideoCard";
import { VideoGridSkeleton } from "~/components/VideoGridSkeleton";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { data: trendingVideos, isLoading } = useQuery({
    queryKey: ["trending-videos"],
    queryFn: () => getTrendingVideosFn(),
  });

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      <main className="flex-1">
        <Hero />

        <section className="py-12 px-4 max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              Trending This Week
            </h2>
            <p className="text-muted-foreground">
              Most viewed videos from the past two weeks
            </p>
          </div>

          {isLoading ? (
            <VideoGridSkeleton />
          ) : trendingVideos && trendingVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No trending videos yet
              </h3>
              <p className="text-muted-foreground">
                Check back later for the most popular videos of the week.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
