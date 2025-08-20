import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Upload as UploadIcon, Video } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { createVideoFn } from "~/fn/videos";
import { getErrorMessage } from "~/utils/error";
import { Page } from "~/components/Page";
import { PageTitle } from "~/components/PageTitle";
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
  videoUrl: z
    .url("Please enter a valid video URL")
    .min(1, "Video URL is required"),
  thumbnailUrl: z
    .url("Please enter a valid thumbnail URL")
    .optional()
    .or(z.literal("")),
  status: z
    .enum(["processing", "published", "private", "unlisted"])
    .default("processing"),
  duration: z
    .number()
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1 second")
    .optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

function Upload() {
  const navigate = useNavigate();

  // Form Setup with Zod Resolver Following Form Patterns
  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
      thumbnailUrl: "",
      status: "processing",
      duration: undefined,
    },
  });

  const createVideoMutation = useMutation({
    mutationFn: (data: UploadFormData) => createVideoFn({ data }),
    onSuccess: (video) => {
      toast.success("Video created successfully!", {
        description: "Your video has been saved and is ready for publishing.",
      });
      form.reset();
      navigate({ to: `/video/${video.id}` });
    },
    onError: (error) => {
      toast.error("Failed to create video", {
        description: getErrorMessage(error),
      });
    },
  });

  const formatDuration = (seconds: string) => {
    const num = parseInt(seconds);
    if (isNaN(num)) return "";
    const minutes = Math.floor(num / 60);
    const remainingSeconds = num % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Submit Handler Following Form Patterns
  const onSubmit = (data: UploadFormData) => {
    createVideoMutation.mutate(data);
  };

  return (
    <Page>
      <div className="space-y-8">
        <PageTitle
          title="Upload Video"
          description="Share your content with the community"
          center
        />

        <div className="max-w-2xl mx-auto">
          {/* Enhanced Form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-8 space-y-6"
            >
              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Video Title *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter a compelling title for your video"
                          className="h-11 text-base"
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
                          className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
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

                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Video URL *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/video.mp4"
                          className="h-11 text-base"
                          type="url"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Direct link to your video file (MP4, WebM, etc.).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="thumbnailUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Thumbnail URL
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/thumbnail.jpg"
                          className="h-11 text-base"
                          type="url"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional thumbnail image for your video.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          Video Status *
                        </FormLabel>
                        <FormControl>
                          <select
                            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="processing">Processing</option>
                            <option value="published">Published</option>
                            <option value="private">Private</option>
                            <option value="unlisted">Unlisted</option>
                          </select>
                        </FormControl>
                        <FormDescription>
                          Control who can see your video.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          Duration (seconds)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="300"
                            className="h-11 text-base"
                            type="number"
                            min="1"
                            onChange={(e) => {
                              const val = e.target.value;
                              onChange(val === "" ? undefined : parseInt(val));
                            }}
                            value={value || ""}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {value
                            ? `Duration: ${formatDuration(value.toString())}`
                            : "Video length in seconds (optional)."}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-border">
                {/* Submit Buttons - Keep Enabled Following Updated Form Patterns */}
                <Button
                  type="submit"
                  className="flex-1 h-11 text-base font-medium"
                  disabled={createVideoMutation.isPending}
                >
                  {createVideoMutation.isPending && (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  )}
                  {createVideoMutation.isPending ? (
                    "Creating Video..."
                  ) : (
                    <>
                      <Video className="h-4 w-4 mr-2" />
                      Create Video
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Page>
  );
}
