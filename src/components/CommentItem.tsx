import { formatRelativeTime } from "~/utils/video";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { CommentLikeButton } from "~/components/CommentLikeButton";
import { Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCommentFn } from "~/fn/comments";
import { toast } from "sonner";
import { authClient } from "~/lib/auth-client";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { CommentWithUser } from "~/data-access/comments";

interface CommentItemProps {
  comment: CommentWithUser;
  videoId: string;
}

export function CommentItem({ comment, videoId }: CommentItemProps) {
  const { data: session } = authClient.useSession();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) =>
      deleteCommentFn({ data: { commentId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", videoId] });
      toast.success("Comment deleted successfully!");
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete comment");
    },
  });

  const handleDeleteComment = () => {
    deleteCommentMutation.mutate(comment.id);
  };

  const canDeleteComment = session?.user.id === comment.userId;

  return (
    <div className="flex gap-3 p-4 border-b border-border/50 last:border-b-0">
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              to="/profile/$id"
              params={{ id: comment.user.id }}
              className="font-semibold text-sm hover:text-primary transition-colors duration-200"
            >
              {comment.user.name}
            </Link>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(new Date(comment.createdAt).toISOString())}
            </span>
          </div>

          {canDeleteComment && (
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete comment</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Comment</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this comment? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteComment}
                    disabled={deleteCommentMutation.isPending}
                  >
                    {deleteCommentMutation.isPending ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Comment"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <p className="text-sm text-foreground whitespace-pre-wrap break-words">
          {comment.content}
        </p>

        {/* Like Button */}
        <div className="flex items-center">
          <CommentLikeButton
            commentId={comment.id}
            likeCount={comment.likeCount}
            isLiked={comment.isLikedByUser}
            videoId={videoId}
          />
        </div>
      </div>
    </div>
  );
}