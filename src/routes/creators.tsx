import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { getAllTagsFn, getCreatorsFn } from "~/fn/tags";
import { Page } from "~/components/Page";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Input } from "~/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import {
  User,
  Video,
  Search,
  X,
  Filter,
  SortAsc,
  SortDesc,
  Users,
  Calendar,
  Sparkles,
  TrendingUp,
  Award,
  Hash,
  Palette,
  Code,
  Music,
  Camera,
  Gamepad2,
  BookOpen,
  Cpu,
  Globe,
  Heart,
  Star,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { EmptyState } from "~/components/EmptyState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

const creatorsQueryOptions = (tags?: string[]) => ({
  queryKey: ["creators", tags],
  queryFn: () => getCreatorsFn({ data: tags ? { tags } : undefined }),
});

const tagsQueryOptions = () => ({
  queryKey: ["allTags"],
  queryFn: () => getAllTagsFn(),
});

export const Route = createFileRoute("/creators")({
  loader: ({ context: { queryClient } }) => {
    return Promise.all([
      queryClient.ensureQueryData(creatorsQueryOptions()),
      queryClient.ensureQueryData(tagsQueryOptions()),
    ]);
  },
  component: CreatorsPage,
});

type SortOption = "name" | "videos" | "recent";
type SortOrder = "asc" | "desc";

// Tag category icons mapping
const getTagIcon = (tagName: string) => {
  const tag = tagName.toLowerCase();
  if (tag.includes("design") || tag.includes("ui") || tag.includes("ux"))
    return Palette;
  if (tag.includes("code") || tag.includes("program") || tag.includes("dev"))
    return Code;
  if (tag.includes("music") || tag.includes("audio")) return Music;
  if (tag.includes("video") || tag.includes("photo")) return Camera;
  if (tag.includes("game") || tag.includes("gaming")) return Gamepad2;
  if (tag.includes("tutorial") || tag.includes("education")) return BookOpen;
  if (tag.includes("tech") || tag.includes("ai") || tag.includes("ml"))
    return Cpu;
  if (tag.includes("web") || tag.includes("internet")) return Globe;
  return Hash;
};

// Generate creator color based on name
const getCreatorColor = (name: string) => {
  const colors = [
    "from-purple-500 to-pink-500",
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-purple-500",
    "from-pink-500 to-rose-500",
    "from-teal-500 to-green-500",
    "from-yellow-500 to-orange-500",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

function CreatorsPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: allTags = [] } = useSuspenseQuery(tagsQueryOptions());
  const { data: rawCreators = [], isLoading } = useQuery(
    creatorsQueryOptions(selectedTags.length > 0 ? selectedTags : undefined)
  );

  const filteredTags = allTags.filter((tag) =>
    tag.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  // Filter and sort creators
  const creators = useMemo(() => {
    let filtered = rawCreators;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (creator) =>
          creator.name.toLowerCase().includes(query) ||
          creator.bio?.toLowerCase().includes(query) ||
          creator.tags.some((tag) => tag.name.toLowerCase().includes(query))
      );
    }

    // Sort creators
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "videos":
          comparison = a.videoCount - b.videoCount;
          break;
        case "recent":
          // For now, sort by name as we don't have creation date
          comparison = a.name.localeCompare(b.name);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [rawCreators, searchQuery, sortBy, sortOrder]);

  const handleTagSelect = (tagName: string) => {
    if (!selectedTags.includes(tagName)) {
      setSelectedTags([...selectedTags, tagName]);
    }
    setSearchInput("");
  };

  const handleTagRemove = (tagName: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagName));
  };

  const clearAllTags = () => {
    setSelectedTags([]);
  };

  const handleSortChange = (option: SortOption) => {
    if (sortBy === option) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(option);
      setSortOrder("asc");
    }
  };

  const getSortLabel = () => {
    const labels = {
      name: "Name",
      videos: "Video Count",
      recent: "Recently Joined",
    };
    return labels[sortBy];
  };

  const renderFiltersPanel = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Search Creators</h3>
        </div>
        <Input
          placeholder="Search by name, bio, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Active Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllTags}
              className="text-xs h-auto p-1 text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => {
              const TagIcon = getTagIcon(tag);
              return (
                <Badge
                  key={tag}
                  variant="default"
                  className="px-2 py-1 text-xs"
                >
                  <TagIcon className="w-3 h-3 mr-1" />
                  <span>{tag}</span>
                  <button
                    onClick={() => handleTagRemove(tag)}
                    className="ml-1 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Tag Search */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Filter by Tags</h3>
        </div>
        <Input
          placeholder="Search tags..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        {/* Available Tags */}
        {searchInput.trim() && (
          <div className="space-y-2">
            <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
              {filteredTags
                .filter((tag) => !selectedTags.includes(tag.name))
                .map((tag) => {
                  const TagIcon = getTagIcon(tag.name);
                  return (
                    <Button
                      key={tag.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTagSelect(tag.name)}
                      className="w-full justify-start text-xs h-9"
                    >
                      <TagIcon className="w-3 h-3 mr-2 text-muted-foreground" />
                      {tag.name}
                    </Button>
                  );
                })}
              {filteredTags.filter((tag) => !selectedTags.includes(tag.name))
                .length === 0 && (
                <p className="text-xs text-muted-foreground p-2">
                  No tags found matching "{searchInput}"
                </p>
              )}
            </div>
          </div>
        )}

        {/* Popular Tags */}
        {!searchInput.trim() && allTags.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Popular Tags
            </p>
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 8).map((tag) => {
                const TagIcon = getTagIcon(tag.name);
                return (
                  <Button
                    key={tag.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTagSelect(tag.name)}
                    disabled={selectedTags.includes(tag.name)}
                    className="text-xs h-7"
                  >
                    <TagIcon className="w-3 h-3 mr-1" />
                    {tag.name}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>
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
                  <div className="p-2 bg-destructive/10 rounded-lg">
                    <Users className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      Discover Creators
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                      Find talented creators and explore their content
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
                      {selectedTags.length > 0 && (
                        <Badge
                          variant="destructive"
                          className="ml-2 h-5 w-5 p-0 flex items-center justify-center"
                        >
                          {selectedTags.length}
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
                    <div className="mt-6">{renderFiltersPanel()}</div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Active Filters Bar */}
            {(selectedTags.length > 0 || searchQuery.trim()) && (
              <div className="flex items-center gap-4">
                {selectedTags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      <Filter className="w-3 h-3 mr-1" />
                      {selectedTags.length} filter
                      {selectedTags.length !== 1 ? "s" : ""} active
                    </Badge>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedTags([]);
                    setSearchQuery("");
                  }}
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
                  <Filter className="w-5 h-5 text-destructive" />
                  <h2 className="font-semibold">Filters</h2>
                </div>
                {renderFiltersPanel()}
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
                      <span className="font-bold">{creators.length}</span>
                      <span className="text-muted-foreground">
                        creator{creators.length !== 1 ? "s" : ""} found
                      </span>
                    </div>
                  )}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {sortOrder === "asc" ? (
                      <SortAsc className="h-4 w-4 mr-2" />
                    ) : (
                      <SortDesc className="h-4 w-4 mr-2" />
                    )}
                    Sort by {getSortLabel()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleSortChange("name")}>
                    <Users className="mr-2 h-4 w-4 text-blue-500" />
                    Name{" "}
                    {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange("videos")}>
                    <Video className="mr-2 h-4 w-4 text-green-500" />
                    Video Count{" "}
                    {sortBy === "videos" && (sortOrder === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange("recent")}>
                    <Calendar className="mr-2 h-4 w-4 text-purple-500" />
                    Recently Joined{" "}
                    {sortBy === "recent" && (sortOrder === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:px-5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-muted rounded-full" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                      </div>
                      <div className="mt-4 flex gap-1">
                        <div className="h-5 bg-muted rounded-full w-12" />
                        <div className="h-5 bg-muted rounded-full w-16" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : creators.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:px-5">
                {creators.map((creator) => {
                  const gradientColor = getCreatorColor(creator.name);
                  return (
                    <Link
                      key={creator.id}
                      to="/profile/$id"
                      params={{ id: creator.id }}
                      className="block group"
                    >
                      <Card className="hover:shadow-lg hover:border-destructive/20 transition-all duration-200 cursor-pointer h-full group-hover:-translate-y-1">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="relative">
                              <Avatar className="w-12 h-12 border-2 border-background shadow-md">
                                <AvatarImage
                                  src={creator.image || undefined}
                                  alt={creator.name}
                                />
                                <AvatarFallback className="bg-destructive/10">
                                  <User className="w-6 h-6 text-destructive" />
                                </AvatarFallback>
                              </Avatar>
                              {creator.videoCount > 10 && (
                                <div className="absolute -top-1 -right-1 p-1 bg-destructive rounded-full">
                                  <Star className="w-3 h-3 text-white fill-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate text-sm group-hover:text-destructive transition-colors">
                                {creator.name}
                              </h3>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Video className="w-3 h-3" />
                                  <span className="font-medium">
                                    {creator.videoCount}
                                  </span>{" "}
                                  videos
                                </span>
                                {creator.videoCount > 5 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] px-1.5 py-0"
                                  >
                                    Active
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mb-4 min-h-[2.5rem]">
                            {creator.bio ? (
                              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                {creator.bio}
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground/50 italic">
                                No bio provided
                              </p>
                            )}
                          </div>

                          <div className="mt-auto">
                            {creator.tags.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {creator.tags.slice(0, 4).map((tag) => {
                                  const TagIcon = getTagIcon(tag.name);
                                  return (
                                    <Badge
                                      key={tag.id}
                                      variant="secondary"
                                      className="text-[10px] px-2 py-0.5"
                                    >
                                      <TagIcon className="w-2.5 h-2.5 mr-0.5" />
                                      {tag.name}
                                    </Badge>
                                  );
                                })}
                                {creator.tags.length > 4 && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] px-2 py-0.5"
                                  >
                                    +{creator.tags.length - 4}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-muted-foreground/50">
                                <Hash className="w-3 h-3" />
                                <span className="text-[10px] italic">
                                  No tags
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Hover Action */}
                          <div className="mt-4 pt-4 border-t flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs text-destructive font-medium flex items-center gap-1">
                              View Profile
                              <TrendingUp className="w-3 h-3" />
                            </span>
                            <Heart className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="lg:px-5">
                <Card className="border-dashed border-2">
                  <CardContent className="p-12">
                    <EmptyState
                      icon={<User className="w-16 h-16" />}
                      title={
                        selectedTags.length > 0 || searchQuery.trim()
                          ? "No creators found"
                          : "No creators yet"
                      }
                      description={
                        selectedTags.length > 0 || searchQuery.trim()
                          ? "Try adjusting your filters or search query to find creators."
                          : "Be the first to create content and inspire others!"
                      }
                    />
                    {(selectedTags.length > 0 || searchQuery.trim()) && (
                      <div className="mt-6 flex justify-center">
                        <Button
                          onClick={() => {
                            clearAllTags();
                            setSearchQuery("");
                          }}
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
