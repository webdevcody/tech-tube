import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Video as VideoIcon, TrendingUp, Clock, Tag, Search, X } from "lucide-react";
import { VideoCard } from "~/components/VideoCard";
import { VideoGridSkeleton } from "~/components/VideoGridSkeleton";
import { EmptyState } from "~/components/EmptyState";
import { Page } from "~/components/Page";
import { PageTitle } from "~/components/PageTitle";
import { TagAutocomplete } from "~/components/TagAutocomplete";
import { getRecentVideosQuery, getPopularVideosQuery, getVideosByTagQuery } from "~/queries/videos";
import { Button } from "~/components/ui/button";
import { useState, useEffect } from "react";
import { z } from "zod";

const browseSearchSchema = z.object({
  tag: z.string().optional(),
});

export const Route = createFileRoute("/browse")({
  validateSearch: browseSearchSchema,
  loader: ({ context, search }) => {
    const { queryClient } = context;
    if (search?.tag) {
      queryClient.ensureQueryData(getVideosByTagQuery(search.tag));
    } else {
      queryClient.ensureQueryData(getRecentVideosQuery());
      queryClient.ensureQueryData(getPopularVideosQuery());
    }
  },
  component: Browse,
});

function Browse() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [tagFilter, setTagFilter] = useState(search?.tag || "");

  const { data: recentVideos, isLoading: isLoadingRecent } = useQuery(getRecentVideosQuery());
  const { data: popularVideos, isLoading: isLoadingPopular } = useQuery(getPopularVideosQuery());
  const { data: taggedVideos, isLoading: isLoadingTagged } = useQuery({
    ...getVideosByTagQuery(search?.tag || ""),
    enabled: !!search?.tag,
  });

  // Auto-populate tag filter from query string
  useEffect(() => {
    if (search?.tag) {
      setTagFilter(search.tag);
    }
  }, [search?.tag]);

  const handleTagSearch = () => {
    if (tagFilter.trim()) {
      navigate({
        to: "/browse",
        search: { tag: tagFilter.trim() },
      });
    }
  };

  const handleClearTag = () => {
    setTagFilter("");
    navigate({
      to: "/browse",
      search: {},
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTagSearch();
    }
  };

  // If we're filtering by tag, show only tagged videos
  if (search?.tag) {
    return (
      <Page>
        <div className="space-y-8">
          <PageTitle
            title="Browse Videos"
            description="Discover amazing content from our community"
          />

          {/* Tag Filter UI */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 flex gap-2">
              <TagAutocomplete
                value={tagFilter}
                onChange={setTagFilter}
                onKeyDown={handleKeyDown}
                placeholder="Filter by tag..."
                className="flex-1"
              />
              <Button onClick={handleTagSearch} size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              {search?.tag && (
                <Button onClick={handleClearTag} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Tagged Videos Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <Tag className="h-6 w-6 text-primary" />
                  Videos tagged with "{search?.tag}"
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  All videos with the tag "{search?.tag}"
                </p>
              </div>
            </div>
            {isLoadingTagged ? (
              <VideoGridSkeleton count={5} />
            ) : taggedVideos && taggedVideos.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {taggedVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Tag className="h-10 w-10 text-primary/60" />}
                title={`No videos found with tag "${search?.tag}"`}
                description="Try browsing other content or search for a different tag."
                actionLabel="Browse All Videos"
                onAction={handleClearTag}
              />
            )}
          </section>
        </div>
      </Page>
    );
  }

  // Default view - show popular and recent videos
  return (
    <Page>
      <div className="space-y-8">
        <PageTitle
          title="Browse Videos"
          description="Discover amazing content from our community"
        />

        {/* Tag Filter UI */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 flex gap-2">
            <TagAutocomplete
              value={tagFilter}
              onChange={setTagFilter}
              onKeyDown={handleKeyDown}
              placeholder="Filter by tag..."
              className="flex-1"
            />
            <Button onClick={handleTagSearch} size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        <section className="space-y-6" aria-labelledby="popular-heading">
          <div className="flex items-center justify-between border-b border-border/30 pb-3">
            <div>
              <h2
                id="popular-heading"
                className="text-2xl font-bold tracking-tight flex items-center gap-2"
              >
                <TrendingUp className="h-6 w-6 text-primary" />
                Popular Videos
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Trending content from our community
              </p>
            </div>
          </div>
          {isLoadingPopular ? (
            <VideoGridSkeleton count={5} />
          ) : popularVideos && popularVideos.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {popularVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<VideoIcon className="h-10 w-10 text-primary/60" />}
              title="No popular videos yet"
              description="Be the first to share amazing content with our community. Popular videos will appear here as they gain traction."
              actionLabel="Upload Your Video"
              onAction={() => {
                navigate({ to: "/upload" });
              }}
            />
          )}
        </section>

        <section className="space-y-6" aria-labelledby="recent-heading">
          <div className="flex items-center justify-between border-b border-border/30 pb-3">
            <div>
              <h2
                id="recent-heading"
                className="text-2xl font-bold tracking-tight flex items-center gap-2"
              >
                <Clock className="h-6 w-6 text-primary" />
                Recent Videos
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Latest uploads from creators
              </p>
            </div>
          </div>
          {isLoadingRecent ? (
            <VideoGridSkeleton count={5} />
          ) : recentVideos && recentVideos.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {recentVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<VideoIcon className="h-10 w-10 text-primary/60" />}
              title="No recent videos yet"
              description="Be the first to share fresh content with our community. Recent videos will appear here as creators upload new content."
              actionLabel="Get Started"
              onAction={() => {
                // TODO: Navigate to getting started page when available
                console.log("Navigate to getting started");
              }}
            />
          )}
        </section>
      </div>
    </Page>
  );
}
