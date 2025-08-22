import { formatRelativeTime } from "~/utils/video";
import { Card, CardContent } from "~/components/ui/card";
import { CommentLikeButton } from "~/components/CommentLikeButton";
import { Link } from "@tanstack/react-router";
import { Video as VideoIcon, Eye, MessageSquare } from "lucide-react";
import type { CommentWithVideo } from "~/data-access/comments";

interface UserCommentItemProps {
  comment: CommentWithVideo;
  userId: string;
}

export function UserCommentItem({ comment, userId }: UserCommentItemProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 group">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Video Thumbnail */}
          <Link
            to="/video/$id"
            params={{ id: comment.video.id }}
            className="flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
          >
            <div className="w-32 h-20 bg-muted rounded-lg overflow-hidden relative">
              {comment.video.thumbnailUrl ? (
                <img
                  src={comment.video.thumbnailUrl}
                  alt={comment.video.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <VideoIcon className="h-6 w-6 text-muted-foreground/50" />
                </div>
              )}
            </div>
          </Link>

          {/* Comment Content */}
          <div className="flex-1 space-y-3">
            {/* Video Title and Link */}
            <div>
              <Link
                to="/video/$id"
                params={{ id: comment.video.id }}
                className="font-semibold text-sm hover:text-primary transition-colors duration-200 line-clamp-2"
              >
                {comment.video.title}
              </Link>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {comment.video.viewCount.toLocaleString()} views
                </span>
                <span>•</span>
                <span>
                  {formatRelativeTime(new Date(comment.video.createdAt).toISOString())}
                </span>
              </div>
            </div>

            {/* Comment Text */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>Commented {formatRelativeTime(new Date(comment.createdAt).toISOString())}</span>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-foreground whitespace-pre-wrap break-words line-clamp-3">
                  {comment.content}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between">
              <CommentLikeButton
                commentId={comment.id}
                likeCount={comment.likeCount}
                isLiked={comment.isLikedByUser}
                userId={userId}
              />
              
              <Link
                to="/video/$id"
                params={{ id: comment.video.id }}
                className="inline-flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors duration-200 font-medium"
              >
                <VideoIcon className="h-3 w-3" />
                Watch video
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}