import { useQuery } from "@tanstack/react-query";
import { getCommentsByVideoIdFn } from "~/fn/comments";
import { CommentForm } from "~/components/CommentForm";
import { CommentItem } from "~/components/CommentItem";
import { authClient } from "~/lib/auth-client";
import { MessageCircle } from "lucide-react";

interface CommentsSectionProps {
  videoId: string;
}

export function CommentsSection({ videoId }: CommentsSectionProps) {
  const { data: session } = authClient.useSession();

  const {
    data: comments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["comments", videoId],
    queryFn: () => getCommentsByVideoIdFn({ data: { videoId } }),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments
        </h3>

        {session && (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-24 bg-muted rounded-lg mb-4"></div>
              <div className="h-10 bg-muted rounded w-32"></div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 p-4 animate-pulse">
              <div className="h-10 w-10 bg-muted rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                </div>
                <div className="space-y-1">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments
        </h3>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Failed to load comments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        Comments ({comments.length})
      </h3>

      {session && (
        <div className="bg-muted/30 rounded-lg p-4">
          <CommentForm videoId={videoId} />
        </div>
      )}

      {!session && (
        <div className="bg-muted/30 rounded-lg p-4 text-center">
          <p className="text-muted-foreground">
            Please sign in to leave a comment
          </p>
        </div>
      )}

      <div className="space-y-0">
        {comments.length === 0 ? (
          <div className="text-center py-8 bg-muted/30 rounded-lg">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No comments yet. Be the first to leave a comment!
            </p>
          </div>
        ) : (
          <div className="bg-muted/30 rounded-lg divide-y divide-border/50">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                videoId={videoId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}