import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Video,
  Upload as UploadIcon,
  Sparkles,
  Film,
  Globe,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { createVideoFn } from "~/fn/videos";
import { getErrorMessage } from "~/utils/error";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { isCloudinaryConfigured } from "~/utils/cloudinary";
import { publicEnv } from "~/config/publicEnv";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/upload")({
  component: Upload,
});

// Schema Definition Following Form Patterns - Based on Video Table Schema
const uploadSchema = z.object({
  title: z
    .string()
    .min(3, "Video title must be at least 3 characters")
    .max(100, "Video title must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  cloudinaryId: z.string().min(1, "Please upload a video first"),
  thumbnailUrl: z.string().optional(),
  duration: z.number().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

declare global {
  interface Window {
    cloudinary: any;
  }
}

function Upload() {
  const navigate = useNavigate();
  const [uploadWidget, setUploadWidget] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoInfo, setVideoInfo] = useState<any>(null);

  // Form Setup with Zod Resolver Following Form Patterns
  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      description: "",
      cloudinaryId: "",
    },
  });

  const createVideoMutation = useMutation({
    mutationFn: (data: UploadFormData) => createVideoFn({ data }),
    onSuccess: (video) => {
      toast.success("Video created successfully!", {
        description: "Your video has been saved and is ready for viewing.",
      });
      form.reset();
      setVideoInfo(null);
      navigate({ to: `/video/${video.id}` });
    },
    onError: (error) => {
      toast.error("Failed to create video", {
        description: getErrorMessage(error),
      });
    },
  });

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Shared upload widget configuration
  const getWidgetConfig = () => ({
    cloudName: publicEnv.cloudName,
    uploadPreset: publicEnv.uploadPreset,
    sources: ["local"],
    resourceType: "video",
    multiple: false,
    maxFiles: 1,
    thumbnailTransformation: {
      width: 640,
      height: 360,
      quality: 100,
      crop: "fill",
      background: "black",
      fetch_format: "jpg",
    },
    clientAllowedFormats: ["video"],
    maxFileSize: 500000000, // 500MB
    showAdvancedOptions: false,
    showCompletedButton: true,
    showUploadMoreButton: false,
    styles: {
      palette: {
        window: "#1a1a1a",
        windowBorder: "#333333",
        tabIcon: "#ffffff",
        menuIcons: "#ffffff",
        textDark: "#ffffff",
        textLight: "#cccccc",
        link: "#0078ff",
        action: "#0078ff",
        inactiveTabIcon: "#888888",
        error: "#ff4444",
        inProgress: "#0078ff",
        complete: "#00cc00",
        sourceBg: "#262626",
      },
      fonts: {
        default: null,
        '"Fira Sans", sans-serif': {
          url: "https://fonts.googleapis.com/css?family=Fira+Sans",
          active: true,
        },
      },
    },
  });

  // Shared upload widget callback
  const getWidgetCallback = (includeProgressTracking = true) => (error: any, result: any) => {
    if (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed", {
        description: "There was an error uploading your video.",
      });
      if (includeProgressTracking) {
        setIsUploading(false);
        setUploadProgress(0);
      }
      return;
    }

    if (includeProgressTracking && result.event === "upload-added") {
      setIsUploading(true);
      setUploadProgress(0);
    }

    if (includeProgressTracking && result.event === "progress") {
      setUploadProgress(
        Math.round(
          (result.info.progress.loaded / result.info.progress.total) * 100
        )
      );
    }

    if (result.event === "success") {
      const info = result.info;
      setVideoInfo(info);

      // Set form values with Cloudinary data
      form.setValue("cloudinaryId", info.public_id);
      form.setValue("duration", info.duration || 0);
      form.setValue(
        "thumbnailUrl",
        info.thumbnail_url || info.secure_url.replace(/\.[^/.]+$/, ".jpg")
      );

      if (includeProgressTracking) {
        setIsUploading(false);
        setUploadProgress(100);
      }

      toast.success("Video uploaded!", {
        description: includeProgressTracking 
          ? "Please fill in the title and description." 
          : undefined,
      });
    }

    if (includeProgressTracking && result.event === "close") {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Initialize Cloudinary Upload Widget
  useEffect(() => {
    const loadCloudinaryScript = () => {
      const script = document.createElement("script");
      script.src = "https://upload-widget.cloudinary.com/global/all.js";
      script.async = true;
      script.onload = () => {
        if (window.cloudinary && isCloudinaryConfigured()) {
          const widget = window.cloudinary.createUploadWidget(
            getWidgetConfig(),
            getWidgetCallback(true)
          );
          setUploadWidget(widget);
        }
      };
      document.body.appendChild(script);
    };

    if (!window.cloudinary) {
      loadCloudinaryScript();
    } else if (isCloudinaryConfigured()) {
      const widget = window.cloudinary.createUploadWidget(
        getWidgetConfig(),
        getWidgetCallback(false)
      );
      setUploadWidget(widget);
    }

    return () => {
      if (uploadWidget) {
        uploadWidget.destroy();
      }
    };
  }, []);

  const handleOpenWidget = () => {
    if (uploadWidget) {
      uploadWidget.open();
    } else {
      toast.error("Upload widget not initialized", {
        description: "Please check your Cloudinary configuration.",
      });
    }
  };

  // Submit Handler Following Form Patterns
  const onSubmit = (data: UploadFormData) => {
    if (!data.cloudinaryId) {
      toast.error("Please upload a video first");
      return;
    }
    createVideoMutation.mutate(data);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute top-20 right-20 h-96 w-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 h-96 w-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
              <UploadIcon className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Upload Your Video
            </h1>
            <p className="text-lg text-muted-foreground">
              Share your content with millions of viewers worldwide
            </p>
          </div>

          {/* Main Upload Card */}
          <Card>
            <CardHeader className="pb-8">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-2xl">Video Details</CardTitle>
              </div>
              <CardDescription className="text-base">
                Fill in the information below to upload your video to the
                platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium flex items-center gap-2">
                            <Video className="h-4 w-4 text-primary" />
                            Video Title *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter a compelling title for your video"
                              className="h-11 text-base border-border/50 bg-background/50 focus:bg-background transition-colors"
                              autoComplete="off"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            A good title helps viewers find and understand your
                            content.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">
                            Description
                          </FormLabel>
                          <FormControl>
                            <textarea
                              className="flex min-h-[120px] w-full rounded-md border border-border/50 bg-background/50 focus:bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-colors"
                              placeholder="Tell viewers what your video is about, what they'll learn, or what makes it interesting..."
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Help viewers understand what your video is about.{" "}
                            {field.value?.length || 0}/500 characters.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Video Upload Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Film className="h-4 w-4 text-primary" />
                        <label className="text-base font-medium">
                          Video File *
                        </label>
                      </div>

                      {videoInfo ? (
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Video uploaded successfully
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleOpenWidget}
                            >
                              Upload Different Video
                            </Button>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Filename: {videoInfo.original_filename}</p>
                            <p>
                              Duration:{" "}
                              {videoInfo.duration
                                ? formatDuration(videoInfo.duration)
                                : "N/A"}
                            </p>
                            <p>
                              Size: {(videoInfo.bytes / 1024 / 1024).toFixed(2)}{" "}
                              MB
                            </p>
                            <p>Format: {videoInfo.format}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-32 border-dashed border-2"
                            onClick={handleOpenWidget}
                            disabled={isUploading || !isCloudinaryConfigured()}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <UploadIcon className="h-8 w-8 text-muted-foreground" />
                              <div className="text-center">
                                <p className="text-sm font-medium">
                                  {!isCloudinaryConfigured()
                                    ? "Cloudinary not configured"
                                    : "Click to upload video"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  MP4, WebM, MOV, AVI (max 500MB)
                                </p>
                              </div>
                            </div>
                          </Button>

                          {isUploading && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Uploading...</span>
                                <span>{uploadProgress}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {!videoInfo && (
                        <p className="text-sm text-muted-foreground">
                          Upload your video to continue. The video will be
                          automatically processed and optimized.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-border/50">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-11 text-base font-medium border-border/50"
                      onClick={() => navigate({ to: "/" })}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-11 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
                      disabled={createVideoMutation.isPending}
                    >
                      {createVideoMutation.isPending && (
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      )}
                      {createVideoMutation.isPending ? (
                        "Creating Video..."
                      ) : (
                        <>
                          <UploadIcon className="h-4 w-4 mr-2" />
                          Upload Video
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <Video className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Supported Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  MP4, WebM, MOV, and other common video formats
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <Globe className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Global Reach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your content will be available to viewers worldwide
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <Sparkles className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Get Discovered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our algorithm helps your content reach the right audience
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
