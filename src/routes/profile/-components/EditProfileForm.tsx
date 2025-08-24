import { useForm } from "react-hook-form";
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { User, Save, Upload, Loader2, X, Plus, Tag } from "lucide-react";
import { user } from "~/db/schema";
import { uploadImage } from "~/utils/cloudinary";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserTagsFn, addUserTagFn, removeUserTagFn } from "~/fn/tags";
import { toast } from "sonner";
import { getAvatarUrl, getInitials } from "~/utils/avatar";

interface EditProfileFormData {
  name: string;
  bio: string;
}

interface EditProfileFormProps {
  user: typeof user.$inferSelect;
  onSubmit: (data: { name: string; bio?: string; image?: string }) => Promise<void>;
  onCancel?: () => void;
}

export function EditProfileForm({ user, onSubmit, onCancel }: EditProfileFormProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagDescription, setNewTagDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const avatarUrl = getAvatarUrl(user.image, user.name, user.id);
  const initials = getInitials(user.name);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileFormData>({
    defaultValues: {
      name: user.name,
      bio: user.bio || "",
    },
  });

  const { data: userTags = [], isLoading: isLoadingTags } = useQuery({
    queryKey: ["userTags", user.id],
    queryFn: () => getUserTagsFn({ data: { userId: user.id } }),
  });

  const addTagMutation = useMutation({
    mutationFn: (data: { tagName: string; description?: string }) =>
      addUserTagFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTags", user.id] });
      setNewTagName("");
      setNewTagDescription("");
      toast.success("Tag added successfully!");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to add tag");
    },
  });

  const removeTagMutation = useMutation({
    mutationFn: (tagId: string) => removeUserTagFn({ data: { tagId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTags", user.id] });
      toast.success("Tag removed successfully!");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to remove tag");
    },
  });

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    addTagMutation.mutate({
      tagName: newTagName.trim(),
      description: newTagDescription.trim() || undefined,
    });
  };

  const handleRemoveTag = (tagId: string) => {
    removeTagMutation.mutate(tagId);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Please select an image smaller than 5MB.');
        return;
      }

      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onFormSubmit = async (data: EditProfileFormData) => {
    let imageUrl = user.image;

    // Upload image first if a new one was selected
    if (selectedImage) {
      setIsUploadingImage(true);
      try {
        const uploadResult = await uploadImage(selectedImage);
        imageUrl = uploadResult.secure_url;
      } catch (error) {
        console.error('Image upload failed:', error);
        alert('Failed to upload image. Please try again.');
        setIsUploadingImage(false);
        return;
      }
      setIsUploadingImage(false);
    }

    await onSubmit({
      name: data.name,
      bio: data.bio.trim() || undefined,
      image: imageUrl || undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <Avatar className="w-20 h-20">
            <AvatarImage 
              src={imagePreview || avatarUrl} 
              alt={user.name} 
            />
            <AvatarFallback className="text-xl bg-primary/10">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium">Profile Picture</p>
              <p className="text-xs text-muted-foreground">
                Click the button to upload a new profile picture (max 5MB)
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
              >
                <Upload className="w-4 h-4 mr-2" />
                {selectedImage ? 'Change Image' : 'Upload Image'}
              </Button>
              {selectedImage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              {...register("name", {
                required: "Display name is required",
                minLength: {
                  value: 1,
                  message: "Display name cannot be empty",
                },
                maxLength: {
                  value: 50,
                  message: "Display name must be less than 50 characters",
                },
              })}
              placeholder="Enter your display name"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biography</Label>
            <Textarea
              id="bio"
              {...register("bio", {
                maxLength: {
                  value: 500,
                  message: "Bio must be less than 500 characters",
                },
              })}
              placeholder="Tell us about yourself..."
              rows={4}
              className="resize-none"
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Optional. Maximum 500 characters.
            </p>
          </div>

          {/* Tags Section */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <Label className="text-base font-medium">Tags</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Tags help other users discover your content and connect with creators who share similar interests.
            </p>

            {/* Display existing tags */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Current Tags</Label>
              {isLoadingTags ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading tags...</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {userTags.length > 0 ? (
                    userTags.map((userTag) => (
                      <Badge key={userTag.id} variant="secondary" className="px-3 py-1">
                        <span>{userTag.tag.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(userTag.tagId)}
                          disabled={removeTagMutation.isPending}
                          className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No tags added yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* Add new tag form */}
            <div className="space-y-4 border-t pt-4">
              <Label className="text-sm font-medium">Add New Tag</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tagName" className="text-xs">Tag Name</Label>
                  <Input
                    id="tagName"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="e.g., React, JavaScript, Web Development"
                    maxLength={50}
                    disabled={addTagMutation.isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum 50 characters. Use specific, relevant tags.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tagDescription" className="text-xs">Description (Optional)</Label>
                  <Input
                    id="tagDescription"
                    value={newTagDescription}
                    onChange={(e) => setNewTagDescription(e.target.value)}
                    placeholder="Brief description of your expertise"
                    maxLength={200}
                    disabled={addTagMutation.isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional. Maximum 200 characters.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleAddTag}
                disabled={!newTagName.trim() || addTagMutation.isPending}
                size="sm"
                variant="outline"
              >
                {addTagMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Tag
              </Button>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting || isUploadingImage}>
              {isUploadingImage ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isUploadingImage 
                ? "Uploading Image..." 
                : isSubmitting 
                ? "Saving..." 
                : "Save Changes"
              }
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}