import { useForm } from "react-hook-form";
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { User, Save, ArrowLeft, Upload, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { user } from "~/db/schema";
import { uploadImage } from "~/utils/cloudinary";

interface EditProfileFormData {
  name: string;
  bio: string;
}

interface EditProfileFormProps {
  user: typeof user.$inferSelect;
  onSubmit: (data: { name: string; bio?: string; image?: string }) => Promise<void>;
}

export function EditProfileForm({ user, onSubmit }: EditProfileFormProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        <div className="flex items-center gap-4">
          <Link to="/profile/$id" params={{ id: user.id }}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <CardTitle>Edit Profile</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <Avatar className="w-20 h-20">
            <AvatarImage 
              src={imagePreview || user.image || undefined} 
              alt={user.name} 
            />
            <AvatarFallback className="text-xl bg-primary/10">
              <User className="w-10 h-10" />
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
            <Link to="/profile/$id" params={{ id: user.id }}>
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