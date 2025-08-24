import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { 
  Video as VideoIcon, 
  TrendingUp, 
  Clock, 
  Tag, 
  Search, 
  X,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Filter,
  Sparkles
} from "lucide-react";
import { VideoCard } from "~/components/VideoCard";
import { VideoGridSkeleton } from "~/components/VideoGridSkeleton";
import { EmptyState } from "~/components/EmptyState";
import { TagAutocomplete } from "~/components/TagAutocomplete";
import { searchVideosQuery } from "~/queries/videos";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { useState, useEffect } from "react";
import { z } from "zod";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";

const browseSearchSchema = z.object({
  q: z.string().optional(),
  tag: z.string().optional(),
  sort: z.enum(['views_asc', 'views_desc', 'date_asc', 'date_desc']).optional(),
});

export const Route = createFileRoute("/browse")({
  validateSearch: browseSearchSchema,
  loader: ({ context }) => {
    const { queryClient } = context;
    queryClient.ensureQueryData(searchVideosQuery("", 'date_desc'));
  },
  component: Browse,
});

function Browse() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [titleSearch, setTitleSearch] = useState(search?.q || "");
  const [tagFilter, setTagFilter] = useState(search?.tag || "");
  const [sortBy, setSortBy] = useState<'views_asc' | 'views_desc' | 'date_asc' | 'date_desc'>(
    search?.sort || 'date_desc'
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: videos, isLoading } = useQuery(
    searchVideosQuery(search?.q || "", sortBy)
  );

  // Auto-populate from query string
  useEffect(() => {
    if (search?.q) setTitleSearch(search.q);
    if (search?.tag) setTagFilter(search.tag);
    if (search?.sort) setSortBy(search.sort);
  }, [search]);

  const handleSearch = () => {
    navigate({
      to: "/browse",
      search: {
        ...(titleSearch.trim() && { q: titleSearch.trim() }),
        ...(tagFilter.trim() && { tag: tagFilter.trim() }),
        sort: sortBy,
      },
    });
  };

  const handleSortChange = (newSort: typeof sortBy) => {
    setSortBy(newSort);
    navigate({
      to: "/browse",
      search: {
        ...(search?.q && { q: search.q }),
        ...(search?.tag && { tag: search.tag }),
        sort: newSort,
      },
    });
  };

  const handleClearFilters = () => {
    setTitleSearch("");
    setTagFilter("");
    setSortBy('date_desc');
    navigate({
      to: "/browse",
      search: {},
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const hasActiveFilters = !!search?.q || !!search?.tag || (search?.sort && search.sort !== 'date_desc');

  const getSortLabel = () => {
    switch (sortBy) {
      case 'views_asc': return 'Views (Low to High)';
      case 'views_desc': return 'Views (High to Low)';
      case 'date_asc': return 'Oldest First';
      case 'date_desc': return 'Newest First';
      default: return 'Sort';
    }
  };

  const getSortIcon = () => {
    if (sortBy.includes('asc')) return <SortAsc className="h-4 w-4" />;
    if (sortBy.includes('desc')) return <SortDesc className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  // Filter videos by tag if tag filter is active
  const filteredVideos = videos && search?.tag 
    ? videos.filter(v => v.tags?.some(t => t.name.toLowerCase() === search.tag?.toLowerCase()))
    : videos;

  const renderFiltersPanel = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Search Videos</h3>
        </div>
        <Input
          value={titleSearch}
          onChange={(e) => setTitleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search videos by title..."
        />
      </div>

      {/* Tag Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Filter by Tag</h3>
        </div>
        <TagAutocomplete
          value={tagFilter}
          onChange={setTagFilter}
          onKeyDown={handleKeyDown}
          placeholder="Filter by tag..."
        />
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Active Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs h-auto p-1 text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {search?.q && (
              <Badge variant="default" className="px-2 py-1 text-xs">
                <Search className="w-3 h-3 mr-1" />
                <span>Title: {search.q}</span>
                <button
                  onClick={() => {
                    setTitleSearch("");
                    navigate({
                      to: "/browse",
                      search: {
                        ...(search?.tag && { tag: search.tag }),
                        sort: sortBy,
                      },
                    });
                  }}
                  className="ml-1 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
            {search?.tag && (
              <Badge variant="default" className="px-2 py-1 text-xs">
                <Tag className="w-3 h-3 mr-1" />
                <span>Tag: {search.tag}</span>
                <button
                  onClick={() => {
                    setTagFilter("");
                    navigate({
                      to: "/browse",
                      search: {
                        ...(search?.q && { q: search.q }),
                        sort: sortBy,
                      },
                    });
                  }}
                  className="ml-1 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
            {search?.sort && search.sort !== 'date_desc' && (
              <Badge variant="default" className="px-2 py-1 text-xs">
                {getSortIcon()}
                <span className="ml-1">{getSortLabel()}</span>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Full-width Header Banner */}
      <div className="w-full bg-card/50 border-b">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <VideoIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      Browse Videos
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                      Discover amazing content from our community
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile Filters */}
                <Sheet
                  open={mobileFiltersOpen}
                  onOpenChange={setMobileFiltersOpen}
                >
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                      {hasActiveFilters && (
                        <Badge
                          variant="destructive"
                          className="ml-2 h-5 w-5 p-0 flex items-center justify-center"
                        >
                          {[search?.q, search?.tag, (search?.sort !== 'date_desc' ? search?.sort : null)].filter(Boolean).length}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-primary" />
                        Filters & Search
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      {renderFiltersPanel()}
                      <div className="mt-6 pt-4 border-t">
                        <Button onClick={handleSearch} className="w-full">
                          <Search className="h-4 w-4 mr-2" />
                          Apply Filters
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Active Filters Bar */}
            {hasActiveFilters && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    <Filter className="w-3 h-3 mr-1" />
                    {[search?.q, search?.tag, (search?.sort !== 'date_desc' ? search?.sort : null)].filter(Boolean).length} filter
                    {[search?.q, search?.tag, (search?.sort !== 'date_desc' ? search?.sort : null)].filter(Boolean).length !== 1 ? "s" : ""} active
                  </Badge>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-xs h-7 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-6 mb-12">
        <div className="flex gap-6">
          {/* Left Sidebar - Filters (Desktop) */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-20">
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold">Filters</h2>
                </div>
                {renderFiltersPanel()}
                <div className="mt-6 pt-4 border-t">
                  <Button onClick={handleSearch} className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Apply Filters
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Sort Controls - aligned with filter card */}
            <div className="flex items-center justify-between mb-4 lg:px-5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {isLoading ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="font-bold">{filteredVideos?.length || 0}</span>
                      <span className="text-muted-foreground">
                        video{(filteredVideos?.length || 0) !== 1 ? "s" : ""} found
                      </span>
                    </div>
                  )}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {getSortIcon()}
                    <span className="ml-2">Sort by {getSortLabel()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleSortChange('date_desc')}>
                    <Clock className="mr-2 h-4 w-4 text-blue-500" />
                    Newest First{" "}
                    {sortBy === 'date_desc' && "↓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('date_asc')}>
                    <Clock className="mr-2 h-4 w-4 text-blue-500" />
                    Oldest First{" "}
                    {sortBy === 'date_asc' && "↑"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleSortChange('views_desc')}>
                    <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                    Most Views{" "}
                    {sortBy === 'views_desc' && "↓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('views_asc')}>
                    <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                    Least Views{" "}
                    {sortBy === 'views_asc' && "↑"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Video Grid */}
            {isLoading ? (
              <VideoGridSkeleton count={12} />
            ) : filteredVideos && filteredVideos.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 lg:px-5">
                {filteredVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            ) : (
              <div className="lg:px-5">
                <Card className="border-dashed border-2">
                  <CardContent className="p-12">
                    <EmptyState
                      icon={<VideoIcon className="w-16 h-16" />}
                      title={
                        hasActiveFilters ? "No videos found" : "No videos yet"
                      }
                      description={
                        hasActiveFilters
                          ? "Try adjusting your filters or search query to find videos."
                          : "Be the first to share amazing content with our community!"
                      }
                    />
                    {hasActiveFilters && (
                      <div className="mt-6 flex justify-center">
                        <Button
                          onClick={handleClearFilters}
                          variant="outline"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Clear all filters
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}