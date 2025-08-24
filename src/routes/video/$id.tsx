import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  useSuspenseQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getVideoByIdFn,
  incrementViewCountFn,
  likeVideoFn,
  unlikeVideoFn,
  getVideoLikeStatusFn,
  getVideoTagsFn,
  getRelatedVideosFn,
} from "~/fn/videos";
import { Page } from "~/components/Page";
import { CommentsSection } from "~/components/CommentsSection";
import { CloudinaryVideoPlayer } from "./-video-player";
import { useEffect } from "react";
import { formatDuration } from "~/utils/video";
import { Heart, Eye, Edit, Tag } from "lucide-react";
import { authClient } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { TranscriptDialog } from "~/components/TranscriptDialog";

const videoQueryOptions = (id: string) => ({
  queryKey: ["video", id],
  queryFn: () => getVideoByIdFn({ data: { id } }),
});

function VideoLikeButton({ videoId }: { videoId: string }) {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  const { data: likeStatus } = useQuery({
    queryKey: ["video-like-status", videoId, session?.user?.id],
    queryFn: () =>
      getVideoLikeStatusFn({ data: { videoId, userId: session?.user?.id } }),
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
    },
  });

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Heart className="h-4 w-4" />
        <span>{likeStatus?.likeCount || 0} likes</span>
      </div>
    );
  }

  const isLiked = likeStatus?.isLiked || false;
  const likeCount = likeStatus?.likeCount || 0;

  return (
    <button
      onClick={() => likeMutation.mutate(isLiked)}
      disabled={likeMutation.isPending}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
        isLiked
          ? "bg-red-500/10 border-red-500 text-red-500"
          : "bg-background border-border hover:bg-muted"
      }`}
      aria-label={isLiked ? "Unlike video" : "Like video"}
    >
      <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
      <span className="text-sm font-medium">
        {likeCount} {likeCount === 1 ? "like" : "likes"}
      </span>
    </button>
  );
}

function RelatedVideos({ currentVideoId, tagNames }: { currentVideoId: string; tagNames: string[] }) {
  const { data: relatedVideos = [], isLoading } = useQuery({
    queryKey: ["related-videos", currentVideoId, tagNames],
    queryFn: () => getRelatedVideosFn({ data: { videoId: currentVideoId, tagNames, limit: 5 } }),
    enabled: tagNames.length > 0,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Related Videos</h3>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-32 h-20 bg-muted rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedVideos.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Related Videos</h3>
        <p className="text-sm text-muted-foreground">No related videos found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Related Videos</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {relatedVideos.map((video) => (
          <Link
            key={video.id}
            to="/video/$id"
            params={{ id: video.id }}
            className="flex gap-3 group hover:bg-muted/50 p-2 rounded-lg transition-colors"
          >
            <div className="relative w-32 h-20 bg-black rounded overflow-hidden flex-shrink-0">
              <img
                src={video.thumbnailUrl || ''}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              {video.duration && (
                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                  {formatDuration(video.duration)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {video.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {video.user.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span>{video.viewCount} views</span>
                <span>•</span>
                <span>{formatRelativeTime(new Date(video.createdAt))}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/video/$id")({
  loader: ({ context: { queryClient }, params: { id } }) => {
    queryClient.ensureQueryData(videoQueryOptions(id));
  },
  component: VideoDetail,
});

function VideoDetail() {
  const { id } = Route.useParams();
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const {
    data: video,
    isLoading,
    error,
  } = useSuspenseQuery(videoQueryOptions(id));

  const { data: videoTags = [] } = useQuery({
    queryKey: ["videoTags", id],
    queryFn: () => getVideoTagsFn({ data: { videoId: id } }),
  });

  const incrementViewMutation = useMutation({
    mutationFn: incrementViewCountFn,
  });

  const isOwner = session?.user?.id === video.userId;

  useEffect(() => {
    incrementViewMutation.mutate({ data: { id } });
  }, [id]);

  const tagNames = videoTags.map(vt => vt.tag.name);

  return (
    <Page>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Video Player and Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {error ? (
              <div className="text-center text-destructive">
                <p>Error loading video</p>
              </div>
            ) : (
              <CloudinaryVideoPlayer publicId={video.cloudinaryId} />
            )}
          </div>
          
          {/* Video Info */}
          <div className="space-y-4">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold flex-1">{video.title}</h1>
                {isOwner && (
                  <Link to="/video/edit/$id" params={{ id: video.id }}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {video.viewCount} views
                  </span>
                  <span>•</span>
                  <span>
                    {isLoading
                      ? "Loading..."
                      : formatRelativeTime(new Date(video.createdAt))}
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
                <div className="flex items-center gap-3">
                  <TranscriptDialog videoId={video.id} />
                  <VideoLikeButton videoId={video.id} />
                </div>
              </div>
            </div>

            {videoTags.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <h3 className="font-semibold text-sm">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {videoTags.map((videoTag) => (
                    <Badge
                      key={videoTag.id}
                      variant="secondary"
                      className="text-md cursor-pointer hover:bg-secondary/80 transition-colors"
                      onClick={() =>
                        navigate({
                          to: "/browse",
                          search: { tag: videoTag.tag.name },
                        })
                      }
                    >
                      {videoTag.tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {video.description && (
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm whitespace-pre-wrap">
                  {video.description}
                </p>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <CommentsSection videoId={video.id} />
        </div>

        {/* Right Column - Related Videos */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <RelatedVideos currentVideoId={video.id} tagNames={tagNames} />
          </div>
        </div>
      </div>
    </Page>
  );
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
