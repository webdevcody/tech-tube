import { Button } from "~/components/ui/button";
import { Heart } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleCommentLikeFn } from "~/fn/comments";
import { toast } from "sonner";
import { authClient } from "~/lib/auth-client";
import { cn } from "~/lib/utils";

interface CommentLikeButtonProps {
  commentId: string;
  likeCount: number;
  isLiked: boolean;
  videoId?: string; // For invalidating video comments
  userId?: string; // For invalidating user comments
}

export function CommentLikeButton({
  commentId,
  likeCount,
  isLiked,
  videoId,
  userId,
}: CommentLikeButtonProps) {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  const toggleLikeMutation = useMutation({
    mutationFn: (commentId: string) =>
      toggleCommentLikeFn({ data: { commentId } }),
    onSuccess: () => {
      // Invalidate relevant queries to refresh the UI
      if (videoId) {
        queryClient.invalidateQueries({ queryKey: ["comments", videoId] });
      }
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["userComments", userId] });
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to toggle like");
    },
  });

  const handleToggleLike = () => {
    if (!session) {
      toast.error("Please sign in to like comments");
      return;
    }

    toggleLikeMutation.mutate(commentId);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggleLike}
      disabled={!session || toggleLikeMutation.isPending}
      className={cn(
        "flex items-center gap-1 h-8 px-2 text-xs",
        isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Heart
        className={cn(
          "h-3 w-3 transition-all duration-200",
          isLiked ? "fill-current" : ""
        )}
      />
      <span>{likeCount}</span>
      {toggleLikeMutation.isPending && (
        <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent ml-1" />
      )}
    </Button>
  );
}