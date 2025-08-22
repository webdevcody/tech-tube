import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { getAllTagsFn, getCreatorsFn } from "~/fn/tags";
import { Page } from "~/components/Page";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Input } from "~/components/ui/input";
import { User, Video, Search, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { EmptyState } from "~/components/EmptyState";

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

function CreatorsPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");

  const { data: allTags = [] } = useSuspenseQuery(tagsQueryOptions());
  const { data: creators = [], isLoading } = useQuery(creatorsQueryOptions(selectedTags.length > 0 ? selectedTags : undefined));

  const filteredTags = allTags.filter((tag) =>
    tag.name.toLowerCase().includes(searchInput.toLowerCase())
  );

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

  return (
    <Page>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Discover Creators</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find creators based on their interests and expertise. Use tags to filter creators by their skills and topics.
          </p>
        </div>

        {/* Tag Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Filter by Tags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Selected Tags:</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllTags}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="default" className="px-3 py-1">
                      <span>{tag}</span>
                      <button
                        onClick={() => handleTagRemove(tag)}
                        className="ml-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tag Search */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Search Tags:</p>
              <Input
                placeholder="Search for tags (e.g., React, JavaScript, Design...)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="max-w-md"
              />
            </div>

            {/* Available Tags */}
            {searchInput.trim() && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Available Tags:</p>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {filteredTags
                    .filter((tag) => !selectedTags.includes(tag.name))
                    .map((tag) => (
                      <Button
                        key={tag.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleTagSelect(tag.name)}
                        className="text-left justify-start"
                      >
                        {tag.name}
                      </Button>
                    ))}
                  {filteredTags.filter((tag) => !selectedTags.includes(tag.name)).length === 0 && (
                    <p className="text-sm text-muted-foreground">No tags found matching "{searchInput}"</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Creators Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {selectedTags.length > 0 ? "Filtered Creators" : "All Creators"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading..." : `${creators.length} creator${creators.length !== 1 ? "s" : ""} found`}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-full" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : creators.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creators.map((creator) => (
                <Link
                  key={creator.id}
                  to="/profile/$id"
                  params={{ id: creator.id }}
                  className="flex"
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer flex-1 flex flex-col">
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={creator.image || undefined} alt={creator.name} />
                          <AvatarFallback className="bg-primary/10">
                            <User className="w-6 h-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{creator.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Video className="w-3 h-3" />
                            {creator.videoCount} video{creator.videoCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-4 min-h-[2.5rem]">
                        {creator.bio ? (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {creator.bio}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground/50 italic">
                            No bio provided
                          </p>
                        )}
                      </div>

                      <div className="mt-auto">
                        {creator.tags.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Tags:</p>
                            <div className="flex flex-wrap gap-1">
                              {creator.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag.id} variant="secondary" className="text-xs">
                                  {tag.name}
                                </Badge>
                              ))}
                              {creator.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{creator.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Tags:</p>
                            <p className="text-xs text-muted-foreground/50 italic">
                              No tags added
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8">
                <EmptyState
                  icon={<User className="w-12 h-12" />}
                  title={selectedTags.length > 0 ? "No creators found with selected tags" : "No creators found"}
                  description={
                    selectedTags.length > 0
                      ? "Try removing some tags or browse all creators."
                      : "There are no creators with public profiles yet."
                  }
                />
                {selectedTags.length > 0 && (
                  <div className="mt-4 flex justify-center">
                    <Button onClick={clearAllTags} variant="outline">
                      Show All Creators
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Page>
  );
}