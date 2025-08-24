import { createServerFn } from "@tanstack/react-start";
import {
  findRecentVideos,
  findPopularVideos,
  findRecentVideosWithLikes,
  findPopularVideosWithLikes,
  findVideosByTagWithLikes,
  findRelatedVideosByTags,
  searchVideosByTitle,
  createVideo,
  findVideoById,
  incrementViewCount,
  updateVideo,
  findVideoTags,
  addVideoTag,
  removeVideoTag,
  removeAllVideoTags,
} from "~/data-access/videos";
import {
  likeVideo,
  unlikeVideo,
  isVideoLikedByUser,
  getVideoLikeCount,
} from "~/data-access/video-likes";
import { z } from "zod";
import { authenticatedMiddleware } from "./middleware";
import { publicEnv } from "~/config/publicEnv";
import { findOrCreateTag, findAllTags } from "~/data-access/tags";
import { env } from "~/config/env";

export const getRecentVideosFn = createServerFn().handler(async () => {
  return await findRecentVideosWithLikes(20);
});

export const getPopularVideosFn = createServerFn().handler(async () => {
  return await findPopularVideosWithLikes(20);
});

export const getVideosByTagFn = createServerFn({
  method: "GET",
})
  .validator(z.object({ tag: z.string() }))
  .handler(async ({ data }) => {
    return await findVideosByTagWithLikes(data.tag, 20);
  });

export const createVideoFn = createServerFn({
  method: "POST",
})
  .validator(
    z.object({
      title: z.string().min(3).max(100),
      description: z.string().max(500).optional(),
      cloudinaryId: z.string().min(1),
      thumbnailUrl: z.string().optional(),
      duration: z.number().optional(),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    // Generate Cloudinary URLs from the public ID
    const videoUrl = `https://res.cloudinary.com/${publicEnv.cloudName}/video/upload/${data.cloudinaryId}`;
    const thumbnailUrl =
      data.thumbnailUrl ||
      `https://res.cloudinary.com/${publicEnv.cloudName}/video/upload/${data.cloudinaryId}.jpg`;

    const videoData = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      videoUrl,
      thumbnailUrl,
      cloudinaryId: data.cloudinaryId,
      duration: data.duration,
      status: "published" as const,
      userId: context.userId,
    };

    const newVideo = await createVideo(videoData);
    return newVideo;
  });

export const getVideoByIdFn = createServerFn({
  method: "GET",
})
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const video = await findVideoById(data.id);
    if (!video) {
      throw new Error("Video not found");
    }
    return video;
  });

export const incrementViewCountFn = createServerFn({
  method: "POST",
})
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await incrementViewCount(data.id);
    return { success: true };
  });

export const likeVideoFn = createServerFn({
  method: "POST",
})
  .validator(z.object({ videoId: z.string() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    await likeVideo(data.videoId, context.userId);
    return { success: true };
  });

export const unlikeVideoFn = createServerFn({
  method: "POST",
})
  .validator(z.object({ videoId: z.string() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    await unlikeVideo(data.videoId, context.userId);
    return { success: true };
  });

export const getVideoLikeStatusFn = createServerFn({
  method: "GET",
})
  .validator(z.object({ videoId: z.string(), userId: z.string().optional() }))
  .handler(async ({ data }) => {
    const [likeCount, isLiked] = await Promise.all([
      getVideoLikeCount(data.videoId),
      data.userId ? isVideoLikedByUser(data.videoId, data.userId) : false,
    ]);

    return { likeCount, isLiked };
  });

export const updateVideoFn = createServerFn({
  method: "POST",
})
  .validator(
    z.object({
      id: z.string(),
      title: z.string().min(3).max(100),
      description: z.string().max(500).optional(),
      tags: z.array(z.string()).optional(),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const video = await findVideoById(data.id);
    if (!video || video.userId !== context.userId) {
      throw new Error("Video not found or not authorized");
    }

    const updatedVideo = await updateVideo(data.id, {
      title: data.title,
      description: data.description,
    });

    if (data.tags) {
      await removeAllVideoTags(data.id);

      for (const tagName of data.tags) {
        if (tagName.trim()) {
          const tag = await findOrCreateTag(tagName.trim());
          await addVideoTag(data.id, tag.id);
        }
      }
    }

    return updatedVideo;
  });

export const getVideoTagsFn = createServerFn({
  method: "GET",
})
  .validator(z.object({ videoId: z.string() }))
  .handler(async ({ data }) => {
    return await findVideoTags(data.videoId);
  });

export const getRelatedVideosFn = createServerFn({
  method: "GET",
})
  .validator(
    z.object({
      videoId: z.string(),
      tagNames: z.array(z.string()),
      limit: z.number().optional().default(5),
    })
  )
  .handler(async ({ data }) => {
    return await findRelatedVideosByTags(
      data.videoId,
      data.tagNames,
      data.limit
    );
  });

export const searchTagsFn = createServerFn({
  method: "GET",
})
  .validator(
    z.object({
      query: z.string().optional().default(""),
      limit: z.number().optional().default(10),
    })
  )
  .handler(async ({ data }) => {
    const allTags = await findAllTags();

    if (!data.query) {
      return allTags.slice(0, data.limit);
    }

    const filtered = allTags.filter((tag) =>
      tag.name.toLowerCase().includes(data.query.toLowerCase())
    );

    return filtered.slice(0, data.limit);
  });

export const searchVideosByTitleFn = createServerFn({
  method: "GET",
})
  .validator(
    z.object({
      query: z.string().optional().default(""),
      sortBy: z
        .enum(["views_asc", "views_desc", "date_asc", "date_desc"])
        .optional()
        .default("date_desc"),
      limit: z.number().optional().default(20),
    })
  )
  .handler(async ({ data }) => {
    return await searchVideosByTitle(data.query, data.sortBy, data.limit);
  });

export const getVideoTranscriptFn = createServerFn({
  method: "GET",
})
  .validator(z.object({ videoId: z.string() }))
  .handler(async ({ data }) => {
    const video = await findVideoById(data.videoId);
    if (!video?.cloudinaryId) {
      throw new Error("Video not found");
    }

    try {
      // Try multiple possible transcript URLs
      const possibleUrls = [
        `https://res.cloudinary.com/${publicEnv.cloudName}/raw/upload/videos/${video.cloudinaryId}.transcript`,
        `https://res.cloudinary.com/${publicEnv.cloudName}/raw/upload/${video.cloudinaryId}.transcript`,
      ];

      let transcriptData = null;

      for (const transcriptUrl of possibleUrls) {
        try {
          console.log(`Trying transcript URL: ${transcriptUrl}`);
          const response = await fetch(transcriptUrl);

          if (response.ok) {
            transcriptData = await response.json();
            console.log(
              `Successfully fetched transcript from: ${transcriptUrl}`
            );
            break;
          } else {
            console.log(
              `Failed to fetch from ${transcriptUrl}: ${response.status} ${response.statusText}`
            );
          }
        } catch (error) {
          console.log(`Error fetching from ${transcriptUrl}:`, error);
        }
      }

      if (!transcriptData) {
        // If we have API credentials, try generating a signed URL
        if (env.apiKey && env.apiSecret) {
          try {
            const { v2: cloudinary } = await import("cloudinary");
            cloudinary.config({
              cloud_name: publicEnv.cloudName,
              api_key: env.apiKey,
              api_secret: env.apiSecret,
            });

            // Try both possible paths with signed URLs
            const signedUrls = [
              cloudinary.url(`videos/${video.cloudinaryId}.transcript`, {
                resource_type: "raw",
                sign_url: true,
                secure: true,
              }),
              cloudinary.url(`${video.cloudinaryId}.transcript`, {
                resource_type: "raw",
                sign_url: true,
                secure: true,
              }),
            ];

            for (const signedUrl of signedUrls) {
              try {
                console.log(`Trying signed URL: ${signedUrl}`);
                const response = await fetch(signedUrl);

                if (response.ok) {
                  transcriptData = await response.json();
                  console.log(
                    `Successfully fetched transcript with signed URL`
                  );
                  break;
                }
              } catch (error) {
                console.log(`Error with signed URL:`, error);
              }
            }
          } catch (error) {
            console.log("Error generating signed URLs:", error);
          }
        }

        if (!transcriptData) {
          return { transcript: null, error: "Transcript not available yet" };
        }
      }

      // Format the transcript for display
      const formattedTranscript = Array.isArray(transcriptData)
        ? transcriptData.map((segment: any) => ({
            text: segment.transcript,
          }))
        : [];

      return {
        transcript: formattedTranscript,
        error: null,
      };
    } catch (error) {
      console.error("Error fetching transcript:", error);
      return {
        transcript: null,
        error: "Failed to fetch transcript",
      };
    }
  });
