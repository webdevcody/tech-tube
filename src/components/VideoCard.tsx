import type { Video } from "~/db/schema";
import { Video as VideoIcon, Eye } from "lucide-react";
import { formatDuration, formatRelativeTime } from "~/utils/video";
import { Link } from "@tanstack/react-router";

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <article className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-lg hover:border-border/60 transition-all duration-200 group">
      <Link 
        to="/video/$id"
        params={{ id: video.id }}
        className="block w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl"
        aria-label={`Watch ${video.title} by ${video.userId} - ${video.viewCount.toLocaleString()} views, uploaded ${formatRelativeTime(new Date(video.createdAt).toISOString())}`}
      >
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
          {video.description && (
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
              {video.description}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {video.viewCount.toLocaleString()} views
            </span>
            <time dateTime={new Date(video.createdAt).toISOString()}>
              {formatRelativeTime(new Date(video.createdAt).toISOString())}
            </time>
          </div>
        </div>
      </Link>
    </article>
  );
}