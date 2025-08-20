import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Video as VideoIcon, TrendingUp, Clock } from "lucide-react";
import { VideoCard } from "~/components/VideoCard";
import { VideoGridSkeleton } from "~/components/VideoGridSkeleton";
import { EmptyState } from "~/components/EmptyState";
import { Page } from "~/components/Page";
import { PageTitle } from "~/components/PageTitle";
import { getRecentVideosQuery, getPopularVideosQuery } from "~/queries/videos";

export const Route = createFileRoute("/browse")({
  loader: ({ context }) => {
    const { queryClient } = context;
    queryClient.ensureQueryData(getRecentVideosQuery());
    queryClient.ensureQueryData(getPopularVideosQuery());
  },
  component: Browse,
});

function Browse() {
  const navigate = useNavigate();

  const { data: recentVideos, isLoading: isLoadingRecent } = useQuery(getRecentVideosQuery());
  const { data: popularVideos, isLoading: isLoadingPopular } = useQuery(getPopularVideosQuery());

  return (
    <Page>
      <div className="space-y-8">
        <PageTitle
          title="Browse Videos"
          description="Discover amazing content from our community"
        />

        <section className="space-y-6" aria-labelledby="popular-heading">
          <div className="flex items-center justify-between border-b border-border/30 pb-3">
            <div>
              <h2
                id="popular-heading"
                className="text-2xl font-bold tracking-tight flex items-center gap-2"
              >
                <TrendingUp className="h-6 w-6 text-primary" />
                Popular Videos
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Trending content from our community
              </p>
            </div>
          </div>
          {isLoadingPopular ? (
            <VideoGridSkeleton count={5} />
          ) : popularVideos && popularVideos.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {popularVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<VideoIcon className="h-10 w-10 text-primary/60" />}
              title="No popular videos yet"
              description="Be the first to share amazing content with our community. Popular videos will appear here as they gain traction."
              actionLabel="Upload Your Video"
              onAction={() => {
                navigate({ to: "/upload" });
              }}
            />
          )}
        </section>

        <section className="space-y-6" aria-labelledby="recent-heading">
          <div className="flex items-center justify-between border-b border-border/30 pb-3">
            <div>
              <h2
                id="recent-heading"
                className="text-2xl font-bold tracking-tight flex items-center gap-2"
              >
                <Clock className="h-6 w-6 text-primary" />
                Recent Videos
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Latest uploads from creators
              </p>
            </div>
          </div>
          {isLoadingRecent ? (
            <VideoGridSkeleton count={5} />
          ) : recentVideos && recentVideos.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {recentVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<VideoIcon className="h-10 w-10 text-primary/60" />}
              title="No recent videos yet"
              description="Be the first to share fresh content with our community. Recent videos will appear here as creators upload new content."
              actionLabel="Get Started"
              onAction={() => {
                // TODO: Navigate to getting started page when available
                console.log("Navigate to getting started");
              }}
            />
          )}
        </section>
      </div>
    </Page>
  );
}
