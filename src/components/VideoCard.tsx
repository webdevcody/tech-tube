import type { Video } from "~/db/schema";
import type { VideoWithLikes } from "~/data-access/videos";
import { Video as VideoIcon, Eye, Heart, User, Tag } from "lucide-react";
import { formatDuration, formatRelativeTime } from "~/utils/video";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { likeVideoFn, unlikeVideoFn, getVideoLikeStatusFn } from "~/fn/videos";
import { authClient } from "~/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";

interface VideoCardProps {
  video: VideoWithLikes;
}

function LikeButton({
  videoId,
  className,
}: {
  videoId: string;
  className?: string;
}) {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  const { data: likeStatus } = useQuery({
    queryKey: ["video-like-status", videoId, session?.user?.id],
    queryFn: () =>
      getVideoLikeStatusFn({ data: { videoId, userId: session?.user?.id } }),
    enabled: !!session?.user?.id,
  });

  const likeMutation = useMutation({
    mutationFn: (isLiked: boolean) =>
      isLiked
        ? unlikeVideoFn({ data: { videoId } })
        : likeVideoFn({ data: { videoId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["video-like-status", videoId],
      });
      queryClient.invalidateQueries({ queryKey: ["recent-videos"] });
      queryClient.invalidateQueries({ queryKey: ["popular-videos"] });
    },
  });

  if (!session?.user) {
    return null;
  }

  const isLiked = likeStatus?.isLiked || false;
  const likeCount = likeStatus?.likeCount || 0;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        likeMutation.mutate(isLiked);
      }}
      disabled={likeMutation.isPending}
      className={`flex items-center gap-1 text-xs transition-colors hover:text-red-500 ${
        isLiked ? "text-red-500" : "text-muted-foreground"
      } ${className}`}
      aria-label={isLiked ? "Unlike video" : "Like video"}
    >
      <Heart className={`h-3 w-3 ${isLiked ? "fill-current" : ""}`} />
      {likeCount > 0 && likeCount.toLocaleString()}
    </button>
  );
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link
      to="/video/$id"
      params={{ id: video.id }}
      className="block w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl"
      aria-label={`Watch ${video.title} by ${video.user.name} - ${video.viewCount.toLocaleString()} views, uploaded ${formatRelativeTime(new Date(video.createdAt).toISOString())}`}
    >
      <article className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-lg hover:border-border/60 transition-all duration-200 group h-full">
        <div className="aspect-video bg-muted relative overflow-hidden">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <VideoIcon className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          {video.duration && (
            <span className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm text-foreground text-xs px-2 py-1 rounded-md font-medium border border-border/20">
              {formatDuration(video.duration)}
            </span>
          )}
        </div>
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {video.tags.slice(0, 3).map((tag) => (
                <Badge 
                  key={tag.id} 
                  variant="secondary" 
                  className="text-xs px-2 py-0.5 bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  <Tag className="h-2.5 w-2.5 mr-1" />
                  {tag.name}
                </Badge>
              ))}
              {video.tags.length > 3 && (
                <Badge 
                  variant="outline" 
                  className="text-xs px-2 py-0.5 text-muted-foreground"
                >
                  +{video.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={video.user.image || undefined} alt={video.user.name} />
              <AvatarFallback className="text-xs bg-primary/10">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {video.user.name}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {video.viewCount.toLocaleString()} views
                </span>
                <time dateTime={new Date(video.createdAt).toISOString()}>
                  {formatRelativeTime(new Date(video.createdAt).toISOString())}
                </time>
                <LikeButton videoId={video.id} />
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
