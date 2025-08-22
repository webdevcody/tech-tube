import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Video as VideoIcon } from "lucide-react";
import { VideoCard } from "~/components/VideoCard";
import { VideoGridSkeleton } from "~/components/VideoGridSkeleton";
import { EmptyState } from "~/components/EmptyState";
import { getSubscribedVideosAndCommentsFn } from "~/fn/subscriptions";

const subscriptionsQueryOptions = () => ({
  queryKey: ["subscribed-content"],
  queryFn: () => getSubscribedVideosAndCommentsFn(),
});

export const Route = createFileRoute("/subscriptions/videos")({
  loader: ({ context }) => {
    const { queryClient } = context;
    return queryClient.ensureQueryData(subscriptionsQueryOptions());
  },
  component: SubscriptionVideos,
});

function SubscriptionVideos() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(subscriptionsQueryOptions());

  const { videos } = data || { videos: [] };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <VideoGridSkeleton count={8} />
      ) : videos && videos.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<VideoIcon className="h-10 w-10 text-primary/60" />}
          title="No videos from subscriptions"
          description="Videos from creators you subscribe to will appear here. Start following some creators to see their latest content!"
          actionLabel="Browse Creators"
          onAction={() => {
            navigate({ to: "/browse" });
          }}
        />
      )}
    </div>
  );
}