import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getVideoByIdFn } from "~/fn/videos";
import { Page } from "~/components/Page";
import { useEffect, useState } from "react";
import { publicEnv } from "~/config/publicEnv";
import { CommentsSection } from "~/components/CommentsSection";

interface CloudinaryVideoPlayerProps {
  publicId?: string;
}

function CloudinaryVideoPlayer({ publicId }: CloudinaryVideoPlayerProps) {
  if (!publicId) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
        Video not available
      </div>
    );
  }

  return (
    <iframe 
      src={`https://player.cloudinary.com/embed/?cloud_name=${publicEnv.cloudName}&public_id=${publicId}`}
      width="640"
      height="360"
      style={{ height: "auto", width: "100%", aspectRatio: "640/360" }}
      allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
      allowFullScreen
      className="w-full h-full"
    />
  );
}

const videoQueryOptions = (id: string) => ({
  queryKey: ["video", id],
  queryFn: () => getVideoByIdFn({ data: { id } }),
});

export const Route = createFileRoute("/video/$id")({
  loader: ({ context: { queryClient }, params: { id } }) => {
    queryClient.ensureQueryData(videoQueryOptions(id));
  },
  component: VideoDetail,
});

function VideoDetail() {
  const { id } = Route.useParams();
  const {
    data: video,
    isLoading,
    error,
  } = useSuspenseQuery(videoQueryOptions(id));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading) {
    return (
      <Page>
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="aspect-video bg-muted rounded-lg mb-4"></div>
            <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </Page>
    );
  }

  if (error || !video) {
    return (
      <Page>
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">
            Video Not Found
          </h1>
          <p className="text-muted-foreground">
            The video you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="space-y-8">
        <div className="space-y-6">
          {/* Video Player */}
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {video.cloudinaryId ? (
              <CloudinaryVideoPlayer publicId={video.cloudinaryId} />
            ) : (
              <video
                className="w-full h-full"
                controls
                poster={video.thumbnailUrl || undefined}
              >
                <source src={video.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          {/* Video Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{video.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{video.viewCount} views</span>
                <span>•</span>
                <span>
                  {mounted
                    ? formatRelativeTime(new Date(video.createdAt))
                    : new Date(video.createdAt).toLocaleDateString()}
                </span>
                <span>•</span>
                <span className="capitalize">{video.status}</span>
                {video.duration && (
                  <>
                    <span>•</span>
                    <span>{formatDuration(video.duration)}</span>
                  </>
                )}
              </div>
            </div>

            {video.description && (
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm whitespace-pre-wrap">
                  {video.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <CommentsSection videoId={video.id} />
      </div>
    </Page>
  );
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return "just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  } else {
    return date.toLocaleDateString();
  }
}
