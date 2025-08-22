import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, MessageCircle, Video as VideoIcon, Users } from "lucide-react";
import { VideoCard } from "~/components/VideoCard";
import { VideoGridSkeleton } from "~/components/VideoGridSkeleton";
import { EmptyState } from "~/components/EmptyState";
import { Page } from "~/components/Page";
import { PageTitle } from "~/components/PageTitle";
import { getSubscribedVideosAndCommentsFn } from "~/fn/subscriptions";
import { authClient } from "~/lib/auth-client";
import { Card, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { formatRelativeTime } from "~/utils/video";
import { Link } from "@tanstack/react-router";

const subscriptionsQueryOptions = () => ({
  queryKey: ["subscribed-content"],
  queryFn: () => getSubscribedVideosAndCommentsFn(),
});

export const Route = createFileRoute("/subscriptions")({
  loader: ({ context }) => {
    const { queryClient } = context;
    return queryClient.ensureQueryData(subscriptionsQueryOptions());
  },
  component: Subscriptions,
});

function Subscriptions() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  const { data, isLoading } = useQuery(subscriptionsQueryOptions());

  if (isPending) {
    return (
      <Page>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </Page>
    );
  }

  if (!session) {
    navigate({ to: "/sign-in" });
    return null;
  }

  const { videos, comments } = data || { videos: [], comments: [] };

  return (
    <Page>
      <div className="space-y-8">
        <PageTitle
          title="Your Subscriptions"
          description="Latest content from creators you follow"
        />

        {/* Videos Section */}
        <section className="space-y-6" aria-labelledby="videos-heading">
          <div className="flex items-center justify-between border-b border-border/30 pb-3">
            <div>
              <h2
                id="videos-heading"
                className="text-2xl font-bold tracking-tight flex items-center gap-2"
              >
                <VideoIcon className="h-6 w-6 text-primary" />
                Latest Videos
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                New uploads from creators you subscribe to
              </p>
            </div>
          </div>
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
        </section>

        {/* Comments Section */}
        <section className="space-y-6" aria-labelledby="comments-heading">
          <div className="flex items-center justify-between border-b border-border/30 pb-3">
            <div>
              <h2
                id="comments-heading"
                className="text-2xl font-bold tracking-tight flex items-center gap-2"
              >
                <MessageCircle className="h-6 w-6 text-primary" />
                Recent Comments
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Latest comments from creators you follow
              </p>
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex gap-3 animate-pulse">
                      <div className="h-10 w-10 bg-muted rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4" />
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Link
                        to="/profile/$id"
                        params={{ id: comment.user.id }}
                        className="flex-shrink-0"
                      >
                        <Avatar className="h-10 w-10 hover:ring-2 hover:ring-primary/20 transition-all duration-200">
                          <AvatarImage
                            src={comment.user.image || undefined}
                            alt={comment.user.name}
                          />
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            {comment.user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Link>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            to="/profile/$id"
                            params={{ id: comment.user.id }}
                            className="font-semibold text-sm hover:text-primary transition-colors duration-200"
                          >
                            {comment.user.name}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            commented on
                          </span>
                          <Link
                            to="/video/$id"
                            params={{ id: comment.videoId }}
                            className="font-medium text-sm hover:text-primary transition-colors duration-200 truncate"
                          >
                            {comment.video.title}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(new Date(comment.createdAt).toISOString())}
                          </span>
                        </div>

                        <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                          {comment.content}
                        </p>

                        <Link
                          to="/video/$id"
                          params={{ id: comment.videoId }}
                          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          <div className="w-16 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                            {comment.video.thumbnailUrl && (
                              <img
                                src={comment.video.thumbnailUrl}
                                alt={comment.video.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <span className="truncate">View video</span>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<MessageCircle className="h-10 w-10 text-primary/60" />}
              title="No comments from subscriptions"
              description="Comments from creators you subscribe to will appear here. Start following some creators to see their activity!"
              actionLabel="Find Creators"
              onAction={() => {
                navigate({ to: "/browse" });
              }}
            />
          )}
        </section>
      </div>
    </Page>
  );
}