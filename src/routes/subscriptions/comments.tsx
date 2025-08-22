import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { EmptyState } from "~/components/EmptyState";
import { getSubscribedVideosAndCommentsFn } from "~/fn/subscriptions";
import { Card, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { formatRelativeTime } from "~/utils/video";

const subscriptionsQueryOptions = () => ({
  queryKey: ["subscribed-content"],
  queryFn: () => getSubscribedVideosAndCommentsFn(),
});

export const Route = createFileRoute("/subscriptions/comments")({
  loader: ({ context }) => {
    const { queryClient } = context;
    return queryClient.ensureQueryData(subscriptionsQueryOptions());
  },
  component: SubscriptionComments,
});

function SubscriptionComments() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(subscriptionsQueryOptions());

  const { comments } = data || { comments: [] };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex gap-4 animate-pulse">
                  <div className="h-12 w-12 bg-muted rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="flex gap-3 mt-4">
                      <div className="h-16 w-20 bg-muted rounded-lg" />
                      <div className="h-3 bg-muted rounded w-24" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <Card key={comment.id} className="group border-border/50 hover:border-border hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Link
                    to="/profile/$id"
                    params={{ id: comment.user.id }}
                    className="flex-shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <Avatar className="h-12 w-12 ring-2 ring-transparent hover:ring-primary/30 transition-all duration-200">
                      <AvatarImage
                        src={comment.user.image || undefined}
                        alt={comment.user.name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-foreground font-semibold">
                        {comment.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to="/profile/$id"
                          params={{ id: comment.user.id }}
                          className="font-semibold text-foreground hover:text-primary transition-colors duration-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                        >
                          {comment.user.name}
                        </Link>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          {formatRelativeTime(new Date(comment.createdAt).toISOString())}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MessageCircle className="h-4 w-4" />
                        <span>commented on</span>
                        <Link
                          to="/video/$id"
                          params={{ id: comment.videoId }}
                          className="font-medium text-foreground hover:text-primary transition-colors duration-200"
                        >
                          {comment.video.title}
                        </Link>
                      </div>
                    </div>

                    <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>
                    </div>

                    <Link
                      to="/video/$id"
                      params={{ id: comment.videoId }}
                      className="inline-flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50 hover:bg-background hover:border-border transition-all duration-200 group-hover:shadow-sm"
                    >
                      <div className="w-20 h-14 bg-muted rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-border/20">
                        {comment.video.thumbnailUrl && (
                          <img
                            src={comment.video.thumbnailUrl}
                            alt={comment.video.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          Watch video
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Click to view the full video
                        </p>
                      </div>
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
    </div>
  );
}