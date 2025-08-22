import { useForm } from "react-hook-form";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Save, ArrowLeft, Loader2, X, Plus, Tag, Video } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Video as VideoType } from "~/db/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getVideoTagsFn } from "~/fn/videos";
import { getAllTagsFn } from "~/fn/tags";
import { toast } from "sonner";

interface EditVideoFormData {
  title: string;
  description: string;
  tags: string[];
}

interface EditVideoFormProps {
  video: VideoType;
  onSubmit: (data: {
    title: string;
    description?: string;
    tags: string[];
  }) => Promise<void>;
}

export function EditVideoForm({ video, onSubmit }: EditVideoFormProps) {
  const [newTag, setNewTag] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditVideoFormData>({
    defaultValues: {
      title: video.title,
      description: video.description || "",
      tags: [],
    },
  });

  const { data: videoTags = [], isLoading: isLoadingVideoTags } = useQuery({
    queryKey: ["videoTags", video.id],
    queryFn: () => getVideoTagsFn({ data: { videoId: video.id } }),
  });

  // Set selected tags when videoTags data changes
  React.useEffect(() => {
    if (videoTags.length > 0) {
      setSelectedTags(videoTags.map((vt) => vt.tag.name));
    }
  }, [videoTags]);

  const { data: allTags = [], isLoading: isLoadingAllTags } = useQuery({
    queryKey: ["allTags"],
    queryFn: () => getAllTagsFn(),
  });

  const handleAddTag = (tagName: string) => {
    const trimmedTag = tagName.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagName: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagName));
  };

  const onFormSubmit = async (data: EditVideoFormData) => {
    await onSubmit({
      title: data.title,
      description: data.description.trim() || undefined,
      tags: selectedTags,
    });
  };

  const suggestionTags = allTags
    .filter(
      (tag) =>
        !selectedTags.includes(tag.name) &&
        tag.name.toLowerCase().includes(newTag.toLowerCase())
    )
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Video className="w-5 h-5" />
          <CardTitle>Edit Video</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title", {
                required: "Title is required",
                minLength: {
                  value: 3,
                  message: "Title must be at least 3 characters long",
                },
                maxLength: {
                  value: 100,
                  message: "Title must be less than 100 characters",
                },
              })}
              placeholder="Enter video title"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description", {
                maxLength: {
                  value: 500,
                  message: "Description must be less than 500 characters",
                },
              })}
              placeholder="Describe your video..."
              rows={4}
              className="resize-none"
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Optional. Maximum 500 characters.
            </p>
          </div>

          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <Label className="text-base font-medium">Tags</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Tags help viewers discover your content. Add relevant keywords
              that describe your video.
            </p>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Current Tags</Label>
              {isLoadingVideoTags ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Loading tags...
                  </span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.length > 0 ? (
                    selectedTags.map((tagName) => (
                      <Badge
                        key={tagName}
                        variant="secondary"
                        className="px-3 py-1"
                      >
                        <span>{tagName}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tagName)}
                          className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No tags added yet.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4 border-t pt-4">
              <Label className="text-sm font-medium">Add Tags</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Type a tag name..."
                    maxLength={50}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag(newTag);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => handleAddTag(newTag)}
                    disabled={!newTag.trim()}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {newTag && suggestionTags.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Suggestions:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestionTags.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleAddTag(tag.name)}
                          className="text-xs px-2 py-1 bg-muted rounded hover:bg-muted/80 transition-colors"
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Press Enter or click + to add a tag. Maximum 50 characters per
                  tag.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
            <Link to="/video/$id" params={{ id: video.id }}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
