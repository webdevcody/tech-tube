import { useQuery } from "@tanstack/react-query";
import { getCommentsByUserIdFn } from "~/fn/comments";
import { UserCommentItem } from "~/components/UserCommentItem";
import { Card, CardContent } from "~/components/ui/card";
import { EmptyState } from "~/components/EmptyState";
import { MessageSquare } from "lucide-react";

interface UserCommentsSectionProps {
  userId: string;
}

export function UserCommentsSection({ userId }: UserCommentsSectionProps) {
  const {
    data: comments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userComments", userId],
    queryFn: () => getCommentsByUserIdFn({ data: { userId } }),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex gap-4 p-4 animate-pulse">
                {/* Thumbnail skeleton */}
                <div className="w-32 h-20 bg-muted rounded-lg flex-shrink-0"></div>
                
                {/* Content skeleton */}
                <div className="flex-1 space-y-3">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 bg-muted rounded w-16"></div>
                      <div className="h-3 bg-muted rounded w-12"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-24"></div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="space-y-1">
                        <div className="h-3 bg-muted rounded w-full"></div>
                        <div className="h-3 bg-muted rounded w-5/6"></div>
                        <div className="h-3 bg-muted rounded w-4/6"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-3 bg-muted rounded w-20"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <EmptyState
            icon={<MessageSquare className="w-12 h-12" />}
            title="Failed to load comments"
            description="There was an error loading the user's comments. Please try again."
          />
        </CardContent>
      </Card>
    );
  }

  if (comments.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <EmptyState
            icon={<MessageSquare className="w-12 h-12" />}
            title="No comments yet"
            description="This user hasn't left any comments on videos yet."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        {comments.length} comment{comments.length !== 1 ? 's' : ''} across all videos
      </div>
      
      {comments.map((comment) => (
        <UserCommentItem key={comment.id} comment={comment} userId={userId} />
      ))}
    </div>
  );
}